import { base44 } from "@/api/base44Client";

export const Idea = {
  list: async (params = {}) => {
    return await base44.entities.Idea.list(params);
  },

  get: async (id) => {
    return await base44.entities.Idea.get(id);
  },

  create: async (data) => {
    return await base44.entities.Idea.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.Idea.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.Idea.delete(id);
  },
};

export default Idea;