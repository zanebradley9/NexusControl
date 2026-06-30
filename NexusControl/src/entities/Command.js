import { base44 } from "@/api/base44Client";

export const Command = {
  list: async (params = {}) => {
    return await base44.entities.Command.list(params);
  },

  get: async (id) => {
    return await base44.entities.Command.get(id);
  },

  create: async (data) => {
    return await base44.entities.Command.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.Command.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.Command.delete(id);
  },
};

export default Command;