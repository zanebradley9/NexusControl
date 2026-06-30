import { base44 } from "@/api/base44Client";

export const Learning = {
  list: async (params = {}) => {
    return await base44.entities.Learning.list(params);
  },

  get: async (id) => {
    return await base44.entities.Learning.get(id);
  },

  create: async (data) => {
    return await base44.entities.Learning.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.Learning.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.Learning.delete(id);
  },
};

export default Learning;