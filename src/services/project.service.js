const prisma = require('../config/prisma');

const createProject = async (data, userId) => {
  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description || null,
      createdById: userId,
      members: {
        create: { userId },
      },
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      },
      _count: { select: { tasks: true } },
    },
  });

  return project;
};

const getAllProjects = async (user) => {
  const where =
    user.role === 'ADMIN'
      ? {}
      : {
          members: { some: { userId: user.id } },
        };

  return prisma.project.findMany({
    where,
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getProjectById = async (projectId, user) => {
  const where =
    user.role === 'ADMIN'
      ? { id: projectId }
      : {
          id: projectId,
          members: { some: { userId: user.id } },
        };

  const project = await prisma.project.findFirst({
    where,
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      },
      tasks: {
        include: {
          assignees: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  return project;
};

const addMember = async (projectId, userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (existing) {
    const error = new Error('User is already a member of this project');
    error.statusCode = 409;
    throw error;
  }

  return prisma.projectMember.create({
    data: { projectId, userId },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });
};

const removeMember = async (projectId, userId) => {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!membership) {
    const error = new Error('Member not found in this project');
    error.statusCode = 404;
    throw error;
  }

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } },
  });

  return { message: 'Member removed successfully' };
};

const getProjectMembers = async (projectId) => {
  return prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  addMember,
  removeMember,
  getProjectMembers,
};
