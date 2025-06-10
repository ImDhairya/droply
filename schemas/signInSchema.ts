import * as z from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, {message: "Email is required"})
    .email({message: "Please enter a valid email address"}),
  password: z.string().min(1, {message: "Please enter a valid password"}),
});
