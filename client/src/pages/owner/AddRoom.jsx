import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const AddRoom = () => {
  const { API } = useAuth();
  const navigate = useNavigate();

  const provinceObj = new Province("en");
  const districtObj = new District("en");
  const municipalityObj = new Municipality("en");

  const [districts, setDistricts] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [wards, setWards] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Validation States
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [location, setLocation] = useState([28.3949, 84.124]);
  const [coordinates, setCoordinates] = useState([84.124, 28.3949]);
  const [mapZoom, setMapZoom] = useState(7);

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

  // Clean up object URLs to prevent memory leaks
  useEffect(
    () => () => images.forEach((img) => URL.revokeObjectURL(img.preview)),
    [images],
  );

  /* ---------------- Handlers ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear field-level error on input
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[name];
        return newErr;
      });
    }

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));

      if (key === "province") {
        const p = provinceObj.allProvinces().find((p) => p.name === value);
        setDistricts(
          p ? districtObj.getDistrictsByProvince(p.id).map((d) => d.name) : [],
        );
        setMunicipalities([]);
        setWards([]);
      }

      if (key === "district") {
        const p = provinceObj
          .allProvinces()
          .find((p) => p.name === form.address.province);
        const d = districtObj
          .getDistrictsByProvince(p.id)
          .find((d) => d.name === value);
        setMunicipalities(
          d
            ? municipalityObj
                .getMunicipalitiesByDistrict(d.id)
                .map((m) => m.name)
            : [],
        );
        setWards([]);
      }

      if (key === "municipality") {
        const m = municipalityObj
          .allMunicipalities()
          .find((m) => m.name === value);
        setWards(m ? municipalityObj.wards(m.id) : []);
      }

      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [
      ...prev,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
  };

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  /* ---------------- Map Components ---------------- */
  const MapController = ({ location, zoom }) => {
    const map = useMap();
    useEffect(() => {
      if (!map) return;
      map.flyTo(location, zoom);
    }, [location, zoom, map]);
    return null;
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setCoordinates([e.latlng.lng, e.latlng.lat]);
        setLocation([e.latlng.lat, e.latlng.lng]);
      },
    });
    return <Marker position={location} />;
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation([pos.coords.latitude, pos.coords.longitude]);
        setCoordinates([pos.coords.longitude, pos.coords.latitude]);
        setMapZoom(16);
        setLoading(false);
      },
      () => setLoading(false),
      { enableHighAccuracy: true },
    );
  };

  const handleViewLocation = async () => {
    const { province, district, municipality } = form.address;
    if (!province || !district || !municipality)
      return alert("Select all fields first");

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
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}`,
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

  /* ---------------- Submit Handler ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("rent", form.rent);
      fd.append("contact", form.contact);
      fd.append("description", form.description);

      // Send features as proper array
      form.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)
        .forEach((f) => fd.append("features", f));

      fd.append(
        "address",
        JSON.stringify({
          ...form.address,
          wardNo: Number(form.address.wardNo),
        }),
      );
      fd.append("location", JSON.stringify({ type: "Point", coordinates }));

      images.forEach((img) => fd.append("images", img.file));

      const res = await fetch(`${API}/api/rooms`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      console.log(res);
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          console.log(data.errors);
          const mapErr = {};
          data.errors.forEach((err) => {
            mapErr[err.field] = err.message;
          });
          setFieldErrors(mapErr);
          throw new Error("Correct the errors marked below");
        }
        throw new Error(data.message || "Something went wrong");
      }

      navigate("/owner/rooms");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f4fa] px-6 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#837ab6] text-center mb-6">
          Add New Room
        </h1>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Inputs */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Room Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              error={fieldErrors.title}
            />
            <Input
              label="Rent (Rs.)"
              name="rent"
              type="number"
              value={form.rent}
              onChange={handleChange}
              error={fieldErrors.rent}
            />
          </div>
          <Input
            label="Contact Number"
            name="contact"
            value={form.contact}
            onChange={handleChange}
            error={fieldErrors.contact}
          />

          {/* Address Selection */}
          <h3 className="font-semibold text-[#837ab6] border-b pb-2">
            Location Details
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Select
              label="Province"
              name="address.province"
              value={form.address.province}
              onChange={handleChange}
              options={provinceObj.allProvinces().map((p) => p.name)}
              error={fieldErrors["address.province"]}
            />
            <Select
              label="District"
              name="address.district"
              value={form.address.district}
              onChange={handleChange}
              options={districts}
              disabled={!districts.length}
              error={fieldErrors["address.district"]}
            />
            <Select
              label="Municipality"
              name="address.municipality"
              value={form.address.municipality}
              onChange={handleChange}
              options={municipalities}
              disabled={!municipalities.length}
              error={fieldErrors["address.municipality"]}
            />
            <Select
              label="Ward No"
              name="address.wardNo"
              value={form.address.wardNo}
              onChange={handleChange}
              options={wards}
              disabled={!wards.length}
              error={fieldErrors["address.wardNo"]}
            />
            <Input
              label="Street"
              name="address.street"
              value={form.address.street}
              onChange={handleChange}
              error={fieldErrors["address.street"]}
            />
            <Input
              label="Landmark"
              name="address.landmark"
              value={form.address.landmark}
              onChange={handleChange}
              error={fieldErrors["address.landmark"]}
            />
          </div>

          {/* Map */}
          <div className="my-4">
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={handleViewLocation}
                className="bg-[#837ab6] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90"
              >
                📍 Locate via Address
              </button>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
              >
                🎯 Use My GPS Location
              </button>
            </div>

            <div className="h-80 border rounded-xl overflow-hidden shadow-inner">
              <MapContainer
                center={location}
                zoom={mapZoom}
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapController location={location} zoom={mapZoom} />
                <LocationMarker />
              </MapContainer>
            </div>

            <p className="text-xs text-gray-500 mt-2 italic">
              * Click on the map to set exact room location
            </p>

            <div className="mt-1 flex items-center gap-2 bg-gray-100 p-2 rounded-md text-sm font-mono w-max">
              <span>
                Lat: {coordinates[1].toFixed(6)}, Lng:{" "}
                {coordinates[0].toFixed(6)}
              </span>
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`,
                  )
                }
                className="bg-[#837ab6] text-white px-2 py-1 rounded hover:bg-[#6c63a3] text-xs"
              >
                📋 Copy
              </button>
            </div>
          </div>

          <Textarea
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            error={fieldErrors.description}
          />
          <Textarea
            label="Features (comma separated)"
            name="features"
            value={form.features}
            placeholder="WiFi, Parking, Balcony"
            onChange={handleChange}
            error={fieldErrors.features}
          />

          {/* Images */}
          <div>
            <label className="block font-semibold text-gray-600 mb-2">
              Room Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#837ab6] file:text-white file:cursor-pointer"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {images.map((img, i) => (
                <div key={i} className="relative group shadow-sm">
                  <img
                    src={img.preview}
                    alt="preview"
                    className="h-24 w-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs shadow-md"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#837ab6] text-white py-4 rounded-xl font-bold hover:bg-[#6c63a3] transition-all disabled:opacity-50 shadow-lg"
          >
            {loading ? "Uploading Data..." : "Post Room Listing"}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ================= UI COMPONENTS ================= */
const Input = ({ label, error, ...props }) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-gray-600 mb-1">
      {label}
    </label>
    <input
      {...props}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#837ab6] outline-none transition-all ${
        error ? "border-red-500 bg-red-50" : "border-gray-300"
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
  </div>
);

const Textarea = ({ label, error, ...props }) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-gray-600 mb-1">
      {label}
    </label>
    <textarea
      {...props}
      rows="3"
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#837ab6] outline-none transition-all ${
        error ? "border-red-500 bg-red-50" : "border-gray-300"
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
  </div>
);

const Select = ({ label, options, disabled, error, ...props }) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-gray-600 mb-1">
      {label}
    </label>
    <select
      {...props}
      disabled={disabled}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#837ab6] outline-none bg-white transition-all disabled:bg-gray-100 ${
        error ? "border-red-500 bg-red-50" : "border-gray-300"
      }`}
    >
      <option value="">Select {label}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
  </div>
);

export default AddRoom;
