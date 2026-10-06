const User = require('../models/User');
const NGO = require('../models/NGO');
const Volunteer = require('../models/Volunteer');
const Donation = require('../models/Donation');

// @desc    Get all users with role filtering
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role.toUpperCase();

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('[Admin Get Users Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching users'
    });
  }
};

// @desc    Verify or reject an NGO
// @route   PUT /api/admin/ngos/:id/verify
// @access  Private (Admin only)
const verifyNGO = async (req, res) => {
  try {
    const { status = 'VERIFIED' } = req.body;

    if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status'
      });
    }

    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    ngo.verificationStatus = status;
    await ngo.save();

    return res.status(200).json({
      success: true,
      message: `NGO verification status updated to ${status}`,
      ngo
    });
  } catch (error) {
    console.error('[Admin Verify NGO Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating NGO verification'
    });
  }
};

// @desc    Get all donations for admin monitor
// @route   GET /api/admin/donations
// @access  Private (Admin only)
const getAdminDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donorId', 'name email phone location')
      .populate('acceptedBy')
      .populate('assignedVolunteer')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error) {
    console.error('[Admin Get Donations Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching all donations'
    });
  }
};

// @desc    Get complete administrative platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'DONOR' });
    const totalNGOs = await User.countDocuments({ role: 'NGO' });
    const totalVolunteers = await User.countDocuments({ role: 'VOLUNTEER' });

    const totalDonations = await Donation.countDocuments();
    const activeDonations = await Donation.countDocuments({
      status: { $in: ['AVAILABLE', 'ACCEPTED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] }
    });
    const completedDonations = await Donation.countDocuments({ status: 'DELIVERED' });

    const mealsResult = await Donation.aggregate([
      { $group: { _id: null, totalMeals: { $sum: '$quantity' } } }
    ]);
    const totalMeals = mealsResult.length > 0 ? mealsResult[0].totalMeals : 0;

    const pendingNGOs = await NGO.countDocuments({ verificationStatus: 'PENDING' });

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalDonors,
        totalNGOs,
        totalVolunteers,
        totalDonations,
        activeDonations,
        completedDonations,
        totalMeals,
        pendingNGOs
      }
    });
  } catch (error) {
    console.error('[Admin Get Stats Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching admin statistics'
    });
  }
};

module.exports = {
  getAllUsers,
  verifyNGO,
  getAdminDonations,
  getAdminStats
};
