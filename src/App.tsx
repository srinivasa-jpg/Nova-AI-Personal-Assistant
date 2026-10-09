import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  Activity, ArrowRight, ArrowUpRight, Bell, CalendarDays,
  Check, CheckCheck, CheckCircle2, ChevronDown, ChevronRight, Clock3,
  Cloud, Focus, LayoutDashboard, ListTodo, Menu,
  MessageCircle, MoreHorizontal, Pause, Play, Plus, Search, Settings2,
  ShieldCheck, Sparkles, StickyNote, Target, Trash2, TrendingUp, WandSparkles,
  X, Zap, TimerReset, Circle, CalendarCheck, Brain
} from 'lucide-react';
import { dateLabel, isoDay, seedNotes, seedTasks, uuid, welcomeMessage } from './data';
import type { AppView, ChatMessage, Note, Priority, Task } from './types';

function useSavedState<T>(key:string, initial:() => T) {
  const [value,setValue] = useState<T>(()=>{
    try {const raw=localStorage.getItem(key); if(raw!==null) return JSON.parse(raw) as T;} catch { /* no persistent storage */ }
    return initial();
  });
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{/* private browsing */}},[key,value]);
  return [value,setValue] as const;
}
const dateFull = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
const formatDay = (date:Date) => date.toLocaleDateString('en-US',{weekday:'short'});
const formatMonthDay = (date:Date) => date.toLocaleDateString('en-US',{month:'short',day:'numeric'});
const greet = () => {const h=new Date().getHours();return h<12?'Good morning':h<17?'Good afternoon':'Good evening';};
const todayTasks = (tasks:Task[]) => tasks.filter(t=>t.due===isoDay());
const statNumber = (n:number) => String(n).padStart(2,'0');
const firstName = (name:string) => name.trim().split(/\s+/)[0] || 'there';

type Nav = {id:AppView;label:string;icon:typeof LayoutDashboard};
const navigation:Nav[] = [
  {id:'dashboard',label:'Overview',icon:LayoutDashboard},
  {id:'assistant',label:'AI Assistant',icon:MessageCircle},
  {id:'tasks',label:'My Tasks',icon:ListTodo},
  {id:'calendar',label:'Planner',icon:CalendarDays},
  {id:'notes',label:'My Notes',icon:StickyNote},
  {id:'focus',label:'Focus Room',icon:Focus},
];

function Avatar({name,size='normal'}:{name:string;size?:'normal'|'large'}) {
  return <span className={`avatar ${size==='large'?'avatar-lg':''}`}>{firstName(name).charAt(0).toUpperCase()}</span>;
}
function SectionTitle({overline,title,actions}:{overline:string;title:string;actions?:ReactNode}) {
  return <div className="section-title"><div><p className="eyebrow">{overline}</p><h2>{title}</h2></div>{actions}</div>;
}
function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}) {
  useEffect(()=>{const fn=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};document.addEventListener('keydown',fn);return()=>document.removeEventListener('keydown',fn);},[onClose]);
  return <div className="modal-backdrop" onMouseDown={(e)=>{if(e.target===e.currentTarget)onClose();}} role="presentation"><div className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-title"><h3>{title}</h3><button aria-label="Close" className="icon-btn" onClick={onClose}><X size={19}/></button></div>{children}</div></div>;
}

function NewTaskModal({onClose,onAdd}:{onClose:()=>void;onAdd:(title:string,category:string,due:string,priority:Priority)=>void}) {
  const [title,setTitle]=useState(''); const [category,setCategory]=useState('Personal'); const [due,setDue]=useState(isoDay()); const [priority,setPriority]=useState<Priority>('Medium');
  function submit(e:FormEvent){e.preventDefault();if(title.trim()){onAdd(title.trim(),category,due,priority);onClose();}}
  return <Modal title="Create a new task" onClose={onClose}><form className="modal-form" onSubmit={submit}>
    <label>Task name<input autoFocus maxLength={100} value={title} onChange={e=>setTitle(e.target.value)} placeholder="What needs to get done?" required/></label>
    <div className="form-grid"><label>Due date<input type="date" value={due} onChange={e=>setDue(e.target.value)}/></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{['Personal','Work','Research','Wellness','Learning','Other'].map(x=><option key={x}>{x}</option>)}</select></label></div>
    <label>Priority<select value={priority} onChange={e=>setPriority(e.target.value as Priority)}><option>Low</option><option>Medium</option><option>High</option></select></label>
    <div className="modal-footer"><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" type="submit"><Plus size={16}/> Add task</button></div>
  </form></Modal>;
}

