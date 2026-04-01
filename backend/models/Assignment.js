const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deadline: { type: Date, required: true },
  maxScore: { type: Number, default: 100 },
  pdfFile: { type: String }, // teacher's assignment PDF path
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
