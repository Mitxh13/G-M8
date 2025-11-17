const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, isTeacher, srn } = req.body || {};

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please add all fields.");
  }

  if (!isTeacher && !srn) {
    res.status(400);
    throw new Error("SRN is required for a Student to register.");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists.");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    isTeacher,
    srn,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data.");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400);
    throw new Error("Please fill all fields.");
  }

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials.");
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const type = req.body.type || null;
  if (!type) {
    res.status(400);
    throw new Error("Please specify the field to update.");
  }

  const user = req.user;

  if (!user) {
    res.status(400);
    throw new Error("User not found.");
  }

  switch (type) {
    case "name":
      const newUserName = req.body.newUserName;
      if (!newUserName) {
        res.status(400);
        throw new Error("Please add name to update.");
      }
      const updatedUser = await User.findOneAndUpdate(
        { email: user.email },
        { $set: { name: newUserName } },
        { new: true }
      );
      if (!updatedUser) {
        res.status(400);
        throw new Error("Error in updating name.");
      } else {
        res.status(200);
        res.json({
          _id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
        });
      }
      break;
    case "password":
      const { oldPassword, newPassword } = req.body || {};
      if (!oldPassword || !newPassword) {
        res.status(400);
        throw new Error("Please fill all fields.");
      }

      if (await bcrypt.compare(oldPassword, user.password)) {
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);
        const updatedUser = await User.findOneAndUpdate(
          { email: user.email },
          { $set: { password: hashedNewPassword } },
          { new: true }
        );
        if (!updatedUser) {
          res.status(400);
          throw new Error("Error in updating password.");
        } else {
          res.status(200);
          res.json({
            _id: updatedUser._id,
            email: updatedUser.email,
            name: updatedUser.name,
          });
        }
      } else {
        res.status(400);
        throw new Error("Old password is incorrect.");
      }
      break;
  }
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "name email isTeacher srn"
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateUser,
};

// Lookup users by SRNs (body: { srns: ["SRN1","SRN2"] })
const lookupUsersBySrns = asyncHandler(async (req, res) => {
  const { srns } = req.body || {};
  if (!Array.isArray(srns) || srns.length === 0) {
    return res.status(400).json({ message: 'srns array required' });
  }
  // find users with matching srn
  const users = await User.find({ srn: { $in: srns } }).select('_id name email srn');
  res.json({ users });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateUser,
  lookupUsersBySrns,
};
