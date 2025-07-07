import { Request, Response } from "express";
import { Listing } from "../../types/listing";
import { sendNotificationToAgent } from "../../services/notificationService";
import { saveNotification } from "../../services/notificationStorageService";

export const sendListingLiveNotification = async (
  req: Request,
  res: Response
) => {
  const listingId = req.params.listingId;
  const listing: Listing = req.body;
  console.log(listing, "listing");
  const { success, sent, total, message } = await sendNotificationToAgent(
    listing.cpId,
    `Listing Live!`,
    `Your listing for ${listing.propertyName} (ID ${listing.propertyId}) is now live.`,
    listing
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
    title: "Listing Live!",
    body: `Your listing for ${listing.propertyName} (ID ${listing.propertyId}) is now live.`,
    cpId: listing.cpId,
    cta: ["View Listing"],
    type: "listing_notification",
    meta: listing,
  });
  console.log(savedNotification, "savedNotification");
};
