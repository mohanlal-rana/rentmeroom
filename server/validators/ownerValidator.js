import zod, { z } from "zod";
const ownerSchema = zod.object({
  phone: z.string()
  .length(10, "Phone number must be exactly 10 digits")
  .regex(/^\d+$/, "Phone number must contain only digits"),
  profileImage: z.string().regex(/\.(jpg|jpeg|png)$/i, "Only JPG/PNG allowed"),
  address: z.string().optional(),
  govIDType: z.string().min(1, "Gov ID Type is required"),
  govIDNumber: z.string().min(1, "Gov ID Number is required"),
  govIDImage: z.string().regex(/\.(jpg|jpeg|png)$/i, "Only JPG/PNG allowed"),
  facebook: z.string().optional(),
  whatsapp: z.string().optional(),
  bio: z.string().optional(),
});
export { ownerSchema };
