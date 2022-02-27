import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import User from "../models/user.model";
import Trash from "../models/trash.model";
import msg from "../middlewares/messages";
import { getToken } from "../middlewares/util";
import cloudinary from "../middlewares/cloudinary";

export const getAllUsers = async (req: any, res: any) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const sortBy = req.query.sortBy || "createdAt";
  const orderBy = req.query.orderBy || "-1";
  const { search } = req.body || "";
  const sortQuery = {
    [sortBy]: orderBy,
  };

  const searchQuery = {
    $or: [
      { firstname: new RegExp(String(search), "i") },
      { lastname: new RegExp(String(search), "i") },
      { phone: new RegExp(String(search), "i") },
    ],
  };

  const retrievedCounts = await User.countDocuments(searchQuery);
  User.countDocuments(searchQuery).then((usersCount:any) => {
    User.find(searchQuery)
      .sort(sortQuery)
      .limit(limit)
      .skip(page * limit - limit)
      .then((users:any) => {
        return res.json({
          users,
          pagination: {
            hasPrevious: page > 1,
            prevPage: page - 1,
            hasNext: page < Math.ceil(usersCount / limit),
            next: page + 1,
            currentPage: Number(page),
            total: retrievedCounts,
            limit: limit,
            lastPage: Math.ceil(usersCount / limit),
          },
          links: {
            prevLink: `http://${req.headers.host}/api/v1/user/allUsers?&page=${
              page - 1
            }&limit=${limit}`,
            nextLink: `http://${req.headers.host}/api/v1/user/allUsers?&page=${
              page + 1
            }&limit=${limit}`,
          },
        });
      })
      .catch((err:any) =>res.status(500).json({message: msg.serverError}));
  });
};

export const newUser = async (req: any, res: any) => {
  const { firstname, lastname, email, password, phone } = req.body;

  let existed: any;

  try {
    existed = await User.findOne({ email });
  } catch (error) {
    return res.status(500).send({ message: msg.serverError });
  }

  if (existed) {
    return res.status(409).json({ message: msg.alreadyExist });
  }

  let hashedPassword: any, salt: string | number;

  try {
    salt = await bcrypt.genSalt(12);
    hashedPassword = await bcrypt.hash(password, salt);
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  let avatar: any;
  try {
    avatar = await cloudinary.uploader.upload(
      req.file ? req.file.path : "./img/avatar.png",
      {
        upload_preset: "Ecommerce",
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "msg.serverError" });
  }

  const user = new User({
    image: avatar.secure_url,
    firstname,
    lastname,
    email,
    password: hashedPassword,
    phone,
    cloudinary_id: avatar.public_id,
  });

  try {
    await user.save();
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  res.status(201).json({ messaage: msg.newInputSuccess });
};

export const auth = async (req: any, res: any) => {
  const { email, password } = req.body;

  let user: any;

  try {
    user = await User.findOne({ email });
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!user ) {
    return res.status(404).json({ message: msg.notFound });
  }

  if (user.disabled == true ) {
    return res.status(422).json({ message: msg.accountDisable });
  }

  let isValidPassword;

  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (error) {
    return res.status(404).json({ message: msg.notFound });
  }

  if (!isValidPassword) {
    return res.status(422).json({ message: msg.inputError });
  }

  res.status(200).json({ message: getToken(user) });
};

export const editUser = async (req: any, res: any) => {
  const { firstname, lastname, password, phone } = req.body;

  let user: any;
  try {
    user = await User.findById(req.user.userId);
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!user) {
    return res.status(404).json({ message: msg.notFound });
  }

  if (req.user.userId != user._id) {
    return res.status(403).json({ message: msg.notAuthorized });
  }

  let hashedPassword: any, salt: string | number;
  if (password) {
    try {
      salt = await bcrypt.genSalt(12);
      hashedPassword = await bcrypt.hash(password, salt);
    } catch (error) {
      return res.status(500).json({ message: msg.serverError });
    }
  }

  user.firstname = firstname || user.firstname;
  user.lastname = lastname || user.lastname;
  user.password = hashedPassword || user.password;
  user.phone = phone || user.phone;

  try {
    await user.save();
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  res.status(200).json({ message: msg.success });
};
export const editUserImage = async (req: any, res: any) => {
  let user: any;
  try {
    user = await User.findById(req.user.userId);
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!user) {
    return res.status(404).json({ message: msg.notFound });
  }

  if (req.user.userId != user._id) {
    return res.status(403).json({ message: msg.notAuthorized });
  }

  let avatar: any;
  try {
    await cloudinary.uploader.destroy(user.cloudinary_id);
    avatar = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: "Ecommerce",
    });
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  user.image = avatar.secure_url || user.image;
  user.cloudinary_id = avatar.public_id || user.cloudinary_id;

  try {
    await user.save();
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  res.status(200).json({ message: msg.success });
};
export const disabledAccount = async (req: any, res: any) => {
  let user: any;

  try {
    user = await User.findById(req.user.userId);
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  if (!user) {
    return res.status(404).json({ message: msg.notFound });
  }

  user.disabled = true || user.disabled;

  const disabled = new Trash({
    recycleBin: {
      user,
    },
    doneBy: {
      userId: req.user.userId,
      userFullname: `${req.user.userFirstname} ${req.user.userLastname}`,
    },
    deleteType: "User",
  });

  try {
    disabled.save();
    await user.save();
  } catch (error) {
    return res.status(500).json({ message: msg.serverError });
  }

  res.status(200).json({ message: msg.success });
};
export const forgetPassword = async (req: any, res: any) => {};
export const resetPassword = async (req: any, res: any) => {};
