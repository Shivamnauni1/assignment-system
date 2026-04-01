const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },

  // Profile fields
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  phone: { type: String, default: '' },
  department: { type: String, default: '' },
  rollNumber: { type: String, default: '' },
  batch: { type: String, default: '' },
  skills: [{ type: String }],

  // Social / coding profiles
  socials: {
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    leetcode: { type: String, default: '' },
    twitter: { type: String, default: '' },
    portfolio: { type: String, default: '' },
  },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
