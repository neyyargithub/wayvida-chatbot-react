export const resolveSocketApiBaseUrl = (host) => {
  const CHAT_API = import.meta.env.VITE_ADMIN_AI_CHAT_API_URL;
  return `wss://${CHAT_API}/ws`;
};
