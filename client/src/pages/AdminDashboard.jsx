import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalNGOs: 0,
    totalVolunteers: 0,
    totalDonations: 0,
    activeDonations: 0,
    completedDonations: 0,
    totalMeals: 0,
    pendingNGOs: 0
  });

  const [usersList, setUsersList] = useState([]);
  const [donationsList, setDonationsList] = useState([]);
  const [ngosList, setNgosList] = useState([]);
  const [activeTab, setActiveTab] = useState('STATS'); // STATS, USERS, NGOS, DONATIONS
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, donRes, ngosRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/donations'),
        API.get('/ngos')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsersList(usersRes.data.users);
      if (donRes.data.success) setDonationsList(donRes.data.donations);
      if (ngosRes.data.success) setNgosList(ngosRes.data.ngos);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyNGO = async (ngoId, newStatus) => {
    try {
      const res = await API.put(`/admin/ngos/${ngoId}/verify`, { status: newStatus });
      if (res.data.success) {
        setActionMsg(`NGO status updated to '${newStatus}'!`);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update NGO verification');
    }
  };

  const sidebarLinks = [
    { label: 'System Overview', path: '/admin', icon: '📊' },
    { label: 'Interactive Map', path: '/map', icon: '🗺️' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar role="ADMIN" onLogout={logout} />
      <div style={{ display: 'flex' }}>
        <Sidebar role="ADMIN" links={sidebarLinks} />

        <main style={{ flex: 1, padding: '32px', maxWidth: '1200px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                Platform Administration Center
              </h1>
              <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
                Logged in as <strong>{user?.name}</strong> • Global FoodRescue Compliance & Audits
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="#2563eb" />
            <StatCard title="Donors" value={stats.totalDonors} icon="🏬" color="#16a34a" />
            <StatCard title="NGOs" value={stats.totalNGOs} icon="🏢" color="#f59e0b" />
            <StatCard title="Volunteers" value={stats.totalVolunteers} icon="🛵" color="#059669" />
            <StatCard title="Total Donations" value={stats.totalDonations} icon="🍲" color="#9333ea" />
            <StatCard title="Total Meals" value={stats.totalMeals} icon="✨" color="#ec4899" />
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {[
              { id: 'STATS', label: '📊 Overview' },
              { id: 'USERS', label: `👥 Users (${usersList.length})` },
              { id: 'NGOS', label: `🛡️ NGO Approvals (${ngosList.length})` },
              { id: 'DONATIONS', label: `📦 All Donations (${donationsList.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === tab.id ? '#16a34a' : '#e2e8f0',
                  color: activeTab === tab.id ? '#ffffff' : '#475569',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Loading platform data...
            </div>
          ) : activeTab === 'STATS' ? (
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '28px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>Platform Health & Real-Time Flow</h3>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                All 4 MERN roles are actively authenticated. MongoDB collections (<code>users</code>, <code>donations</code>, <code>ngos</code>, <code>volunteers</code>, <code>assignments</code>) are synchronized.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <strong>Active Rescues In Progress:</strong> {stats.activeDonations}
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <strong>Fully Delivered & Distributed:</strong> {stats.completedDonations}
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <strong>Pending NGO Approvals:</strong> {stats.pendingNGOs}
                </div>
              </div>
            </div>
          ) : activeTab === 'USERS' ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px' }}>Name</th>
                    <th style={{ padding: '12px 16px' }}>Email</th>
                    <th style={{ padding: '12px 16px' }}>Role</th>
                    <th style={{ padding: '12px 16px' }}>Phone</th>
                    <th style={{ padding: '12px 16px' }}>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '600' }}>{u.name}</td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{u.email}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: u.role === 'ADMIN' ? '#fce7f3' : u.role === 'NGO' ? '#e0e7ff' : u.role === 'VOLUNTEER' ? '#fef3c7' : '#dcfce7',
                          color: u.role === 'ADMIN' ? '#9d174d' : u.role === 'NGO' ? '#3730a3' : u.role === 'VOLUNTEER' ? '#92400e' : '#166534'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{u.phone}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{u.location?.address || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'NGOS' ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px' }}>Organization Name</th>
                    <th style={{ padding: '12px 16px' }}>Capacity (Meals)</th>
                    <th style={{ padding: '12px 16px' }}>Address</th>
                    <th style={{ padding: '12px 16px' }}>Phone</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Admin Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {ngosList.map((ngo) => (
                    <tr key={ngo._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '600' }}>{ngo.organizationName}</td>
                      <td style={{ padding: '14px 16px' }}>{ngo.capacity} meals/day</td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{ngo.address}</td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{ngo.phone}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: ngo.verificationStatus === 'VERIFIED' ? '#dcfce7' : ngo.verificationStatus === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                          color: ngo.verificationStatus === 'VERIFIED' ? '#15803d' : ngo.verificationStatus === 'REJECTED' ? '#dc2626' : '#b45309'
                        }}>
                          {ngo.verificationStatus}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {ngo.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => handleVerifyNGO(ngo._id, 'VERIFIED')}
                            style={{
                              padding: '6px 12px',
                              background: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '12px',
                              marginRight: '6px'
                            }}
                          >
                            ✓ Approve
                          </button>
                        )}
                        {ngo.verificationStatus !== 'REJECTED' && (
                          <button
                            onClick={() => handleVerifyNGO(ngo._id, 'REJECTED')}
                            style={{
                              padding: '6px 12px',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '12px'
                            }}
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px' }}>Food Name</th>
                    <th style={{ padding: '12px 16px' }}>Quantity</th>
                    <th style={{ padding: '12px 16px' }}>Donor</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>NGO</th>
                    <th style={{ padding: '12px 16px' }}>Volunteer</th>
                  </tr>
                </thead>
                <tbody>
                  {donationsList.map((d) => (
                    <tr key={d._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '600' }}>{d.foodName}</td>
                      <td style={{ padding: '14px 16px' }}>{d.quantity} {d.unit}</td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{d.donorId?.name}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: d.status === 'DELIVERED' ? '#dcfce7' : '#e0e7ff',
                          color: d.status === 'DELIVERED' ? '#15803d' : '#3730a3'
                        }}>
                          {d.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{d.acceptedBy?.organizationName || '—'}</td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{d.assignedVolunteer ? 'Assigned' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
