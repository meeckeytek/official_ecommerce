import mongoose, { Mongoose } from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderedProducts: [],
    shippingDetails: {},
    paymentMethod: { type: String, default: "Payment on Delivery" },
    totalPrice: { type: String },
    user: { type: String},
    isPaid: { type: String, default: "False" },
    paidAt: { type: Date, default:""},
    isDelivered: { type: String, default: "False" },
    deliveredAt: { type: Date, default:"" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
