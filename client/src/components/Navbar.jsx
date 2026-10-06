import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ role = 'DONOR', onLogout }) => {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      background: '#ffffff',
      borderBottom: '1px solid #eaeaea',
      boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '24px' }}>🍲</span>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>FoodRescue</span>
        <span style={{
          fontSize: '12px',
          background: '#dcfce7',
          color: '#15803d',
          padding: '2px 8px',
          borderRadius: '12px',
          fontWeight: '600'
        }}>
          {role}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/donor" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Donor</Link>
        <Link to="/ngo" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>NGO</Link>
        <Link to="/volunteer" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Volunteer</Link>
        <Link to="/admin" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Admin</Link>
        {onLogout && (
          <button 
            onClick={onLogout}
            style={{
              padding: '6px 14px',
              background: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
