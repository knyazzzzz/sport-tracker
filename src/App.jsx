import { useState, useEffect, useRef } from "react";

const COLORS = ["#10b981","#f59e0b","#6366f1","#ef4444","#3b82f6","#ec4899","#8b5cf6","#14b8a6"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const ACCENT = "#10b981";
const ACCENT2 = "#34d399";

function toKey(date) { return date.toISOString().slice(0,10); }
function today() { return toKey(new Date()); }

function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function drawShareCard(canvas, activities, log, streaks) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const bg = ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,"#0a1a12"); bg.addColorStop(1,"#0d2318");
  ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  for(let x=20;x<W;x+=28) for(let y=20;y<H;y+=28) { ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2); ctx.fill(); }
  ctx.fillStyle = "#fff"; ctx.font = "bold 32px system-ui"; ctx.fillText("My Sport Stats 🏆", 36, 56);
  ctx.fillStyle = ACCENT; ctx.fillRect(36, 68, 120, 3);
  ctx.fillStyle = "#888"; ctx.font = "14px system-ui"; ctx.fillText(new Date().toDateString(), 36, 96);
  let overallStreak = 0, d = new Date();
  for(let i=0;i<365;i++) {
    const k = toKey(d);
    if(log[k] && Object.values(log[k]).some(Boolean)) overallStreak++;
    else break;
    d.setDate(d.getDate()-1);
  }
  const totalDays = Object.keys(log).filter(k=>Object.values(log[k]||{}).some(Boolean)).length;
  const thisWeek = [0,1,2,3,4,5,6].map(i=>{ const d2=new Date(); d2.setDate(d2.getDate()-i); return toKey(d2); });
  const weeklyRate = Math.round(thisWeek.filter(k=>log[k]&&Object.values(log[k]).some(Boolean)).length/7*100);
  const boxes = [
    {label:"🔥 Overall Streak", val: overallStreak+"d"},
    {label:"📅 Total Active Days", val: totalDays+""},
    {label:"📊 Weekly Rate", val: weeklyRate+"%"},
    {label:"🎯 Activities", val: activities.length+""},
  ];
  boxes.forEach((b,i)=>{
    const x = 36+(i%2)*220, y = 120+Math.floor(i/2)*90;
    ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.beginPath(); ctx.roundRect(x,y,200,70,12); ctx.fill();
    ctx.strokeStyle=ACCENT+"55"; ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(x,y,200,70,12); ctx.stroke();
    ctx.fillStyle="#aaa"; ctx.font="12px system-ui"; ctx.fillText(b.label, x+14, y+22);
    ctx.fillStyle="#fff"; ctx.font="bold 28px system-ui"; ctx.fillText(b.val, x+14, y+54);
  });
  ctx.fillStyle="#fff"; ctx.font="bold 16px system-ui"; ctx.fillText("Activity Streaks", 36, 330);
  activities.slice(0,6).forEach((a,i)=>{
    const y = 348+i*38;
    ctx.fillStyle = a.color+"33"; ctx.beginPath(); ctx.roundRect(36,y,W-72,30,8); ctx.fill();
    const s = streaks[a.id]||{current:0};
    ctx.fillStyle=a.color; ctx.beginPath(); ctx.arc(56,y+15,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#fff"; ctx.font="13px system-ui"; ctx.fillText(a.name, 72, y+19);
    ctx.fillStyle=a.color; ctx.font="bold 14px system-ui"; ctx.fillText("🔥 "+s.current+"d streak", W-130, y+19);
  });
  const hmY = H-110;
  ctx.fillStyle="#fff"; ctx.font="bold 16px system-ui"; ctx.fillText("Last 4 Weeks", 36, hmY);
  for(let w=0;w<28;w++) {
    const dd = new Date(); dd.setDate(dd.getDate()-(27-w));
    const k = toKey(dd);
    const done = log[k] ? Object.values(log[k]).filter(Boolean).length : 0;
    const max = Math.max(activities.length,1), intensity = done/max;
    ctx.fillStyle = done===0 ? "rgba(255,255,255,0.06)" : `rgba(16,185,129,${0.2+intensity*0.8})`;
    const cx2 = 36+(w%7)*42, cy2 = hmY+12+Math.floor(w/7)*18;
    ctx.beginPath(); ctx.roundRect(cx2,cy2,34,12,4); ctx.fill();
  }
  ctx.fillStyle="#444"; ctx.font="12px system-ui"; ctx.fillText("Made with Sport Tracker 💪", 36, H-18);
}

