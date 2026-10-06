const NGO = require('../models/NGO');
const Donation = require('../models/Donation');
const Assignment = require('../models/Assignment');

// @desc    Get all NGOs
// @route   GET /api/ngos
// @access  Public / Private
const getNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: ngos.length,
      ngos
    });
  } catch (error) {
    console.error('[Get NGOs Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching NGOs'
    });
  }
};

// @desc    Get single NGO profile by ID or for logged-in NGO
// @route   GET /api/ngos/:id
// @access  Private
const getNGOById = async (req, res) => {
  try {
    let ngo;
    if (req.params.id === 'me') {
      ngo = await NGO.findOne({ userId: req.user._id }).populate('userId', 'name email phone');
    } else {
      ngo = await NGO.findById(req.params.id).populate('userId', 'name email phone');
    }

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'NGO profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      ngo
    });
  } catch (error) {
    console.error('[Get NGO Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching NGO'
    });
  }
};

// @desc    Update NGO profile
// @route   PUT /api/ngos/:id
// @access  Private (NGO owner or Admin)
const updateNGOProfile = async (req, res) => {
  try {
    const { organizationName, address, phone, capacity, location } = req.body;
    let ngo;

    if (req.params.id === 'me') {
      ngo = await NGO.findOne({ userId: req.user._id });
    } else {
      ngo = await NGO.findById(req.params.id);
    }

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'NGO record not found'
      });
    }

    // Ownership check
    if (ngo.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this NGO profile'
      });
    }

    if (organizationName) ngo.organizationName = organizationName.trim();
    if (address) ngo.address = address.trim();
    if (phone) ngo.phone = phone.trim();
    if (capacity) ngo.capacity = Number(capacity);
    if (location) {
      if (location.latitude !== undefined) ngo.location.latitude = Number(location.latitude);
      if (location.longitude !== undefined) ngo.location.longitude = Number(location.longitude);
    }

    await ngo.save();

    return res.status(200).json({
      success: true,
      message: 'NGO profile updated successfully',
      ngo
    });
  } catch (error) {
    console.error('[Update NGO Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating NGO profile'
    });
  }
};

// @desc    NGO accepts an available food donation
// @route   POST /api/ngos/accept/:donationId
// @access  Private (NGO only)
const acceptDonation = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ userId: req.user._id });
    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'NGO profile not registered for this account'
      });
    }

    const donation = await Donation.findById(req.params.donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Must be in AVAILABLE status
    if (donation.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: `This donation is no longer available (Status: ${donation.status})`
      });
    }

    // Check if donation has expired
    if (new Date(donation.pickupDeadline) <= new Date()) {
      donation.status = 'EXPIRED';
      await donation.save();
      return res.status(400).json({
        success: false,
        message: 'This donation has expired and cannot be accepted'
      });
    }

    // Transition status: AVAILABLE -> ACCEPTED
    donation.status = 'ACCEPTED';
    donation.acceptedBy = ngo._id;
    await donation.save();

    // Create or update assignment record
    let assignment = await Assignment.findOne({ donationId: donation._id });
    if (!assignment) {
      assignment = await Assignment.create({
        donationId: donation._id,
        ngoId: ngo._id,
        status: 'ASSIGNED',
        assignedAt: new Date()
      });
    } else {
      assignment.ngoId = ngo._id;
      assignment.status = 'ASSIGNED';
      await assignment.save();
    }

    const populatedDonation = await Donation.findById(donation._id)
      .populate('donorId', 'name phone email location')
      .populate('acceptedBy');

    return res.status(200).json({
      success: true,
      message: 'Donation accepted successfully! Volunteer rescue coordination has started.',
      donation: populatedDonation,
      assignment
    });
  } catch (error) {
    console.error('[Accept Donation Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error accepting donation'
    });
  }
};

// @desc    Get donations accepted by current NGO
// @route   GET /api/ngos/my/accepted
// @access  Private (NGO only)
const getMyAcceptedDonations = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ userId: req.user._id });
    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'NGO profile not found'
      });
    }

    const donations = await Donation.find({ acceptedBy: ngo._id })
      .populate('donorId', 'name phone email location')
      .populate('assignedVolunteer')
      .sort({ updatedAt: -1 });

    const stats = {
      totalAccepted: donations.length,
      activeDeliveries: donations.filter(d => ['ACCEPTED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(d.status)).length,
      completed: donations.filter(d => d.status === 'DELIVERED').length,
      mealsReceived: donations
        .filter(d => d.status === 'DELIVERED')
        .reduce((sum, d) => sum + (d.quantity || 0), 0)
    };

    return res.status(200).json({
      success: true,
      stats,
      donations
    });
  } catch (error) {
    console.error('[Get My Accepted Donations Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching accepted donations'
    });
  }
};

// @desc    Confirm delivery received by NGO
// @route   PUT /api/ngos/confirm-delivery/:donationId
// @access  Private (NGO only)
const confirmDelivery = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ userId: req.user._id });
    const donation = await Donation.findById(req.params.donationId);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    if (donation.acceptedBy.toString() !== ngo._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not the designated recipient NGO for this donation'
      });
    }

    donation.status = 'DELIVERED';
    await donation.save();

    await Assignment.findOneAndUpdate(
      { donationId: donation._id },
      {
        status: 'DELIVERED',
        deliveryTime: new Date()
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Delivery confirmed successfully! Donation is now marked COMPLETED.',
      donation
    });
  } catch (error) {
    console.error('[Confirm Delivery Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error confirming delivery'
    });
  }
};

module.exports = {
  getNGOs,
  getNGOById,
  updateNGOProfile,
  acceptDonation,
  getMyAcceptedDonations,
  confirmDelivery
};
