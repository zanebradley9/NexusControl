import { base44 } from "@/api/base44Client";

export const EventSubmission = {
  list: async (params = {}) => {
    return await base44.entities.EventSubmission.list(params);
  },

  get: async (id) => {
    return await base44.entities.EventSubmission.get(id);
  },

  create: async (data) => {
    return await base44.entities.EventSubmission.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.EventSubmission.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.EventSubmission.delete(id);
  },
};

export default EventSubmission;