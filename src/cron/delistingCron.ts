import cron from "node-cron";
import { db } from "../config/firebase";
import { sendNotificationToAgent } from "../services/notificationService";
import { saveNotification } from "../services/notificationStorageService";

export const startDelistingCron = () => {
  cron.schedule("30 6 * * *", async () => {
    try {
      const collectionRef = db.collection("acnQCInventories");
      const currentUnixTime = Math.floor(Date.now() / 1000);
      const batchSize = 500;
      let documentsProcessed = 0;
      let lastDocument: FirebaseFirestore.QueryDocumentSnapshot | null = null;

      while (true) {
        let query = collectionRef.orderBy("__name__").limit(batchSize);
        if (lastDocument) query = query.startAfter(lastDocument);

        const snapshot = await query.get();
        if (snapshot.empty) break;

        for (const doc of snapshot.docs) {
          const data = doc.data();
          const {
            dateOfStatusLastChecked,
            status,
            cpId,
            nameOfTheProperty,
            propertyId,
          } = data;

          if (dateOfStatusLastChecked && status === "Available") {
            const ageOfStatus = Math.floor(
              (currentUnixTime - dateOfStatusLastChecked) / (60 * 60 * 24)
            );

            let title = "";
            let body = "";
            let cta = ["Make Available", "Sold"];

            if (ageOfStatus === 12) {
              title = `${nameOfTheProperty} delists in 3 days`;
              body = `Your listing for ${propertyId} (${nameOfTheProperty}) will go hidden in 3 days unless you update its status.`;
            } else if (ageOfStatus === 13) {
              title = `${nameOfTheProperty} delists in 2 days`;
              body = `Don't lose visibility! Update ${propertyId} (${nameOfTheProperty}) within 48 hours, or it will be hidden.`;
            } else if (ageOfStatus === 14) {
              title = `${nameOfTheProperty} delists tomorrow`;
              body = `Last chance! Update ${propertyId} (${nameOfTheProperty}) now, or it will vanish from ACN.`;
            } else if (ageOfStatus === 15) {
              title = `Listing Hidden`;
              body = `${nameOfTheProperty} is now hidden due to no status update. Contact your KAM to revive.`;
              cta = ["Call KAM", "Dashboard"];
            } else {
              continue;
            }

            await saveNotification({
              title: ageOfStatus === 15 ? `Listing Delisted!` : title,
              body,
              cpId: cpId,
              cta,
              type: ageOfStatus === 15 ? "delisted_notification" : "delisting_notification",
              meta: {
                propertyId,
                nameOfTheProperty,
                additionalData: {
                  propertyId,
                },
              },
            });

            await sendNotificationToAgent(cpId, title, body, {
              meta: {
                propertyId,
                nameOfTheProperty,
                additionalData: {
                  propertyId,
                },
              },
              type: ageOfStatus === 15 ? "delisted_notification" : "delisting_notification",
              propertyId,
            });
          }

          documentsProcessed++;
        }

        lastDocument = snapshot.docs[snapshot.docs.length - 1];
      }
    } catch (error) {
      console.log(error)
    }
  });
};
