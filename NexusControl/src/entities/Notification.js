import { base44 } from "@/api/base44Client";

export const Notification = {
  list: async (params = {}) => {
    return await base44.entities.Notification.list(params);
  },

  get: async (id) => {
    return await base44.entities.Notification.get(id);
  },

  create: async (data) => {
    return await base44.entities.Notification.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.Notification.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.Notification.delete(id);
  },
};

export default Notification;