import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

// Custom SVG map icons to avoid missing png icon asset issues
const createCustomIcon = (emoji, color) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        border: 2px solid white;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
      ">
        ${emoji}
      </div>
    `,
    className: 'custom-leaflet-marker',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20]
  });
};

const donorIcon = createCustomIcon('🏬', '#16a34a');
const ngoIcon = createCustomIcon('🏢', '#2563eb');
const volunteerIcon = createCustomIcon('🛵', '#f59e0b');

const RescueMapPage = () => {
  const { user, logout } = useAuth();

  const [donations, setDonations] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default Bangalore center
  const defaultCenter = [12.9716, 77.5946];

  useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true);
        const [donRes, ngoRes] = await Promise.all([
          API.get('/donations'),
          API.get('/ngos')
        ]);

        if (donRes.data.success) {
          setDonations(donRes.data.donations);
          if (donRes.data.donations.length > 0) {
            setSelectedDonation(donRes.data.donations[0]);
          }
        }
        if (ngoRes.data.success) {
          setNgos(ngoRes.data.ngos);
        }
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar role={user?.role || 'GUEST'} onLogout={user ? logout : null} />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px' }}>
        <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
              🗺️ FoodRescue Live Geographic Coordination Map
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
              Powered by OpenStreetMap & Leaflet • Tracking active food donors, recipient NGOs, and transit routes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#ffffff', padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🟢 <strong>Donor</strong></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🔵 <strong>NGO Shelter</strong></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🟡 <strong>Active Transit</strong></span>
          </div>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)',
          gap: '24px'
        }}>
          {/* Real Leaflet Map */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            height: '620px',
            position: 'relative'
          }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                Loading OpenStreetMap data...
              </div>
            ) : (
              <MapContainer
                center={defaultCenter}
                zoom={12}
                scrollWheelZoom={true}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Donor Markers */}
                {donations.map((d) => {
                  const lat = d.pickupLocation?.latitude || defaultCenter[0];
                  const lon = d.pickupLocation?.longitude || defaultCenter[1];

                  return (
                    <Marker
                      key={`donor-${d._id}`}
                      position={[lat, lon]}
                      icon={donorIcon}
                      eventHandlers={{
                        click: () => setSelectedDonation(d)
                      }}
                    >
                      <Popup>
                        <div style={{ padding: '4px' }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#16a34a' }}>
                            🏬 {d.foodName}
                          </h4>
                          <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>
                            <strong>Quantity:</strong> {d.quantity} {d.unit}
                          </p>
                          <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>
                            <strong>Status:</strong> {d.status}
                          </p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                            {d.pickupLocation?.address}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* NGO Markers */}
                {ngos.map((ngo) => {
                  const lat = ngo.location?.latitude || (defaultCenter[0] + 0.02);
                  const lon = ngo.location?.longitude || (defaultCenter[1] + 0.04);

                  return (
                    <Marker
                      key={`ngo-${ngo._id}`}
                      position={[lat, lon]}
                      icon={ngoIcon}
                    >
                      <Popup>
                        <div style={{ padding: '4px' }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#2563eb' }}>
                            🏢 {ngo.organizationName}
                          </h4>
                          <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>
                            <strong>Capacity:</strong> {ngo.capacity} meals/day
                          </p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                            {ngo.address}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Connecting Transit Line for Selected Rescue */}
                {selectedDonation && selectedDonation.acceptedBy && (
                  <Polyline
                    positions={[
                      [
                        selectedDonation.pickupLocation?.latitude || defaultCenter[0],
                        selectedDonation.pickupLocation?.longitude || defaultCenter[1]
                      ],
                      [
                        selectedDonation.acceptedBy.location?.latitude || (defaultCenter[0] + 0.02),
                        selectedDonation.acceptedBy.location?.longitude || (defaultCenter[1] + 0.04)
                      ]
                    ]}
                    color="#f59e0b"
                    weight={4}
                    dashArray="6, 8"
                  />
                )}
              </MapContainer>
            )}
          </div>

          {/* Rescue Inspection Side Panel */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            height: '620px',
            overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>
              Active Rescue Inspector
            </h3>

            {selectedDonation ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#16a34a' }}>
                      FOOD RESCUE NODE
                    </span>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: selectedDonation.status === 'DELIVERED' ? '#dcfce7' : '#ffedd5',
                      color: selectedDonation.status === 'DELIVERED' ? '#15803d' : '#c2410c'
                    }}>
                      {selectedDonation.status}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a' }}>
                    {selectedDonation.foodName}
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                    <strong>{selectedDonation.quantity} {selectedDonation.unit}</strong> • {selectedDonation.foodType} ({selectedDonation.category})
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                  <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <strong style={{ color: '#166534' }}>📍 Pickup Point (Donor):</strong>
                    <p style={{ margin: '4px 0 2px 0', color: '#1f2937' }}>
                      {selectedDonation.donorId?.name || 'Green Leaf Restaurant'}
                    </p>
                    <p style={{ margin: 0, color: '#4b5563', fontSize: '12px' }}>
                      {selectedDonation.pickupLocation?.address}
                    </p>
                  </div>

                  <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <strong style={{ color: '#1e40af' }}>🏢 Dropoff Point (NGO):</strong>
                    <p style={{ margin: '4px 0 2px 0', color: '#1f2937' }}>
                      {selectedDonation.acceptedBy?.organizationName || 'Awaiting Claim by NGO'}
                    </p>
                    <p style={{ margin: 0, color: '#4b5563', fontSize: '12px' }}>
                      {selectedDonation.acceptedBy?.address || 'Indiranagar Center'}
                    </p>
                  </div>

                  <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <strong style={{ color: '#92400e' }}>🛵 Delivery Volunteer:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#1f2937' }}>
                      {selectedDonation.assignedVolunteer ? 'Active Volunteer Dispatched' : 'Pending Volunteer Assignment'}
                    </p>
                  </div>

                  <div>
                    <strong>⏳ Must Pickup Before:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#475569' }}>
                      {new Date(selectedDonation.pickupDeadline).toLocaleString()}
                    </p>
                  </div>

                  {selectedDonation.description && (
                    <div>
                      <strong>Storage & Handling:</strong>
                      <p style={{ margin: '4px 0 0 0', color: '#64748b', fontStyle: 'italic' }}>
                        "{selectedDonation.description}"
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                    Switch Active Marker:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {donations.map((d) => (
                      <button
                        key={d._id}
                        onClick={() => setSelectedDonation(d)}
                        style={{
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: selectedDonation._id === d._id ? '#16a34a' : '#e2e8f0',
                          background: selectedDonation._id === d._id ? '#f0fdf4' : '#ffffff',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span style={{ fontWeight: selectedDonation._id === d._id ? '700' : '500' }}>
                          🍲 {d.foodName}
                        </span>
                        <span style={{ color: '#64748b' }}>{d.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                Select a marker on the map to inspect its real-time rescue status.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RescueMapPage;
