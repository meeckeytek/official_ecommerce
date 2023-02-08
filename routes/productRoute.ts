import { Router } from "express";
import * as productController from "../controllers/productController";
import upload from "../middlewares/upload";
import { isAuth, isAdmin } from "../middlewares/util";

const productRouter = Router();

productRouter.post("/allProducts", productController.getAllProducts);

productRouter.post(
  "/newProduct", isAuth, isAdmin,
  upload.single("image"),
  productController.newProduct
);

productRouter.get(
  "/getProduct/:productId",
  productController.getProduct
);

productRouter.patch("/comment/:productId", isAuth, productController.commentProduct);

productRouter.patch(
  "/editProduct/:productId",
  isAuth,
  isAdmin,
  productController.editProduct
);

productRouter.patch(
  "/editProductImage/:productId",
  isAuth,
  isAdmin,
  upload.single("image"),
  productController.editProductImage
);

productRouter.patch(
  "/comment/:productId",
  isAuth,
  productController.commentProduct
);

productRouter.delete(
  "/deleteProduct/:productId",
  isAuth,
  isAdmin,
  productController.deleteProduct
);

export default productRouter;