function TaskLine({task,toggle,remove,compact=false}:{task:Task;toggle:(id:string)=>void;remove?:(id:string)=>void;compact?:boolean}){
 return <div className={`task-row ${task.completed?'task-completed':''} ${compact?'compact-task':''}`}>
  <button className={`task-check ${task.completed?'checked':''}`} onClick={()=>toggle(task.id)} aria-label={`${task.completed?'Mark incomplete':'Complete'} ${task.title}`} title={task.completed?'Mark incomplete':'Complete task'}>{task.completed&&<Check size={13} strokeWidth={3}/>}</button>
  <div className="task-main"><div className="task-name">{task.title}</div><div className="task-meta"><span>{task.category}</span><span className="dot-spacer">·</span><span>{dateLabel(task.due)}</span></div></div>
  <span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
  {remove&&<button className="icon-btn remove-task" aria-label={`Delete ${task.title}`} onClick={()=>remove(task.id)}><Trash2 size={15}/></button>}
 </div>;
}

function TaskCard({tasks,toggle,openAdd,goTasks}:{tasks:Task[];toggle:(id:string)=>void;openAdd:()=>void;goTasks:()=>void}) {
  const today=todayTasks(tasks);
  return <div className="panel tasks-panel">
    <div className="panel-heading"><div><h3>Today's tasks</h3><p>Stay on top of what matters</p></div><button className="small-icon accented" onClick={openAdd} aria-label="Add task"><Plus size={19}/></button></div>
    <div className="panel-tasks">{today.length===0?<div className="empty-box"><CheckCheck size={23}/><p>No tasks due today. Enjoy the breathing room!</p></div>:today.slice(0,4).map(t=><TaskLine key={t.id} task={t} toggle={toggle} compact/>)}</div>
    <button className="text-link" onClick={goTasks}>View all tasks <ArrowRight size={15}/></button>
  </div>;
}
function Stats({tasks,sessions}:{tasks:Task[];sessions:number}){
  const completed=tasks.filter(t=>t.completed).length;
  const due=todayTasks(tasks).filter(t=>!t.completed).length;
  const pct=tasks.length?Math.round((completed/tasks.length)*100):0;
  return <div className="stats-grid">
    <div className="stat-card"><div className="stat-top"><span className="stat-icon purple"><ListTodo size={20}/></span><span className="mini-note">All tasks <ArrowUpRight size={13}/></span></div><div className="stat-main">{statNumber(tasks.length)}<span className="sub-stat">total tasks</span></div><div className="stat-foot"><span className="green-dot"/> Your workspace</div></div>
    <div className="stat-card"><div className="stat-top"><span className="stat-icon green"><CheckCircle2 size={20}/></span><span className="mini-note"><TrendingUp size={14}/> Progress</span></div><div className="stat-main">{statNumber(completed)}<span className="sub-stat">completed</span></div><div className="stat-foot"><div className="tiny-bar"><div style={{width:`${pct}%`}}/></div><span>{pct}%</span></div></div>
    <div className="stat-card"><div className="stat-top"><span className="stat-icon orange"><Clock3 size={20}/></span><span className="mini-note">Today <ArrowUpRight size={13}/></span></div><div className="stat-main">{statNumber(due)}<span className="sub-stat">remaining</span></div><div className="stat-foot"><span className="orange-dot"/> Keep it moving</div></div>
    <div className="stat-card"><div className="stat-top"><span className="stat-icon pink"><Focus size={20}/></span><span className="mini-note">Focus <ArrowUpRight size={13}/></span></div><div className="stat-main">{statNumber(sessions)}<span className="sub-stat">sessions</span></div><div className="stat-foot"><span className="pink-dot"/> 25 min sessions</div></div>
  </div>;
}

