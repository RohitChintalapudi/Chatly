import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Fetch user's saved contacts
    const currentUser = await User.findById(loggedInUserId).populate("contacts", "-password");
    res.status(200).json(currentUser?.contacts || []);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addContactByCode = async (req, res) => {
  try {
    const { code } = req.body;
    const loggedInUserId = req.user._id;

    if (!code || !code.trim()) {
      return res.status(400).json({ message: "6-digit code is required" });
    }

    const cleanCode = code.trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      return res.status(400).json({ message: "Code must be a 6-digit number" });
    }

    const targetUser = await User.findOne({ chatCode: cleanCode }).select("-password");

    if (!targetUser) {
      return res.status(404).json({ message: "No user found with this 6-digit code" });
    }

    if (targetUser._id.toString() === loggedInUserId.toString()) {
      return res.status(400).json({ message: "You cannot add yourself as a contact" });
    }

    // Add targetUser to current user's contacts
    await User.findByIdAndUpdate(loggedInUserId, {
      $addToSet: { contacts: targetUser._id },
    });

    // Also add current user to targetUser's contacts so both can chat seamlessly
    await User.findByIdAndUpdate(targetUser._id, {
      $addToSet: { contacts: loggedInUserId },
    });

    // Notify targetUser in real time if online
    const targetSocketId = getReceiverSocketId(targetUser._id.toString());
    if (targetSocketId) {
      const loggedInUserWithoutPassword = await User.findById(loggedInUserId).select("-password");
      io.to(targetSocketId).emit("newContactAdded", {
        user: loggedInUserWithoutPassword,
      });
    }

    res.status(200).json({
      message: `Added ${targetUser.fullName} to contacts!`,
      contact: targetUser,
    });
  } catch (error) {
    console.error("Error in addContactByCode: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let audioUrl;
    if (audio) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(audio, {
          resource_type: "auto",
        });
        audioUrl = uploadResponse.secure_url;
      } catch (err) {
        console.error("Cloudinary audio upload notice (fallback to Data URL):", err.message);
        audioUrl = audio;
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audio: audioUrl,
    });

    await newMessage.save();

    // Ensure bidirectional contacts linkage
    await User.findByIdAndUpdate(senderId, { $addToSet: { contacts: receiverId } });
    await User.findByIdAndUpdate(receiverId, { $addToSet: { contacts: senderId } });

    const sender = await User.findById(senderId).select("fullName profilePic chatCode");

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        ...newMessage.toObject(),
        sender,
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const clearChat = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    await Message.deleteMany({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    // Notify receiver in real time if online
    const receiverSocketId = getReceiverSocketId(userToChatId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("chatCleared", {
        clearedBy: myId.toString(),
        chatPartnerId: userToChatId.toString(),
      });
    }

    res.status(200).json({ message: "Chat conversation cleared successfully" });
  } catch (error) {
    console.error("Error in clearChat controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const myId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check authorization: user must be sender or receiver
    if (
      message.senderId.toString() !== myId.toString() &&
      message.receiverId.toString() !== myId.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    await Message.findByIdAndDelete(messageId);

    // Notify other participant in real time
    const otherUserId =
      message.senderId.toString() === myId.toString()
        ? message.receiverId.toString()
        : message.senderId.toString();

    const receiverSocketId = getReceiverSocketId(otherUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", {
        messageId: messageId.toString(),
        deletedBy: myId.toString(),
      });
    }

    res.status(200).json({ message: "Message deleted successfully", messageId });
  } catch (error) {
    console.error("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeContact = async (req, res) => {
  try {
    const { id: contactId } = req.params;
    const loggedInUserId = req.user._id;
    const { deleteChatHistory } = req.query; // e.g. ?deleteChatHistory=true

    await User.findByIdAndUpdate(loggedInUserId, {
      $pull: { contacts: contactId },
    });

    if (deleteChatHistory === "true") {
      await Message.deleteMany({
        $or: [
          { senderId: loggedInUserId, receiverId: contactId },
          { senderId: contactId, receiverId: loggedInUserId },
        ],
      });

      const receiverSocketId = getReceiverSocketId(contactId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("chatCleared", {
          clearedBy: loggedInUserId.toString(),
          chatPartnerId: contactId.toString(),
        });
      }
    }

    res.status(200).json({ message: "Contact removed from saved list" });
  } catch (error) {
    console.error("Error in removeContact controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

