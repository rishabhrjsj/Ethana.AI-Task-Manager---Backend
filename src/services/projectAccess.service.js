const prisma = require('../config/prisma');

const isProjectMember = async (projectId, userId) => {
  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId },
    },
  });
  return !!membership;
};

const getUserProjectIds = async (userId) => {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true },
  });
  return memberships.map((m) => m.projectId);
};

const ensureProjectAccess = async (projectId, user) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'ADMIN') {
    return project;
  }

  const hasAccess = await isProjectMember(projectId, user.id);

  if (!hasAccess) {
    const error = new Error('Access denied to this project');
    error.statusCode = 403;
    throw error;
  }

  return project;
};

module.exports = {
  isProjectMember,
  getUserProjectIds,
  ensureProjectAccess,
};
