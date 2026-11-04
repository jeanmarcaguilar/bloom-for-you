import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(200),
});

export const nicknameSchema = z.object({
  nickname: z.string().trim().toLowerCase().min(2, "Please type your nickname.").max(40, "That nickname is too long."),
});