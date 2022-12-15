const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");

async function getUsers(req, res, next) {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch {
    return next(new HttpError());
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
}

async function createUser(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(new HttpError("Invalid inputs passed", 422));

  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError());
  }

  if (existingUser) return next(new HttpError("User already exists", 422));

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch {
    return next(new HttpError());
  }

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    places: [],
  });

  try {
    await newUser.save();
  } catch (err) {
    return next(new HttpError("Something went wrong", 500));
  }

  res.status(201).json({ user: newUser.toObject({ getters: true }) });
}

async function loginUser(req, res, next) {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError());
  }

  if (!user) return next(new HttpError("User does not exicst", 401));

  let validPassword = false;
  try {
    validPassword = await bcrypt.compare(password, user.password);
  } catch {
    return next(new HttpError());
  }

  if (!validPassword) return next(new HttpError("Wrong password, please try again", 401));

  res.status(200).json({ message: "Login succesful" });
}

exports.getUsers = getUsers;
exports.createUser = createUser;
exports.loginUser = loginUser;
