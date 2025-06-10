import * as z from "zod";
import {email} from "zod/v4";

export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, {message: "Email is requiring."})
      .email({message: "Please enter a valid email."}),
    password: z
      .string()
      .min(1, {message: "Password is requiring."})
      .max(8, {message: "password should be more than 8"}),

    passwordConfirmation: z
      .string()
      .min(1, {message: "Password is requiring."}),
  })
  .refine(
    (data) => (
      data.password === data.passwordConfirmation,
      {
        message: "Password do not match ",
        path: ["papasswordConfirmationss"],
      }
    )
  );
