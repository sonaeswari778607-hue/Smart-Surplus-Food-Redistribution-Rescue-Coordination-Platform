/**
 * Smart Matching Service for FoodRescue
 * Calculates distance, capacity fitness, and deadline urgency without external AI/ML dependencies.
 */

// Haversine formula to calculate great-circle distance between two coordinates in kilometers
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 5; // default fallback 5km

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

/**
 * Score an NGO against a specific food donation
 * Factors:
 * 1. Distance (Closer = Higher score, max 40 points)
 * 2. Capacity Match (Can the NGO take this quantity? max 35 points)
 * 3. Verification Status (Verified NGOs get 25 bonus points)
 */
const scoreNGOForDonation = (ngo, donation) => {
  let score = 0;

  // 1. Distance score (up to 40 pts)
  const dist = calculateDistanceKm(
    ngo.location?.latitude,
    ngo.location?.longitude,
    donation.pickupLocation?.latitude,
    donation.pickupLocation?.longitude
  );

  if (dist <= 2) {
    score += 40;
  } else if (dist <= 5) {
    score += 30;
  } else if (dist <= 10) {
    score += 20;
  } else if (dist <= 20) {
    score += 10;
  } else {
    score += 5;
  }

  // 2. Capacity match (up to 35 pts)
  const ngoCap = ngo.capacity || 50;
  const foodQty = donation.quantity || 1;

  if (ngoCap >= foodQty) {
    // Exact or comfortable capacity fit
    const ratio = foodQty / ngoCap;
    if (ratio >= 0.5 && ratio <= 1.0) {
      score += 35; // Perfect utilization
    } else {
      score += 25; // Can accommodate with leftover capacity
    }
  } else {
    // Under-capacity (can partially take)
    score += 10;
  }

  // 3. Verification status (up to 25 pts)
  if (ngo.verificationStatus === 'VERIFIED') {
    score += 25;
  } else if (ngo.verificationStatus === 'PENDING') {
    score += 10;
  }

  return {
    score: Math.min(score, 100),
    distanceKm: dist
  };
};

/**
 * Score a Volunteer against a specific food pickup task
 * Factors:
 * 1. Distance to pickup location (max 40 pts)
 * 2. Availability (30 pts)
 * 3. Vehicle Capacity (30 pts)
 */
const scoreVolunteerForTask = (volunteer, donation) => {
  let score = 0;

  // 1. Distance score
  const dist = calculateDistanceKm(
    volunteer.location?.latitude,
    volunteer.location?.longitude,
    donation.pickupLocation?.latitude,
    donation.pickupLocation?.longitude
  );

  if (dist <= 2) {
    score += 40;
  } else if (dist <= 5) {
    score += 30;
  } else if (dist <= 10) {
    score += 20;
  } else {
    score += 10;
  }

  // 2. Availability
  if (volunteer.availability) {
    score += 30;
  }

  // 3. Vehicle Capacity
  const volCap = volunteer.capacity || 20;
  if (volCap >= donation.quantity) {
    score += 30;
  } else {
    score += 15;
  }

  return {
    score: Math.min(score, 100),
    distanceKm: dist
  };
};

module.exports = {
  calculateDistanceKm,
  scoreNGOForDonation,
  scoreVolunteerForTask
};
