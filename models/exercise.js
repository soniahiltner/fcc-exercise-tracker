const mongoose = require("mongoose");
const { Schema } = mongoose;

const exerciseSchema = new Schema({
  author_id: { type: Schema.Types.ObjectId, ref: 'User'},
  description: String,
  duration: Number,
  date: { type: Date },
});



module.exports = mongoose.model("Exercise", exerciseSchema);
