import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import CONNECT_DB from "./utils/db.js";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";
import roomRouter from "./routers/roomRouter.js"
import interestedRouter from "./routers/interestedRouter.js"
import errorMiddleware from "./middlewares/errorMiddleware.js";
import path from "path";

dotenv.config();
const app = express();
app.use(cookieParser());
const PORT = 3000;
const allowedOrigins = ["http://localhost:5173"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,   
};

app.use(cors(corsOptions))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/interested", interestedRouter);

app.use(errorMiddleware);
CONNECT_DB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
