export type Priority = 'High' | 'Medium' | 'Low';
export type Task = {
  id: string;
  title: string;
  category: string;
  due: string;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  alerted?: boolean;
};
export type Note = { id: string; title: string; body: string; updatedAt: string; color: string };
export type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string; time: number; demo?: boolean };
export type AppView = 'dashboard' | 'assistant' | 'tasks' | 'calendar' | 'notes' | 'focus' | 'settings';
