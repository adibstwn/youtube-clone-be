import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import { createError } from "../error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  // console.log(req.body);
  try {
    // encrypt the code
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const newUser = new User({ ...req.body, password: hash });

    await newUser.save();
    res.status(200).send("User has been created");
  } catch (err) {
    // handle error
    next(err);
  }
};

export const signin = async (req, res, next) => {
  // console.log(req.body)
  try {
    const user = await User.findOne({ name: req.body.name });
    if (!user) return next(createError(404, "user not found"));

    const isCorrect = await bcrypt.compare(req.body.password, user.password);

    if (!isCorrect) return next(createError(400, "Wrong credential"));

    // prosess mengirim data ke app
    const token = jwt.sign({ id: user._id }, process.env.JWT);
    const {password, ...others} = user._doc;
    res
      .cookie("access_token ", token, {
        httpOnly: true,
      })
      .status(200)
      .json(others);
  } catch (err) {
    // handle error
    // next(createError(404, "User tidak ditemukan"));
  }
};
