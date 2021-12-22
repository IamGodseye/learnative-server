import { request } from "express";
import User from "../models/user";
import { hashPassword, comparePassword } from "../utils/auth";
import jwt from "jsonwebtoken";
import AWS from "aws-sdk";
import { nanoid } from "nanoid";

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_ACCESS_REGION,
  apiVersion: process.env.AWS_ACCESS_API_VERSION,
  // AWS_SDK_LOAD_CONFIG: 1,
};

const SES = new AWS.SES(awsConfig);

export const register = async (req, res) => {
  try {
    //     console.log(req.body);
    const { name, email, password } = req.body;
    if (!name) return res.status(400).send("Name is required");
    if (!password || password.length < 6)
      return res
        .status(400)
        .send("Password is required and should be min of 6 characters");
    let userExist = await User.findOne({ email }).exec();
    if (userExist) return res.status(400).send("Email is taken");

    const hashedPassword = await hashPassword(password);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    //console.log("saved user", user);
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error... Try Again...");
  }
};

export const login = async (req, res) => {
  try {
    // console.log(req.body);
    const { email, password } = req.body;
    let user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).send("No user found");

    const match = await comparePassword(password, user.password);

    if (!match) return res.status(400).send("Wrong Password!!!");
    //create JWT
    //expried in 7 days
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    //send cookie
    //dont send password
    user.password = undefined;

    //send token
    res.cookie("token", token, {
      httpOnly: true,
      //secure: true,
      //secure will only work in HTTPS
    });

    // user = { ...user, token: token };
    //send user as json
    console.log(user);
    res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error... Try Again...");
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ message: "Signout Sucess..." });
  } catch (err) {
    console.log(err);
  }
};
export const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").exec();
    console.log("CURRENT_USER", user);
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

// TESTING BOLTE
export const sendTestEmail = async (req, res) => {
  // console.log("send email using SES");
  const params = {
    Source: process.env.EMAIL_FROM,
    Destination: { ToAddresses: ["cheemsdoge1729@gmail.com"] },
    ReplyToAddresses: [process.env.EMAIL_FROM],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `<html>
              <h1> RESET PASSWORD LINK </h1>
              <p> Please use the followin link to reset the password</p>
            </html>`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Password Reset link",
      },
    },
  };
  const emailSent = SES.sendEmail(params).promise();
  emailSent
    .then((data) => {
      console.log(data);
      res.json({ ok: true });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const shortCode = nanoid(6).toUpperCase();
    const user = await User.findOneAndUpdate(
      { email },
      { passwordResetCode: shortCode }
    );
    if (!user) return res.status(400).send("User not found!!!");
    // console.log(email);
    //email
    const params = {
      Source: process.env.EMAIL_FROM,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `<html>
                <h1>Reset password</h1>
                <p>Use this code to reset your password</p>
                <h2 style="color:red;">${shortCode}</h2>
                <i>Onlien Education Marketplace</i>
                </html>`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Reset Password",
        },
      },
    };
    const emailSent = SES.sendEmail(params).promise();
    emailSent
      .then((data) => {
        console.log(data);
        res.json({ ok: true });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    // console.table({ email, code, newPassword });
    const hashedPassword = await hashPassword(newPassword);

    const user = User.findOneAndUpdate(
      { email, passwordResetCode: code },
      { password: hashedPassword, passwordResetCode: "" }
    ).exec();

    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.statis(400).send("Error! Please Try again");
  }
};
