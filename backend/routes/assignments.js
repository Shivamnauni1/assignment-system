const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const Assignment = require('../models/Assignment');
const Session = require('../models/Session');
const { protect, role } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: 'uploads/assignments/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files allowed'));
}});

// Teacher creates assignment for a session
router.post('/', protect, role('teacher', 'admin'), upload.single('pdf'), async (req, res) => {
  try {
    const { title, description, sessionId, deadline, maxScore } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const assignment = await Assignment.create({
      title, description, session: sessionId,
      teacher: req.user._id, deadline,
      maxScore: maxScore || 100,
      pdfFile: req.file ? req.file.path : null,
    });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get assignments for a session
router.get('/session/:sessionId', protect, async (req, res) => {
  try {
    const assignments = await Assignment.find({ session: req.params.sessionId })
      .populate('teacher', 'name');
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single assignment
router.get('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('teacher', 'name');
    if (!assignment) return res.status(404).json({ message: 'Not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