export default function App() {
  const [tab, setTab] = useState("checkin");
  const [activities, setActivities] = useState(() => lsGet("st_activities", []));
  const [log, setLog] = useState(() => lsGet("st_log", {}));
  const [newName, setNewName] = useState("");
  const [shareReady, setShareReady] = useState(false);
  const canvasRef = useRef();

  useEffect(() => lsSet("st_activities", activities), [activities]);
  useEffect(() => lsSet("st_log", log), [log]);

  const todayKey = today();
  const todayLog = log[todayKey] || {};

  function toggle(id) {
    setLog(prev => ({ ...prev, [todayKey]: { ...prev[todayKey], [id]: !prev[todayKey]?.[id] } }));
  }
  function addActivity() {
    const name = newName.trim();
    if (!name) return;
    const id = Date.now().toString();
    const color = COLORS[activities.length % COLORS.length];
    setActivities(prev => [...prev, {id, name, color}]);
    setNewName("");
  }
  function removeActivity(id) { setActivities(prev => prev.filter(a => a.id !== id)); }

  function getStreaks() {
    const res = {};
    activities.forEach(a => {
      let cur = 0, best = 0;
      if (!log[todayKey]?.[a.id]) {
        let d2 = new Date(); d2.setDate(d2.getDate()-1);
        for (let i=0;i<365;i++) {
          const k = toKey(d2);
          if (log[k]?.[a.id]) { cur++; best = Math.max(best,cur); }
          else break;
          d2.setDate(d2.getDate()-1);
        }
      } else {
        let d = new Date();
        for (let i=0;i<365;i++) {
          const k = toKey(d);
          if (log[k]?.[a.id]) { cur++; best = Math.max(best,cur); }
          else if (i>0) break;
          d.setDate(d.getDate()-1);
        }
      }
      res[a.id] = {current:cur, best};
    });
    return res;
  }
  const streaks = getStreaks();

  let overallStreak = 0;
  { let d = new Date();
    for (let i=0;i<365;i++) {
      const k = toKey(d);
      if (log[k] && Object.values(log[k]).some(Boolean)) overallStreak++;
      else break;
      d.setDate(d.getDate()-1);
    }
  }
  const totalActive = Object.keys(log).filter(k => Object.values(log[k]).some(Boolean)).length;
  const last7 = Array.from({length:7}, (_,i) => { const d=new Date(); d.setDate(d.getDate()-i); return toKey(d); });
  const weeklyDone = last7.filter(k => log[k] && Object.values(log[k]).some(Boolean)).length;

  function getHeatmap() {
    const cells = [], start = new Date(); start.setDate(start.getDate()-111);
    for (let i=0;i<112;i++) {
      const d = new Date(start); d.setDate(start.getDate()+i);
      const k = toKey(d);
      cells.push({k, d: new Date(d), done: log[k] ? Object.values(log[k]).filter(Boolean).length : 0});
    }
    return cells;
  }
  const heatmap = getHeatmap();

  const bars = Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate()-6+i);
    const k = toKey(d);
    return {label: DAYS[d.getDay()], done: log[k] ? Object.values(log[k]).filter(Boolean).length : 0, k};
  });
  const maxBar = Math.max(...bars.map(b => b.done), 1);

  function renderShare() {
    const canvas = canvasRef.current;
    canvas.width = 492; canvas.height = 600;
    drawShareCard(canvas, activities, log, streaks);
    setShareReady(true);
  }
  function downloadPNG() {
    const a = document.createElement("a"); a.download = "sport-stats.png"; a.href = canvasRef.current.toDataURL("image/png"); a.click();
  }
  function shareTwitter() {
    const t = encodeURIComponent(`🏋️ My sport stats: ${overallStreak} day streak, ${totalActive} active days, ${weeklyDone}/7 this week! 💪 #SportTracker`);
    window.open(`https://twitter.com/intent/tweet?text=${t}`, "_blank");
  }
  function shareWhatsApp() {
    const t = encodeURIComponent(`🏋️ My sport stats:\n🔥 ${overallStreak} day streak\n📅 ${totalActive} total active days\n📊 ${weeklyDone}/7 this week 💪`);
    window.open(`https://wa.me/?text=${t}`, "_blank");
  }
  async function copyImg() {
    canvasRef.current.toBlob(async blob => {
      try { await navigator.clipboard.write([new ClipboardItem({"image/png": blob})]); alert("Image copied!"); }
      catch { alert("Copy not supported — please download instead."); }
    });
  }

  const cardStyle = {background:"rgba(255,255,255,0.04)",border:"1px solid rgba(16,185,129,0.12)",borderRadius:16,padding:20};

  return (
    <div style={{minHeight:"100vh",background:"#0a1a12",color:"#fff",fontFamily:"system-ui,sans-serif",paddingBottom:40}}>
      <div style={{background:"linear-gradient(135deg,#0d1f17,#0f2a1e)",borderBottom:"1px solid rgba(16,185,129,0.3)",padding:"20px 24px 0"}}>
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <h1 style={{margin:"0 0 4px",fontSize:24,fontWeight:800,background:`linear-gradient(90deg,${ACCENT},${ACCENT2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Sport Tracker 🏋️
          </h1>
          <p style={{margin:"0 0 16px",color:"#4a7a62",fontSize:13}}>{new Date().toDateString()}</p>
          <div style={{display:"flex",gap:8}}>
            {["checkin","stats","activities","share"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 18px",borderRadius:"10px 10px 0 0",border:"none",cursor:"pointer",fontWeight:600,fontSize:13,
                background: tab===t ? ACCENT : "transparent",
                color: tab===t ? "#fff" : "#668a76",
                borderBottom: tab===t ? `2px solid ${ACCENT}` : "2px solid transparent"
              }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:640,margin:"24px auto",padding:"0 16px"}}>

        {tab==="checkin" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
              {[["🔥","Overall Streak",overallStreak+"d"],["📅","Active Days",totalActive],["📊","This Week",weeklyDone+"/7"]].map(([e,l,v])=>(
                <div key={l} style={{...cardStyle,textAlign:"center"}}>
                  <div style={{fontSize:22}}>{e}</div>
                  <div style={{fontSize:22,fontWeight:800,color:ACCENT}}>{v}</div>
                  <div style={{fontSize:11,color:"#4a7a62",marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={cardStyle}>
              <h3 style={{margin:"0 0 16px",fontSize:16,color:"#668a76",fontWeight:600}}>Today's Activities</h3>
              {activities.length===0 && <p style={{color:"#3a5a48",fontSize:14}}>No activities yet. Add some in the Activities tab!</p>}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {activities.map(a=>{
                  const done = !!todayLog[a.id];
                  const s = streaks[a.id]||{current:0};
                  return (
                    <div key={a.id} onClick={()=>toggle(a.id)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:12,cursor:"pointer",
                      background: done ? a.color+"22" : "rgba(255,255,255,0.03)",
                      border:`1px solid ${done?a.color+"66":"rgba(16,185,129,0.08)"}`,transition:"all 0.2s"}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:done?a.color:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,transition:"all 0.2s"}}>
                        {done?"✓":""}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:15,color:done?a.color:"#ccc"}}>{a.name}</div>
                        <div style={{fontSize:12,color:"#3a5a48",marginTop:2}}>🔥 {s.current}d streak · best {s.best}d</div>
                      </div>
                      <div style={{fontSize:12,color:done?a.color:"#3a5a48",fontWeight:700}}>{done?"Done!":"Tap"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab==="stats" && (
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div style={cardStyle}>
              <h3 style={{margin:"0 0 16px",fontSize:15,color:"#668a76"}}>This Week</h3>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,height:120}}>
                {bars.map(b=>(
                  <div key={b.k} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{fontSize:11,color:ACCENT,fontWeight:700}}>{b.done>0?b.done:""}</div>
                    <div style={{width:"100%",borderRadius:6,transition:"height 0.5s",
                      height: b.done===0?4:Math.max(8,(b.done/maxBar)*90),
                      background: b.k===todayKey ? ACCENT : b.done>0 ? ACCENT+"80" : "rgba(255,255,255,0.06)"
                    }}/>
                    <div style={{fontSize:11,color:b.k===todayKey?ACCENT:"#3a5a48"}}>{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={cardStyle}>
              <h3 style={{margin:"0 0 14px",fontSize:15,color:"#668a76"}}>Activity Streaks</h3>
              {activities.length===0 && <p style={{color:"#3a5a48",fontSize:14}}>No activities yet.</p>}
              {activities.map(a=>{
                const s = streaks[a.id]||{current:0,best:0};
                const pct = s.best>0 ? Math.round(s.current/s.best*100) : 0;
                return (
                  <div key={a.id} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontWeight:600,fontSize:14}}><span style={{color:a.color}}>●</span> {a.name}</span>
                      <span style={{fontSize:13,color:"#668a76"}}>🔥 {s.current}d / best {s.best}d</span>
                    </div>
                    <div style={{height:6,borderRadius:4,background:"rgba(255,255,255,0.06)"}}>
                      <div style={{height:"100%",borderRadius:4,background:a.color,width:pct+"%",transition:"width 0.5s"}}/>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={cardStyle}>
              <h3 style={{margin:"0 0 12px",fontSize:15,color:"#668a76"}}>Activity Heatmap (16 weeks)</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(16,1fr)",gap:3}}>
                {Array.from({length:16},(_,w)=>
                  Array.from({length:7},(_,d)=>{
                    const idx=w*7+d, cell=heatmap[idx];
                    if(!cell) return <div key={`${w}-${d}`}/>;
                    const max=Math.max(activities.length,1), alpha=cell.done===0?0.06:0.15+cell.done/max*0.85;
                    return (
                      <div key={cell.k} title={`${cell.k}: ${cell.done} activities`} style={{
                        aspectRatio:"1",borderRadius:3,
                        background: cell.done===0?"rgba(255,255,255,0.06)":`rgba(16,185,129,${alpha})`,
                        border: cell.k===todayKey?`1px solid ${ACCENT}`:"none"
                      }}/>
                    );
                  })
                )}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10,fontSize:11,color:"#3a5a48"}}>
                <span>Less</span>
                {[0.06,0.3,0.5,0.7,0.95].map(a=>(
                  <div key={a} style={{width:12,height:12,borderRadius:2,background:`rgba(16,185,129,${a})`}}/>
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        )}

        {tab==="activities" && (
          <div style={cardStyle}>
            <h3 style={{margin:"0 0 16px",fontSize:16,color:"#668a76"}}>Manage Activities</h3>
            <div style={{display:"flex",gap:8,marginBottom:20}}>
              <input value={newName} onChange={e=>setNewName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&addActivity()}
                placeholder="New activity name..."
                style={{flex:1,padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(16,185,129,0.2)",color:"#fff",fontSize:14,outline:"none"}}/>
              <button onClick={addActivity} style={{padding:"10px 20px",borderRadius:10,background:ACCENT,border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:14}}>Add</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {activities.length===0 && <p style={{color:"#3a5a48",fontSize:14}}>No activities yet. Add your first one above!</p>}
              {activities.map(a=>(
                <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:12,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(16,185,129,0.08)"}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:a.color,flexShrink:0}}/>
                  <span style={{flex:1,fontWeight:600}}>{a.name}</span>
                  <span style={{fontSize:12,color:"#3a5a48"}}>🔥 {(streaks[a.id]||{}).current||0}d</span>
                  <button onClick={()=>removeActivity(a.id)} style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",borderRadius:8,padding:"4px 12px",cursor:"pointer",fontSize:12}}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="share" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={cardStyle}>
              <h3 style={{margin:"0 0 8px",fontSize:16,color:"#668a76"}}>Share Your Progress</h3>
              <p style={{margin:"0 0 16px",fontSize:13,color:"#3a5a48"}}>Generate a stats card and share it with friends!</p>
              <button onClick={renderShare} style={{width:"100%",padding:"12px",borderRadius:12,background:`linear-gradient(135deg,${ACCENT},${ACCENT2})`,border:"none",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>
                ✨ Generate Stats Card
              </button>
            </div>
            <canvas ref={canvasRef} style={{display:"none"}}/>
            {shareReady && (
              <div style={cardStyle}>
                <img src={canvasRef.current.toDataURL()} alt="Stats card" style={{width:"100%",borderRadius:12,marginBottom:16}}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  <button onClick={downloadPNG} style={{padding:"11px",borderRadius:10,background:ACCENT,border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>⬇️ Download PNG</button>
                  <button onClick={copyImg} style={{padding:"11px",borderRadius:10,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(16,185,129,0.2)",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>📋 Copy Image</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <button onClick={shareTwitter} style={{padding:"11px",borderRadius:10,background:"#1da1f2",border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>𝕏 Share on Twitter</button>
                  <button onClick={shareWhatsApp} style={{padding:"11px",borderRadius:10,background:"#25d366",border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>💬 Share on WhatsApp</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}