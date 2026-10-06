const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      required: true
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer',
      default: null
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    pickupTime: {
      type: Date,
      default: null
    },
    deliveryTime: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: [
        'ASSIGNED',
        'PICKED_UP',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED'
      ],
      default: 'ASSIGNED'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
