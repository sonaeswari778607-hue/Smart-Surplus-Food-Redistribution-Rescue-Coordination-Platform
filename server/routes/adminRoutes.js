const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  verifyNGO,
  getAdminDonations,
  getAdminStats
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/users', getAllUsers);
router.get('/donations', getAdminDonations);
router.get('/stats', getAdminStats);
router.put('/ngos/:id/verify', verifyNGO);

module.exports = router;
