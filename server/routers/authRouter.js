import express from "express";
import { login, signup, verifyotp } from "../controllers/authController.js";
import validate from "../middlewares/validateMiddleware.js";
import { loginSchema, signUpSchema } from "../validators/authValidator.js";

const router = express.Router();

router.post("/signup",validate(signUpSchema),signup);
router.post("/verifyotp",verifyotp)
router.post("/login",validate(loginSchema),login);

export default router;