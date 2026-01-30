
import React, { useState, useRef, useEffect } from 'react';
import { Todo } from '../types';
import { Trash2, Edit3, Check, MoreVertical } from 'lucide-react';

interface TaskItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editText.trim() && editText !== todo.text) {
      onEdit(todo.id, editText.trim());
    } else {
      setEditText(todo.text);
    }
    setIsEditing(false);
  };

  const priorityColors = {
    low: 'bg-emerald-400',
    medium: 'bg-yellow-400',
    high: 'bg-purple-600'
  };

  return (
    <div className={`flex items-center gap-6 py-5 px-2 group transition-all duration-300 hover:bg-white hover:px-4 hover:rounded-2xl hover:shadow-xl hover:shadow-purple-500/5 border-b border-purple-50/50 last:border-none ${todo.completed ? 'opacity-40 grayscale-[0.5]' : ''}`}>
      <button 
        onClick={() => onToggle(todo.id)}
        className="relative flex items-center justify-center shrink-0 w-6 h-6 group/check"
      >
        <div className={`absolute inset-0 border-2 rounded-lg transition-all duration-500 ${
          todo.completed 
            ? 'bg-purple-600 border-purple-600 rotate-12 scale-110' 
            : 'border-purple-100 group-hover/check:border-yellow-400'
        }`} />
        {todo.completed && <Check className="w-4 h-4 text-yellow-300 relative z-10" strokeWidth={4} />}
      </button>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full bg-purple-50 text-purple-900 px-3 py-1 font-semibold outline-none rounded-xl border border-purple-100"
          />
        ) : (
          <div className="flex flex-col">
            <span className={`text-lg font-semibold tracking-tight transition-all duration-500 ${todo.completed ? 'line-through text-purple-200' : 'text-purple-900'}`}>
              {todo.text}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
        <div className={`w-1.5 h-1.5 rounded-full ${priorityColors[todo.priority]} shadow-sm`} title={`Priority: ${todo.priority}`} />
        {!isEditing && (
          <div className="flex items-center gap-1">
            <button onClick={() => setIsEditing(true)} className="p-2 text-purple-200 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(todo.id)} className="p-2 text-purple-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
