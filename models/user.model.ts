import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    image:{type:String},
    firstname: { type: String},
    lastname: { type: String},
    email: { type: String, unique: true },
    password: { type: String},
    phone: { type: String},
    cloudinary_id:{type: String},
    isAdmin: { type: Boolean, default: false },
    disabled:{type: Boolean, default: false},
    resetLink: { data: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
