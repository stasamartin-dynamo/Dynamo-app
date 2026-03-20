import { useState, useEffect, useCallback, useRef } from "react";
const SK="dynamo-v1",now=()=>new Date().toISOString(),td=()=>now().split('T')[0],uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const TEAMS=[{id:"a-tym",name:"A-Tým",color:"#22d3ee",pin:"1166"},{id:"starsi-zaci",name:"Starší žáci",color:"#a855f7",pin:"2266"},{id:"mladsi-zaci",name:"Mladší žáci",color:"#fb923c",pin:"3366"},{id:"starsi-pripravka",name:"Starší přípravka",color:"#fbbf24",pin:"4466"},{id:"mladsi-pripravka",name:"Mladší přípravka",color:"#34d399",pin:"5566"}];
const emptyTeam=()=>({badges:{},notifications:[],players:[],contacts:[],matches:[],trainings:[],news:[],chat:[],absences:[],polls:[],photos:[]});
const DEF={teams:{}};
TEAMS.forEach(t=>{DEF.teams[t.id]=emptyTeam()});
DEF.teams["a-tym"].players=[{id:"p1",name:"Jan Novák",number:7,position:"Útočník",birthYear:2000},{id:"p2",name:"Petr Dvořák",number:3,position:"Obránce",birthYear:1999},{id:"p3",name:"Martin Svoboda",number:10,position:"Záložník",birthYear:2001},{id:"p4",name:"Tomáš Černý",number:1,position:"Brankář",birthYear:1998}];
DEF.teams["a-tym"].matches=[{id:"m1",date:"2026-03-22",time:"15:00",opponent:"SK Mikulov",location:"Domácí",type:"Liga",result:null,lineup:[],rsvp:{}}];
DEF.teams["a-tym"].news=[{id:"nw1",date:"2026-03-18T10:30:00",from:"Trenér",title:"Víkendový zápas",text:"Sraz v 14:00 u hřiště. S sebou chrániče.",pinned:true,important:true}];
DEF.teams["mladsi-pripravka"].players=[{id:"p1",name:"Jakub Malý",number:7,position:"Útočník",birthYear:2017},{id:"p2",name:"Filip Veselý",number:3,position:"Obránce",birthYear:2017},{id:"p3",name:"Adam Horák",number:10,position:"Záložník",birthYear:2018}];
DEF.teams["mladsi-pripravka"].contacts=[{id:"c1",name:"Pavel Malý",relation:"Otec–Jakub",phone:"+420 777 111 222",email:""}];
const Ic={Home:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,Cal:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,Ppl:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,Cup:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M18 2H6v7a6 6 0 0012 0V2z"/></svg>,Cam:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,Chat:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,XC:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,X:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,Plus:()=><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,Bk:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,Chk:()=><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,Del:()=><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,Pin:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>,Out:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,Bell:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,Book:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,Chart:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,Up:()=><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>,Dn:()=><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>,Q:()=><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,Send:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,News:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>,Ball:()=><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z"/><path d="M2 12h20"/></svg>,Grid:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>};
const LD=async()=>{try{const r=localStorage.getItem(SK);return r?JSON.parse(r):DEF}catch{return DEF}};
const SV=async d=>{try{localStorage.setItem(SK,JSON.stringify(d))}catch{}};
const S=`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;500;700&family=Archivo+Black&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0a0f1a;--bg2:#111827;--bg3:#1e293b;--cd:#1a2332;--cd2:#1e2a3d;--ac:#22d3ee;--ac2:#06b6d4;--ag:rgba(34,211,238,.15);--g:#34d399;--gb:rgba(52,211,153,.12);--r:#f87171;--rb2:rgba(248,113,113,.12);--y:#fbbf24;--yb:rgba(251,191,36,.12);--o:#fb923c;--p:#a855f7;--t:#f1f5f9;--t2:#94a3b8;--t3:#64748b;--b:#1e293b;--b2:#334155;--rd:14px;--rs:10px;--f:'DM Sans',sans-serif;--fd:'Archivo Black',sans-serif}
body,html{font-family:var(--f);background:var(--bg);color:var(--t);height:100vh;-webkit-font-smoothing:antialiased;overflow:hidden}
.shell{display:flex;height:100vh;max-width:720px;margin:0 auto;background:var(--bg)}
.rail{width:64px;background:var(--bg2);border-right:1px solid var(--b);display:flex;flex-direction:column;align-items:center;flex-shrink:0;overflow-y:auto;padding:6px 0;scrollbar-width:none}
.rail::-webkit-scrollbar{display:none}
.rdv{width:28px;height:1px;background:var(--b2);margin:3px 0;flex-shrink:0}
.ri{width:54px;display:flex;flex-direction:column;align-items:center;gap:1px;padding:7px 0 5px;color:var(--t3);cursor:pointer;border:none;background:none;font-family:var(--f);font-size:8px;font-weight:600;position:relative;border-radius:10px;margin:1px 0;flex-shrink:0;transition:all .15s}
.ri:hover{color:var(--t);background:var(--cd)}
.ri.a{color:var(--ac);background:var(--ag)}
.ri .bd{position:absolute;top:1px;right:2px;min-width:15px;height:15px;background:var(--r);border-radius:8px;font-size:8px;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;padding:0 3px;border:2px solid var(--bg2)}
.rft{margin-top:auto;padding:6px 0;flex-shrink:0;display:flex;flex-direction:column;gap:4px;align-items:center}
.rft button{background:none;border:none;color:var(--t3);cursor:pointer;padding:8px;border-radius:10px}
.rft button:hover{color:var(--r);background:var(--cd)}
.cnt{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.top{padding:10px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--b);flex-shrink:0}
.hb{background:none;border:none;color:var(--t3);cursor:pointer;padding:6px;position:relative;border-radius:8px}
.hb:hover{color:var(--t)}.hb .dot{position:absolute;top:3px;right:3px;width:8px;height:8px;background:var(--r);border-radius:50%;border:2px solid var(--bg)}
.ms{flex:1;overflow-y:auto;padding:14px 16px}
.ph{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.pt{font-family:var(--fd);font-size:17px;text-transform:uppercase}
.ba{display:flex;align-items:center;gap:5px;background:var(--ag);color:var(--ac);border:1.5px solid rgba(34,211,238,.25);border-radius:var(--rs);padding:7px 11px;font-size:11px;font-weight:600;font-family:var(--f);cursor:pointer}
.c2{background:var(--cd);border:1px solid var(--b);border-radius:var(--rd);padding:13px;margin-bottom:9px;cursor:pointer;transition:background .15s}
.c2:hover{background:var(--cd2)}
.cr{display:flex;align-items:center;justify-content:space-between}
.ctt{font-weight:700;font-size:13px;margin-bottom:2px}.css{font-size:11px;color:var(--t2)}
.tg{font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;text-transform:uppercase}
.th{background:var(--gb);color:var(--g)}.ta{background:var(--yb);color:var(--y)}
.sg{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
.st{background:var(--cd);border:1px solid var(--b);border-radius:var(--rd);padding:14px 12px;cursor:pointer}
.st:hover{background:var(--cd2)}
.sn{font-family:var(--fd);font-size:24px;color:var(--ac);line-height:1;margin-bottom:2px}
.sl{font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px}
.lb{font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-bottom:7px;margin-top:4px}
.pr{display:flex;align-items:center;gap:11px;padding:11px 13px;background:var(--cd);border:1px solid var(--b);border-radius:var(--rs);margin-bottom:6px}
.pr:hover{background:var(--cd2)}
.pnn{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:var(--ag);color:var(--ac);border-radius:8px;font-family:var(--fd);font-size:13px}
.lf{background:linear-gradient(180deg,#15803d,#166534 50%,#14532d);border-radius:var(--rd);padding:16px 12px;margin-bottom:12px;position:relative;min-height:200px;overflow:hidden}
.lf::before{content:'';position:absolute;top:50%;left:10%;right:10%;height:1px;background:rgba(255,255,255,.15)}
.fr{display:flex;justify-content:space-evenly;margin-bottom:16px;position:relative;z-index:1}
.fp{display:flex;flex-direction:column;align-items:center;gap:3px}
.fc{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.9);color:#166534;font-family:var(--fd);font-size:12px;display:flex;align-items:center;justify-content:center}
.fn{font-size:9px;color:rgba(255,255,255,.85);font-weight:600;text-align:center;max-width:48px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lc{display:flex;flex-wrap:wrap;gap:6px}
.lch{padding:6px 11px;background:var(--bg);border:1.5px solid var(--b2);border-radius:20px;font-size:11px;font-family:var(--f);color:var(--t2);cursor:pointer}
.lch.s{background:var(--ag);border-color:var(--ac);color:var(--ac)}
.ib{background:var(--bg);border:1px solid var(--b2);border-radius:7px;padding:6px;color:var(--t3);cursor:pointer;display:flex;align-items:center}
.ib:hover{color:var(--t)}.ib.d:hover{color:var(--r);border-color:var(--r)}
.es{text-align:center;padding:30px 16px;color:var(--t3)}
.rv{display:flex;gap:5px;margin-top:8px}
.rvb{flex:1;display:flex;align-items:center;justify-content:center;gap:3px;padding:7px 4px;border-radius:var(--rs);font-size:10px;font-weight:600;font-family:var(--f);cursor:pointer;border:1.5px solid var(--b2);background:var(--bg)}
.rvb.y{color:var(--g)}.rvb.y.on{background:var(--gb);border-color:var(--g)}
.rvb.n{color:var(--r)}.rvb.n.on{background:var(--rb2);border-color:var(--r)}
.rvb.m{color:var(--y)}.rvb.m.on{background:var(--yb);border-color:var(--y)}
.rc{font-size:10px;color:var(--t3);margin-top:5px;display:flex;gap:10px}
.rd2{width:7px;height:7px;border-radius:50%;display:inline-block}
.cx{display:flex;align-items:center;gap:11px;padding:12px;background:var(--cd);border:1px solid var(--b);border-radius:var(--rs);margin-bottom:6px}
.ca{width:36px;height:36px;border-radius:50%;background:var(--ag);color:var(--ac);display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-size:12px;flex-shrink:0}
.cw{display:flex;flex-direction:column;height:100%}
.cmg{flex:1;overflow-y:auto;padding:10px 0}
.cbb{max-width:82%;margin-bottom:7px}.cbb.me{margin-left:auto}
.cin{padding:9px 12px;border-radius:14px;font-size:13px;line-height:1.4}
.cbb.ot .cin{background:var(--cd);border:1px solid var(--b);border-bottom-left-radius:4px}
.cbb.me .cin{background:var(--ag);border:1px solid rgba(34,211,238,.2);border-bottom-right-radius:4px;color:var(--ac)}
.cfr{font-size:10px;font-weight:600;color:var(--ac);margin-bottom:2px}
.cti{font-size:9px;color:var(--t3);margin-top:2px}
.cip{display:flex;gap:8px;padding:8px 0;border-top:1px solid var(--b);flex-shrink:0}
.cip input{flex:1;padding:10px 14px;background:var(--cd);border:1.5px solid var(--b2);border-radius:24px;color:var(--t);font-size:13px;font-family:var(--f);outline:none}
.cip input:focus{border-color:var(--ac)}
.csb{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--ac2),var(--ac));border:none;color:var(--bg);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.nw{background:var(--cd);border:1px solid var(--b);border-radius:var(--rd);padding:14px;margin-bottom:9px;position:relative}
.nw.imp{border-left:3px solid var(--o)}.nw.pnd{border-left:3px solid var(--y)}
.pc{background:var(--cd);border:1px solid var(--b);border-radius:var(--rd);padding:13px;margin-bottom:9px}
.pq{font-weight:700;font-size:13px;margin-bottom:8px}
.pbw{display:flex;align-items:center;gap:7px;margin-bottom:4px}
.pbl{font-size:11px;color:var(--t2);width:60px;flex-shrink:0}
.pbb{flex:1;height:22px;background:var(--bg);border-radius:5px;overflow:hidden}
.pbf{height:100%;border-radius:5px;display:flex;align-items:center;justify-content:flex-end;padding-right:6px;font-size:9px;font-weight:700;min-width:22px;transition:width .3s}
.pvb{padding:5px 10px;background:var(--bg);border:1.5px solid var(--b2);border-radius:18px;font-size:10px;font-family:var(--f);color:var(--t2);cursor:pointer;margin-right:4px;margin-top:4px}
.pvb:hover{border-color:var(--ac);color:var(--ac)}
.mo{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:flex-end;justify-content:center;z-index:250}
.ml{width:100%;max-width:500px;max-height:85vh;overflow-y:auto;background:var(--bg2);border-radius:var(--rd) var(--rd) 0 0;padding:20px 16px 28px}
.mlt{font-family:var(--fd);font-size:15px;text-transform:uppercase;margin-bottom:14px}
.mc3{float:right;background:none;border:none;color:var(--t3);cursor:pointer}
.fg{margin-bottom:11px}
.fl{display:block;font-size:10px;font-weight:600;color:var(--t2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.fi{width:100%;padding:10px 12px;background:var(--bg);border:1.5px solid var(--b2);border-radius:var(--rs);color:var(--t);font-size:13px;font-family:var(--f);outline:none}
.fi:focus{border-color:var(--ac)}.ft2{min-height:70px;resize:vertical}
.fs{width:100%;padding:12px;background:linear-gradient(135deg,var(--ac2),var(--ac));border:none;border-radius:var(--rs);color:var(--bg);font-family:var(--fd);font-size:13px;cursor:pointer;text-transform:uppercase;margin-top:6px}
.np{position:fixed;top:0;right:0;width:100%;max-width:400px;height:100vh;background:var(--bg2);z-index:300;overflow-y:auto}
.LS{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;background:linear-gradient(170deg,#0a1628,#0f172a 40%,#0c1a2e);overflow:hidden;position:relative}
.LS::before{content:'';position:absolute;top:-120px;right:-120px;width:350px;height:350px;background:radial-gradient(circle,rgba(34,211,238,.08),transparent 70%);border-radius:50%}
.LT{font-family:var(--fd);font-size:24px;text-transform:uppercase;margin-bottom:4px}
.LS2{font-size:13px;color:var(--t2);margin-bottom:6px}
.LC{width:100%;max-width:340px;background:var(--cd);border:1px solid var(--b2);border-radius:var(--rd);padding:28px 24px;position:relative;z-index:1}
.PD{display:flex;gap:14px;justify-content:center;margin:24px 0 20px}
.PD div{width:18px;height:18px;border-radius:50%;border:2px solid var(--b2);transition:all .2s}
.PD .f{background:var(--ac);border-color:var(--ac);box-shadow:0 0 12px rgba(34,211,238,.4)}.PD .e{background:var(--r);border-color:var(--r)}
.KP{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;max-width:260px;margin:0 auto}
.KP button{padding:18px;background:var(--bg2);border:1.5px solid var(--b2);border-radius:var(--rs);color:var(--t);font-size:22px;font-family:var(--fd);cursor:pointer;text-align:center;user-select:none}
.KP button:active{background:var(--ag);border-color:var(--ac);transform:scale(.95)}
.KP .x{visibility:hidden}.KP .bk{font-size:14px;font-family:var(--f);font-weight:600;color:var(--t2)}
.ts-screen{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;background:linear-gradient(170deg,#0a1628,#0f172a 40%,#0c1a2e);overflow:hidden;position:relative}
.ts-grid{display:flex;flex-direction:column;gap:10px;width:100%;max-width:360px}
.ts-btn{display:flex;align-items:center;gap:14px;padding:18px 20px;background:var(--cd);border:2px solid var(--b2);border-radius:var(--rd);cursor:pointer;transition:all .2s;width:100%;text-align:left;font-family:var(--f);color:var(--t)}
.ts-btn:hover{background:var(--cd2);border-color:var(--t3)}
.ts-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0}
.ts-name{font-weight:700;font-size:15px}
.ts-sub{font-size:11px;color:var(--t3);margin-top:2px}
`;

