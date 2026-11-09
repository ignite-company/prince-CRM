import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {
 LayoutDashboard, UsersRound, MessagesSquare, CalendarDays, FileText, Workflow,
 ArrowUpRight, ArrowRight, ChevronDown, ChevronRight, ChevronLeft, Search, Bell,
 Menu, X, Plus, CircleCheck, Clock3, Sparkles, MessageCircle, PhoneCall, Mail,
 CheckCircle2, AlertCircle, Play, RotateCcw, Building2, MapPin, TrendingUp,
 Zap, Bot, Link2, ShieldCheck, Send, Check, ClipboardCheck, DollarSign,
 SlidersHorizontal, ArrowDownRight, CalendarCheck2, MoreHorizontal, ExternalLink,
 MessageSquareText, MousePointerClick, ListFilter, CirclePause, Copy
} from "lucide-react";
import "./styles.css";

const DAY = 86400000;
const relativeDate = (delta, hour=11) => { const d = new Date(Date.now() + delta*DAY); d.setHours(hour,30,0,0); return d.toISOString(); };
const money = v => new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD",maximumFractionDigits:0}).format(Number(v)||0);
const short = v => v ? new Date(v).toLocaleDateString("en-CA",{month:"short",day:"numeric"}) : "Not booked";
const dateTime = v => v ? new Date(v).toLocaleDateString("en-CA",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}) : "Not booked";
const stages = [
 {id:"new",label:"New inquiry",tone:"blue"},
 {id:"engaging",label:"AI following up",tone:"violet"},
 {id:"consultation",label:"Consultation booked",tone:"green"},
 {id:"site_visit",label:"On-site estimate",tone:"green"},
 {id:"quote_sent",label:"Quote sent",tone:"amber"},
 {id:"won",label:"Project won",tone:"dark"},
 {id:"lost",label:"Closed / lost",tone:"gray"}
];
const nav = [
 {id:"overview",label:"Overview",icon:LayoutDashboard},
 {id:"leads",label:"Lead pipeline",icon:UsersRound},
 {id:"followups",label:"AI follow-ups",icon:MessagesSquare},
 {id:"appointments",label:"Appointments",icon:CalendarDays},
 {id:"estimates",label:"Estimates & revenue",icon:FileText},
 {id:"integrations",label:"AI integrations",icon:Workflow}
];
const sequence = [
 {title:"Instant first response",when:"Within 60 seconds",description:"A warm introduction that references the homeowner's project and invites them to choose a consultation time.",channel:"SMS + email"},
 {title:"Helpful check-in",when:"After 24 hours",description:"A relevant reminder with the booking link, only when the homeowner has not replied.",channel:"SMS"},
 {title:"Project-focused follow-up",when:"After 3 days",description:"Share a useful next step for their kitchen, bathroom or renovation inquiry.",channel:"Email"},
 {title:"Final gentle touch",when:"After 7 days",description:"A final polite check-in. The sequence stops on reply, booking or opt-out.",channel:"SMS"}
];
const seed = [
 ["Avery Thompson","Kitchen renovation","Mississauga","Website form","new",24500,-0.1,0,1,"New kitchen layout + cabinets","queued"],
 ["Olivia Bennett","Bathroom renovation","Oakville","Google Business Profile","engaging",16800,-0.5,1,2,"Two-bathroom refresh","active"],
 ["Marcus Wilson","Full-home renovation","Brampton","Meta ad","consultation",58000,-1.2,2,1,"Main-floor modernization","replied"],
 ["Priya Shah","Kitchen renovation","Etobicoke","Website form","site_visit",41500,-2.5,1,2,"Open-concept kitchen conversion","replied"],
 ["Daniel Foster","Basement finishing","Vaughan","Google Search","quote_sent",32600,-3.1,3,0,"Basement suite and laundry","active"],
 ["Sophia Clarke","Bathroom renovation","Toronto","Google Business Profile","won",27800,-8,4,0,"Primary ensuite renovation","completed"],
 ["Noah Phillips","Kitchen renovation","Burlington","Meta ad","engaging",35500,-1,2,3,"Custom cabinetry and island","active"],
 ["Isabella Wright","Home addition","Milton","Website form","consultation",74500,-2,3,2,"Rear extension discussion","replied"],
 ["Ethan Brooks","Bathroom renovation","Hamilton","Google Search","new",19500,-0.2,0,1,"Walk-in shower conversion","queued"],
 ["Mia Campbell","Kitchen renovation","Richmond Hill","Meta ad","site_visit",46800,-4,2,4,"Kitchen + dining opening","replied"],
 ["Liam Anderson","Interior remodeling","Markham","Referral","quote_sent",52400,-6,4,0,"Main floor floors and millwork","active"],
 ["Charlotte Martin","Kitchen renovation","North York","Google Business Profile","engaging",28400,-2,3,1,"Cabinet refit and countertops","active"],
 ["James Turner","Basement finishing","Ajax","Website form","won",38900,-12,4,0,"Family entertainment basement","completed"],
 ["Amelia Scott","Bathroom renovation","Scarborough","Google Search","new",14300,-0.3,0,1,"Powder room + tilework","queued"],
 ["Benjamin Lee","Full-home renovation","Toronto","Meta ad","consultation",63000,-3,2,4,"Staged renovation planning","replied"],
 ["Grace Mitchell","Kitchen renovation","Mississauga","Website form","lost",22100,-15,5,0,"Timing changed","paused"]
].map((row,i)=>({
 id:i+1,name:row[0],service:row[1],area:row[2],source:row[3],stage:row[4],
 value:row[5],createdAt:relativeDate(row[6],9+i%6),touchCount:row[7],
 appointmentAt:["consultation","site_visit"].includes(row[4])?relativeDate(row[8],10+(i%5)):null,
 summary:row[9],aiStatus:row[10],logs:[],
 email:"homeowner"+(i+1)+"@example.com",phone:"+1 (416) 555-"+String(100+i).padStart(4,"0")
}));
const status = id => stages.find(x=>x.id===id) || stages[0];
const isOpen = l => !["won","lost"].includes(l.stage);
const statusAi = l => {
 if(l.stage==="won" || l.stage==="lost") return {label:"Sequence stopped",tone:"gray"};
 if(["consultation","site_visit"].includes(l.stage))return {label:"Booked, reminders planned",tone:"green"};
 if(l.aiStatus==="replied")return {label:"Paused on reply",tone:"green"};
 if(l.aiStatus==="active")return {label:"Follow-up sequence active",tone:"violet"};
 return {label:"Instant response queued",tone:"blue"};
};
const navNames={overview:"Growth overview",leads:"Lead pipeline",followups:"AI follow-up center",appointments:"Consultations & estimates",estimates:"Estimates & revenue",integrations:"Connection blueprint"};
function Badge({tone="gray",children,dot=false}){return <span className={"badge badge-"+tone}>{dot&&<span className="badge-dot"/>}{children}</span>;}
function IconButton({onClick,children,label,className=""}){return <button aria-label={label} title={label} className={"icon-btn "+className} onClick={onClick}>{children}</button>;}
function PanelHeading({eyebrow,title,caption,action}){return <div className="panel-heading"><div>{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{caption&&<p>{caption}</p>}</div>{action}</div>;}
function StageBadge({stage}){const s=status(stage);return <Badge tone={s.tone} dot>{s.label}</Badge>;}
function Avatar({name,large=false}){return <span className={"avatar"+(large?" avatar-lg":"")}>{name.split(" ").slice(0,2).map(x=>x[0]).join("")}</span>;}
function Empty({title="No matching leads",caption="Try another search or filter."}){return <div className="empty"><Search size={26}/><h3>{title}</h3><p>{caption}</p></div>;}

function App(){
 const[leads,setLeads]=useState(()=>{
  try {const stored=JSON.parse(localStorage.getItem("prince_growth_preview_v1"));return Array.isArray(stored)&&stored.length?stored:seed;}
  catch{return seed;}
 });
 const[tab,setTab]=useState("overview");
 const[filter,setFilter]=useState("all");
 const[query,setQuery]=useState("");
 const[selected,setSelected]=useState(null);
 const[mobileOpen,setMobileOpen]=useState(false);
 const[toast,setToast]=useState("");
 const[showCreate,setShowCreate]=useState(false);
 const[create,setCreate]=useState({name:"",service:"Kitchen renovation",area:"",source:"Website form",value:""});
 const[fuFilter,setFuFilter]=useState("all");
 const[appointmentForm,setAppointmentForm]=useState("");
 const[expandedSeq,setExpandedSeq]=useState(0);
 const[demoConfirm,setDemoConfirm]=useState(false);
 useEffect(()=>{localStorage.setItem("prince_growth_preview_v1",JSON.stringify(leads));},[leads]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(""),3200);return()=>clearTimeout(t);},[toast]);
 const all=leads.length;
 const newCount=leads.filter(l=>l.stage==="new").length;
 const engaged=leads.filter(l=>l.stage==="engaging").length;
 const booked=leads.filter(l=>["consultation","site_visit"].includes(l.stage)).length;
 const quotes=leads.filter(l=>l.stage==="quote_sent").length;
 const won=leads.filter(l=>l.stage==="won").length;
 const closedValue=leads.filter(l=>l.stage==="won").reduce((v,l)=>v+l.value,0);
 const pipeline=leads.filter(isOpen).reduce((v,l)=>v+l.value,0);
 const active=leads.filter(l=>l.stage==="engaging" || l.stage==="quote_sent").length;
 const priorities=leads.filter(l=>l.stage==="new"||l.stage==="quote_sent");
 const appointments=leads.filter(l=>["consultation","site_visit"].includes(l.stage) && l.appointmentAt).sort((a,b)=>new Date(a.appointmentAt)-new Date(b.appointmentAt));
 const filtered=useMemo(()=>leads.filter(l=>{
  if(filter!=="all"&&l.stage!==filter)return false;
  const q=query.trim().toLowerCase();
  return !q || [l.name,l.service,l.area,l.source,l.stage].join(" ").toLowerCase().includes(q);
 }).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)),[leads,filter,query]);
 const fuLeads=leads.filter(l=>{
  if(fuFilter==="active")return l.stage==="engaging"||l.stage==="quote_sent";
  if(fuFilter==="booked")return ["consultation","site_visit"].includes(l.stage);
  if(fuFilter==="queued")return l.stage==="new";
  return isOpen(l);
 });
 function go(id){setTab(id);setMobileOpen(false);setFilter("all");setQuery("");window.scrollTo({top:0,behavior:"smooth"});}
 function change(id,patch){setLeads(current=>current.map(l=>l.id===id?{...l,...patch}:l));}
 function move(id,stage){change(id,{stage,aiStatus:["won","lost"].includes(stage)?"paused":["consultation","site_visit"].includes(stage)?"replied":"active",appointmentAt:["consultation","site_visit"].includes(stage)?(leads.find(l=>l.id===id)?.appointmentAt||relativeDate(2)):leads.find(l=>l.id===id)?.appointmentAt});setToast("Demo lead moved to "+status(stage).label.toLowerCase()+".");}
 function simulate(l){
  if(!isOpen(l)){setToast("Follow-ups stop when the project is closed.");return;}
  const next=(l.touchCount||0)+1;
  change(l.id,{aiStatus:"active",touchCount:next,logs:[{type:"demo",at:new Date().toISOString(),message:"Simulated AI "+(next===1?"first response":"follow-up")+" prepared. No message was actually sent."},...(l.logs||[])]});
  setToast("Demo step simulated. No SMS or email was sent.");
 }
 function reset(){setLeads(seed);setSelected(null);setDemoConfirm(false);setToast("Illustrative demo data restored.");}
 function addLead(e){
  e.preventDefault();if(!create.name.trim())return;
  const lead={id:Date.now(),name:create.name.trim(),service:create.service,area:create.area.trim()||"Ontario",source:create.source,stage:"new",value:Number(create.value)||0,createdAt:new Date().toISOString(),touchCount:0,appointmentAt:null,summary:"New inquiry added in preview",aiStatus:"queued",logs:[],email:"",phone:""};
  setLeads(ls=>[lead,...ls]);setShowCreate(false);setCreate({name:"",service:"Kitchen renovation",area:"",source:"Website form",value:""});go("leads");setToast("Demo inquiry added. No live automation triggered.");
 }
 const selectedLead=leads.find(l=>l.id===selected);
 return <div className="app">
  <div className={"mobile-backdrop"+(mobileOpen?" show":"")} onClick={()=>setMobileOpen(false)}/>
  <aside className={"sidebar"+(mobileOpen?" open":"")}>
   <div className="brand">
    <div className="brand-mark"><span>P</span><i/></div>
    <div><strong>PRINCE<span> RENOVATIONS</span></strong><small>GROWTH COMMAND CENTER</small></div>
   </div>
   <div className="sidebar-caption">WORKSPACE</div>
   <nav className="navigation" aria-label="Main navigation">
    {nav.map(n=><button key={n.id} className={"nav-link"+(tab===n.id?" selected":"")} onClick={()=>go(n.id)}><n.icon size={19} strokeWidth={1.9}/><span>{n.label}</span>{n.id==="followups"&&<b className="nav-count">{active}</b>}</button>)}
   </nav>
   <div className="sidebar-bottom">
    <div className="side-automation"><div className="side-ai-icon"><Sparkles size={18}/></div><strong>Your AI growth team</strong><p>Lead response, nurturing and reminders working together, once connected.</p><button onClick={()=>go("integrations")}>View integration plan <ArrowUpRight size={14}/></button></div>
    <div className="sidebar-owner"><div className="owner-avatar">PR</div><div><strong>Prince Renovations</strong><small>Ontario, Canada</small></div><MoreHorizontal size={18}/></div>
   </div>
  </aside>
  <main className="main">
   <header className="topbar">
    <div className="top-left"><IconButton label="Open navigation" className="mobile-menu" onClick={()=>setMobileOpen(true)}><Menu size={21}/></IconButton><div className="breadcrumb">Prince Renovations <ChevronRight size={14}/> <strong>{navNames[tab]}</strong></div></div>
    <div className="top-right"><Badge tone="amber" dot>INTERACTIVE DEMO</Badge><button className="top-help" onClick={()=>go("integrations")}><Sparkles size={16}/> Automation blueprint</button><IconButton label="Reset preview" onClick={()=>setDemoConfirm(true)}><RotateCcw size={18}/></IconButton><div className="top-user">P</div></div>
   </header>
   <div className="page">
    {tab==="overview"&&<>
     <div className="page-intro"><div><div className="eyebrow"><span className="mini-dash"/> PRINCE RENOVATIONS / SALES OVERVIEW</div><h1>Welcome back, Prince. <span>Here's your growth picture.</span></h1><p>Every inquiry, appointment, estimate and potential project, in one simple place.</p></div><button className="btn btn-ghost" onClick={()=>go("leads")}><UsersRound size={16}/> View all leads <ArrowUpRight size={16}/></button></div>
     <section className="hero">
      <div className="hero-grid"><div><div className="hero-kicker"><Sparkles size={15}/> YOUR AI FOLLOW-UP SYSTEM</div><h2>No more opportunities slipping through the cracks.</h2><p>New homeowner inquiries are routed into an instant response and an intelligent follow-up journey. Prince only steps in when it's time to build trust, give an estimate or close the project.</p><div className="hero-actions"><button onClick={()=>go("followups")} className="btn btn-lime">See how AI follows up <ArrowRight size={17}/></button><button onClick={()=>go("integrations")} className="btn btn-hero-outline">View connections <ArrowUpRight size={15}/></button></div></div><div className="hero-visual"><div className="hero-flow-head"><span><Zap size={13}/> AUTOMATION PREVIEW</span><Badge tone="light">Illustrative</Badge></div><div className="flow-step"><div className="flow-icon flow-blue"><MousePointerClick size={18}/></div><div><strong>New homeowner inquiry</strong><small>Website / Google / Facebook</small></div><span className="flow-time">0:00</span></div><div className="flow-line"/><div className="flow-step"><div className="flow-icon flow-lime"><Bot size={19}/></div><div><strong>AI responds automatically</strong><small>Personalized text + email</small></div><Badge tone="green">Planned</Badge></div><div className="flow-line"/><div className="flow-step"><div className="flow-icon flow-blue"><CalendarCheck2 size={18}/></div><div><strong>Consultation gets booked</strong><small>Calendar + reminders</small></div><span className="flow-arrow"><ArrowRight size={16}/></span></div></div></div>
     </section>
     <div className="demo-strip"><AlertCircle size={16}/><span><strong>Preview data only.</strong> These contacts, amounts and activities demonstrate the proposed system. No messages are being sent and no integrations are live.</span></div>
     <div className="metrics">
      {[
       {label:"Total inquiries",value:all,icon:UsersRound,description:"Homeowners in demo",kind:"all"},
       {label:"Consultations & visits",value:booked,icon:CalendarCheck2,description:"Appointments booked",kind:"consultation"},
       {label:"Estimates awaiting reply",value:quotes,icon:FileText,description:"AI quote follow-ups",kind:"quote_sent"},
       {label:"Projects won",value:won,icon:CheckCircle2,description:money(closedValue)+" in demo sales",kind:"won"}
      ].map(m=><button className="metric" key={m.label} onClick={()=>{go("leads");setFilter(m.kind==="consultation"?"consultation":m.kind);}}><div className="metric-head"><span>{m.label}</span><span className="metric-icon"><m.icon size={17}/></span></div><strong>{m.value.toString().padStart(2,"0")}</strong><div className="metric-foot"><span>{m.description}</span><ArrowUpRight size={15}/></div></button>)}
     </div>
     <div className="dashboard-grid">
      <section className="panel panel-wide"><PanelHeading eyebrow="LEAD JOURNEY" title="From first click to signed project" caption="See exactly where every homeowner stands, and where revenue could be unlocked." action={<button className="link-button" onClick={()=>go("leads")}>Full pipeline <ArrowUpRight size={15}/></button>}/><div className="journey">{[{label:"New",v:newCount,color:"blue"},{label:"AI engaging",v:engaged,color:"purple"},{label:"Appointments",v:booked,color:"lime"},{label:"Estimates out",v:quotes,color:"orange"},{label:"Won",v:won,color:"dark"}].map((s,i)=><React.Fragment key={s.label}><div className="journey-step"><div className={"journey-num j-"+s.color}>{s.v}</div><strong>{s.label}</strong></div>{i!==4&&<div className="journey-connector"><ArrowRight size={17}/></div>}</React.Fragment>)}</div><div className="journey-bottom"><span><span className="dot dot-lime"/> AI follows up while you focus on the job site</span><span>Snapshot of current demo stages, not conversion rates</span></div></section>
      <section className="panel revenue-panel"><PanelHeading eyebrow="PROJECT VALUE" title="Money in motion"/><div className="revenue-main"><span>Open pipeline value</span><strong>{money(pipeline)}</strong><small>Potential project value, not guaranteed revenue</small></div><div className="revenue-separator"/><div className="revenue-row"><div><span className="revenue-dot"/></div><span>Won project value</span><strong>{money(closedValue)}</strong></div><div className="revenue-row"><div><span className="revenue-dot orange"/></div><span>Quotes awaiting decision</span><strong>{money(leads.filter(l=>l.stage==="quote_sent").reduce((a,l)=>a+l.value,0))}</strong></div><button className="text-link" onClick={()=>go("estimates")}>Explore revenue <ArrowRight size={16}/></button></section>
      <section className="panel panel-wide"><PanelHeading eyebrow="AUTOMATION AT WORK" title="Who is being followed up with?" caption="These are sample AI activities. In the live setup, this shows messages actually sent, replies and next steps." action={<button className="link-button" onClick={()=>go("followups")}>Open follow-ups <ArrowUpRight size={15}/></button>}/><div className="follow-preview">{leads.filter(l=>["engaging","quote_sent","new"].includes(l.stage)).slice(0,4).map(l=><button key={l.id} className="follow-preview-row" onClick={()=>setSelected(l.id)}><div className="follow-preview-left"><Avatar name={l.name}/><div><strong>{l.name}</strong><small>{l.service} · {l.area}</small></div></div><div className="follow-preview-status"><Badge tone={statusAi(l).tone} dot>{statusAi(l).label}</Badge><span>{l.touchCount||0} demo touches</span></div><ChevronRight size={17}/></button>)}</div></section>
      <section className="panel needs-panel"><PanelHeading eyebrow="OWNER ATTENTION" title="Only when you’re needed" caption="AI handles routine nurturing. Your attention goes to estimates, project questions and closing."/><div className="attention-stat"><div><strong>{booked+quotes}</strong><span>Appointments & quotes to move forward</span></div><span className="attention-icon"><ClipboardCheck size={22}/></span></div><div className="attention-tasks">{appointments.slice(0,2).map(l=><button key={l.id} onClick={()=>setSelected(l.id)}><span className="attention-bullet"><CalendarDays size={16}/></span><span><strong>{l.name}</strong><small>{l.stage==="site_visit"?"On-site estimate":"Consultation"} · {short(l.appointmentAt)}</small></span><ArrowUpRight size={15}/></button>)}{quotes>0&&<button onClick={()=>go("estimates")}><span className="attention-bullet"><FileText size={16}/></span><span><strong>{quotes} quotes awaiting a decision</strong><small>Automated reminders proposed</small></span><ArrowUpRight size={15}/></button>}</div></section>
     </div>
    </>}
    {tab==="leads"&&<>
     <div className="page-intro"><div><div className="eyebrow">CUSTOMER ACQUISITION</div><h1>Every lead. <span>Every next step.</span></h1><p>Know who reached out, what they need and how close they are to a project.</p></div><button className="btn btn-dark" onClick={()=>setShowCreate(true)}><Plus size={17}/> Add demo inquiry</button></div>
     <div className="small-metrics">{[{v:all,label:"All inquiries"},{v:newCount,label:"New"},{v:engaged,label:"AI engaging"},{v:booked,label:"Appointments"},{v:quotes,label:"Quotes out"},{v:won,label:"Won"}].map(s=><div key={s.label}><strong>{s.v}</strong><span>{s.label}</span></div>)}</div>
     <section className="panel lead-panel"><div className="toolbar"><div className="search"><Search size={18}/><input aria-label="Search leads" placeholder="Search homeowner, project or city..." value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button onClick={()=>setQuery("")}><X size={15}/></button>}</div><label className="select-wrap"><SlidersHorizontal size={16}/><select aria-label="Filter by status" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All stages</option>{stages.map(s=><option value={s.id} key={s.id}>{s.label}</option>)}</select><ChevronDown size={15}/></label></div>
      <div className="table-wrap"><table className="lead-table"><thead><tr><th>HOMEOWNER / PROJECT</th><th>LEAD SOURCE</th><th>PIPELINE STAGE</th><th>PROJECT VALUE</th><th>AI STATUS</th><th/></tr></thead><tbody>{filtered.map(l=><tr key={l.id} onClick={()=>setSelected(l.id)} tabIndex="0" onKeyDown={e=>{if(e.key==="Enter")setSelected(l.id);}}><td><div className="person-cell"><Avatar name={l.name}/><div><strong>{l.name}</strong><span>{l.service} · {l.area}</span></div></div></td><td><span className="table-source">{l.source}</span></td><td><StageBadge stage={l.stage}/></td><td className="amount">{money(l.value)}</td><td><span className="ai-cell"><span className={"mini-status ms-"+statusAi(l).tone}/>{statusAi(l).label}</span></td><td><ChevronRight size={17}/></td></tr>)}</tbody></table></div>{!filtered.length&&<Empty/>}<div className="table-footer"><span>Showing {filtered.length} of {leads.length} illustrative inquiries</span><span>Click any homeowner to review their journey <ArrowUpRight size={13}/></span></div>
     </section>
    </>}
    {tab==="followups"&&<>
     <div className="page-intro"><div><div className="eyebrow"><Sparkles size={14}/> CONVERSATIONS ON AUTOPILOT</div><h1>AI does the chasing. <span>You close the jobs.</span></h1><p>Every lead receives an automatic, relevant response when the integrations are activated. Only genuine exceptions need Prince.</p></div><button className="btn btn-dark" onClick={()=>go("integrations")}><Workflow size={16}/> How it connects</button></div>
     <div className="fu-feature"><div className="fu-feature-icon"><Bot size={25}/></div><div><strong>Proposed automated follow-up</strong><p>Website, Google and ad inquiries trigger personalized SMS and email. AI pauses when a homeowner replies, books, opts out or needs a real person.</p></div><Badge tone="amber" dot>NOT CONNECTED YET</Badge></div>
     <div className="small-metrics follow-metrics">{[{v:active,label:"Nurture / quote follow-ups"},{v:newCount,label:"Instant responses queued"},{v:booked,label:"Booked + reminder-ready"},{v:leads.filter(l=>l.stage==="lost"||l.stage==="won").length,label:"Sequences stopped"}].map(s=><div key={s.label}><strong>{s.v}</strong><span>{s.label}</span></div>)}</div>
     <div className="follow-grid">
      <section className="panel"><PanelHeading eyebrow="AUTOMATION PLAYBOOK" title="The follow-up that never forgets" caption="An example 4-step homeowner journey. All timing and copy are adjustable."/><div className="sequence">{sequence.map((s,i)=><button key={i} onClick={()=>setExpandedSeq(expandedSeq===i?-1:i)} className={"sequence-card"+(expandedSeq===i?" expanded":"")}><span className="sequence-index">{String(i+1).padStart(2,"0")}</span><div className="sequence-copy"><div><strong>{s.title}</strong><Badge tone={i===0?"green":"gray"}>{s.when}</Badge></div>{expandedSeq===i&&<p>{s.description} <b>{s.channel}</b></p>}</div><ChevronDown size={17}/></button>)}</div><div className="flow-rule"><ShieldCheck size={17}/> Respect replies, bookings and opt-outs. Never continue a blind sequence.</div></section>
      <section className="panel"><PanelHeading eyebrow="FOLLOW-UP QUEUE" title="Who AI is handling" caption="Open a homeowner to review the simulated message history."/><div className="chips">{[{id:"all",name:"All open"},{id:"active",name:"Active"},{id:"queued",name:"Queued"},{id:"booked",name:"Booked"}].map(f=><button className={fuFilter===f.id?"chip active":"chip"} key={f.id} onClick={()=>setFuFilter(f.id)}>{f.name}</button>)}</div><div className="fu-list">{fuLeads.slice(0,8).map(l=><div className="fu-person" key={l.id}><div className="fu-person-head"><div className="person-cell"><Avatar name={l.name}/><div><strong>{l.name}</strong><span>{l.service}</span></div></div><Badge tone={statusAi(l).tone}>{statusAi(l).label}</Badge></div><div className="fu-person-foot"><span><MessageCircle size={14}/> {l.touchCount} sample touches</span><button onClick={()=>setSelected(l.id)}>View journey <ArrowUpRight size={14}/></button></div></div>)}{!fuLeads.length&&<Empty/>}</div><div className="fu-queue-footer">All activity shown is an illustrative workflow, not delivery history.</div></section>
     </div>
    </>}
    {tab==="appointments"&&<>
     <div className="page-intro"><div><div className="eyebrow">YOUR CALENDAR</div><h1>Appointments booked. <span>Less back and forth.</span></h1><p>Consultations and on-site estimates in one schedule, with AI confirmations and reminders proposed.</p></div><button className="btn btn-ghost" onClick={()=>go("integrations")}><CalendarDays size={16}/> Calendar integration <ArrowUpRight size={16}/></button></div>
     <div className="appointment-banner"><div className="appointment-banner-icon"><CalendarCheck2 size={21}/></div><div><strong>Imagine homeowners booking straight onto your calendar</strong><p>Once connected, the AI offers your available times, confirms meetings and sends reminders automatically.</p></div><Badge tone="amber">Proposed</Badge></div>
     <section className="panel"><PanelHeading eyebrow="UPCOMING IN THE DEMO" title="Scheduled homeowner meetings" caption="Sample appointments for showcasing the proposed workflow."/><div className="appointments">{appointments.map(l=><button className="appointment-row" key={l.id} onClick={()=>setSelected(l.id)}><div className="date-square"><strong>{new Date(l.appointmentAt).toLocaleDateString("en-CA",{day:"2-digit"})}</strong><span>{new Date(l.appointmentAt).toLocaleDateString("en-CA",{month:"short"}).toUpperCase()}</span></div><div className="appointment-info"><strong>{l.name}</strong><span>{l.service} · {l.area}</span></div><div className="appointment-time"><Clock3 size={16}/> {dateTime(l.appointmentAt).split(", ").slice(-1)[0]}</div><Badge tone={l.stage==="site_visit"?"blue":"green"}>{l.stage==="site_visit"?"On-site estimate":"Consultation"}</Badge><ChevronRight size={18}/></button>)}{!appointments.length&&<Empty title="No appointments scheduled" caption="Move a lead to Consultation booked and assign a date."/>}</div></section>
     <section className="panel appointment-bottom"><div className="appointment-steps"><div><span><MessageSquareText size={18}/></span><strong>AI engages</strong><small>Gets the homeowner's questions answered</small></div><ArrowRight size={20}/><div><span><CalendarCheck2 size={18}/></span><strong>Appointment booked</strong><small>Based on your connected availability</small></div><ArrowRight size={20}/><div><span><Bell size={18}/></span><strong>Reminders sent</strong><small>Helps reduce missed appointments</small></div></div></section>
    </>}
    {tab==="estimates"&&<>
     <div className="page-intro"><div><div className="eyebrow">PROJECTS & PROFITS</div><h1>From estimates <span>to revenue.</span></h1><p>See what is quoted, what is waiting and what has turned into signed renovation work.</p></div><button className="btn btn-dark" onClick={()=>go("leads")}>Review pipeline <ArrowUpRight size={16}/></button></div>
     <div className="financials"><div className="financial-card dark"><span>Open potential value</span><strong>{money(pipeline)}</strong><small>All active inquiries in this example</small><TrendingUp size={23}/></div><div className="financial-card"><span>Quotes awaiting a yes</span><strong>{money(leads.filter(l=>l.stage==="quote_sent").reduce((a,l)=>a+l.value,0))}</strong><small>{quotes} decisions in progress</small><FileText size={23}/></div><div className="financial-card"><span>Won project value</span><strong>{money(closedValue)}</strong><small>{won} example signed projects</small><CheckCircle2 size={23}/></div></div>
     <section className="panel estimate-panel"><PanelHeading eyebrow="ESTIMATE TRACKER" title="The opportunities on your desk" caption="Only estimated values are shown. No payments or contracts are processed in this demo."/><div className="estimate-list">{leads.filter(l=>["site_visit","quote_sent","won"].includes(l.stage)).map(l=><button className="estimate-item" key={l.id} onClick={()=>setSelected(l.id)}><div className="estimate-side"><div className="estimate-icon"><FileText size={18}/></div><div><strong>{l.name}</strong><span>{l.service} · {l.area}</span></div></div><div className="estimate-end"><strong>{money(l.value)}</strong><StageBadge stage={l.stage}/></div><ChevronRight size={17}/></button>)}</div></section>
    </>}
    {tab==="integrations"&&<>
     <div className="page-intro"><div><div className="eyebrow">THE TECHNOLOGY BEHIND IT</div><h1>One connected system. <span>Less admin, more projects.</span></h1><p>This is the proposed AI workflow and integration plan for Prince Renovations. None of these integrations are connected in the demo.</p></div></div>
     <section className="integration-overview"><div className="integration-top"><div className="integ-icon"><Workflow size={23}/></div><div><strong>How your new lead system will work</strong><p>Capture → Respond → Qualify → Book → Quote → Follow up → Win</p></div><Badge tone="amber">PLANNED SETUP</Badge></div><div className="integration-nodes">{[{icon:MousePointerClick,label:"Lead comes in"},{icon:Bot,label:"AI responds"},{icon:CalendarCheck2,label:"Appointment booked"},{icon:FileText,label:"Estimate tracked"},{icon:CheckCircle2,label:"Project won"}].map((c,i)=><React.Fragment key={c.label}><div className="integ-node"><span><c.icon size={20}/></span><strong>{c.label}</strong></div>{i<4&&<ArrowRight className="integ-arrow" size={21}/>}</React.Fragment>)}</div></section>
     <div className="integration-cards">{[
       {icon:MousePointerClick,title:"Lead forms & ad funnels",detail:"Website, Meta ads and Google Business Profile inquiries flow into one pipeline.",tag:"Lead capture"},
       {icon:PhoneCall,title:"AI phone receptionist",detail:"Answer missed inquiries, gather project details and offer booking options.",tag:"Phone AI / Retell"},
       {icon:MessageCircle,title:"Automated text messages",detail:"Fast first response, booking prompts, reminders and respectful follow-up.",tag:"Twilio SMS"},
       {icon:Mail,title:"Email follow-up assistant",detail:"Personalized homeowner emails for questions, estimates and quote reminders.",tag:"Email"},
       {icon:CalendarDays,title:"Calendar connection",detail:"Sync availability and appointments, then send confirmations and reminders.",tag:"Google Calendar"},
       {icon:FileText,title:"Estimates & pipeline tracking",detail:"Keep quotes, project value, decisions and next steps visible to the owner.",tag:"Prince CRM"}
      ].map(c=><div className="integration-card" key={c.title}><div className="integration-card-icon"><c.icon size={21}/></div><Badge tone="amber" dot>To be connected</Badge><h3>{c.title}</h3><p>{c.detail}</p><small>{c.tag}</small></div>)}</div>
     <div className="integration-note"><ShieldCheck size={21}/><div><strong>Real operation requires setup and testing</strong><p>Connections must be authorized, customer consent and opt-outs respected, AI messages and triggers tested, calendar permissions approved, and private lead storage secured. This prototype never sends or books anything.</p></div></div>
    </>}
   </div>
  </main>
  {selectedLead&&<div className="drawer-layer" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null);}}><aside className="drawer" role="dialog" aria-label={"Lead details for "+selectedLead.name} aria-modal="true"><div className="drawer-top"><span>HOMEOWNER DETAIL <Badge tone="amber">DEMO</Badge></span><IconButton label="Close homeowner detail" onClick={()=>setSelected(null)}><X size={20}/></IconButton></div><div className="drawer-content"><div className="drawer-profile"><Avatar name={selectedLead.name} large/><div><h2>{selectedLead.name}</h2><p>{selectedLead.service} · {selectedLead.area}</p></div></div><div className="drawer-stats"><div><span>Potential project</span><strong>{money(selectedLead.value)}</strong></div><div><span>Source</span><strong>{selectedLead.source}</strong></div></div><div className="drawer-section"><label>Pipeline status</label><select className="full-select" value={selectedLead.stage} onChange={e=>move(selectedLead.id,e.target.value)}>{stages.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></div><div className="drawer-section"><label>Project value (illustrative CAD)</label><input className="full-input" type="number" min="0" value={selectedLead.value} onChange={e=>change(selectedLead.id,{value:Number(e.target.value)||0})}/></div>{["consultation","site_visit"].includes(selectedLead.stage)&&<div className="drawer-section"><label>Appointment date & time</label><input type="datetime-local" className="full-input" value={selectedLead.appointmentAt?new Date(new Date(selectedLead.appointmentAt).getTime()-new Date(selectedLead.appointmentAt).getTimezoneOffset()*60000).toISOString().slice(0,16):""} onChange={e=>change(selectedLead.id,{appointmentAt:e.target.value?new Date(e.target.value).toISOString():null})}/></div>}<div className="drawer-section"><h3>Project details</h3><p className="drawer-copy">{selectedLead.summary}</p><div className="drawer-info"><span><MapPin size={15}/> {selectedLead.area}, Ontario</span><span><Clock3 size={15}/> Inquiry {short(selectedLead.createdAt)}</span></div></div><div className="drawer-section"><div className="drawer-section-row"><h3><Sparkles size={17}/> AI follow-up activity</h3><Badge tone={statusAi(selectedLead).tone}>{statusAi(selectedLead).label}</Badge></div><p className="drawer-copy">The live system will show actual SMS and email events here. This preview displays a sample sequence only.</p><div className="activity-timeline"><div className="activity-entry"><div className="activity-node"><MousePointerClick size={15}/></div><div><strong>Inquiry captured</strong><p>Lead entered from {selectedLead.source}</p><small>{dateTime(selectedLead.createdAt)}</small></div></div>{selectedLead.touchCount>0&&<div className="activity-entry"><div className="activity-node green"><Bot size={15}/></div><div><strong>AI follow-up sample</strong><p>{selectedLead.touchCount} illustrative outreach steps in the proposed workflow</p><small>Sample activity</small></div></div>}{(selectedLead.logs||[]).map((entry,i)=><div key={i} className="activity-entry"><div className="activity-node"><MessageSquareText size={15}/></div><div><strong>Demo step simulated</strong><p>{entry.message}</p><small>{dateTime(entry.at)}</small></div></div>)}</div></div></div><div className="drawer-bottom"><button className="btn btn-ghost" onClick={()=>setSelected(null)}>Close</button><button className="btn btn-dark" disabled={!isOpen(selectedLead)} onClick={()=>simulate(selectedLead)}><Play size={16}/> Simulate AI follow-up</button></div></aside></div>}
  {showCreate&&<div className="modal-layer" onMouseDown={e=>{if(e.target===e.currentTarget)setShowCreate(false);}}><form className="modal" onSubmit={addLead}><div className="modal-head"><div><h2>Add a sample homeowner</h2><p>Presentation-only data, stored in this browser.</p></div><IconButton label="Close" onClick={()=>setShowCreate(false)}><X size={20}/></IconButton></div><div className="modal-fields"><label>Homeowner name<input required value={create.name} onChange={e=>setCreate({...create,name:e.target.value})} placeholder="Example homeowner"/></label><label>Renovation project<select value={create.service} onChange={e=>setCreate({...create,service:e.target.value})}><option>Kitchen renovation</option><option>Bathroom renovation</option><option>Full-home renovation</option><option>Basement finishing</option><option>Home addition</option><option>Interior remodeling</option></select></label><label>City or area<input value={create.area} onChange={e=>setCreate({...create,area:e.target.value})} placeholder="Mississauga"/></label><label>Lead source<select value={create.source} onChange={e=>setCreate({...create,source:e.target.value})}><option>Website form</option><option>Google Business Profile</option><option>Google Search</option><option>Meta ad</option><option>Referral</option></select></label><label>Estimated project value<input min="0" type="number" value={create.value} onChange={e=>setCreate({...create,value:e.target.value})} placeholder="25000"/></label></div><div className="modal-actions"><button type="button" className="btn btn-ghost" onClick={()=>setShowCreate(false)}>Cancel</button><button className="btn btn-dark" type="submit">Add demo inquiry</button></div></form></div>}
  {demoConfirm&&<div className="modal-layer" onMouseDown={e=>{if(e.target===e.currentTarget)setDemoConfirm(false);}}><div className="confirm"><RotateCcw size={24}/><h2>Reset this preview?</h2><p>Restore the original fictional lead records and discard any changes made in this browser.</p><div><button className="btn btn-ghost" onClick={()=>setDemoConfirm(false)}>Cancel</button><button className="btn btn-dark" onClick={reset}>Reset demo</button></div></div></div>}
  {toast&&<div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
  <div className="mobile-bottom-nav">{[{id:"overview",icon:LayoutDashboard,name:"Home"},{id:"leads",icon:UsersRound,name:"Leads"},{id:"followups",icon:Sparkles,name:"AI"},{id:"appointments",icon:CalendarDays,name:"Schedule"},{id:"estimates",icon:FileText,name:"Quotes"}].map(n=><button key={n.id} className={tab===n.id?"active":""} onClick={()=>go(n.id)}><n.icon size={19}/><span>{n.name}</span></button>)}</div>
 </div>;
}
createRoot(document.getElementById("root")).render(<App/>);
