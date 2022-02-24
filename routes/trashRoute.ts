import {Router} from 'express'
import * as trashController from '../Controllers/trashController'
import { isAuth, isAdmin } from "../middlewares/util";
const { check } = require("express-validator");
const trashRouter = Router();



trashRouter.get("/allTrashes", isAuth, isAdmin, trashController.getAllTrash);

trashRouter.get("/allDeletedUsers", isAuth, isAdmin, trashController.allDeletedUsers);

trashRouter.get("/allDeletedProducts", isAuth, isAdmin, trashController.allDeletedProducts);

trashRouter.get("/allDeletedOrders", isAuth, isAdmin, trashController.allDeletedOrders);

trashRouter.get("/trashDetails/:trashId", isAuth, isAdmin, trashController.getTrashDetails);

trashRouter.delete("/deleteTrash/:trashId", isAuth, isAdmin, trashController.deleteTrash);

export default trashRouter;

