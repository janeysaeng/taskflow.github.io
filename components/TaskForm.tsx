
import React, { useState } from 'react';
import { Priority } from '../types';
import { Plus, ChevronDown } from 'lucide-react';

interface TaskFormProps {
  onAdd: (text: string, priority: Priority) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim(), priority);
    setText('');
    setPriority('medium');
  };

  const priorityColors = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-amber-600 bg-amber-50',
    high: 'text-rose-600 bg-rose-50',
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 p-1">
      <div className="relative flex-1">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full pl-5 pr-12 py-3.5 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-300 text-lg font-medium"
        />
      </div>
      
      <div className="flex items-center gap-2 px-2 sm:px-0">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-transparent hover:border-slate-200 ${priorityColors[priority]}`}
          >
            {priority.toUpperCase()}
            <ChevronDown className="w-3 h-3" />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 z-10 p-1 flex flex-col gap-1 overflow-hidden">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setPriority(p); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition-colors ${priority === p ? priorityColors[p] : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!text.trim()}
          className="flex items-center justify-center p-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-30 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
