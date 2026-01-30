
import { Todo } from '../types.ts';

/**
 * Storage key is derived from the DB_PATH environment variable.
 * This simulates a database path in a local storage environment.
 */
const DB_PATH = process.env.DB_PATH || 'tasks.db';
const STORAGE_KEY = `minimal_db_v2_${DB_PATH}`;

export const dbService = {
  async getAll(): Promise<Todo[]> {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  async save(todos: Todo[]): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  },

  async add(todo: Todo): Promise<Todo> {
    const todos = await this.getAll();
    const updated = [todo, ...todos];
    await this.save(updated);
    return todo;
  },

  async update(id: string, updates: Partial<Todo>): Promise<Todo> {
    const todos = await this.getAll();
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    
    const updatedTodo = { ...todos[index], ...updates };
    todos[index] = updatedTodo;
    await this.save(todos);
    return updatedTodo;
  },

  async delete(id: string): Promise<void> {
    const todos = await this.getAll();
    const filtered = todos.filter(t => t.id !== id);
    await this.save(filtered);
  },

  async clearCompleted(): Promise<void> {
    const todos = await this.getAll();
    const filtered = todos.filter(t => !t.completed);
    await this.save(filtered);
  }
};
