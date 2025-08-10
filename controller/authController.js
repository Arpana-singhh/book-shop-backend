import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";

// ====================== REGISTER ======================
export const register = async (req, res) => {
  const { username, email, password, address } = req.body;

  // Check for missing details
  if (!username || !email || !password || !address) {
    return res.status(400).json({
      success: false,
      message: "Missing Details",
    });
  }

  try {
    // Validate username length
    if (username.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Username length should be at least 4 characters",
      });
    }

    // Check if username exists
    const existingUserName = await userModel.findOne({ username });
    if (existingUserName) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    // Check if email exists
    const existingUserEmail = await userModel.findOne({ email });
    if (existingUserEmail) {
      return res.status(409).json({
        success: false,
        message: "Email ID already exists",
      });
    }

    // Validate password strength
    const isValidPassword =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long, include one uppercase letter, and one special character",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP and expiration
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Create new user instance
    const user = new userModel({
      username,
      email,
      password: hashedPassword,
      address,
      verifyOtp: otp,
      verifyOtpExpireAt: Date.now() + 24 * 60 * 60 * 1000, // 24hr
    });

    console.log("📧 OTP sent to user:", otp);
    await user.save();

    // Send OTP to email
    const mailOptions = {
      from: `Book & Nerd <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${otp}. Verify your account using this OTP`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      success: true,
      message: "Registered successfully. Please check your email for OTP",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: `Something went wrong. Please try again.${error.message}`,
    });
  }
};

// ====================== LOGIN ======================
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Check for missing fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and Password both required",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid User" });
    }

    // Check if email is verified
    if (!user.isAccountVerified) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Please verify your email before logging in",
        });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Password" });
    }

    // Prepare token
    const authClaims = [{ name: user.username }, { role: user.role }];

    const token = jwt.sign({ authClaims }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      message: "User LoggedIn successfully",
      id: user._id,
      role: user.role,
      token: token,
    });
  } catch (error) {
    console.error("Login Error", error);
    return res.status(500).json({
      success: false,
      message: `Something went wrong. Please try again.${error.message}`,
    });
  }
};

// ====================== GET USER DATA ======================
export const getUserData = async (req, res) => {
  try {
    const { id } = req.headers;
    const user = await userModel.findById(id);

    // Check if user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not Found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong. Please try again.${error.message}`,
    });
  }
};

// ====================== VERIFY EMAIL ======================
export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  // Check for missing values
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Missing Details" });
  }

  try {
    const user = await userModel.findOne({ email });

    // Check if user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    // Validate OTP
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    // Check OTP Expiry
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(410).json({ success: false, message: "OTP Expired" });
    }

    // Update verification status
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "Email verified successfully. Please Login!!",
      });
  } catch (error) {
    console.error("Email Verification Error", error);
    return res.status(500).json({
      success: false,
      message: `Something went wrong. Please try again.${error.message}`,
    });
  }
};

// ====================== IS AUTHENTICATED ======================
export const isAuthenticated = (req, res) => {
  try {
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== SEND RESET PASSWORD OTP ======================
export const sentResetOtp = async (req, res) => {
  const { email } = req.body;

  // Email check
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is Required" });
  }

  try {
    const user = await userModel.findOne({ email });

    // Check if user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    // Generate OTP and save
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 10000; // 150 min

    console.log("Reset Password OTP sent to user:", otp);
    await user.save();

    // Send email
    const mailOptions = {
      from: `Book & Nerd <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`,
    };

    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ success: true, message: "OTP sent to your mail" });
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== VERIFY RESET OTP ======================
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  // Field check
  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required" });
  }

  try {
    const user = await userModel.findOne({ email });

    // Check if user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // OTP validation
    if (user.resetOtp !== otp) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    // Check Reset OTP Expiry
    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(410).json({ success: false, message: "OTP Expired" });
    }

    return res.status(200).json({ success: true, message: "OTP Verified" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== RESET PASSWORD ======================
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Field check
  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Email, OTP, and New Password are required",
      });
  }

  try {
    const user = await userModel.findOne({ email });

    // Check if user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // OTP validation
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    // Check Reset OTP Expiry
    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(410).json({ success: false, message: "OTP Expired" });
    }

      // Validate password strength
      const isValidPassword =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(newPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long, include one uppercase letter, and one special character",
      });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== LOGOUT ======================
export const logout = (req, res) => {
  try {
    // You can optionally clear cookies here if using them (e.g., res.clearCookie('token'))
    return res
      .status(200)
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// ====================== UPDATE ADDRESS ======================

export const updateAddress =async(req, res)=>{
try{
  const {id} = req.headers;
  const {address} = req.body;
  const user = await userModel.findById(id);

  // Check if user exists
  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: "User not Found" });
  }
  
  await userModel.findByIdAndUpdate(id, {address:address})
 
  return res
  .status(200)
  .json({ success: true, message: "Address Updated Successfully" });

}
catch(error){
   return res.status(500).json({ success: false, message: error.message });
}
}
