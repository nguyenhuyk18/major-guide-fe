import { instanceCallApi } from "./api.setting";

const JSON_HEADERS = { headers: { "Content-Type": "application/json" }, timeout: 95000 };

/** Last turns of the conversation, trimmed to what the API accepts. */
export const toHistory = (messages, limit = 10) =>
  messages
    .filter((message) => message.id !== "welcome" && !message.isError && typeof message.content === "string" && message.content.trim())
    .slice(-limit)
    .map((message) => ({ role: message.role === "user" ? "user" : "assistant", content: message.content.slice(0, 1500) }));

/** Admin / expert copilot. */
const sendChatAiMessage = async (message, history = []) =>
  instanceCallApi.post("/api/v2/chat-ai", JSON.stringify({ message, history }), JSON_HEADERS);

/** Student assistant with tools (test result, experts, availability, bookings, site FAQ). */
const sendMemberAiChat = async (message, history = []) =>
  instanceCallApi.post("/api/v2/chat-ai/member", JSON.stringify({ message, history }), JSON_HEADERS);

const sendAiChatClient = async (message, history = []) =>
  instanceCallApi.post("/api/v2/chat-ai/rag", JSON.stringify({ message, history }), JSON_HEADERS);

const confirmAiAction = async (actionId) =>
  instanceCallApi.post(`/api/v2/chat-ai/actions/${encodeURIComponent(actionId)}/confirm`);

export { sendChatAiMessage, sendMemberAiChat, sendAiChatClient, confirmAiAction };
