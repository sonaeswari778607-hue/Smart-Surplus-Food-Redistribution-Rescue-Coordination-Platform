const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    foodName: {
      type: String,
      required: [true, 'Please enter food name'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please select a food category'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Please enter quantity'],
      min: [1, 'Quantity must be at least 1']
    },
    unit: {
      type: String,
      default: 'Packets',
      trim: true
    },
    foodType: {
      type: String,
      enum: ['Veg', 'Non-Veg'],
      default: 'Veg'
    },
    preparedTime: {
      type: String,
      required: [true, 'Please specify preparation time']
    },
    pickupDeadline: {
      type: Date,
      required: [true, 'Please specify pickup deadline']
    },
    pickupLocation: {
      address: {
        type: String,
        required: [true, 'Please provide pickup address']
      },
      latitude: {
        type: Number,
        default: 0
      },
      longitude: {
        type: Number,
        default: 0
      }
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: [
          'AVAILABLE',
          'ACCEPTED',
          'ASSIGNED',
          'PICKED_UP',
          'OUT_FOR_DELIVERY',
          'DELIVERED',
          'CANCELLED',
          'EXPIRED'
        ],
        message: '{VALUE} is not a valid donation status'
      },
      default: 'AVAILABLE'
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      default: null
    },
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Virtual index for searching active available donations
donationSchema.index({ status: 1, pickupDeadline: 1 });

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;
