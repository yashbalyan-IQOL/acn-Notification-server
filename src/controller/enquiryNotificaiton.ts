import { Request, Response } from "express";
import { Enquiry } from "../types/enquiry";
import { sendNotificationToAgent } from "../services/notificationService";
import { saveNotification } from "../services/notificationStorageService";

export const sendEnquiryNotification = async (req: Request, res: Response) => {
  const enquiryId = req.params.enquiryId;
  const enquiry: Enquiry = req.body;
  console.log("sending enquiry notification to buyer");
  await sendEnquiryNotificationToBuyer(enquiry);
  console.log("sending enquiry notification to seller");
  await sendEnquiryNotificationToSeller(enquiry);
  res.status(200).json({ success: true, message: "Enquiry notification sent" });
};

const sendEnquiryNotificationToBuyer = async (enquiry: Enquiry) => {
  console.log(enquiry, "enquiry");
  const { success, sent, total, message } = await sendNotificationToAgent(
    enquiry.buyerCpId,
    `Enquiry sent to Agent!`,
    `You've enquired about ${enquiry.propertyName}. Check "My Enquiries" to track status.`,
    enquiry
  );
  console.log(
    success,
    ":success",
    sent,
    ":sent",
    total,
    ":total",
    message,
    ":message"
  );

  // save notification to buyer
  const savedNotification = await saveNotification({
    title: "Enquiry sent to Agent!",
    body: `You've enquired about ${enquiry.propertyName}. Check "My Enquiries" to track status.`,
    cpId: enquiry.buyerCpId,
    cta: ["Call Agent", "Message on WhatsApp"],
    type: "enquiry_buyer_notification",
    meta: enquiry,
  });
  console.log(savedNotification, "savedNotification");
};

const sendEnquiryNotificationToSeller = async (enquiry: Enquiry) => {
  console.log(enquiry, "enquiry");
  const { success, sent, total, message } = await sendNotificationToAgent(
    enquiry.sellerCpId,
    `New enquiry received!`,
    `${enquiry.buyerName} enquired about ${enquiry.propertyName} (ID ${enquiry.propertyId}).`,
    enquiry
  );

  console.log(
    success,
    ":success",
    sent,
    ":sent",
    total,
    ":total",
    message,
    ":message"
  );

  // save notification to seller

  const savedNotification = await saveNotification({
    title: "New enquiry received!",
    body: `${enquiry.buyerName} enquired about ${enquiry.propertyName} (ID ${enquiry.propertyId}).`,
    cpId: enquiry.sellerCpId,
    cta: ["Call Agent", "Message on WhatsApp"],
    type: "enquiry_seller_notification",
    meta: enquiry,
  });
};
