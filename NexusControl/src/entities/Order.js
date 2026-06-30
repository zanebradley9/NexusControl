import { base44 } from "@/api/base44Client";

export const Order = {
  list: async (params = {}) => {
    return await base44.entities.Order.list(params);
  },

  get: async (id) => {
    return await base44.entities.Order.get(id);
  },

  create: async (data) => {
    return await base44.entities.Order.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.Order.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.Order.delete(id);
  },
};

export default Order;