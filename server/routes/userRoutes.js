const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateUser,
  lookupUsersBySrns,
  getAllUsers,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/all", protect, getAllUsers);
router.put("/update", protect, updateUser);
router.post('/lookup', protect, lookupUsersBySrns);

module.exports = router;