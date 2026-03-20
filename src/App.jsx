import { useState, useEffect, useCallback, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBdsLOcn3E18rWS-KiiPi1J3P5jahfA3Xk",
  authDomain: "dynamo-drnholec.firebaseapp.com",
  projectId: "dynamo-drnholec",
  storageBucket: "dynamo-drnholec.firebasestorage.app",
  messagingSenderId: "442943905801",
  appId: "1:442943905801:web:401141c8cd64a7efa718d8"
};
const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);
const SK="dynamo-v2",now=()=>new Date().toISOString(),td=()=>now().split('T')[0],uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const TEAMS=[{id:"a-tym",name:"A-Tým",color:"#0e7490",pin:"1166"},{id:"starsi-zaci",name:"Starší žáci",color:"#7c3aed",pin:"2266"},{id:"mladsi-zaci",name:"Mladší žáci",color:"#ea580c",pin:"3366"},{id:"starsi-pripravka",name:"Starší přípravka",color:"#ca8a04",pin:"4466"},{id:"mladsi-pripravka",name:"Mladší přípravka",color:"#16a34a",pin:"5566"},{id:"vybor",name:"Výbor",color:"#dc2626",pin:"9966"}];
const emptyTeam=()=>({badges:{},notifications:[],players:[],contacts:[],coaches:[],matches:[],trainings:[],news:[],chat:[],absences:[],polls:[],photos:[],meetings:[]});
const DEF={teams:{}};
TEAMS.forEach(t=>{DEF.teams[t.id]=emptyTeam()});
DEF.teams["a-tym"].players=[{id:"p1",name:"Jan Novák",number:7,position:"Útočník",birthYear:2000},{id:"p2",name:"Petr Dvořák",number:3,position:"Obránce",birthYear:1999},{id:"p3",name:"Martin Svoboda",number:10,position:"Záložník",birthYear:2001},{id:"p4",name:"Tomáš Černý",number:1,position:"Brankář",birthYear:1998}];
DEF.teams["a-tym"].matches=[{id:"m1",date:"2026-03-22",time:"15:00",opponent:"SK Mikulov",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{}}];
DEF.teams["a-tym"].news=[{id:"nw1",date:"2026-03-18T10:30:00",from:"Trenér",title:"Víkendový zápas",text:"Sraz v 14:00 u hřiště.",pinned:true,important:true}];
DEF.teams["mladsi-pripravka"].players=[{id:"p1",name:"Jakub Malý",number:7,position:"Útočník",birthYear:2017},{id:"p2",name:"Filip Veselý",number:3,position:"Obránce",birthYear:2017}];
DEF.teams["vybor"].contacts=[{id:"c1",name:"Karel Předseda",relation:"Předseda",phone:"+420 777 111 000",email:"karel@dynamo.cz"},{id:"c2",name:"Jana Pokladní",relation:"Pokladní",phone:"+420 608 222 000",email:"jana@dynamo.cz"}];
const Ic={Home:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,Cal:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,Ppl:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,Cup:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M18 2H6v7a6 6 0 0012 0V2z"/></svg>,Cam:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,Chat:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,XC:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,X:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,Plus:()=><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,Bk:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,Chk:()=><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,Del:()=><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,Pin:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>,Out:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,Bell:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,Book:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,Chart:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,Send:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,News:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>,Ball:()=><svg width="28" height="28" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#0e7490" strokeWidth="4"/><polygon points="50,22 61,34 57,48 43,48 39,34" fill="#0e7490"/><polygon points="28,56 25,42 36,34 44,44 38,56" fill="#0e7490"/><polygon points="72,56 75,42 64,34 56,44 62,56" fill="#0e7490"/><polygon points="36,72 42,60 58,60 64,72 50,80" fill="#0e7490"/></svg>,Grid:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,Meet:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,Doc:()=><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>};
const LD=async()=>{return DEF};
const SV=async d=>{try{await setDoc(doc(db,"app","data"),d)}catch(e){console.error("Save error:",e)}};
const S=`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;500;700&family=Archivo+Black&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#daf0f7;--bg2:#c5e8f2;--bg3:#b0dcea;--cd:#ffffff;--cd2:#eef8fc;--ac:#1a8aab;--ac2:#15728e;--ag:rgba(26,138,171,.12);--g:#16a34a;--gb:rgba(22,163,74,.1);--r:#dc2626;--rb2:rgba(220,38,38,.1);--y:#ca8a04;--yb:rgba(202,138,4,.1);--o:#ea580c;--p:#7c3aed;--t:#0f2b3d;--t2:#3b6b82;--t3:#6a9bb2;--b:#b0dcea;--b2:#8ecadb;--rd:14px;--rs:10px;--f:'DM Sans',sans-serif;--fd:'Archivo Black',sans-serif}
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
.ba{display:flex;align-items:center;gap:5px;background:var(--ag);color:var(--ac);border:1.5px solid rgba(26,138,171,.3);border-radius:var(--rs);padding:7px 11px;font-size:11px;font-weight:600;font-family:var(--f);cursor:pointer}
.c2{background:var(--cd);border:1px solid var(--b);border-radius:var(--rd);padding:13px;margin-bottom:9px;cursor:pointer;transition:background .15s}
.c2:hover{background:var(--cd2)}
.cr{display:flex;align-items:center;justify-content:space-between}
.ctt{font-weight:700;font-size:13px;margin-bottom:2px}.css2{font-size:11px;color:var(--t2)}
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
.cx{display:flex;align-items:center;gap:11px;padding:12px;background:var(--cd);border:1px solid var(--b);border-radius:var(--rs);margin-bottom:6px}
.ca{width:36px;height:36px;border-radius:50%;background:var(--ag);color:var(--ac);display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-size:12px;flex-shrink:0}
.cw{display:flex;flex-direction:column;height:100%}
.cmg{flex:1;overflow-y:auto;padding:10px 0}
.cbb{max-width:82%;margin-bottom:7px}.cbb.me{margin-left:auto}
.cin{padding:9px 12px;border-radius:14px;font-size:13px;line-height:1.4}
.cbb.ot .cin{background:var(--cd);border:1px solid var(--b);border-bottom-left-radius:4px}
.cbb.me .cin{background:var(--ac);border:1px solid var(--ac2);border-bottom-right-radius:4px;color:#fff}
.cfr{font-size:10px;font-weight:600;color:var(--ac);margin-bottom:2px}
.cbb.me .cfr{color:rgba(255,255,255,.7)}
.cti{font-size:9px;color:var(--t3);margin-top:2px}
.cip{display:flex;gap:8px;padding:8px 0;border-top:1px solid var(--b);flex-shrink:0}
.cip input{flex:1;padding:10px 14px;background:var(--cd);border:1.5px solid var(--b2);border-radius:24px;color:var(--t);font-size:13px;font-family:var(--f);outline:none}
.cip input:focus{border-color:var(--ac)}
.csb{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--ac2),var(--ac));border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
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
.mo{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:flex-end;justify-content:center;z-index:250}
.ml{width:100%;max-width:500px;max-height:85vh;overflow-y:auto;background:var(--cd);border-radius:var(--rd) var(--rd) 0 0;padding:20px 16px 28px}
.mlt{font-family:var(--fd);font-size:15px;text-transform:uppercase;margin-bottom:14px}
.mc3{float:right;background:none;border:none;color:var(--t3);cursor:pointer}
.fg{margin-bottom:11px}
.fl{display:block;font-size:10px;font-weight:600;color:var(--t2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.fi{width:100%;padding:10px 12px;background:var(--bg);border:1.5px solid var(--b2);border-radius:var(--rs);color:var(--t);font-size:13px;font-family:var(--f);outline:none}
.fi:focus{border-color:var(--ac)}.ft2{min-height:70px;resize:vertical}
.fs{width:100%;padding:12px;background:linear-gradient(135deg,var(--ac2),var(--ac));border:none;border-radius:var(--rs);color:#fff;font-family:var(--fd);font-size:13px;cursor:pointer;text-transform:uppercase;margin-top:6px}
.np{position:fixed;top:0;right:0;width:100%;max-width:400px;height:100vh;background:var(--cd);z-index:300;overflow-y:auto;box-shadow:-4px 0 20px rgba(0,0,0,.1)}
.LS{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;background:linear-gradient(170deg,#c5e8f2,#daf0f7 40%,#b0dcea);overflow:hidden;position:relative}
.LS::before{content:'';position:absolute;top:-120px;right:-120px;width:350px;height:350px;background:radial-gradient(circle,rgba(26,138,171,.1),transparent 70%);border-radius:50%}
.LT{font-family:var(--fd);font-size:24px;text-transform:uppercase;margin-bottom:4px}
.LS2{font-size:13px;color:var(--t2);margin-bottom:6px}
.LC{width:100%;max-width:340px;background:var(--cd);border:1px solid var(--b2);border-radius:var(--rd);padding:28px 24px;position:relative;z-index:1}
.PD{display:flex;gap:14px;justify-content:center;margin:24px 0 20px}
.PD div{width:18px;height:18px;border-radius:50%;border:2px solid var(--b2);transition:all .2s}
.PD .f{background:var(--ac);border-color:var(--ac);box-shadow:0 0 12px rgba(26,138,171,.3)}.PD .e{background:var(--r);border-color:var(--r)}
.KP{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;max-width:260px;margin:0 auto}
.KP button{padding:18px;background:var(--cd);border:1.5px solid var(--b2);border-radius:var(--rs);color:var(--t);font-size:22px;font-family:var(--fd);cursor:pointer;text-align:center;user-select:none}
.KP button:active{background:var(--ag);border-color:var(--ac);transform:scale(.95)}
.KP .x{visibility:hidden}.KP .bk{font-size:14px;font-family:var(--f);font-weight:600;color:var(--t2)}
.ts-screen{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;background:linear-gradient(170deg,#c5e8f2,#daf0f7 40%,#b0dcea);overflow:hidden;position:relative}
.ts-grid{display:flex;flex-direction:column;gap:10px;width:100%;max-width:360px}
.ts-btn{display:flex;align-items:center;gap:14px;padding:18px 20px;background:var(--cd);border:2px solid var(--b2);border-radius:var(--rd);cursor:pointer;transition:all .2s;width:100%;text-align:left;font-family:var(--f);color:var(--t)}
.ts-btn:hover{background:var(--cd2);border-color:var(--t3)}
.ts-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0}
.ts-name{font-weight:700;font-size:15px}
.ts-sub{font-size:11px;color:var(--t3);margin-top:2px}
.att{margin-top:10px;padding:10px;background:var(--bg);border-radius:var(--rs)}
.att-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--b)}
.att-row:last-child{border-bottom:none}
.att-cb{width:20px;height:20px;accent-color:var(--ac);cursor:pointer}
.att-name{font-size:12px;font-weight:500;flex:1}
.doc-list{margin-top:8px;display:flex;flex-wrap:wrap;gap:6px}
.doc-item{display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--cd);border:1px solid var(--b);border-radius:16px;font-size:11px;color:var(--ac)}
`;

