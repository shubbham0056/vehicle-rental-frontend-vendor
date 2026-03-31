import { useState, useRef, useEffect } from 'react'
import { Pencil, Trash2, Plus, X, Upload, MapPin, Car } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../../context/AuthContext'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const empty = { name: '', type: 'Sedan', status: 'Available', pricePerHour: '', pricePerDay: '', pricePerWeek: '', image: '', location: [27.7172, 85.3240], fuel: 'Petrol', transmission: 'Auto', seats: 5 }

const statusStyles = {
  Available:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Rented:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Maintenance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

function LocationPicker({ location, onChange }) {
  useMapEvents({ click(e) { onChange([e.latlng.lat, e.latlng.lng]) } })
  return location ? <Marker position={location} /> : null
}

export default function Vehicles() {
  const { user, authFetch } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [tab, setTab] = useState('details')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef()

  useEffect(() => { fetchVehicles() }, [])

  const fetchVehicles = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/vehicles')
      const data = await res.json()
      setVehicles(res.ok ? data : [])
    } catch {
      setVehicles([])
    }
    setLoading(false)
  }

  const openAdd  = () => { setForm(empty); setTab('details'); setModal('add') }
  const openEdit = (v) => { setForm({ ...v, location: v.location || [27.7172, 85.3240] }); setTab('details'); setModal(v) }
  const closeModal = () => setModal(null)

  const handleImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await authFetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) setForm(f => ({ ...f, image: data.url }))
      else setUploadError(data.msg || 'Upload failed')
    } catch (err) {
      setUploadError('Upload failed. Check your connection.')
    }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (modal === 'add') {
        const res = await authFetch('/api/vehicles', { method: 'POST', body: JSON.stringify(form) })
        const data = await res.json()
        if (res.ok) setVehicles(v => [...v, data])
      } else {
        const res = await authFetch(`/api/vehicles/${modal._id}`, { method: 'PUT', body: JSON.stringify(form) })
        const data = await res.json()
        if (res.ok) setVehicles(v => v.map(x => x._id === modal._id ? data : x))
      }
    } catch {
      // silently ignore network errors; user can retry
    }
    setSaving(false)
    closeModal()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle? This action cannot be undone.')) return
    try {
      await authFetch(`/api/vehicles/${id}`, { method: 'DELETE' })
      setVehicles(v => v.filter(x => x._id !== id))
    } catch {
      // silently ignore network errors
    }
  }

  const inp = 'w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400'

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Vehicles</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{vehicles.length} vehicles in your fleet</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2.5 rounded-lg transition-colors font-medium shadow-sm">
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No vehicles yet. Add your first one!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {vehicles.map(v => (
            <div key={v._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="h-44 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden relative">
                {v.image
                  ? <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                  : <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-slate-600"><Car size={36} /><span className="text-xs">No image</span></div>}
                <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[v.status]}`}>{v.status}</span>
              </div>
              <div className="p-4">
                <p className="font-semibold text-slate-800 dark:text-white">{v.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 mb-3">{v.type} · {v.fuel} · {v.transmission}</p>
                <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {v.pricePerHour && <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">₹{v.pricePerHour}/hr</span>}
                  {v.pricePerDay  && <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">₹{v.pricePerDay}/day</span>}
                  {v.pricePerWeek && <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">₹{v.pricePerWeek}/wk</span>}
                </div>
                {v.location?.length === 2 && (
                  <p className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mb-3">
                    <MapPin size={11} /> {v.location[0].toFixed(4)}, {v.location[1].toFixed(4)}
                  </p>
                )}
                <div className="flex gap-2">
                  <button onClick={() => openEdit(v)} className="flex-1 flex items-center justify-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 rounded-lg transition-colors font-medium">
                    <Pencil size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(v._id)} className="flex-1 flex items-center justify-center gap-1.5 text-xs text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors font-medium">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white">{modal === 'add' ? 'Add New Vehicle' : 'Edit Vehicle'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>

            <div className="flex border-b border-slate-100 dark:border-slate-700 px-6">
              {[['details', 'Vehicle Details'], ['location', 'Set Location']].map(([t, label]) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`py-3 px-1 mr-5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {tab === 'details' ? (
                <div className="space-y-4">
                  <div onClick={() => !uploading && fileRef.current.click()}
                    className="h-36 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors overflow-hidden">
                    {uploading
                      ? <p className="text-xs text-slate-400">Uploading...</p>
                      : form.image
                        ? <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                        : <><Upload size={22} className="text-slate-300 dark:text-slate-600 mb-1.5" /><p className="text-xs text-slate-400">Click to upload vehicle image</p></>}
                  </div>
                  {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Vehicle Name</label>
                      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inp} placeholder="e.g. Toyota Camry" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Type</label>
                      <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inp}>
                        {['Sedan','SUV','Van','Bike','Scooty','Truck','Luxury'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Status</label>
                      <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inp}>
                        <option>Available</option><option>Rented</option><option>Maintenance</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Fuel</label>
                      <select value={form.fuel} onChange={e => setForm({ ...form, fuel: e.target.value })} className={inp}>
                        {['Petrol','Diesel','Electric','Hybrid'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Transmission</label>
                      <select value={form.transmission} onChange={e => setForm({ ...form, transmission: e.target.value })} className={inp}>
                        <option>Auto</option><option>Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Seats</label>
                      <input type="number" value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} className={inp} placeholder="5" />
                    </div>
                    {[['pricePerHour','Price / Hour (₹)'],['pricePerDay','Price / Day (₹)'],['pricePerWeek','Price / Week (₹)']].map(([key, lbl]) => (
                      <div key={key}>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">{lbl}</label>
                        <input type="number" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className={inp} placeholder="0" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Click on the map to set the vehicle pickup location.</p>
                  <div className="h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600">
                    <MapContainer center={form.location || [27.7172, 85.3240]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationPicker location={form.location} onChange={loc => setForm(f => ({ ...f, location: loc }))} />
                    </MapContainer>
                  </div>
                  {form.location && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin size={11} /> {form.location[0].toFixed(5)}, {form.location[1].toFixed(5)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700">
              <button onClick={closeModal} className="flex-1 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm py-2.5 rounded-lg transition-colors font-medium">
                {saving ? 'Saving...' : modal === 'add' ? 'Add Vehicle' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
