const projects = [];

export const NexusCodeService = {
  getAll: () => projects,
  create: (project) => {
    projects.push(project);
    return project;
  }
};