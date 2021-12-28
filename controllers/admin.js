import User from "../models/user";
// import jwt from "jsonwebtoken";
import axios from "axios";

export const currentAdmin = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select("-password").exec();
    if (!user.role.includes("Admin")) {
      return res.sendStatus(403);
    } else {
      res.json({ ok: true });
    }
  } catch (err) {
    console.log(err);
  }
};
export const totalStudents = async (req, res) => {
  try {
    //     console.log(req.user);
    const user = await User.findById(req.user._id).select("-password").exec();
    const school = user.school;
    console.log(user.school);
    const students = await User.find({ school }); //.select("__v");
    console.log(students);
    return res.json({ numberOfStudents: students.length });
  } catch (err) {
    console.log(err);
  }
};
