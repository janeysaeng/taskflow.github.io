
import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from './services/dbService.ts';
import { geminiService } from './services/geminiService.ts';
import { Todo, Priority } from './types.ts';
import TaskForm from './components/TaskForm.tsx';
import TaskList from './components/TaskList.tsx';
import { Sparkles, Loader2, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await dbService.getAll();
        setTodos(data);
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
    await dbService.add(newTodo);
    setTodos(prev => [newTodo, ...prev]);
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
    try {
      const activeTasks = todos.filter(t => !t.completed);
      if (activeTasks.length === 0) return;
      const result = await geminiService.optimizeTasks(activeTasks);
      const updatedTodos = [...todos];
      result.optimizedTasks.forEach(opt => {
        const idx = updatedTodos.findIndex(t => t.id === opt.id);
        if (idx !== -1) {
          updatedTodos[idx] = { ...updatedTodos[idx], priority: opt.suggestedPriority };
        }
      });
      await dbService.save(updatedTodos);
      setTodos(updatedTodos);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaff]">
        <Loader2 className="w-6 h-6 animate-spin text-purple-200" />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-6 py-16 md:py-24 fade-in">
      <header className="mb-14 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-purple-900 mb-2">
            Focus<span className="text-yellow-500">.</span>
          </h1>
          <p className="text-xs font-bold text-purple-300 uppercase tracking-[0.2em]">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={handleAiOptimize}
          disabled={isAiLoading || todos.length === 0}
          className="relative p-4 rounded-2xl bg-white border border-purple-50 hover:border-yellow-200 hover:bg-yellow-50 transition-all duration-300 disabled:opacity-30 group shadow-sm"
          title="AI Smart Prioritize"
        >
          {isAiLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          ) : (
            <Sparkles className="w-6 h-6 text-purple-400 group-hover:text-yellow-600 transition-colors" />
          )}
          {isAiLoading && (
             <div className="absolute -top-1 -right-1 flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
             </div>
          )}
        </button>
      </header>

      <div className="mb-14 bg-white p-6 rounded-3xl shadow-sm border border-purple-50">
        <TaskForm onAdd={handleAddTask} />
      </div>

      <nav className="flex items-center gap-8 mb-10 text-[11px] font-black uppercase tracking-widest text-purple-200">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`transition-all duration-300 relative pb-2 ${
              filter === f 
                ? 'text-purple-900 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-yellow-400' 
                : 'hover:text-purple-400'
            }`}
          >
            {f}
          </button>
        ))}
        {todos.some(t => t.completed) && (
          <button
            onClick={handleClearCompleted}
            className="ml-auto text-purple-300 hover:text-rose-500 transition-colors"
          >
            Clear Done
          </button>
        )}
      </nav>

      <main className="space-y-1">
        {filteredTodos.length > 0 ? (
          <TaskList 
            todos={filteredTodos} 
            onToggle={handleToggleTodo} 
            onDelete={handleDeleteTodo} 
            onEdit={handleEditTodo} 
          />
        ) : (
          <div className="py-24 text-center">
            <div className="inline-block p-4 rounded-full bg-purple-50 mb-4">
               <Zap className="w-8 h-8 text-purple-200" />
            </div>
            <p className="text-purple-300 text-sm font-medium tracking-wide italic">
              Your space is clear.
            </p>
          </div>
        )}
      </main>

      <footer className="mt-24 pt-10 border-t border-purple-50 flex justify-between items-center opacity-40 text-[9px] font-black uppercase tracking-[0.25em] text-purple-400">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]"></div>
          <span>Cloud Persist Ready</span>
        </div>
        <span>Instance: {process.env.DB_PATH || 'default'}</span>
      </footer>
    </div>
  );
};

export default App;
