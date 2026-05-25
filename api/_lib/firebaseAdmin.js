import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function readServiceAccountFromEnv() {
  const asJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON

  if (asJson) {
    const parsed = JSON.parse(asJson)

    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: typeof parsed.private_key === 'string' ? parsed.private_key.replace(/\\n/g, '\n') : '',
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || ''
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || ''
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')

  return {
    projectId,
    clientEmail,
    privateKey,
  }
}

function ensureFirebaseAdmin() {
  const existingApps = getApps()

  if (existingApps.length > 0) {
    return existingApps[0]
  }

  const { projectId, clientEmail, privateKey } = readServiceAccountFromEnv()

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin não configurado. Defina FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY (ou FIREBASE_SERVICE_ACCOUNT_JSON).')
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    projectId,
  })
}

export function getFirebaseAdminAuth() {
  const app = ensureFirebaseAdmin()
  return getAuth(app)
}

export function getFirebaseAdminDb() {
  const app = ensureFirebaseAdmin()
  return getFirestore(app)
}
