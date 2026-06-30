import { base44 } from "@/api/base44Client";

export const FilmProject = {
  list: async (params = {}) => {
    return await base44.entities.FilmProject.list(params);
  },

  get: async (id) => {
    return await base44.entities.FilmProject.get(id);
  },

  create: async (data) => {
    return await base44.entities.FilmProject.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.FilmProject.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.FilmProject.delete(id);
  },
};

export default FilmProject;