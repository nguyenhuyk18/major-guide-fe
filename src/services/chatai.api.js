import { instanceCallApi } from "./api.setting";

const sendChatAiMessage = async (message) => {
  const rs = await instanceCallApi.post(
    "/api/v2/chat-ai",
    JSON.stringify({ message }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return rs;
};

const sendAiChatClient = async (message, history = []) => {
  const rs = await instanceCallApi.post(
    "/api/v2/chat-ai/rag",
    JSON.stringify({ message, history }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return rs;
};

const confirmAiAction = async (actionId) => {
  return instanceCallApi.post(
    `/api/v2/chat-ai/actions/${encodeURIComponent(actionId)}/confirm`
  );
};

export { sendChatAiMessage, sendAiChatClient, confirmAiAction };
