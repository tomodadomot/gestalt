import { z } from "zod";
import { ChatId } from "../shared/brand";
import { Result } from "../shared/result";

// レスポンス型
export const chatResponseSchema = z.object({
  ok: z.boolean(),
  value: z
    .object({
      role: z.enum(["assistant", "user", "system"]),
      content: z.string(),
    })
    .optional(),
  error: z
    .object({
      type: z.string(),
      field: z.string().optional(),
      message: z.string(),
    })
    .optional(),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;

// fetchChat: チャットAPIへPOST
export async function fetchChat(chatId: ChatId, content: string) {
  const res = await fetch(`/api/chat/${chatId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, role: "user" }),
  });
  const json = await res.json();
  const parsed = chatResponseSchema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        type: "ParseError",
        message: "Invalid response",
      },
    } as Result<never, { type: string; message: string }>;
  }
  return parsed.data as Result<
    { role: "assistant" | "user" | "system"; content: string },
    { type: string; field?: string; message: string }
  >;
}
