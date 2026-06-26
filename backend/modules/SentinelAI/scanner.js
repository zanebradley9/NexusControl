const Project = require("./model");

async function scanProjects() {

    const projects = await Project.find();

    return projects.map(project => ({

        id: project._id,

        name: project.name,

        language: project.language,

        framework: project.framework,

        status: project.status,

        warnings: [],

        scannedAt: new Date()

    }));

}

async function scanProject(id) {

    const project = await Project.findById(id);

    if (!project)
        throw new Error("Project not found");

    return {

        id: project._id,

        name: project.name,

        status: project.status,

        language: project.language,

        framework: project.framework,

        issues: [],

        scannedAt: new Date()

    };

}

module.exports = {

    scanProjects,

    scanProject

};