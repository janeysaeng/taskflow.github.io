
import React, { useState, useRef, useEffect } from 'react';
import { Todo } from '../types';
import { Check, Trash2, Edit2, X, CheckCircle2, Circle } from 'lucide-react';

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

  const priorityStyles = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-rose-100 text-rose-700',
  };

  const priorityDot = {
    low: 'bg-green-500',
    medium: 'bg-amber-500',
    high: 'bg-rose-500',
  };

  return (
    <div className={`task-enter group flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl transition-all hover:shadow-md hover:border-slate-300 ${todo.completed ? 'opacity-60 grayscale-[0.2]' : ''}`}>
      {/* Checkbox */}
      <button 
        onClick={() => onToggle(todo.id)}
        className="flex-shrink-0 transition-transform active:scale-90"
      >
        {todo.completed ? (
          <CheckCircle2 className="w-6 h-6 text-indigo-500 fill-indigo-50" />
        ) : (
          <Circle className="w-6 h-6 text-slate-300 group-hover:text-indigo-400" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              ref={editInputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full bg-slate-50 border-none rounded-lg px-2 py-1 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button onClick={handleSave} className="text-green-500 hover:text-green-600">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => { setIsEditing(false); setEditText(todo.text); }} className="text-slate-400 hover:text-slate-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <span className={`text-slate-800 font-medium truncate ${todo.completed ? 'line-through text-slate-400' : ''}`}>
              {todo.text}
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${priorityStyles[todo.priority]}`}>
                {todo.priority}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {new Date(todo.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isEditing && (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              title="Edit task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
