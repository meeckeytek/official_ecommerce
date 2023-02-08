import {Router} from 'express'
import * as userController from '../controllers/userController'
import upload from '../middlewares/upload';

const { isAuth, isAdmin } = require('../middlewares/util');

const userRoute = Router()

userRoute.post('/allUsers', isAuth, isAdmin, userController.getAllUsers);

userRoute.post('/newUser', upload.single('image'), userController.newUser);

userRoute.patch('/editUser', isAuth, userController.editUser);

userRoute.patch('/disableAccount', isAuth, userController.disabledAccount);

userRoute.patch('/editUserImage', isAuth, upload.single('image'), userController.editUserImage);


userRoute.post('/auth', userController.auth);

userRoute.patch('/forgetPassword', userController.forgetPassword);

userRoute.patch('/resetPassword',userController.resetPassword);

export default userRoute;