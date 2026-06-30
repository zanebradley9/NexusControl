import { base44 } from "@/api/base44Client";

export const Earning = {
  list: async (params = {}) => {
    return await base44.entities.Earning.list(params);
  },

  get: async (id) => {
    return await base44.entities.Earning.get(id);
  },

  create: async (data) => {
    return await base44.entities.Earning.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.Earning.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.Earning.delete(id);
  },
};

export default Earning;