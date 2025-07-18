import express, { Request, Response } from "express";
import cors from "cors";
import notificationRoutes from "./routes/notificationRoutes";
import { startDelistingCron } from "../src/cron/delistingCron";

const app = express();
const port = 8080;

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (_: Request, res: Response) => {
  res.send("Hello World");
});

app.get("/health", (_: Request, res: Response) => {
  res.send("OK");
});

app.use("/notification", notificationRoutes);

startDelistingCron();
