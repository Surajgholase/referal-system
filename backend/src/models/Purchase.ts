import { Schema, model, Document, Types } from "mongoose";

export interface IPurchase extends Document {
  userId: Types.ObjectId;
  amount: number;
  createdAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

PurchaseSchema.index({ userId: 1, createdAt: 1 });

export default model<IPurchase>("Purchase", PurchaseSchema);