function AssistantPanel({messages,onSend,loading,big=false}:{messages:ChatMessage[];onSend:(text:string)=>void;loading:boolean;big?:boolean}){
 const [text,setText]=useState('');const scroll=useRef<HTMLDivElement>(null);
 useEffect(()=>{scroll.current?.scrollTo({top:scroll.current.scrollHeight,behavior:'smooth'});},[messages,loading]);
 function submit(e?:FormEvent){e?.preventDefault();if(text.trim()&&!loading){onSend(text.trim());setText('');}}
 const suggestions=['Plan my day','Show my priorities','Give me a focus tip'];
 return <div className={`panel chat-panel ${big?'chat-full':''}`}>
  <div className="chat-heading"><div className="assistant-face"><Sparkles size={21}/><span/></div><div><h3>Ask SRINIVAS AI <span className="ai-pill">AI assistant</span></h3><p>Your space to think out loud</p></div><MoreHorizontal size={20} className="chat-more"/></div>
  <div className="chat-stream" ref={scroll} aria-live="polite">
    {messages.slice(big?-40:-6).map(msg=><div className={`bubble-line ${msg.role}`} key={msg.id}>
      {msg.role==='assistant'&&<span className="bubble-avatar"><Sparkles size={12}/></span>}
      <div className={`bubble ${msg.role}`}><div>{msg.content}</div>{msg.demo&&<span className="demo-label">LOCAL DEMO</span>}</div>
    </div>)}
    {loading&&<div className="bubble-line assistant"><span className="bubble-avatar"><Sparkles size={12}/></span><div className="bubble assistant thinking"><i/><i/><i/></div></div>}
  </div>
  <div className="chat-bottom"><div className="suggestions">{suggestions.map(s=><button key={s} onClick={()=>onSend(s)} disabled={loading}>{s}</button>)}</div>
    <form className="chat-input" onSubmit={submit}><Sparkles size={17} className="input-spark"/><input aria-label="Message SRINIVAS AI" placeholder="Ask SRINIVAS AI anything..." value={text} onChange={e=>setText(e.target.value)} maxLength={2500}/><button disabled={!text.trim()||loading} aria-label="Send message"><ArrowUpRight size={20}/></button></form>
    <p className="chat-disclaimer">In demo mode, SRINIVAS AI offers local tips. Add an API key for real AI chat.</p>
  </div>
 </div>;
}

function ProgressPanel({tasks}:{tasks:Task[]}){
  const total=tasks.length;const done=tasks.filter(t=>t.completed).length;const pct=total?Math.round(done/total*100):0;
  return <div className="panel progress-panel"><div className="panel-heading"><div><h3>Daily progress</h3><p>One step at a time</p></div><MoreHorizontal size={20}/></div>
    <div className="progress-body"><div className="donut" style={{'--progress':`${pct}%`} as React.CSSProperties}><div className="donut-inner"><b>{pct}%</b><small>completed</small></div></div><div className="progress-copy"><b>You're doing great!</b><p>{done} of {total} tasks completed. Small wins add up.</p><div className="legend"><span/><span>Tasks completed</span></div></div></div>
  </div>;
}

function WeeklyStrip({tasks,selectDay,selected}:{tasks:Task[];selectDay:(d:string)=>void;selected:string}){
 const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+i);return d;});
 return <div className="week-strip">{days.map(d=>{const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;const has=tasks.some(t=>t.due===key&&!t.completed);return <button key={key} className={`day-pill ${selected===key?'selected':''}`} onClick={()=>selectDay(key)}><span>{formatDay(d)}</span><strong>{d.getDate()}</strong><i className={has?'has-task':''}/></button>;})}</div>;
}
function AgendaPanel({tasks,setView}:{tasks:Task[];setView:(x:AppView)=>void}){
  const next=tasks.filter(t=>!t.completed&&t.due).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,3);
  return <div className="panel agenda-panel"><div className="panel-heading"><div><h3>Coming up</h3><p>What's around the corner</p></div><button className="icon-btn" onClick={()=>setView('calendar')} aria-label="Open planner"><ArrowUpRight size={20}/></button></div>
  <div className="agenda-list">{next.length?next.map((t,i)=><div className="agenda-item" key={t.id}><div className={`agenda-marker marker-${i}`}/><div><b>{t.title}</b><span>{dateLabel(t.due)} · {t.category}</span></div><ChevronRight size={16}/></div>):<div className="empty-box"><p>Your calendar is looking clear.</p></div>}</div></div>;
}

function NotesPeek({notes,editNotes}:{notes:Note[];editNotes:()=>void}) {
 return <div className="panel notes-peek"><div className="panel-heading"><div><h3>Quick notes</h3><p>Catch every bright idea</p></div><button className="icon-btn" onClick={editNotes} aria-label="Open notes"><ArrowUpRight size={20}/></button></div><div className="peek-grid">{notes.slice(0,2).map(n=><button onClick={editNotes} className={`note-peek ${n.color}`} key={n.id}><b>{n.title}</b><p>{n.body}</p><span><StickyNote size={12}/> Open note</span></button>)}{notes.length===0&&<p className="muted">No notes yet. Capture your next idea.</p>}</div></div>;
}

