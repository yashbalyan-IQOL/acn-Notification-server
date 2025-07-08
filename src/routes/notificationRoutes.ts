import { RequestHandler, Router } from "express";
import { sendEnquiryNotification } from "../controller/enquiryNotificaiton";
import { sendListingLiveNotification } from "../controller/listingFlow/listingLiveNotification";
import { handleQCStatusNotification } from "../controller/listingFlow/listingFlowNotification";

const router = Router();

router.post("/enquiry/:enquiryId", sendEnquiryNotification);
router.post("/listing/:listingId", sendListingLiveNotification);
router.post("/listing-flow/:id", handleQCStatusNotification as RequestHandler);

export default router;
