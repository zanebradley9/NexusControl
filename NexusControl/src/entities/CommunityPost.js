import { base44 } from "@/api/base44Client";

export const CommunityPost = {
  list: async (params = {}) => {
    return await base44.entities.CommunityPost.list(params);
  },

  get: async (id) => {
    return await base44.entities.CommunityPost.get(id);
  },

  create: async (data) => {
    return await base44.entities.CommunityPost.create(data);
  },

  update: async (id, data) => {
    return await base44.entities.CommunityPost.update(id, data);
  },

  delete: async (id) => {
    return await base44.entities.CommunityPost.delete(id);
  },
};

export default CommunityPost;