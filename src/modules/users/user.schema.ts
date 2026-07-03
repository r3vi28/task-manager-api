import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(1, "Name is mandatory"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must have 8 character at least"),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is mandatory"),
});

export { registerSchema, loginSchema };