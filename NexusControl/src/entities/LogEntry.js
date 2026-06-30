import { base44 } from "@/api/base44Client";

export const LogEntry = {
  list: async (params = {}) => {
    return await base44.entities.LogEntry.list(params);
  },

  get: async (id) => {
    return await base44.entities.LogEntry.get(id);
  },

  create: async (data) => {
    return await base44.entities.LogEntry.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.LogEntry.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.LogEntry.delete(id);
  },
};

export default LogEntry;