const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {type: String, unique: true}
});

userSchema.virtual('log', {
  ref: 'Exercise',
  localField: '_id',
  foreignField: 'author_id'
});

module.exports = mongoose.model('User', userSchema);
