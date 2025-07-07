import { Request, Router } from "express";
import { Response } from "express";
import { sendEnquiryNotification } from "../controller/enquiryNotificaiton";
import { Enquiry } from "../types/enquiry";

const router = Router();

router.post("/enquiry/:enquiryId", sendEnquiryNotification);
router.post("/enquiry/all", (req: Request, res: Response) => {
    // const enquiry: Enquiry = req.body;
    console.log("this is the console log");
    res.status(200).json({ success: true, message: "Enquiry notification sent" });
});

export default router;