const Donation = require('../models/Donation');
const NGO = require('../models/NGO');
const { scoreNGOForDonation } = require('../services/matchingService');

// @desc    Create a new food donation
// @route   POST /api/donations
// @access  Private (Donor only)
const createDonation = async (req, res) => {
  try {
    const {
      foodName,
      category,
      quantity,
      unit = 'Packets',
      foodType = 'Veg',
      preparedTime,
      pickupDeadline,
      pickupLocation,
      description
    } = req.body;

    // Field Validations
    if (!foodName || !foodName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Food name cannot be empty'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Food category is required'
      });
    }

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    if (!preparedTime) {
      return res.status(400).json({
        success: false,
        message: 'Prepared time is required'
      });
    }

    if (!pickupDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Pickup deadline is required'
      });
    }

    const deadlineDate = new Date(pickupDeadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pickup deadline date/time format'
      });
    }

    if (deadlineDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Pickup deadline must be set to a future time'
      });
    }

    const address = pickupLocation?.address || req.user.location?.address;
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Pickup location address is required'
      });
    }

    const donation = await Donation.create({
      donorId: req.user._id,
      foodName: foodName.trim(),
      category: category.trim(),
      quantity: Number(quantity),
      unit: unit.trim(),
      foodType,
      preparedTime,
      pickupDeadline: deadlineDate,
      pickupLocation: {
        address: address.trim(),
        latitude: Number(pickupLocation?.latitude || req.user.location?.latitude) || 0,
        longitude: Number(pickupLocation?.longitude || req.user.location?.longitude) || 0
      },
      description: description ? description.trim() : '',
      status: 'AVAILABLE'
    });

    const populated = await Donation.findById(donation._id).populate('donorId', 'name email phone');

    return res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      donation: populated
    });
  } catch (error) {
    console.error('[Create Donation Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating food donation'
    });
  }
};

// @desc    Get all donations with optional filtering
// @route   GET /api/donations
// @access  Public / Authenticated
const getAllDonations = async (req, res) => {
  try {
    const { status, category, foodType } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (category) {
      filter.category = category;
    }
    if (foodType) {
      filter.foodType = foodType;
    }

    const donations = await Donation.find(filter)
      .populate('donorId', 'name phone email location')
      .populate('acceptedBy')
      .populate('assignedVolunteer')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error) {
    console.error('[Get All Donations Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching donations'
    });
  }
};

// @desc    Get available donations suitable for NGOs (optionally scored by matching algorithm)
// @route   GET /api/donations/available
// @access  Private (NGO / All)
const getAvailableDonations = async (req, res) => {
  try {
    const now = new Date();
    // Exclude expired donations automatically
    const donations = await Donation.find({
      status: 'AVAILABLE',
      pickupDeadline: { $gt: now }
    })
      .populate('donorId', 'name phone email location')
      .sort({ pickupDeadline: 1 });

    // If an NGO user requested, enrich with smart matching score
    if (req.user && req.user.role === 'NGO') {
      const ngo = await NGO.findOne({ userId: req.user._id });
      if (ngo) {
        const scoredDonations = donations.map((donation) => {
          const match = scoreNGOForDonation(ngo, donation);
          return {
            ...donation.toObject(),
            matchScore: match.score,
            distanceKm: match.distanceKm
          };
        });

        // Sort by smart match score descending
        scoredDonations.sort((a, b) => b.matchScore - a.matchScore);

        return res.status(200).json({
          success: true,
          count: scoredDonations.length,
          donations: scoredDonations
        });
      }
    }

    return res.status(200).json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error) {
    console.error('[Get Available Donations Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching available donations'
    });
  }
};

// @desc    Get current donor's own donations
// @route   GET /api/donations/my
// @access  Private (Donor)
const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user._id })
      .populate('acceptedBy')
      .populate('assignedVolunteer')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error) {
    console.error('[Get My Donations Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching your donations'
    });
  }
};

// @desc    Get donor dashboard metrics
// @route   GET /api/donations/stats/donor
// @access  Private (Donor)
const getDonorStats = async (req, res) => {
  try {
    const donorId = req.user._id;

    const totalDonations = await Donation.countDocuments({ donorId });
    const activeDonations = await Donation.countDocuments({
      donorId,
      status: { $in: ['AVAILABLE', 'ACCEPTED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] }
    });
    const completedDonations = await Donation.countDocuments({
      donorId,
      status: 'DELIVERED'
    });

    // Total meals donated (sum of quantity)
    const result = await Donation.aggregate([
      { $match: { donorId } },
      { $group: { _id: null, totalMeals: { $sum: '$quantity' } } }
    ]);

    const mealsDonated = result.length > 0 ? result[0].totalMeals : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalDonations,
        activeDonations,
        completedDonations,
        mealsDonated
      }
    });
  } catch (error) {
    console.error('[Get Donor Stats Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching donor statistics'
    });
  }
};

// @desc    Get single donation by ID
// @route   GET /api/donations/:id
// @access  Private
const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donorId', 'name phone email location')
      .populate('acceptedBy')
      .populate('assignedVolunteer');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Food donation not found'
      });
    }

    return res.status(200).json({
      success: true,
      donation
    });
  } catch (error) {
    console.error('[Get Donation By ID Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching donation details'
    });
  }
};

// @desc    Update donation (while AVAILABLE)
// @route   PUT /api/donations/:id
// @access  Private (Donor / Owner only)
const updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Food donation not found'
      });
    }

    // Ownership check
    if (donation.donorId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this donation'
      });
    }

    // Status check
    if (donation.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit donation once status is ${donation.status}. Only AVAILABLE donations can be edited.`
      });
    }

    const {
      foodName,
      category,
      quantity,
      unit,
      foodType,
      preparedTime,
      pickupDeadline,
      pickupLocation,
      description
    } = req.body;

    if (foodName) donation.foodName = foodName.trim();
    if (category) donation.category = category.trim();
    if (quantity) donation.quantity = Number(quantity);
    if (unit) donation.unit = unit.trim();
    if (foodType) donation.foodType = foodType;
    if (preparedTime) donation.preparedTime = preparedTime;
    if (pickupDeadline) donation.pickupDeadline = new Date(pickupDeadline);
    if (description !== undefined) donation.description = description.trim();
    if (pickupLocation) {
      if (pickupLocation.address) donation.pickupLocation.address = pickupLocation.address;
      if (pickupLocation.latitude !== undefined) donation.pickupLocation.latitude = Number(pickupLocation.latitude);
      if (pickupLocation.longitude !== undefined) donation.pickupLocation.longitude = Number(pickupLocation.longitude);
    }

    await donation.save();

    return res.status(200).json({
      success: true,
      message: 'Donation updated successfully',
      donation
    });
  } catch (error) {
    console.error('[Update Donation Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating donation'
    });
  }
};

// @desc    Cancel donation (while AVAILABLE)
// @route   DELETE /api/donations/:id
// @access  Private (Donor / Owner only)
const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Food donation not found'
      });
    }

    // Ownership check
    if (donation.donorId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this donation'
      });
    }

    if (donation.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel donation in '${donation.status}' state.`
      });
    }

    donation.status = 'CANCELLED';
    await donation.save();

    return res.status(200).json({
      success: true,
      message: 'Donation cancelled successfully',
      donation
    });
  } catch (error) {
    console.error('[Cancel Donation Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error cancelling donation'
    });
  }
};

module.exports = {
  createDonation,
  getAllDonations,
  getAvailableDonations,
  getMyDonations,
  getDonorStats,
  getDonationById,
  updateDonation,
  deleteDonation
};
