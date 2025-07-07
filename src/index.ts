import express, { Request, Response } from "express";

const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (_: Request, res: Response) => {
  res.send("Hello World");
});

app.get("/health", (_: Request, res: Response) => {
  res.send("OK");
});
