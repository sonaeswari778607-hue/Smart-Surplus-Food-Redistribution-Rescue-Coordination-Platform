import React from 'react';

const StatCard = ({ title, value, icon, color = '#16a34a' }) => {
  return (
    <div style={{
      background: '#ffffff',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      border: '1px solid #f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div>
        <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
          {title}
        </p>
        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
          {value}
        </h3>
      </div>
      <div style={{
        fontSize: '24px',
        padding: '12px',
        borderRadius: '10px',
        background: `${color}15`,
        color: color
      }}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
