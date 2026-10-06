const Assignment = require('../models/Assignment');

// @desc    Get assignments
// @route   GET /api/assignments
// @access  Private
const getAssignments = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'VOLUNTEER') {
      const Volunteer = require('../models/Volunteer');
      const vol = await Volunteer.findOne({ userId: req.user._id });
      if (vol) filter.volunteerId = vol._id;
    } else if (req.user.role === 'NGO') {
      const NGO = require('../models/NGO');
      const ngo = await NGO.findOne({ userId: req.user._id });
      if (ngo) filter.ngoId = ngo._id;
    }

    const assignments = await Assignment.find(filter)
      .populate({
        path: 'donationId',
        populate: { path: 'donorId', select: 'name phone email location' }
      })
      .populate('ngoId')
      .populate({
        path: 'volunteerId',
        populate: { path: 'userId', select: 'name phone email' }
      })
      .sort({ assignedAt: -1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    console.error('[Get Assignments Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching assignments'
    });
  }
};

// @desc    Get single assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate({
        path: 'donationId',
        populate: { path: 'donorId', select: 'name phone email location' }
      })
      .populate('ngoId')
      .populate('volunteerId');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    return res.status(200).json({
      success: true,
      assignment
    });
  } catch (error) {
    console.error('[Get Assignment By ID Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching assignment'
    });
  }
};

module.exports = {
  getAssignments,
  getAssignmentById
};
