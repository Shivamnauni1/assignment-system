const router = require('express').Router();
const User = require('../models/User');
const { protect, role } = require('../middleware/auth');

// Admin: get all users
router.get('/', protect, role('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: delete user
router.delete('/:id', protect, role('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user profile
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
