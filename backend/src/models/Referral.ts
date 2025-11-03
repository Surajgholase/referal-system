import { Schema, model, Document, Types } from "mongoose";

export interface IReferral extends Document {
  referrerId: Types.ObjectId;
  referredId: Types.ObjectId;
  status: "pending" | "converted";
  createdAt: Date;
}

const ReferralSchema = new Schema<IReferral>({
  referrerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  referredId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "converted"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

ReferralSchema.index({ referrerId: 1, referredId: 1 }, { unique: true });

export default model<IReferral>("Referral", ReferralSchema);
