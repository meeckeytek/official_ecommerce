import { Router } from "express";
import * as orderController from "../Controllers/orderController";
import { isAuth, isAdmin } from "../middlewares/util";
const { check } = require("express-validator");
const orderRouter = Router();

orderRouter.post("/allOrders", isAuth, isAdmin, orderController.getAllOrder);

orderRouter.post("/newOrder", isAuth, orderController.newOrder);

orderRouter.get("/userOrder", isAuth, orderController.getUserOrders);

orderRouter.get(
  "/allUnpaidOrders",
  isAuth,
  isAdmin,
  orderController.unpaidOrders
);

orderRouter.get(
  "/allUnDeliveredOrders",
  isAuth,
  isAdmin,
  orderController.undeliveredOrders
);

orderRouter.get("/getOrder/:orderId", isAuth, orderController.getOrderDetails);


orderRouter.patch(
  "/isPaid/:orderId",
  isAuth,
  isAdmin,
  orderController.isPaid
);

orderRouter.patch(
  "/isDelivered/:orderId",
  isAuth,
  isAdmin,
  orderController.isDelivered
);

orderRouter.patch("/:id/pay", isAuth, orderController.payment);

orderRouter.delete(
  "/deleteOrder/:orderId",
  check("orderId").not().isEmpty(),
  isAuth,
  orderController.deleteOrder
);


export default orderRouter;
