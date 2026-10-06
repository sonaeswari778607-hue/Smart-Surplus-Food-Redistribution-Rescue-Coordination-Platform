import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🍲</span>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#16a34a', margin: 0 }}>FoodRescue</h1>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Smart Surplus Redistribution Platform</span>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/map" style={{ color: '#475569', textDecoration: 'none', fontWeight: '500', fontSize: '14px' }}>Rescue Map</Link>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                to={user?.role === 'DONOR' ? '/donor' : user?.role === 'NGO' ? '/ngo' : user?.role === 'VOLUNTEER' ? '/volunteer' : '/admin'}
                style={{
                  padding: '8px 16px',
                  background: '#16a34a',
                  color: '#ffffff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Go to {user?.role} Dashboard
              </Link>
              <button
                onClick={logout}
                style={{
                  padding: '8px 14px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link
                to="/login"
                style={{
                  padding: '8px 18px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  padding: '8px 18px',
                  background: '#16a34a',
                  color: '#ffffff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 24px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-block',
          background: '#dcfce7',
          color: '#15803d',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '700',
          marginBottom: '20px'
        }}>
          🌱 Real-Time MERN Surplus Food Redistribution
        </div>
        <h2 style={{ fontSize: '42px', fontWeight: '800', lineHeight: '1.2', margin: '0 0 16px 0', color: '#0f172a' }}>
          Rescue Surplus Food.<br />
          <span style={{ color: '#16a34a' }}>Feed Communities in Need.</span>
        </h2>
        <p style={{ maxWidth: '680px', margin: '0 auto 32px auto', fontSize: '18px', color: '#64748b', lineHeight: '1.6' }}>
          Connecting restaurants, hostels, college canteens, and banquet halls with verified NGOs and volunteer drivers in minutes through smart proximity matching.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link
            to="/register"
            style={{
              padding: '14px 28px',
              background: '#16a34a',
              color: '#ffffff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '16px',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
            }}
          >
            Start Rescuing Food
          </Link>
          <Link
            to="/login"
            style={{
              padding: '14px 28px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#1e293b',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            Login to Dashboard
          </Link>
        </div>
      </section>

      {/* Role Dashboards Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 60px 24px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '700', textAlign: 'center', marginBottom: '32px' }}>
          Role-Based Ecosystem
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {/* Donor */}
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏬</div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Food Donor</h4>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5', marginBottom: '16px' }}>
              Restaurants, hotels, canteens, and individuals post excess meals with pickup deadlines and quantities.
            </p>
            <Link to="/donor" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
              Donor Portal →
            </Link>
          </div>

          {/* NGO */}
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏢</div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Registered NGO</h4>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5', marginBottom: '16px' }}>
              Verified charities claim suitable food donations matched to their community capacity and location.
            </p>
            <Link to="/ngo" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
              NGO Portal →
            </Link>
          </div>

          {/* Volunteer */}
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛵</div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Rescue Volunteer</h4>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5', marginBottom: '16px' }}>
              Volunteers claim transport runs, pick up safe food from donors, and deliver safely to NGOs.
            </p>
            <Link to="/volunteer" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
              Volunteer Portal →
            </Link>
          </div>

          {/* Admin */}
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛡️</div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Admin Center</h4>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5', marginBottom: '16px' }}>
              Verify NGOs, monitor donation statuses, manage users, and observe platform redistribution statistics.
            </p>
            <Link to="/admin" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
              Admin Portal →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works workflow */}
      <section style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '60px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '40px' }}>
            The 5-Step Rescue Coordination Cycle
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '16px'
          }}>
            {[
              { step: '1', title: 'Create Donation', desc: 'Donor posts surplus meals with pickup deadline' },
              { step: '2', title: 'Smart Match & Claim', desc: 'NGO claims food matching capacity & distance' },
              { step: '3', title: 'Volunteer Dispatched', desc: 'Nearby volunteer accepts the pickup route' },
              { step: '4', title: 'Pickup & Transport', desc: 'Volunteer collects food and tracks delivery live' },
              { step: '5', title: 'Delivered & Complete', desc: 'NGO receives food; meals fed metric updated' }
            ].map((item, idx) => (
              <div key={idx} style={{ padding: '20px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#16a34a',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto'
                }}>
                  {item.step}
                </div>
                <h4 style={{ fontSize: '15px', margin: '0 0 6px 0' }}>{item.title}</h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
