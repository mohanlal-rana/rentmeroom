import zod, { z } from "zod";
export const createRoomSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  rent: z
    .number({ invalid_type_error: "Rent must be a number" })
    .positive("Rent must be positive"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  contact: z
    .string()
    .min(10, "Contact must be valid")
    .regex(/^[0-9+()-\s]+$/, "Contact contains invalid characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  features: z.array(z.string()).optional().default([]),
  images: z
    .array(
      z.object({
        url: z.string().url("Image URL must be valid"),
        public_id: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  location: z
    .object({
      type: z.enum(["Point"]).optional().default("Point"),
      coordinates: z
        .array(z.number())
        .length(2, "Coordinates must have [longitude, latitude]")
        .optional(),
    })
    .optional()
    .nullable(),
});
