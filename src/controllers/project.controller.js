const projectService = require('../services/project.service');
const { ensureProjectAccess } = require('../services/projectAccess.service');
const prisma = require('../config/prisma');
const { successResponse } = require('../utils/response');

const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user.id);
    return successResponse(res, project, 'Project created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getAllProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getAllProjects(req.user);
    return successResponse(res, projects, 'Projects fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user);
    return successResponse(res, project, 'Project fetched successfully');
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    await ensureProjectAccess(req.params.id, req.user);
    const member = await projectService.addMember(req.params.id, req.body.userId);
    return successResponse(res, member, 'Member added successfully', 201);
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    await ensureProjectAccess(req.params.id, req.user);
    const result = await projectService.removeMember(req.params.id, req.params.userId);
    return successResponse(res, result, 'Member removed successfully');
  } catch (error) {
    next(error);
  }
};

const getMembers = async (req, res, next) => {
  try {
    await ensureProjectAccess(req.params.id, req.user);
    const members = await projectService.getProjectMembers(req.params.id);
    return successResponse(res, members, 'Project members fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });
    return successResponse(res, users, 'Users fetched successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  addMember,
  removeMember,
  getMembers,
  getAllUsers,
};
