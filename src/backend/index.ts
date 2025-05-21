/**
 * Cloudflare Workerエントリポイント
 * - Resultパターン・Brand型・SYSTEM_PROMPT対応
 * - バリデーションはvalidateBodyミドルウェアで実行
 */
import { Hono } from "hono";
import { chatMessageSchema, chatIdSchema } from "../shared/schema";
import { validateBody } from "../server/middleware/validate";
import { ok, err, Result } from "../shared/result";
import { AppError, OpenAIError, D1Error } from "../shared/errors";
import { toChatId } from "../shared/brand";

type Env = {
  DB: D1Database;
  OPENAI_API_KEY: string;
  SYSTEM_PROMPT: string;
};

type ChatValidation = {
  validationResult?: Result<
    { content: string; role: "user" | "assistant" | "system" },
    AppError
  >;
};

const app = new Hono<{ Bindings: Env; Variables: ChatValidation }>();

app.post(
  "/api/chat/:chatId/message",
  validateBody(chatMessageSchema.pick({ content: true, role: true })),
  async (c) => {
    // chatIdをBrand型で取得
    const chatIdRaw = c.req.param("chatId");
    const chatIdParse = chatIdSchema.safeParse(chatIdRaw);
    if (!chatIdParse.success) {
      const error: AppError = {
        type: "ValidationError",
        field: "chatId",
        message: "Invalid chatId",
      };
      return c.json(err(error), 400);
    }
    const chatId = toChatId(chatIdParse.data);

    // バリデーション結果取得
    const validationResult = c.get("validationResult") as Result<
      { content: string; role: "user" | "assistant" | "system" },
      AppError
    >;
    if (!validationResult.ok) {
      return c.json(validationResult, 400);
    }
    const { content } = validationResult.value;

    // D1から直近10件取得
    let messages: { role: string; content: string }[] = [];
    try {
      const { results } = await c.env.DB.prepare(
        "SELECT role, content FROM messages WHERE chat_id = ? ORDER BY ts DESC LIMIT 10"
      )
        .bind(chatId)
        .all();
      messages = results.reverse();
    } catch (e: unknown) {
      const error: D1Error = {
        type: "D1Error",
        message: e instanceof Error ? e.message : "D1 error",
      };
      return c.json(err(error), 500);
    }

    // SYSTEM_PROMPTをsystemメッセージとして先頭に追加
    const openaiMessages = [
      { role: "system", content: c.env.SYSTEM_PROMPT },
      ...messages,
      { role: "user", content },
    ];

    // OpenAI API呼び出し
    let ai: { role: string; content: string } | undefined;
    try {
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${c.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: openaiMessages,
          temperature: 0.7,
          max_tokens: 512,
        }),
      });

      if (!openaiRes.ok) {
        const error: OpenAIError = {
          type: "OpenAIError",
          message: await openaiRes.text(),
        };
        return c.json(err(error), 500);
      }

      const data = await openaiRes.json();
      ai = data.choices?.[0]?.message;
    } catch (e: unknown) {
      const error: OpenAIError = {
        type: "OpenAIError",
        message: e instanceof Error ? e.message : "OpenAI error",
      };
      return c.json(err(error), 500);
    }

    return c.json(
      ok({
        role: ai?.role ?? "assistant",
        content: ai?.content ?? "",
      })
    );
  }
);

app.get("*", async (c) => {
  // dist/index.html を返す
  const file = await fetch("dist/index.html", { cf: { cacheTtl: 60 } });
  return new Response(await file.text(), {
    headers: { "content-type": "text/html" },
  });
});

export default app;
