import { base44 } from "@/api/base44Client";

export const Promotion = {
  list: async (params = {}) => {
    return await base44.entities.Promotion.list(params);
  },

  get: async (id) => {
    return await base44.entities.Promotion.get(id);
  },

  create: async (data) => {
    return await base44.entities.Promotion.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.Promotion.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.Promotion.delete(id);
  },
};

export default Promotion;