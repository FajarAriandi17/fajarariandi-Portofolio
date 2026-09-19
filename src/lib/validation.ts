import { z } from "zod";

/**
 * Contact form contract, shared by the client form and the API route.
 *
 * Defining it once means client-side validation can never drift from what the
 * server actually accepts — a class of bug that otherwise only shows up as a
 * confusing 400 after a user has typed a long message.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name (at least 2 characters).")
    .max(80, "That name is a little too long."),
  email: z
    .string()
    .trim()
    .min(1, "An email address is required so I can reply.")
    .email("That doesn't look like a valid email address.")
    .max(160, "That email address is too long."),
  subject: z
    .string()
    .trim()
    .min(3, "Please add a short subject.")
    .max(120, "That subject is too long."),
  message: z
    .string()
    .trim()
    .min(20, "Please add a little more detail (at least 20 characters).")
    .max(4000, "That message is too long — 4000 characters maximum."),
  /**
   * Honeypot. Real users never see this field; naive bots fill every input.
   * Any value passes here — the API decides what to do with it — so the field
   * never surfaces as a validation error and a bot gets no signal that it
   * tripped the trap.
   */
  company: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Field-keyed error map, suitable for rendering inline under each input. */
export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

/** Runs the schema and flattens Zod issues into the first error per field. */
export function validateContact(input: unknown): {
  success: boolean;
  errors: ContactErrors;
} {
  const result = contactSchema.safeParse(input);

  if (result.success) return { success: true, errors: {} };

  const errors: ContactErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ContactInput | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }

  return { success: false, errors };
}
