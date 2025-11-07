const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', GroupSchema);
