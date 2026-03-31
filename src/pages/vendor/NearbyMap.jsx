import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Clock, Route, X, Car, Navigation, RefreshCw, TrendingUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// ── Icons ──────────────────────────────────────────────────────────────────
const makeVehicleIcon = (selected) => L.divIcon({
  className: '',
  html: `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
      ${selected ? `<div style="position:absolute;top:-4px;left:-4px;right:-4px;bottom:-4px;border-radius:50%;background:rgba(37,99,235,0.2);animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ''}
      <div style="
        width:38px;height:38px;background:#2563eb;border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        border:3px solid white;box-shadow:0 3px 12px rgba(37,99,235,0.45);
        position:relative;z-index:1;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l3-4h8l3 4h1a2 2 0 012 2v6a2 2 0 01-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5" fill="white"/><circle cx="16.5" cy="17.5" r="2.5" fill="white"/></svg>
      </div>
      <div style="background:#2563eb;color:white;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;margin-top:3px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.2);">VEHICLE</div>
    </div>`,
  iconSize: [38, 60],
  iconAnchor: [19, 38],
})

const makePickupIcon = (selected) => L.divIcon({
  className: '',
  html: `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
      ${selected ? `<div style="position:absolute;top:-4px;left:-4px;right:-4px;bottom:-4px;border-radius:50%;background:rgba(16,185,129,0.2);animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ''}
      <div style="
        width:38px;height:38px;background:#10b981;border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        border:3px solid white;box-shadow:0 3px 12px rgba(16,185,129,0.45);
        position:relative;z-index:1;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3" fill="white" stroke="none"/></svg>
      </div>
      <div style="background:#10b981;color:white;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;margin-top:3px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.2);">PICKUP</div>
    </div>`,
  iconSize: [38, 60],
  iconAnchor: [19, 38],
})

// Inject ping animation once
if (typeof document !== 'undefined' && !document.getElementById('map-ping-style')) {
  const s = document.createElement('style')
  s.id = 'map-ping-style'
  s.textContent = `@keyframes ping{75%,100%{transform:scale(2);opacity:0}}`
  document.head.appendChild(s)
}

export default function FleetMap() {
  const { authFetch } = useAuth()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})   // bookingId → { vMarker, pMarker }
  const routeLayerRef = useRef(null)

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [error, setError] = useState('')
  const [totalStats, setTotalStats] = useState({ count: 0, totalKm: 0 })

  // Init map
  useEffect(() => {
    if (mapInstanceRef.current) return
    const map = L.map(mapRef.current, { center: [27.7172, 85.3240], zoom: 12, zoomControl: false })

    // CartoDB Positron — clean, modern look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd', maxZoom: 19,
    }).addTo(map)

    // Custom zoom control position
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapInstanceRef.current = map
    return () => { map.remove(); mapInstanceRef.current = null }
  }, [])

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetch('/api/bookings/all')
      const data = await res.json()
      const active = (res.ok ? data : []).filter(b =>
        b.status === 'Active' &&
        Array.isArray(b.pickupLocation) && b.pickupLocation.length === 2 &&
        Array.isArray(b.vehicleId?.location) && b.vehicleId.location.length === 2
      )
      setBookings(active)
      setTotalStats({ count: active.length, totalKm: 0 })
    } catch {
      setBookings([])
    }
    setLoading(false)
  }, [authFetch])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  // Place/update markers
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Remove old markers
    Object.values(markersRef.current).forEach(({ vMarker, pMarker }) => {
      vMarker.remove(); pMarker.remove()
    })
    markersRef.current = {}

    bookings.forEach(b => {
      const isSelected = selected?._id === b._id
      const vMarker = L.marker(b.vehicleId.location, { icon: makeVehicleIcon(isSelected) })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:160px;font-family:system-ui">
            <p style="font-weight:700;font-size:13px;margin:0 0 4px">${b.vehicleId.name}</p>
            <p style="color:#64748b;font-size:11px;margin:0">Base location</p>
            <p style="color:#2563eb;font-size:11px;font-weight:600;margin:4px 0 0">₹${b.totalPrice} · ${b.status}</p>
          </div>`)

      const pMarker = L.marker(b.pickupLocation, { icon: makePickupIcon(isSelected) })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:160px;font-family:system-ui">
            <p style="font-weight:700;font-size:13px;margin:0 0 4px">${b.userId?.name || 'Customer'}</p>
            <p style="color:#64748b;font-size:11px;margin:0">Pickup point</p>
            <p style="color:#10b981;font-size:11px;font-weight:600;margin:4px 0 0">${new Date(b.startTime).toLocaleDateString()} → ${new Date(b.endTime).toLocaleDateString()}</p>
          </div>`)

      vMarker.on('click', () => handleSelectBooking(b))
      pMarker.on('click', () => handleSelectBooking(b))
      markersRef.current[b._id] = { vMarker, pMarker }
    })

    if (bookings.length > 0) {
      const allCoords = bookings.flatMap(b => [b.vehicleId.location, b.pickupLocation])
      map.fitBounds(L.latLngBounds(allCoords), { padding: [60, 60] })
    }
  }, [bookings, selected])

  const handleSelectBooking = (b) => {
    setSelected(b)
    const map = mapInstanceRef.current
    if (!map) return
    const bounds = L.latLngBounds([b.vehicleId.location, b.pickupLocation])
    map.flyToBounds(bounds, { padding: [80, 80], duration: 0.8 })
  }

  const getRoute = async (booking) => {
    handleSelectBooking(booking)
    setRouteLoading(true)
    setError('')
    if (routeLayerRef.current) { mapInstanceRef.current.removeLayer(routeLayerRef.current); routeLayerRef.current = null }
    setRouteInfo(null)

    const [vLat, vLon] = booking.vehicleId.location
    const [pLat, pLon] = booking.pickupLocation

    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${vLon},${vLat};${pLon},${pLat}?overview=full&geometries=geojson`
      )
      const data = await res.json()
      if (data.code !== 'Ok') throw new Error()

      const route = data.routes[0]
      const coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon])
      const distKm = (route.distance / 1000).toFixed(1)
      const mins = Math.round(route.duration / 60)

      // Animated dashed route line
      const polyline = L.polyline(coords, {
        color: '#2563eb', weight: 5, opacity: 0.9,
        dashArray: '10, 8', lineCap: 'round',
      }).addTo(mapInstanceRef.current)

      // Solid underline for depth
      const shadow = L.polyline(coords, {
        color: '#93c5fd', weight: 9, opacity: 0.35,
      }).addTo(mapInstanceRef.current)

      routeLayerRef.current = L.layerGroup([shadow, polyline])
      mapInstanceRef.current.addLayer(routeLayerRef.current)
      // Remove individual layers since we added them directly
      shadow.remove(); polyline.remove()

      // Re-add properly
      if (routeLayerRef.current) mapInstanceRef.current.removeLayer(routeLayerRef.current)
      const group = L.featureGroup([
        L.polyline(coords, { color: '#93c5fd', weight: 9, opacity: 0.35 }),
        L.polyline(coords, { color: '#2563eb', weight: 5, opacity: 0.9, dashArray: '10, 8', lineCap: 'round' }),
      ]).addTo(mapInstanceRef.current)
      routeLayerRef.current = group

      mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [60, 60] })
      setRouteInfo({ distKm, mins, vehicle: booking.vehicleId.name, customer: booking.userId?.name })
      setTotalStats(s => ({ ...s, totalKm: parseFloat(distKm) }))
    } catch {
      setError('Could not fetch route. Try again.')
    }
    setRouteLoading(false)
  }

  const clearRoute = () => {
    if (routeLayerRef.current) { mapInstanceRef.current.removeLayer(routeLayerRef.current); routeLayerRef.current = null }
    setRouteInfo(null)
    setSelected(null)
  }

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ── Header ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-5 py-3 flex items-center gap-4">
        <div className="flex-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Fleet Map</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {loading ? 'Loading...' : `${bookings.length} active booking${bookings.length !== 1 ? 's' : ''} on map`}
          </p>
        </div>

        {/* Stats pills */}
        {!loading && bookings.length > 0 && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-xs font-semibold">
              <Car size={12} /> {bookings.length} Active
            </div>
            {routeInfo && (
              <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full text-xs font-semibold">
                <TrendingUp size={12} /> {routeInfo.distKm} km route
              </div>
            )}
          </div>
        )}

        <button onClick={fetchBookings} disabled={loading}
          className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-5 py-2 flex items-center justify-between">
          <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
          <button onClick={() => setError('')}><X size={14} className="text-red-400" /></button>
        </div>
      )}

      {/* ── Route banner ── */}
      {routeInfo && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-200 dark:border-blue-800 px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-5 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-blue-200">
              <Route size={13} /> {routeInfo.vehicle}
              <span className="text-blue-400 mx-1">→</span>
              {routeInfo.customer}
            </span>
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-300 font-semibold">
              <MapPin size={12} /> {routeInfo.distKm} km
            </span>
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-300 font-semibold">
              <Clock size={12} /> ~{routeInfo.mins} min drive
            </span>
          </div>
          <button onClick={clearRoute} className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 font-medium">
            <X size={13} /> Clear
          </button>
        </div>
      )}

      {/* ── Map + Sidebar ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Map */}
        <div ref={mapRef} className="flex-1 z-0" />

        {/* Sidebar */}
        <div className="w-76 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shrink-0" style={{ width: '288px' }}>

          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Bookings</p>
            {selected && (
              <button onClick={clearRoute} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                Clear selection
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <RefreshCw size={20} className="text-slate-300 animate-spin" />
                <p className="text-xs text-slate-400">Loading bookings...</p>
              </div>
            )}
            {!loading && bookings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-2 px-4 text-center">
                <Car size={28} className="text-slate-200 dark:text-slate-700" />
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No active bookings</p>
                <p className="text-xs text-slate-300 dark:text-slate-600">Bookings with pickup locations will appear here</p>
              </div>
            )}
            {bookings.map(b => {
              const isActive = selected?._id === b._id
              return (
                <div key={b._id}
                  className={`px-4 py-3.5 cursor-pointer transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-l-2 border-transparent'}`}
                  onClick={() => handleSelectBooking(b)}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isActive ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-slate-100 dark:bg-slate-700'}`}>
                      <Car size={15} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-300'} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{b.vehicleId?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{b.userId?.name || '—'} · {b.userId?.email || ''}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-medium">
                          {new Date(b.startTime).toLocaleDateString()}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600 text-xs">→</span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-medium">
                          {new Date(b.endTime).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">₹{b.totalPrice}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); getRoute(b) }}
                    disabled={routeLoading && selected?._id === b._id}
                    className={`mt-3 w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition-all font-semibold disabled:opacity-50 ${
                      isActive
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}>
                    <Navigation size={12} />
                    {routeLoading && selected?._id === b._id ? 'Fetching route...' : 'Show Route'}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">Legend</p>
            <div className="space-y-2">
              {[
                { color: '#2563eb', label: 'Vehicle', desc: 'Base location' },
                { color: '#10b981', label: 'Pickup', desc: "Customer's pickup point" },
                { color: '#93c5fd', label: 'Route', desc: 'Driving path' },
              ].map(({ color, label, desc }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">— {desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
