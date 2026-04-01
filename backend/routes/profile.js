const router = require('express').Router();
const multer = require('multer');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: 'uploads/avatars/',
  filename: (req, file, cb) => cb(null, `${req.user._id}-${Date.now()}${require('path').extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files allowed'));
}});

// Get own profile
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get any user's public profile
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile
router.put('/', protect, async (req, res) => {
  try {
    const { name, bio, phone, department, rollNumber, batch, skills, socials } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, phone, department, rollNumber, batch, skills, socials },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload avatar
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
