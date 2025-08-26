import { z } from "zod";

export const MAX_UPLOAD_SIZE = 2 * 1024 * 1024; // 2MB in bytes
export const ACCEPTED_FILE_TYPES = ["image/png", "image/jpg", "image/jpeg"];

export type DomainSettingsProps = {
  domain?: string;

  image?: any;
  welcomeMessage?: string;
};

export type HelpDeskQuestionsProps = {
  question: string;
  answered: string;
};

export type FilterQuestionsProps = {
  question: string;
  answered: string;
};

export const AddDomainSchema = z.object({
  domain: z
    .string()
    .min(4, { message: "A domain must have atleast 3 characters" })
    .refine(
      (value) =>
        /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.(?!-)[a-zA-Z0-9-]{1,63}(?<!-))*\.[a-zA-Z]{2,}$/.test(
          value ?? ""
        ),
      "This is not a valid domain"
    ),

  image: z
    .any()
    .refine((files) => files?.[0]?.size <= MAX_UPLOAD_SIZE, {
      message: "Your file size must be less than 2MB",
    })
    .refine((files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type), {
      message: "Only JPG, JPEG & PNG are accepted file formats",
    }),
});

export const DomainSettingsSchema = z
  .object({
    domain: z
      .string()
      .min(4, { message: "A domain must have atleast 3 characters" })
      .refine(
        (value) =>
          /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.(?!-)[a-zA-Z0-9-]{1,63}(?<!-))*\.[a-zA-Z]{2,}$/.test(
            value ?? ""
          ),
        "This is not a valid domain"
      )
      .optional()
      .or(z.literal("").transform(() => undefined)),
    image: z.any().optional(),
    welcomeMessage: z
      .string()
      .min(6, "This message must be atleast 6 characters")
      .optional()
      .or(z.literal("").transform(() => undefined)),
  })
  .refine(
    (schema) => {
      if (schema.image?.length) {
        if (
          !ACCEPTED_FILE_TYPES.includes(schema.image?.[0].type) ||
          schema.image?.[0].size > MAX_UPLOAD_SIZE
        ) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        "The file must be less than 2MB. Only PNG, JPEG & JPG files are accepted",
      path: ["image"],
    }
  );

export const HelpDeskQuestionsScehma = z.object({
  question: z.string().min(1, { message: "Question cannot be left empty" }),
  answer: z.string().min(1, { message: "Question cannot be left empty" }),
});

export const FilterQuestionsSchema = z.object({
  question: z.string().min(1, { message: "Question cannot be left empty" }),
  answered: z.string().min(1, { message: "Answer cannot be left empty" }),
});

export const AddProductSchema = z.object({
  name: z
    .string()
    .min(3, { message: "The name must have atleast 3 characters" }),
  image: z
    .any()
    .refine((files) => files?.[0]?.size == MAX_UPLOAD_SIZE, {
      message: "Your file size must be less than 2MB",
    })
    .refine((files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type), {
      message: "Only JPG, JPEG and PNG are accepted file formats",
    }),
  price: z.string(),
});
