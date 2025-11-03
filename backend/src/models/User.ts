import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  referralCode: string;
  credits: number;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  referralCode: { type: String, required: true, unique: true },
  credits: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default model<IUser>("User", UserSchema);
