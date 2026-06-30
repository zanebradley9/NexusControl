import { base44 } from "@/api/base44Client";

export const MediaLibraryItem = {
  list: async (params = {}) => {
    return await base44.entities.MediaLibraryItem.list(params);
  },

  get: async (id) => {
    return await base44.entities.MediaLibraryItem.get(id);
  },

  create: async (data) => {
    return await base44.entities.MediaLibraryItem.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.MediaLibraryItem.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.MediaLibraryItem.delete(id);
  },
};

export default MediaLibraryItem;