import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const generateUniqueChatCode = async () => {
  let isUnique = false;
  let code = "";
  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const existing = await User.findOne({ chatCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
};

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const chatCode = await generateUniqueChatCode();

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      chatCode,
      contacts: [],
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, req, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        chatCode: newUser.chatCode,
        createdAt: newUser.createdAt,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.chatCode) {
      user.chatCode = await generateUniqueChatCode();
      await user.save();
    }

    generateToken(user._id, req, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      chatCode: user.chatCode,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
    res.cookie("jwt", "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      sameSite: isSecure ? "none" : "lax",
      secure: isSecure,
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName } = req.body;
    const userId = req.user._id;

    const updateData = {};

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadResponse.secure_url;
    }

    if (fullName !== undefined) {
      if (!fullName || !fullName.trim()) {
        return res.status(400).json({ message: "Full name cannot be empty" });
      }
      updateData.fullName = fullName.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No profile data provided to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    let user = req.user;
    if (!user.chatCode) {
      const generatedCode = await generateUniqueChatCode();
      const updated = await User.findByIdAndUpdate(user._id, { chatCode: generatedCode }, { new: true }).select("-password");
      user = updated;
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log("Error in changePassword controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
