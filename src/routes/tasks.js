import { Router } from 'express';
import { TaskService } from '../services/taskService.js';
import { SyncService } from '../services/syncService.js';
import { Database } from '../db/database.js';
import { asyncHandler } from './asynchandler.js';

function createTaskRouter(db) {
  const router = Router();
  const taskService = new TaskService(db);
  const syncService = new SyncService(db, taskService);

  // Get all tasks
  router.get('/', asyncHandler(async (req, res) => {
    const tasks = await taskService.getAllTasks();
    res.json(tasks);
  }));

  // Get single task
  router.get('/:id', asyncHandler(async (req, res) => {
    const task = await taskService.getTask(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  }));

  // Create task
  router.post('/', asyncHandler(async (req, res) => {
    if (!req.body.title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
  }));

  // Update task
  router.put('/:id', asyncHandler(async (req, res) => {
    const updated = await taskService.updateTask(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(updated);
  }));

  // Delete task
  router.delete('/:id', asyncHandler(async (req, res) => {
    const deleted = await taskService.deleteTask(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true });
  }));

  return router;
}

export { createTaskRouter };
