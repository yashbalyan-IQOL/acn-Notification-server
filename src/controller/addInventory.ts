import { saveNotification } from "../services/notificationStorageService";
import { Request, Response } from "express";
import { Inventory } from "../types/Inventory";

export const handleAddInventoryNotification = async (
  req: Request,
  res: Response
) => {
  const inventory: Inventory = req.body;
  try {
    await saveNotification({
      title: "Listing Submitted!",
      body: `Your listing for ${inventory.propertyName} is under review.`,
      cpId: inventory.cpId,
      cta: ["View Details"],
      type: "add_inventory_notification",
      meta: inventory,
    });
    res.status(200).json({ message: "Notification processed successfully" });
  } catch (error) {
    console.error("Error processing add inventory notification:", error);
    return res.status(500).send("Internal Server Error");
  }
};
