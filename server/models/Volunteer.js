const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    location: {
      address: {
        type: String,
        default: ''
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
    availability: {
      type: Boolean,
      default: true
    },
    vehicleType: {
      type: String,
      enum: ['BIKE', 'SCOOTER', 'CAR', 'VAN', 'ON_FOOT', 'OTHER'],
      default: 'BIKE'
    },
    capacity: {
      type: Number,
      default: 20,
      min: [1, 'Capacity must be at least 1 unit']
    }
  },
  {
    timestamps: true
  }
);

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

module.exports = Volunteer;