export default function App() {
  const [D,setD]=useState(null);const [ok,setOk]=useState(false);const [auth,setAuth]=useState(false);
  const [team,setTeam]=useState(null);const [pg,setPg]=useState("home");const [mod,setMod]=useState(null);
  const [selM,setSelM]=useState(null);const [selMt,setSelMt]=useState(null);const [pin,setPin]=useState("");
  const [pE,setPE]=useState(false);const [nO,setNO]=useState(false);const [me,setMe]=useState("");
  const [ci,setCi]=useState("");const [viewPhoto,setViewPhoto]=useState(null);const ce=useRef(null);

  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"app","data"),(snap)=>{
      if(snap.exists()){setD(snap.data());setOk(true)}
      else{setDoc(doc(db,"app","data"),DEF).then(()=>{setD(DEF);setOk(true)})}
    },(err)=>{console.error(err);setD(DEF);setOk(true)});
    return ()=>unsub();
  },[]);
  const save=useCallback(async nd=>{setD(nd);await SV(nd)},[]);
  useEffect(()=>{if(pg==="chat")ce.current?.scrollIntoView({behavior:'smooth'})},[D,pg]);

  if(!ok) return (<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#daf0f7',color:'#1a8aab'}}>Načítání...</div>);
  if(!D) return null;

  const hp=d=>{setPE(false);if(d==="back"){setPin(p=>p.slice(0,-1));return}const n=pin+d;setPin(n);if(n.length===4){const tPin=TEAMS.find(t=>t.id===team)?.pin;if(n===tPin){setAuth(true);setPin("")}else{setPE(true);setTimeout(()=>{setPin("");setPE(false)},600)}}};

  if(!team) return (
    <div><style>{S}</style><div className="ts-screen">
      <div style={{color:'var(--ac)',marginBottom:16,opacity:.85}}><Ic.Ball/></div>
      <div className="LT">TJ Dynamo Drnholec</div>
      <div style={{color:'var(--t2)',fontSize:13,marginBottom:30}}>Vyberte sekci</div>
      <div className="ts-grid">
        {TEAMS.map(t=> (
          <button key={t.id} className="ts-btn" onClick={()=>{setTeam(t.id);setAuth(false);setPin("");setPg("home")}}>
            <div className="ts-dot" style={{background:t.color}}/>
            <div><div className="ts-name">{t.name}</div>
              <div className="ts-sub">{t.id==="vybor"?(D.teams[t.id]?.contacts||[]).length+" členů":(D.teams[t.id]?.players||[]).length+" hráčů"}</div>
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
      <div style={{color:'var(--t3)',fontSize:12,marginBottom:30}}>Zadejte PIN</div>
      <div className="LC">
        <div className="PD">{[0,1,2,3].map(i=> <div key={i} className={i<pin.length?(pE?'e':'f'):''}/>)}</div>
        {pE&&<div style={{color:'var(--r)',fontSize:13,textAlign:'center',marginBottom:12,fontWeight:600}}>Špatný PIN</div>}
        <div className="KP">{["1","2","3","4","5","6","7","8","9","","0","back"].map((k,i)=>
          <button key={i} className={`${!k?"x":""} ${k==="back"?"bk":""}`} onClick={()=>k&&hp(k)}>{k==="back"?"⌫":k}</button>
        )}</div>
        <button style={{marginTop:20,background:'none',border:'none',color:'var(--t3)',fontSize:12,cursor:'pointer',fontFamily:'var(--f)',width:'100%',textAlign:'center'}} onClick={()=>{setTeam(null);setPin("")}}>← Zpět</button>
      </div>
    </div></div>
  );

  const isV=team==="vybor";
  const T={...emptyTeam(),...(D.teams[team]||{})};
  const tInfo=TEAMS.find(t=>t.id===team)||TEAMS[0];
  const saveT=nd=>{save({...D,teams:{...D.teams,[team]:nd}})};
  const bg=T.badges||{};
  const aB=s=>({...bg,[s]:(bg[s]||0)+1});
  const cB=s=>{if((bg[s]||0)>0)saveT({...T,badges:{...bg,[s]:0}})};
  const nt=(txt,s)=>{try{navigator.setAppBadge&&navigator.setAppBadge(1)}catch{};return {notifications:[...(T.notifications||[]),{id:"n_"+uid(),date:now(),text:txt,read:false}],badges:aB(s)}};
  const fd=d=>{try{return new Date(d.includes?.('T')?d:d+"T00:00:00").toLocaleDateString('cs-CZ',{weekday:'short',day:'numeric',month:'short'})}catch{return d}};
  const ts=d=>{try{return new Date(d).toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'})}catch{return''}};
  const go=p=>{setPg(p);setSelM(null);setSelMt(null);cB(p)};
  const del=(k,i)=>saveT({...T,[k]:(T[k]||[]).filter(x=>x.id!==i)});

  const addM=m=>{const n=nt("Zápas: "+m.opponent,"matches");saveT({...T,...n,matches:[...T.matches,{...m,id:"m_"+uid(),result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:me||"?",editedBy:""}]});setMod(null)};
  const addTr=t=>{const n=nt("Trénink: "+t.focus,"trainings");saveT({...T,...n,trainings:[...T.trainings,{...t,id:"t_"+uid(),attendance:{},excuses:{},done:false,createdBy:me||"?",editedBy:""}]});setMod(null)};
  const addPl=p=>{const n=nt("Hráč: "+p.name,"players");saveT({...T,...n,players:[...T.players,{...p,id:"p_"+uid()}]});setMod(null)};
  const addCt=c=>{const n=nt("Kontakt: "+c.name,"contacts");saveT({...T,...n,contacts:[...T.contacts,{...c,id:"c_"+uid()}]});setMod(null)};
  const editPl=(pid,u)=>{saveT({...T,players:T.players.map(p=>p.id===pid?{...p,...u}:p)});setMod(null)};
  const editCt=(cid,u)=>{saveT({...T,contacts:T.contacts.map(c=>c.id===cid?{...c,...u}:c)});setMod(null)};
  const addCoach=c=>{const n=nt("Trenér: "+c.name,"coaches");saveT({...T,...n,coaches:[...T.coaches,{...c,id:"co_"+uid()}]});setMod(null)};
  const editCoach=(cid,u)=>{saveT({...T,coaches:T.coaches.map(c=>c.id===cid?{...c,...u}:c)});setMod(null)};
  const addNw=a=>{const n=nt("Aktualita: "+a.title,"news");saveT({...T,...n,news:[{...a,id:"nw_"+uid(),date:now(),pinned:false},...T.news]});setMod(null)};
  const sChat=(tx,f)=>{if(!tx.trim()||!f.trim())return;const n=nt(f+": "+tx.substring(0,30),"chat");saveT({...T,...n,chat:[...T.chat,{id:"ch_"+uid(),ts:now(),from:f,text:tx}]});setCi("")};
  const addAb=a=>{const n=nt("Omluvenka: "+a.playerName,"absences");saveT({...T,...n,absences:[...T.absences,{...a,id:"a_"+uid(),date:td(),status:"pending"}]});setMod(null)};
  const addPo=p=>{const n=nt("Anketa: "+p.question,"polls");saveT({...T,...n,polls:[{...p,id:"po_"+uid(),date:td(),active:true},...T.polls]});setMod(null)};
  const addMeet=m=>{const n=nt("Schůze: "+m.topic,"meetings");saveT({...T,...n,meetings:[{...m,id:"mt_"+uid(),attendance:{},excuses:{},docs:[],done:false,createdBy:me||"?",editedBy:""},...T.meetings]});setMod(null)};
  const togDone=(kind,evId)=>{saveT({...T,[kind]:T[kind].map(e=>e.id===evId?{...e,done:!e.done}:e)})};
  const editEv=(kind,evId,updates)=>{saveT({...T,[kind]:T[kind].map(e=>e.id===evId?{...e,...updates,editedBy:me||"?"}:e)});setMod(null)};
  const sLU=(mi,pi)=>saveT({...T,matches:T.matches.map(m=>m.id===mi?{...m,lineup:pi}:m)});
  const sR=(mi,r)=>saveT({...T,matches:T.matches.map(m=>m.id===mi?{...m,result:r}:m)});
  const tPN=i=>saveT({...T,news:T.news.map(a=>a.id===i?{...a,pinned:!a.pinned}:a)});
  const apA=i=>saveT({...T,absences:T.absences.map(a=>a.id===i?{...a,status:"approved"}:a)});
  const vP=(pi,ix)=>saveT({...T,polls:T.polls.map(p=>p.id===pi?{...p,options:p.options.map((o,i)=>i===ix?{...o,votes:o.votes+1}:o)}:p)});
  const togAtt=(kind,evId,name,val)=>{saveT({...T,[kind]:T[kind].map(e=>e.id===evId?{...e,attendance:{...(e.attendance||{}),[name]:val}}:e)})};
  const setExcuse=(kind,evId,name,reason)=>{saveT({...T,[kind]:T[kind].map(e=>e.id===evId?{...e,excuses:{...(e.excuses||{}),[name]:reason}}:e)})};
  const addDocToMeet=(mtId,doc)=>{saveT({...T,meetings:T.meetings.map(m=>m.id===mtId?{...m,docs:[...(m.docs||[]),doc]}:m)})};
  const dlDoc=(doc)=>{try{const parts=doc.data.split(',');const mime=parts[0].match(/:(.*?);/)[1];const bin=atob(parts[1]);const arr=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);const blob=new Blob([arr],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=doc.name;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url)}catch(e){console.error(e)}};
  const openDoc=(doc)=>{const w=window.open('','_blank');if(w){w.document.write('<!DOCTYPE html><html><head><title>'+doc.name+'</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:sans-serif;background:#f0f0f0}.bar{padding:10px 16px;background:#fff;border-bottom:1px solid #ddd;display:flex;gap:12px;align-items:center;position:sticky;top:0;z-index:10}.bar button,.bar a{color:#1a8aab;text-decoration:none;font-weight:600;font-size:14px;background:none;border:none;cursor:pointer}.cnt{padding:16px;text-align:center}</style></head><body><div class="bar"><button onclick="window.close()">← Zavřít</button><span style="color:#666;font-size:13px">'+doc.name+'</span></div><div class="cnt">'+(doc.data.startsWith('data:image')?'<img src="'+doc.data+'" style="max-width:100%;border-radius:8px"/>':'<iframe src="'+doc.data+'" style="width:100%;height:85vh;border:none;border-radius:8px"></iframe>')+'</div></body></html>');w.document.close()}};
  const mAR=()=>{try{navigator.clearAppBadge&&navigator.clearAppBadge()}catch{};saveT({...T,notifications:(T.notifications||[]).map(n=>({...n,read:true}))})};
  const uN=(T.notifications||[]).filter(n=>!n.read).length;
  const nxM=(T.matches||[]).filter(m=>!m.result).sort((a,b)=>a.date.localeCompare(b.date))[0];
  const nxT=(T.trainings||[]).sort((a,b)=>a.date.localeCompare(b.date))[0];
  const names=isV?(T.contacts||[]).map(c=>c.name):(T.players||[]).map(p=>p.name);

  const AttBlock=({kind,ev})=>{const att=ev.attendance||{};const exc=ev.excuses||{};const yc=names.filter(n=>att[n]).length;const nc=names.filter(n=>exc[n]).length;
    return (<div className="att"><div style={{fontSize:11,fontWeight:600,color:'var(--t2)',marginBottom:6}}>Účast: {yc} přijde · {nc} omluveno · {names.length-yc-nc} neznámo</div>
    {names.map(n=> {const isAtt=!!att[n];const isExc=!!exc[n];
      return (<div className="att-row" key={n} style={{flexWrap:'wrap'}}>
        <input type="checkbox" className="att-cb" checked={isAtt} onChange={()=>{if(!isAtt){togAtt(kind,ev.id,n,true);if(isExc)setExcuse(kind,ev.id,n,"")}else{togAtt(kind,ev.id,n,false)}}}/>
        <span className="att-name" style={{color:isAtt?'var(--g)':isExc?'var(--r)':'var(--t)'}}>{n}</span>
        {isExc&&<span style={{fontSize:10,color:'var(--r)',marginLeft:4}}>– {exc[n]}</span>}
        {!isAtt&&!isExc&&<div style={{marginLeft:'auto',display:'flex',gap:4}}>
          {["Nemoc","Zranění","Rodina","Škola","Jiné"].map(r=> <button key={r} style={{fontSize:9,padding:'2px 7px',borderRadius:12,border:'1px solid var(--b2)',background:'var(--bg)',color:'var(--r)',cursor:'pointer',fontFamily:'var(--f)'}} onClick={()=>setExcuse(kind,ev.id,n,r)}>{r}</button>)}
        </div>}
        {isExc&&<button style={{fontSize:9,marginLeft:'auto',padding:'2px 7px',borderRadius:12,border:'1px solid var(--b2)',background:'var(--bg)',color:'var(--t3)',cursor:'pointer',fontFamily:'var(--f)'}} onClick={()=>setExcuse(kind,ev.id,n,"")}>Zrušit omluvu</button>}
      </div>)})}</div>)};

  const navTeam=[{k:"home",l:"Domů",i: <Ic.Home/>},{k:"news",l:"Aktuality",i: <Ic.News/>},{k:"matches",l:"Zápasy",i: <Ic.Cup/>,dv:true},{k:"trainings",l:"Tréninky",i: <Ic.Cal/>},{k:"chat",l:"Chat",i: <Ic.Chat/>,dv:true},{k:"players",l:"Hráči",i: <Ic.Ppl/>},{k:"coaches",l:"Trenéři",i: <Ic.Meet/>},{k:"polls",l:"Ankety",i: <Ic.Chart/>,dv:true},{k:"photos",l:"Fotky",i: <Ic.Cam/>}];
  const navVybor=[{k:"home",l:"Domů",i: <Ic.Home/>},{k:"contacts",l:"Členové",i: <Ic.Ppl/>},{k:"meetings",l:"Schůze",i: <Ic.Meet/>,dv:true},{k:"chat",l:"Chat",i: <Ic.Chat/>},{k:"polls",l:"Ankety",i: <Ic.Chart/>,dv:true}];
  const nav=isV?navVybor:navTeam;

  const pgHome=()=>(<div>
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><div className="ts-dot" style={{background:tInfo.color,width:10,height:10}}/><div><div style={{fontFamily:'var(--fd)',fontSize:16,textTransform:'uppercase'}}>{tInfo.name}</div><div style={{fontSize:10,color:'var(--t3)'}}>TJ Dynamo Drnholec</div></div></div>
    {isV? (<div className="sg"><div className="st" onClick={()=>go("contacts")}><div className="sn">{T.contacts.length}</div><div className="sl">Členů</div></div><div className="st" onClick={()=>go("meetings")}><div className="sn">{T.meetings.length}</div><div className="sl">Schůzí</div></div></div>)
    :(<div className="sg"><div className="st" onClick={()=>go("players")}><div className="sn">{T.players.length}</div><div className="sl">Hráčů</div></div><div className="st" onClick={()=>go("matches")}><div className="sn">{T.matches.filter(m=>!m.result).length}</div><div className="sl">Zápasů</div></div><div className="st" onClick={()=>go("trainings")}><div className="sn">{T.trainings.length}</div><div className="sl">Tréninků</div></div><div className="st" onClick={()=>go("photos")}><div className="sn">{T.photos.length}</div><div className="sl">Fotek</div></div></div>)}
    {nxM&&!isV&&(<><div className="lb">Příští zápas</div><div className="c2" onClick={()=>{go("matches");setTimeout(()=>setSelM(nxM),50)}}><div className="cr"><div><div className="ctt">vs {nxM.opponent}</div><div className="css2">{fd(nxM.date)} · {nxM.time}</div></div><span className={`tg ${nxM.location==="Domácí"?"th":"ta"}`}>{nxM.location==="Domácí"?"Doma":"Venku"}</span></div></div></>)}
    {nxT&&!isV&&(<><div className="lb" style={{marginTop:8}}>Příští trénink</div><div className="c2" onClick={()=>go("trainings")}><div className="ctt">{nxT.focus}</div><div className="css2">{fd(nxT.date)} · {nxT.time}</div></div></>)}
  </div>);

  const EvMeta=({ev})=>(<div style={{fontSize:9,color:'var(--t3)',marginTop:8,borderTop:'1px solid var(--b)',paddingTop:6}}>{ev.createdBy&&<span>Vytvořil: {ev.createdBy}</span>}{ev.editedBy&&<span style={{marginLeft:10}}>· Upravil: {ev.editedBy}</span>}</div>);

  const pgMatches=()=>{if(selM){const m=T.matches.find(x=>x.id===selM.id)||selM; return (<div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <button style={{display:'flex',alignItems:'center',gap:5,color:'var(--ac)',fontSize:12,fontWeight:600,fontFamily:'var(--f)',background:'none',border:'none',cursor:'pointer'}} onClick={()=>setSelM(null)}><Ic.Bk/> Zpět</button>
      <div style={{display:'flex',gap:6}}>
        <button className="ba" style={{fontSize:10}} onClick={()=>setMod({type:"eM",ev:m})}>✎ Upravit</button>
        <button className="ba" style={{fontSize:10,color:m.done?'var(--g)':'var(--t3)'}} onClick={()=>togDone("matches",m.id)}>{m.done?"✓ Proběhlo":"○ Proběhlo"}</button>
      </div>
    </div>
    <div className="pt" style={{marginBottom:8,opacity:m.done?.5:1}}>vs {m.opponent}</div><div style={{color:'var(--t2)',fontSize:12,marginBottom:12}}>{fd(m.date)} · {m.time}{m.meetTime&&<span style={{color:'var(--ac)'}}> · sraz {m.meetTime}</span>} · {m.location==="Domácí"?"Doma":"Venku"} · {m.type}</div>
    {!m.result&&<div style={{marginBottom:12,display:'flex',gap:6}}><input className="fi" placeholder="3:1" id="ri" style={{flex:1}}/><button className="ba" onClick={()=>{const v=document.getElementById('ri').value;if(v){sR(m.id,v)}}}>Uložit</button></div>}
    {m.result&&<div style={{background:'var(--ag)',borderRadius:'var(--rd)',padding:12,marginBottom:12,textAlign:'center'}}><div style={{fontSize:10,color:'var(--t3)',textTransform:'uppercase'}}>Výsledek</div><div style={{fontFamily:'var(--fd)',fontSize:28,color:'var(--ac)'}}>{m.result}</div></div>}
    <div className="lb">Sestava</div>
    <div className="lc" style={{marginBottom:12}}>{T.players.map(p=> <button key={p.id} className={`lch ${(m.lineup||[]).includes(p.id)?'s':''}`} onClick={()=>{const nl=(m.lineup||[]).includes(p.id)?(m.lineup||[]).filter(x=>x!==p.id):[...(m.lineup||[]),p.id];sLU(m.id,nl)}}>{p.name.split(' ')[0]}</button>)}</div>
    {(m.lineup||[]).length>0&&<div className="lf">{(()=>{const lp=T.players.filter(p=>(m.lineup||[]).includes(p.id));const R=({a})=>a.length>0? <div className="fr">{a.map(p=> <div className="fp" key={p.id}><div className="fc">{p.name.split(' ').map(w=>w[0]).join('')}</div><div className="fn">{p.name.split(' ')[0]}</div></div>)}</div>:null; return (<><R a={lp.filter(p=>p.position==="Útočník")}/><R a={lp.filter(p=>p.position==="Záložník")}/><R a={lp.filter(p=>p.position==="Obránce")}/><R a={lp.filter(p=>p.position==="Brankář")}/></>)})()}</div>}
    <AttBlock kind="matches" ev={m}/>
    <EvMeta ev={m}/>
  </div>)};const upcoming=T.matches.filter(m=>!m.done).sort((a,b)=>a.date.localeCompare(b.date));const past=T.matches.filter(m=>m.done).sort((a,b)=>b.date.localeCompare(a.date)); return (<div><div className="ph"><div className="pt">Zápasy</div><button className="ba" onClick={()=>setMod("aM")}><Ic.Plus/> Přidat</button></div>
    {upcoming.length>0&&<div className="lb">Nadcházející</div>}
    {upcoming.map(m=> <div className="c2" key={m.id} onClick={()=>setSelM(m)}><div className="cr"><div><div className="ctt">vs {m.opponent}</div><div className="css2">{fd(m.date)} · {m.time}{m.meetTime&&" · sraz "+m.meetTime}</div></div><div style={{display:'flex',gap:5}}><span className={`tg ${m.location==="Domácí"?"th":"ta"}`}>{m.location==="Domácí"?"Doma":"Venku"}</span><button className="ib d" onClick={e=>{e.stopPropagation();del("matches",m.id)}}><Ic.Del/></button></div></div><div style={{fontSize:10,color:'var(--t3)',marginTop:4}}>✓ {names.filter(n=>(m.attendance||{})[n]).length} · ✗ {names.filter(n=>(m.excuses||{})[n]).length} · ? {names.length-names.filter(n=>(m.attendance||{})[n]).length-names.filter(n=>(m.excuses||{})[n]).length}</div></div>)}
    {past.length>0&&<div className="lb" style={{marginTop:12}}>Proběhlo</div>}
    {past.map(m=> <div className="c2" key={m.id} onClick={()=>setSelM(m)} style={{opacity:.6}}><div className="cr"><div><div className="ctt" style={{textDecoration:'line-through'}}>vs {m.opponent}</div><div className="css2">{fd(m.date)} · {m.result||m.time}</div></div><span className="tg" style={{background:'var(--ag)',color:'var(--ac)'}}>✓</span></div></div>)}</div>)};

  const pgTr=()=>{if(selM){const t=T.trainings.find(x=>x.id===selM.id)||selM; return (<div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <button style={{display:'flex',alignItems:'center',gap:5,color:'var(--ac)',fontSize:12,fontWeight:600,fontFamily:'var(--f)',background:'none',border:'none',cursor:'pointer'}} onClick={()=>setSelM(null)}><Ic.Bk/> Zpět</button>
      <div style={{display:'flex',gap:6}}>
        <button className="ba" style={{fontSize:10}} onClick={()=>setMod({type:"eT",ev:t})}>✎ Upravit</button>
        <button className="ba" style={{fontSize:10,color:t.done?'var(--g)':'var(--t3)'}} onClick={()=>togDone("trainings",t.id)}>{t.done?"✓ Proběhlo":"○ Proběhlo"}</button>
      </div>
    </div>
    <div className="pt" style={{marginBottom:8,opacity:t.done?.5:1}}>{t.focus}</div><div style={{color:'var(--t2)',fontSize:12,marginBottom:12}}>{fd(t.date)} · {t.time} · {t.duration} · {t.location}</div>
    {t.notes&&<div style={{fontSize:12,color:'var(--t2)',marginBottom:12,fontStyle:'italic'}}>{t.notes}</div>}
    <AttBlock kind="trainings" ev={t}/>
    <EvMeta ev={t}/>
  </div>)};const upTr=T.trainings.filter(t=>!t.done).sort((a,b)=>a.date.localeCompare(b.date));const paTr=T.trainings.filter(t=>t.done).sort((a,b)=>b.date.localeCompare(a.date)); return (<div><div className="ph"><div className="pt">Tréninky</div><button className="ba" onClick={()=>setMod("aT")}><Ic.Plus/></button></div>
    {upTr.length>0&&<div className="lb">Nadcházející</div>}
    {upTr.map(t=> <div className="c2" key={t.id} onClick={()=>setSelM(t)}><div className="cr"><div><div className="ctt">{t.focus}</div><div className="css2">{fd(t.date)} · {t.time} · {t.duration}</div></div><button className="ib d" onClick={e=>{e.stopPropagation();del("trainings",t.id)}}><Ic.Del/></button></div><div style={{fontSize:10,color:'var(--t3)',marginTop:4}}>✓ {names.filter(n=>(t.attendance||{})[n]).length} · ✗ {names.filter(n=>(t.excuses||{})[n]).length}</div></div>)}
    {paTr.length>0&&<div className="lb" style={{marginTop:12}}>Proběhlo</div>}
    {paTr.map(t=> <div className="c2" key={t.id} onClick={()=>setSelM(t)} style={{opacity:.6}}><div className="cr"><div><div className="ctt" style={{textDecoration:'line-through'}}>{t.focus}</div><div className="css2">{fd(t.date)} · {t.time}</div></div><span className="tg" style={{background:'var(--ag)',color:'var(--ac)'}}>✓</span></div></div>)}
  </div>)};

  const pgMeetings=()=>{if(selMt){const m=T.meetings.find(x=>x.id===selMt.id)||selMt; return (<div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <button style={{display:'flex',alignItems:'center',gap:5,color:'var(--ac)',fontSize:12,fontWeight:600,fontFamily:'var(--f)',background:'none',border:'none',cursor:'pointer'}} onClick={()=>setSelMt(null)}><Ic.Bk/> Zpět</button>
      <div style={{display:'flex',gap:6}}>
        <button className="ba" style={{fontSize:10}} onClick={()=>setMod({type:"eMt",ev:m})}>✎ Upravit</button>
        <button className="ba" style={{fontSize:10,color:m.done?'var(--g)':'var(--t3)'}} onClick={()=>togDone("meetings",m.id)}>{m.done?"✓ Proběhlo":"○ Proběhlo"}</button>
      </div>
    </div>
    <div className="pt" style={{marginBottom:8,opacity:m.done?.5:1}}>{m.topic}</div><div style={{color:'var(--t2)',fontSize:12,marginBottom:12}}>{fd(m.date)} · {m.time} · {m.location}</div>
    <div className="lb">Dokumenty ({(m.docs||[]).length})</div>
    <div className="doc-list">{(m.docs||[]).map((d,i)=> <div key={i} style={{display:'flex',alignItems:'center',gap:4}}><button onClick={()=>openDoc(d)} className="doc-item" style={{cursor:'pointer',border:'1px solid var(--b)',background:'var(--cd)'}}><Ic.Doc/> {d.name}</button><button onClick={()=>dlDoc(d)} style={{fontSize:10,color:'var(--ac)',padding:'4px 8px',background:'var(--ag)',borderRadius:12,border:'none',cursor:'pointer',fontFamily:'var(--f)'}}>⬇</button></div>)}</div>
    <div style={{marginTop:8}}><label className="ba" style={{cursor:'pointer',display:'inline-flex'}}><Ic.Plus/> Přidat soubor<input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{addDocToMeet(m.id,{name:f.name,data:ev.target.result})};r.readAsDataURL(f);e.target.value=""}}/></label></div>
    <AttBlock kind="meetings" ev={m}/>
    <EvMeta ev={m}/>
  </div>)};const upMt=T.meetings.filter(m=>!m.done).sort((a,b)=>a.date.localeCompare(b.date));const paMt=T.meetings.filter(m=>m.done).sort((a,b)=>b.date.localeCompare(a.date)); return (<div><div className="ph"><div className="pt">Schůze výboru</div><button className="ba" onClick={()=>setMod("aMt")}><Ic.Plus/> Nová</button></div>
    {upMt.length===0&&paMt.length===0&&<div className="es"><p>Žádné schůze</p></div>}
    {upMt.length>0&&<div className="lb">Nadcházející</div>}
    {upMt.map(m=> <div className="c2" key={m.id} onClick={()=>setSelMt(m)}><div className="cr"><div><div className="ctt">{m.topic}</div><div className="css2">{fd(m.date)} · {m.time} · {m.location}</div></div><button className="ib d" onClick={e=>{e.stopPropagation();del("meetings",m.id)}}><Ic.Del/></button></div><div style={{fontSize:10,color:'var(--t3)',marginTop:4}}>✓ {names.filter(n=>(m.attendance||{})[n]).length} · Docs: {(m.docs||[]).length}</div></div>)}
    {paMt.length>0&&<div className="lb" style={{marginTop:12}}>Proběhlo</div>}
    {paMt.map(m=> <div className="c2" key={m.id} onClick={()=>setSelMt(m)} style={{opacity:.6}}><div className="cr"><div><div className="ctt" style={{textDecoration:'line-through'}}>{m.topic}</div><div className="css2">{fd(m.date)}</div></div><span className="tg" style={{background:'var(--ag)',color:'var(--ac)'}}>✓</span></div></div>)}
  </div>)};

  const pgPl=()=>(<div><div className="ph"><div className="pt">Hráči</div><button className="ba" onClick={()=>setMod("aP")}><Ic.Plus/></button></div>
    {T.players.sort((a,b)=>a.name.localeCompare(b.name)).map(p=> <div className="pr" key={p.id} style={{flexWrap:'wrap'}}>
      <div className="ca">{p.name.split(' ').map(w=>w[0]).join('').substring(0,2)}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:600,fontSize:12}}>{p.name}</div>
        <div style={{fontSize:10,color:'var(--t3)'}}>{p.position} · nar. {p.birthYear}</div>
        {p.phone&&<div style={{fontSize:10,marginTop:2}}><a href={`tel:${p.phone}`} style={{color:'var(--ac)',textDecoration:'none'}}>📱 {p.phone}</a></div>}
        {p.parentName&&<div style={{fontSize:10,color:'var(--t2)',marginTop:3,borderTop:'1px solid var(--b)',paddingTop:3}}>👤 {p.parentName}{p.parentPhone&&<a href={`tel:${p.parentPhone}`} style={{color:'var(--ac)',textDecoration:'none',marginLeft:6}}>📞 {p.parentPhone}</a>}</div>}
      </div>
      <div style={{display:'flex',gap:4}}><button className="ib" onClick={()=>setMod({type:"eP",ev:p})} style={{padding:4}}>✎</button><button className="ib d" onClick={()=>del("players",p.id)}><Ic.Del/></button></div>
    </div>)}</div>);

  const pgCt=()=>(<div><div className="ph"><div className="pt">{isV?"Členové výboru":"Adresář"}</div><button className="ba" onClick={()=>setMod("aCt")}><Ic.Plus/></button></div>
    {T.contacts.length===0&&<div className="es"><p>Žádné kontakty</p></div>}
    {T.contacts.map(c=> <div className="cx" key={c.id}><div className="ca">{c.name.split(' ').map(w=>w[0]).join('').substring(0,2)}</div><div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:12}}>{c.name}</div>{c.relation&&<div style={{fontSize:10,color:'var(--ac)'}}>{c.relation}</div>}<div style={{fontSize:10,color:'var(--t3)',marginTop:2}}>{c.phone&&<a href={`tel:${c.phone}`} style={{color:'var(--ac)',textDecoration:'none'}}>{c.phone}</a>} {c.email&&<span style={{marginLeft:6}}>{c.email}</span>}</div></div><div style={{display:'flex',gap:4}}><button className="ib" onClick={()=>setMod({type:"eCt",ev:c})} style={{padding:4}}>✎</button><button className="ib d" onClick={()=>del("contacts",c.id)}><Ic.Del/></button></div></div>)}</div>);

  const pgCoaches=()=>(<div><div className="ph"><div className="pt">Trenéři</div><button className="ba" onClick={()=>setMod("aCo")}><Ic.Plus/></button></div>
    {(T.coaches||[]).length===0&&<div className="es"><p>Žádní trenéři</p></div>}
    {(T.coaches||[]).map(c=> <div className="cx" key={c.id}><div className="ca" style={{background:'rgba(220,38,38,.1)',color:'var(--r)'}}>{c.name.split(' ').map(w=>w[0]).join('').substring(0,2)}</div><div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:12}}>{c.name}</div>{c.role&&<div style={{fontSize:10,color:'var(--r)',fontWeight:500}}>{c.role}</div>}<div style={{fontSize:10,color:'var(--t3)',marginTop:2}}>{c.phone&&<a href={`tel:${c.phone}`} style={{color:'var(--ac)',textDecoration:'none'}}>📞 {c.phone}</a>} {c.email&&<span style={{marginLeft:6}}>{c.email}</span>}</div></div><div style={{display:'flex',gap:4}}><button className="ib" onClick={()=>setMod({type:"eCo",ev:c})} style={{padding:4}}>✎</button><button className="ib d" onClick={()=>del("coaches",c.id)}><Ic.Del/></button></div></div>)}</div>);

  const pgNw=()=>(<div><div className="ph"><div className="pt">Aktuality</div><button className="ba" onClick={()=>setMod("aNw")}><Ic.Plus/> Nová</button></div>
    {T.news.length===0&&<div className="es"><p>Žádné aktuality</p></div>}
    {T.news.map(a=> <div className={`nw ${a.important?"imp":""} ${a.pinned?"pnd":""}`} key={a.id}><div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{a.title}</div><div style={{fontSize:10,color:'var(--ac)',marginBottom:3}}>{a.from}</div><div style={{fontSize:12,color:'var(--t2)',lineHeight:1.5}}>{a.text}</div><div style={{fontSize:10,color:'var(--t3)',marginTop:6,display:'flex',justifyContent:'space-between'}}><span>{fd(a.date)}</span><div style={{display:'flex',gap:4}}><button className="ib" onClick={()=>tPN(a.id)} style={{padding:3}}><Ic.Pin/></button><button className="ib d" onClick={()=>del("news",a.id)} style={{padding:3}}><Ic.Del/></button></div></div></div>)}</div>);

  const pgChat=()=>(<div className="cw"><div className="ph"><div className="pt">Chat</div></div>
    {!me? <div style={{padding:20,textAlign:'center'}}><div style={{color:'var(--t2)',fontSize:13,marginBottom:10}}>Zadejte jméno</div><div style={{display:'flex',gap:8,maxWidth:260,margin:'0 auto'}}><input className="fi" placeholder="Jméno" id="cn"/><button className="ba" onClick={()=>{const v=document.getElementById('cn').value;if(v)setMe(v)}}>OK</button></div></div>
    :<><div className="cmg">{T.chat.map(msg=> <div className={`cbb ${msg.from===me?'me':'ot'}`} key={msg.id}><div className="cin"><div className="cfr">{msg.from}</div>{msg.text}<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:3}}><span className="cti">{ts(msg.ts)}</span><button onClick={()=>{saveT({...T,chat:T.chat.filter(c=>c.id!==msg.id)})}} style={{background:'none',border:'none',color:'var(--r)',cursor:'pointer',padding:'2px 6px',fontSize:10,fontFamily:'var(--f)',opacity:.7}}>✕ smazat</button></div></div></div>)}<div ref={ce}/></div>
    <div className="cip"><input value={ci} onChange={e=>setCi(e.target.value)} placeholder="Zpráva..." onKeyDown={e=>{if(e.key==='Enter')sChat(ci,me)}}/><button className="csb" onClick={()=>sChat(ci,me)}><Ic.Send/></button></div></>}</div>);

  const pgAbs=()=>(<div><div className="ph"><div className="pt">Omluvenky</div><button className="ba" onClick={()=>setMod("aAb")}><Ic.Plus/></button></div>
    {T.absences.length===0&&<div className="es"><p>Žádné omluvenky</p></div>}
    {T.absences.map(a=> <div className="pr" key={a.id}><div style={{width:10,height:10,borderRadius:'50%',background:a.status==="pending"?'var(--y)':'var(--g)'}}/><div style={{flex:1}}><div style={{fontWeight:600,fontSize:12}}>{a.playerName}</div><div style={{fontSize:10,color:'var(--t3)'}}>{a.reason} · {fd(a.eventDate)}</div></div>{a.status==="pending"&&<button className="ib" onClick={()=>apA(a.id)} style={{color:'var(--g)'}}><Ic.Chk/></button>}<button className="ib d" onClick={()=>del("absences",a.id)} style={{marginLeft:2}}><Ic.Del/></button><span className="tg" style={{background:a.status==='pending'?'var(--yb)':'var(--gb)',color:a.status==='pending'?'var(--y)':'var(--g)'}}>{a.status==="pending"?"Čeká":"OK"}</span></div>)}</div>);

  const pgPo=()=>(<div><div className="ph"><div className="pt">Ankety</div><button className="ba" onClick={()=>setMod("aPo")}><Ic.Plus/></button></div>
    {T.polls.length===0&&<div className="es"><p>Žádné ankety</p></div>}
    {T.polls.map(p=>{const tot=p.options.reduce((s,o)=>s+o.votes,0)||1;const cl=['var(--ac)','var(--g)','var(--y)','var(--o)','var(--p)'];
    return (<div className="pc" key={p.id}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}><div className="pq" style={{marginBottom:0}}>{p.question}</div><button className="ib d" onClick={()=>del("polls",p.id)} style={{flexShrink:0}}><Ic.Del/></button></div>{p.options.map((o,i)=> <div key={i}><div className="pbw"><div className="pbl">{o.text}</div><div className="pbb"><div className="pbf" style={{width:Math.round(o.votes/tot*100)+"%",background:cl[i%5],color:'#fff'}}>{o.votes}</div></div></div></div>)}<div style={{marginTop:5}}>{p.options.map((o,i)=> <button key={i} className="pvb" onClick={()=>vP(p.id,i)}>+ {o.text}</button>)}</div></div>)})}</div>);

  const pgPh=()=>(<div><div className="ph"><div className="pt">Fotky</div><button className="ba" onClick={()=>setMod("aPh")}><Ic.Plus/></button></div>
    {T.photos.length===0? <div className="es"><p>Žádné fotky</p></div>:
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:3,borderRadius:'var(--rd)',overflow:'hidden'}}>{T.photos.map((p,i)=> <div key={i} style={{aspectRatio:1,background:'var(--bg3)',overflow:'hidden',position:'relative',cursor:'pointer'}} onClick={()=>setViewPhoto(p)}>{p.url&&<img src={p.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>}<button className="ib d" onClick={e=>{e.stopPropagation();del("photos",p.id||("ph_"+i))}} style={{position:'absolute',top:4,right:4,padding:3,background:'rgba(255,255,255,.85)',borderColor:'transparent'}}><Ic.Del/></button></div>)}</div>}</div>);

  const FM=({title,ch,onS})=>(<div className="mo" onClick={()=>setMod(null)}><div className="ml" onClick={e=>e.stopPropagation()}><button className="mc3" onClick={()=>setMod(null)}><Ic.XC/></button><div className="mlt">{title}</div><form onSubmit={e=>{e.preventDefault();onS(new FormData(e.target))}}>{ch}</form></div></div>);
  const F=(n,l,t="text",p="",r=true)=> <div className="fg"><label className="fl">{l}</label>{t==="textarea"? <textarea name={n} className="fi ft2" required={r} placeholder={p}/>: <input name={n} type={t} className="fi" required={r} placeholder={p}/>}</div>;

  const modals=()=>{if(!mod) return null;
    if(mod==="aM") return (<FM title="Nový zápas" onS={f=>addM({date:f.get('d'),time:f.get('t'),meetTime:f.get('mt'),opponent:f.get('o'),location:f.get('l'),type:f.get('tp')})} ch={<>{F("o","Soupeř")}{F("d","Datum","date")}{F("t","Čas zápasu","time")}<div className="fg"><label className="fl">Čas srazu</label><input name="mt" type="time" className="fi"/></div><div className="fg"><label className="fl">Místo</label><select name="l" className="fi"><option value="Domácí">Doma</option><option value="Venku">Venku</option></select></div><div className="fg"><label className="fl">Typ</label><select name="tp" className="fi"><option>Liga</option><option>Pohár</option><option>Přátelský</option></select></div><button type="submit" className="fs">Přidat</button></>}/>);
    if(mod==="aT") return (<FM title="Nový trénink" onS={f=>addTr({date:f.get('d'),time:f.get('t'),duration:f.get('dr'),location:f.get('l'),focus:f.get('f'),notes:f.get('n')})} ch={<>{F("f","Zaměření")}{F("d","Datum","date")}{F("t","Čas","time")}{F("dr","Délka","text","90 min")}{F("l","Místo")}{F("n","Poznámky","textarea","",false)}<button type="submit" className="fs">Přidat</button></>}/>);
    if(mod==="aP") return (<FM title="Nový hráč" onS={f=>addPl({name:f.get('nm'),number:0,position:f.get('po'),birthYear:parseInt(f.get('yr')),phone:f.get('ph'),parentName:f.get('pn'),parentPhone:f.get('pp')})} ch={<>{F("nm","Jméno hráče")}<div className="fg"><label className="fl">Pozice</label><select name="po" className="fi"><option>Brankář</option><option>Obránce</option><option>Záložník</option><option>Útočník</option></select></div><div className="fg"><label className="fl">Rok narození</label><select name="yr" className="fi">{Array.from({length:30},(_,i)=>2030-i).map(y=> <option key={y} value={y}>{y}</option>)}</select></div>{F("ph","Telefon hráče","tel","+420...",false)}<div style={{borderTop:'1px solid var(--b)',paddingTop:10,marginTop:4,marginBottom:8}}><div style={{fontSize:10,fontWeight:700,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8}}>Rodič / Zákonný zástupce</div></div>{F("pn","Jméno rodiče","text","",false)}{F("pp","Telefon rodiče","tel","+420...",false)}<button type="submit" className="fs">Přidat hráče</button></>}/>);
    if(mod==="aCt") return (<FM title={isV?"Nový člen":"Nový kontakt"} onS={f=>addCt({name:f.get('nm'),relation:f.get('rl'),phone:f.get('ph'),email:f.get('em')})} ch={<>{F("nm","Jméno")}{F("rl",isV?"Funkce":"Vztah","text",isV?"Předseda":"Otec–Jakub",false)}{F("ph","Telefon","tel","+420...",false)}{F("em","E-mail","email","",false)}<button type="submit" className="fs">Přidat</button></>}/>);
    if(mod==="aNw") return (<FM title="Nová aktualita" onS={f=>addNw({from:f.get('fr'),title:f.get('ti'),text:f.get('tx'),important:f.get('im')==="on"})} ch={<>{F("fr","Autor")}{F("ti","Nadpis")}{F("tx","Text","textarea")}<div className="fg" style={{display:'flex',alignItems:'center',gap:8}}><input type="checkbox" name="im" id="ic"/><label htmlFor="ic" style={{fontSize:12,color:'var(--t2)'}}>Důležité</label></div><button type="submit" className="fs">Publikovat</button></>}/>);
    if(mod==="aAb") return (<FM title="Omluvit hráče" onS={f=>addAb({playerName:f.get('pl'),reason:f.get('rs'),eventDate:f.get('dt'),from:f.get('fr')})} ch={<>{F("fr","Vaše jméno")}<div className="fg"><label className="fl">Hráč</label><select name="pl" className="fi">{T.players.map(p=> <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>{F("dt","Datum","date")}<div className="fg"><label className="fl">Důvod</label><select name="rs" className="fi"><option>Nemoc</option><option>Zranění</option><option>Rodina</option><option>Škola</option></select></div><button type="submit" className="fs">Odeslat</button></>}/>);
    if(mod==="aPo") return (<FM title="Nová anketa" onS={f=>{const opts=f.get('op').split('\n').filter(x=>x.trim()).map(t=>({text:t.trim(),votes:0}));if(opts.length>=2)addPo({question:f.get('q'),options:opts})}} ch={<>{F("q","Otázka")}{F("op","Možnosti","textarea","Modrá\nČervená")}<button type="submit" className="fs">Vytvořit</button></>}/>);
    if(mod==="aMt") return (<FM title="Nová schůze" onS={f=>addMeet({date:f.get('d'),time:f.get('t'),location:f.get('l'),topic:f.get('tp')})} ch={<>{F("tp","Téma/program")}{F("d","Datum","date")}{F("t","Čas","time")}{F("l","Místo")}<button type="submit" className="fs">Vytvořit schůzi</button></>}/>);
    if(mod==="aPh") return (<div className="mo" onClick={()=>setMod(null)}><div className="ml" onClick={e=>e.stopPropagation()}><button className="mc3" onClick={()=>setMod(null)}><Ic.XC/></button><div className="mlt">Přidat fotku</div>
      <div className="fg"><label className="fl">Vyberte fotku</label><input type="file" accept="image/*" id="ph-file" style={{width:'100%',padding:10,background:'var(--bg)',border:'1.5px solid var(--b2)',borderRadius:'var(--rs)',color:'var(--t)',fontSize:13,fontFamily:'var(--f)'}}/></div>
      <div className="fg"><label className="fl">Popis</label><input type="text" id="ph-cap" className="fi" placeholder="Popis fotky"/></div>
      <button className="fs" onClick={()=>{const f=document.getElementById('ph-file').files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{const n=nt("Nová fotka","photos");saveT({...T,...n,photos:[...T.photos,{id:"ph_"+uid(),url:ev.target.result,caption:document.getElementById('ph-cap').value||"",date:td()}]});setMod(null)};r.readAsDataURL(f)}}>Nahrát</button>
    </div></div>);
    if(mod?.type==="eM"){const ev=mod.ev; return (<div className="mo" onClick={()=>setMod(null)}><div className="ml" onClick={e=>e.stopPropagation()}><button className="mc3" onClick={()=>setMod(null)}><Ic.XC/></button><div className="mlt">Upravit zápas</div>
      <form onSubmit={e=>{e.preventDefault();const f=new FormData(e.target);editEv("matches",ev.id,{opponent:f.get('o'),date:f.get('d'),time:f.get('t'),meetTime:f.get('mt'),location:f.get('l'),type:f.get('tp'),result:f.get('rs')||null})}}>
      <div className="fg"><label className="fl">Soupeř</label><input name="o" className="fi" defaultValue={ev.opponent} required/></div>
      <div className="fg"><label className="fl">Datum</label><input name="d" type="date" className="fi" defaultValue={ev.date} required/></div>
      <div className="fg"><label className="fl">Čas zápasu</label><input name="t" type="time" className="fi" defaultValue={ev.time} required/></div>
      <div className="fg"><label className="fl">Čas srazu</label><input name="mt" type="time" className="fi" defaultValue={ev.meetTime||""}/></div>
      <div className="fg"><label className="fl">Místo</label><select name="l" className="fi" defaultValue={ev.location}><option value="Domácí">Doma</option><option value="Venku">Venku</option></select></div>
      <div className="fg"><label className="fl">Typ</label><select name="tp" className="fi" defaultValue={ev.type}><option>Liga</option><option>Pohár</option><option>Přátelský</option></select></div>
      <div className="fg"><label className="fl">Výsledek</label><input name="rs" className="fi" defaultValue={ev.result||""} placeholder="3:1 (prázdné = bez výsledku)"/></div>
      <button type="submit" className="fs">Uložit změny</button></form></div></div>);}
    if(mod?.type==="eT"){const ev=mod.ev; return (<div className="mo" onClick={()=>setMod(null)}><div className="ml" onClick={e=>e.stopPropagation()}><button className="mc3" onClick={()=>setMod(null)}><Ic.XC/></button><div className="mlt">Upravit trénink</div>
      <form onSubmit={e=>{e.preventDefault();const f=new FormData(e.target);editEv("trainings",ev.id,{focus:f.get('f'),date:f.get('d'),time:f.get('t'),duration:f.get('dr'),location:f.get('l'),notes:f.get('n')})}}>
      <div className="fg"><label className="fl">Zaměření</label><input name="f" className="fi" defaultValue={ev.focus} required/></div>
      <div className="fg"><label className="fl">Datum</label><input name="d" type="date" className="fi" defaultValue={ev.date} required/></div>
      <div className="fg"><label className="fl">Čas</label><input name="t" type="time" className="fi" defaultValue={ev.time} required/></div>
      <div className="fg"><label className="fl">Délka</label><input name="dr" className="fi" defaultValue={ev.duration} required/></div>
      <div className="fg"><label className="fl">Místo</label><input name="l" className="fi" defaultValue={ev.location} required/></div>
      <div className="fg"><label className="fl">Poznámky</label><textarea name="n" className="fi ft2" defaultValue={ev.notes||""}/></div>
      <button type="submit" className="fs">Uložit změny</button></form></div></div>);}
    if(mod?.type==="eMt"){const ev=mod.ev; return (<div className="mo" onClick={()=>setMod(null)}><div className="ml" onClick={e=>e.stopPropagation()}><button className="mc3" onClick={()=>setMod(null)}><Ic.XC/></button><div className="mlt">Upravit schůzi</div>
      <form onSubmit={e=>{e.preventDefault();const f=new FormData(e.target);editEv("meetings",ev.id,{topic:f.get('tp'),date:f.get('d'),time:f.get('t'),location:f.get('l')})}}>
      <div className="fg"><label className="fl">Téma</label><input name="tp" className="fi" defaultValue={ev.topic} required/></div>
      <div className="fg"><label className="fl">Datum</label><input name="d" type="date" className="fi" defaultValue={ev.date} required/></div>
      <div className="fg"><label className="fl">Čas</label><input name="t" type="time" className="fi" defaultValue={ev.time} required/></div>
      <div className="fg"><label className="fl">Místo</label><input name="l" className="fi" defaultValue={ev.location} required/></div>
      <button type="submit" className="fs">Uložit změny</button></form></div></div>);}
    if(mod?.type==="eP"){const ev=mod.ev; return (<div className="mo" onClick={()=>setMod(null)}><div className="ml" onClick={e=>e.stopPropagation()}><button className="mc3" onClick={()=>setMod(null)}><Ic.XC/></button><div className="mlt">Upravit hráče</div>
      <form onSubmit={e=>{e.preventDefault();const f=new FormData(e.target);editPl(ev.id,{name:f.get('nm'),position:f.get('po'),birthYear:parseInt(f.get('yr')),phone:f.get('ph'),parentName:f.get('pn'),parentPhone:f.get('pp')})}}>
      <div className="fg"><label className="fl">Jméno</label><input name="nm" className="fi" defaultValue={ev.name} required/></div>
      <div className="fg"><label className="fl">Pozice</label><select name="po" className="fi" defaultValue={ev.position}><option>Brankář</option><option>Obránce</option><option>Záložník</option><option>Útočník</option></select></div>
      <div className="fg"><label className="fl">Rok narození</label><select name="yr" className="fi" defaultValue={ev.birthYear}>{Array.from({length:30},(_,i)=>2030-i).map(y=> <option key={y} value={y}>{y}</option>)}</select></div>
      <div className="fg"><label className="fl">Telefon hráče</label><input name="ph" type="tel" className="fi" defaultValue={ev.phone||""}/></div>
      <div style={{borderTop:'1px solid var(--b)',paddingTop:10,marginTop:4,marginBottom:8}}><div style={{fontSize:10,fontWeight:700,color:'var(--t3)',textTransform:'uppercase'}}>Rodič</div></div>
      <div className="fg"><label className="fl">Jméno rodiče</label><input name="pn" className="fi" defaultValue={ev.parentName||""}/></div>
      <div className="fg"><label className="fl">Telefon rodiče</label><input name="pp" type="tel" className="fi" defaultValue={ev.parentPhone||""}/></div>
      <button type="submit" className="fs">Uložit</button></form></div></div>);}
    if(mod?.type==="eCt"){const ev=mod.ev; return (<div className="mo" onClick={()=>setMod(null)}><div className="ml" onClick={e=>e.stopPropagation()}><button className="mc3" onClick={()=>setMod(null)}><Ic.XC/></button><div className="mlt">{isV?"Upravit člena":"Upravit kontakt"}</div>
      <form onSubmit={e=>{e.preventDefault();const f=new FormData(e.target);editCt(ev.id,{name:f.get('nm'),relation:f.get('rl'),phone:f.get('ph'),email:f.get('em')})}}>
      <div className="fg"><label className="fl">Jméno</label><input name="nm" className="fi" defaultValue={ev.name} required/></div>
      <div className="fg"><label className="fl">{isV?"Funkce":"Vztah"}</label><input name="rl" className="fi" defaultValue={ev.relation||""}/></div>
      <div className="fg"><label className="fl">Telefon</label><input name="ph" type="tel" className="fi" defaultValue={ev.phone||""}/></div>
      <div className="fg"><label className="fl">E-mail</label><input name="em" type="email" className="fi" defaultValue={ev.email||""}/></div>
      <button type="submit" className="fs">Uložit</button></form></div></div>);}
    if(mod==="aCo") return (<FM title="Nový trenér" onS={f=>addCoach({name:f.get('nm'),role:f.get('rl'),phone:f.get('ph'),email:f.get('em')})} ch={<>{F("nm","Jméno")}{F("rl","Role","text","Hlavní trenér / Asistent",false)}{F("ph","Telefon","tel","+420...",false)}{F("em","E-mail","email","",false)}<button type="submit" className="fs">Přidat trenéra</button></>}/>);
    if(mod?.type==="eCo"){const ev=mod.ev; return (<div className="mo" onClick={()=>setMod(null)}><div className="ml" onClick={e=>e.stopPropagation()}><button className="mc3" onClick={()=>setMod(null)}><Ic.XC/></button><div className="mlt">Upravit trenéra</div>
      <form onSubmit={e=>{e.preventDefault();const f=new FormData(e.target);editCoach(ev.id,{name:f.get('nm'),role:f.get('rl'),phone:f.get('ph'),email:f.get('em')})}}>
      <div className="fg"><label className="fl">Jméno</label><input name="nm" className="fi" defaultValue={ev.name} required/></div>
      <div className="fg"><label className="fl">Role</label><input name="rl" className="fi" defaultValue={ev.role||""}/></div>
      <div className="fg"><label className="fl">Telefon</label><input name="ph" type="tel" className="fi" defaultValue={ev.phone||""}/></div>
      <div className="fg"><label className="fl">E-mail</label><input name="em" type="email" className="fi" defaultValue={ev.email||""}/></div>
      <button type="submit" className="fs">Uložit</button></form></div></div>);}
    return null};

  const pages={home:pgHome,matches:pgMatches,trainings:pgTr,players:pgPl,coaches:pgCoaches,contacts:pgCt,news:pgNw,chat:pgChat,polls:pgPo,photos:pgPh,meetings:pgMeetings};

  return (
    <div><style>{S}</style>
      <div className="shell">
        <div className="rail">
          <div style={{color:tInfo.color,padding:'6px 0 4px',opacity:.9,flexShrink:0}}><Ic.Ball/></div>
          <div className="rdv"/>
          {nav.map(n=>(<div key={n.k}>{n.dv&&<div className="rdv"/>}<button className={`ri ${pg===n.k?'a':''}`} onClick={()=>go(n.k)}>{n.i}<span>{n.l}</span>{(bg[n.k]||0)>0&&<span className="bd">{bg[n.k]}</span>}</button></div>))}
          <div className="rft">
            <button onClick={()=>{setTeam(null);setAuth(false);setPg("home");setSelM(null);setSelMt(null)}} title="Změnit tým"><Ic.Grid/></button>
            <button onClick={()=>{setAuth(false);setPg("home");setSelM(null);setSelMt(null)}} title="Odhlásit"><Ic.Out/></button>
          </div>
        </div>
        <div className="cnt">
          <div className="top"><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:8,height:8,borderRadius:'50%',background:tInfo.color}}/><div style={{fontFamily:'var(--fd)',fontSize:13,textTransform:'uppercase'}}>{tInfo.name}</div></div><button className="hb" onClick={()=>{setNO(true);mAR()}}><Ic.Bell/>{uN>0&&<span className="dot"/>}</button></div>
          <div className="ms">{pages[pg]?pages[pg]():pgHome()}</div>
        </div>
      </div>
      {modals()}
      {viewPhoto&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',zIndex:260,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}} onClick={()=>setViewPhoto(null)}>
        <div style={{position:'absolute',top:12,right:12,left:12,display:'flex',justifyContent:'space-between',zIndex:2}}>
          <button onClick={()=>setViewPhoto(null)} style={{background:'rgba(255,255,255,.15)',border:'none',color:'#fff',padding:'8px 16px',borderRadius:20,fontSize:13,fontFamily:'var(--f)',fontWeight:600,cursor:'pointer'}}>← Zavřít</button>
          <button onClick={e=>{e.stopPropagation();if(viewPhoto.url)dlDoc({name:(viewPhoto.caption||"fotka")+".jpg",data:viewPhoto.url})}} style={{background:'rgba(255,255,255,.15)',border:'none',color:'#fff',padding:'8px 16px',borderRadius:20,fontSize:13,fontFamily:'var(--f)',fontWeight:600,cursor:'pointer'}}>⬇ Stáhnout</button>
        </div>
        {viewPhoto.url&&<img src={viewPhoto.url} alt="" style={{maxWidth:'95%',maxHeight:'80vh',borderRadius:8,objectFit:'contain'}} onClick={e=>e.stopPropagation()}/>}
        {viewPhoto.caption&&<div style={{color:'#fff',fontSize:13,marginTop:10,opacity:.8}}>{viewPhoto.caption}</div>}
      </div>}
      {nO&&<div className="np"><div style={{padding:14,borderBottom:'1px solid var(--b)',display:'flex',justifyContent:'space-between'}}><div style={{fontFamily:'var(--fd)',fontSize:14,textTransform:'uppercase'}}>Oznámení</div><button className="hb" onClick={()=>setNO(false)}><Ic.X/></button></div>
        {(T.notifications||[]).length===0&&<div className="es" style={{marginTop:30}}><p>Žádná oznámení</p></div>}
        {[...(T.notifications||[])].reverse().map(n=> <div style={{padding:'12px 14px',borderBottom:'1px solid var(--b)',display:'flex',gap:9,background:!n.read?'rgba(26,138,171,.08)':'transparent'}} key={n.id}><div style={{width:8,height:8,borderRadius:'50%',background:n.read?'var(--b2)':'var(--ac)',marginTop:5,flexShrink:0}}/><div><div style={{fontSize:12,color:'var(--t2)'}}>{n.text}</div><div style={{fontSize:10,color:'var(--t3)',marginTop:2}}>{fd(n.date)}</div></div></div>)}
      </div>}
    </div>
  );
}
