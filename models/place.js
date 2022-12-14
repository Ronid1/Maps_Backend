const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const placeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: false },
    long: { type: Number, required: false },
  },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  tags: [{ type: mongoose.Types.ObjectId, required: false, ref: "Tag" }],
});

module.exports = mongoose.model("Place", placeSchema);
