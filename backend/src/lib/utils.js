import jwt from "jsonwebtoken";

export const generateToken = (userId, req, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: isSecure ? "none" : "lax", // CSRF attacks cross-site request forgery attacks
    secure: isSecure,
    path: "/",
  });

  return token;
};
