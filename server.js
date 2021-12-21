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
  .connect(process.env.DATABASE, {})
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log("DB Connection Err=>", err));
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
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );

  //intercepts OPTIONS method
  if ("OPTIONS" === req.method) {
    //respond with 200
    res.send(200);
  } else {
    //move on
    next();
  }
});

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
