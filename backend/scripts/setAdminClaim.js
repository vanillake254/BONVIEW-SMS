require('dotenv').config();

const admin = require('firebase-admin');

async function main() {
  const email = process.argv[2];
  if (!email) {
    // eslint-disable-next-line no-console
    console.error('Usage: node scripts/setAdminClaim.js <admin-email>');
    process.exit(1);
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!serviceAccountJson) {
    // eslint-disable-next-line no-console
    console.error('FIREBASE_SERVICE_ACCOUNT_JSON must be set for this script.');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
    projectId,
  });

  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { admin: true });

  // eslint-disable-next-line no-console
  console.log(`Set admin=true for ${email} (uid: ${user.uid})`);

  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
