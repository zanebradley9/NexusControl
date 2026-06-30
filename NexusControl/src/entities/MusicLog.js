import { base44 } from "@/api/base44Client";

export const MusicLog = {
  list: async (params = {}) => {
    return await base44.entities.MusicLog.list(params);
  },

  get: async (id) => {
    return await base44.entities.MusicLog.get(id);
  },

  create: async (data) => {
    return await base44.entities.MusicLog.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.MusicLog.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.MusicLog.delete(id);
  },
};

export default MusicLog;