const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, trim: true },
  type: { type: String, enum: ['text', 'file', 'system'], default: 'text' },
  // a message can belong to either a group chat (group) or a class-wide chat (classRoom)
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  classRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  attachments: [{ url: String, filename: String }], // optional file links
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

MessageSchema.index({ group: 1, createdAt: -1 }); // quick group queries
MessageSchema.index({ classRoom: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
