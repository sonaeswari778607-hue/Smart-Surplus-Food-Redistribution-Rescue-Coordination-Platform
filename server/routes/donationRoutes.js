const express = require('express');
const router = express.Router();
const {
  createDonation,
  getAllDonations,
  getAvailableDonations,
  getMyDonations,
  getDonorStats,
  getDonationById,
  updateDonation,
  deleteDonation
} = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public / Authenticated read routes
router.get('/', getAllDonations);
router.get('/available', protect, getAvailableDonations);
router.get('/my', protect, authorize('DONOR'), getMyDonations);
router.get('/stats/donor', protect, authorize('DONOR'), getDonorStats);
router.get('/:id', protect, getDonationById);

// Donor actions
router.post('/', protect, authorize('DONOR'), createDonation);
router.put('/:id', protect, authorize('DONOR', 'ADMIN'), updateDonation);
router.delete('/:id', protect, authorize('DONOR', 'ADMIN'), deleteDonation);

module.exports = router;
