import * as admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(require("../../serviceAccountKey.json")),
});

const db = admin.firestore();
const messaging = admin.messaging();
const auth = admin.auth();
const storage = admin.storage();

export { admin, db, messaging, auth, storage };
