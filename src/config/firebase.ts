import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { cert } from "firebase-admin/app";
import dotenv from "dotenv";

dotenv.config();

const app = initializeApp({
  credential: cert(require("../../serviceAccountKey.json")),
});

const db = getFirestore(app);
const messaging = getMessaging(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, messaging, auth, storage };
