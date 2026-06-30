import { base44 } from "@/api/base44Client";

export const Message = {
  list: async (params = {}) => {
    return await base44.entities.Message.list(params);
  },

  get: async (id) => {
    return await base44.entities.Message.get(id);
  },

  create: async (data) => {
    return await base44.entities.Message.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.Message.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.Message.delete(id);
  },
};

export default Message;