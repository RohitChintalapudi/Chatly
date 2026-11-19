export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
};

export const errorHandler = (error, req, res, next) => {
  // express.json() rejects invalid JSON with a SyntaxError carrying status 400.
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Malformed JSON body" });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body too large" });
  }

  console.error("Unhandled error:", error);
  res.status(error.status || 500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : error.message || "Internal Server Error",
  });
};
