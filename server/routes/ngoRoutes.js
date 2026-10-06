const express = require('express');
const router = express.Router();
const {
  getNGOs,
  getNGOById,
  updateNGOProfile,
  acceptDonation,
  getMyAcceptedDonations,
  confirmDelivery
} = require('../controllers/ngoController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getNGOs);
router.get('/my/accepted', protect, authorize('NGO'), getMyAcceptedDonations);
router.get('/:id', protect, getNGOById);
router.put('/:id', protect, authorize('NGO', 'ADMIN'), updateNGOProfile);
router.post('/accept/:donationId', protect, authorize('NGO'), acceptDonation);
router.put('/confirm-delivery/:donationId', protect, authorize('NGO'), confirmDelivery);

module.exports = router;
