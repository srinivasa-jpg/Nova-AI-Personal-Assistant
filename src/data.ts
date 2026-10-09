import type { ChatMessage, Note, Task } from './types';
export const isoDay = (offset = 0) => { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export const dateLabel = (day: string) => {
  if (!day) return 'Anytime';
  if (day === isoDay()) return 'Today';
  if (day === isoDay(1)) return 'Tomorrow';
  const d = new Date(`${day}T12:00:00`);
  return Number.isNaN(d.getTime()) ? day : d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
};
export const seedTasks = (): Task[] => [
  { id:'demo1',title:'Plan tomorrow’s priorities',category:'Personal',due:isoDay(),priority:'High',completed:false,createdAt:new Date().toISOString() },
  { id:'demo2',title:'Review research notes',category:'Research',due:isoDay(),priority:'Medium',completed:false,createdAt:new Date().toISOString() },
  { id:'demo3',title:'Prepare a lesson outline',category:'Work',due:isoDay(1),priority:'Medium',completed:false,createdAt:new Date().toISOString() },
  { id:'demo4',title:'Organize weekly schedule',category:'Personal',due:isoDay(),priority:'Low',completed:true,createdAt:new Date().toISOString() },
];
export const seedNotes = (): Note[] => [
  {id:'note1',title:'Ideas worth exploring ✨',body:'• Build a small habit each day\n• Keep the important things simple\n• Protect uninterrupted focus time',updatedAt:new Date().toISOString(),color:'violet'},
  {id:'note2',title:'A little reminder',body:'Progress is a collection of small, consistent steps.',updatedAt:new Date().toISOString(),color:'peach'},
];
export const welcomeMessage: ChatMessage = { id:'welcome',role:'assistant',content:'Hey there! 👋 I’m SRINIVAS AI, your productivity co-pilot. I can help you organize tasks, map out your day, or get unstuck. Try “Add task: review notes” or “Plan my day”.',time:Date.now(),demo:true};
export const uuid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
