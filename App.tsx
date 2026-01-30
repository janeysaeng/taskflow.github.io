
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { dbService } from './services/dbService';
import { geminiService } from './services/geminiService';
import { Todo, Priority } from './types';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { Sparkles, Trash2, Filter, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await dbService.getAll();
        setTodos(data);
      } catch (err) {
        setError('Failed to load tasks.');
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, []);

  const handleAddTask = async (text: string, priority: Priority) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      priority,
      createdAt: Date.now(),
    };
    const updated = await dbService.add(newTodo);
    setTodos(prev => [...prev, updated]);
  };

  const handleToggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const updated = await dbService.update(id, { completed: !todo.completed });
    setTodos(prev => prev.map(t => (t.id === id ? updated : t)));
  };

  const handleDeleteTodo = async (id: string) => {
    await dbService.delete(id);
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleEditTodo = async (id: string, text: string) => {
    const updated = await dbService.update(id, { text });
    setTodos(prev => prev.map(t => (t.id === id ? updated : t)));
  };

  const handleClearCompleted = async () => {
    await dbService.clearCompleted();
    setTodos(prev => prev.filter(t => !t.completed));
  };

  const handleAiOptimize = async () => {
    setIsAiLoading(true);
    setError(null);
    try {
      const result = await geminiService.optimizeTasks(todos.filter(t => !t.completed));
      const updatedTodos = [...todos];
      result.optimizedTasks.forEach(opt => {
        const idx = updatedTodos.findIndex(t => t.id === opt.id);
        if (idx !== -1) {
          updatedTodos[idx] = { ...updatedTodos[idx], priority: opt.suggestedPriority };
        }
      });
      await dbService.save(updatedTodos);
      setTodos(updatedTodos);
      alert(result.summary);
    } catch (err) {
      setError('AI optimization failed. Please check your network.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active': return todos.filter(t => !t.completed);
      case 'completed': return todos.filter(t => t.completed);
      default: return todos;
    }
  }, [todos, filter]);

  const stats = useMemo(() => ({
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  }), [todos]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-12 md:py-20">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              TaskFlow <span className="text-indigo-600 italic font-medium text-lg">AI</span>
            </h1>
            <p className="text-slate-500 mt-1">Smarter organization for your daily workflow.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAiOptimize}
              disabled={isAiLoading || todos.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-100"
            >
              {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              AI Prioritize
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm flex items-center gap-3">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Input Area */}
        <section className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
          <TaskForm onAdd={handleAddTask} />
        </section>

        {/* Controls */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex gap-1">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                  filter === f ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {stats.completed > 0 && (
            <button
              onClick={handleClearCompleted}
              className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Main List */}
        <section className="space-y-4">
          {filteredTodos.length > 0 ? (
            <TaskList 
              todos={filteredTodos} 
              onToggle={handleToggleTodo} 
              onDelete={handleDeleteTodo} 
              onEdit={handleEditTodo} 
            />
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300">
              <p className="text-slate-400 font-medium">No tasks found in "{filter}"</p>
              <p className="text-slate-300 text-sm">Add one to get started!</p>
            </div>
          )}
        </section>

        {/* Footer Stats */}
        <footer className="pt-8 border-t border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
          <div>{stats.active} items left</div>
          <div>Persisted Locally</div>
        </footer>
      </div>
    </div>
  );
};

export default App;
