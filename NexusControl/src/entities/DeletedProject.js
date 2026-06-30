import { base44 } from "@/api/base44Client";

export const DeletedProject = {
  list: async (params = {}) => {
    return await base44.entities.DeletedProject.list(params);
  },

  get: async (id) => {
    return await base44.entities.DeletedProject.get(id);
  },

  create: async (data) => {
    return await base44.entities.DeletedProject.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.DeletedProject.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.DeletedProject.delete(id);
  },
};

export default DeletedProject;