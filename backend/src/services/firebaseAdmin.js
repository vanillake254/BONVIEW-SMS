const admin = require('firebase-admin');

function initFirebaseAdmin() {
  if (admin.apps.length > 0) return admin;

  const projectId = process.env.FIREBASE_PROJECT_ID;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const credentials = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      projectId: projectId || credentials.project_id,
    });
    return admin;
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  });
  return admin;
}

function firestore() {
  return admin.firestore();
}

module.exports = {
  initFirebaseAdmin,
  firestore,
};
