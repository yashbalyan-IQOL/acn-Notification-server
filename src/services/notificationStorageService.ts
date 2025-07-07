import { db } from "../config/firebase";
import { FieldValue } from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid";
import { SaveNotificationInput } from "../types/inAppNotification";

// Helper function to get current Unix timestamp
const getUnixTimestamp = () => Math.floor(Date.now() / 1000);

const saveNotification = async ({
  body,
  cpId,
  cta,
  image = "acn_logo",
  title,
  type,
  ...additionalData
}: SaveNotificationInput) => {
  try {
    // Base notification structure
    const baseNotification = {
      addedTime: getUnixTimestamp(),
      body,
      cta,
      image,
      notificationId: uuidv4(),
      title: title || "",
      type,
      isRead: false,
      isDeleted: false,
      ...additionalData,
    };

    // Reference to the agent's notifications document
    const agentNotificationsRef = db.collection("acnNotifications").doc(cpId);

    // Get the current document
    const doc = await agentNotificationsRef.get();

    if (!doc.exists) {
      // If document doesn't exist, create it with the first notification
      await agentNotificationsRef.set({
        notifications: [baseNotification],
        lastUpdated: getUnixTimestamp(),
      });
    } else {
      // If document exists, append the new notification to the array
      await agentNotificationsRef.update({
        notifications: FieldValue.arrayUnion(baseNotification),
        lastUpdated: getUnixTimestamp(),
      });
    }

    return cpId;
  } catch (error) {
    throw error;
  }
};

// Function to delete notifications older than 30 days
const cleanupOldNotifications = async () => {
  try {
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60; // 30 days in seconds
    const thirtyDaysAgo = getUnixTimestamp() - thirtyDaysInSeconds;

    // Get all notification documents
    const snapshot = await db.collection("acnNotifications").get();

    const batch = db.batch();
    let totalDeleted = 0;
    let totalDocuments = 0;

    // Process each agent's notification document
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (!data.notifications) continue;

      totalDocuments++;

      // Filter out old notifications
      const updatedNotifications = data.notifications.filter(
        (notification: any) => notification.addedTime > thirtyDaysAgo
      );

      // If there are notifications to remove
      if (updatedNotifications.length !== data.notifications.length) {
        const deletedCount =
          data.notifications.length - updatedNotifications.length;
        totalDeleted += deletedCount;

        if (updatedNotifications.length === 0) {
          // If no notifications left, delete the entire document
          batch.delete(doc.ref);
        } else {
          // Update with remaining notifications
          batch.update(doc.ref, {
            notifications: updatedNotifications,
            lastUpdated: getUnixTimestamp(),
          });
        }
      }
    }

    if (totalDeleted > 0) {
      await batch.commit();
    } else {
    }

    return {
      deletedCount: totalDeleted,
      processedDocuments: totalDocuments,
    };
  } catch (error) {
    throw error;
  }
};

export { saveNotification, cleanupOldNotifications };
