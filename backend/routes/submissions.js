const router = require('express').Router();
const multer = require('multer');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { protect, role } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: 'uploads/submissions/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files allowed'));
}});

// Student submits assignment
router.post('/:assignmentId', protect, role('student'), upload.single('pdf'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const now = new Date();
    const isLate = now > new Date(assignment.deadline);

    const existing = await Submission.findOne({ assignment: assignment._id, student: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already submitted' });

    const submission = await Submission.create({
      assignment: assignment._id,
      student: req.user._id,
      pdfFile: req.file.path,
      submittedAt: now,
      isLate,
      // Auto score: late = 0, on time = maxScore (teacher can override)
      score: isLate ? 0 : null,
    });
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Teacher grades a submission
router.patch('/:id/grade', protect, role('teacher', 'admin'), async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { score, feedback },
      { new: true }
    ).populate('student', 'name email').populate('assignment', 'title maxScore');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get submissions for an assignment (teacher view)
router.get('/assignment/:assignmentId', protect, role('teacher', 'admin'), async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email');
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Student's own submissions
router.get('/my/all', protect, role('student'), async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('assignment', 'title deadline maxScore');
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Student score summary per session
router.get('/my/scores/:sessionId', protect, role('student'), async (req, res) => {
  try {
    const Assignment = require('../models/Assignment');
    const assignments = await Assignment.find({ session: req.params.sessionId });
    const assignmentIds = assignments.map(a => a._id);
    const submissions = await Submission.find({
      student: req.user._id,
      assignment: { $in: assignmentIds }
    }).populate('assignment', 'title deadline maxScore');

    const result = assignments.map(a => {
      const sub = submissions.find(s => s.assignment._id.toString() === a._id.toString());
      return {
        assignment: { id: a._id, title: a.title, deadline: a.deadline, maxScore: a.maxScore },
        submitted: !!sub,
        isLate: sub?.isLate || false,
        score: sub?.score ?? (new Date() > new Date(a.deadline) ? 0 : null),
        feedback: sub?.feedback || null,
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
