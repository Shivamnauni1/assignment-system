const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const sessionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  joinCode: { type: String, default: () => uuidv4(), unique: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  startDate: { type: Date, default: Date.now },
  endDate: {
    type: Date,
    default: () => {
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      return d;
    }
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
