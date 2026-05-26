import { initializeApp } from 'firebase/app'
import { browserSessionPersistence, getAuth, GoogleAuthProvider, setPersistence } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
}

const requiredConfigValues = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
]

export const isFirebaseConfigured = requiredConfigValues.every((value) => typeof value === 'string' && value.trim().length > 0)

const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null
export const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({
  prompt: 'select_account',
})

if (firebaseAuth) {
  void setPersistence(firebaseAuth, browserSessionPersistence)
}