function TasksView({tasks,toggle,remove,add}:{tasks:Task[];toggle:(id:string)=>void;remove:(id:string)=>void;add:()=>void}){
 const [filter,setFilter]=useState('All');const [query,setQuery]=useState('');
 const filtered=tasks.filter(t=>(filter==='All'||(filter==='Completed'?t.completed:filter==='Upcoming'?!t.completed&&t.due>isoDay():!t.completed))&&t.title.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>Number(a.completed)-Number(b.completed)||a.due.localeCompare(b.due));
 return <div className="full-view"><SectionTitle overline="GET THINGS DONE" title="My tasks" actions={<button className="btn primary" onClick={add}><Plus size={17}/> New task</button>}/>
 <div className="panel view-panel"><div className="filter-row"><div className="filter-tabs">{['All','Active','Upcoming','Completed'].map(f=><button className={filter===f?'active':''} key={f} onClick={()=>setFilter(f)}>{f}</button>)}</div><label className="search-input"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tasks..."/></label></div>
 {filtered.length?filtered.map(t=><TaskLine key={t.id} task={t} toggle={toggle} remove={remove}/>):<div className="empty-large"><CheckCircle2 size={32}/><h3>No tasks found</h3><p>Try another filter or add something new.</p></div>}</div></div>;
}
function CalendarView({tasks,toggle,add}:{tasks:Task[];toggle:(id:string)=>void;add:()=>void}){
 const [selected,setSelected]=useState(isoDay());const selectedTasks=tasks.filter(t=>t.due===selected);
 return <div className="full-view"><SectionTitle overline="YOUR WEEK AT A GLANCE" title="Your planner" actions={<button className="btn primary" onClick={add}><Plus size={17}/> Add task</button>}/>
  <div className="panel calendar-panel"><div className="panel-heading"><div><h3>Next 7 days</h3><p>Tap a day to see your schedule</p></div><CalendarDays size={21} className="dim-icon"/></div><WeeklyStrip tasks={tasks} selected={selected} selectDay={setSelected}/><div className="calendar-heading"><h3>{selected===isoDay()?'Today’s agenda':formatMonthDay(new Date(`${selected}T12:00:00`))}</h3><span>{selectedTasks.length} tasks</span></div>
  {selectedTasks.length?selectedTasks.map(t=><TaskLine key={t.id} task={t} toggle={toggle}/>):<div className="empty-large"><CalendarCheck size={34}/><h3>Nothing scheduled</h3><p>Your day is open. You can add a task anytime.</p><button className="btn outline" onClick={add}>Add a task <Plus size={15}/></button></div>}</div></div>;
}
function NotesView({notes,setNotes}:{notes:Note[];setNotes:React.Dispatch<React.SetStateAction<Note[]>>}) {
 const [selected,setSelected]=useState<string|null>(null);const active=notes.find(n=>n.id===selected)||notes[0];
 const update=(key:'title'|'body',v:string)=>{if(!active)return;setNotes(current=>current.map(n=>n.id===active.id?{...n,[key]:v,updatedAt:new Date().toISOString()}:n));};
 const create=()=>{const note={id:uuid(),title:'Untitled note',body:'',updatedAt:new Date().toISOString(),color:['violet','peach','mint'][Math.floor(Math.random()*3)]};setNotes(x=>[note,...x]);setSelected(note.id);};
 const del=()=>{if(!active)return;setNotes(x=>x.filter(n=>n.id!==active.id));setSelected(null);};
 return <div className="full-view"><SectionTitle overline="YOUR IDEAS, ORGANIZED" title="My notes" actions={<button className="btn primary" onClick={create}><Plus size={17}/> New note</button>}/>
  <div className="notes-workspace panel"><aside className="notes-list"><h3>All notes <span>{notes.length}</span></h3>{notes.map(n=><button className={`note-list-item ${active?.id===n.id?'selected':''}`} onClick={()=>setSelected(n.id)} key={n.id}><span className={`note-swatch ${n.color}`}><StickyNote size={16}/></span><span><b>{n.title||'Untitled'}</b><small>{n.body.slice(0,48)||'Empty note'}</small></span></button>)}</aside>
  <div className="notes-editor">{active?<><div className="editor-actions"><span><Cloud size={15}/> Saved in this browser</span><button className="icon-btn" onClick={del} title="Delete note" aria-label="Delete note"><Trash2 size={18}/></button></div><input className="note-title-input" value={active.title} onChange={e=>update('title',e.target.value)} maxLength={100} aria-label="Note title"/><p className="note-date">Edited {new Date(active.updatedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</p><textarea aria-label="Note content" placeholder="Start typing your thoughts..." value={active.body} onChange={e=>update('body',e.target.value)}/></>:<div className="empty-large"><StickyNote size={32}/><h3>Your ideas start here</h3><p>Create a note to start writing.</p><button className="btn outline" onClick={create}>Create note</button></div>}</div></div></div>;
}
function FocusView({seconds,setSeconds,running,setRunning,sessions}:{seconds:number;setSeconds:React.Dispatch<React.SetStateAction<number>>;running:boolean;setRunning:(x:boolean)=>void;sessions:number}){
 const [duration,setDuration]=useState(()=>Math.max(1,Math.ceil(seconds/60)));const pct=100-seconds/(duration*60)*100;
 const setMode=(mins:number)=>{setRunning(false);setDuration(mins);setSeconds(mins*60);};
 return <div className="full-view"><SectionTitle overline="DEEP WORK. DEEP BREATH." title="Focus room"/><div className="focus-layout"><div className="panel focus-main"><div className="focus-heading"><span className="pulse-dot"/> LET'S FIND YOUR FLOW</div><h3>Make this moment count.</h3><p>Just one thing at a time. The rest can wait.</p><div className="timer-ring" style={{'--timer-progress':`${Math.max(0,pct)}%`} as React.CSSProperties}><div><strong>{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</strong><small>MINUTES TO FOCUS</small></div></div><div className="timer-controls"><button className="timer-secondary" onClick={()=>{setRunning(false);setSeconds(duration*60);}} aria-label="Reset timer"><TimerReset size={20}/></button><button className="btn primary timer-play" onClick={()=>setRunning(!running)}>{running?<Pause size={18}/>:<Play size={18} fill="currentColor"/>}{running?'Pause focus':'Start focusing'}</button></div></div><div className="focus-side"><div className="panel focus-settings"><h3>Your session</h3><p>Choose your focus duration</p>{[15,25,45].map(m=><button className={`duration-choice ${duration===m?'active':''}`} key={m} onClick={()=>setMode(m)}><Clock3 size={17}/>{m} minutes <span>{duration===m?<Check size={16}/>:<Circle size={14}/>}</span></button>)}</div><div className="panel focus-cheer"><span><Zap size={22}/></span><h3>{sessions} focus sessions</h3><p>Every minute of focused time is an investment in yourself.</p></div></div></div></div>;
}
function SettingsView({name,setName,resetDemo,notificationAllowed,requestNotifications}:{name:string;setName:(x:string)=>void;resetDemo:()=>void;notificationAllowed:boolean;requestNotifications:()=>void}){
 return <div className="full-view"><SectionTitle overline="MAKE IT YOURS" title="Preferences"/><div className="settings-grid"><div className="panel settings-panel"><h3>Profile</h3><p>Customize your workspace greeting.</p><label>Your display name<input value={name} onChange={e=>setName(e.target.value)} maxLength={50} placeholder="Your name"/></label><div className="setting-notice"><ShieldCheck size={18}/><span>Your tasks, notes, and preferences are saved in this browser. They are not synced between devices.</span></div></div><div className="panel settings-panel"><h3>Notifications</h3><p>Get notified of due tasks while the dashboard is open.</p><button className="btn outline" onClick={requestNotifications} disabled={notificationAllowed}><Bell size={17}/>{notificationAllowed?'Notifications enabled':'Enable browser notifications'}</button><p className="fine-print">Browser notifications require permission and may not work when the page is closed.</p></div><div className="panel settings-panel"><h3>AI connection</h3><p>Real AI chat can be enabled using an OpenAI API key stored securely in your deployment's server environment.</p><code>OPENAI_API_KEY</code><p className="fine-print">Never put secret keys in frontend code or a GitHub commit.</p></div><div className="panel settings-panel"><h3>Reset demo</h3><p>Start fresh with sample tasks, notes, and the welcome conversation.</p><button className="btn danger-outline" onClick={resetDemo}><TimerReset size={17}/> Reset workspace</button></div></div></div>;
}

function makeDemoReply(text:string,tasks:Task[],addTask:(title:string,cat:string,due:string,priority:Priority)=>void):string {
 const q=text.toLowerCase();
 const match=text.match(/^(?:add|create)(?: a)? task\s*[:\-]?\s*(.+)$/i);
 if(match){const title=match[1].trim().slice(0,100);if(title){addTask(title,'Personal',isoDay(),'Medium');return `Done — I added “${title}” to today’s tasks. You can change its priority or due date from My Tasks.`;}}
 if(q.includes('plan')||q.includes('schedule')||q.includes('day')){
   const pending=todayTasks(tasks).filter(t=>!t.completed);
   if(!pending.length)return 'Your calendar looks open today! Choose one meaningful goal, start with a 25-minute focus session, and take a short break afterward. 🌱';
   return `Here's a simple plan for today:\n\n1. First, tackle “${pending[0].title}” (25 minutes).\n2. Take a five-minute break.\n${pending[1]?`3. Then move to “${pending[1].title}”.\n`:''}4. Review what went well and leave time to recharge.\n\nYou have ${pending.length} unfinished task${pending.length===1?'':'s'} due today.`;
 }
 if(q.includes('priorit')||q.includes('task')||q.includes('to do')){
   const pending=tasks.filter(t=>!t.completed).sort((a,b)=>({High:0,Medium:1,Low:2}[a.priority]-{High:0,Medium:1,Low:2}[b.priority]));
   return pending.length?`Your top priorities are:\n${pending.slice(0,4).map((t,i)=>`${i+1}. ${t.title} (${t.priority.toLowerCase()} priority, ${dateLabel(t.due).toLowerCase()})`).join('\n')}\n\nStart with the most important one, and break it into one small next action.`:'You’re all caught up! Add a new task whenever something comes to mind.';
 }
 if(q.includes('focus')||q.includes('procrastinat')||q.includes('tip'))return 'Try the 2-minute rule: if starting feels hard, commit to just two minutes. Put your phone away, pick one task, and use the Focus Room timer for a 25-minute block. Momentum usually follows action. ⚡';
 if(q.includes('note'))return 'Capture ideas quickly in My Notes. Give each note a short, searchable title, and revisit your notes once a week to turn interesting ideas into action.';
 return 'I can help you make a practical plan, identify your priorities, and add tasks. Try “Plan my day”, “Show my priorities”, or “Add task: read one research paper”. For open-ended AI conversations, connect an OpenAI API key in your Vercel project. ✨';
}

export default function App(){
 const [name,setName]=useSavedState('srinivas-name-v1',()=> 'Srinivas');
 const [tasks,setTasks]=useSavedState<Task[]>('srinivas-tasks-v1',seedTasks);
 const [notes,setNotes]=useSavedState<Note[]>('srinivas-notes-v1',seedNotes);
 const [messages,setMessages]=useSavedState<ChatMessage[]>('srinivas-chat-v1',()=>[welcomeMessage]);
 const [sessions,setSessions]=useSavedState('srinivas-sessions-v1',()=>0);
 const [view,setView]=useState<AppView>('dashboard');
 const [sidebarOpen,setSidebarOpen]=useState(false);
 const [showTaskModal,setShowTaskModal]=useState(false);
 const [loading,setLoading]=useState(false);
 const [now,setNow]=useState(()=>new Date());
 const [seconds,setSeconds]=useState(25*60);
 const [running,setRunning]=useState(false);
 const [toast,setToast]=useState('');
 const [notificationAllowed,setNotificationAllowed]=useState(()=>typeof Notification!=='undefined'&&Notification.permission==='granted');
 const [aiConnected,setAiConnected]=useState<boolean|null>(null);
 useEffect(()=>{const id=window.setInterval(()=>setNow(new Date()),30000);return()=>clearInterval(id);},[]);
 useEffect(()=>{fetch('/api/chat').then(r=>r.ok?r.json():null).then(r=>setAiConnected(Boolean(r?.enabled))).catch(()=>setAiConnected(false));},[]);
 useEffect(()=>{if(!running)return;const timer=window.setInterval(()=>setSeconds(n=>{if(n<=1){setRunning(false);setSessions(v=>v+1);setToast('Focus session complete! Take a breather ✨');return 0;}return n-1;}),1000);return()=>clearInterval(timer);},[running,setSessions]);
 useEffect(()=>{if(!toast)return;const id=window.setTimeout(()=>setToast(''),3500);return()=>clearTimeout(id);},[toast]);
 useEffect(()=>{
   if(!notificationAllowed||typeof Notification==='undefined')return;
   const check=()=>{
     const date=isoDay();
     const dueNow=tasks.filter(t=>!t.completed&&!t.alerted&&t.due<date);
     if(dueNow.length){try{new Notification('SRINIVAS · Overdue tasks',{body:`${dueNow.length} task(s) need your attention.`});}catch{/* permission/system restrictions */}
       setTasks(prev=>prev.map(t=>dueNow.some(d=>d.id===t.id)?{...t,alerted:true}:t));}
   };
   check(); const id=window.setInterval(check,60000);return()=>clearInterval(id);
 },[notificationAllowed,tasks,setTasks]);
 const addTask=useCallback((title:string,category:string,due:string,priority:Priority)=>{setTasks(prev=>[{id:uuid(),title,category,due,priority,completed:false,createdAt:new Date().toISOString()},...prev]);setToast('Task added to your list');},[setTasks]);
 const toggleTask=(id:string)=>setTasks(prev=>prev.map(t=>t.id===id?{...t,completed:!t.completed}:t));
 const deleteTask=(id:string)=>setTasks(prev=>prev.filter(t=>t.id!==id));
 const go=(v:AppView)=>{setView(v);setSidebarOpen(false);window.scrollTo({top:0,behavior:'smooth'});};
 const send=async (input:string)=>{
   if(loading)return;
   const userMsg:ChatMessage={id:uuid(),role:'user',content:input,time:Date.now()};setMessages(prev=>[...prev,userMsg]);setLoading(true);
   const isCommand=/^(add|create)(?: a)? task\b/i.test(input);
   const isDemoIntent=/(plan my day|show my priorities|focus tip)/i.test(input);
   let reply='';let demo=false;
   if(isCommand||isDemoIntent){reply=makeDemoReply(input,tasks,addTask);demo=true;}
   else {
     try{const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[...messages.filter(m=>m.id!=='welcome'),userMsg].slice(-12).map(({role,content})=>({role,content}))})});
       if(response.ok){const data=await response.json();if(typeof data.reply==='string')reply=data.reply;}
     }catch{/* optional AI backend not configured or unreachable */}
     if(!reply){reply=makeDemoReply(input,tasks,addTask);demo=true;}
   }
   setMessages(prev=>[...prev,{id:uuid(),role:'assistant',content:reply,time:Date.now(),demo}]);setLoading(false);
 };
 const pending=useMemo(()=>tasks.filter(t=>!t.completed),[tasks]);
 const resetDemo=()=>{if(!window.confirm('Reset all locally saved tasks, notes, messages and focus sessions?'))return;setTasks(seedTasks());setNotes(seedNotes());setMessages([welcomeMessage]);setSessions(0);setToast('Demo workspace reset');};
 const requestNotifications=async()=>{if(typeof Notification==='undefined'){setToast('Browser notifications are not available here');return;}const answer=await Notification.requestPermission();setNotificationAllowed(answer==='granted');setToast(answer==='granted'?'Notifications enabled':'Notifications were not enabled');};
 return <div className="app-shell">
 <div className={`mobile-scrim ${sidebarOpen?'visible':''}`} onClick={()=>setSidebarOpen(false)}/>
 <aside className={`sidebar ${sidebarOpen?'sidebar-open':''}`}>
  <div className="brand"><div className="brand-symbol"><Sparkles size={23} strokeWidth={2.3}/></div><div><div className="brand-word">SRINIVAS<span>.</span></div><div className="brand-sub">YOUR PERSONAL OS</div></div></div>
  <div className="sidebar-group-label">WORKSPACE</div><nav className="nav-links">{navigation.map(x=>{const Icon=x.icon;return <button key={x.id} className={`nav-item ${view===x.id?'active':''}`} onClick={()=>go(x.id)}><Icon size={19}/><span>{x.label}</span>{x.id==='tasks'&&pending.length>0&&<small>{pending.length}</small>}{x.id==='assistant'&&<i/>}</button>;})}</nav>
  <div className="sidebar-bottom"><div className="sidebar-promo"><span className="promo-icon"><WandSparkles size={21}/></span><b>Make today count.</b><p>A little progress, every single day.</p><button onClick={()=>go('assistant')}>Chat with SRINIVAS AI <ArrowUpRight size={14}/></button></div><button className={`nav-item settings-link ${view==='settings'?'active':''}`} onClick={()=>go('settings')}><Settings2 size={19}/> <span>Settings</span></button><div className="sidebar-profile"><Avatar name={name}/><div><b>{name||'Your workspace'}</b><small>Personal workspace</small></div><ChevronDown size={16}/></div></div>
 </aside>
 <main className="main"><header className="topbar"><div className="top-left"><button className="mobile-menu icon-btn" onClick={()=>setSidebarOpen(true)} aria-label="Open menu"><Menu size={22}/></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={15}/><strong>{navigation.find(n=>n.id===view)?.label||'Settings'}</strong></div></div><div className="top-actions"><span className="current-date"><CalendarDays size={16}/>{dateFull}</span><button className="top-icon" title="Settings" aria-label="Open settings" onClick={()=>go('settings')}><Settings2 size={18}/></button><Avatar name={name}/></div></header>
 <div className="main-content">
 {view==='dashboard'&&<>
  <div className="welcome-row"><div><p className="eyebrow">YOUR DAILY OVERVIEW <span className="eyebrow-sep">/</span> {now.toLocaleDateString('en-US',{weekday:'long'}).toUpperCase()}</p><h1>{greet()}, <span>{firstName(name)}.</span><span className="wave">✌️</span></h1><p className="welcome-copy">Here's your space to plan, focus, and make things happen.</p></div><button className="outline top-add" onClick={()=>setShowTaskModal(true)}><Plus size={18}/> Quick add task</button></div>
  <div className="hero"><div className="hero-stars"/><div className="hero-body"><div className="hero-eyebrow"><span className="live-light"/> THE FUTURE OF YOUR DAY STARTS HERE</div><h2>Less chaos.<br/><em>More clarity.</em></h2><p>One beautiful space for your thoughts, plans, and everything that moves you forward.</p><div className="hero-actions"><button onClick={()=>go('assistant')} className="hero-primary"><Sparkles size={16}/> Ask SRINIVAS AI <ArrowRight size={17}/></button><button onClick={()=>go('calendar')} className="hero-secondary">Explore planner <ArrowUpRight size={16}/></button></div></div><div className="hero-art" aria-hidden="true"><div className="planet-glow"/><div className="planet planet-outer"><div className="planet planet-mid"><div className="planet planet-inner"><Sparkles size={92} strokeWidth={1}/></div></div></div><div className="orbital orbital-one"/><div className="orbital orbital-two"/><div className="float-pill pill-one"><Zap size={15}/> Stay inspired</div><div className="float-pill pill-two"><CheckCircle2 size={15}/> Find your flow</div><div className="star-dot star-one"/><div className="star-dot star-two"/></div></div>
  <Stats tasks={tasks} sessions={sessions}/>
  <div className="section-heading-inline"><div><span>01 / YOUR COMMAND CENTER</span><h2>Everything, in one place<span>.</span></h2></div><span className="section-accent"><Activity size={17}/> TODAY'S PULSE</span></div>
  <div className="dashboard-grid"><div className="dashboard-col"><TaskCard tasks={tasks} toggle={toggleTask} openAdd={()=>setShowTaskModal(true)} goTasks={()=>go('tasks')}/><ProgressPanel tasks={tasks}/></div><div className="dashboard-col"><AssistantPanel messages={messages} onSend={send} loading={loading}/></div><div className="dashboard-col right-column"><AgendaPanel tasks={tasks} setView={go}/><NotesPeek notes={notes} editNotes={()=>go('notes')}/></div></div>
  <div className="bottom-tip"><div><span className="tip-icon"><Target size={22}/></span><div><b>One thing at a time, {firstName(name)}.</b><p>You don't need to do everything today. Just take the next meaningful step.</p></div></div><button onClick={()=>go('focus')}>Enter focus room <ArrowRight size={16}/></button></div>
 </>}
 {view==='assistant'&&<div className="full-view"><SectionTitle overline="YOUR THINKING PARTNER" title="Talk to SRINIVAS AI" actions={<span className="connection-status"><i className={aiConnected?'connected':'offline'}/>{aiConnected?'AI API connected':'Local demo mode'}</span>}/><div className="assistant-layout"><AssistantPanel big messages={messages} onSend={send} loading={loading}/><div className="assistant-side"><div className="panel prompt-card"><div className="prompt-icon"><Brain size={24}/></div><h3>Need a fresh perspective?</h3><p>Your thinking partner for planning, prioritizing, and finding a little more focus.</p>{['Plan my day','Show my priorities','Give me a focus tip','Add task: Read a book'].map(s=><button key={s} onClick={()=>send(s)}>{s}<ArrowUpRight size={15}/></button>)}</div><div className="panel privacy-card"><ShieldCheck size={19}/><div><b>Your space, your rules.</b><p>Tasks and notes remain in your browser. With AI enabled, chat messages are sent to the configured provider.</p></div></div></div></div></div>}
 {view==='tasks'&&<TasksView tasks={tasks} toggle={toggleTask} remove={deleteTask} add={()=>setShowTaskModal(true)}/>}
 {view==='calendar'&&<CalendarView tasks={tasks} toggle={toggleTask} add={()=>setShowTaskModal(true)}/>}
 {view==='notes'&&<NotesView notes={notes} setNotes={setNotes}/>}
 {view==='focus'&&<FocusView seconds={seconds} setSeconds={setSeconds} running={running} setRunning={setRunning} sessions={sessions}/>}
 {view==='settings'&&<SettingsView name={name} setName={setName} resetDemo={resetDemo} notificationAllowed={notificationAllowed} requestNotifications={requestNotifications}/>}
 <footer className="footer"><span><Sparkles size={15}/> SRINIVAS — a little more room to think.</span><span>Made for your everyday momentum <span className="footer-heart">♥</span></span></footer>
 </div></main>
 {showTaskModal&&<NewTaskModal onClose={()=>setShowTaskModal(false)} onAdd={addTask}/>}
 {toast&&<div className="toast"><CheckCircle2 size={17}/>{toast}<button aria-label="Dismiss" onClick={()=>setToast('')}><X size={14}/></button></div>}
 </div>;
}
