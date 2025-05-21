/**
 * チャットメッセージ用Zodスキーマ
 */
import { z } from "zod";
import { ChatId, MessageId } from "./brand";

// ChatId/MessageIdのzodスキーマ
export const chatIdSchema = z.string().uuid().brand<"ChatId">();
export const messageIdSchema = z.string().uuid().brand<"MessageId">();

export const chatMessageSchema = z.object({
  id: messageIdSchema.optional(),
  chat_id: chatIdSchema,
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(2048),
  ts: z.string().datetime().optional(),
});
