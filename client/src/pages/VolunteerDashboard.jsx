import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const VolunteerDashboard = () => {
  const { user, logout } = useAuth();

  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    activePickups: 0,
    completed: 0,
    mealsRescued: 0
  });

  const [activeTab, setActiveTab] = useState('AVAILABLE'); // AVAILABLE, MY_TASKS
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [availRes, myRes] = await Promise.all([
        API.get('/volunteers/tasks/available'),
        API.get('/volunteers/tasks/my')
      ]);

      if (availRes.data.success) {
        setAvailableTasks(availRes.data.tasks);
      }
      if (myRes.data.success) {
        setMyTasks(myRes.data.tasks);
        if (myRes.data.stats) {
          setStats(myRes.data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching volunteer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptTask = async (donationId) => {
    try {
      const res = await API.post(`/volunteers/tasks/accept/${donationId}`);
      if (res.data.success) {
        setActionMsg('Rescue task accepted! Proceed to the donor pickup address.');
        fetchData();
        setActiveTab('MY_TASKS');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept task');
    }
  };

  const handleUpdateStatus = async (donationId, nextStatus) => {
    try {
      const res = await API.put(`/volunteers/tasks/status/${donationId}`, { status: nextStatus });
      if (res.data.success) {
        setActionMsg(`Task successfully updated to '${nextStatus}'!`);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const sidebarLinks = [
    { label: 'Overview', path: '/volunteer', icon: '📊' },
    { label: 'Interactive Map', path: '/map', icon: '🗺️' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar role="VOLUNTEER" onLogout={logout} />
      <div style={{ display: 'flex' }}>
        <Sidebar role="VOLUNTEER" links={sidebarLinks} />

        <main style={{ flex: 1, padding: '32px', maxWidth: '1200px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                Volunteer Rescue Dispatch
              </h1>
              <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
                Welcome, <strong>{user?.name}</strong> • Surplus Food Transport Coordination
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
            <StatCard title="Available Tasks" value={availableTasks.length} icon="🛵" color="#2563eb" />
            <StatCard title="Active Pickups" value={stats.activePickups} icon="⏳" color="#f59e0b" />
            <StatCard title="Completed Runs" value={stats.completed} icon="🏆" color="#16a34a" />
            <StatCard title="Meals Rescued" value={stats.mealsRescued} icon="🍲" color="#9333ea" />
          </div>

          {/* Tabs */}
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
              🛵 Available Pickup Tasks ({availableTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('MY_TASKS')}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'MY_TASKS' ? '#16a34a' : '#e2e8f0',
                color: activeTab === 'MY_TASKS' ? '#ffffff' : '#475569',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              📦 My Assigned Rescues ({myTasks.length})
            </button>
          </div>

          {/* Tab Content */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Loading rescue tasks...
            </div>
          ) : activeTab === 'AVAILABLE' ? (
            <div>
              {availableTasks.length === 0 ? (
                <div style={{
                  background: '#ffffff',
                  padding: '50px 20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '40px' }}>🛵</span>
                  <h4 style={{ margin: '12px 0 6px 0', color: '#334155' }}>No pending rescue tasks</h4>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                    When an NGO claims a food donation, it will show up here for you to claim and pick up.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '20px'
                }}>
                  {availableTasks.map((task) => (
                    <div
                      key={task._id}
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
                        {task.matchScore && (
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
                              ⚡ {task.matchScore}% Route Match
                            </span>
                            <span style={{ fontSize: '12px', color: '#4b5563' }}>
                              📍 {task.distanceKm} km to pickup
                            </span>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <h3 style={{ margin: 0, fontSize: '19px', color: '#0f172a' }}>{task.foodName}</h3>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background: '#e0e7ff',
                            color: '#4338ca'
                          }}>
                            CLAIMED BY NGO
                          </span>
                        </div>

                        <div style={{
                          background: '#f8fafc',
                          padding: '12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#334155',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          marginTop: '12px'
                        }}>
                          <div>📦 <strong>Food:</strong> {task.quantity} {task.unit} ({task.foodType})</div>
                          <div>🏬 <strong>Pickup Point:</strong> {task.pickupLocation?.address}</div>
                          <div>🏢 <strong>Deliver To NGO:</strong> {task.acceptedBy?.organizationName || 'Partner Charity'} ({task.acceptedBy?.address || 'NGO address'})</div>
                          <div>⏳ <strong>Must Pickup By:</strong> {new Date(task.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAcceptTask(task._id)}
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
                        ✓ Accept Task & Start Pickup
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* My Assigned Rescues with Sequential Status Buttons */}
              {myTasks.length === 0 ? (
                <div style={{
                  background: '#ffffff',
                  padding: '50px 20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <h4 style={{ margin: '0 0 6px 0', color: '#334155' }}>No tasks currently assigned</h4>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                    Switch to the "Available Pickup Tasks" tab to claim transport runs.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {myTasks.map((t) => (
                    <div
                      key={t._id}
                      style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0',
                        padding: '24px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{t.foodName}</h4>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>
                            {t.quantity} {t.unit} • Recipient: <strong>{t.acceptedBy?.organizationName}</strong>
                          </span>
                        </div>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: '700',
                          background: t.status === 'DELIVERED' ? '#dcfce7' : '#ffedd5',
                          color: t.status === 'DELIVERED' ? '#15803d' : '#c2410c'
                        }}>
                          STATUS: {t.status}
                        </span>
                      </div>

                      {/* Locations */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '12px',
                        background: '#f8fafc',
                        padding: '14px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        marginBottom: '20px'
                      }}>
                        <div>
                          <strong>📍 Step 1: Donor Pickup Address:</strong>
                          <p style={{ margin: '4px 0 0 0', color: '#475569' }}>
                            {t.pickupLocation?.address}
                          </p>
                        </div>
                        <div>
                          <strong>🏢 Step 2: NGO Delivery Destination:</strong>
                          <p style={{ margin: '4px 0 0 0', color: '#475569' }}>
                            {t.acceptedBy?.address || 'Indiranagar distribution center'}
                          </p>
                        </div>
                      </div>

                      {/* Interactive Sequential Workflow Action Buttons */}
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {t.status === 'ASSIGNED' && (
                          <button
                            onClick={() => handleUpdateStatus(t._id, 'PICKED_UP')}
                            style={{
                              padding: '10px 20px',
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            📦 Mark as Picked Up
                          </button>
                        )}

                        {t.status === 'PICKED_UP' && (
                          <button
                            onClick={() => handleUpdateStatus(t._id, 'OUT_FOR_DELIVERY')}
                            style={{
                              padding: '10px 20px',
                              background: '#f59e0b',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            🚚 Start Delivery (Out for Delivery)
                          </button>
                        )}

                        {t.status === 'OUT_FOR_DELIVERY' && (
                          <button
                            onClick={() => handleUpdateStatus(t._id, 'DELIVERED')}
                            style={{
                              padding: '10px 20px',
                              background: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            ✅ Mark as Delivered
                          </button>
                        )}

                        {t.status === 'DELIVERED' && (
                          <div style={{ color: '#16a34a', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>🎉</span> Successfully Rescued & Delivered to NGO!
                          </div>
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

export default VolunteerDashboard;
