import { RequestHandler, Router } from "express";
import { sendEnquiryNotification } from "../controller/enquiryNotificaiton";
import { sendListingLiveNotification } from "../controller/listingFlow/listingLiveNotification";
import { handleQCStatusNotification } from "../controller/listingFlow/listingFlowNotification";
import { handleAddInventoryNotification } from "../controller/addInventory";
import { handleAddedRequirementsNotification } from "../controller/addRequirement";

const router = Router();

router.post("/enquiry/:enquiryId", sendEnquiryNotification);
router.post("/listing/:listingId", sendListingLiveNotification);
router.post("/listing-flow/:id", handleQCStatusNotification as RequestHandler);
router.post("/add-inventory", handleAddInventoryNotification as RequestHandler);
router.post("/add-requirement", handleAddedRequirementsNotification as RequestHandler);

export default router;
