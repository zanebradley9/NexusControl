import { base44 } from "@/api/base44Client";

export const EventRSVP = {
  list: async (params = {}) => {
    return await base44.entities.EventRSVP.list(params);
  },

  get: async (id) => {
    return await base44.entities.EventRSVP.get(id);
  },

  create: async (data) => {
    return await base44.entities.EventRSVP.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.EventRSVP.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.EventRSVP.delete(id);
  },
};

export default EventRSVP;