import { base44 } from "@/api/base44Client";

export const ChatMessage = {
  list: async (params = {}) => {
    return await base44.entities.ChatMessage.list(params);
  },

  get: async (id) => {
    return await base44.entities.ChatMessage.get(id);
  },

  create: async (data) => {
    return await base44.entities.ChatMessage.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.ChatMessage.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.ChatMessage.delete(id);
  },
};

export default ChatMessage;