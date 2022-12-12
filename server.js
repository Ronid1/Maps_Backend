const express = require("express");
const bodyParser = require("body-parser");
const HttpError = require("./models/http-error");
const placesRoutes = require("./routes/places-routes");
const tagsRoutes = require("./routes/tags-routes");
const usersRoutes = require("./routes/users-routes");

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

app.listen(port);
