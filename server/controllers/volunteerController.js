const Volunteer = require('../models/Volunteer');
const Donation = require('../models/Donation');
const Assignment = require('../models/Assignment');
const { scoreVolunteerForTask } = require('../services/matchingService');

// @desc    Get all volunteers
// @route   GET /api/volunteers
// @access  Public / Admin
const getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: volunteers.length,
      volunteers
    });
  } catch (error) {
    console.error('[Get Volunteers Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching volunteers'
    });
  }
};

// @desc    Get single volunteer profile by ID or current logged in
// @route   GET /api/volunteers/:id
// @access  Private
const getVolunteerById = async (req, res) => {
  try {
    let volunteer;
    if (req.params.id === 'me') {
      volunteer = await Volunteer.findOne({ userId: req.user._id }).populate('userId', 'name email phone');
    } else {
      volunteer = await Volunteer.findById(req.params.id).populate('userId', 'name email phone');
    }

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      volunteer
    });
  } catch (error) {
    console.error('[Get Volunteer Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching volunteer'
    });
  }
};

// @desc    Update volunteer profile & availability
// @route   PUT /api/volunteers/:id
// @access  Private (Volunteer or Admin)
const updateVolunteerProfile = async (req, res) => {
  try {
    const { availability, vehicleType, capacity, location } = req.body;
    let volunteer;

    if (req.params.id === 'me') {
      volunteer = await Volunteer.findOne({ userId: req.user._id });
    } else {
      volunteer = await Volunteer.findById(req.params.id);
    }

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer record not found'
      });
    }

    // Ownership check
    if (volunteer.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this volunteer profile'
      });
    }

    if (availability !== undefined) volunteer.availability = Boolean(availability);
    if (vehicleType) volunteer.vehicleType = vehicleType;
    if (capacity) volunteer.capacity = Number(capacity);
    if (location) {
      if (location.address) volunteer.location.address = location.address;
      if (location.latitude !== undefined) volunteer.location.latitude = Number(location.latitude);
      if (location.longitude !== undefined) volunteer.location.longitude = Number(location.longitude);
    }

    await volunteer.save();

    return res.status(200).json({
      success: true,
      message: 'Volunteer profile updated successfully',
      volunteer
    });
  } catch (error) {
    console.error('[Update Volunteer Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating volunteer profile'
    });
  }
};

// @desc    Get available pickup tasks for volunteers (status: ACCEPTED by NGO but not yet assigned to volunteer)
// @route   GET /api/volunteers/tasks/available
// @access  Private (Volunteer)
const getAvailableTasks = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ userId: req.user._id });

    // Donations that are accepted by an NGO and waiting for a volunteer
    const donations = await Donation.find({
      status: 'ACCEPTED',
      assignedVolunteer: null
    })
      .populate('donorId', 'name phone email location')
      .populate('acceptedBy')
      .sort({ pickupDeadline: 1 });

    let scoredTasks = donations;

    if (volunteer) {
      scoredTasks = donations.map((donation) => {
        const scoreData = scoreVolunteerForTask(volunteer, donation);
        return {
          ...donation.toObject(),
          matchScore: scoreData.score,
          distanceKm: scoreData.distanceKm
        };
      });

      scoredTasks.sort((a, b) => b.matchScore - a.matchScore);
    }

    return res.status(200).json({
      success: true,
      count: scoredTasks.length,
      tasks: scoredTasks
    });
  } catch (error) {
    console.error('[Get Available Tasks Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching available tasks'
    });
  }
};

