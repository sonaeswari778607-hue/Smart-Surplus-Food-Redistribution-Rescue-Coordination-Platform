import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const DonorDashboard = () => {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonations: 0,
    completedDonations: 0,
    mealsDonated: 0
  });

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED
  const [actionMsg, setActionMsg] = useState('');

  // Form State
  const [form, setForm] = useState({
    foodName: '',
    category: 'Cooked Meals',
    quantity: '',
    unit: 'Packets',
    foodType: 'Veg',
    preparedTime: '12:00 PM',
    hoursToDeadline: '3',
    pickupAddress: user?.location?.address || '',
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, listRes] = await Promise.all([
        API.get('/donations/stats/donor'),
        API.get('/donations/my')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (listRes.data.success) {
        setDonations(listRes.data.donations);
      }
    } catch (err) {
      console.error('Error fetching donor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    setActionMsg('');

    try {
      const deadline = new Date(Date.now() + Number(form.hoursToDeadline) * 60 * 60 * 1000);

      const payload = {
        foodName: form.foodName,
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
        foodType: form.foodType,
        preparedTime: form.preparedTime,
        pickupDeadline: deadline.toISOString(),
        pickupLocation: {
          address: form.pickupAddress || user?.location?.address || 'Donor Main Campus',
          latitude: 12.9716,
          longitude: 77.5946
        },
        description: form.description
      };

      const res = await API.post('/donations', payload);
      if (res.data.success) {
        setActionMsg('Donation created successfully! NGOs are being notified.');
        setShowModal(false);
        setForm({
          foodName: '',
          category: 'Cooked Meals',
          quantity: '',
          unit: 'Packets',
          foodType: 'Veg',
          preparedTime: '12:00 PM',
          hoursToDeadline: '3',
          pickupAddress: user?.location?.address || '',
          description: ''
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create donation');
    }
  };

  const handleCancelDonation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this surplus donation?')) return;
    try {
      const res = await API.delete(`/donations/${id}`);
      if (res.data.success) {
        setActionMsg('Donation cancelled successfully.');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel donation');
    }
  };

  const sidebarLinks = [
    { label: 'Overview', path: '/donor', icon: '📊' },
    { label: 'Interactive Map', path: '/map', icon: '🗺️' }
  ];

  const filteredDonations = donations.filter((d) => {
    if (filter === 'ACTIVE') {
      return ['AVAILABLE', 'ACCEPTED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(d.status);
    }
    if (filter === 'COMPLETED') {
      return d.status === 'DELIVERED';
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const styles = {
      AVAILABLE: { bg: '#dcfce7', color: '#15803d', label: 'AVAILABLE' },
      ACCEPTED: { bg: '#e0e7ff', color: '#4338ca', label: 'CLAIMED BY NGO' },
      ASSIGNED: { bg: '#fef3c7', color: '#b45309', label: 'VOLUNTEER ASSIGNED' },
      PICKED_UP: { bg: '#ffedd5', color: '#c2410c', label: 'PICKED UP' },
      OUT_FOR_DELIVERY: { bg: '#fed7aa', color: '#9a3412', label: 'IN TRANSIT' },
      DELIVERED: { bg: '#d1fae5', color: '#047857', label: 'DELIVERED & COMPLETE' },
      CANCELLED: { bg: '#fee2e2', color: '#b91c1c', label: 'CANCELLED' }
    };
    const s = styles[status] || { bg: '#f1f5f9', color: '#64748b', label: status };
    return (
      <span style={{
        background: s.bg,
        color: s.color,
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: '700'
      }}>
        {s.label}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar role="DONOR" onLogout={logout} />
      <div style={{ display: 'flex' }}>
        <Sidebar role="DONOR" links={sidebarLinks} />

        <main style={{ flex: 1, padding: '32px', maxWidth: '1200px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                Donor Command Center
              </h1>
              <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
                Welcome, <strong>{user?.name}</strong> • Surplus Food Redistribution
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '12px 20px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)'
              }}
            >
              + Create Food Donation
            </button>
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
            <StatCard title="Total Donations" value={stats.totalDonations} icon="📦" color="#2563eb" />
            <StatCard title="Active Donations" value={stats.activeDonations} icon="⏳" color="#f59e0b" />
            <StatCard title="Completed Rescues" value={stats.completedDonations} icon="✅" color="#16a34a" />
            <StatCard title="Meals Donated" value={stats.mealsDonated} icon="🍲" color="#9333ea" />
          </div>

          {/* Donation History / Management Table */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                My Surplus Food Donations
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['ALL', 'ACTIVE', 'COMPLETED'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: filter === tab ? '#16a34a' : '#ffffff',
                      color: filter === tab ? '#ffffff' : '#475569',
                      fontWeight: '600',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                Loading your donation records...
              </div>
            ) : filteredDonations.length === 0 ? (
              <div style={{ padding: '50px 20px', textAlign: 'center' }}>
                <span style={{ fontSize: '40px' }}>🍲</span>
                <h4 style={{ margin: '12px 0 6px 0', color: '#334155' }}>No donations found</h4>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px 0' }}>
                  Post your excess cooked food or groceries to prevent waste.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    padding: '8px 16px',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Create First Donation
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '14px 20px' }}>Food Name</th>
                      <th style={{ padding: '14px 20px' }}>Quantity</th>
                      <th style={{ padding: '14px 20px' }}>Type</th>
                      <th style={{ padding: '14px 20px' }}>Pickup Deadline</th>
                      <th style={{ padding: '14px 20px' }}>Status</th>
                      <th style={{ padding: '14px 20px' }}>Assigned Partner</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.map((d) => (
                      <tr key={d._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 20px', fontWeight: '600', color: '#1e293b' }}>
                          {d.foodName}
                          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>
                            {d.category}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <strong>{d.quantity}</strong> {d.unit}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
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
                        </td>
                        <td style={{ padding: '16px 20px', color: '#475569' }}>
                          {new Date(d.pickupDeadline).toLocaleDateString()} {new Date(d.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          {getStatusBadge(d.status)}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '13px' }}>
                          {d.acceptedBy ? (
                            <div style={{ color: '#15803d', fontWeight: '600' }}>
                              🏢 {d.acceptedBy.organizationName || 'Partner NGO'}
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>Awaiting NGO</span>
                          )}
                          {d.assignedVolunteer && (
                            <div style={{ color: '#2563eb', fontSize: '12px', marginTop: '2px' }}>
                              🛵 Driver Assigned
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          {d.status === 'AVAILABLE' && (
                            <button
                              onClick={() => handleCancelDonation(d._id)}
                              style={{
                                padding: '6px 12px',
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Donation Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>🍲 Create Surplus Food Donation</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDonation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Food Name / Dish Title</label>
                <input
                  type="text"
                  required
                  value={form.foodName}
                  onChange={(e) => setForm({ ...form, foodName: e.target.value })}
                  placeholder="e.g. Vegetable Biryani, Dal & Chapati"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Cooked Meals">Cooked Meals</option>
                    <option value="Rice & Curry">Rice & Curry</option>
                    <option value="Bakery & Bread">Bakery & Bread</option>
                    <option value="Raw Groceries">Raw Groceries</option>
                    <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                    <option value="Packed Food">Packed Food</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Food Type</label>
                  <select
                    value={form.foodType}
                    onChange={(e) => setForm({ ...form, foodType: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Veg">Vegetarian</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="e.g. 50"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Packets">Packets / Meals</option>
                    <option value="Kg">Kilograms (Kg)</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Liters">Liters</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Prepared Time</label>
                  <input
                    type="text"
                    required
                    value={form.preparedTime}
                    onChange={(e) => setForm({ ...form, preparedTime: e.target.value })}
                    placeholder="e.g. 1:00 PM today"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Must Pickup Within</label>
                  <select
                    value={form.hoursToDeadline}
                    onChange={(e) => setForm({ ...form, hoursToDeadline: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="2">2 Hours (Urgent)</option>
                    <option value="4">4 Hours (Normal)</option>
                    <option value="6">6 Hours</option>
                    <option value="12">12 Hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Pickup Location Address</label>
                <input
                  type="text"
                  required
                  value={form.pickupAddress}
                  onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                  placeholder="e.g. 45 MG Road, Bengaluru"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Description / Storage Notes</label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Packed in food-grade foil containers, keep refrigerated."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 18px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
                >
                  Confirm & Post Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
