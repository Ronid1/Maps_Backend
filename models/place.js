const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const placeSchema = new Schema({
  title: { type: String, require: true },
  description: { type: String, require: true },
  address: { type: String, require: true },
  location: {
    lat: { type: Number, require: true },
    long: { type: Number, require: true },
  },
  creator: { type: String, require: true },
  tag: { type: String, require: false },
});

module.exports = mongoose.model('Place', placeSchema)