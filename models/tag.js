const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tagSchema = new Schema({
  name: { type: String, required: true },
  color: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: false, ref: "Place" }],
});

module.exports = mongoose.model("Tag", tagSchema);
