import { admin, db, messaging } from "../config/firebase";
const sendNotificationToAgent = async (
  cpId: string,
  title: string,
  body: string,
  data: any
) => {
  try {
    // Validate cpId before using it as a document path
    if (!cpId || typeof cpId !== "string" || cpId.trim() === "") {
      return {
        success: false,
        message: "Invalid cpId provided",
        sent: 0,
        total: 0,
      };
    }
    // Get the agent's FCM token from Firestore
    const agentRef = db.collection("acnAgents").doc(cpId);
    const agentDoc = await agentRef.get();

    if (!agentDoc.exists) {
      return {
        success: false,
        message: `Agent ${cpId} not found`,
        sent: 0,
        total: 0,
      };
    }

    const agentData = agentDoc.data();
    const isArray = Array.isArray(agentData?.fsmToken);
    const tokens = isArray ? agentData?.fsmToken : [agentData?.fsmToken];
    const totalTokens = tokens.filter(Boolean).length;

    // Track successful sends
    let successCount = 0;
    let errorMessages: string[] = [];

    // Get timeout from environment or use default
    const notificationTimeout = 5000;

    // Send notification to each token for this agent
    for (const token of tokens) {
      if (!token) continue;
      try {
        const message: any = {
          notification: { title, body },
          token,
        };
        if (data && Object.keys(data).length > 0) {
          const stringData: { [key: string]: string } = {};
          for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
              stringData[key] = String(data[key]);
            }
          }
          message.data = stringData;
        }
        const sendPromise = messaging?.send(message);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Notification timeout")),
            notificationTimeout
          )
        );

        await Promise.race([sendPromise, timeoutPromise]);
        successCount++;
      } catch (err: any) {
        const code = err.code || "";
        const bad =
          code.includes("not-registered") ||
          code.includes("invalid-registration-token");

        if (bad) {
          // Handle token removal based on storage type
          if (isArray) {
            await agentDoc.ref.update({
              fsmToken: admin.firestore.FieldValue.arrayRemove(token),
            });
          } else {
            await agentDoc.ref.update({
              fsmToken: admin.firestore.FieldValue.delete(),
            });
          }
        }
        errorMessages.push(err.message || String(err));
      }
    }

    return {
      success: successCount > 0,
      sent: successCount,
      total: totalTokens,
      message:
        successCount > 0
          ? `Sent ${successCount} of ${totalTokens} notifications.`
          : errorMessages.length > 0
          ? errorMessages.join("; ")
          : "No notifications sent.",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
      sent: 0,
      total: 0,
      message: err.message,
    };
  }
};

const sendNotificationToAllUsers = async (
  title: string,
  body: string,
  data: any = {}
) => {
  try {
    // Get all agents with FCM tokens
    const agentsRef = db.collection("acnAgents");
    const snapshot = await agentsRef.where("fsmToken", "!=", null).get();

    if (snapshot.empty) {
      return {
        success: false,
        message: "No agents found with FCM tokens",
        totalAgents: 0,
        successfulSends: 0,
        failedSends: 0,
      };
    }

    // Track statistics
    let totalAgents = 0;
    let successCount = 0;
    let failedCount = 0;
    let errorMessages: string[] = [];

    // Process each agent
    for (const doc of snapshot.docs) {
      const agentData = doc.data();
      const isArray = Array.isArray(agentData.fsmToken);
      const tokens = isArray ? agentData.fsmToken : [agentData.fsmToken];

      totalAgents++;

      // Send to each token
      for (const token of tokens) {
        if (!token) continue;
        try {
          const message: any = {
            notification: { title, body },
            token,
          };
          if (data && Object.keys(data).length > 0) {
            const stringData: { [key: string]: string } = {};
            for (const key in data) {
              if (Object.prototype.hasOwnProperty.call(data, key)) {
                stringData[key] = String(data[key]);
              }
            }
            message.data = stringData;
          }
          await messaging.send(message);
          successCount++;
        } catch (err: any) {
          failedCount++;
          errorMessages.push(err.message || String(err));
          // Remove invalid tokens
          if (
            err.code?.includes("not-registered") ||
            err.code?.includes("invalid-registration-token")
          ) {
            if (isArray) {
              await doc.ref.update({
                fsmToken: admin.firestore.FieldValue.arrayRemove(token),
              });
            } else {
              await doc.ref.update({
                fsmToken: admin.firestore.FieldValue.delete(),
              });
            }
          }
        }
      }
    }

    return {
      success: successCount > 0,
      totalAgents,
      successfulSends: successCount,
      failedSends: failedCount,
      message:
        successCount > 0
          ? `Sent ${successCount} notifications to ${totalAgents} agents.`
          : errorMessages.length > 0
          ? errorMessages.join("; ")
          : "No notifications sent.",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      totalAgents: 0,
      successfulSends: 0,
      failedSends: 0,
      message: error.message,
    };
  }
};

export { sendNotificationToAgent, sendNotificationToAllUsers };
