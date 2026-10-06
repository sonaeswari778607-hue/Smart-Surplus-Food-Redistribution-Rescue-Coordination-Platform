import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const NGODashboard = () => {
  const { user, logout } = useAuth();

  const [availableDonations, setAvailableDonations] = useState([]);
  const [acceptedDonations, setAcceptedDonations] = useState([]);
  const [stats, setStats] = useState({
    totalAccepted: 0,
    activeDeliveries: 0,
    completed: 0,
    mealsReceived: 0
  });

  const [activeTab, setActiveTab] = useState('AVAILABLE'); // AVAILABLE, ACCEPTED
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [availRes, myAcceptedRes] = await Promise.all([
        API.get('/donations/available'),
        API.get('/ngos/my/accepted')
      ]);

      if (availRes.data.success) {
        setAvailableDonations(availRes.data.donations);
      }
      if (myAcceptedRes.data.success) {
        setAcceptedDonations(myAcceptedRes.data.donations);
        if (myAcceptedRes.data.stats) {
          setStats(myAcceptedRes.data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching NGO data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptDonation = async (donationId) => {
    try {
      const res = await API.post(`/ngos/accept/${donationId}`);
      if (res.data.success) {
        setActionMsg('Donation accepted successfully! Nearby volunteers are being assigned.');
        fetchData();
        setActiveTab('ACCEPTED');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept donation');
    }
  };

  const handleConfirmDelivery = async (donationId) => {
    try {
      const res = await API.put(`/ngos/confirm-delivery/${donationId}`);
      if (res.data.success) {
        setActionMsg('Delivery confirmed! Food donation marked as COMPLETED.');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm delivery');
    }
  };

  const sidebarLinks = [
    { label: 'Overview', path: '/ngo', icon: '📊' },
    { label: 'Interactive Map', path: '/map', icon: '🗺️' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar role="NGO" onLogout={logout} />
      <div style={{ display: 'flex' }}>
        <Sidebar role="NGO" links={sidebarLinks} />

        <main style={{ flex: 1, padding: '32px', maxWidth: '1200px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                NGO Community Hub
              </h1>
              <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
                Welcome, <strong>{user?.name}</strong> • Surplus Food Rescue & Redistribution
              </p>
            </div>
          </div>

          {actionMsg && (
            <div style={{
              background: '#dcfce7',
              color: '#15803d',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontWeight: '500',
              border: '1px solid #bbf7d0'
            }}>
              ✓ {actionMsg}
            </div>
          )}

          {/* Metric Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <StatCard title="Available to Claim" value={availableDonations.length} icon="🍲" color="#2563eb" />
            <StatCard title="Accepted by Us" value={stats.totalAccepted} icon="📥" color="#16a34a" />
            <StatCard title="In Transit Deliveries" value={stats.activeDeliveries} icon="🚚" color="#f59e0b" />
            <StatCard title="Meals Distributed" value={stats.mealsReceived} icon="🤝" color="#059669" />
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('AVAILABLE')}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'AVAILABLE' ? '#16a34a' : '#e2e8f0',
                color: activeTab === 'AVAILABLE' ? '#ffffff' : '#475569',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              🍲 Available Surplus Food ({availableDonations.length})
            </button>
            <button
              onClick={() => setActiveTab('ACCEPTED')}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'ACCEPTED' ? '#16a34a' : '#e2e8f0',
                color: activeTab === 'ACCEPTED' ? '#ffffff' : '#475569',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              📦 Our Accepted Claims ({acceptedDonations.length})
            </button>
          </div>

          {/* Content Area */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Loading food donations...
            </div>
          ) : activeTab === 'AVAILABLE' ? (
            <div>
              {availableDonations.length === 0 ? (
                <div style={{
                  background: '#ffffff',
                  padding: '50px 20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '40px' }}>✨</span>
                  <h4 style={{ margin: '12px 0 6px 0', color: '#334155' }}>No available surplus right now</h4>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                    When restaurants or canteens post donations, they will appear here with smart proximity matching.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '20px'
                }}>
                  {availableDonations.map((d) => (
                    <div
                      key={d._id}
                      style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0',
                        padding: '24px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        {/* Smart Match Header */}
                        {d.matchScore && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#f0fdf4',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            marginBottom: '14px',
                            border: '1px solid #bbf7d0'
                          }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#166534' }}>
                              ⚡ {d.matchScore}% Smart Match
                            </span>
                            <span style={{ fontSize: '12px', color: '#4b5563' }}>
                              📍 {d.distanceKm} km away
                            </span>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <h3 style={{ margin: 0, fontSize: '19px', color: '#0f172a' }}>{d.foodName}</h3>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background: d.foodType === 'Veg' ? '#dcfce7' : '#fee2e2',
                            color: d.foodType === 'Veg' ? '#166534' : '#991b1b'
                          }}>
                            {d.foodType}
                          </span>
                        </div>

                        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>
                          Category: <strong>{d.category}</strong>
                        </p>

                        <div style={{
                          background: '#f8fafc',
                          padding: '12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#334155',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <div>📦 <strong>Quantity:</strong> {d.quantity} {d.unit}</div>
                          <div>📍 <strong>Pickup:</strong> {d.pickupLocation?.address || 'Donor address'}</div>
                          <div>⏳ <strong>Must Pickup Before:</strong> {new Date(d.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          <div>🏬 <strong>Donor:</strong> {d.donorId?.name || 'Verified Donor'}</div>
                        </div>

                        {d.description && (
                          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px', fontStyle: 'italic' }}>
                            "{d.description}"
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleAcceptDonation(d._id)}
                        style={{
                          marginTop: '20px',
                          padding: '12px',
                          background: '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(22,163,74,0.2)'
                        }}
                      >
                        ✓ Accept & Claim Donation
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Accepted Donations Tracker */}
              {acceptedDonations.length === 0 ? (
                <div style={{
                  background: '#ffffff',
                  padding: '50px 20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <h4 style={{ margin: '0 0 6px 0', color: '#334155' }}>No accepted donations yet</h4>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                    Switch to the "Available Surplus Food" tab to claim food for your community.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {acceptedDonations.map((d) => (
                    <div
                      key={d._id}
                      style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <h4 style={{ margin: 0, fontSize: '18px' }}>{d.foodName}</h4>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background: d.status === 'DELIVERED' ? '#dcfce7' : '#fef3c7',
                            color: d.status === 'DELIVERED' ? '#15803d' : '#b45309'
                          }}>
                            {d.status === 'DELIVERED' ? 'COMPLETED' : d.status}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#475569' }}>
                          Quantity: <strong>{d.quantity} {d.unit}</strong> • Donor: {d.donorId?.name}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                          Driver: {d.assignedVolunteer ? '🛵 Assigned & Active' : '⏳ Awaiting Volunteer Acceptance'}
                        </p>
                      </div>

                      <div>
                        {d.status !== 'DELIVERED' ? (
                          <button
                            onClick={() => handleConfirmDelivery(d._id)}
                            style={{
                              padding: '10px 18px',
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Confirm Food Received
                          </button>
                        ) : (
                          <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '14px' }}>
                            ✓ Received & Distributed
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NGODashboard;
