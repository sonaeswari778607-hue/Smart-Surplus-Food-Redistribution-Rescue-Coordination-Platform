const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const NGO = require('./models/NGO');
const Volunteer = require('./models/Volunteer');
const Donation = require('./models/Donation');
const Assignment = require('./models/Assignment');

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed] Connected to MongoDB:', process.env.MONGO_URI);

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      NGO.deleteMany({}),
      Volunteer.deleteMany({}),
      Donation.deleteMany({}),
      Assignment.deleteMany({})
    ]);
    console.log('[Seed] Cleared old collections.');

    // 1. Create Users
    console.log('[Seed] Creating demo users...');
    const donor1 = await User.create({
      name: 'Green Leaf Restaurant',
      email: 'donor@greenleaf.com',
      password: 'password123',
      phone: '9876543210',
      role: 'DONOR',
      location: {
        address: '45 MG Road, Bangalore Central',
        latitude: 12.9716,
        longitude: 77.5946
      }
    });

    const donor2 = await User.create({
      name: 'College Campus Canteen',
      email: 'donor@canteen.edu',
      password: 'password123',
      phone: '9876543211',
      role: 'DONOR',
      location: {
        address: '8th Cross, Malleshwaram, Bangalore',
        latitude: 13.0031,
        longitude: 77.5643
      }
    });

    const ngoUser1 = await User.create({
      name: 'Asha Community Shelter',
      email: 'ngo@asha.org',
      password: 'password123',
      phone: '9876500001',
      role: 'NGO',
      location: {
        address: '12 Indiranagar 100ft Road, Bangalore',
        latitude: 12.9784,
        longitude: 77.6408
      }
    });

    const ngoUser2 = await User.create({
      name: 'Food For All Foundation',
      email: 'ngo@feedall.org',
      password: 'password123',
      phone: '9876500002',
      role: 'NGO',
      location: {
        address: 'ITPL Main Road, Whitefield, Bangalore',
        latitude: 12.9698,
        longitude: 77.7499
      }
    });

    const volUser1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@volunteer.org',
      password: 'password123',
      phone: '9876599999',
      role: 'VOLUNTEER',
      location: {
        address: '5th Block Koramangala, Bangalore',
        latitude: 12.9352,
        longitude: 77.6245
      }
    });

    const volUser2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@volunteer.org',
      password: 'password123',
      phone: '9876588888',
      role: 'VOLUNTEER',
      location: {
        address: 'Sector 2, HSR Layout, Bangalore',
        latitude: 12.9121,
        longitude: 77.6446
      }
    });

    const admin = await User.create({
      name: 'Platform Administrator',
      email: 'admin@foodrescue.org',
      password: 'adminpassword123',
      phone: '9800000000',
      role: 'ADMIN',
      location: {
        address: 'Headquarters, MG Road, Bangalore',
        latitude: 12.9750,
        longitude: 77.6000
      }
    });

    // 2. Create NGO Profiles
    const ngo1 = await NGO.create({
      userId: ngoUser1._id,
      organizationName: 'Asha Child & Hunger Relief Foundation',
      address: ngoUser1.location.address,
      phone: ngoUser1.phone,
      location: {
        latitude: ngoUser1.location.latitude,
        longitude: ngoUser1.location.longitude
      },
      capacity: 100,
      verificationStatus: 'VERIFIED'
    });

    const ngo2 = await NGO.create({
      userId: ngoUser2._id,
      organizationName: 'Food For All Community Care',
      address: ngoUser2.location.address,
      phone: ngoUser2.phone,
      location: {
        latitude: ngoUser2.location.latitude,
        longitude: ngoUser2.location.longitude
      },
      capacity: 60,
      verificationStatus: 'PENDING'
    });

    // 3. Create Volunteer Profiles
    const vol1 = await Volunteer.create({
      userId: volUser1._id,
      location: volUser1.location,
      availability: true,
      vehicleType: 'SCOOTER',
      capacity: 40
    });

    const vol2 = await Volunteer.create({
      userId: volUser2._id,
      location: volUser2.location,
      availability: true,
      vehicleType: 'CAR',
      capacity: 80
    });

    // 4. Create Donations across different workflow stages
    console.log('[Seed] Creating demo donations across workflow stages...');
    const now = Date.now();

    // 4.1 AVAILABLE Donation 1
    await Donation.create({
      donorId: donor1._id,
      foodName: 'Royal Vegetable Biryani & Raita',
      category: 'Cooked Meals',
      quantity: 50,
      unit: 'Packets',
      foodType: 'Veg',
      preparedTime: '1:00 PM',
      pickupDeadline: new Date(now + 4 * 3600 * 1000), // 4h future
      pickupLocation: donor1.location,
      description: 'Hygienically packed surplus meals from lunch buffet.',
      status: 'AVAILABLE'
    });

    // 4.2 AVAILABLE Donation 2
    await Donation.create({
      donorId: donor2._id,
      foodName: 'Fresh Whole Wheat Bread & Buns',
      category: 'Bakery & Bread',
      quantity: 35,
      unit: 'Boxes',
      foodType: 'Veg',
      preparedTime: '10:00 AM',
      pickupDeadline: new Date(now + 6 * 3600 * 1000), // 6h future
      pickupLocation: donor2.location,
      description: 'Surplus artisanal loaves baked this morning.',
      status: 'AVAILABLE'
    });

    // 4.3 ACCEPTED Donation (Claimed by NGO1, ready for volunteer pickup)
    const donAccepted = await Donation.create({
      donorId: donor1._id,
      foodName: 'Paneer Butter Masala & Rotis',
      category: 'Cooked Meals',
      quantity: 40,
      unit: 'Packets',
      foodType: 'Veg',
      preparedTime: '12:30 PM',
      pickupDeadline: new Date(now + 3 * 3600 * 1000),
      pickupLocation: donor1.location,
      description: 'Catered corporate lunch surplus, insulated boxes.',
      status: 'ACCEPTED',
      acceptedBy: ngo1._id
    });

    await Assignment.create({
      donationId: donAccepted._id,
      ngoId: ngo1._id,
      status: 'ASSIGNED',
      assignedAt: new Date(now - 1800 * 1000)
    });

    // 4.4 PICKED_UP / IN TRANSIT Donation (Claimed by NGO1, Rahul is delivering)
    const donTransit = await Donation.create({
      donorId: donor2._id,
      foodName: 'Seasonal Fruit Assortment Boxes',
      category: 'Fruits & Vegetables',
      quantity: 30,
      unit: 'Boxes',
      foodType: 'Veg',
      preparedTime: '9:00 AM',
      pickupDeadline: new Date(now + 2 * 3600 * 1000),
      pickupLocation: donor2.location,
      description: 'Apples, oranges, and bananas from campus breakfast.',
      status: 'OUT_FOR_DELIVERY',
      acceptedBy: ngo1._id,
      assignedVolunteer: vol1._id
    });

    await Assignment.create({
      donationId: donTransit._id,
      ngoId: ngo1._id,
      volunteerId: vol1._id,
      status: 'OUT_FOR_DELIVERY',
      assignedAt: new Date(now - 3600 * 1000),
      pickupTime: new Date(now - 1200 * 1000)
    });

    // 4.5 DELIVERED / COMPLETED Donation
    const donDelivered = await Donation.create({
      donorId: donor1._id,
      foodName: 'Dal Makhani, Jeera Rice & Gulab Jamun',
      category: 'Cooked Meals',
      quantity: 65,
      unit: 'Packets',
      foodType: 'Veg',
      preparedTime: 'Yesterday evening',
      pickupDeadline: new Date(now - 12 * 3600 * 1000),
      pickupLocation: donor1.location,
      description: 'Dinner banquet redistribution.',
      status: 'DELIVERED',
      acceptedBy: ngo1._id,
      assignedVolunteer: vol1._id
    });

    await Assignment.create({
      donationId: donDelivered._id,
      ngoId: ngo1._id,
      volunteerId: vol1._id,
      status: 'DELIVERED',
      assignedAt: new Date(now - 16 * 3600 * 1000),
      pickupTime: new Date(now - 14 * 3600 * 1000),
      deliveryTime: new Date(now - 13 * 3600 * 1000)
    });

    console.log('[Seed] ✓ Database successfully seeded with 7 Users, 2 NGOs, 2 Volunteers, and 5 Donations!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
}

seedData();
