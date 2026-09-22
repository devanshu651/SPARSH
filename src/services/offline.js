// Milestone cache - sessionStorage only (transient, survives a refresh but is
// cleared when the tab closes). The cached data is the generic screening
// instrument, not patient data.
const milestoneKey = (childId) => `sparsh:milestones:${childId}`
export const cacheMilestones = (childId, data) => sessionStorage.setItem(milestoneKey(childId), JSON.stringify(data))
export const getCachedMilestones = (childId) => { try { return JSON.parse(sessionStorage.getItem(milestoneKey(childId)) || 'null') } catch { return null } }

// Screening draft - sessionStorage only. Contains screening answers, which are
// transient and must not live in persistent storage.
export const saveDraft = (draft) => sessionStorage.setItem('sparsh:screening-draft', JSON.stringify(draft))
export const loadDraft = () => { try { return JSON.parse(sessionStorage.getItem('sparsh:screening-draft') || 'null') } catch { return null } }
export const clearDraft = () => sessionStorage.removeItem('sparsh:screening-draft')

// ---------------------------------------------------------------------------
// Offline screening queue - IndexedDB backed.
// ---------------------------------------------------------------------------
const DB_NAME = 'sparsh-offline'
const DB_VERSION = 2
const STORE_NAME = 'screening_queue'
const SUBMISSION_INDEX = 'client_submission_id'

const MAX_RETRIES = 5
const BASE_DELAY_MS = 1000
const MAX_DELAY_MS = 30000

let _dbInstance = null
let _opening = null

function openQueueDb() {
  if (_dbInstance) return Promise.resolve(_dbInstance)
  if (_opening) return _opening
  _opening = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
req.onupgradeneeded = () => {
      const db = req.result
      const tx = req.transaction
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        store.createIndex(SUBMISSION_INDEX, SUBMISSION_INDEX, { unique: true })
        return
      }
      // Migration path (v1 -> v2): make the client_submission_id index unique.
      const store = tx.objectStore(STORE_NAME)
      if (store.indexNames.contains(SUBMISSION_INDEX)) {
        store.deleteIndex(SUBMISSION_INDEX)
      }
      // Deduplicate by client_submission_id using a cursor, keeping the oldest
      // record (smallest id) and deleting later duplicates. All operations stay
      // inside the versionchange transaction via request callbacks.
      const seen = new Set()
      const cursorReq = store.openCursor()
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result
        if (!cursor) {
          store.createIndex(SUBMISSION_INDEX, SUBMISSION_INDEX, { unique: true })
          return
        }
        const key = cursor.value.client_submission_id
        if (key !== undefined && key !== null && seen.has(key)) {
          cursor.delete()
        } else if (key !== undefined && key !== null) {
          seen.add(key)
        }
        cursor.continue()
      }
    }
    req.onsuccess = () => { _dbInstance = req.result; _opening = null; resolve(_dbInstance) }
    req.onerror = () => { _opening = null; reject(req.error) }
    req.onversionchange = () => { req.result.close() }
  })
  return _opening
}

function promisify(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function enqueueScreening(payload) {
  if (!payload || !payload.client_submission_id) {
    throw new Error('client_submission_id is required to queue a screening')
  }
  const db = await openQueueDb()
  // Deduplicate by client_submission_id before adding.
  const checkTx = db.transaction(STORE_NAME, 'readonly')
  const existing = await promisify(checkTx.objectStore(STORE_NAME).index(SUBMISSION_INDEX).get(payload.client_submission_id))
  if (existing) return
  const tx = db.transaction(STORE_NAME, 'readwrite')
  try {
    tx.objectStore(STORE_NAME).add({
      client_submission_id: payload.client_submission_id,
      payload,
      attempts: 0,
      lastAttemptedAt: null,
      nextRetryAt: null,
      createdAt: new Date().toISOString(),
    })
    await txDone(tx)
  } catch (e) {
    // A ConstraintError means the client_submission_id is already queued.
    // Treat the item as already queued rather than surfacing an error.
    if (e && e.name === 'ConstraintError') return
    throw e
  }
}

export async function queuedScreenings() {
  const db = await openQueueDb()
  return promisify(db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll())
}

async function removeQueuedItem(id) {
  const db = await openQueueDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  tx.objectStore(STORE_NAME).delete(id)
  await txDone(tx)
}

async function updateQueuedItem(item) {
  const db = await openQueueDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  tx.objectStore(STORE_NAME).put(item)
  await txDone(tx)
}

function computeDelay(attempts) {
  // Exponential backoff with a hard cap.
  return Math.min(BASE_DELAY_MS * Math.pow(2, attempts), MAX_DELAY_MS)
}

// Sync the offline queue. Each queued item is submitted once per call; failures
// are retried with bounded backoff up to MAX_RETRIES. A 409 duplicate response
// is treated as already processed and the item is removed.
export async function syncQueuedScreenings(submitFn) {
  if (typeof indexedDB === 'undefined') return 0
  let synced = 0
  const items = await queuedScreenings()
  for (const item of items) {
    if (item.attempts >= MAX_RETRIES) continue
    if (item.nextRetryAt && Date.now() < item.nextRetryAt) continue
    try {
      await submitFn(item.payload)
      await removeQueuedItem(item.id)
      synced++
    } catch (e) {
      const status = e && e.status
      if (status === 409) {
        // Duplicate submission already processed on the server.
        await removeQueuedItem(item.id)
        synced++
      } else {
        const attempts = item.attempts + 1
        const update = { ...item, attempts, lastAttemptedAt: new Date().toISOString() }
        if (attempts >= MAX_RETRIES) {
          // Max retries reached - stop retrying, leave the item in place.
          await updateQueuedItem(update)
        } else {
          update.nextRetryAt = Date.now() + computeDelay(attempts)
          await updateQueuedItem(update)
        }
      }
    }
  }
  return synced
}
