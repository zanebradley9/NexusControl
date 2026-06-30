import { base44 } from "@/api/base44Client";

export const Event = {
  list: async (params = {}) => {
    return await base44.entities.Event.list(params);
  },

  get: async (id) => {
    return await base44.entities.Event.get(id);
  },

  create: async (data) => {
    return await base44.entities.Event.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.Event.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.Event.delete(id);
  },
};

export default Event;