const KEY_PREFIX = 'sparsh:privacy-acknowledgement:v1:'

export function hasPrivacyAcknowledgement(uid) {
  if (!uid || typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(`${KEY_PREFIX}${uid}`) === 'accepted'
  } catch {
    return false
  }
}

export function savePrivacyAcknowledgement(uid) {
  if (!uid || typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(`${KEY_PREFIX}${uid}`, 'accepted')
    return true
  } catch {
    return false
  }
}
