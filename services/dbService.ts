
import { Todo } from '../types';

const STORAGE_KEY = 'gemini_smart_tasks_db';

/**
 * Database service using localStorage as a simplified persistent storage.
 * Designed with an async interface to allow future migration to SQLite/IndexedDB.
 */
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
    const updated = [...todos, todo];
    await this.save(updated);
    return todo;
  },

  async update(id: string, updates: Partial<Todo>): Promise<Todo> {
    const todos = await this.getAll();
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Todo not found');
    
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
