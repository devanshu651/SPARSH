import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { firebaseAuth, firebaseConfigError } from '../lib/firebase'

const unavailable = () => { throw new Error(firebaseConfigError || 'Firebase authentication is unavailable.') }
export const authService = {
  signInWithEmailPassword(email, password) { return firebaseAuth ? signInWithEmailAndPassword(firebaseAuth, email.trim(), password) : unavailable() },
  signOut() { return firebaseAuth ? firebaseSignOut(firebaseAuth) : Promise.resolve() },
  observeAuthState(callback) { if (!firebaseAuth) { callback(null); return () => {} } return onAuthStateChanged(firebaseAuth, callback) },
  getCurrentUser() { return firebaseAuth?.currentUser || null },
}
export function readableAuthError(error) { if (firebaseConfigError) return firebaseConfigError; const messages={'auth/invalid-credential':'Incorrect mobile number or password.','auth/invalid-email':'Enter a valid account.','auth/too-many-requests':'Too many attempts. Please try again later.','auth/network-request-failed':'Network error. Check your connection and try again.'}; return messages[error?.code] || error?.message || 'Unable to sign in. Please try again.' }