import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../store/AuthContext.jsx";
import { Province, District, Municipality } from "states-nepal";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ===== Leaflet Icon Fix =====
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const municipalityCoordinates = {
  Dhangadhi: [28.7017, 80.594],
  Tikapur: [28.46, 81.0167],
  Bhimdatta: [28.95, 80.5333],
};

const EditRoom = () => {
  const { id } = useParams();
  const { API } = useAuth();
  const navigate = useNavigate();

  const provinceObj = new Province("en");
  const districtObj = new District("en");
  const municipalityObj = new Municipality("en");

  const [districts, setDistricts] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [wards, setWards] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [location, setLocation] = useState([28.3949, 84.124]);
  const [coordinates, setCoordinates] = useState([84.124, 28.3949]);
  const [mapZoom, setMapZoom] = useState(7);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    title: "",
    rent: "",
    contact: "",
    description: "",
    features: "",
    address: {
      country: "Nepal",
      province: "",
      district: "",
      municipality: "",
      wardNo: "",
      street: "",
      houseNo: "",
      landmark: "",
    },
  });

  // ---------------- Load Room Data ----------------
  useEffect(() => {
    fetch(`${API}/api/rooms/owner/rooms/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const r = data.room;
        setForm({
          title: r.title || "",
          rent: r.rent || "",
          contact: r.contact || "",
          description: r.description || "",
          features: Array.isArray(r.features) ? r.features.join(", ") : r.features || "",
          address: r.address || form.address,
        });
        setExistingImages(r.images || []);
        if (r.location?.coordinates) {
          const [lng, lat] = r.location.coordinates;
          setLocation([lat, lng]);
          setCoordinates([lng, lat]);
          setMapZoom(15);
        }

        // Restore dropdowns
        const p = provinceObj.allProvinces().find((x) => x.name === r.address.province);
        if (p) {
          const d = districtObj.getDistrictsByProvince(p.id);
          setDistricts(d.map((x) => x.name));
          const dist = d.find((x) => x.name === r.address.district);
          if (dist) {
            const m = municipalityObj.getMunicipalitiesByDistrict(dist.id);
            setMunicipalities(m.map((x) => x.name));
            const muni = m.find((x) => x.name === r.address.municipality);
            if (muni) setWards(municipalityObj.wards(muni.id));
          }
        }
        setLoading(false);
      });
  }, [id]);

  // ---------------- Handlers ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[name];
        return newErr;
      });
    }
    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((p) => ({
        ...p,
        address: { ...p.address, [key]: key === "wardNo" ? Number(value) : value },
      }));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleProvince = (e) => {
    const name = e.target.value;
    const p = provinceObj.allProvinces().find((x) => x.name === name);
    if (p) {
      const d = districtObj.getDistrictsByProvince(p.id);
      setDistricts(d.map((x) => x.name));
      setMunicipalities([]);
      setWards([]);
    }
    handleChange(e);
  };

  const handleDistrict = (e) => {
    const name = e.target.value;
    const d = districtObj.allDistricts().find((x) => x.name === name);
    if (d) {
      const m = municipalityObj.getMunicipalitiesByDistrict(d.id);
      setMunicipalities(m.map((x) => x.name));
      setWards([]);
    }
    handleChange(e);
  };

  const handleMunicipality = (e) => {
    const name = e.target.value;
    const m = municipalityObj.allMunicipalities().find((x) => x.name === name);
    if (m) setWards(municipalityObj.wards(m.id));
    handleChange(e);
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((p) => [
      ...p,
      ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f) })),
    ]);
  };

  const removeExisting = (img) => setExistingImages((p) => p.filter((i) => i !== img));
  const removeNew = (i) => setNewImages((p) => p.filter((_, x) => x !== i));

  // ---------------- Map ----------------
  const MapController = ({ location, zoom }) => {
    const map = useMap();
    useEffect(() => {
      map.flyTo(location, zoom);
    }, [location, zoom]);
    return null;
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setLocation([e.latlng.lat, e.latlng.lng]);
        setCoordinates([e.latlng.lng, e.latlng.lat]);
      },
    });
    return <Marker position={location} />;
  };

  const handleViewLocation = async () => {
    const { province, district, municipality } = form.address;
    if (!province || !district || !municipality) return alert("Select all fields first");

    if (municipalityCoordinates[municipality]) {
      const [lat, lng] = municipalityCoordinates[municipality];
      setLocation([lat, lng]);
      setCoordinates([lng, lat]);
      setMapZoom(14);
      return;
    }

    try {
      const query = `${municipality}, ${district}, ${province}, Nepal`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      if (data.length) {
        setLocation([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setCoordinates([parseFloat(data[0].lon), parseFloat(data[0].lat)]);
        setMapZoom(14);
      } else {
        alert("Location not found, click manually on map");
      }
    } catch {
      alert("Error fetching location");
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation([pos.coords.latitude, pos.coords.longitude]);
        setCoordinates([pos.coords.longitude, pos.coords.latitude]);
        setMapZoom(16);
      },
      () => {},
      { enableHighAccuracy: true }
    );
  };

  // ---------------- Submit ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("rent", form.rent);
      fd.append("contact", form.contact);
      fd.append("description", form.description);

      form.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)
        .forEach((f) => fd.append("features", f));

      fd.append("address", JSON.stringify(form.address));
      fd.append("location", JSON.stringify({ type: "Point", coordinates }));
      fd.append("existingImages", JSON.stringify(existingImages));
      newImages.forEach((img) => fd.append("images", img.file));

      const res = await fetch(`${API}/api/rooms/${id}`, {
        method: "PUT",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const mapErr = {};
          data.errors.forEach((err) => (mapErr[err.field] = err.message));
          setFieldErrors(mapErr);
          throw new Error("Please correct the errors");
        }
        throw new Error(data.message || "Update failed");
      }
      navigate("/owner/rooms");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-[#f6f4fa] px-6 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#837ab6] text-center mb-6">Edit Room</h1>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-6 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Inputs */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Room Title" name="title" value={form.title} onChange={handleChange} error={fieldErrors.title} />
            <Input label="Rent (Rs.)" name="rent" type="number" value={form.rent} onChange={handleChange} error={fieldErrors.rent} />
          </div>
          <Input label="Contact Number" name="contact" value={form.contact} onChange={handleChange} error={fieldErrors.contact} />
          <Textarea label="Description" name="description" value={form.description} onChange={handleChange} error={fieldErrors.description} />
          <Textarea label="Features (comma separated)" name="features" value={form.features} onChange={handleChange} error={fieldErrors.features} />

          {/* Address */}
          <h3 className="font-semibold text-[#837ab6] border-b pb-2">Location Details</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Select label="Province" name="address.province" value={form.address.province} onChange={handleProvince} options={provinceObj.allProvinces().map((p) => p.name)} error={fieldErrors["address.province"]} />
            <Select label="District" name="address.district" value={form.address.district} onChange={handleDistrict} options={districts} error={fieldErrors["address.district"]} />
            <Select label="Municipality" name="address.municipality" value={form.address.municipality} onChange={handleMunicipality} options={municipalities} error={fieldErrors["address.municipality"]} />
            <Select label="Ward No" name="address.wardNo" value={form.address.wardNo} onChange={handleChange} options={wards} error={fieldErrors["address.wardNo"]} />
            <Input label="Street" name="address.street" value={form.address.street} onChange={handleChange} error={fieldErrors["address.street"]} />
            <Input label="House No" name="address.houseNo" value={form.address.houseNo} onChange={handleChange} error={fieldErrors["address.houseNo"]} />
            <Input label="Landmark" name="address.landmark" value={form.address.landmark} onChange={handleChange} error={fieldErrors["address.landmark"]} />
          </div>

          {/* Map */}
          <div className="my-4">
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={handleViewLocation} className="bg-[#837ab6] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">📍 Locate via Address</button>
              <button type="button" onClick={handleGetCurrentLocation} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700">🎯 Use My GPS Location</button>
            </div>
            <div className="h-80 border rounded-xl overflow-hidden shadow-inner">
              <MapContainer center={location} zoom={mapZoom} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapController location={location} zoom={mapZoom} />
                <LocationMarker />
              </MapContainer>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">* Click on the map to set exact room location</p>
            <div className="mt-1 flex items-center gap-2 bg-gray-100 p-2 rounded-md text-sm font-mono w-max">
              <span>Lat: {coordinates[1].toFixed(6)}, Lng: {coordinates[0].toFixed(6)}</span>
              <button type="button" onClick={() => navigator.clipboard.writeText(`${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`)} className="bg-[#837ab6] text-white px-2 py-1 rounded hover:bg-[#6c63a3] text-xs">📋 Copy</button>
            </div>
          </div>

          {/* Existing Images */}
          <h3 className="font-semibold text-[#837ab6]">Existing Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {existingImages.map((img, i) => (
              <div key={i} className="relative group shadow-sm">
                <img src={img.url.startsWith("http") ? img.url : `${API}${img.url}`} alt="room" className="h-24 w-full object-cover rounded-lg border" />
                <button type="button" onClick={() => removeExisting(img)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs shadow-md">✕</button>
              </div>
            ))}
          </div>

          {/* New Images */}
          <h3 className="font-semibold text-[#837ab6]">Add New Images</h3>
          <input type="file" multiple accept="image/*" onChange={handleNewImages} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#837ab6] file:text-white file:cursor-pointer mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newImages.map((img, i) => (
              <div key={i} className="relative group shadow-sm">
                <img src={img.preview} className="h-24 w-full object-cover rounded-lg border" />
                <button type="button" onClick={() => removeNew(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs shadow-md">✕</button>
              </div>
            ))}
          </div>

          <button disabled={saving} className="w-full bg-[#837ab6] text-white py-4 rounded-xl font-bold hover:bg-[#6c63a3] transition-all disabled:opacity-50 shadow-lg">{saving ? "Updating Room..." : "Update Room"}</button>
        </form>
      </div>
    </div>
  );
};

/* ================= UI COMPONENTS ================= */
const Input = ({ label, error, ...props }) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-gray-600 mb-1">{label}</label>
    <input {...props} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#837ab6] outline-none transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"}`} />
    {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
  </div>
);

const Textarea = ({ label, error, ...props }) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-gray-600 mb-1">{label}</label>
    <textarea {...props} rows="3" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#837ab6] outline-none transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"}`} />
    {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
  </div>
);

const Select = ({ label, options, disabled, error, ...props }) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-gray-600 mb-1">{label}</label>
    <select {...props} disabled={disabled} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#837ab6] outline-none bg-white transition-all disabled:bg-gray-100 ${error ? "border-red-500 bg-red-50" : "border-gray-300"}`}>
      <option value="">Select {label}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
  </div>
);

export default EditRoom;
