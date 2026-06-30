import { base44 } from "@/api/base44Client";

export const Book = {
  list: async (params = {}) => {
    return await base44.entities.Book.list(params);
  },

  get: async (id) => {
    return await base44.entities.Book.get(id);
  },

  create: async (data) => {
    return await base44.entities.Book.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.Book.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.Book.delete(id);
  },
};

export default Book;