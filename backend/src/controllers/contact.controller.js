import ContactMessage from "../models/contactMessage.model.js";

export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message, feedback } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required" });
    }

    const newMessage = new ContactMessage({
      name,
      email,
      subject,
      message,
      feedback,
    });

    await newMessage.save();

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.log("Error in submitContactMessage controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
