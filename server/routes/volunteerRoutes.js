const express = require('express');
const router = express.Router();
const {
  getVolunteers,
  getVolunteerById,
  updateVolunteerProfile,
  getAvailableTasks,
  getMyTasks,
  acceptTask,
  updateTaskStatus
} = require('../controllers/volunteerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getVolunteers);
router.get('/tasks/available', protect, authorize('VOLUNTEER'), getAvailableTasks);
router.get('/tasks/my', protect, authorize('VOLUNTEER'), getMyTasks);
router.get('/:id', protect, getVolunteerById);
router.put('/:id', protect, authorize('VOLUNTEER', 'ADMIN'), updateVolunteerProfile);
router.post('/tasks/accept/:donationId', protect, authorize('VOLUNTEER'), acceptTask);
router.put('/tasks/status/:donationId', protect, authorize('VOLUNTEER', 'ADMIN'), updateTaskStatus);

module.exports = router;
