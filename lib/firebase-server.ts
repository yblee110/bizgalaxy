import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const PROJECT_ID = 'biz-galaxy-483410';

// Initialize Admin SDK (bypasses security rules)
let adminDb: Firestore | null = null;

export function getServerDb(): Firestore {
  if (adminDb) {
    return adminDb;
  }

  const apps = getApps();
  let app;

  if (apps.length > 0) {
    app = apps[0];
    console.log('[Firebase Admin] Using existing app, project:', app.options.projectId);
  } else {
    // For asia-northeast1 region, we need to initialize properly
    // The database URL helps the SDK locate the correct Firestore instance
    console.log('[Firebase Admin] Initializing new app for project:', PROJECT_ID);

    const config: any = {
      projectId: PROJECT_ID,
      databaseURL: `https://${PROJECT_ID}.firestore.googleapis.com`,
    };

    // On Cloud Run, service account credentials are automatically available
    // Check if GOOGLE_APPLICATION_CREDENTIALS is set (not needed on Cloud Run)
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (credPath) {
      console.log('[Firebase Admin] Using service account from:', credPath);
    } else {
      console.log('[Firebase Admin] Using default credentials (Cloud Run)');
    }

    app = initializeApp(config, 'server');
    console.log('[Firebase Admin] App initialized successfully');
  }

  // Initialize Firestore with the project ID
  // For regional databases, Firestore automatically handles the routing
  adminDb = getFirestore(app);
  console.log('[Firebase Admin] Firestore instance obtained');
  return adminDb;
}
