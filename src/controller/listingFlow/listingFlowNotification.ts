import { Request, Response } from "express";
import { sendNotificationToAgent } from "../../services/notificationService";
import { saveNotification } from "../../services/notificationStorageService";
import { db } from "../../config/firebase";

export const handleQCStatusNotification = async (
  req: Request,
  res: Response
) => {
  const qcId = req.params.id;
  console.log("Processing QC status for ID:", qcId);

  try {
    const qcRef = db.collection("acnQCInventories").doc(qcId);
    const qcDoc = await qcRef.get();

    if (!qcDoc.exists) {
      console.log("QC Document Not Found!");
      return res.status(404).send("Property Not Found");
    }

    const qcData: any = qcDoc.data();
    if (!qcData) {
      console.log("QC Data is undefined!");
      return res.status(404).send("QC Data Not Found");
    }

    if (qcData.qcStatus === "available") {
      return res.status(200).json({ message: "QC is available" });
    }

    let title: string;
    let body: string;
    let cta: string[];
    switch (qcData.qcStatus) {
      case "duplicate":
        title = "Duplicate Listing";
        body = `This unit in ${qcData.propertyName} is already listed.`;
        cta = ["Create New"];
        break;
      case "primary":
        title = "Primary Property Detected";
        body = `ACN only lists resale inventories. If this is an error, contact KAM.`;
        cta = [];
        break;
      case "rejected":
        title = "Listing Rejected";
        body = `Your listing for ${qcData.propertyName} was rejected: ${qcData.rejectionReason}.`;
        cta = ["Contact KAM"];
        break;
      default:
        title = "Listing Submitted!";
        body = `Your listing for ${qcData.propertyName} is under review.`;
        cta = [];
        break;
    }

    // Save to Notifications collection
    const savedNotification = await saveNotification({
      title,
      body,
      cpId: qcData.cpId,
      cta,
      type: "qc_notification",
      meta: qcData,
    });
    console.log(savedNotification, "savedNotification");
    const result = await sendNotificationToAgent(
      qcData.cpId,
      title,
      body,
      qcData
    );
    console.log(result, ":result");
    res.status(200).json({
      message: "Successfully Sent Notification",
      result,
    });
  } catch (error) {
    console.error("Error processing QC notification:", error);
    res.status(500).send("Error sending notification");
  }
};
