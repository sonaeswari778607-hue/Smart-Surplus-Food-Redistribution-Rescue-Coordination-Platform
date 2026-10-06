import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ role = 'DONOR', links = [] }) => {
  return (
    <aside style={{
      width: '240px',
      background: '#ffffff',
      borderRight: '1px solid #eaeaea',
      minHeight: 'calc(100vh - 65px)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#9ca3af',
        paddingLeft: '12px',
        marginBottom: '8px',
        fontWeight: 'bold'
      }}>
        {role} Menu
      </div>

      {links.map((link, idx) => (
        <NavLink
          key={idx}
          to={link.path}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            color: isActive ? '#16a34a' : '#4b5563',
            background: isActive ? '#f0fdf4' : 'transparent',
            transition: 'all 0.2s'
          })}
        >
          <span>{link.icon || '📌'}</span>
          <span>{link.label}</span>
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;
