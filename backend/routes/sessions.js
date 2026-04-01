const router = require('express').Router();
const Session = require('../models/Session');
const { protect, role } = require('../middleware/auth');

// Teacher creates a session
router.post('/', protect, role('teacher', 'admin'), async (req, res) => {
  try {
    const { name } = req.body;
    const session = await Session.create({ name, teacher: req.user._id });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get join link info (public - used when student clicks link)
router.get('/join/:code', async (req, res) => {
  try {
    const session = await Session.findOne({ joinCode: req.params.code })
      .populate('teacher', 'name email');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (!session.isActive) return res.status(400).json({ message: 'Session is no longer active' });
    res.json({ id: session._id, name: session.name, teacher: session.teacher, endDate: session.endDate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Student joins a session via code
router.post('/join/:code', protect, role('student'), async (req, res) => {
  try {
    const session = await Session.findOne({ joinCode: req.params.code });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (!session.isActive) return res.status(400).json({ message: 'Session expired' });
    if (session.students.includes(req.user._id))
      return res.status(400).json({ message: 'Already joined' });
    session.students.push(req.user._id);
    await session.save();
    res.json({ message: 'Joined successfully', session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get teacher's sessions
router.get('/my', protect, role('teacher', 'admin'), async (req, res) => {
  try {
    const sessions = await Session.find({ teacher: req.user._id }).populate('students', 'name email');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get student's sessions
router.get('/enrolled', protect, role('student'), async (req, res) => {
  try {
    const sessions = await Session.find({ students: req.user._id }).populate('teacher', 'name email');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: get all sessions
router.get('/', protect, role('admin'), async (req, res) => {
  try {
    const sessions = await Session.find().populate('teacher', 'name email').populate('students', 'name email');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Deactivate session
router.patch('/:id/deactivate', protect, role('teacher', 'admin'), async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
