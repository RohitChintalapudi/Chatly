import ContactMessage from "../models/contactMessage.model.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message, feedback } = req.body;

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanMessage = typeof message === "string" ? message.trim() : "";
    const cleanSubject = typeof subject === "string" ? subject.trim() : "";
    const cleanFeedback = typeof feedback === "string" ? feedback.trim() : "";

    if (!cleanName || !cleanEmail || !cleanMessage) {
      return res.status(400).json({ message: "Name, email and message are required" });
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (cleanName.length > 100 || cleanSubject.length > 200 || cleanMessage.length > 5000) {
      return res.status(400).json({ message: "One or more fields exceed the allowed length" });
    }

    const newMessage = new ContactMessage({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      feedback: cleanFeedback.slice(0, 2000),
    });

    await newMessage.save();

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error in submitContactMessage controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
