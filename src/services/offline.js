const QUEUE_KEY = 'sparsh:screening-queue'
const milestoneKey = (childId) => `sparsh:milestones:${childId}`
export const cacheMilestones = (childId, data) => localStorage.setItem(milestoneKey(childId), JSON.stringify(data))
export const getCachedMilestones = (childId) => { try { return JSON.parse(localStorage.getItem(milestoneKey(childId)) || 'null') } catch { return null } }
export const saveDraft = (draft) => localStorage.setItem('sparsh:screening-draft', JSON.stringify(draft))
export const loadDraft = () => { try { return JSON.parse(localStorage.getItem('sparsh:screening-draft') || 'null') } catch { return null } }
export const clearDraft = () => localStorage.removeItem('sparsh:screening-draft')
export const enqueueScreening = (payload) => { const items = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); localStorage.setItem(QUEUE_KEY, JSON.stringify([...items, payload])) }
export const queuedScreenings = () => { try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') } catch { return [] } }
export const setQueue = (items) => localStorage.setItem(QUEUE_KEY, JSON.stringify(items))
