import {Router} from 'express'
import * as userController from '../Controllers/userController'
import upload from '../middlewares/upload';
import { check } from "express-validator";

const { isAuth, isAdmin } = require('../middlewares/util');

const userRoute = Router()

userRoute.post('/allUsers', isAuth, isAdmin, userController.getAllUsers);

userRoute.post('/newUser',[
    check('firstName')
    .not()
    .isEmpty(),
    check('lastName')
    .not()
    .isEmpty(),
    check('email')
    .normalizeEmail(),
    check('phone')
    .isLength({min: 10}),
    check('password')
    .isLength({min: 6})
], upload.single('image'), userController.newUser);

userRoute.patch('/editUser',[
    check('firstName')
    .not()
    .isEmpty(),
    check('lastName')
    .not()
    .isEmpty(),
    check('password')
    .isLength({min: 6})
], isAuth, userController.editUser);

userRoute.patch('/disableAccount', isAuth, userController.disabledAccount);

userRoute.patch('/editUserImage', isAuth, upload.single('image'), userController.editUserImage);


userRoute.post('/auth', userController.auth);

userRoute.patch('/forgetPassword',
check('email')
.normalizeEmail()
, 
userController.forgetPassword);

userRoute.patch('/resetPassword',
check('password')
.isLength({min: 6})
, 
userController.resetPassword);

export default userRoute;