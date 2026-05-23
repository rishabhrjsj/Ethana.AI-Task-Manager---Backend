const prisma = require('../config/prisma');
const { ensureProjectAccess } = require('./projectAccess.service');

const taskInclude = {
  assignees: {
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
  createdBy: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
};

const formatTask = (task) => ({
  ...task,
  assignees: task.assignees?.map((a) => a.user) || [],
});

const validateAssignees = async (projectId, userIds) => {
  if (!userIds?.length) return;

  for (const userId of userIds) {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!member) {
      const error = new Error('All assigned users must be project members');
      error.statusCode = 400;
      throw error;
    }
  }
};

const syncAssignees = async (taskId, userIds) => {
  await prisma.taskAssignee.deleteMany({ where: { taskId } });

  if (userIds?.length) {
    await prisma.taskAssignee.createMany({
      data: userIds.map((userId) => ({ taskId, userId })),
    });
  }
};

const isUserAssigned = async (taskId, userId) => {
  const assignment = await prisma.taskAssignee.findUnique({
    where: { taskId_userId: { taskId, userId } },
  });
  return !!assignment;
};

const createTask = async (data, userId) => {
  await ensureProjectAccess(data.projectId, { id: userId, role: 'ADMIN' });

  const assigneeIds = data.assignedToIds || [];

  await validateAssignees(data.projectId, assigneeIds);

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId: data.projectId,
      createdById: userId,
      assignees: assigneeIds.length
        ? {
            create: assigneeIds.map((id) => ({ userId: id })),
          }
        : undefined,
    },
    include: taskInclude,
  });

  return formatTask(task);
};

const getTasksByProject = async (projectId, user) => {
  await ensureProjectAccess(projectId, user);

  const where = {
    projectId,
    ...(user.role === 'MEMBER' && {
      assignees: { some: { userId: user.id } },
    }),
  };

  const tasks = await prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: { createdAt: 'desc' },
  });

  return tasks.map(formatTask);
};

const getTaskById = async (taskId, user) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: taskInclude,
  });

  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  await ensureProjectAccess(task.projectId, user);

  return formatTask(task);
};

const updateTask = async (taskId, data, user) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });

  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  await ensureProjectAccess(task.projectId, user);

  const assigned = await isUserAssigned(taskId, user.id);

  if (user.role === 'MEMBER') {
    if (!assigned) {
      const error = new Error('You can only edit tasks assigned to you');
      error.statusCode = 403;
      throw error;
    }

    if (data.assignedToIds !== undefined) {
      const error = new Error('Only admins can assign tasks');
      error.statusCode = 403;
      throw error;
    }
  }

  if (data.assignedToIds !== undefined) {
    await validateAssignees(task.projectId, data.assignedToIds);
    await syncAssignees(taskId, data.assignedToIds);
  }

  const updateData = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: taskInclude,
  });

  return formatTask(updated);
};

const deleteTask = async (taskId) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  await prisma.task.delete({ where: { id: taskId } });

  return { message: 'Task deleted successfully' };
};

module.exports = {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  isUserAssigned,
};
