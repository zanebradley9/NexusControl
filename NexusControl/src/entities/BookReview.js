import { base44 } from "@/api/base44Client";

export const BookReview = {
  list: async (params = {}) => {
    return await base44.entities.BookReview.list(params);
  },

  get: async (id) => {
    return await base44.entities.BookReview.get(id);
  },

  create: async (data) => {
    return await base44.entities.BookReview.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.BookReview.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.BookReview.delete(id);
  },
};

export default BookReview;