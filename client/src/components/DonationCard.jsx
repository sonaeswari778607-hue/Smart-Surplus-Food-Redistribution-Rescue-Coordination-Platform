import React from 'react';

const DonationCard = ({ donation, onAction, actionLabel = 'View Details' }) => {
  if (!donation) return null;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return { bg: '#dcfce7', text: '#15803d' };
      case 'ACCEPTED':
        return { bg: '#e0e7ff', text: '#4338ca' };
      case 'ASSIGNED':
        return { bg: '#fef3c7', text: '#b45309' };
      case 'PICKED_UP':
      case 'OUT_FOR_DELIVERY':
        return { bg: '#ffedd5', text: '#c2410c' };
      case 'DELIVERED':
        return { bg: '#d1fae5', text: '#047857' };
      default:
        return { bg: '#f3f4f6', text: '#4b5563' };
    }
  };

  const statusStyle = getStatusStyle(donation.status || 'AVAILABLE');

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#111827' }}>
            {donation.foodName || 'Surplus Food'}
          </h4>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            Category: {donation.category || 'General'} • {donation.foodType || 'Veg'}
          </span>
        </div>
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          padding: '4px 10px',
          borderRadius: '999px',
          backgroundColor: statusStyle.bg,
          color: statusStyle.text
        }}>
          {donation.status || 'AVAILABLE'}
        </span>
      </div>

      <div style={{ fontSize: '14px', color: '#374151' }}>
        <p style={{ margin: '4px 0' }}><strong>Quantity:</strong> {donation.quantity} {donation.unit || 'units'}</p>
        <p style={{ margin: '4px 0' }}><strong>Location:</strong> {donation.pickupLocation?.address || donation.location || 'Not specified'}</p>
        <p style={{ margin: '4px 0' }}><strong>Deadline:</strong> {donation.pickupDeadline ? new Date(donation.pickupDeadline).toLocaleTimeString() : 'Immediate'}</p>
      </div>

      {onAction && (
        <button
          onClick={() => onAction(donation)}
          style={{
            marginTop: '8px',
            padding: '10px 16px',
            backgroundColor: '#16a34a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default DonationCard;
