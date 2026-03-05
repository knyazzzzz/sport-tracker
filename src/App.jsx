import { useState, useEffect, useRef, useCallback } from "react";

// ── Palettes ──────────────────────────────────────────────────────────────────
const PALETTES = {
  green:  { name:"Forest",  a1:"#10b981", a2:"#34d399", bg0:"#0a1a12", bg1:"#0d1f17", bg2:"#0f2a1e", card:"rgba(255,255,255,0.04)", border:"rgba(16,185,129,0.15)", muted:"#3a5a48", sub:"#668a76" },
  indigo: { name:"Indigo",  a1:"#6366f1", a2:"#818cf8", bg0:"#0d0d1f", bg1:"#111128", bg2:"#161630", card:"rgba(255,255,255,0.04)", border:"rgba(99,102,241,0.15)", muted:"#3a3a6a", sub:"#6666aa" },
  rose:   { name:"Rose",    a1:"#f43f5e", a2:"#fb7185", bg0:"#1a0a0e", bg1:"#200d12", bg2:"#2a1018", card:"rgba(255,255,255,0.04)", border:"rgba(244,63,94,0.15)",  muted:"#5a2a35", sub:"#8a5560" },
  amber:  { name:"Amber",   a1:"#f59e0b", a2:"#fbbf24", bg0:"#1a1400", bg1:"#1f1800", bg2:"#2a2000", card:"rgba(255,255,255,0.04)", border:"rgba(245,158,11,0.15)", muted:"#5a4800", sub:"#8a7020" },
  light:  { name:"Light",   a1:"#10b981", a2:"#059669", bg0:"#f0faf5", bg1:"#e8f5ef", bg2:"#d8efe8", card:"rgba(0,0,0,0.04)",       border:"rgba(16,185,129,0.2)",  muted:"#6aaa88", sub:"#4a8a68", text:"#111", textSub:"#445", cardBg:"rgba(0,0,0,0.03)" },
};
const ACT_COLORS = ["#10b981","#f59e0b","#6366f1","#ef4444","#3b82f6","#ec4899","#8b5cf6","#14b8a6","#f97316","#84cc16"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function toKey(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function today() { return toKey(new Date()); }
function daysAgo(n) { const d=new Date(); d.setDate(d.getDate()-n); return d; }
function lsGet(k,fb) { try{ const v=localStorage.getItem(k); return v?JSON.parse(v):fb; }catch{ return fb; } }
function lsSet(k,v) { try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} }

// Migrate old log format {actId: true} → {actId: {done: true}}
function migrateLog(log) {
  const migrated = {};
  Object.keys(log).forEach(dateKey => {
    migrated[dateKey] = {};
    Object.keys(log[dateKey]).forEach(actId => {
      const val = log[dateKey][actId];
      migrated[dateKey][actId] = (typeof val === "boolean" || typeof val === "undefined")
        ? { done: !!val }
        : val;
    });
  });
  return migrated;
}

// ── Share card ────────────────────────────────────────────────────────────────
function drawShareCard(canvas, activities, log, streaks, pal) {
  const ctx=canvas.getContext("2d"), W=canvas.width;
  const actCount=Math.min(activities.length,10);
  const HEADER_H=110, BOXES_H=200, ST_TITLE=36, ST_ROW=38, PAD=20, HM_H=120, FOOT=30;
  const H=HEADER_H+BOXES_H+ST_TITLE+actCount*ST_ROW+PAD+HM_H+FOOT;
  canvas.height=H;
  const bg=ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,pal.bg0); bg.addColorStop(1,pal.bg2);
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  ctx.fillStyle="rgba(255,255,255,0.04)";
  for(let x=20;x<W;x+=28) for(let y=20;y<H;y+=28){ctx.beginPath();ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fill();}
  const tx=pal.text||"#fff";
  ctx.fillStyle=tx; ctx.font="bold 32px system-ui"; ctx.fillText("Chainly ⛓️",36,56);
  ctx.fillStyle=pal.a1; ctx.fillRect(36,68,120,3);
  ctx.fillStyle=pal.sub||"#888"; ctx.font="14px system-ui"; ctx.fillText(new Date().toDateString(),36,96);
  let os=0,d=new Date();
  for(let i=0;i<365;i++){const k=toKey(d);if(log[k]&&Object.values(log[k]).some(x=>x?.done))os++;else break;d.setDate(d.getDate()-1);}
  const totalDays=Object.keys(log).filter(k=>Object.values(log[k]).some(x=>x?.done)).length;
  const tw=[0,1,2,3,4,5,6].map(i=>{const d2=new Date();d2.setDate(d2.getDate()-i);return toKey(d2);});
  const wr=Math.round(tw.filter(k=>log[k]&&Object.values(log[k]).some(x=>x?.done)).length/7*100);
  [{label:"🔥 Overall Streak",val:os+"d"},{label:"📅 Active Days",val:totalDays+""},{label:"📊 Weekly Rate",val:wr+"%"},{label:"🎯 Activities",val:activities.length+""}].forEach((b,i)=>{
    const x=36+(i%2)*220,y=HEADER_H+Math.floor(i/2)*90;
    ctx.fillStyle="rgba(255,255,255,0.06)"; ctx.beginPath(); ctx.roundRect(x,y,200,70,12); ctx.fill();
    ctx.strokeStyle=pal.a1+"55"; ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(x,y,200,70,12); ctx.stroke();
    ctx.fillStyle=pal.sub||"#aaa"; ctx.font="12px system-ui"; ctx.fillText(b.label,x+14,y+22);
    ctx.fillStyle=tx; ctx.font="bold 28px system-ui"; ctx.fillText(b.val,x+14,y+54);
  });
  ctx.fillStyle=tx; ctx.font="bold 16px system-ui"; ctx.fillText("Activity Streaks",36,HEADER_H+BOXES_H+22);
  activities.slice(0,10).forEach((a,i)=>{
    const y=HEADER_H+BOXES_H+ST_TITLE+i*ST_ROW;
    ctx.fillStyle=a.color+"33"; ctx.beginPath(); ctx.roundRect(36,y,W-72,30,8); ctx.fill();
    const s=streaks[a.id]||{current:0};
    ctx.fillStyle=a.color; ctx.beginPath(); ctx.arc(56,y+15,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=tx; ctx.font="13px system-ui"; ctx.fillText(a.name,72,y+19);
    ctx.fillStyle=a.color; ctx.font="bold 14px system-ui"; ctx.fillText("🔥 "+s.current+"d",W-90,y+19);
  });
  const hmY=HEADER_H+BOXES_H+ST_TITLE+actCount*ST_ROW+PAD;
  ctx.fillStyle=tx; ctx.font="bold 16px system-ui"; ctx.fillText("Last 4 Weeks",36,hmY+16);
  for(let w=0;w<28;w++){
    const dd=new Date(); dd.setDate(dd.getDate()-(27-w));
    const k=toKey(dd), done=log[k]?Object.values(log[k]).filter(x=>x?.done).length:0;
    const alpha=done===0?0.06:0.15+done/Math.max(activities.length,1)*0.85;
    ctx.fillStyle=done===0?"rgba(255,255,255,0.06)":`rgba(${hexToRgb(pal.a1)},${alpha})`;
    ctx.beginPath(); ctx.roundRect(36+(w%7)*42,hmY+28+Math.floor(w/7)*18,34,12,4); ctx.fill();
  }
  ctx.fillStyle="#444"; ctx.font="12px system-ui"; ctx.fillText("Made with Sport Tracker 💪",36,H-10);
}
function hexToRgb(hex){ const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return `${r},${g},${b}`; }

// ── Onboarding ────────────────────────────────────────────────────────────────
function Onboarding({onDone,pal}) {
  const [step,setStep]=useState(0);
  const steps=[
    {emoji:"🏋️",title:"Welcome to Chainly",body:"Track your daily habits and sport activities, build streaks, and stay motivated. Everything is saved on your device."},
    {emoji:"✅",title:"Daily Check-in",body:"Every day, open the app and tap your activities to mark them done. Simple as that."},
    {emoji:"🔥",title:"Build Streaks",body:"Complete activities consistently to build streaks. Don't break the chain — your longest streak is always shown."},
    {emoji:"🎯",title:"Set Goals",body:"Set a weekly target for each activity (e.g. run 4×/week) and track your progress toward it."},
    {emoji:"📊",title:"Share Progress",body:"Generate a beautiful stats card and share it with friends via WhatsApp, Twitter, or as a PNG."},
  ];
  const s=steps[step];
  const tx=pal.text||"#fff";
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:pal.bg1,border:`1px solid ${pal.border}`,borderRadius:24,padding:36,maxWidth:380,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:56,marginBottom:16}}>{s.emoji}</div>
        <div style={{fontSize:20,fontWeight:800,color:tx,marginBottom:12}}>{s.title}</div>
        <div style={{fontSize:15,color:pal.sub,lineHeight:1.6,marginBottom:32}}>{s.body}</div>
        <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:28}}>
          {steps.map((_,i)=><div key={i} style={{width:i===step?24:8,height:8,borderRadius:4,background:i===step?pal.a1:pal.muted,transition:"all 0.3s"}}/>)}
        </div>
        <div style={{display:"flex",gap:10}}>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"12px",borderRadius:12,background:"transparent",border:`1px solid ${pal.border}`,color:tx,fontWeight:600,cursor:"pointer"}}>Back</button>}
          <button onClick={()=>step<steps.length-1?setStep(s=>s+1):onDone()} style={{flex:2,padding:"12px",borderRadius:12,background:pal.a1,border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:15}}>
            {step<steps.length-1?"Next →":"Let's go! 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Day Detail Modal ──────────────────────────────────────────────────────────
function DayModal({dateKey, activities, log, onClose, onToggle, onNote, pal}) {
  const entry=log[dateKey]||{};
  const d=new Date(dateKey+"T12:00:00");
  const label=d.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
  const isToday=dateKey===today();
  const tx=pal.text||"#fff";
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:50,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 0 0"}} onClick={onClose}>
      <div style={{background:pal.bg1,border:`1px solid ${pal.border}`,borderRadius:"24px 24px 0 0",padding:24,width:"100%",maxWidth:640,maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{fontWeight:800,fontSize:17,color:tx}}>{label}</div>
            {isToday&&<div style={{fontSize:12,color:pal.a1,fontWeight:600}}>Today</div>}
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:pal.sub,fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        {activities.length===0&&<p style={{color:pal.muted}}>No activities yet.</p>}
        {activities.map(a=>{
          const e=entry[a.id]||{};
          return (
            <div key={a.id} style={{marginBottom:14}}>
              <div onClick={()=>isToday&&onToggle(a.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,cursor:isToday?"pointer":"default",
                background:e.done?a.color+"22":"rgba(255,255,255,0.03)",border:`1px solid ${e.done?a.color+"55":pal.border}`,marginBottom:6}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:e.done?a.color:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{e.done?"✓":""}</div>
                <span style={{flex:1,fontWeight:600,color:e.done?a.color:tx}}>{a.name}</span>
                {!isToday&&<span style={{fontSize:12,color:pal.muted}}>{e.done?"Done":"—"}</span>}
              </div>
              <textarea value={e.note||""} onChange={ev=>onNote(dateKey,a.id,ev.target.value)}
                placeholder="Add a note... (e.g. 5km run, felt great)"
                style={{width:"100%",padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${pal.border}`,color:tx,fontSize:13,resize:"vertical",minHeight:44,outline:"none",boxSizing:"border-box",fontFamily:"system-ui"}}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Edit Activity Modal ───────────────────────────────────────────────────────
function EditModal({act, onSave, onClose, pal}) {
  const [name,setName]=useState(act.name);
  const [color,setColor]=useState(act.color);
  const [goalType,setGoalType]=useState(act.goalType||"none");
  const [goalVal,setGoalVal]=useState(act.goalVal||3);
  const tx=pal.text||"#fff";
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={onClose}>
      <div style={{background:pal.bg1,border:`1px solid ${pal.border}`,borderRadius:24,padding:28,width:"100%",maxWidth:380}} onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:800,fontSize:17,color:tx,marginBottom:20}}>Edit Activity</div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:12,color:pal.sub,display:"block",marginBottom:6}}>Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.06)",border:`1px solid ${pal.border}`,color:tx,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:12,color:pal.sub,display:"block",marginBottom:8}}>Color</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {ACT_COLORS.map(c=>(
              <div key={c} onClick={()=>setColor(c)} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:c===color?`3px solid ${tx}`:"3px solid transparent",boxSizing:"border-box"}}/>
            ))}
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{fontSize:12,color:pal.sub,display:"block",marginBottom:6}}>Weekly Goal</label>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            {["none","days"].map(t=>(
              <button key={t} onClick={()=>setGoalType(t)} style={{flex:1,padding:"8px",borderRadius:10,border:`1px solid ${goalType===t?pal.a1:pal.border}`,background:goalType===t?pal.a1+"22":"transparent",color:goalType===t?pal.a1:pal.sub,cursor:"pointer",fontWeight:600,fontSize:13}}>
                {t==="none"?"No goal":"Days/week"}
              </button>
            ))}
          </div>
          {goalType==="days"&&(
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <input type="range" min={1} max={7} value={goalVal} onChange={e=>setGoalVal(+e.target.value)} style={{flex:1,accentColor:pal.a1}}/>
              <span style={{color:tx,fontWeight:700,minWidth:60}}>{goalVal}×/week</span>
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"11px",borderRadius:12,background:"transparent",border:`1px solid ${pal.border}`,color:tx,fontWeight:600,cursor:"pointer"}}>Cancel</button>
          <button onClick={()=>onSave({...act,name:name.trim()||act.name,color,goalType,goalVal})} style={{flex:2,padding:"11px",borderRadius:12,background:pal.a1,border:"none",color:"#fff",fontWeight:700,cursor:"pointer"}}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,setTab]=useState("checkin");
  const [activities,setActivities]=useState(()=>lsGet("st_activities",[]));
  const [log,setLog]=useState(()=>migrateLog(lsGet("st_log",{})));
  const [palKey,setPalKey]=useState(()=>lsGet("st_palette","green"));
  const [onboarded,setOnboarded]=useState(()=>lsGet("st_onboarded",false));
  const [newName,setNewName]=useState("");
  const [shareReady,setShareReady]=useState(false);
  const [dayModal,setDayModal]=useState(null);
  const [editAct,setEditAct]=useState(null);
  const [pulseId,setPulseId]=useState(null);
  const [notifPerm,setNotifPerm]=useState(()=>typeof Notification!=="undefined"?Notification.permission:"denied");
  const canvasRef=useRef();
  const pal=PALETTES[palKey]||PALETTES.green;
  const tx=pal.text||"#fff";

  useEffect(()=>lsSet("st_activities",activities),[activities]);
  useEffect(()=>lsSet("st_log",log),[log]);
  useEffect(()=>lsSet("st_palette",palKey),[palKey]);

  const todayKey=today();
  const todayLog=log[todayKey]||{};

  // Toggle with pulse animation
  function toggle(id) {
    setPulseId(id);
    setTimeout(()=>setPulseId(null),600);
    setLog(prev=>({...prev,[todayKey]:{...prev[todayKey],[id]:{...prev[todayKey]?.[id],done:!prev[todayKey]?.[id]?.done}}}));
  }

  function setNote(dateKey,actId,note) {
    setLog(prev=>({...prev,[dateKey]:{...prev[dateKey],[actId]:{...prev[dateKey]?.[actId],note}}}));
  }

  function addActivity() {
    const name=newName.trim(); if(!name) return;
    const id=Date.now().toString(), color=ACT_COLORS[activities.length%ACT_COLORS.length];
    setActivities(prev=>[...prev,{id,name,color,goalType:"none",goalVal:3}]);
    setNewName("");
  }

  function saveActivity(updated) {
    setActivities(prev=>prev.map(a=>a.id===updated.id?updated:a));
    setEditAct(null);
  }

  function removeActivity(id) {
    setActivities(prev=>prev.filter(a=>a.id!==id));
    setLog(prev=>{
      const next={...prev};
      Object.keys(next).forEach(k=>{if(next[k][id]!==undefined){next[k]={...next[k]};delete next[k][id];}});
      return next;
    });
  }

  // ── Streaks ──
  function getStreaks() {
    const res={};
    activities.forEach(a=>{
      let cur=0,best=0;
      const startFromYesterday=!log[todayKey]?.[a.id]?.done;
      let d=new Date(); if(startFromYesterday) d.setDate(d.getDate()-1);
      for(let i=0;i<365;i++){
        const k=toKey(d);
        if(log[k]?.[a.id]?.done){cur++;best=Math.max(best,cur);}
        else if(i>0||!startFromYesterday) break;
        d.setDate(d.getDate()-1);
      }
      // overall best scan
      let run=0;
      Object.keys(log).sort().forEach(k=>{ if(log[k]?.[a.id]?.done){run++;best=Math.max(best,run);}else run=0; });
      res[a.id]={current:cur,best};
    });
    return res;
  }
  const streaks=getStreaks();

  // Overall streak (fixed: count consecutive days with ANY activity)
  let overallStreak=0;
  { let d=new Date();
    // if today has no activity yet, start from yesterday
    const todayHas=log[todayKey]&&Object.values(log[todayKey]).some(x=>x?.done);
    if(!todayHas) d.setDate(d.getDate()-1);
    for(let i=0;i<365;i++){
      const k=toKey(d);
      if(log[k]&&Object.values(log[k]).some(x=>x?.done)){overallStreak++;d.setDate(d.getDate()-1);}
      else break;
    }
  }

  const totalActive=Object.keys(log).filter(k=>Object.values(log[k]).some(x=>x?.done)).length;
  const last7=Array.from({length:7},(_,i)=>toKey(daysAgo(i)));
  const weeklyDone=last7.filter(k=>log[k]&&Object.values(log[k]).some(x=>x?.done)).length;

  // Best day of week
  const dowCounts=Array(7).fill(0);
  Object.keys(log).forEach(k=>{if(Object.values(log[k]).some(x=>x?.done)){const d=new Date(k+"T12:00:00");dowCounts[d.getDay()]++;}});
  const bestDow=DAYS[dowCounts.indexOf(Math.max(...dowCounts))];

  // Monthly counts (last 6 months)
  const monthlyCounts={};
  Object.keys(log).forEach(k=>{
    if(Object.values(log[k]).some(x=>x?.done)){
      const m=k.slice(0,7);
      monthlyCounts[m]=(monthlyCounts[m]||0)+1;
    }
  });
  const months=Array.from({length:6},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-5+i);return d.toISOString().slice(0,7);});

  // Total completions
  const totalCompletions=Object.values(log).reduce((s,day)=>s+Object.values(day).filter(x=>x?.done).length,0);

  // Completion rate per activity
  const actCompRate=activities.map(a=>{
    const done=Object.values(log).filter(d=>d[a.id]?.done).length;
    const total=Object.keys(log).length||1;
    return {id:a.id,rate:Math.round(done/total*100)};
  });

  // Weekly goal progress
  function weekGoalProgress(a) {
    if(a.goalType!=="days") return null;
    const done=last7.filter(k=>log[k]?.[a.id]?.done).length;
    return {done,goal:a.goalVal,pct:Math.min(100,Math.round(done/a.goalVal*100))};
  }

  // Heatmap
  const heatmap=Array.from({length:112},(_,i)=>{
    const d=daysAgo(111-i), k=toKey(d);
    return {k,done:log[k]?Object.values(log[k]).filter(x=>x?.done).length:0};
  });

  // Week bars
  const bars=Array.from({length:7},(_,i)=>{
    const d=daysAgo(6-i), k=toKey(d);
    return {label:DAYS[d.getDay()],done:log[k]?Object.values(log[k]).filter(x=>x?.done).length:0,k};
  });
  const maxBar=Math.max(...bars.map(b=>b.done),1);

  // Push notifications
  async function enableNotifications() {
    if(typeof Notification==="undefined") return alert("Notifications not supported in this browser.");
    const perm=await Notification.requestPermission();
    setNotifPerm(perm);
    if(perm==="granted") scheduleStreakReminder();
  }
  function scheduleStreakReminder() {
    // Schedule a reminder if not yet done today — check at 20:00
    const now=new Date(), target=new Date();
    target.setHours(20,0,0,0);
    if(now>target) target.setDate(target.getDate()+1);
    const ms=target-now;
    setTimeout(()=>{
      const todayHas=log[today()]&&Object.values(log[today()]).some(x=>x?.done);
      if(!todayHas&&overallStreak>0){
        new Notification("🔥 Don't break your streak!",{body:`You have a ${overallStreak}-day streak. Log today's activity to keep it alive!`,icon:"https://cdn.jsdelivr.net/npm/twemoji@14/assets/72x72/1f3cb.png"});
      }
    },ms);
  }

  // Share
  function renderShare() {
    const canvas=canvasRef.current;
    canvas.width=492;
    drawShareCard(canvas,activities,log,streaks,pal);
    setShareReady(true);
  }
  function downloadPNG() { const a=document.createElement("a");a.download="sport-stats.png";a.href=canvasRef.current.toDataURL("image/png");a.click(); }
  function shareTwitter() { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🏋️ ${overallStreak} day streak, ${totalActive} active days! 💪 #SportTracker`)}`,"_blank"); }
  function shareWhatsApp() { window.open(`https://wa.me/?text=${encodeURIComponent(`🏋️ Sport Stats\n🔥 ${overallStreak}d streak\n📅 ${totalActive} active days\n📊 ${weeklyDone}/7 this week`)}`,"_blank"); }
  async function copyImg() { canvasRef.current.toBlob(async b=>{try{await navigator.clipboard.write([new ClipboardItem({"image/png":b})]);alert("Copied!");}catch{alert("Please download instead.");}});}

  const cardStyle={background:pal.card,border:`1px solid ${pal.border}`,borderRadius:16,padding:20};

  return (
    <div style={{minHeight:"100vh",background:pal.bg0,color:tx,fontFamily:"system-ui,sans-serif",paddingBottom:40}}>
      {!onboarded&&<Onboarding onDone={()=>{setOnboarded(true);lsSet("st_onboarded",true);}} pal={pal}/>}
      {dayModal&&<DayModal dateKey={dayModal} activities={activities} log={log} onClose={()=>setDayModal(null)} onToggle={toggle} onNote={setNote} pal={pal}/>}
      {editAct&&<EditModal act={editAct} onSave={saveActivity} onClose={()=>setEditAct(null)} pal={pal}/>}

      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${pal.bg1},${pal.bg2})`,borderBottom:`1px solid ${pal.border}`,padding:"20px 24px 0"}}>
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <h1 style={{margin:"0 0 4px",fontSize:24,fontWeight:800,color:pal.a1}}>Chainly ⛓️</h1>
              <p style={{margin:"0 0 16px",color:pal.sub,fontSize:13}}>{new Date().toDateString()}</p>
            </div>
            {/* Palette picker */}
            <div style={{display:"flex",gap:6,paddingTop:4}}>
              {Object.entries(PALETTES).map(([k,p])=>(
                <div key={k} onClick={()=>setPalKey(k)} title={p.name} style={{width:18,height:18,borderRadius:"50%",background:p.a1,cursor:"pointer",border:k===palKey?`2px solid ${tx}`:"2px solid transparent",boxSizing:"border-box"}}/>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:4,overflowX:"auto"}}>
            {["checkin","stats","activities","share"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 16px",borderRadius:"10px 10px 0 0",border:"none",cursor:"pointer",fontWeight:600,fontSize:13,whiteSpace:"nowrap",
                background:tab===t?pal.a1:"transparent",color:tab===t?"#fff":pal.sub,
                borderBottom:tab===t?`2px solid ${pal.a1}`:"2px solid transparent"
              }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:640,margin:"24px auto",padding:"0 16px"}}>

        {/* ── CHECK-IN ── */}
        {tab==="checkin"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
              {[["🔥","Streak",overallStreak+"d"],["📅","Active",totalActive+"d"],["📊","Week",weeklyDone+"/7"]].map(([e,l,v])=>(
                <div key={l} style={{...cardStyle,textAlign:"center",padding:14}}>
                  <div style={{fontSize:20}}>{e}</div>
                  <div style={{fontSize:20,fontWeight:800,color:pal.a1}}>{v}</div>
                  <div style={{fontSize:11,color:pal.muted,marginTop:1}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={cardStyle}>
              <h3 style={{margin:"0 0 14px",fontSize:15,color:pal.sub,fontWeight:600}}>Today's Activities</h3>
              {activities.length===0&&<p style={{color:pal.muted,fontSize:14}}>No activities yet — add some in the Activities tab!</p>}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {activities.map(a=>{
                  const done=!!todayLog[a.id]?.done;
                  const s=streaks[a.id]||{current:0};
                  const gp=weekGoalProgress(a);
                  const isPulsing=pulseId===a.id;
                  return (
                    <div key={a.id}>
                      <div onClick={()=>toggle(a.id)} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 14px",borderRadius:12,cursor:"pointer",
                        background:done?a.color+"22":"rgba(255,255,255,0.03)",
                        border:`1px solid ${done?a.color+"66":pal.border}`,
                        transition:"all 0.2s",
                        transform:isPulsing?"scale(1.02)":"scale(1)",
                        boxShadow:isPulsing?`0 0 20px ${a.color}55`:"none"}}>
                        <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,
                          background:done?a.color:"rgba(255,255,255,0.08)",
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,
                          transition:"all 0.2s",
                          boxShadow:isPulsing&&done?`0 0 12px ${a.color}`:"none"}}>
                          {done?"✓":""}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:15,color:done?a.color:tx}}>{a.name}</div>
                          <div style={{fontSize:12,color:pal.muted,marginTop:1}}>🔥 {s.current}d streak · best {s.best}d</div>
                        </div>
                        <div style={{fontSize:12,color:done?a.color:pal.muted,fontWeight:700,flexShrink:0}}>{done?"Done!":"Tap"}</div>
                      </div>
                      {gp&&(
                        <div style={{margin:"4px 0 0",padding:"6px 14px",borderRadius:"0 0 10px 10px",background:"rgba(255,255,255,0.02)",border:`1px solid ${pal.border}`,borderTop:"none"}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                            <span style={{fontSize:11,color:pal.sub}}>Weekly goal</span>
                            <span style={{fontSize:11,color:gp.done>=gp.goal?pal.a1:pal.sub,fontWeight:700}}>{gp.done}/{gp.goal}×</span>
                          </div>
                          <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.06)"}}>
                            <div style={{height:"100%",borderRadius:2,background:gp.done>=gp.goal?pal.a1:a.color,width:gp.pct+"%",transition:"width 0.4s"}}/>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── STATS ── */}
        {tab==="stats"&&(
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            {/* Summary cards */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[["🔥","Overall Streak",overallStreak+"d"],["📅","Total Active Days",totalActive+""],["💪","Total Completions",totalCompletions+""],["📆","Best Day",bestDow]].map(([e,l,v])=>(
                <div key={l} style={{...cardStyle,padding:16}}>
                  <div style={{fontSize:22,marginBottom:4}}>{e}</div>
                  <div style={{fontSize:22,fontWeight:800,color:pal.a1}}>{v}</div>
                  <div style={{fontSize:11,color:pal.muted,marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>

            {/* Weekly bar */}
            <div style={cardStyle}>
              <h3 style={{margin:"0 0 14px",fontSize:15,color:pal.sub}}>This Week</h3>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,height:110}}>
                {bars.map(b=>(
                  <div key={b.k} onClick={()=>setDayModal(b.k)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer"}}>
                    <div style={{fontSize:11,color:pal.a1,fontWeight:700}}>{b.done>0?b.done:""}</div>
                    <div style={{width:"100%",borderRadius:6,transition:"height 0.5s",
                      height:b.done===0?4:Math.max(8,b.done/maxBar*88),
                      background:b.k===todayKey?pal.a1:b.done>0?pal.a1+"80":"rgba(255,255,255,0.06)"}}/>
                    <div style={{fontSize:11,color:b.k===todayKey?pal.a1:pal.muted}}>{b.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly chart */}
            <div style={cardStyle}>
              <h3 style={{margin:"0 0 14px",fontSize:15,color:pal.sub}}>Monthly Active Days</h3>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,height:90}}>
                {months.map(m=>{
                  const v=monthlyCounts[m]||0, max=Math.max(...months.map(x=>monthlyCounts[x]||0),1);
                  return (
                    <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <div style={{fontSize:10,color:pal.a1,fontWeight:700}}>{v||""}</div>
                      <div style={{width:"100%",borderRadius:4,height:v===0?4:Math.max(6,v/max*70),background:v>0?pal.a1+"99":"rgba(255,255,255,0.06)",transition:"height 0.4s"}}/>
                      <div style={{fontSize:9,color:pal.muted}}>{m.slice(5)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity streaks + completion rate */}
            <div style={cardStyle}>
              <h3 style={{margin:"0 0 14px",fontSize:15,color:pal.sub}}>Activity Stats</h3>
              {activities.length===0&&<p style={{color:pal.muted,fontSize:14}}>No activities yet.</p>}
              {activities.map(a=>{
                const s=streaks[a.id]||{current:0,best:0};
                const pct=s.best>0?Math.round(s.current/s.best*100):0;
                const cr=actCompRate.find(x=>x.id===a.id)?.rate||0;
                return (
                  <div key={a.id} style={{marginBottom:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontWeight:600,fontSize:14}}><span style={{color:a.color}}>● </span>{a.name}</span>
                      <span style={{fontSize:12,color:pal.sub}}>🔥{s.current}d · best {s.best}d · {cr}%</span>
                    </div>
                    <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.06)"}}>
                      <div style={{height:"100%",borderRadius:3,background:a.color,width:pct+"%",transition:"width 0.5s"}}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Heatmap */}
            <div style={cardStyle}>
              <h3 style={{margin:"0 0 10px",fontSize:15,color:pal.sub}}>Activity Heatmap <span style={{fontSize:11,color:pal.muted}}>(tap a cell)</span></h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(16,1fr)",gap:3}}>
                {Array.from({length:16},(_,w)=>Array.from({length:7},(_,d)=>{
                  const cell=heatmap[w*7+d]; if(!cell) return <div key={`${w}-${d}`}/>;
                  const alpha=cell.done===0?0.06:0.15+cell.done/Math.max(activities.length,1)*0.85;
                  return <div key={cell.k} onClick={()=>setDayModal(cell.k)} title={cell.k} style={{aspectRatio:"1",borderRadius:3,cursor:"pointer",
                    background:cell.done===0?"rgba(255,255,255,0.06)":`rgba(${hexToRgb(pal.a1)},${alpha})`,
                    border:cell.k===todayKey?`1px solid ${pal.a1}`:"none"}}/>;
                }))}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8,fontSize:11,color:pal.muted}}>
                <span>Less</span>
                {[0.06,0.3,0.5,0.7,0.95].map(a=><div key={a} style={{width:11,height:11,borderRadius:2,background:`rgba(${hexToRgb(pal.a1)},${a})`}}/>)}
                <span>More</span>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITIES ── */}
        {tab==="activities"&&(
          <div style={cardStyle}>
            <h3 style={{margin:"0 0 14px",fontSize:16,color:pal.sub}}>Manage Activities</h3>
            <div style={{display:"flex",gap:8,marginBottom:20}}>
              <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addActivity()}
                placeholder="New activity name..."
                style={{flex:1,padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.06)",border:`1px solid ${pal.border}`,color:tx,fontSize:14,outline:"none"}}/>
              <button onClick={addActivity} style={{padding:"10px 20px",borderRadius:10,background:pal.a1,border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:14}}>Add</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {activities.length===0&&<p style={{color:pal.muted,fontSize:14}}>No activities yet.</p>}
              {activities.map(a=>{
                const gp=weekGoalProgress(a);
                return (
                  <div key={a.id} style={{padding:"12px 14px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:`1px solid ${pal.border}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:12,height:12,borderRadius:"50%",background:a.color,flexShrink:0}}/>
                      <span style={{flex:1,fontWeight:600,fontSize:14,color:tx}}>{a.name}</span>
                      {a.goalType==="days"&&<span style={{fontSize:11,color:pal.a1,fontWeight:600}}>{a.goalVal}×/wk</span>}
                      <span style={{fontSize:12,color:pal.muted}}>🔥{(streaks[a.id]||{}).current||0}d</span>
                      <button onClick={()=>setEditAct(a)} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${pal.border}`,color:tx,borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:12}}>Edit</button>
                      <button onClick={()=>removeActivity(a.id)} style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.25)",color:"#ef4444",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:12}}>✕</button>
                    </div>
                    {gp&&(
                      <div style={{marginTop:8}}>
                        <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.06)"}}>
                          <div style={{height:"100%",borderRadius:2,background:gp.done>=gp.goal?pal.a1:a.color,width:gp.pct+"%",transition:"width 0.4s"}}/>
                        </div>
                        <div style={{fontSize:11,color:pal.muted,marginTop:3}}>{gp.done}/{gp.goal} this week</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Notifications */}
            <div style={{marginTop:24,padding:16,borderRadius:12,background:"rgba(255,255,255,0.03)",border:`1px solid ${pal.border}`}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:6,color:tx}}>🔔 Streak Reminders</div>
              <div style={{fontSize:13,color:pal.muted,marginBottom:12}}>Get notified at 8 PM if you haven't logged your activities and have an active streak.</div>
              {notifPerm==="granted"
                ? <div style={{color:pal.a1,fontWeight:600,fontSize:13}}>✓ Notifications enabled</div>
                : <button onClick={enableNotifications} style={{padding:"9px 18px",borderRadius:10,background:pal.a1,border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>Enable Notifications</button>
              }
            </div>
          </div>
        )}

        {/* ── SHARE ── */}
        {tab==="share"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={cardStyle}>
              <h3 style={{margin:"0 0 6px",fontSize:16,color:pal.sub}}>Share Your Progress</h3>
              <p style={{margin:"0 0 16px",fontSize:13,color:pal.muted}}>Generate a stats card and send it to friends!</p>
              <button onClick={renderShare} style={{width:"100%",padding:"12px",borderRadius:12,background:`linear-gradient(135deg,${pal.a1},${pal.a2})`,border:"none",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>
                ✨ Generate Stats Card
              </button>
            </div>
            <canvas ref={canvasRef} style={{display:"none"}}/>
            {shareReady&&(
              <div style={cardStyle}>
                <img src={canvasRef.current.toDataURL()} alt="Stats" style={{width:"100%",borderRadius:12,marginBottom:16}}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  <button onClick={downloadPNG} style={{padding:"11px",borderRadius:10,background:pal.a1,border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>⬇️ Download PNG</button>
                  <button onClick={copyImg} style={{padding:"11px",borderRadius:10,background:"rgba(255,255,255,0.08)",border:`1px solid ${pal.border}`,color:tx,fontWeight:700,cursor:"pointer",fontSize:13}}>📋 Copy Image</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <button onClick={shareTwitter} style={{padding:"11px",borderRadius:10,background:"#1da1f2",border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>𝕏 Twitter</button>
                  <button onClick={shareWhatsApp} style={{padding:"11px",borderRadius:10,background:"#25d366",border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>💬 WhatsApp</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}