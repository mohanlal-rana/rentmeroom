import { z } from "zod";

export const createRoomSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),

  rent: z.coerce
    .number({ invalid_type_error: "Rent must be a number" })
    .positive("Rent must be positive"),

  address: z.object({
    country: z.string().min(2, "Country is required"),
    province: z.string().min(2, "Province is required"),
    district: z.string().min(2, "District is required"),
    municipality: z.string().min(2, "Municipality is required"),
    wardNo: z.coerce
      .number({ invalid_type_error: "Ward number must be a number" })
      .min(1, "Ward number must be at least 1"),
    street: z.string().min(2,"street is required"),
    houseNo: z.string().min(2, "houseNo is required"),
    landmark: z.string().min(2, "landmark is required"),
  }),

  contact: z
    .string()
    .min(7, "Contact must be valid")
    .regex(/^[0-9+()-\s]+$/, "Contact contains invalid characters"),

  description: z.string().min(10, "Description must be at least 10 characters"),

  features: z.array(z.string()).default([]),

  // images: z.array(z.any()).min(1, "At least one image is required"),
  images: z.array(z.any()).optional(),

  location: z
    .object({
      type: z.literal("Point").default("Point"),
      coordinates: z
        .array(z.number())
        .length(2, "Coordinates must be [longitude, latitude]"),
    })
    .optional()
    .nullable(),
});
