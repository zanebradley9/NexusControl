import { Project } from "./model.js";
import { NexusCodeService } from "./service.js";

export const getProjects = (req, res) => {
  res.json(NexusCodeService.getAll());
};

export const createProject = (req, res) => {
  const project = new Project(req.body);
  res.status(201).json(NexusCodeService.create(project));
};