// @desc    Get tasks currently or previously assigned to logged-in volunteer
// @route   GET /api/volunteers/tasks/my
// @access  Private (Volunteer)
const getMyTasks = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ userId: req.user._id });
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer profile not found'
      });
    }

    const donations = await Donation.find({
      assignedVolunteer: volunteer._id
    })
      .populate('donorId', 'name phone email location')
      .populate('acceptedBy')
      .sort({ updatedAt: -1 });

    const stats = {
      totalAssigned: donations.length,
      activePickups: donations.filter(d => ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(d.status)).length,
      completed: donations.filter(d => d.status === 'DELIVERED').length,
      mealsRescued: donations
        .filter(d => d.status === 'DELIVERED')
        .reduce((sum, d) => sum + (d.quantity || 0), 0)
    };

    return res.status(200).json({
      success: true,
      stats,
      tasks: donations
    });
  } catch (error) {
    console.error('[Get My Tasks Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching your tasks'
    });
  }
};

// @desc    Volunteer accepts a pickup task
// @route   POST /api/volunteers/tasks/accept/:donationId
// @access  Private (Volunteer)
const acceptTask = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ userId: req.user._id });
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer profile not found'
      });
    }

    const donation = await Donation.findById(req.params.donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation task not found'
      });
    }

    if (donation.status !== 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: `Task cannot be accepted. Current status is ${donation.status} (must be ACCEPTED)`
      });
    }

    if (donation.assignedVolunteer) {
      return res.status(400).json({
        success: false,
        message: 'This task has already been claimed by another volunteer'
      });
    }

    // Status transition: ACCEPTED -> ASSIGNED
    donation.status = 'ASSIGNED';
    donation.assignedVolunteer = volunteer._id;
    await donation.save();

    // Update assignment
    await Assignment.findOneAndUpdate(
      { donationId: donation._id },
      {
        volunteerId: volunteer._id,
        status: 'ASSIGNED',
        assignedAt: new Date()
      },
      { upsert: true, new: true }
    );

    const populated = await Donation.findById(donation._id)
      .populate('donorId', 'name phone email location')
      .populate('acceptedBy')
      .populate('assignedVolunteer');

    return res.status(200).json({
      success: true,
      message: 'Rescue task accepted successfully! Proceed to donor location for pickup.',
      donation: populated
    });
  } catch (error) {
    console.error('[Accept Task Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error accepting rescue task'
    });
  }
};

// @desc    Update pickup and delivery workflow status (Strict status validation)
// @route   PUT /api/volunteers/tasks/status/:donationId
// @access  Private (Volunteer)
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const volunteer = await Volunteer.findOne({ userId: req.user._id });

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer profile not found'
      });
    }

    const donation = await Donation.findById(req.params.donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Ownership check
    if (
      (!donation.assignedVolunteer ||
        donation.assignedVolunteer.toString() !== volunteer._id.toString()) &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not the assigned volunteer for this task'
      });
    }

    // Strict Status Flow Validation:
    // ASSIGNED -> PICKED_UP -> OUT_FOR_DELIVERY -> DELIVERED
    const validTransitions = {
      ASSIGNED: ['PICKED_UP', 'CANCELLED'],
      PICKED_UP: ['OUT_FOR_DELIVERY'],
      OUT_FOR_DELIVERY: ['DELIVERED']
    };

    const allowedNextStatuses = validTransitions[donation.status] || [];

    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${donation.status}' to '${status}'. Allowed next status: [${allowedNextStatuses.join(', ')}]`
      });
    }

    donation.status = status;
    await donation.save();

    // Update assignment record with timestamps
    const assignmentUpdate = { status };
    if (status === 'PICKED_UP') {
      assignmentUpdate.pickupTime = new Date();
    } else if (status === 'DELIVERED') {
      assignmentUpdate.deliveryTime = new Date();
    }

    const assignment = await Assignment.findOneAndUpdate(
      { donationId: donation._id },
      assignmentUpdate,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Status updated successfully to '${status}'`,
      donation,
      assignment
    });
  } catch (error) {
    console.error('[Update Task Status Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating task status'
    });
  }
};

module.exports = {
  getVolunteers,
  getVolunteerById,
  updateVolunteerProfile,
  getAvailableTasks,
  getMyTasks,
  acceptTask,
  updateTaskStatus
};
