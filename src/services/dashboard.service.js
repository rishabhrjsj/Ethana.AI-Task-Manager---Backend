const prisma = require('../config/prisma');
const { getUserProjectIds } = require('./projectAccess.service');

const taskListInclude = {
  project: { select: { id: true, name: true } },
  assignees: {
    include: {
      user: { select: { id: true, name: true } },
    },
  },
};

const formatTask = (task) => ({
  ...task,
  assignees: task.assignees?.map((a) => a.user) || [],
});

const getDashboard = async (user) => {
  const now = new Date();

  let projectFilter = {};

  if (user.role === 'MEMBER') {
    const projectIds = await getUserProjectIds(user.id);
    projectFilter = { projectId: { in: projectIds } };
  }

  const [totalTasks, completedTasks, pendingTasks, overdueTasks, assignedTasks, recentTasks, projects] =
    await Promise.all([
      prisma.task.count({ where: projectFilter }),
      prisma.task.count({ where: { ...projectFilter, status: 'DONE' } }),
      prisma.task.count({
        where: { ...projectFilter, status: { in: ['TODO', 'IN_PROGRESS'] } },
      }),
      prisma.task.count({
        where: {
          ...projectFilter,
          status: { not: 'DONE' },
          dueDate: { lt: now },
        },
      }),
      prisma.task.findMany({
        where: {
          assignees: { some: { userId: user.id } },
        },
        include: taskListInclude,
        orderBy: { dueDate: 'asc' },
      }),
      prisma.task.findMany({
        where: projectFilter,
        include: taskListInclude,
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      user.role === 'ADMIN'
        ? prisma.project.findMany({
            include: {
              _count: { select: { tasks: true, members: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          })
        : prisma.project.findMany({
            where: { members: { some: { userId: user.id } } },
            include: {
              _count: { select: { tasks: true, members: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          }),
    ]);

  const overdueTasksList = await prisma.task.findMany({
    where: {
      ...projectFilter,
      status: { not: 'DONE' },
      dueDate: { lt: now },
    },
    include: taskListInclude,
    orderBy: { dueDate: 'asc' },
  });

  return {
    stats: {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
    },
    assignedTasks: assignedTasks.map(formatTask),
    recentTasks: recentTasks.map(formatTask),
    overdueTasksList: overdueTasksList.map(formatTask),
    projects,
  };
};

module.exports = { getDashboard };
