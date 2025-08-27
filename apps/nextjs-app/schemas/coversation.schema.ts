import { z, ZodType } from "zod";
import { ACCEPTED_FILE_TYPES, MAX_UPLOAD_SIZE } from "./settings.schema";

export type ConversationSearchScehmaProps = {
  query: string;
  domain: string;
};

export type ChatBotMessageProps = {
  content?: string;
  image?: string;
};

export type UserInfoFormProps = {
  name: string;
  email: string;
  phone?: string;
  countryCode: string;
};

export const ConversationSearchScehma: ZodType<ConversationSearchScehmaProps> =
  z.object({
    query: z.string().min(1, { message: "You must entry a seach query" }),
    domain: z.string().min(1, { message: "You must select a domain" }),
  });

export const ChatBotMessageSchema: ZodType<ChatBotMessageProps> = z
  .object({
    content: z.string().min(1, "Message cannot be empty").optional(),
    image: z.any().optional(),
  })
  .refine(
    (schema) => {
      // If content is provided, validation passes
      if (schema.content && schema.content.trim().length > 0) {
        return true;
      }

      // If image is provided and valid, validation passes
      if (schema.image?.length) {
        const firstImage = schema.image[0];
        if (
          firstImage?.type &&
          ACCEPTED_FILE_TYPES.includes(firstImage.type) &&
          firstImage.size <= MAX_UPLOAD_SIZE
        ) {
          return true;
        }
      }

      // If neither content nor valid image, fail validation
      return false;
    },
    {
      message: "Please provide either a message or a valid image",
    }
  );

export const UserInfoFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  countryCode: z.string().min(1, "Country code is required"),
});
