import { base44 } from "@/api/base44Client";

export const ChatSession = {
  list: async (params = {}) => {
    return await base44.entities.ChatSession.list(params);
  },

  get: async (id) => {
    return await base44.entities.ChatSession.get(id);
  },

  create: async (data) => {
    return await base44.entities.ChatSession.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.ChatSession.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.ChatSession.delete(id);
  },
};

export default ChatSession;