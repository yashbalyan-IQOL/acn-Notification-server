import { saveNotification } from "../services/notificationStorageService";
import { Request, Response } from "express";
import { Requirement } from "../types/requirement";

export const handleAddedRequirementsNotification = async (req: Request, res: Response) => {
  const requirement: Requirement = req.body.formData;
  try {
    await saveNotification({
      title: "Requirement Posted",
      body: `Your requirement ${requirement.requirementId} is live.`,
      cpId: requirement.cpId,
      cta: ["Call Kam", "Dashboard"],
      type: "add_requirement_notification",
      meta: requirement,
    });
    res.status(200).json({ message: "Notification processed successfully" });
  } catch (error) {
    console.error("Error processing add inventory notification:", error);
    return res.status(500).send("Internal Server Error");
  }
};