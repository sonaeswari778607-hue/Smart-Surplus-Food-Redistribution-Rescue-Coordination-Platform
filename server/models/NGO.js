const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    organizationName: {
      type: String,
      required: [true, 'Please enter organization name'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Please provide organization address']
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone number']
    },
    location: {
      latitude: {
        type: Number,
        default: 0
      },
      longitude: {
        type: Number,
        default: 0
      }
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide distribution capacity in meals'],
      default: 50,
      min: [1, 'Capacity must be at least 1 meal']
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING'
    }
  },
  {
    timestamps: true
  }
);

const NGO = mongoose.model('NGO', ngoSchema);

module.exports = NGO;
