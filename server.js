import express from "express";
import cors from "cors";
const morgan = require("morgan");
require("dotenv").config();
import mongoose from "mongoose";
//file js
import { readdirSync } from "fs";
import cookieParser from "cookie-parser";
import csrf from "csurf";
//create express app
const app = express();
const csrfProtection = csrf({ cookie: true });
//db connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useFindAndModify: false,
    userUnifiedToplogoy: true,
    useCreateIndex: true,
  })
  .then(() => console.log("DB Connected"))
  .catch(() => console.log("DB Connection Err=>", err));
//apply middle-wares
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));
app.use(cookieParser());
// app.use((req, res, next) => {
//   console.log("hehe my middleware");
//   next();
// });
//route
readdirSync("./routes").map((r) => {
  app.use("/api", require(`./routes/${r}`));
});
app.use(csrfProtection);
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
//port
const port = process.env.PORT || 5500;

app.listen(port, () => console.log(`server is running on port ${port}`));
