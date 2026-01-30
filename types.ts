
export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
  dueDate?: string;
  category?: string;
}

export interface AIResponse {
  optimizedTasks: {
    id: string;
    suggestedPriority: Priority;
    reasoning: string;
  }[];
  summary: string;
}
