const API_URL = 'http://localhost:5000/api';

async function req(url, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

async function runE2ETest() {
  console.log('--- STARTING FULL END-TO-END WORKFLOW VERIFICATION ---');

  // 1. Donor Login
  console.log('\n[1] Logging in as Donor...');
  const donorRes = await req('/auth/login', 'POST', {
    email: 'donor@greenleaf.com',
    password: 'password123'
  });
  const donorToken = donorRes.token;
  console.log('✓ Donor logged in:', donorRes.user.name);

  // 2. Donor creates food donation
  console.log('\n[2] Donor creating food donation...');
  const futureDeadline = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours in future
  const donationRes = await req(
    '/donations',
    'POST',
    {
      foodName: 'Vegetable Biryani & Salan',
      category: 'Cooked Meals',
      quantity: 50,
      unit: 'Packets',
      foodType: 'Veg',
      preparedTime: '12:30 PM',
      pickupDeadline: futureDeadline.toISOString(),
      pickupLocation: {
        address: 'Green Leaf Restaurant, 45 MG Road, Bangalore',
        latitude: 12.9716,
        longitude: 77.5946
      },
      description: 'Freshly prepared surplus meals packaged in hygienic containers.'
    },
    donorToken
  );
  const donation = donationRes.donation;
  console.log(`✓ Donation created! ID: ${donation._id}, Status: ${donation.status}`);

  // 3. NGO Login & View Available Donations
  console.log('\n[3] Logging in as NGO...');
  const ngoRes = await req('/auth/login', 'POST', {
    email: 'ngo@asha.org',
    password: 'password123'
  });
  const ngoToken = ngoRes.token;
  console.log('✓ NGO logged in:', ngoRes.user.name);

  console.log('[3.1] NGO viewing available donations (Smart Matching)...');
  const availableRes = await req('/donations/available', 'GET', null, ngoToken);
  console.log(`✓ Available donations found: ${availableRes.count}`);
  const targetDonation = availableRes.donations.find(d => d._id === donation._id);
  console.log(`✓ Smart Match Score for this donation: ${targetDonation?.matchScore}% (Distance: ${targetDonation?.distanceKm} km)`);

  // 4. NGO accepts donation
  console.log('\n[4] NGO accepting donation...');
  const acceptRes = await req(`/ngos/accept/${donation._id}`, 'POST', {}, ngoToken);
  console.log(`✓ Donation accepted! New Status: ${acceptRes.donation.status}`);

  // 5. Volunteer Login & View Available Tasks
  console.log('\n[5] Logging in as Volunteer...');
  const volRes = await req('/auth/login', 'POST', {
    email: 'rahul@volunteer.org',
    password: 'password123'
  });
  const volToken = volRes.token;
  console.log('✓ Volunteer logged in:', volRes.user.name);

  const tasksRes = await req('/volunteers/tasks/available', 'GET', null, volToken);
  console.log(`✓ Available pickup tasks for volunteer: ${tasksRes.count}`);

  // 6. Volunteer accepts task
  console.log('\n[6] Volunteer accepting pickup task...');
  const acceptTaskRes = await req(`/volunteers/tasks/accept/${donation._id}`, 'POST', {}, volToken);
  console.log(`✓ Task claimed! New Status: ${acceptTaskRes.donation.status}`);

  // 7. Volunteer marks as PICKED_UP
  console.log('\n[7] Volunteer updating status to PICKED_UP...');
  const pickedUpRes = await req(
    `/volunteers/tasks/status/${donation._id}`,
    'PUT',
    { status: 'PICKED_UP' },
    volToken
  );
  console.log(`✓ Status updated: ${pickedUpRes.donation.status}`);

  // 8. Volunteer marks as OUT_FOR_DELIVERY
  console.log('\n[8] Volunteer updating status to OUT_FOR_DELIVERY...');
  const outDeliveryRes = await req(
    `/volunteers/tasks/status/${donation._id}`,
    'PUT',
    { status: 'OUT_FOR_DELIVERY' },
    volToken
  );
  console.log(`✓ Status updated: ${outDeliveryRes.donation.status}`);

  // 9. Volunteer marks as DELIVERED
  console.log('\n[9] Volunteer updating status to DELIVERED...');
  const deliveredRes = await req(
    `/volunteers/tasks/status/${donation._id}`,
    'PUT',
    { status: 'DELIVERED' },
    volToken
  );
  console.log(`✓ Status updated: ${deliveredRes.donation.status} (Donation Completed!)`);

  // 10. Admin checks statistics and NGO status
  console.log('\n[10] Admin logging in to verify platform stats...');
  const adminRes = await req('/auth/login', 'POST', {
    email: 'admin@foodrescue.org',
    password: 'adminpassword123'
  });
  const adminToken = adminRes.token;

  const statsRes = await req('/admin/stats', 'GET', null, adminToken);
  console.log('✓ Platform Statistics:', statsRes.stats);

  console.log('\n🎉 ALL 10 STEPS OF THE FOODRESCUE LIFECYCLE COMPLETED SUCCESSFULLY!');
}

runE2ETest().catch((err) => {
  console.error('❌ E2E Test failed:', err.message);
  process.exit(1);
});
