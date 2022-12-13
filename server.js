const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const HttpError = require("./models/http-error");
const placesRoutes = require("./routes/places-routes");
const tagsRoutes = require("./routes/tags-routes");
const usersRoutes = require("./routes/users-routes");
const dotenv = require("dotenv").config();

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use("/api/places", placesRoutes);
app.use("/api/tags", tagsRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) return next(error);
  res.status(error.code || 500);
  res.json({ message: error.message || "Something went wrong" });
});

mongoose
  .connect(`mongodb+srv://admin:${process.env.ADMIN_DB_PASSWORD}@cluster0.lraysjm.mongodb.net/Places?retryWrites=true&w=majority`)
  .then(() => {
    app.listen(port);
  })
  .catch((err) => console.log(err));
