// Vitest: スキーマバリデーション失敗を意図したテスト
import { describe, it, expect } from "vitest";
// 仮のスキーマ（未実装なのでエラーになる想定）
import { chatMessageSchema } from "../schema";

describe("chatMessageSchema", () => {
  it("不正な型の場合はバリデーションエラーになる", () => {
    // chatMessageSchemaが未定義なのでテストは失敗する
    expect(() => {
      // @ts-expect-error
      chatMessageSchema.parse({ invalid: true });
    }).toThrow();
  });
});
