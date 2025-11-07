const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  code: { type: String, required: true, unique: true }, // give code for joining the  like i am taking custom code from teacher itself
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Class', ClassSchema);
