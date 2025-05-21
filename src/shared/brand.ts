// Brand型ユーティリティ
export type Brand<K, T> = K & { __brand: T };

// ChatId, MessageId のブランド型
export type ChatId = Brand<string, "ChatId">;
export type MessageId = Brand<string, "MessageId">;

// ブランド化ユーティリティ
export const toChatId = (v: string): ChatId => v as ChatId;
export const toMessageId = (v: string): MessageId => v as MessageId;
