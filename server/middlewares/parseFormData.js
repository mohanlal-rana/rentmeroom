export const parseFormData = (req, res, next) => {
  try {
    // Parse address
    if (req.body.address && typeof req.body.address === "string") {
      req.body.address = JSON.parse(req.body.address);
    }

    // Parse location
    if (req.body.location && typeof req.body.location === "string") {
      req.body.location = JSON.parse(req.body.location);
    }

    // Convert features to array
    if (req.body.features && !Array.isArray(req.body.features)) {
      req.body.features = [req.body.features].filter(Boolean);
    }
    if (
      req.body.existingImages &&
      typeof req.body.existingImages === "string"
    ) {
      req.body.existingImages = JSON.parse(req.body.existingImages);
    }

    next();
  } catch (err) {
    return res.status(400).json({
      errors: [
        {
          field: "form",
          message: "Invalid JSON format in form data",
        },
      ],
    });
  }
};
