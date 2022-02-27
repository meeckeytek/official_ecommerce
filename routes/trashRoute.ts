import {Router} from 'express'
import * as trashController from '../Controllers/trashController'
import { isAuth, isAdmin } from "../middlewares/util";
const trashRouter = Router();



trashRouter.post("/allTrashes", isAuth, isAdmin, trashController.getAllTrash);

trashRouter.get("/trashDetails/:trashId", isAuth, isAdmin, trashController.getTrashDetails);

trashRouter.get("/restore/:trashId", isAuth, isAdmin, trashController.restore);

trashRouter.delete("/deleteTrash/:trashId", isAuth, isAdmin, trashController.deleteTrash);

export default trashRouter;

