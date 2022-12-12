const uuid = require("uuid").v4;
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");

let DUMMY_USERS = [
  {
    id: "u1",
    name: "user one",
    email: "user@email.com",
    password: "password1",
  },
];

function getUsers(req, res, next) {
  res.json({ users: DUMMY_USERS });
}

function createUser(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(new HttpError("Invalid inputs passed", 422));

  const { name, email, password } = req.body;
  if (DUMMY_USERS.find((user) => user.email === email))
    return next(new HttpError("User already exists", 422));

  const newUser = {
    id: uuid(),
    name,
    email,
    password,
  };
  DUMMY_USERS.push(newUser);

  res.status(201).json({ user: newUser });
}

function loginUser(req, res, next) {
  const { email, password } = req.body;
  const user = DUMMY_USERS.find((user) => user.email === email);
  if (!user || user.password !== password)
    return next(new HttpError("wrong credentials", 401));

  res.status(200).json({ message: "Login succesful" });
}

exports.getUsers = getUsers;
exports.createUser = createUser;
exports.loginUser = loginUser;
