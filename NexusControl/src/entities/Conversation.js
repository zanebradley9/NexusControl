import { base44 } from "@/api/base44Client";

export const Conversation = {
  list: async (params = {}) => {
    return await base44.entities.Conversation.list(params);
  },

  get: async (id) => {
    return await base44.entities.Conversation.get(id);
  },

  create: async (data) => {
    return await base44.entities.Conversation.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.Conversation.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.Conversation.delete(id);
  },
};

export default Conversation;