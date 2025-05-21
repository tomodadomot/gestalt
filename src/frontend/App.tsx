import { useState } from "react";
import { atom, useAtom } from "jotai";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchChat } from "./api";
import { toChatId, ChatId } from "../shared/brand";

// メッセージ型
type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

// Jotai: messages配列
const messagesAtom = atom<Message[]>([]);

function getOrCreateChatId(): ChatId {
  let id = localStorage.getItem("chat_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("chat_id", id);
  }
  return toChatId(id);
}

export default function App() {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatId = getOrCreateChatId();

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    const res = await fetchChat(chatId, input);
    setLoading(false);
    if (res.ok && res.value) {
      setMessages((prev) => [...prev, res.value]);
    } else {
      setError(res.error?.message ?? "送信エラー");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-4 space-y-4">
        <div className="h-80 overflow-y-auto border rounded bg-white p-2 mb-2">
          {messages.map((m, i) => (
            <div key={i} className="mb-2">
              <span className="font-bold">{m.role === "user" ? "あなた" : "AI"}: </span>
              <span>{m.content}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) handleSend();
            }}
            placeholder="メッセージを入力"
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>
            送信
          </Button>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </Card>
    </div>
  );
}
