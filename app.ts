import express, { RequestHandler } from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path"
import dotenv from "dotenv";
import userRoute from "./routes/usersRoute";
import productRoute from "./routes/productRoute";
import orderRoute from "./routes/orderRoute";
import trashRoute from "./routes/trashRoute";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.join("uploads")));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/trash", trashRoute);

mongoose
  .connect(process.env.URI!)
  .then(() => {
    const port = process.env.PORT || 1249;
    app.listen(port, () => console.log(`listening on port ${port}`));
  })
  .catch((err: any) => {
    console.log(err);
  });
