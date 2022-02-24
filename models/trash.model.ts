import mongoose from "mongoose";

const trashSchema = new mongoose.Schema(
  {
    recycleBin: {},
    doneBy: {
      userId: { type: mongoose.Types.ObjectId, ref: "user" },
      userFullname: { type: String },
    },
    deleteType:{type: String}
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Trash", trashSchema);
