import { Request, Router } from "express";
import { Response } from "express";
import { sendEnquiryNotification } from "../controller/enquiryNotificaiton";
import { Enquiry } from "../types/enquiry";
import { sendListingLiveNotification } from "../controller/listingFlow/listingLiveNotification";
import { handleQCStatusNotification } from "../controller/listingFlow/listingFlowNotification";

const router = Router();

router.post("/enquiry/:enquiryId", sendEnquiryNotification);
router.post("/listing/:listingId", sendListingLiveNotification);
router.post("/listing-flow/:id", handleQCStatusNotification);

export default router;
