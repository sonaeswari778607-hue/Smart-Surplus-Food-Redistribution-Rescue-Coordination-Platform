const User = require('../models/User');
const NGO = require('../models/NGO');
const Volunteer = require('../models/Volunteer');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = 'DONOR',
      location = {},
      organizationName,
      capacity,
      vehicleType
    } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, phone'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address is already registered'
      });
    }

    // Create User document
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: role.toUpperCase(),
      location: {
        address: location.address || '',
        latitude: Number(location.latitude) || 0,
        longitude: Number(location.longitude) || 0
      }
    });

    // Create corresponding role profile document
    if (user.role === 'NGO') {
      await NGO.create({
        userId: user._id,
        organizationName: organizationName || `${user.name} Foundation`,
        address: location.address || 'Address pending update',
        phone: user.phone,
        location: {
          latitude: Number(location.latitude) || 0,
          longitude: Number(location.longitude) || 0
        },
        capacity: Number(capacity) || 50,
        verificationStatus: 'PENDING'
      });
    } else if (user.role === 'VOLUNTEER') {
      await Volunteer.create({
        userId: user._id,
        location: {
          address: location.address || '',
          latitude: Number(location.latitude) || 0,
          longitude: Number(location.longitude) || 0
        },
        availability: true,
        vehicleType: vehicleType || 'BIKE',
        capacity: Number(capacity) || 20
      });
    }

    // Generate JWT
    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location
      }
    });
  } catch (error) {
    console.error('[Registration Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during user registration'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Optional: fetch associated role profile details
    let profile = null;
    if (user.role === 'NGO') {
      profile = await NGO.findOne({ userId: user._id });
    } else if (user.role === 'VOLUNTEER') {
      profile = await Volunteer.findOne({ userId: user._id });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location
      },
      profile
    });
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    let profile = null;
    if (user.role === 'NGO') {
      profile = await NGO.findOne({ userId: user._id });
    } else if (user.role === 'VOLUNTEER') {
      profile = await Volunteer.findOne({ userId: user._id });
    }

    return res.status(200).json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    console.error('[GetMe Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user profile'
    });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, latitude, longitude } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address !== undefined) {
      user.location.address = address;
    }
    if (latitude !== undefined) {
      user.location.latitude = Number(latitude);
    }
    if (longitude !== undefined) {
      user.location.longitude = Number(longitude);
    }

    await user.save();

    // Also sync with NGO or Volunteer profile if needed
    if (user.role === 'NGO') {
      await NGO.findOneAndUpdate(
        { userId: user._id },
        {
          address: user.location.address,
          phone: user.phone,
          'location.latitude': user.location.latitude,
          'location.longitude': user.location.longitude
        }
      );
    } else if (user.role === 'VOLUNTEER') {
      await Volunteer.findOneAndUpdate(
        { userId: user._id },
        {
          'location.address': user.location.address,
          'location.latitude': user.location.latitude,
          'location.longitude': user.location.longitude
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location
      }
    });
  } catch (error) {
    console.error('[Update Profile Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile
};
