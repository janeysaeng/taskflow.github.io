
import React, { useState } from 'react';
import { Priority } from '../types';
import { Plus, ArrowRight } from 'lucide-react';

interface TaskFormProps {
  onAdd: (text: string, priority: Priority) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim(), priority);
    setText('');
    setPriority('medium');
  };

  const priorityMeta = {
    low: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]',
    medium: 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]',
    high: 'bg-purple-600 shadow-[0_0_10px_rgba(124,58,237,0.3)]'
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="flex items-center gap-5 transition-all">
        <button
          type="button"
          onClick={() => {
            const next: Record<Priority, Priority> = { low: 'medium', medium: 'high', high: 'low' };
            setPriority(next[priority]);
          }}
          className={`w-3 h-3 rounded-full shrink-0 transition-all duration-500 transform hover:scale-125 ${priorityMeta[priority]}`}
          title={`Priority: ${priority}`}
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your next move..."
          className="flex-1 bg-transparent border-none outline-none text-xl font-medium text-purple-900 placeholder:text-purple-100 selection:bg-yellow-200"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 ${
            text.trim() ? 'bg-purple-600 text-yellow-300 shadow-lg shadow-purple-100 translate-x-0 opacity-100' : 'bg-purple-50 text-purple-200 translate-x-2 opacity-0'
          }`}
        >
          <ArrowRight className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
