import { base44 } from "@/api/base44Client";

export const UserSettings = {
  list: async (params = {}) => {
    return await base44.entities.UserSettings.list(params);
  },

  get: async (id) => {
    return await base44.entities.UserSettings.get(id);
  },

  create: async (data) => {
    return await base44.entities.UserSettings.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.UserSettings.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.UserSettings.delete(id);
  },
};

export default UserSettings;