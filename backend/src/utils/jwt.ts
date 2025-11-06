import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as jwt.Secret | undefined;

export function signToken(payload: object) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET missing");
  const expiresInEnv = process.env.JWT_EXPIRES_IN;
  const expiresIn = (expiresInEnv ?? "7d") as NonNullable<jwt.SignOptions["expiresIn"]>;
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET missing");
  return jwt.verify(token, JWT_SECRET);
}
