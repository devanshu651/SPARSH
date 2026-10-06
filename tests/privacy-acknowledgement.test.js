import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { hasPrivacyAcknowledgement, savePrivacyAcknowledgement } from '../src/services/acknowledgement.js'
import notice from '../src/locales/privacyNotice.json' with { type: 'json' }

const values = new Map()
globalThis.window = { localStorage: {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
} }

test('new authenticated user must acknowledge; saved acknowledgement persists for that user', () => {
  assert.equal(hasPrivacyAcknowledgement('uid-one'), false)
  assert.equal(savePrivacyAcknowledgement('uid-one'), true)
  assert.equal(hasPrivacyAcknowledgement('uid-one'), true)
})

test('acknowledgement for one account does not transfer to another account', () => {
  assert.equal(hasPrivacyAcknowledgement('uid-two'), false)
})

test('privacy notice contains English, Hindi, and Marathi sections and acknowledgement text', () => {
  for (const language of ['en', 'hi', 'mr']) {
    assert.equal(notice[language].sections.length, 6)
    assert.ok(notice[language].acknowledgement.length > 20)
    assert.ok(notice[language].sections.every(({ title, body }) => title && body))
  }
})

test('notice gates the authenticated worker route and disables Continue until checked', async () => {
  const [app, screen] = await Promise.all([
    readFile(new URL('../src/App.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/screens/PrivacyNoticeScreen.jsx', import.meta.url), 'utf8'),
  ])
  assert.match(app, /currentWorker\.role !== 'admin' && userUid && !acknowledged/)
  assert.match(app, /<PrivacyNoticeScreen onContinue=/)
  assert.match(screen, /checked=\{checked\}/)
  assert.match(screen, /disabled=\{!checked\}/)
})
