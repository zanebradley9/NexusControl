import { base44 } from "@/api/base44Client";

export const Achievement = {
  list: async (params = {}) => {
    return await base44.entities.Achievement.list(params);
  },

  get: async (id) => {
    return await base44.entities.Achievement.get(id);
  },

  create: async (data) => {
    return await base44.entities.Achievement.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.Achievement.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.Achievement.delete(id);
  },
};

export default Achievement;