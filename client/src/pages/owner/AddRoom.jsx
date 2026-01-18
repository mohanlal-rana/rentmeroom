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

// Fix Leaflet icon issue
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
  const [error, setError] = useState("");

  // Default to a central point in Nepal if geolocation fails
  const [location, setLocation] = useState([28.3949, 84.124]);
  const [coordinates, setCoordinates] = useState([84.124, 28.3949]);
  const [mapZoom, setMapZoom] = useState(7);

  // Clean up image previews on unmount
  useEffect(
    () => () => images.forEach((img) => URL.revokeObjectURL(img.preview)),
    [images]
  );

  /* ---------------- Geolocation Logic ---------------- */

  // 1. Detect location automatically on Page Load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateMapPosition(latitude, longitude, 13);
        },
        () => console.log("User denied location access or error occurred.")
      );
    }
  }, []);

  // 2. "Use My Current Location" Button Handler
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateMapPosition(latitude, longitude, 16); // Close zoom for GPS
        setLoading(false);
      },
      (err) => {
        alert("Unable to retrieve location. Please check permissions.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const updateMapPosition = (lat, lng, zoom) => {
    setLocation([lat, lng]);
    setCoordinates([lng, lat]); // GeoJSON standard is [longitude, latitude]
    setMapZoom(zoom);
  };

  const handleViewLocation = async () => {
    const { province, district, municipality } = form.address;
    if (!province || !district || !municipality) {
      alert("Please select Province, District, and Municipality first.");
      return;
    }

    if (municipalityCoordinates[municipality]) {
      const [lat, lng] = municipalityCoordinates[municipality];
      updateMapPosition(lat, lng, 14);
      return;
    }

    try {
      const query = `${municipality}, ${district}, ${province}, Nepal`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        updateMapPosition(parseFloat(data[0].lat), parseFloat(data[0].lon), 14);
      } else {
        alert("Location not found. Please click manually on the map.");
      }
    } catch (err) {
      alert("Error fetching location.");
    }
  };

  /* ---------------- Form Handlers ---------------- */
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "address.province") {
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          province: value,
          district: "",
          municipality: "",
          wardNo: "",
        },
      }));
      const selectedProvince = provinceObj
        .allProvinces()
        .find((p) => p.name === value);
      setDistricts(
        selectedProvince
          ? districtObj
              .getDistrictsByProvince(selectedProvince.id)
              .map((d) => d.name)
          : []
      );
      return;
    }
    if (name === "address.district") {
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          district: value,
          municipality: "",
          wardNo: "",
        },
      }));
      const selectedProvince = provinceObj
        .allProvinces()
        .find((p) => p.name === form.address.province);
      const selectedDistrict = districtObj
        .getDistrictsByProvince(selectedProvince.id)
        .find((d) => d.name === value);
      setMunicipalities(
        selectedDistrict
          ? municipalityObj
              .getMunicipalitiesByDistrict(selectedDistrict.id)
              .map((m) => m.name)
          : []
      );
      return;
    }
    if (name === "address.municipality") {
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, municipality: value, wardNo: "" },
      }));
      const selectedProvince = provinceObj
        .allProvinces()
        .find((p) => p.name === form.address.province);
      const selectedDistrict = districtObj
        .getDistrictsByProvince(selectedProvince.id)
        .find((d) => d.name === form.address.district);
      const selectedMunicipality = municipalityObj
        .getMunicipalitiesByDistrict(selectedDistrict.id)
        .find((m) => m.name === value);
      setWards(
        selectedMunicipality
          ? municipalityObj.wards(selectedMunicipality.id)
          : []
      );
      return;
    }
    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
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
  const MapController = () => {
    const map = useMap();
    useEffect(() => {
      map.flyTo(location, mapZoom);
    }, [location, mapZoom, map]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === "address" || key === "features")
          formData.append(
            key,
            JSON.stringify(
              key === "features"
                ? form[key].split(",").map((f) => f.trim())
                : { ...form.address, wardNo: Number(form.address.wardNo) }
            )
          );
        else if (key !== "address" && key !== "features")
          formData.append(key, form[key]);
      });
      formData.append(
        "location",
        JSON.stringify({ type: "Point", coordinates })
      );
      images.forEach((img) => formData.append("images", img.file));

      const res = await fetch(`${API}/api/rooms`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create room");
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
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Room Title" name="title" onChange={handleChange} />
            <Input
              label="Rent (Rs.)"
              name="rent"
              type="number"
              onChange={handleChange}
            />
          </div>
          <Input
            label="Contact Number"
            name="contact"
            onChange={handleChange}
          />

          <h3 className="font-semibold text-[#837ab6] mb-2">
            Address Selection
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Select
              label="Province"
              name="address.province"
              value={form.address.province}
              onChange={handleChange}
              options={provinceObj.allProvinces().map((p) => p.name)}
            />
            <Select
              label="District"
              name="address.district"
              value={form.address.district}
              onChange={handleChange}
              options={districts}
              disabled={!districts.length}
            />
            <Select
              label="Municipality"
              name="address.municipality"
              value={form.address.municipality}
              onChange={handleChange}
              options={municipalities}
              disabled={!municipalities.length}
            />
            <Select
              label="Ward No"
              name="address.wardNo"
              value={form.address.wardNo}
              onChange={handleChange}
              options={wards}
              disabled={!wards.length}
            />
            <Input
              label="Street"
              name="address.street"
              onChange={handleChange}
            />
            <Input
              label="House No"
              name="address.houseNo"
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleViewLocation}
              className="bg-[#837ab6] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 text-sm font-medium flex items-center gap-2"
            >
              📍 Locate via Address
            </button>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm font-medium flex items-center gap-2"
            >
              🎯 Use My GPS Location
            </button>
          </div>

          <div className="h-80 border rounded-xl overflow-hidden mt-4">
            <MapContainer
              center={location}
              zoom={mapZoom}
              className="h-full w-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapController />
              <LocationMarker />
            </MapContainer>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mt-2 px-1">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Selected Location
              </p>
              <div className="flex gap-4 mt-1">
                <div className="bg-gray-100 px-3 py-1 rounded-md border border-gray-200">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">
                    Latitude
                  </span>
                  <code className="text-sm text-[#837ab6] font-mono">
                    {location[0].toFixed(6)}
                  </code>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-md border border-gray-200">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">
                    Longitude
                  </span>
                  <code className="text-sm text-[#837ab6] font-mono">
                    {location[1].toFixed(6)}
                  </code>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 italic flex items-center gap-1 md:justify-end">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="Height-13 13 4 4L19 7"
                  />
                </svg>
                Drag the marker or click map for precision
              </p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${location[0]}, ${location[1]}`
                  );
                  alert("Coordinates copied!");
                }}
                className="text-[10px] text-[#837ab6] hover:underline mt-1 font-semibold uppercase tracking-wider"
              >
                Copy Coordinates
              </button>
            </div>
          </div>

          <Textarea
            label="Description"
            name="description"
            onChange={handleChange}
          />
          <Textarea
            label="Features (comma separated)"
            name="features"
            placeholder="WiFi, Parking, Balcony"
            onChange={handleChange}
          />

          <div>
            <label className="block font-semibold text-gray-600 mb-2">
              Room Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#837ab6] file:text-white"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img.preview}
                    alt="preview"
                    className="h-24 w-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#837ab6] text-white py-3 rounded-xl font-bold hover:bg-[#6c63a3] transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Submit Room Listing"}
          </button>
        </form>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-1">
      {label}
    </label>
    <input
      {...props}
      required
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#837ab6] outline-none"
    />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-1">
      {label}
    </label>
    <textarea
      {...props}
      rows="3"
      required
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#837ab6] outline-none"
    />
  </div>
);

const Select = ({ label, options, disabled, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-1">
      {label}
    </label>
    <select
      {...props}
      disabled={disabled}
      required
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#837ab6] outline-none bg-white"
    >
      <option value="">Select {label}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default AddRoom;
