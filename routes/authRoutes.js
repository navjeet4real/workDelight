const router = require("express").Router();
const authController = require("../controllers/authController")

router.post('/login', authController.login)
router.post('/register', authController.register, authController.sendOtp)
router.post('/verify-otp', authController.verifyOtp)

module.exports = router;