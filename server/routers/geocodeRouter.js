// routes/geocode.js
import express from "express";
const router = express.Router();

router.get("/", async (req, res) => {
  const query = req.query.q;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=np&q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent": "RoomApp/1.0",
        },
      },
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Geocoding failed" });
  }
});

export default router;
