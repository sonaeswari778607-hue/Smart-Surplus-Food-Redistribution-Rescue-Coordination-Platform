const express = require('express');
const router = express.Router();
const {
  getAssignments,
  getAssignmentById
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAssignments);
router.get('/:id', getAssignmentById);

module.exports = router;
