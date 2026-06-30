import { base44 } from "@/api/base44Client";

export const Incident = {
  list: async (params = {}) => {
    return await base44.entities.Incident.list(params);
  },

  get: async (id) => {
    return await base44.entities.Incident.get(id);
  },

  create: async (data) => {
    return await base44.entities.Incident.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.Incident.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.Incident.delete(id);
  },
};

export default Incident;