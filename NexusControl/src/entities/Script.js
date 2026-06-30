import { base44 } from "@/api/base44Client";

export const Script = {
  list: async (params = {}) => {
    return await base44.entities.Script.list(params);
  },

  get: async (id) => {
    return await base44.entities.Script.get(id);
  },

  create: async (data) => {
    return await base44.entities.Script.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.Script.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.Script.delete(id);
  },
};

export default Script;