export default function App() {
  const [D,setD]=useState(null);const [ok,setOk]=useState(false);const [auth,setAuth]=useState(false);
  const [team,setTeam]=useState(null);const [pg,setPg]=useState("home");const [mod,setMod]=useState(null);
  const [selM,setSelM]=useState(null);const [pin,setPin]=useState("");const [pE,setPE]=useState(false);
  const [nO,setNO]=useState(false);const [me,setMe]=useState("");const [ci,setCi]=useState("");const ce=useRef(null);

  useEffect(()=>{LD().then(d=>{setD(d);setOk(true)})},[]);
  const save=useCallback(async nd=>{setD(nd);await SV(nd)},[]);
  useEffect(()=>{if(pg==="chat")ce.current?.scrollIntoView({behavior:'smooth'})},[D,pg]);

  if(!ok) return (<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0a0f1a',color:'#22d3ee'}}>Načítání...</div>);
  if(!D) return null;

  const hp=d=>{setPE(false);if(d==="back"){setPin(p=>p.slice(0,-1));return}const n=pin+d;setPin(n);if(n.length===4){const tPin=TEAMS.find(t=>t.id===team)?.pin;if(n===tPin){setAuth(true);setPin("")}else{setPE(true);setTimeout(()=>{setPin("");setPE(false)},600)}}};

  if(!team) return (
    <div><style>{S}</style><div className="ts-screen">
      <div style={{color:'var(--ac)',marginBottom:16,opacity:.85}}><Ic.Ball/></div>
      <div className="LT">TJ Dynamo Drnholec</div>
      <div style={{color:'var(--t2)',fontSize:13,marginBottom:30}}>Vyberte tým</div>
      <div className="ts-grid">
        {TEAMS.map(t=> (
          <button key={t.id} className="ts-btn" onClick={()=>{setTeam(t.id);setAuth(false);setPin("");setPg("home")}}>
            <div className="ts-dot" style={{background:t.color}}/>
            <div><div className="ts-name">{t.name}</div>
              <div className="ts-sub">{(D.teams[t.id]?.players||[]).length} hráčů · {(D.teams[t.id]?.matches||[]).filter(m=>!m.result).length} zápasů</div>
            </div>
          </button>
        ))}
      </div>
    </div></div>
  );

  if(!auth) return (
    <div><style>{S}</style><div className="LS">
      <div style={{color:TEAMS.find(t=>t.id===team)?.color||'var(--ac)',marginBottom:16,opacity:.85}}><Ic.Ball/></div>
      <div className="LT">{TEAMS.find(t=>t.id===team)?.name}</div>
      <div className="LS2">TJ Dynamo Drnholec</div>
      <div style={{color:'var(--t3)',fontSize:12,marginBottom:30}}>Zadejte PIN týmu</div>
      <div className="LC">
        <div className="PD">{[0,1,2,3].map(i=> <div key={i} className={i<pin.length?(pE?'e':'f'):''}/>)}</div>
        {pE&&<div style={{color:'var(--r)',fontSize:13,textAlign:'center',marginBottom:12,fontWeight:600}}>Špatný PIN</div>}
        <div className="KP">{["1","2","3","4","5","6","7","8","9","","0","back"].map((k,i)=>
          <button key={i} className={`${!k?"x":""} ${k==="back"?"bk":""}`} onClick={()=>k&&hp(k)}>{k==="back"?"⌫":k}</button>
        )}</div>
        <button style={{marginTop:20,background:'none',border:'none',color:'var(--t3)',fontSize:12,cursor:'pointer',fontFamily:'var(--f)',width:'100%',textAlign:'center'}} onClick={()=>{setTeam(null);setPin("")}}>← Zpět na výběr týmu</button>
      </div>
    </div></div>
  );

  const T={...emptyTeam(),...(D.teams[team]||{})};
  const tInfo=TEAMS.find(t=>t.id===team)||TEAMS[0];
  const saveT=nd=>{save({...D,teams:{...D.teams,[team]:nd}})};
  const bg=T.badges||{};
  const aB=s=>({...bg,[s]:(bg[s]||0)+1});
  const cB=s=>{if((bg[s]||0)>0)saveT({...T,badges:{...bg,[s]:0}})};
  const nt=(txt,s)=>({notifications:[...(T.notifications||[]),{id:"n_"+uid(),date:now(),text:txt,read:false}],badges:aB(s)});
  const fd=d=>{try{return new Date(d.includes?.('T')?d:d+"T00:00:00").toLocaleDateString('cs-CZ',{weekday:'short',day:'numeric',month:'short'})}catch{return d}};
  const ts=d=>{try{return new Date(d).toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'})}catch{return''}};
  const go=p=>{setPg(p);setSelM(null);cB(p)};

  const addM=m=>{const n=nt("Zápas: "+m.opponent,"matches");saveT({...T,...n,matches:[...T.matches,{...m,id:"m_"+uid(),result:null,lineup:[],rsvp:{}}]});setMod(null)};
  const addTr=t=>{const n=nt("Trénink: "+t.focus,"trainings");saveT({...T,...n,trainings:[...T.trainings,{...t,id:"t_"+uid(),rsvp:{}}]});setMod(null)};
  const addPl=p=>{const n=nt("Hráč: "+p.name,"players");saveT({...T,...n,players:[...T.players,{...p,id:"p_"+uid()}]});setMod(null)};
  const addCt=c=>{const n=nt("Kontakt: "+c.name,"contacts");saveT({...T,...n,contacts:[...T.contacts,{...c,id:"c_"+uid()}]});setMod(null)};
  const addNw=a=>{const n=nt("Aktualita: "+a.title,"news");saveT({...T,...n,news:[{...a,id:"nw_"+uid(),date:now(),pinned:false},...T.news]});setMod(null)};
  const sChat=(tx,f)=>{if(!tx.trim()||!f.trim())return;const n=nt(f+": "+tx.substring(0,30),"chat");saveT({...T,...n,chat:[...T.chat,{id:"ch_"+uid(),ts:now(),from:f,text:tx}]});setCi("")};
  const addAb=a=>{const n=nt("Omluvenka: "+a.playerName,"absences");saveT({...T,...n,absences:[...T.absences,{...a,id:"a_"+uid(),date:td(),status:"pending"}]});setMod(null)};
  const addPo=p=>{const n=nt("Anketa: "+p.question,"polls");saveT({...T,...n,polls:[{...p,id:"po_"+uid(),date:td(),active:true},...T.polls]});setMod(null)};
  const del=(k,i)=>saveT({...T,[k]:T[k].filter(x=>x.id!==i)});
  const sLU=(mi,pi)=>saveT({...T,matches:T.matches.map(m=>m.id===mi?{...m,lineup:pi}:m)});
  const sR=(mi,r)=>saveT({...T,matches:T.matches.map(m=>m.id===mi?{...m,result:r}:m)});
  const sRv=(ty,ei,nm,v)=>{const k=ty==="match"?"matches":"trainings";saveT({...T,[k]:T[k].map(e=>e.id===ei?{...e,rsvp:{...e.rsvp,[nm]:v}}:e)})};
  const vP=(pi,ix)=>saveT({...T,polls:T.polls.map(p=>p.id===pi?{...p,options:p.options.map((o,i)=>i===ix?{...o,votes:o.votes+1}:o)}:p)});
  const tPN=i=>saveT({...T,news:T.news.map(a=>a.id===i?{...a,pinned:!a.pinned}:a)});
  const apA=i=>saveT({...T,absences:T.absences.map(a=>a.id===i?{...a,status:"approved"}:a)});
  const mAR=()=>saveT({...T,notifications:(T.notifications||[]).map(n=>({...n,read:true}))});
  const uN=(T.notifications||[]).filter(n=>!n.read).length;
  const nxM=(T.matches||[]).filter(m=>!m.result).sort((a,b)=>a.date.localeCompare(b.date))[0];
  const nxT=(T.trainings||[]).sort((a,b)=>a.date.localeCompare(b.date))[0];

  const RB=({ty,ev})=>{const r=ev.rsvp||{};const yc=Object.values(r).filter(v=>v==="yes").length;const nc=Object.values(r).filter(v=>v==="no").length;const mc=Object.values(r).filter(v=>v==="maybe").length;const mv=me?r[me]:null;
    return (<div><div className="rc"><span><span className="rd2" style={{background:'var(--g)'}}/>{yc}</span><span><span className="rd2" style={{background:'var(--r)'}}/>{nc}</span><span><span className="rd2" style={{background:'var(--y)'}}/>{mc}</span></div>
    {me? <div className="rv">{["yes","no","maybe"].map(v=> <button key={v} className={`rvb ${v==="yes"?"y":v==="no"?"n":"m"} ${mv===v?"on":""}`} onClick={e=>{e.stopPropagation();sRv(ty,ev.id,me,v)}}>{v==="yes"?<><Ic.Up/> Ano</>:v==="no"?<><Ic.Dn/> Ne</>:<><Ic.Q/> ?</>}</button>)}</div>
    : <div style={{marginTop:6,display:'flex',gap:5}}><input className="fi" placeholder="Vaše jméno" id={`rv-${ev.id}`} style={{flex:1,fontSize:11,padding:7}}/><button className="ba" style={{fontSize:10}} onClick={e=>{e.stopPropagation();const v=document.getElementById(`rv-${ev.id}`).value;if(v)setMe(v)}}>OK</button></div>}
    </div>)};

  const nav=[{k:"home",l:"Domů",i: <Ic.Home/>},{k:"news",l:"Aktuality",i: <Ic.News/>},{k:"chat",l:"Chat",i: <Ic.Chat/>},{k:"matches",l:"Zápasy",i: <Ic.Cup/>,dv:true},{k:"trainings",l:"Tréninky",i: <Ic.Cal/>},{k:"players",l:"Hráči",i: <Ic.Ppl/>},{k:"contacts",l:"Adresář",i: <Ic.Book/>,dv:true},{k:"absences",l:"Omluvy",i: <Ic.XC/>},{k:"polls",l:"Ankety",i: <Ic.Chart/>,dv:true},{k:"photos",l:"Fotky",i: <Ic.Cam/>}];

  const pgHome=()=>(<div><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><div className="ts-dot" style={{background:tInfo.color,width:10,height:10}}/><div><div style={{fontFamily:'var(--fd)',fontSize:16,textTransform:'uppercase'}}>{tInfo.name}</div><div style={{fontSize:10,color:'var(--t3)'}}>TJ Dynamo Drnholec</div></div></div>
    <div className="sg"><div className="st" onClick={()=>go("players")}><div className="sn">{T.players.length}</div><div className="sl">Hráčů</div></div><div className="st" onClick={()=>go("matches")}><div className="sn">{T.matches.filter(m=>!m.result).length}</div><div className="sl">Zápasů</div></div><div className="st" onClick={()=>go("trainings")}><div className="sn">{T.trainings.length}</div><div className="sl">Tréninků</div></div><div className="st" onClick={()=>go("contacts")}><div className="sn">{T.contacts.length}</div><div className="sl">Kontaktů</div></div></div>
    {nxM&&(<><div className="lb">Příští zápas</div><div className="c2" onClick={()=>{go("matches");setTimeout(()=>setSelM(nxM),50)}}><div className="cr"><div><div className="ctt">vs {nxM.opponent}</div><div className="css">{fd(nxM.date)} · {nxM.time}</div></div><span className={`tg ${nxM.location==="Domácí"?"th":"ta"}`}>{nxM.location==="Domácí"?"Doma":"Venku"}</span></div><RB ty="match" ev={nxM}/></div></>)}
    {nxT&&(<><div className="lb" style={{marginTop:8}}>Příští trénink</div><div className="c2" onClick={()=>go("trainings")}><div className="ctt">{nxT.focus}</div><div className="css">{fd(nxT.date)} · {nxT.time}</div><RB ty="training" ev={nxT}/></div></>)}
  </div>);

  const pgMatches=()=>{if(selM){const m=selM; return (<div>
    <button style={{display:'flex',alignItems:'center',gap:5,marginBottom:12,color:'var(--ac)',fontSize:12,fontWeight:600,fontFamily:'var(--f)',background:'none',border:'none',cursor:'pointer'}} onClick={()=>setSelM(null)}><Ic.Bk/> Zpět</button>
    <div className="pt" style={{marginBottom:8}}>vs {m.opponent}</div><div style={{color:'var(--t2)',fontSize:12,marginBottom:12}}>{fd(m.date)} · {m.time} · {m.location}</div>
    {!m.result&&<div style={{marginBottom:12,display:'flex',gap:6}}><input className="fi" placeholder="3:1" id="ri" style={{flex:1}}/><button className="ba" onClick={()=>{const v=document.getElementById('ri').value;if(v){sR(m.id,v);setSelM({...m,result:v})}}}>Uložit</button></div>}
    {m.result&&<div style={{background:'var(--ag)',borderRadius:'var(--rd)',padding:12,marginBottom:12,textAlign:'center'}}><div style={{fontSize:10,color:'var(--t3)',textTransform:'uppercase'}}>Výsledek</div><div style={{fontFamily:'var(--fd)',fontSize:28,color:'var(--ac)'}}>{m.result}</div></div>}
    <div className="lb">Účast</div><RB ty="match" ev={m}/>
    <div className="lb" style={{marginTop:12}}>Sestava</div>
    <div className="lc" style={{marginBottom:12}}>{T.players.map(p=> <button key={p.id} className={`lch ${(m.lineup||[]).includes(p.id)?'s':''}`} onClick={()=>{const nl=(m.lineup||[]).includes(p.id)?(m.lineup||[]).filter(x=>x!==p.id):[...(m.lineup||[]),p.id];sLU(m.id,nl);setSelM({...m,lineup:nl})}}>{p.number} {p.name.split(' ')[0]}</button>)}</div>
    {(m.lineup||[]).length>0&&<div className="lf">{(()=>{const lp=T.players.filter(p=>(m.lineup||[]).includes(p.id));const R=({a})=>a.length>0? <div className="fr">{a.map(p=> <div className="fp" key={p.id}><div className="fc">{p.number}</div><div className="fn">{p.name.split(' ')[0]}</div></div>)}</div>:null; return (<><R a={lp.filter(p=>p.position==="Útočník")}/><R a={lp.filter(p=>p.position==="Záložník")}/><R a={lp.filter(p=>p.position==="Obránce")}/><R a={lp.filter(p=>p.position==="Brankář")}/></>)})()}</div>}
  </div>)} return (<div><div className="ph"><div className="pt">Zápasy</div><button className="ba" onClick={()=>setMod("aM")}><Ic.Plus/> Přidat</button></div>
    {T.matches.filter(m=>!m.result).sort((a,b)=>a.date.localeCompare(b.date)).map(m=> <div className="c2" key={m.id} onClick={()=>setSelM(m)}><div className="cr"><div><div className="ctt">vs {m.opponent}</div><div className="css">{fd(m.date)} · {m.time}</div></div><div style={{display:'flex',gap:5}}><span className={`tg ${m.location==="Domácí"?"th":"ta"}`}>{m.location==="Domácí"?"Doma":"Venku"}</span><button className="ib d" onClick={e=>{e.stopPropagation();del("matches",m.id)}}><Ic.Del/></button></div></div><RB ty="match" ev={m}/></div>)}
    {T.matches.filter(m=>m.result).length>0&&<div className="lb" style={{marginTop:12}}>Odehrané</div>}
    {T.matches.filter(m=>m.result).map(m=> <div className="c2" key={m.id} onClick={()=>setSelM(m)}><div className="cr"><div><div className="ctt">vs {m.opponent}</div><div className="css">{fd(m.date)} · {m.result}</div></div><span className="tg th">{m.type}</span></div></div>)}</div>)};

  const pgTr=()=>(<div><div className="ph"><div className="pt">Tréninky</div><button className="ba" onClick={()=>setMod("aT")}><Ic.Plus/></button></div>
    {T.trainings.sort((a,b)=>a.date.localeCompare(b.date)).map(t=> <div className="c2" key={t.id}><div className="cr"><div><div className="ctt">{t.focus}</div><div className="css">{fd(t.date)} · {t.time} · {t.duration}</div></div><button className="ib d" onClick={()=>del("trainings",t.id)}><Ic.Del/></button></div><RB ty="training" ev={t}/></div>)}</div>);
  const pgPl=()=>(<div><div className="ph"><div className="pt">Hráči</div><button className="ba" onClick={()=>setMod("aP")}><Ic.Plus/></button></div>
    {T.players.sort((a,b)=>a.number-b.number).map(p=> <div className="pr" key={p.id}><div className="pnn">{p.number}</div><div style={{flex:1}}><div style={{fontWeight:600,fontSize:12}}>{p.name}</div><div style={{fontSize:10,color:'var(--t3)'}}>{p.position} · {p.birthYear}</div></div><button className="ib d" onClick={()=>del("players",p.id)}><Ic.Del/></button></div>)}</div>);
  const pgCt=()=>(<div><div className="ph"><div className="pt">Adresář</div><button className="ba" onClick={()=>setMod("aCt")}><Ic.Plus/></button></div>
    {T.contacts.length===0&&<div className="es"><p>Žádné kontakty</p></div>}
    {T.contacts.map(c=> <div className="cx" key={c.id}><div className="ca">{c.name.split(' ').map(w=>w[0]).join('').substring(0,2)}</div><div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:12}}>{c.name}</div>{c.relation&&<div style={{fontSize:10,color:'var(--ac)'}}>{c.relation}</div>}<div style={{fontSize:10,color:'var(--t3)',marginTop:2}}>{c.phone&&<a href={`tel:${c.phone}`} style={{color:'var(--ac)',textDecoration:'none'}}>{c.phone}</a>} {c.email}</div></div><button className="ib d" onClick={()=>del("contacts",c.id)}><Ic.Del/></button></div>)}</div>);
  const pgNw=()=>(<div><div className="ph"><div className="pt">Aktuality</div><button className="ba" onClick={()=>setMod("aNw")}><Ic.Plus/> Nová</button></div>
    {T.news.length===0&&<div className="es"><p>Žádné aktuality</p></div>}
    {T.news.map(a=> <div className={`nw ${a.important?"imp":""} ${a.pinned?"pnd":""}`} key={a.id}><div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{a.title}</div><div style={{fontSize:10,color:'var(--ac)',marginBottom:3}}>{a.from}</div><div style={{fontSize:12,color:'var(--t2)',lineHeight:1.5}}>{a.text}</div><div style={{fontSize:10,color:'var(--t3)',marginTop:6,display:'flex',justifyContent:'space-between'}}><span>{fd(a.date)}</span><div style={{display:'flex',gap:4}}><button className="ib" onClick={()=>tPN(a.id)} style={{padding:3}}><Ic.Pin/></button><button className="ib d" onClick={()=>del("news",a.id)} style={{padding:3}}><Ic.Del/></button></div></div></div>)}</div>);
  const pgChat=()=>(<div className="cw"><div className="ph"><div className="pt">Chat</div></div>
    {!me? <div style={{padding:20,textAlign:'center'}}><div style={{color:'var(--t2)',fontSize:13,marginBottom:10}}>Zadejte jméno</div><div style={{display:'flex',gap:8,maxWidth:260,margin:'0 auto'}}><input className="fi" placeholder="Jméno" id="cn"/><button className="ba" onClick={()=>{const v=document.getElementById('cn').value;if(v)setMe(v)}}>OK</button></div></div>
    :<><div className="cmg">{T.chat.map(m=> <div className={`cbb ${m.from===me?'me':'ot'}`} key={m.id}><div className="cin"><div className="cfr">{m.from}</div>{m.text}<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:3}}><span className="cti">{ts(m.ts)}</span><button onClick={()=>del("chat",m.id)} style={{background:'none',border:'none',color:'var(--t3)',cursor:'pointer',padding:2,opacity:.5,fontSize:10}}>smazat</button></div></div></div>)}<div ref={ce}/></div>
    <div className="cip"><input value={ci} onChange={e=>setCi(e.target.value)} placeholder="Zpráva..." onKeyDown={e=>{if(e.key==='Enter')sChat(ci,me)}}/><button className="csb" onClick={()=>sChat(ci,me)}><Ic.Send/></button></div></>}</div>);
  const pgAbs=()=>(<div><div className="ph"><div className="pt">Omluvenky</div><button className="ba" onClick={()=>setMod("aAb")}><Ic.Plus/></button></div>
    {T.absences.length===0&&<div className="es"><p>Žádné omluvenky</p></div>}
    {T.absences.map(a=> <div className="pr" key={a.id}><div style={{width:10,height:10,borderRadius:'50%',background:a.status==="pending"?'var(--y)':'var(--g)'}}/><div style={{flex:1}}><div style={{fontWeight:600,fontSize:12}}>{a.playerName}</div><div style={{fontSize:10,color:'var(--t3)'}}>{a.reason} · {fd(a.eventDate)}</div></div>{a.status==="pending"&&<button className="ib" onClick={()=>apA(a.id)} style={{color:'var(--g)'}}><Ic.Chk/></button>}<button className="ib d" onClick={()=>del("absences",a.id)} style={{marginLeft:2}}><Ic.Del/></button><span className="tg" style={{background:a.status==='pending'?'var(--yb)':'var(--gb)',color:a.status==='pending'?'var(--y)':'var(--g)'}}>{a.status==="pending"?"Čeká":"OK"}</span></div>)}</div>);
  const pgPo=()=>(<div><div className="ph"><div className="pt">Ankety</div><button className="ba" onClick={()=>setMod("aPo")}><Ic.Plus/></button></div>
    {T.polls.length===0&&<div className="es"><p>Žádné ankety</p></div>}
    {T.polls.map(p=>{const tot=p.options.reduce((s,o)=>s+o.votes,0)||1;const cl=['var(--ac)','var(--g)','var(--y)','var(--o)','var(--p)'];
    return (<div className="pc" key={p.id}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}><div className="pq" style={{marginBottom:0}}>{p.question}</div><button className="ib d" onClick={()=>del("polls",p.id)} style={{flexShrink:0}}><Ic.Del/></button></div>{p.options.map((o,i)=> <div key={i}><div className="pbw"><div className="pbl">{o.text}</div><div className="pbb"><div className="pbf" style={{width:Math.round(o.votes/tot*100)+"%",background:cl[i%5],color:'var(--bg)'}}>{o.votes}</div></div></div></div>)}<div style={{marginTop:5}}>{p.options.map((o,i)=> <button key={i} className="pvb" onClick={()=>vP(p.id,i)}>+ {o.text}</button>)}</div></div>)})}</div>);
  const pgPh=()=>(<div><div className="ph"><div className="pt">Fotky</div><button className="ba" onClick={()=>setMod("aPh")}><Ic.Plus/></button></div>
    {T.photos.length===0? <div className="es"><p>Žádné fotky</p></div>:
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:3,borderRadius:'var(--rd)',overflow:'hidden'}}>{T.photos.map((p,i)=> <div key={i} style={{aspectRatio:1,background:'var(--bg3)',overflow:'hidden',position:'relative'}}>{p.url&&<img src={p.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>}<button className="ib d" onClick={()=>del("photos",p.id||("ph_"+i))} style={{position:'absolute',top:4,right:4,padding:3,background:'rgba(0,0,0,.6)',borderColor:'transparent'}}><Ic.Del/></button></div>)}</div>}</div>);

  const FM=({title,ch,onS})=>(<div className="mo" onClick={()=>setMod(null)}><div className="ml" onClick={e=>e.stopPropagation()}><button className="mc3" onClick={()=>setMod(null)}><Ic.XC/></button><div className="mlt">{title}</div><form onSubmit={e=>{e.preventDefault();onS(new FormData(e.target))}}>{ch}</form></div></div>);
  const F=(n,l,t="text",p="",r=true)=> <div className="fg"><label className="fl">{l}</label>{t==="textarea"? <textarea name={n} className="fi ft2" required={r} placeholder={p}/>: <input name={n} type={t} className="fi" required={r} placeholder={p}/>}</div>;

  const modals=()=>{if(!mod) return null;
    if(mod==="aM") return (<FM title="Nový zápas" onS={f=>addM({date:f.get('d'),time:f.get('t'),opponent:f.get('o'),location:f.get('l'),type:f.get('tp')})} ch={<>{F("o","Soupeř")}{F("d","Datum","date")}{F("t","Čas","time")}{F("l","Místo","text","Domácí/Venku")}<div className="fg"><label className="fl">Typ</label><select name="tp" className="fi"><option>Liga</option><option>Pohár</option><option>Přátelský</option></select></div><button type="submit" className="fs">Přidat</button></>}/>);
    if(mod==="aT") return (<FM title="Nový trénink" onS={f=>addTr({date:f.get('d'),time:f.get('t'),duration:f.get('dr'),location:f.get('l'),focus:f.get('f'),notes:f.get('n')})} ch={<>{F("f","Zaměření")}{F("d","Datum","date")}{F("t","Čas","time")}{F("dr","Délka","text","90 min")}{F("l","Místo")}{F("n","Poznámky","textarea","",false)}<button type="submit" className="fs">Přidat</button></>}/>);
    if(mod==="aP") return (<FM title="Nový hráč" onS={f=>addPl({name:f.get('nm'),number:parseInt(f.get('nu')),position:f.get('po'),birthYear:parseInt(f.get('yr'))})} ch={<>{F("nm","Jméno")}{F("nu","Číslo","number")}<div className="fg"><label className="fl">Pozice</label><select name="po" className="fi"><option>Brankář</option><option>Obránce</option><option>Záložník</option><option>Útočník</option></select></div>{F("yr","Rok nar.","number","2015")}<button type="submit" className="fs">Přidat</button></>}/>);
    if(mod==="aCt") return (<FM title="Nový kontakt" onS={f=>addCt({name:f.get('nm'),relation:f.get('rl'),phone:f.get('ph'),email:f.get('em')})} ch={<>{F("nm","Jméno")}{F("rl","Vztah","text","Otec–Jakub",false)}{F("ph","Telefon","tel","+420...",false)}{F("em","E-mail","email","",false)}<button type="submit" className="fs">Přidat</button></>}/>);
    if(mod==="aNw") return (<FM title="Nová aktualita" onS={f=>addNw({from:f.get('fr'),title:f.get('ti'),text:f.get('tx'),important:f.get('im')==="on"})} ch={<>{F("fr","Autor")}{F("ti","Nadpis")}{F("tx","Text","textarea")}<div className="fg" style={{display:'flex',alignItems:'center',gap:8}}><input type="checkbox" name="im" id="ic"/><label htmlFor="ic" style={{fontSize:12,color:'var(--t2)'}}>Důležité</label></div><button type="submit" className="fs">Publikovat</button></>}/>);
    if(mod==="aAb") return (<FM title="Omluvit hráče" onS={f=>addAb({playerName:f.get('pl'),reason:f.get('rs'),eventDate:f.get('dt'),from:f.get('fr')})} ch={<>{F("fr","Vaše jméno")}<div className="fg"><label className="fl">Hráč</label><select name="pl" className="fi">{T.players.map(p=> <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>{F("dt","Datum","date")}<div className="fg"><label className="fl">Důvod</label><select name="rs" className="fi"><option>Nemoc</option><option>Zranění</option><option>Rodina</option><option>Škola</option></select></div><button type="submit" className="fs">Odeslat</button></>}/>);
    if(mod==="aPo") return (<FM title="Nová anketa" onS={f=>{const opts=f.get('op').split('\n').filter(x=>x.trim()).map(t=>({text:t.trim(),votes:0}));if(opts.length>=2)addPo({question:f.get('q'),options:opts})}} ch={<>{F("q","Otázka")}{F("op","Možnosti","textarea","Modrá\nČervená")}<button type="submit" className="fs">Vytvořit</button></>}/>);
    if(mod==="aPh") return (<div className="mo" onClick={()=>setMod(null)}><div className="ml" onClick={e=>e.stopPropagation()}><button className="mc3" onClick={()=>setMod(null)}><Ic.XC/></button><div className="mlt">Přidat fotku</div>
      <div className="fg"><label className="fl">Vyberte fotku</label><input type="file" accept="image/*" id="ph-file" style={{width:'100%',padding:10,background:'var(--bg)',border:'1.5px solid var(--b2)',borderRadius:'var(--rs)',color:'var(--t)',fontSize:13,fontFamily:'var(--f)'}}/></div>
      <div className="fg"><label className="fl">Popis (nepovinný)</label><input type="text" id="ph-cap" className="fi" placeholder="Popis fotky"/></div>
      <button className="fs" onClick={()=>{const f=document.getElementById('ph-file').files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{const n=nt("Nová fotka","photos");saveT({...T,...n,photos:[...T.photos,{id:"ph_"+uid(),url:ev.target.result,caption:document.getElementById('ph-cap').value||"",date:td()}]});setMod(null)};r.readAsDataURL(f)}}>Nahrát fotku</button>
    </div></div>);
    return null};

  const pages={home:pgHome,matches:pgMatches,trainings:pgTr,players:pgPl,contacts:pgCt,news:pgNw,chat:pgChat,absences:pgAbs,polls:pgPo,photos:pgPh};

  return (
    <div><style>{S}</style>
      <div className="shell">
        <div className="rail">
          <div style={{color:tInfo.color,padding:'6px 0 4px',opacity:.9,flexShrink:0}}><Ic.Ball/></div>
          <div className="rdv"/>
          {nav.map(n=>(<div key={n.k}>{n.dv&&<div className="rdv"/>}<button className={`ri ${pg===n.k?'a':''}`} onClick={()=>go(n.k)}>{n.i}<span>{n.l}</span>{(bg[n.k]||0)>0&&<span className="bd">{bg[n.k]}</span>}</button></div>))}
          <div className="rft">
            <button onClick={()=>{setTeam(null);setAuth(false);setPg("home");setSelM(null)}} title="Změnit tým"><Ic.Grid/></button>
            <button onClick={()=>{setAuth(false);setPg("home");setSelM(null)}} title="Odhlásit"><Ic.Out/></button>
          </div>
        </div>
        <div className="cnt">
          <div className="top"><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:8,height:8,borderRadius:'50%',background:tInfo.color}}/><div style={{fontFamily:'var(--fd)',fontSize:13,textTransform:'uppercase'}}>{tInfo.name}</div></div><button className="hb" onClick={()=>{setNO(true);mAR()}}><Ic.Bell/>{uN>0&&<span className="dot"/>}</button></div>
          <div className="ms">{pages[pg]?pages[pg]():pgHome()}</div>
        </div>
      </div>
      {modals()}
      {nO&&<div className="np"><div style={{padding:14,borderBottom:'1px solid var(--b)',display:'flex',justifyContent:'space-between'}}><div style={{fontFamily:'var(--fd)',fontSize:14,textTransform:'uppercase'}}>Oznámení</div><button className="hb" onClick={()=>setNO(false)}><Ic.X/></button></div>
        {(T.notifications||[]).length===0&&<div className="es" style={{marginTop:30}}><p>Žádná oznámení</p></div>}
        {[...(T.notifications||[])].reverse().map(n=> <div style={{padding:'12px 14px',borderBottom:'1px solid var(--b)',display:'flex',gap:9,background:!n.read?'rgba(34,211,238,.03)':'transparent'}} key={n.id}><div style={{width:8,height:8,borderRadius:'50%',background:n.read?'var(--b2)':'var(--ac)',marginTop:5,flexShrink:0}}/><div><div style={{fontSize:12,color:'var(--t2)'}}>{n.text}</div><div style={{fontSize:10,color:'var(--t3)',marginTop:2}}>{fd(n.date)}</div></div></div>)}
      </div>}
    </div>
  );
}
