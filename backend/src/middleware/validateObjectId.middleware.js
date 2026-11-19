import mongoose from "mongoose";

/**
 * Guards routes with an `:id` segment from Mongoose CastErrors.
 * Without this, a malformed id (e.g. /messages/hello) throws inside the
 * controller and surfaces as a confusing 500 response.
 */
export const validateObjectId = (paramName = "id") => (req, res, next) => {
  const value = req.params[paramName];

  if (!mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({ message: `Invalid ${paramName} format` });
  }

  next();
};
