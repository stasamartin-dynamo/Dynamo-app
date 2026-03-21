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
const TEAMS=[{id:"a-tym",name:"A-Tým",color:"#0e7490",pin:"1166"},{id:"starsi-zaci",name:"Starší žáci",color:"#ca8a04",pin:"2266"},{id:"mladsi-zaci",name:"Mladší žáci",color:"#ea580c",pin:"3366"},{id:"starsi-pripravka",name:"Starší přípravka",color:"#7c3aed",pin:"4466"},{id:"mladsi-pripravka",name:"Mladší přípravka",color:"#16a34a",pin:"5566"},{id:"treneri",name:"Trenéři",color:"#475569",pin:"3385"},{id:"vybor",name:"Výbor",color:"#dc2626",pin:"9966"}];
const emptyTeam=()=>({badges:{},notifications:[],players:[],contacts:[],coaches:[],matches:[],trainings:[],news:[],chat:[],absences:[],polls:[],photos:[],meetings:[],votings:[],tasks:[]});
const compressImg=(file,maxW=800,quality=0.6)=>new Promise((res)=>{if(!file.type.startsWith('image/')){const r=new FileReader();r.onload=e=>res(e.target.result);r.readAsDataURL(file);return}const img=new Image();const r=new FileReader();r.onload=e=>{img.onload=()=>{const c=document.createElement('canvas');let w=img.width,h=img.height;if(w>maxW){h=h*(maxW/w);w=maxW}c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);res(c.toDataURL('image/jpeg',quality))};img.src=e.target.result};r.readAsDataURL(file)});
const thumbImg=(file,sz=120)=>new Promise((res)=>{if(!file.type.startsWith('image/')){res(null);return}const img=new Image();const r=new FileReader();r.onload=e=>{img.onload=()=>{const c=document.createElement('canvas');let w=img.width,h=img.height;const s=Math.min(sz/w,sz/h);c.width=w*s;c.height=h*s;c.getContext('2d').drawImage(img,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',0.5))};img.src=e.target.result};r.readAsDataURL(file)});
const DEF={teams:{},clubEvents:[]};
TEAMS.forEach(t=>{DEF.teams[t.id]=emptyTeam()});
DEF.teams["a-tym"].matches=[
{id:"am1",date:"2026-03-22",time:"15:00",opponent:"Týnec/Hrušky",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"am2",date:"2026-03-29",time:"15:00",opponent:"TJ Sokol Strachotín",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"am3",date:"2026-04-05",time:"10:00",opponent:"TJ Sokol Lanžhot B",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"am4",date:"2026-04-12",time:"15:30",opponent:"TJ Sokol Brumovice",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"am5",date:"2026-04-19",time:"16:00",opponent:"TJ Velké Bílovice B",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"am6",date:"2026-04-26",time:"16:00",opponent:"TJ Slavoj Podivín",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"am7",date:"2026-05-03",time:"15:30",opponent:"TJ Sokol Popice",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"am8",date:"2026-05-10",time:"16:30",opponent:"TJ Sokol Starovice",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"am9",date:"2026-05-16",time:"17:00",opponent:"Sokol Dolní Dunajovice",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"am10",date:"2026-05-24",time:"17:00",opponent:"Bavory/Mikulov B",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"am11",date:"2026-05-31",time:"16:00",opponent:"TJ Sokol Šitbořice",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"am12",date:"2026-06-07",time:"15:00",opponent:"SK Boleradice 1935",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"am13",date:"2026-06-13",time:"15:30",opponent:"TJ Sokol Pouzdřany",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""}
];
DEF.teams["mladsi-zaci"].players=[{id:"mz1",name:"Josef Grbavčic",number:0,position:"",birthYear:2014},{id:"mz2",name:"Dominik Staša",number:0,position:"",birthYear:2014},{id:"mz3",name:"Šimon Polepil",number:0,position:"",birthYear:2015},{id:"mz4",name:"Antonín Přeslička",number:0,position:"",birthYear:2014},{id:"mz5",name:"Marie Lišková",number:0,position:"",birthYear:2014},{id:"mz6",name:"Tomáš Rohrer",number:0,position:"",birthYear:2014},{id:"mz7",name:"Richard Vybíral",number:0,position:"",birthYear:2014},{id:"mz8",name:"Rudolf Bokora",number:0,position:"",birthYear:2015},{id:"mz9",name:"Miroslav Bystřický",number:0,position:"",birthYear:2015},{id:"mz10",name:"Jindřich Donné",number:0,position:"",birthYear:2015},{id:"mz11",name:"David Sedlák",number:0,position:"",birthYear:2015},{id:"mz12",name:"Michael Lípa",number:0,position:"",birthYear:2013},{id:"mz13",name:"Ondřej Kocman",number:0,position:"",birthYear:2013},{id:"mz14",name:"Pavel Lahvička",number:0,position:"",birthYear:2013},{id:"mz15",name:"Dmytro Mula",number:0,position:"",birthYear:2012}];
DEF.teams["mladsi-zaci"].matches=[
{id:"mzm1",date:"2026-04-05",time:"10:00",opponent:"TJ Starovičky",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"mzm2",date:"2026-04-26",time:"10:00",opponent:"Sokol Dolní Dunajovice",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"mzm3",date:"2026-05-02",time:"10:00",opponent:"Sokol Hrušky",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"mzm4",date:"2026-05-10",time:"11:30",opponent:"TJ Sokol Šitbořice",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"mzm5",date:"2026-05-16",time:"13:00",opponent:"SK Rakvice 1932",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"mzm6",date:"2026-05-24",time:"10:00",opponent:"FC Hustopeče B",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"mzm7",date:"2026-05-31",time:"10:00",opponent:"FK Valtice",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"mzm8",date:"2026-06-06",time:"10:00",opponent:"TJ Sokol Hlohovec",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"mzm0",date:"2026-03-28",time:"00:00",opponent:"SDM Aligators/Krumvíř",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""}
];
DEF.teams["starsi-zaci"].players=[
{id:"sz1",name:"Sofie Lukáčová",number:0,position:"",birthYear:2010},
{id:"sz2",name:"Lukáš Lečbych",number:0,position:"",birthYear:2011},
{id:"sz3",name:"Sára Lišková",number:0,position:"",birthYear:2011},
{id:"sz4",name:"Marek Polák",number:0,position:"",birthYear:2011},
{id:"sz5",name:"Vojtěch Přeslička",number:0,position:"",birthYear:2011},
{id:"sz6",name:"Jan Bošiak",number:0,position:"",birthYear:2012},
{id:"sz7",name:"Prokop Polepil",number:0,position:"",birthYear:2012},
{id:"sz8",name:"Jakub Přeslička",number:0,position:"",birthYear:2012},
{id:"sz9",name:"Dominik Woznica",number:0,position:"",birthYear:2012},
{id:"sz10",name:"Dmytro Mula",number:0,position:"",birthYear:2012},
{id:"sz11",name:"Adam Feitl",number:0,position:"",birthYear:2013},
{id:"sz12",name:"Ondřej Kocman",number:0,position:"",birthYear:2013},
{id:"sz13",name:"Dmytro Mula",number:0,position:"",birthYear:2012},
{id:"sz14",name:"Gópal Rubina",number:0,position:"",birthYear:2013},
{id:"sz15",name:"Michael Lípa",number:0,position:"",birthYear:2013},
{id:"sz16",name:"Josef Grbavčic",number:0,position:"",birthYear:2014},
{id:"sz17",name:"Dominik Staša",number:0,position:"",birthYear:2014},
{id:"sz18",name:"Šimon Polepil",number:0,position:"",birthYear:2015},
{id:"sz19",name:"Antonín Přeslička",number:0,position:"",birthYear:2014}
];
DEF.teams["starsi-zaci"].matches=[
{id:"szm1",date:"2026-03-22",time:"12:00",opponent:"SDM Valtice/Břeclav",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"szm2",date:"2026-04-01",time:"18:00",opponent:"TJ Sokol Pohořelice",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"szm3",date:"2026-04-04",time:"10:00",opponent:"SDM Krumvíř/Aligators",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"szm4",date:"2026-04-18",time:"14:45",opponent:"TJ Slavoj Velké Pavlovice",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"szm5",date:"2026-04-26",time:"13:45",opponent:"SK Rakvice 1932",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"szm6",date:"2026-05-10",time:"14:00",opponent:"TJ Sokol Popice",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"szm7",date:"2026-05-17",time:"11:00",opponent:"Sokol Dolní Dunajovice",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"szm8",date:"2026-05-24",time:"14:00",opponent:"SDM Kobylí/Bořetice",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"szm9",date:"2026-05-31",time:"13:45",opponent:"FC Hustopeče B/Šitbořice",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"szm10",date:"2026-06-07",time:"10:00",opponent:"SDM Velké Němčice/Nosislav",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"szm11",date:"2026-06-13",time:"10:00",opponent:"SDM Podluží/Tvrdonice",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""}
];
DEF.teams["starsi-pripravka"].players=[
{id:"sp1",name:"Viktorie Říhová",number:0,position:"",birthYear:2014},
{id:"sp2",name:"Ema Straubová",number:0,position:"",birthYear:2014},
{id:"sp3",name:"Štěpán Bejdák",number:0,position:"",birthYear:2015},
{id:"sp4",name:"Nikol Dudová",number:0,position:"",birthYear:2015},
{id:"sp5",name:"Tadeáš Lapčík",number:0,position:"",birthYear:2015},
{id:"sp6",name:"Matyáš Lukáč",number:0,position:"",birthYear:2015},
{id:"sp7",name:"Jakub Růžička",number:0,position:"",birthYear:2015},
{id:"sp8",name:"Terezie Tanasie",number:0,position:"",birthYear:2015},
{id:"sp9",name:"Denys Mula",number:0,position:"",birthYear:2015},
{id:"sp10",name:"Nela Chmelinová",number:0,position:"",birthYear:2015},
{id:"sp11",name:"Daniel Barták",number:0,position:"",birthYear:2016},
{id:"sp12",name:"Jakub Štěpaník",number:0,position:"",birthYear:2016},
{id:"sp13",name:"Richard Zajíček",number:0,position:"",birthYear:2016},
{id:"sp14",name:"Justýna Lukáčová",number:0,position:"",birthYear:2016}
];
DEF.teams["starsi-pripravka"].matches=[
{id:"spm1",date:"2026-04-04",time:"09:00",opponent:"TJ Sokol Pohořelice",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"spm2",date:"2026-04-12",time:"10:00",opponent:"TJ START Vlasatice",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"spm3",date:"2026-04-19",time:"14:00",opponent:"TJ Sokol Novosedly",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"spm4",date:"2026-05-02",time:"09:30",opponent:"Sokol Dolní Dunajovice",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"spm5",date:"2026-05-10",time:"09:00",opponent:"SK Vranovice",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"spm6",date:"2026-05-17",time:"15:00",opponent:"TJ Sokol Březí",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"spm7",date:"2026-05-24",time:"11:00",opponent:"FC Pálava Mikulov",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"spm8",date:"2026-05-30",time:"16:00",opponent:"TJ Sokol Velké Němčice",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""}
];
DEF.teams["mladsi-pripravka"].players=[
{id:"mp1",name:"Damián Bělíček",number:0,position:"",birthYear:2017},
{id:"mp2",name:"Lukáš Bláha",number:0,position:"",birthYear:2017},
{id:"mp3",name:"Adam Cvrkal",number:0,position:"",birthYear:2017},
{id:"mp4",name:"Erik Nguyen",number:0,position:"",birthYear:2017},
{id:"mp5",name:"Štěpán Skřivánek",number:0,position:"",birthYear:2017},
{id:"mp6",name:"Štěpán Tanasie",number:0,position:"",birthYear:2017},
{id:"mp7",name:"Antonín Woznica",number:0,position:"",birthYear:2017},
{id:"mp8",name:"Marek Bošiak",number:0,position:"",birthYear:2018},
{id:"mp9",name:"Jan Růžička",number:0,position:"",birthYear:2018},
{id:"mp10",name:"Patrik Kovář",number:0,position:"",birthYear:2019},
{id:"mp11",name:"Jan Ivičič",number:0,position:"",birthYear:2019}
];
DEF.teams["mladsi-pripravka"].matches=[
{id:"mpm1",date:"2026-04-04",time:"09:00",opponent:"TJ Sokol Pohořelice",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"mpm2",date:"2026-04-12",time:"10:00",opponent:"TJ START Vlasatice",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"mpm3",date:"2026-04-19",time:"14:00",opponent:"TJ Sokol Novosedly",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"mpm4",date:"2026-05-02",time:"09:30",opponent:"Sokol Dolní Dunajovice",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"mpm5",date:"2026-05-10",time:"09:00",opponent:"SK Vranovice",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"mpm6",date:"2026-05-17",time:"15:00",opponent:"TJ Sokol Březí",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"mpm7",date:"2026-05-24",time:"11:00",opponent:"FC Pálava Mikulov",location:"Domácí",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""},
{id:"mpm8",date:"2026-05-30",time:"16:00",opponent:"TJ Sokol Velké Němčice",location:"Venku",type:"Liga",result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:"Systém",editedBy:""}
];
DEF.teams["vybor"].contacts=[
{id:"vc1",name:"Josef Štyks",relation:"Člen výboru",phone:"",email:""},
{id:"vc2",name:"Pavel Štraub",relation:"Člen výboru",phone:"",email:""},
{id:"vc3",name:"Marek Polepil",relation:"Člen výboru",phone:"",email:""},
{id:"vc4",name:"Michal Kovář",relation:"Člen výboru",phone:"",email:""},
{id:"vc5",name:"Martin Staša",relation:"Člen výboru",phone:"",email:""},
{id:"vc6",name:"Zdenek Hanák",relation:"Člen výboru",phone:"",email:""},
{id:"vc7",name:"Jan Marek",relation:"Člen výboru",phone:"",email:""},
{id:"vc8",name:"Michal Mrenica",relation:"Člen výboru",phone:"",email:""},
{id:"vc9",name:"René Čapek",relation:"Člen výboru",phone:"",email:""},
{id:"vc10",name:"Roman Kurtin",relation:"Člen výboru",phone:"",email:""}
];
DEF.teams["starsi-zaci"].coaches=[
{id:"co_sz1",name:"Tibor Duda",role:"Trenér",phone:"+420 725 774 233",email:""},
{id:"co_sz2",name:"Michal Kovář",role:"Trenér",phone:"+420 734 618 212",email:""}
];
DEF.teams["mladsi-zaci"].coaches=[
{id:"co_mz1",name:"Marek Polepil",role:"Trenér",phone:"+420 728 175 973",email:""},
{id:"co_mz2",name:"Martin Staša",role:"Trenér",phone:"+420 606 781 875",email:""}
];
DEF.teams["starsi-pripravka"].coaches=[
{id:"co_sp1",name:"Petr Růžička",role:"Trenér",phone:"+420 737 540 351",email:""},
{id:"co_sp2",name:"Josef Beníček",role:"Trenér",phone:"+420 773 600 039",email:""}
];
DEF.teams["mladsi-pripravka"].coaches=[
{id:"co_mp1",name:"Bronislav Mitischka",role:"Trenér",phone:"+420 702 163 812",email:""},
{id:"co_mp2",name:"Josef Beníček",role:"Trenér",phone:"+420 773 600 039",email:""}
];
const Ic={Home:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,Cal:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,Ppl:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,Cup:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M18 2H6v7a6 6 0 0012 0V2z"/></svg>,Cam:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,Chat:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,XC:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,X:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,Plus:()=><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,Bk:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,Chk:()=><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,Del:()=><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,Pin:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>,Out:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,Bell:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,Book:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,Chart:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,Send:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,News:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>,Ball:()=><img src="/icon-small.png" width="30" height="30" style={{borderRadius:6}} alt=""/>,Grid:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,Meet:()=><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,Doc:()=><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>};
const LD=async()=>{return DEF};
const SV=async d=>{try{await setDoc(doc(db,"app","data"),d)}catch(e){console.error("Save error:",e)}};
const S=`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;500;700&family=Archivo+Black&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#daf0f7;--bg2:#c5e8f2;--bg3:#b0dcea;--cd:#ffffff;--cd2:#eef8fc;--ac:#1a8aab;--ac2:#15728e;--ag:rgba(26,138,171,.12);--g:#16a34a;--gb:rgba(22,163,74,.1);--r:#dc2626;--rb2:rgba(220,38,38,.1);--y:#ca8a04;--yb:rgba(202,138,4,.1);--o:#ea580c;--p:#7c3aed;--t:#0f2b3d;--t2:#3b6b82;--t3:#6a9bb2;--b:#b0dcea;--b2:#8ecadb;--rd:14px;--rs:10px;--f:'DM Sans',sans-serif;--fd:'Archivo Black',sans-serif}
body,html{font-family:var(--f);background:var(--bg);color:var(--t);height:100vh;-webkit-font-smoothing:antialiased;overflow:hidden}
.shell{display:flex;height:100vh;max-width:720px;margin:0 auto;background:var(--bg)}
.rail{width:82px;background:linear-gradient(180deg,#f8fafc,#f1f5f9);border-right:1px solid rgba(0,0,0,.08);display:flex;flex-direction:column;align-items:center;flex-shrink:0;overflow-y:auto;padding:8px 0;scrollbar-width:none;box-shadow:2px 0 16px rgba(0,0,0,.06)}
.rail::-webkit-scrollbar{display:none}
.rdv{width:32px;height:2px;background:rgba(0,0,0,.06);margin:5px 0;flex-shrink:0;border-radius:1px}
.ri{width:70px;display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 0 7px;color:var(--team-color,#6a9bb2);cursor:pointer;border:none;background:none;font-family:var(--f);font-size:10px;font-weight:800;position:relative;border-radius:12px;margin:1px 0;flex-shrink:0;transition:all .2s;letter-spacing:.4px;opacity:.45;text-transform:uppercase}
.ri:hover{opacity:.75;background:rgba(0,0,0,.04)}
.ri svg,.ri img{transform:scale(1.25)}
.ri.a{opacity:1;color:var(--team-color,#1a8aab);background:color-mix(in srgb,var(--team-color,#1a8aab) 12%,#fff);box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--team-color,#1a8aab) 25%,transparent),0 2px 8px color-mix(in srgb,var(--team-color,#1a8aab) 10%,transparent)}
.ri .bd{position:absolute;top:1px;right:2px;min-width:15px;height:15px;background:#ef4444;border-radius:8px;font-size:8px;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;padding:0 3px;border:2px solid #f8fafc}
.rft{margin-top:auto;padding:8px 0;flex-shrink:0;display:flex;flex-direction:column;gap:4px;align-items:center}
.rft button{background:none;border:none;color:#94a3b8;cursor:pointer;padding:8px;border-radius:10px;transition:all .2s}
.rft button:hover{color:#ef4444;background:rgba(239,68,68,.06)}
.cnt{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.top{padding:10px 16px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(90deg,#0c2d48,#0f3654);flex-shrink:0}
.hb{background:none;border:none;color:rgba(255,255,255,.6);cursor:pointer;padding:6px;position:relative;border-radius:8px}
.hb:hover{color:#fff}.hb .dot{position:absolute;top:3px;right:3px;width:8px;height:8px;background:#ef4444;border-radius:50%;border:2px solid #0c2d48}
.ms{flex:1;overflow-y:auto;padding:14px 16px}
.app-footer{text-align:center;padding:20px 10px 12px;font-size:9px;color:var(--t3);opacity:.5;letter-spacing:.3px}
.ph{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.pt{font-family:var(--fd);font-size:17px;text-transform:uppercase}
.ba{display:flex;align-items:center;gap:5px;background:var(--ag);color:var(--ac);border:1.5px solid rgba(26,138,171,.3);border-radius:var(--rs);padding:7px 11px;font-size:11px;font-weight:600;font-family:var(--f);cursor:pointer}
.c2{background:var(--cd);border:none;border-radius:16px;padding:14px;margin-bottom:10px;cursor:pointer;transition:all .2s;box-shadow:0 2px 10px rgba(14,116,144,.05)}
.c2:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(14,116,144,.1)}
.cr{display:flex;align-items:center;justify-content:space-between}
.ctt{font-weight:700;font-size:13px;margin-bottom:2px}.css2{font-size:11px;color:var(--t2)}
.tg{font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px;text-transform:uppercase;display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;letter-spacing:.3px;line-height:1}
.th{background:var(--gb);color:var(--g)}.ta{background:var(--yb);color:var(--y)}
.sg{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:7px;margin-bottom:14px}
.st{background:var(--cd);border:none;border-radius:12px;padding:10px 6px;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.9);transition:all .2s;position:relative;overflow:hidden;text-align:center}
.st::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--ac);opacity:.15;border-radius:12px 12px 0 0}
.st:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.1)}
.sn{font-family:var(--fd);font-size:20px;color:var(--ac);line-height:1;margin-bottom:2px;position:relative;z-index:1}
.sl{font-size:8px;color:var(--t3);text-transform:uppercase;letter-spacing:.3px;position:relative;z-index:1;font-weight:700}
.lb{font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-bottom:7px;margin-top:4px}
.pr{display:flex;align-items:center;gap:11px;padding:12px 14px;background:var(--cd);border:none;border-radius:16px;margin-bottom:8px;box-shadow:0 2px 8px rgba(14,116,144,.05);transition:all .2s}
.pr:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(14,116,144,.08)}
.pnn{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:var(--ag);color:var(--ac);border-radius:8px;font-family:var(--fd);font-size:13px}
.lf{background:linear-gradient(180deg,#15803d,#166534 50%,#14532d);border-radius:var(--rd);padding:0;margin-bottom:12px;position:relative;min-height:320px;overflow:hidden;touch-action:none;user-select:none}
.fr{display:flex;justify-content:space-evenly;margin-bottom:16px;position:relative;z-index:1}
.fp{display:flex;flex-direction:column;align-items:center;gap:2px;position:absolute;cursor:grab;z-index:2;touch-action:none}
.fp:active{cursor:grabbing}
.fc{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.92);color:#166534;font-family:var(--fd);font-size:11px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.3);transition:transform .1s;pointer-events:none}
.fp:active .fc{transform:scale(1.15)}
.fn{font-size:8px;color:rgba(255,255,255,.9);font-weight:600;text-align:center;max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;pointer-events:none;text-shadow:0 1px 3px rgba(0,0,0,.5)}
.lc{display:flex;flex-wrap:wrap;gap:6px}
.lch{padding:6px 11px;background:var(--bg);border:1.5px solid var(--b2);border-radius:20px;font-size:11px;font-family:var(--f);color:var(--t2);cursor:pointer}
.lch.s{background:var(--ag);border-color:var(--ac);color:var(--ac)}
.ib{background:var(--bg);border:1px solid var(--b2);border-radius:7px;padding:6px;color:var(--t3);cursor:pointer;display:flex;align-items:center}
.ib:hover{color:var(--t)}.ib.d:hover{color:var(--r);border-color:var(--r)}
.es{text-align:center;padding:30px 16px;color:var(--t3)}
.cx{display:flex;align-items:center;gap:11px;padding:12px 14px;background:var(--cd);border:none;border-radius:16px;margin-bottom:8px;box-shadow:0 2px 8px rgba(14,116,144,.05)}
.ca{width:40px;height:40px;border-radius:12px;background:var(--ag);color:var(--ac);display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-size:13px;flex-shrink:0}
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
.nw{background:var(--cd);border:none;border-radius:16px;padding:14px;margin-bottom:10px;position:relative;box-shadow:0 2px 8px rgba(14,116,144,.05)}
.nw.imp{border-left:4px solid var(--o)}.nw.pnd{border-left:4px solid var(--y)}
.pc{background:var(--cd);border:none;border-radius:16px;padding:14px;margin-bottom:10px;box-shadow:0 2px 8px rgba(14,116,144,.05)}
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
.LC{width:100%;max-width:340px;background:var(--cd);border:none;border-radius:20px;padding:28px 24px;position:relative;z-index:1;box-shadow:0 8px 30px rgba(14,116,144,.1)}
.PD{display:flex;gap:14px;justify-content:center;margin:24px 0 20px}
.PD div{width:18px;height:18px;border-radius:50%;border:2px solid var(--b2);transition:all .2s}
.PD .f{background:var(--ac);border-color:var(--ac);box-shadow:0 0 12px rgba(26,138,171,.3)}.PD .e{background:var(--r);border-color:var(--r)}
.KP{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;max-width:260px;margin:0 auto}
.KP button{padding:18px;background:var(--cd);border:1.5px solid var(--b2);border-radius:var(--rs);color:var(--t);font-size:22px;font-family:var(--fd);cursor:pointer;text-align:center;user-select:none}
.KP button:active{background:var(--ag);border-color:var(--ac);transform:scale(.95)}
.KP .x{visibility:hidden}.KP .bk{font-size:14px;font-family:var(--f);font-weight:600;color:var(--t2)}
.ts-screen{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;background:linear-gradient(170deg,#c5e8f2,#daf0f7 40%,#b0dcea);overflow:auto;position:relative}
.ts-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;max-width:380px}
.ts-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:16px 10px;background:var(--cd);border:none;border-radius:16px;cursor:pointer;transition:all .25s;width:100%;text-align:center;font-family:var(--f);color:var(--t);box-shadow:0 2px 12px rgba(14,116,144,.08);position:relative;overflow:hidden;aspect-ratio:1}
.ts-btn::before{content:'';position:absolute;top:0;left:0;width:100%;height:4px;border-radius:0 0 4px 4px;transition:height .25s}
.ts-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(14,116,144,.15)}
.ts-btn:hover::before{height:6px}
.ts-btn:active{transform:translateY(0)}
.ts-dot{width:44px;height:44px;border-radius:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-size:18px;color:#fff;font-weight:900}
.ts-name{font-weight:700;font-size:13px;letter-spacing:-.3px}
.ts-sub{font-size:10px;color:var(--t3);margin-top:2px;display:flex;align-items:center;gap:6px;justify-content:center}
.ts-sub span{display:flex;align-items:center;gap:3px}
.att{margin-top:10px;padding:10px;background:var(--bg);border-radius:var(--rs)}
.att-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--b)}
.att-row:last-child{border-bottom:none}
.att-cb{width:20px;height:20px;accent-color:var(--ac);cursor:pointer}
.att-name{font-size:12px;font-weight:500;flex:1}
.doc-list{margin-top:8px;display:flex;flex-wrap:wrap;gap:6px}
.doc-item{display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--cd);border:1px solid var(--b);border-radius:16px;font-size:11px;color:var(--ac)}
.ce-panel{width:100%;max-width:380px;margin-top:12px}
.ce-card{background:var(--cd);border-radius:14px;padding:12px 14px;margin-bottom:8px;box-shadow:0 2px 10px rgba(14,116,144,.06);position:relative;display:flex;gap:12px;align-items:center;cursor:pointer;transition:all .2s;border-left:4px solid var(--ac)}
.ce-card:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(14,116,144,.1)}
.ce-card .ce-title{font-weight:700;font-size:12px;margin-bottom:2px}
.ce-card .ce-date{font-size:10px;color:var(--t3)}
.ce-card .ce-desc{font-size:11px;color:var(--t2);margin-top:3px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.ce-more{text-align:center;padding:6px;font-size:11px;color:var(--ac);font-weight:600;cursor:pointer;font-family:var(--f)}
.ce-dots{display:flex;gap:4px;justify-content:center;margin-top:4px}
.ce-dots span{width:6px;height:6px;border-radius:50%;background:var(--b2)}
.ce-dots span.a{background:var(--ac)}
`;

export default function App() {
  const [D,setD]=useState(null);const [ok,setOk]=useState(false);const [auth,setAuth]=useState(false);
  const [team,setTeam]=useState(null);const [pg,setPg]=useState("home");const [mod,setMod]=useState(null);
  const [selM,setSelM]=useState(null);const [selMt,setSelMt]=useState(null);const [selVt,setSelVt]=useState(null);const [selTk,setSelTk]=useState(null);const [pin,setPin]=useState("");
  const [pE,setPE]=useState(false);const [nO,setNO]=useState(false);const [me,setMe]=useState("");
  const [ci,setCi]=useState("");const [viewPhoto,setViewPhoto]=useState(null);const [plTab,setPlTab]=useState("list");const [showPitch,setShowPitch]=useState(false);const [ceMod,setCeMod]=useState(null);const [ceAll,setCeAll]=useState(false);const [ceDetail,setCeDetail]=useState(null);const ce=useRef(null);

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

  const cEvents=(D.clubEvents||[]).sort((a,b)=>b.date.localeCompare(a.date));
  const addCE=(ev)=>{save({...D,clubEvents:[...(D.clubEvents||[]),{...ev,id:"ce_"+uid(),date:now(),docs:[]}]});setCeMod(null)};
  const editCE=(ceId,updates)=>{save({...D,clubEvents:(D.clubEvents||[]).map(e=>e.id===ceId?{...e,...updates}:e)});setCeMod(null)};
  const delCE=(id)=>{if(!window.confirm("Opravdu chcete odstranit událost?"))return;save({...D,clubEvents:(D.clubEvents||[]).filter(e=>e.id!==id)})};
  const addDocToCE=(ceId,doc)=>save({...D,clubEvents:(D.clubEvents||[]).map(e=>e.id===ceId?{...e,docs:[...(e.docs||[]),doc]}:e)});
  const delDocFromCE=(ceId,docIdx)=>{if(!window.confirm("Opravdu chcete odstranit soubor?"))return;save({...D,clubEvents:(D.clubEvents||[]).map(e=>e.id===ceId?{...e,docs:(e.docs||[]).filter((_,i)=>i!==docIdx)}:e)});};
  const fd0=d=>{try{return new Date(d.includes?.('T')?d:d+"T00:00:00").toLocaleDateString('cs-CZ',{weekday:'short',day:'numeric',month:'short'})}catch{return d}};
  const dlDoc0=(doc)=>{try{const parts=doc.data.split(',');const mime=parts[0].match(/:(.*?);/)[1];const bin=atob(parts[1]);const arr=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);const blob=new Blob([arr],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=doc.name;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url)}catch(e){console.error(e)}};
  const openDoc0=(doc)=>{const w=window.open('','_blank');if(w){w.document.write('<!DOCTYPE html><html><head><title>'+doc.name+'</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:sans-serif;background:#f0f0f0}.bar{padding:10px 16px;background:#fff;border-bottom:1px solid #ddd;display:flex;gap:12px;align-items:center;position:sticky;top:0;z-index:10}.bar button{color:#1a8aab;font-weight:600;font-size:14px;background:none;border:none;cursor:pointer}.cnt{padding:16px;text-align:center}</style></head><body><div class="bar"><button onclick="window.close()">← Zavřít</button><span style="color:#666;font-size:13px">'+doc.name+'</span></div><div class="cnt">'+(doc.data.startsWith('data:image')?'<img src="'+doc.data+'" style="max-width:100%;border-radius:8px"/>':'<iframe src="'+doc.data+'" style="width:100%;height:85vh;border:none;border-radius:8px"></iframe>')+'</div></body></html>');w.document.close()}};

  const hp=d=>{setPE(false);if(d==="back"){setPin(p=>p.slice(0,-1));return}const n=pin+d;setPin(n);if(n.length===4){const tPin=TEAMS.find(t=>t.id===team)?.pin;if(n===tPin){setAuth(true);setPin("")}else{setPE(true);setTimeout(()=>{setPin("");setPE(false)},600)}}};

  if(!team) return (
    <div><style>{S}</style><div className="ts-screen" style={{justifyContent:'flex-start',paddingTop:20}}>
      <div style={{textAlign:'center',flexShrink:0}}><img src="/icon-192.png" width="56" height="56" style={{borderRadius:14,marginBottom:6}} alt=""/><div style={{fontFamily:'var(--fd)',fontSize:20,textTransform:'uppercase'}}>TJ Dynamo</div><div style={{fontFamily:'var(--fd)',fontSize:11,color:'var(--t2)',textTransform:'uppercase',letterSpacing:3}}>Drnholec</div></div>

      {ceDetail?(()=>{const liveEv=(D.clubEvents||[]).find(e=>e.id===ceDetail.id)||ceDetail; return <div style={{width:'100%',maxWidth:380,marginTop:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <button style={{display:'flex',alignItems:'center',gap:5,color:'var(--ac)',fontSize:12,fontWeight:600,fontFamily:'var(--f)',background:'none',border:'none',cursor:'pointer'}} onClick={()=>setCeDetail(null)}><Ic.Bk/> Zpět</button>
          <button className="ba" style={{fontSize:10}} onClick={()=>setCeMod({type:"editCE",ev:liveEv})}>✎ Upravit</button>
        </div>
        <div style={{background:'var(--cd)',borderRadius:16,padding:16,boxShadow:'0 2px 12px rgba(14,116,144,.08)'}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{liveEv.title}</div>
          <div style={{fontSize:10,color:'var(--t3)',marginBottom:8}}>{fd0(liveEv.date)} · {liveEv.createdBy||""}</div>
          {liveEv.description&&<div style={{fontSize:12,color:'var(--t2)',lineHeight:1.5,marginBottom:10}}>{liveEv.description}</div>}
          <div style={{fontSize:10,fontWeight:700,color:'var(--t3)',textTransform:'uppercase',marginBottom:6}}>Dokumenty / Fotky ({(liveEv.docs||[]).length})</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:8}}>{(liveEv.docs||[]).filter(d=>d.data?.startsWith('data:image')).map((d,i)=> <div key={"img"+i} style={{position:'relative'}}><img src={d.data} alt="" style={{width:80,height:80,borderRadius:10,objectFit:'cover',cursor:'pointer'}} onClick={()=>openDoc0(d)}/><button onClick={()=>delDocFromCE(liveEv.id,(liveEv.docs||[]).indexOf(d))} style={{position:'absolute',top:-4,right:-4,width:18,height:18,borderRadius:'50%',background:'var(--r)',border:'2px solid var(--cd)',color:'#fff',fontSize:10,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>✕</button></div>)}</div>
          <div className="doc-list">{(liveEv.docs||[]).filter(d=>!d.data?.startsWith('data:image')).map((d,i)=>{const ri=(liveEv.docs||[]).indexOf(d); return <div key={i} style={{display:'flex',alignItems:'center',gap:4}}>
            <button onClick={()=>openDoc0(d)} className="doc-item" style={{cursor:'pointer',border:'1px solid var(--b)',background:'var(--cd)'}}><Ic.Doc/> {d.name}</button>
            <button onClick={()=>dlDoc0(d)} style={{fontSize:10,color:'var(--ac)',padding:'4px 8px',background:'var(--ag)',borderRadius:12,border:'none',cursor:'pointer'}}>⬇</button>
            <button onClick={()=>delDocFromCE(liveEv.id,ri)} style={{fontSize:10,color:'var(--r)',padding:'4px 8px',background:'rgba(220,38,38,.08)',borderRadius:12,border:'none',cursor:'pointer'}}>✕</button>
          </div>})}</div>
          <div style={{marginTop:8}}><label className="ba" style={{cursor:'pointer',display:'inline-flex'}}><Ic.Plus/> Přidat soubor<input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" style={{display:'none'}} onChange={async e=>{const f=e.target.files[0];if(!f)return;const data=await compressImg(f);const thumb=await thumbImg(f);addDocToCE(liveEv.id,{name:f.name,data,thumb});e.target.value=""}}/></label></div>
        </div>
      </div>})()

      :(<><div className="ce-panel" style={{flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--t3)',textTransform:'uppercase',letterSpacing:1}}>Klubové události</div>
          <button className="ba" style={{fontSize:10,padding:'4px 10px'}} onClick={()=>setCeMod(true)}><Ic.Plus/></button>
        </div>
        {cEvents.length===0&&<div style={{textAlign:'center',fontSize:11,color:'var(--t3)',padding:10}}>Žádné události</div>}
        {(ceAll?cEvents:cEvents.slice(0,2)).map(ev=>{const firstImg=(ev.docs||[]).find(d=>d.thumb||d.data?.startsWith('data:image'));const thumbSrc=firstImg?.thumb||firstImg?.data; return <div className="ce-card" key={ev.id} onClick={()=>setCeDetail(ev)}>
          {thumbSrc?<img src={thumbSrc} alt="" style={{width:40,height:40,borderRadius:8,objectFit:'cover',flexShrink:0}}/>:<div style={{width:36,height:36,borderRadius:10,background:'var(--ag)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'var(--ac)',fontSize:16}}>📢</div>}
          <div style={{flex:1,minWidth:0}}><div className="ce-title">{ev.title}</div><div className="ce-date">{fd0(ev.date)}{(ev.docs||[]).length>0&&<span> · 📎 {(ev.docs||[]).length}</span>}</div>
          {ev.description&&<div className="ce-desc">{ev.description}</div>}</div>
          <button className="ib d" onClick={e=>{e.stopPropagation();delCE(ev.id)}} style={{padding:3,flexShrink:0}}><Ic.Del/></button>
        </div>})}
        {cEvents.length>2&&!ceAll&&<div className="ce-more" onClick={()=>setCeAll(true)}>Zobrazit dalších {cEvents.length-2} ▾</div>}
        {ceAll&&cEvents.length>2&&<div className="ce-more" onClick={()=>setCeAll(false)}>Skrýt ▴</div>}
      </div>

      <div style={{fontSize:11,fontWeight:700,color:'var(--t3)',textTransform:'uppercase',letterSpacing:1,width:'100%',maxWidth:380,marginBottom:8,marginTop:4}}>Klubové kategorie</div>
      {(()=>{const mkBtn=(t,icon)=>{const cnt=t.id==="vybor"?(D.teams[t.id]?.contacts||[]).length:t.id==="treneri"?(D.teams[t.id]?.tasks||[]).length:(D.teams[t.id]?.players||[]).length;const evCnt=t.id==="vybor"||t.id==="treneri"?0:(D.teams[t.id]?.matches||[]).length+(D.teams[t.id]?.trainings||[]).length;const lbl=t.id==="vybor"?"členů":t.id==="treneri"?"zápisů":"";return{t,icon,cnt,evCnt,lbl}};
      const rows=[[mkBtn(TEAMS.find(x=>x.id==="starsi-zaci"),"SŽ"),mkBtn(TEAMS.find(x=>x.id==="mladsi-zaci"),"MŽ")],[mkBtn(TEAMS.find(x=>x.id==="starsi-pripravka"),"SP"),mkBtn(TEAMS.find(x=>x.id==="mladsi-pripravka"),"MP")]];
      const aTym=mkBtn(TEAMS.find(x=>x.id==="a-tym"),"A");
      const vybor=mkBtn(TEAMS.find(x=>x.id==="vybor"),"V");
      const treneri=mkBtn(TEAMS.find(x=>x.id==="treneri"),"T");
      const SqBtn=({d})=><button className="ts-btn" style={{"--tc":d.t.color}} onClick={()=>{setTeam(d.t.id);setAuth(false);setPin("");setPg("home")}}>
        <div style={{position:'absolute',top:0,left:0,width:'100%',height:4,background:d.t.color,borderRadius:'0 0 4px 4px'}}/>
        <div className="ts-dot" style={{background:d.t.color}}>{d.icon}</div>
        <div><div className="ts-name">{d.t.name}</div><div className="ts-sub"><span>👥 {d.cnt}</span>{d.evCnt>0&&<span>📅 {d.evCnt}</span>}</div></div>
      </button>;
      const SmBtn=({d})=><button style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'var(--cd)',border:'none',borderRadius:14,cursor:'pointer',fontFamily:'var(--f)',color:'var(--t)',boxShadow:'0 2px 10px rgba(0,0,0,.06)',position:'relative',overflow:'hidden',transition:'all .2s',textAlign:'left',width:'100%',flex:1}} onClick={()=>{setTeam(d.t.id);setAuth(false);setPin("");setPg("home")}}>
        <div style={{position:'absolute',top:0,left:0,width:'100%',height:3,background:d.t.color}}/>
        <div style={{width:32,height:32,borderRadius:10,background:d.t.color,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--fd)',fontSize:14,color:'#fff',fontWeight:900,flexShrink:0}}>{d.icon}</div>
        <div><div style={{fontWeight:700,fontSize:12}}>{d.t.name}</div><div style={{fontSize:9,color:'var(--t3)'}}>{d.cnt} {d.lbl}</div></div>
      </button>;
      return <div style={{width:'100%',maxWidth:380,flexShrink:0}}>
        {rows.map((row,ri)=><div key={ri} className="ts-grid" style={{marginBottom:8}}>{row.map(d=><SqBtn key={d.t.id} d={d}/>)}</div>)}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          <button className="ts-btn" style={{"--tc":aTym.t.color}} onClick={()=>{setTeam("a-tym");setAuth(false);setPin("");setPg("home")}}>
            <div style={{position:'absolute',top:0,left:0,width:'100%',height:4,background:aTym.t.color,borderRadius:'0 0 4px 4px'}}/>
            <div className="ts-dot" style={{background:aTym.t.color}}>A</div>
            <div><div className="ts-name">{aTym.t.name}</div><div className="ts-sub"><span>👥 {aTym.cnt}</span><span>📅 {aTym.evCnt}</span></div></div>
          </button>
          <div style={{display:'flex',flexDirection:'column',gap:8,minHeight:0}}>
            <SmBtn d={vybor}/>
            <SmBtn d={treneri}/>
          </div>
        </div>
      </div>})()}</>)}

      {ceMod&&<div className="mo" onClick={()=>setCeMod(null)}><div className="ml" onClick={e=>e.stopPropagation()}><button className="mc3" onClick={()=>setCeMod(null)}><Ic.XC/></button>
        {ceMod?.type==="editCE"?(<><div className="mlt">Upravit událost</div>
        <form onSubmit={e=>{e.preventDefault();const f=new FormData(e.target);editCE(ceMod.ev.id,{title:f.get('ti'),description:f.get('ds'),createdBy:f.get('fr')})}}>
        <div className="fg"><label className="fl">Název události</label><input name="ti" className="fi" defaultValue={ceMod.ev.title} required/></div>
        <div className="fg"><label className="fl">Popis</label><textarea name="ds" className="fi ft2" defaultValue={ceMod.ev.description||""}/></div>
        <div className="fg"><label className="fl">Autor</label><input name="fr" className="fi" defaultValue={ceMod.ev.createdBy||""} required/></div>
        <button type="submit" className="fs">Uložit změny</button>
        </form></>)
        :(<><div className="mlt">Nová událost klubu</div>
        <form onSubmit={e=>{e.preventDefault();const f=new FormData(e.target);addCE({title:f.get('ti'),description:f.get('ds'),createdBy:f.get('fr')})}}>
        <div className="fg"><label className="fl">Název události</label><input name="ti" className="fi" required/></div>
        <div className="fg"><label className="fl">Popis</label><textarea name="ds" className="fi ft2"/></div>
        <div className="fg"><label className="fl">Autor</label><input name="fr" className="fi" required/></div>
        <button type="submit" className="fs">Vytvořit událost</button>
        </form></>)}
      </div></div>}
    </div></div>
  );

  if(!auth) return (
    <div><style>{S}</style><div className="LS">
      <img src="/icon-192.png" width="64" height="64" style={{borderRadius:16,marginBottom:16}} alt=""/>
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
  const isTr=team==="treneri";
  const T={...emptyTeam(),...(D.teams[team]||{})};
  const tInfo=TEAMS.find(t=>t.id===team)||TEAMS[0];
  const saveT=nd=>{save({...D,teams:{...D.teams,[team]:nd}})};
  const bg=T.badges||{};
  const aB=s=>({...bg,[s]:(bg[s]||0)+1});
  const cB=s=>{if((bg[s]||0)>0)saveT({...T,badges:{...bg,[s]:0}})};
  const nt=(txt,s)=>{try{navigator.setAppBadge&&navigator.setAppBadge(1)}catch{};return {notifications:[...(T.notifications||[]),{id:"n_"+uid(),date:now(),text:txt,read:false}],badges:aB(s)}};
  const fd=d=>{try{return new Date(d.includes?.('T')?d:d+"T00:00:00").toLocaleDateString('cs-CZ',{weekday:'short',day:'numeric',month:'short'})}catch{return d}};
  const ts=d=>{try{return new Date(d).toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'})}catch{return''}};
  const go=p=>{setPg(p);setSelM(null);setSelMt(null);setSelVt(null);setSelTk(null);cB(p)};
  const del=(k,i)=>{if(!window.confirm("Opravdu chcete odstranit?"))return;saveT({...T,[k]:(T[k]||[]).filter(x=>x.id!==i)});};

  const addM=m=>{const n=nt("Zápas: "+m.opponent,"matches");saveT({...T,...n,matches:[...T.matches,{...m,id:"m_"+uid(),result:null,lineup:[],attendance:{},excuses:{},done:false,createdBy:me||"?",editedBy:""}]});setMod(null)};
  const addTr=t=>{const n=nt("Trénink: "+t.focus,"trainings");saveT({...T,...n,trainings:[...T.trainings,{...t,id:"t_"+uid(),attendance:{},excuses:{},done:false,createdBy:me||"?",editedBy:""}]});setMod(null)};
  const addPl=p=>{const n=nt("Hráč: "+p.name,"players");saveT({...T,...n,players:[...T.players,{...p,id:"p_"+uid()}]});setMod(null)};
  const addCt=c=>{const n=nt("Kontakt: "+c.name,"contacts");saveT({...T,...n,contacts:[...T.contacts,{...c,id:"c_"+uid()}]});setMod(null)};
  const editPl=(pid,u)=>{saveT({...T,players:T.players.map(p=>p.id===pid?{...p,...u}:p)});setMod(null)};
  const editCt=(cid,u)=>{saveT({...T,contacts:T.contacts.map(c=>c.id===cid?{...c,...u}:c)});setMod(null)};
  const addCoach=c=>{const n=nt("Trenér: "+c.name,"coaches");saveT({...T,...n,coaches:[...T.coaches,{...c,id:"co_"+uid()}]});setMod(null)};
  const editCoach=(cid,u)=>{saveT({...T,coaches:T.coaches.map(c=>c.id===cid?{...c,...u}:c)});setMod(null)};
  const togFee=(pid)=>{saveT({...T,players:T.players.map(p=>p.id===pid?{...p,feePaid:!p.feePaid}:p)})};
  const addNw=a=>{const n=nt("Aktualita: "+a.title,"news");saveT({...T,...n,news:[{...a,id:"nw_"+uid(),date:now(),pinned:false},...T.news]});setMod(null)};
  const sChat=(tx,f)=>{if(!tx.trim()||!f.trim())return;const n=nt(f+": "+tx.substring(0,30),"chat");saveT({...T,...n,chat:[...T.chat,{id:"ch_"+uid(),ts:now(),from:f,text:tx}]});setCi("")};
  const addAb=a=>{const n=nt("Omluvenka: "+a.playerName,"absences");saveT({...T,...n,absences:[...T.absences,{...a,id:"a_"+uid(),date:td(),status:"pending"}]});setMod(null)};
  const addPo=p=>{const n=nt("Anketa: "+p.question,"polls");saveT({...T,...n,polls:[{...p,id:"po_"+uid(),date:td(),active:true},...T.polls]});setMod(null)};
  const addMeet=m=>{const n=nt("Schůze: "+m.topic,"meetings");saveT({...T,...n,meetings:[{...m,id:"mt_"+uid(),attendance:{},excuses:{},docs:[],done:false,createdBy:me||"?",editedBy:""},...T.meetings]});setMod(null)};
  const addVoting=v=>{const n=nt("Hlasování: "+v.topic,"votings");saveT({...T,...n,votings:[{...v,id:"vt_"+uid(),date:td(),votes:{},excuses:{},docs:[],done:false,createdBy:me||"?",editedBy:""},...(T.votings||[])]});setMod(null)};
  const setVote=(vtId,name,val)=>{saveT({...T,votings:(T.votings||[]).map(v=>v.id===vtId?{...v,votes:{...(v.votes||{}),[name]:val}}:v)})};
  const setVExcuse=(vtId,name,reason)=>{saveT({...T,votings:(T.votings||[]).map(v=>v.id===vtId?{...v,excuses:{...(v.excuses||{}),[name]:reason}}:v)})};
  const addDocToVoting=(vtId,doc)=>{saveT({...T,votings:(T.votings||[]).map(v=>v.id===vtId?{...v,docs:[...(v.docs||[]),doc]}:v)})};
  const togVoteDone=(vtId)=>{saveT({...T,votings:(T.votings||[]).map(v=>v.id===vtId?{...v,done:!v.done}:v)})};
  const addTask=(t)=>{saveT({...T,tasks:[{...t,id:"tk_"+uid(),date:now(),subtasks:[],createdBy:me||"?"},...(T.tasks||[])]});setMod(null)};
  const editTask=(tkId,updates)=>{saveT({...T,tasks:(T.tasks||[]).map(t=>t.id===tkId?{...t,...updates}:t)});setMod(null)};
  const delTask=(tkId)=>{if(!window.confirm("Opravdu smazat zápis?"))return;saveT({...T,tasks:(T.tasks||[]).filter(t=>t.id!==tkId)})};
  const addSubtask=(tkId,st)=>{saveT({...T,tasks:(T.tasks||[]).map(t=>t.id===tkId?{...t,subtasks:[...(t.subtasks||[]),{...st,id:"st_"+uid(),status:"přiděleno"}]}:t)});setMod(null)};
  const setSubStatus=(tkId,stId,status)=>{saveT({...T,tasks:(T.tasks||[]).map(t=>t.id===tkId?{...t,subtasks:(t.subtasks||[]).map(s=>s.id===stId?{...s,status}:s)}:t)})};
  const delSubtask=(tkId,stId)=>{if(!window.confirm("Opravdu smazat úkol?"))return;saveT({...T,tasks:(T.tasks||[]).map(t=>t.id===tkId?{...t,subtasks:(t.subtasks||[]).filter(s=>s.id!==stId)}:t)})};
  const togDone=(kind,evId)=>{saveT({...T,[kind]:T[kind].map(e=>e.id===evId?{...e,done:!e.done}:e)})};
  const editEv=(kind,evId,updates)=>{saveT({...T,[kind]:T[kind].map(e=>e.id===evId?{...e,...updates,editedBy:me||"?"}:e)});setMod(null)};
  const sLU=(mi,pi)=>saveT({...T,matches:T.matches.map(m=>m.id===mi?{...m,lineup:pi}:m)});
  const sLP=(mi,pos)=>saveT({...T,matches:T.matches.map(m=>m.id===mi?{...m,lineupPos:{...(m.lineupPos||{}),...pos}}:m)});
  const pName=(p)=>{const parts=p.name.split(' ');return parts.length>1?parts[0]+' '+parts[parts.length-1][0]+'.':parts[0]};
  const sR=(mi,r)=>saveT({...T,matches:T.matches.map(m=>m.id===mi?{...m,result:r}:m)});
  const tPN=i=>saveT({...T,news:T.news.map(a=>a.id===i?{...a,pinned:!a.pinned}:a)});
  const apA=i=>saveT({...T,absences:T.absences.map(a=>a.id===i?{...a,status:"approved"}:a)});
  const vP=(pi,ix)=>{const name=window.prompt("Zadejte své příjmení pro hlasování:");if(!name||!name.trim())return;const nm=name.trim();const poll=T.polls.find(p=>p.id===pi);if(poll&&(poll.voters||[]).includes(nm)){window.alert("Uživatel "+nm+" již hlasoval v této anketě.");return}saveT({...T,polls:T.polls.map(p=>p.id===pi?{...p,options:p.options.map((o,i)=>i===ix?{...o,votes:o.votes+1}:o),voters:[...(p.voters||[]),nm]}:p)})};
  const togAtt=(kind,evId,name,val)=>{saveT({...T,[kind]:T[kind].map(e=>e.id===evId?{...e,attendance:{...(e.attendance||{}),[name]:val}}:e)})};
  const setExcuse=(kind,evId,name,reason)=>{saveT({...T,[kind]:T[kind].map(e=>e.id===evId?{...e,excuses:{...(e.excuses||{}),[name]:reason}}:e)})};
  const addDocToMeet=(mtId,doc)=>{saveT({...T,meetings:T.meetings.map(m=>m.id===mtId?{...m,docs:[...(m.docs||[]),doc]}:m)})};
  const dlDoc=(doc)=>{try{const parts=doc.data.split(',');const mime=parts[0].match(/:(.*?);/)[1];const bin=atob(parts[1]);const arr=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);const blob=new Blob([arr],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=doc.name;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url)}catch(e){console.error(e)}};
  const openDoc=(doc)=>{const w=window.open('','_blank');if(w){w.document.write('<!DOCTYPE html><html><head><title>'+doc.name+'</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:sans-serif;background:#f0f0f0}.bar{padding:10px 16px;background:#fff;border-bottom:1px solid #ddd;display:flex;gap:12px;align-items:center;position:sticky;top:0;z-index:10}.bar button,.bar a{color:#1a8aab;text-decoration:none;font-weight:600;font-size:14px;background:none;border:none;cursor:pointer}.cnt{padding:16px;text-align:center}</style></head><body><div class="bar"><button onclick="window.close()">← Zavřít</button><span style="color:#666;font-size:13px">'+doc.name+'</span></div><div class="cnt">'+(doc.data.startsWith('data:image')?'<img src="'+doc.data+'" style="max-width:100%;border-radius:8px"/>':'<iframe src="'+doc.data+'" style="width:100%;height:85vh;border:none;border-radius:8px"></iframe>')+'</div></body></html>');w.document.close()}};
  const mAR=()=>{try{navigator.clearAppBadge&&navigator.clearAppBadge()}catch{};saveT({...T,notifications:(T.notifications||[]).map(n=>({...n,read:true}))})};
  const uN=(T.notifications||[]).filter(n=>!n.read).length;
  const nxM=(T.matches||[]).filter(m=>!m.done).sort((a,b)=>a.date.localeCompare(b.date))[0];
  const nxT=(T.trainings||[]).filter(t=>!t.done).sort((a,b)=>a.date.localeCompare(b.date))[0];
  const nxMt=isV?(T.meetings||[]).filter(m=>!m.done).sort((a,b)=>a.date.localeCompare(b.date))[0]:null;
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

  const navTeam=[{k:"home",l:"Nástěnka",i: <Ic.Home/>},{k:"news",l:"Aktuality",i: <Ic.News/>},{k:"chat",l:"Chat",i: <Ic.Chat/>},{k:"matches",l:"Zápasy",i: <Ic.Cup/>,dv:true},{k:"trainings",l:"Tréninky",i: <Ic.Cal/>},{k:"players",l:"Hráči",i: <Ic.Ppl/>,dv:true},{k:"coaches",l:"Trenéři",i: <Ic.Meet/>},{k:"polls",l:"Ankety",i: <Ic.Chart/>,dv:true},{k:"photos",l:"Fotky",i: <Ic.Cam/>}];
  const navVybor=[{k:"home",l:"Nástěnka",i: <Ic.Home/>},{k:"contacts",l:"Členové",i: <Ic.Ppl/>},{k:"meetings",l:"Schůze",i: <Ic.Meet/>,dv:true},{k:"votings",l:"Hlasování",i: <Ic.Chart/>},{k:"chat",l:"Chat",i: <Ic.Chat/>,dv:true},{k:"polls",l:"Ankety",i: <Ic.Chart/>}];
  const navTreneri=[{k:"home",l:"Nástěnka",i: <Ic.Home/>},{k:"tasks",l:"Zápis",i: <Ic.Cal/>},{k:"chat",l:"Chat",i: <Ic.Chat/>,dv:true},{k:"polls",l:"Ankety",i: <Ic.Chart/>}];
  const nav=isTr?navTreneri:isV?navVybor:navTeam;

  const pgHome=()=>{
    const doneM=(T.matches||[]).filter(m=>m.done).sort((a,b)=>b.date.localeCompare(a.date));
    const doneTr=(T.trainings||[]).filter(t=>t.done).sort((a,b)=>b.date.localeCompare(a.date));
    const doneMt=isV?(T.meetings||[]).filter(m=>m.done).sort((a,b)=>b.date.localeCompare(a.date)):[];
    const doneVt=isV?(T.votings||[]).filter(v=>v.done).sort((a,b)=>b.date.localeCompare(a.date)):[];
    const doneSt=isTr?(T.tasks||[]).flatMap(t=>(t.subtasks||[]).filter(s=>s.status==="hotovo").map(s=>({...s,_k:"subtask",_parent:t.title}))):[];
    const allDone=[...doneM.map(d=>({...d,_k:"match"})),...doneTr.map(d=>({...d,_k:"train"})),...doneMt.map(d=>({...d,_k:"meet"})),...doneVt.map(d=>({...d,_k:"vote"})),...doneSt].sort((a,b)=>(b.date||"").localeCompare(a.date||""));
    const mR=doneM.filter(m=>m.result);
    let wins=0,draws=0,losses=0,gf=0,ga=0;
    mR.forEach(m=>{const p=m.result.split(/[:\-]/).map(s=>parseInt(s.trim()));if(p.length===2&&!isNaN(p[0])&&!isNaN(p[1])){const isHome=m.location==="Domácí";const our=isHome?p[0]:p[1];const their=isHome?p[1]:p[0];gf+=our;ga+=their;if(our>their)wins++;else if(our===their)draws++;else losses++}});
    const played=wins+draws+losses;
    const ecs={background:'var(--cd)',borderRadius:14,padding:14,boxShadow:'0 4px 14px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.9)',cursor:'pointer',transition:'all .2s',borderLeft:`4px solid ${tInfo.color}`};
    return (<div>
    {/* Header */}
    <div style={{background:`linear-gradient(135deg,${tInfo.color}18,${tInfo.color}08)`,borderRadius:14,padding:14,marginBottom:12,border:`1px solid ${tInfo.color}20`}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}><div style={{width:36,height:36,borderRadius:10,background:tInfo.color,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:'var(--fd)',fontSize:14,fontWeight:900}}>{{["a-tym"]:"A",["starsi-zaci"]:"SŽ",["mladsi-zaci"]:"MŽ",["starsi-pripravka"]:"SP",["mladsi-pripravka"]:"MP",["treneri"]:"T",["vybor"]:"V"}[team]||"?"}</div><div><div style={{fontFamily:'var(--fd)',fontSize:15,textTransform:'uppercase',letterSpacing:.5}}>{tInfo.name}</div><div style={{fontSize:10,color:'var(--t3)'}}>TJ Dynamo Drnholec</div></div></div>
    </div>

    {/* Mini dlaždice */}
    {isTr?(<div className="sg"><div className="st" onClick={()=>go("tasks")}><div className="sn">{(T.tasks||[]).length}</div><div className="sl">Zápisů</div></div><div className="st" onClick={()=>go("tasks")}><div className="sn">{(T.tasks||[]).flatMap(t=>(t.subtasks||[]).filter(s=>s.status!=="hotovo")).length}</div><div className="sl">Úkolů</div></div><div className="st" onClick={()=>go("chat")}><div className="sn">{T.chat.length}</div><div className="sl">Zpráv</div></div><div className="st" onClick={()=>go("polls")}><div className="sn">{T.polls.length}</div><div className="sl">Anket</div></div></div>)
    :isV?(<div className="sg"><div className="st" onClick={()=>go("contacts")}><div className="sn">{T.contacts.length}</div><div className="sl">Členů</div></div><div className="st" onClick={()=>go("meetings")}><div className="sn">{(T.meetings||[]).filter(m=>!m.done).length}</div><div className="sl">Schůzí</div></div><div className="st" onClick={()=>go("votings")}><div className="sn">{(T.votings||[]).filter(v=>!v.done).length}</div><div className="sl">Hlasov.</div></div><div className="st" onClick={()=>go("chat")}><div className="sn">{T.chat.length}</div><div className="sl">Zpráv</div></div></div>)
    :(<div className="sg"><div className="st" onClick={()=>go("players")}><div className="sn">{T.players.length}</div><div className="sl">Hráčů</div></div><div className="st" onClick={()=>go("matches")}><div className="sn">{(T.matches||[]).filter(m=>!m.done).length}</div><div className="sl">Zápasů</div></div><div className="st" onClick={()=>go("trainings")}><div className="sn">{(T.trainings||[]).filter(t=>!t.done).length}</div><div className="sl">Tréninků</div></div><div className="st" onClick={()=>go("photos")}><div className="sn">{T.photos.length}</div><div className="sl">Fotek</div></div></div>)}

    {/* Trenéři - task dashboard */}
    {isTr&&(()=>{const allSubs=(T.tasks||[]).flatMap(t=>(t.subtasks||[]));const assigned=allSubs.filter(s=>s.status==="přiděleno").length;const inProg=allSubs.filter(s=>s.status==="zpracovávám").length;const done=allSubs.filter(s=>s.status==="hotovo").length;const total=allSubs.length;
    return <div style={{background:'var(--cd)',borderRadius:14,padding:12,boxShadow:'0 4px 14px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.9)',marginBottom:10}}>
      <div style={{fontSize:10,fontWeight:700,color:'var(--t3)',textTransform:'uppercase',letterSpacing:1,marginBottom:8,display:'flex',alignItems:'center',gap:5}}>📋 Přehled úkolů</div>
      <div style={{display:'flex',gap:5,marginBottom:6}}>
        <div style={{flex:1,background:'rgba(59,130,246,.08)',borderRadius:8,padding:'6px 4px',textAlign:'center'}}><div style={{fontFamily:'var(--fd)',fontSize:18,color:'#3b82f6'}}>{assigned}</div><div style={{fontSize:7,color:'var(--t3)',fontWeight:700}}>Přiděleno</div></div>
        <div style={{flex:1,background:'rgba(245,158,11,.08)',borderRadius:8,padding:'6px 4px',textAlign:'center'}}><div style={{fontFamily:'var(--fd)',fontSize:18,color:'#f59e0b'}}>{inProg}</div><div style={{fontSize:7,color:'var(--t3)',fontWeight:700}}>Zpracovávám</div></div>
        <div style={{flex:1,background:'rgba(22,163,74,.08)',borderRadius:8,padding:'6px 4px',textAlign:'center'}}><div style={{fontFamily:'var(--fd)',fontSize:18,color:'#16a34a'}}>{done}</div><div style={{fontSize:7,color:'var(--t3)',fontWeight:700}}>Hotovo</div></div>
      </div>
      {total>0&&<div style={{height:6,borderRadius:3,overflow:'hidden',display:'flex',background:'var(--bg)'}}>{assigned>0&&<div style={{flex:assigned,background:'#3b82f6'}}/>}{inProg>0&&<div style={{flex:inProg,background:'#f59e0b'}}/>}{done>0&&<div style={{flex:done,background:'#16a34a'}}/>}</div>}
    </div>})()}

    {/* Bilance sezóny */}
    {!isV&&!isTr&&<div style={{background:'var(--cd)',borderRadius:14,padding:12,boxShadow:'0 4px 14px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.9)',marginBottom:10}}>
      <div style={{fontSize:10,fontWeight:700,color:'var(--t3)',textTransform:'uppercase',letterSpacing:1,marginBottom:8,display:'flex',alignItems:'center',gap:5}}>⚽ Bilance sezóny</div>
      {played>0?<>
        <div style={{display:'flex',gap:5,marginBottom:8}}>
          <div style={{flex:1,background:'rgba(22,163,74,.08)',borderRadius:10,padding:'8px 4px',textAlign:'center'}}><div style={{fontFamily:'var(--fd)',fontSize:20,color:'#16a34a'}}>{wins}</div><div style={{fontSize:8,color:'var(--t3)',fontWeight:700}}>Výhry</div></div>
          <div style={{flex:1,background:'rgba(202,138,4,.08)',borderRadius:10,padding:'8px 4px',textAlign:'center'}}><div style={{fontFamily:'var(--fd)',fontSize:20,color:'#ca8a04'}}>{draws}</div><div style={{fontSize:8,color:'var(--t3)',fontWeight:700}}>Remízy</div></div>
          <div style={{flex:1,background:'rgba(220,38,38,.08)',borderRadius:10,padding:'8px 4px',textAlign:'center'}}><div style={{fontFamily:'var(--fd)',fontSize:20,color:'#dc2626'}}>{losses}</div><div style={{fontSize:8,color:'var(--t3)',fontWeight:700}}>Prohry</div></div>
          <div style={{flex:1,background:'var(--bg)',borderRadius:10,padding:'8px 4px',textAlign:'center'}}><div style={{fontFamily:'var(--fd)',fontSize:20,color:gf>ga?'#16a34a':gf<ga?'#dc2626':'var(--t)'}}>{gf}:{ga}</div><div style={{fontSize:8,color:'var(--t3)',fontWeight:700}}>Skóre</div></div>
        </div>
        <div style={{height:6,borderRadius:3,overflow:'hidden',display:'flex',background:'var(--bg)'}}>{wins>0&&<div style={{flex:wins,background:'#16a34a'}}/>}{draws>0&&<div style={{flex:draws,background:'#ca8a04'}}/>}{losses>0&&<div style={{flex:losses,background:'#dc2626'}}/>}</div>
      </>:<div style={{textAlign:'center',padding:8,color:'var(--t3)',fontSize:10}}>Zatím žádné odehrané zápasy</div>}
    </div>}

    {/* Příští zápas */}
    {!isV&&!isTr&&(<div style={{marginBottom:10}}><div className="lb" style={{display:'flex',alignItems:'center',gap:5}}>🏟️ Příští zápas</div>{nxM?<div style={ecs} onClick={()=>{go("matches");setTimeout(()=>setSelM({id:nxM.id}),50)}}><div className="cr"><div><div className="ctt" style={{fontSize:14,fontWeight:700}}><VS op={nxM.opponent} sz={14} home={nxM.location==="Domácí"}/></div><div className="css2" style={{marginTop:3}}>{fd(nxM.date)} · {nxM.time}</div></div><span className={`tg ${nxM.location==="Domácí"?"th":"ta"}`} style={{fontSize:10,padding:'4px 10px'}}>{nxM.location==="Domácí"?"Doma":"Venku"}</span></div></div>:<div style={{...ecs,cursor:'default',opacity:.5,textAlign:'center',padding:16}}><div style={{fontSize:11,color:'var(--t3)'}}>Žádný nadcházející zápas</div></div>}</div>)}

    {/* Příští trénink */}
    {!isV&&!isTr&&(<div style={{marginBottom:10}}><div className="lb" style={{display:'flex',alignItems:'center',gap:5}}>🏃 Příští trénink</div>{nxT?<div style={ecs} onClick={()=>go("trainings")}><div className="ctt" style={{fontSize:13,fontWeight:600}}>{nxT.focus}</div><div className="css2" style={{marginTop:3}}>{fd(nxT.date)} · {nxT.time} · {nxT.duration||""}</div></div>:<div style={{...ecs,cursor:'default',opacity:.5,textAlign:'center',padding:16}}><div style={{fontSize:11,color:'var(--t3)'}}>Žádný nadcházející trénink</div></div>}</div>)}

    {/* Výbor - příští schůze */}
    {nxMt&&isV&&(<div style={{marginBottom:10}}><div className="lb" style={{display:'flex',alignItems:'center',gap:5}}>📋 Příští schůze</div><div style={ecs} onClick={()=>go("meetings")}><div className="ctt" style={{fontSize:13,fontWeight:600}}>{nxMt.topic}</div><div className="css2" style={{marginTop:3}}>{fd(nxMt.date)} · {nxMt.time} · {nxMt.location||""}</div></div></div>)}
    <div style={{background:'var(--cd)',borderRadius:14,padding:12,boxShadow:'0 4px 14px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.9)',border:'1px solid rgba(22,163,74,.12)'}}>
      <div style={{fontSize:10,fontWeight:700,color:'#16a34a',textTransform:'uppercase',letterSpacing:1,marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
        <span style={{width:20,height:20,borderRadius:'50%',background:'#16a34a',color:'#fff',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700}}>✓</span>
        Dokončeno {allDone.length>0&&<span style={{color:'var(--t3)',fontWeight:400}}>({allDone.length})</span>}
      </div>
      {allDone.length===0?<div style={{textAlign:'center',padding:'10px 0',color:'var(--t3)',fontSize:10}}>Zatím žádné dokončené události</div>
      :<>{allDone.slice(0,5).map(d=> <div key={d.id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:'1px solid var(--b)',cursor:'pointer'}} onClick={()=>{if(d._k==="match"){go("matches");setTimeout(()=>setSelM({id:d.id}),50)}else if(d._k==="train")go("trainings");else if(d._k==="meet"){go("meetings");setTimeout(()=>setSelMt(d),50)}else if(d._k==="vote"){go("votings");setTimeout(()=>setSelVt(d),50)}else if(d._k==="subtask")go("tasks")}}>
          <span style={{width:18,height:18,borderRadius:'50%',background:'rgba(22,163,74,.1)',color:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,flexShrink:0}}>✓</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d._k==="match"?<VS op={d.opponent} sz={11} home={d.location==="Domácí"}/>:d._k==="subtask"?d.title:(d.focus||d.topic)}</div>
            <div style={{fontSize:9,color:'var(--t3)'}}>{fd(d.date)}{d.result?" · "+d.result:""}{d._k==="subtask"&&d.assignee?" · 👤 "+d.assignee:""}{d._k==="subtask"&&d._parent?" · "+d._parent:""}</div>
          </div>
          <span style={{fontSize:8,color:'var(--t3)',background:'var(--bg)',padding:'2px 6px',borderRadius:6,flexShrink:0,fontWeight:600}}>{d._k==="match"?"Zápas":d._k==="train"?"Trénink":d._k==="meet"?"Schůze":d._k==="subtask"?"Úkol":"Hlasování"}</span>
        </div>)}
        {allDone.length>5&&<div style={{textAlign:'center',fontSize:10,color:'var(--ac)',padding:6,cursor:'pointer',fontWeight:600}} onClick={()=>go("matches")}>Zobrazit vše →</div>}
      </>}
    </div>
  </div>)};

  const VS=({op,sz,home})=>{const s=sz||12;const dd=<span style={{fontWeight:700,fontSize:s}}>DD</span>;const opp=<span style={{fontWeight:700,fontSize:s}}>{op}</span>;const v=<span style={{fontStyle:'italic',fontSize:s*.75,color:'var(--t3)',fontWeight:400,padding:'0 1px'}}>vs</span>;return <span style={{display:'inline-flex',alignItems:'center',gap:4}}>{home===false?<>{opp}{v}{dd}</>:<>{dd}{v}{opp}</>}</span>};
  const EvMeta=({ev})=>(<div style={{fontSize:9,color:'var(--t3)',marginTop:8,borderTop:'1px solid var(--b)',paddingTop:6}}>{ev.createdBy&&<span>Vytvořil: {ev.createdBy}</span>}{ev.editedBy&&<span style={{marginLeft:10}}>· Upravil: {ev.editedBy}</span>}</div>);

  const pgMatches=()=>{const selMatch=selM?T.matches.find(x=>x.id===(selM.id||selM)):null;if(selMatch){const m=selMatch; return (<div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <button style={{display:'flex',alignItems:'center',gap:5,color:'var(--ac)',fontSize:12,fontWeight:600,fontFamily:'var(--f)',background:'none',border:'none',cursor:'pointer'}} onClick={()=>setSelM(null)}><Ic.Bk/> Zpět</button>
      <div style={{display:'flex',gap:6}}>
        <button className="ba" style={{fontSize:10}} onClick={()=>setMod({type:"eM",ev:m})}>✎ Upravit</button>
        <button className="ba" style={{fontSize:10,color:m.done?'var(--g)':'var(--t3)'}} onClick={()=>togDone("matches",m.id)}>{m.done?"✓ Proběhlo":"○ Proběhlo"}</button>
      </div>
    </div>
    <div className="pt" style={{marginBottom:8,opacity:m.done?.5:1}}><VS op={m.opponent} sz={18} home={m.location==="Domácí"}/></div><div style={{color:'var(--t2)',fontSize:12,marginBottom:12}}>{fd(m.date)} · {m.time}{m.meetTime&&<span style={{color:'var(--ac)'}}> · sraz {m.meetTime}</span>} · {m.location==="Domácí"?"Doma":"Venku"} · {m.type}</div>
    {!m.result&&<div style={{marginBottom:12,display:'flex',gap:6}}><input className="fi" placeholder="3:1" id="ri" style={{flex:1}}/><button className="ba" onClick={()=>{const v=document.getElementById('ri').value;if(v){sR(m.id,v)}}}>Uložit</button></div>}
    {m.result&&<div style={{background:'var(--ag)',borderRadius:'var(--rd)',padding:12,marginBottom:12,textAlign:'center'}}><div style={{fontSize:10,color:'var(--t3)',textTransform:'uppercase'}}>Výsledek</div><div style={{fontFamily:'var(--fd)',fontSize:28,color:'var(--ac)'}}>{m.result}</div></div>}
    {(()=>{const confirmed=T.players.filter(p=>(m.attendance||{})[p.name]).sort((a,b)=>a.name.localeCompare(b.name));return confirmed.length>0?<><div className="lb">Nominováni ({confirmed.length})</div>
    <div className="lc" style={{marginBottom:8}}>{confirmed.map(p=> <button key={p.id} className="lch s" onClick={()=>togAtt("matches",m.id,p.name,false)}>{pName(p)} ✕</button>)}</div>
    <button className="ba" style={{marginBottom:10,fontSize:10}} onClick={()=>setShowPitch(!showPitch)}>{showPitch?"▲ Skrýt hřiště":"▼ Zobrazit hřiště"}</button>
    {showPitch&&confirmed.length>0&&(()=>{const lp=confirmed;const excused=T.players.filter(p=>(m.excuses||{})[p.name]);const pos=m.lineupPos||{};const pitchKey=lp.map(p=>p.id).join('.');
      const defPos=(p,idx)=>{if(pos[p.id])return pos[p.id];
        const posMap={Brankář:85,Obránce:65,Záložník:42,Útočník:18};
        const hasPositions=lp.some(pl=>pl.position&&posMap[pl.position]);
        if(hasPositions){
          const yLine=posMap[p.position]||50;
          const sameLine=lp.filter(pl=>(pl.position||"")===(p.position||""));
          const si=sameLine.indexOf(p);const cnt=sameLine.length;
          const x=cnt===1?50:15+si*(70/Math.max(cnt-1,1));
          return{x,y:yLine};
        }
        /* Auto-formace pro hráče bez pozic */
        const n=lp.length;let formation;
        if(n<=3)formation=[n];
        else if(n<=5)formation=[1,Math.ceil((n-1)/2),n-1-Math.ceil((n-1)/2)];
        else if(n<=7)formation=[1,Math.ceil((n-2)/2),n-2-Math.ceil((n-2)/2),1];
        else if(n<=9)formation=[1,Math.min(3,Math.ceil((n-2)/3)),Math.min(4,Math.ceil((n-2)/3)),n-2-Math.min(3,Math.ceil((n-2)/3))-Math.min(4,Math.ceil((n-2)/3))>0?n-2-Math.min(3,Math.ceil((n-2)/3))-Math.min(4,Math.ceil((n-2)/3)):1];
        else formation=[1,Math.ceil((n-1)*0.3),Math.ceil((n-1)*0.4),n-1-Math.ceil((n-1)*0.3)-Math.ceil((n-1)*0.4)];
        if(formation.reduce((a,b)=>a+b,0)<n)formation[formation.length-1]+=n-formation.reduce((a,b)=>a+b,0);
        const yLines=[85,62,40,18];
        let cur=0;
        for(let row=0;row<formation.length;row++){
          const cnt=formation[row];
          for(let col=0;col<cnt;col++){
            if(cur===idx){const x=cnt===1?50:15+col*(70/Math.max(cnt-1,1));return{x,y:yLines[Math.min(row,yLines.length-1)]};}
            cur++;
          }
        }
        return{x:50,y:50};
      };
      const onDrag=(pid,e)=>{const el=e.currentTarget.closest('.lf');if(!el)return;const r=el.getBoundingClientRect();const getXY=(ev)=>{const cx=ev.touches?ev.touches[0].clientX:ev.clientX;const cy=ev.touches?ev.touches[0].clientY:ev.clientY;return{x:Math.max(5,Math.min(95,((cx-r.left)/r.width)*100)),y:Math.max(3,Math.min(95,((cy-r.top)/r.height)*100))}};
        const fp=e.currentTarget;fp.style.zIndex=10;
        const mv=(ev)=>{ev.preventDefault();const{x,y}=getXY(ev);fp.style.left=x+'%';fp.style.top=y+'%';fp.style.transform='translate(-50%,-50%)'};
        const up=(ev)=>{const{x,y}=getXY(ev.changedTouches?ev.changedTouches[0]:ev);fp.style.zIndex=2;sLP(m.id,{[pid]:{x,y}});document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);document.removeEventListener('touchmove',mv);document.removeEventListener('touchend',up)};
        document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);document.addEventListener('touchmove',mv,{passive:false});document.addEventListener('touchend',up)};
      return <div className="lf" key={"pitch-"+pitchKey} style={{minHeight:380}}>
        <div style={{position:'absolute',top:'50%',left:'5%',right:'5%',height:1,background:'rgba(255,255,255,.2)'}}/>
        <div style={{position:'absolute',top:'50%',left:'50%',width:60,height:60,border:'1px solid rgba(255,255,255,.15)',borderRadius:'50%',transform:'translate(-50%,-50%)'}}/>
        <div style={{position:'absolute',top:'50%',left:'50%',width:6,height:6,background:'rgba(255,255,255,.25)',borderRadius:'50%',transform:'translate(-50%,-50%)'}}/>
        <div style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:80,height:24,borderTop:'2px solid rgba(255,255,255,.5)',borderLeft:'2px solid rgba(255,255,255,.5)',borderRight:'2px solid rgba(255,255,255,.5)',borderRadius:'4px 4px 0 0'}}/>
        <div style={{position:'absolute',bottom:24,left:'50%',transform:'translateX(-50%)',width:160,height:40,borderTop:'1px solid rgba(255,255,255,.15)',borderLeft:'1px solid rgba(255,255,255,.15)',borderRight:'1px solid rgba(255,255,255,.15)',borderRadius:'4px 4px 0 0'}}/>
        <div style={{position:'absolute',bottom:56,left:'50%',width:4,height:4,background:'rgba(255,255,255,.2)',borderRadius:'50%',transform:'translateX(-50%)'}}/>
        {excused.length>0&&<div style={{position:'absolute',top:8,left:8,background:'rgba(0,0,0,.35)',borderRadius:10,padding:'6px 10px',zIndex:5,maxWidth:'40%'}}>
          <div style={{fontSize:8,fontWeight:700,color:'rgba(255,255,255,.6)',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Omluveni</div>
          {excused.map(p=><div key={p.id} style={{fontSize:9,color:'rgba(255,255,255,.7)',padding:'2px 0',display:'flex',alignItems:'center',gap:4}}>
            <div style={{width:16,height:16,borderRadius:'50%',background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,fontWeight:700,color:'rgba(255,255,255,.8)'}}>{p.name.split(' ').map(w=>w[0]).join('')}</div>
            <span>{pName(p)} – {(m.excuses||{})[p.name]}</span>
          </div>)}
        </div>}
        {lp.map((p,i)=>{const{x,y}=defPos(p,i);return <div className="fp" key={p.id} style={{left:x+'%',top:y+'%',transform:'translate(-50%,-50%)'}} onMouseDown={e=>onDrag(p.id,e)} onTouchStart={e=>onDrag(p.id,e)}><div className="fc">{p.name.split(' ').map(w=>w[0]).join('')}</div><div className="fn">{pName(p)}</div></div>})}
      </div>})()}</>:null})()}
    <AttBlock kind="matches" ev={m}/>
    <EvMeta ev={m}/>
  </div>)};const upcoming=T.matches.filter(m=>!m.done).sort((a,b)=>a.date.localeCompare(b.date));const past=T.matches.filter(m=>m.done).sort((a,b)=>b.date.localeCompare(a.date)); return (<div><div className="ph"><div className="pt">Zápasy</div><button className="ba" onClick={()=>setMod("aM")}><Ic.Plus/> Přidat</button></div>
    {upcoming.length>0&&<div className="lb">Nadcházející</div>}
    {upcoming.map(m=> <div className="c2" key={m.id} onClick={()=>setSelM({id:m.id})}><div className="cr"><div><div className="ctt"><VS op={m.opponent} home={m.location==="Domácí"}/></div><div className="css2">{fd(m.date)} · {m.time}{m.meetTime&&" · sraz "+m.meetTime}</div></div><div style={{display:'flex',gap:5}}><span className={`tg ${m.location==="Domácí"?"th":"ta"}`}>{m.location==="Domácí"?"Doma":"Venku"}</span><button className="ib d" onClick={e=>{e.stopPropagation();del("matches",m.id)}}><Ic.Del/></button></div></div><div style={{fontSize:10,color:'var(--t3)',marginTop:4}}>✓ {names.filter(n=>(m.attendance||{})[n]).length} · ✗ {names.filter(n=>(m.excuses||{})[n]).length} · ? {names.length-names.filter(n=>(m.attendance||{})[n]).length-names.filter(n=>(m.excuses||{})[n]).length}</div></div>)}
    {past.length>0&&<div className="lb" style={{marginTop:12}}>Proběhlo</div>}
    {past.map(m=> <div className="c2" key={m.id} onClick={()=>setSelM({id:m.id})} style={{opacity:.85}}><div className="cr"><div><div className="ctt" style={{}}><span style={{color:'#16a34a',fontWeight:700,marginRight:4}}>✓</span><VS op={m.opponent} home={m.location==="Domácí"}/></div><div className="css2">{fd(m.date)} · {m.result||m.time}</div></div><span style={{background:'#16a34a',color:'#fff',padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:700}}>✓ Hotovo</span></div></div>)}</div>)};

  const pgTr=()=>{const selTr=selM?T.trainings.find(x=>x.id===(selM.id||selM)):null;if(selTr){const t=selTr; return (<div>
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
    {upTr.map(t=> <div className="c2" key={t.id} onClick={()=>setSelM({id:t.id})}><div className="cr"><div><div className="ctt">{t.focus}</div><div className="css2">{fd(t.date)} · {t.time} · {t.duration}</div></div><button className="ib d" onClick={e=>{e.stopPropagation();del("trainings",t.id)}}><Ic.Del/></button></div>{t.notes&&<div style={{fontSize:10,color:'var(--t2)',marginTop:4,fontStyle:'italic',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>📝 {t.notes}</div>}<div style={{fontSize:10,color:'var(--t3)',marginTop:4}}>✓ {names.filter(n=>(t.attendance||{})[n]).length} · ✗ {names.filter(n=>(t.excuses||{})[n]).length}</div></div>)}
    {paTr.length>0&&<div className="lb" style={{marginTop:12}}>Proběhlo</div>}
    {paTr.map(t=> <div className="c2" key={t.id} onClick={()=>setSelM({id:t.id})} style={{opacity:.85}}><div className="cr"><div><div className="ctt" style={{}}><span style={{color:'#16a34a',fontWeight:700,marginRight:4}}>✓</span>{t.focus}</div><div className="css2">{fd(t.date)} · {t.time}</div></div><span style={{background:'#16a34a',color:'#fff',padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:700}}>✓ Hotovo</span></div>{t.notes&&<div style={{fontSize:10,color:'var(--t2)',marginTop:4,fontStyle:'italic',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>📝 {t.notes}</div>}</div>)}
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
    <div className="doc-list">{(m.docs||[]).map((d,i)=> <div key={i} style={{display:'flex',alignItems:'center',gap:4}}><button onClick={()=>openDoc0(d)} className="doc-item" style={{cursor:'pointer',border:'1px solid var(--b)',background:'var(--cd)'}}><Ic.Doc/> {d.name}</button><button onClick={()=>dlDoc0(d)} style={{fontSize:10,color:'var(--ac)',padding:'4px 8px',background:'var(--ag)',borderRadius:12,border:'none',cursor:'pointer',fontFamily:'var(--f)'}}>⬇</button></div>)}</div>
    <div style={{marginTop:8}}><label className="ba" style={{cursor:'pointer',display:'inline-flex'}}><Ic.Plus/> Přidat soubor<input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" style={{display:'none'}} onChange={async e=>{const f=e.target.files[0];if(!f)return;const data=await compressImg(f);addDocToMeet(m.id,{name:f.name,data});e.target.value=""}}/></label></div>
    <AttBlock kind="meetings" ev={m}/>
    <EvMeta ev={m}/>
  </div>)};const upMt=T.meetings.filter(m=>!m.done).sort((a,b)=>a.date.localeCompare(b.date));const paMt=T.meetings.filter(m=>m.done).sort((a,b)=>b.date.localeCompare(a.date)); return (<div><div className="ph"><div className="pt">Schůze výboru</div><button className="ba" onClick={()=>setMod("aMt")}><Ic.Plus/> Nová</button></div>
    {upMt.length===0&&paMt.length===0&&<div className="es"><p>Žádné schůze</p></div>}
    {upMt.length>0&&<div className="lb">Nadcházející</div>}
    {upMt.map(m=> <div className="c2" key={m.id} onClick={()=>setSelMt(m)}><div className="cr"><div><div className="ctt">{m.topic}</div><div className="css2">{fd(m.date)} · {m.time} · {m.location}</div></div><button className="ib d" onClick={e=>{e.stopPropagation();del("meetings",m.id)}}><Ic.Del/></button></div><div style={{fontSize:10,color:'var(--t3)',marginTop:4}}>✓ {names.filter(n=>(m.attendance||{})[n]).length} · Docs: {(m.docs||[]).length}</div></div>)}
    {paMt.length>0&&<div className="lb" style={{marginTop:12}}>Proběhlo</div>}
    {paMt.map(m=> <div className="c2" key={m.id} onClick={()=>setSelMt(m)} style={{opacity:.85}}><div className="cr"><div><div className="ctt" style={{}}><span style={{color:'#16a34a',fontWeight:700,marginRight:4}}>✓</span>{m.topic}</div><div className="css2">{fd(m.date)}</div></div><span style={{background:'#16a34a',color:'#fff',padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:700}}>✓ Hotovo</span></div></div>)}
  </div>)};



  const exportVoting=(v)=>{const vt=(T.votings||[]).find(x=>x.id===v.id)||v;const members=(T.contacts||[]).map(c=>c.name);const pro=members.filter(n=>(vt.votes||{})[n]==="pro");const proti=members.filter(n=>(vt.votes||{})[n]==="proti");const zdrzel=members.filter(n=>(vt.votes||{})[n]==="zdrzel");const omluven=members.filter(n=>(vt.excuses||{})[n]);
    const imgDocs=(vt.docs||[]).filter(d=>d.data?.startsWith('data:image'));
    const pdfDocs=(vt.docs||[]).filter(d=>d.data?.startsWith('data:application/pdf'));
    const otherDocs=(vt.docs||[]).filter(d=>d.data&&!d.data.startsWith('data:image')&&!d.data.startsWith('data:application/pdf'));
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Hlasování - ${vt.topic}</title>
<style>
*{box-sizing:border-box}
body{font-family:Arial,sans-serif;max-width:750px;margin:0 auto;padding:30px;color:#333;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.header{display:flex;align-items:center;gap:16px;border-bottom:3px solid #0e7490;padding-bottom:12px;margin-bottom:20px}
.logo{width:50px;height:50px;background:#0e7490;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:18px;flex-shrink:0}
.header h1{margin:0;font-size:18px;color:#0e7490}
.header .sub{font-size:12px;color:#666;margin-top:2px}
h2{font-size:16px;color:#0e7490;margin:20px 0 8px;padding-bottom:6px;border-bottom:1px solid #e5e7eb}
.info{color:#666;font-size:12px;margin:3px 0}
.desc{font-size:13px;color:#444;margin:10px 0;padding:10px 14px;background:#f8fafc;border-left:3px solid #0e7490;border-radius:0 8px 8px 0;line-height:1.5}
.result{display:flex;gap:20px;margin:16px 0;padding:16px;background:#f0f9fc;border-radius:10px}
.result div{flex:1;text-align:center;padding:8px;border-radius:8px}
.result .n{font-size:32px;font-weight:900}
.result .l{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-top:4px}
table{width:100%;border-collapse:collapse;margin:16px 0;font-size:12px}
th,td{padding:8px 12px;border:1px solid #e5e7eb;text-align:left}
th{background:#0e7490;color:#fff;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
tr:nth-child(even){background:#f8fafc}
.pro{color:#16a34a;font-weight:700}.proti{color:#dc2626;font-weight:700}.zdrzel{color:#ca8a04;font-weight:600}.omluven{color:#666;font-style:italic}
.total-row{background:#f0f9fc!important;font-weight:700;border-top:2px solid #0e7490}
.doc-section{margin:20px 0;page-break-before:auto}
.doc-section img{max-width:100%;border-radius:8px;border:1px solid #e5e7eb;margin:8px 0}
.doc-name{font-size:11px;color:#666;margin:4px 0}
.footer{margin-top:30px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:10px;color:#999;display:flex;justify-content:space-between}
.no-print{text-align:center;margin-bottom:20px}
.no-print button{padding:10px 28px;background:#0e7490;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer}
.no-print button:hover{background:#0c5c72}
@media print{.no-print{display:none} .doc-section{page-break-inside:avoid}}
</style></head><body>
<div class="no-print"><button onclick="window.print()">📄 Uložit jako PDF</button></div>
<div class="header"><div class="logo">TJD</div><div><h1>TJ Dynamo Drnholec — Výbor</h1><div class="sub">Zápis z hlasování</div></div></div>
<h2>📋 ${vt.topic}</h2>
<div class="info">📅 Datum: ${fd(vt.date)}</div>
<div class="info">👤 Vytvořil: ${vt.createdBy||"—"}</div>
${vt.description?'<div class="desc">'+vt.description+'</div>':''}
<h2>📊 Výsledek hlasování</h2>
<div class="result">
<div style="background:rgba(22,163,74,.08)"><div class="n" style="color:#16a34a">${pro.length}</div><div class="l">Pro</div></div>
<div style="background:rgba(220,38,38,.08)"><div class="n" style="color:#dc2626">${proti.length}</div><div class="l">Proti</div></div>
<div style="background:rgba(202,138,4,.08)"><div class="n" style="color:#ca8a04">${zdrzel.length}</div><div class="l">Zdržel se</div></div>
<div style="background:rgba(100,100,100,.06)"><div class="n" style="color:#666">${omluven.length}</div><div class="l">Omluven</div></div>
</div>
<h2>👥 Hlasování členů</h2>
<table><thead><tr><th style="width:40%">Člen výboru</th><th>Hlasování</th></tr></thead><tbody>
${members.map(n=>{const vote=(vt.votes||{})[n];const exc=(vt.excuses||{})[n];return '<tr><td style="font-weight:600">'+n+'</td><td>'+(exc?'<span class="omluven">Omluven ('+exc+')</span>':vote==="pro"?'<span class="pro">✓ PRO</span>':vote==="proti"?'<span class="proti">✗ PROTI</span>':vote==="zdrzel"?'<span class="zdrzel">— ZDRŽEL SE</span>':'<span style="color:#999">Nehlasoval</span>')+'</td></tr>'}).join('')}
<tr class="total-row"><td>Celkem přítomných: ${members.length-omluven.length} / ${members.length}</td><td>Pro: ${pro.length} | Proti: ${proti.length} | Zdržel: ${zdrzel.length} | Omluven: ${omluven.length}</td></tr>
</tbody></table>
${imgDocs.length>0||pdfDocs.length>0||otherDocs.length>0?'<h2>📎 Přílohy ('+(vt.docs||[]).length+')</h2>':''}
${imgDocs.map(d=>'<div class="doc-section"><div class="doc-name">📷 '+d.name+'</div><img src="'+d.data+'" alt="'+d.name+'"/></div>').join('')}
${pdfDocs.map(d=>'<div class="doc-section"><div class="doc-name">📄 '+d.name+'</div><iframe src="'+d.data+'" style="width:100%;height:600px;border:1px solid #e5e7eb;border-radius:8px"></iframe></div>').join('')}
${otherDocs.map(d=>'<div class="doc-section"><div class="doc-name">📎 '+d.name+'</div></div>').join('')}
<div class="footer"><span>TJ Dynamo Drnholec — Výbor</span><span>Vygenerováno: ${new Date().toLocaleString('cs-CZ')}</span></div>
</body></html>`;
    const w=window.open('','_blank');if(w){w.document.write(html);w.document.close();w.onload=()=>setTimeout(()=>w.print(),500)}};

  const pgVotings=()=>{if(selVt){const v=(T.votings||[]).find(x=>x.id===selVt.id)||selVt;const members=(T.contacts||[]).map(c=>c.name);const vts=v.votes||{};const exc=v.excuses||{};const pro=members.filter(n=>vts[n]==="pro").length;const proti=members.filter(n=>vts[n]==="proti").length;const zdrzel=members.filter(n=>vts[n]==="zdrzel").length;
    return (<div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <button style={{display:'flex',alignItems:'center',gap:5,color:'var(--ac)',fontSize:12,fontWeight:600,fontFamily:'var(--f)',background:'none',border:'none',cursor:'pointer'}} onClick={()=>setSelVt(null)}><Ic.Bk/> Zpět</button>
      <div style={{display:'flex',gap:6}}>
        <button className="ba" style={{fontSize:10}} onClick={()=>exportVoting(v)}>📄 Export</button>
        <button className="ba" style={{fontSize:10,color:v.done?'var(--g)':'var(--t3)'}} onClick={()=>togVoteDone(v.id)}>{v.done?"✓ Ukončeno":"○ Ukončit"}</button>
      </div>
    </div>
    <div className="pt" style={{marginBottom:8}}>{v.topic}</div>
    {v.description&&<div style={{fontSize:12,color:'var(--t2)',marginBottom:12}}>{v.description}</div>}
    <div style={{fontSize:10,color:'var(--t3)',marginBottom:12}}>Datum: {fd(v.date)} · Vytvořil: {v.createdBy}</div>

    <div className="lb">Dokumenty ({(v.docs||[]).length})</div>
    <div className="doc-list">{(v.docs||[]).map((d,i)=> <div key={i} style={{display:'flex',alignItems:'center',gap:4}}><button onClick={()=>openDoc0(d)} className="doc-item" style={{cursor:'pointer',border:'1px solid var(--b)',background:'var(--cd)'}}><Ic.Doc/> {d.name}</button><button onClick={()=>dlDoc0(d)} style={{fontSize:10,color:'var(--ac)',padding:'4px 8px',background:'var(--ag)',borderRadius:12,border:'none',cursor:'pointer',fontFamily:'var(--f)'}}>⬇</button></div>)}</div>
    <div style={{marginTop:8,marginBottom:16}}><label className="ba" style={{cursor:'pointer',display:'inline-flex'}}><Ic.Plus/> Přidat soubor<input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" style={{display:'none'}} onChange={async e=>{const f=e.target.files[0];if(!f)return;const data=await compressImg(f);addDocToVoting(v.id,{name:f.name,data});e.target.value=""}}/></label></div>

    <div className="lb">Výsledek hlasování</div>
    <div style={{display:'flex',gap:10,marginBottom:12}}>
      <div style={{flex:1,background:'rgba(22,163,74,.1)',borderRadius:12,padding:12,textAlign:'center'}}><div style={{fontFamily:'var(--fd)',fontSize:24,color:'var(--g)'}}>{pro}</div><div style={{fontSize:10,color:'var(--t3)'}}>PRO</div></div>
      <div style={{flex:1,background:'rgba(220,38,38,.1)',borderRadius:12,padding:12,textAlign:'center'}}><div style={{fontFamily:'var(--fd)',fontSize:24,color:'var(--r)'}}>{proti}</div><div style={{fontSize:10,color:'var(--t3)'}}>PROTI</div></div>
      <div style={{flex:1,background:'rgba(202,138,4,.1)',borderRadius:12,padding:12,textAlign:'center'}}><div style={{fontFamily:'var(--fd)',fontSize:24,color:'var(--y)'}}>{zdrzel}</div><div style={{fontSize:10,color:'var(--t3)'}}>ZDRŽEL</div></div>
    </div>

    <div className="att" style={{background:'var(--cd)',border:'1px solid var(--b)'}}>
    {members.map(n=>{const vote=vts[n];const isExc=!!exc[n];
      return (<div className="att-row" key={n} style={{flexWrap:'wrap',gap:6}}>
        <span className="att-name" style={{fontWeight:600,minWidth:100}}>{n}</span>
        {isExc?<><span style={{fontSize:10,color:'var(--r)'}}>Omluven – {exc[n]}</span><button style={{fontSize:9,marginLeft:'auto',padding:'2px 7px',borderRadius:12,border:'1px solid var(--b2)',background:'var(--bg)',color:'var(--t3)',cursor:'pointer',fontFamily:'var(--f)'}} onClick={()=>setVExcuse(v.id,n,"")}>Zrušit</button></>
        :<div style={{display:'flex',gap:4,marginLeft:'auto',flexWrap:'wrap'}}>
          {["pro","proti","zdrzel"].map(val=> <button key={val} style={{fontSize:10,padding:'4px 10px',borderRadius:12,border:vote===val?'2px solid':'1.5px solid var(--b2)',background:vote===val?(val==="pro"?'rgba(22,163,74,.15)':val==="proti"?'rgba(220,38,38,.15)':'rgba(202,138,4,.15)'):'var(--bg)',color:val==="pro"?'var(--g)':val==="proti"?'var(--r)':'var(--y)',cursor:'pointer',fontFamily:'var(--f)',fontWeight:vote===val?700:500,borderColor:vote===val?(val==="pro"?'var(--g)':val==="proti"?'var(--r)':'var(--y)'):'var(--b2)'}} onClick={()=>setVote(v.id,n,vote===val?"":val)}>{val==="pro"?"✓ Pro":val==="proti"?"✗ Proti":"— Zdržel"}</button>)}
          <button style={{fontSize:9,padding:'3px 7px',borderRadius:12,border:'1px solid var(--b2)',background:'var(--bg)',color:'var(--t3)',cursor:'pointer',fontFamily:'var(--f)'}} onClick={()=>setVExcuse(v.id,n,"Nepřítomen")}>Omluvenka</button>
        </div>}
      </div>)})}
    </div>
    <EvMeta ev={v}/>
  </div>)};const upVt=(T.votings||[]).filter(v=>!v.done);const paVt=(T.votings||[]).filter(v=>v.done); return (<div><div className="ph"><div className="pt">Hlasování</div><button className="ba" onClick={()=>setMod("aVt")}><Ic.Plus/> Nové</button></div>
    {upVt.length===0&&paVt.length===0&&<div className="es"><p>Žádná hlasování</p></div>}
    {upVt.length>0&&<div className="lb">Aktivní</div>}
    {upVt.map(v=>{const vts=v.votes||{};const members=(T.contacts||[]).map(c=>c.name);return <div className="c2" key={v.id} onClick={()=>setSelVt(v)}><div className="cr"><div><div className="ctt">{v.topic}</div><div className="css2">{fd(v.date)}</div></div><button className="ib d" onClick={e=>{e.stopPropagation();del("votings",v.id)}}><Ic.Del/></button></div><div style={{fontSize:10,color:'var(--t3)',marginTop:4}}>✓ {members.filter(n=>vts[n]==="pro").length} Pro · ✗ {members.filter(n=>vts[n]==="proti").length} Proti · — {members.filter(n=>vts[n]==="zdrzel").length} Zdržel</div></div>})}
    {paVt.length>0&&<div className="lb" style={{marginTop:12}}>Ukončená</div>}
    {paVt.map(v=>{const vts=v.votes||{};const members=(T.contacts||[]).map(c=>c.name);return <div className="c2" key={v.id} onClick={()=>setSelVt(v)} style={{opacity:.85}}><div className="cr"><div><div className="ctt" style={{}}><span style={{color:'#16a34a',fontWeight:700,marginRight:4}}>✓</span>{v.topic}</div><div className="css2">{fd(v.date)}</div></div><span style={{background:'#16a34a',color:'#fff',padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:700}}>✓ Hotovo</span></div></div>})}
  </div>)};

  const getStats=(nm)=>{const dm=(T.matches||[]).filter(m=>m.done);const dt=(T.trainings||[]).filter(t=>t.done);const ma=dm.filter(m=>(m.attendance||{})[nm]).length;const ta=dt.filter(t=>(t.attendance||{})[nm]).length;return{ma,mt:dm.length,ta,tt:dt.length,total:ma+ta,totalAll:dm.length+dt.length}};

  const pgPl=()=>(<div><div className="ph"><div className="pt">Hráči</div><button className="ba" onClick={()=>setMod("aP")}><Ic.Plus/></button></div>
    <div style={{display:'flex',gap:6,marginBottom:12}}>{[["list","Seznam"],["stats","Statistiky"]].map(([k,l])=> <button key={k} onClick={()=>setPlTab(k)} style={{padding:'6px 14px',borderRadius:20,fontSize:11,fontWeight:600,fontFamily:'var(--f)',cursor:'pointer',border:plTab===k?'1.5px solid var(--ac)':'1.5px solid var(--b2)',background:plTab===k?'var(--ag)':'var(--bg)',color:plTab===k?'var(--ac)':'var(--t3)'}}>{l}</button>)}</div>
    {plTab==="list"&&T.players.sort((a,b)=>a.name.localeCompare(b.name)).map(p=> <div className="pr" key={p.id} style={{flexWrap:'wrap'}}>
      <div className="ca">{p.name.split(' ').map(w=>w[0]).join('').substring(0,2)}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
          <span style={{fontWeight:700,fontSize:13}}>{p.name}</span>
          {p.position&&<span style={{fontSize:9,fontWeight:700,padding:'1px 7px',borderRadius:10,background:p.position==="Brankář"?'rgba(202,138,4,.15)':p.position==="Obránce"?'rgba(22,163,74,.15)':p.position==="Záložník"?'rgba(26,138,171,.15)':'rgba(220,38,38,.15)',color:p.position==="Brankář"?'var(--y)':p.position==="Obránce"?'var(--g)':p.position==="Záložník"?'var(--ac)':'var(--r)'}}>{p.position}</span>}
        </div>
        <div style={{fontSize:10,color:'var(--t3)'}}>nar. {p.birthYear}</div>
        <div style={{display:'flex',gap:8,marginTop:4}}>
          {p.phone&&<a href={`tel:${p.phone}`} style={{fontSize:10,color:'var(--ac)',textDecoration:'none',display:'flex',alignItems:'center',gap:3,padding:'3px 8px',background:'var(--ag)',borderRadius:10,fontWeight:600}}>📱 {p.phone}</a>}
          {p.parentPhone&&<a href={`tel:${p.parentPhone}`} style={{fontSize:10,color:'var(--ac)',textDecoration:'none',display:'flex',alignItems:'center',gap:3,padding:'3px 8px',background:'var(--ag)',borderRadius:10,fontWeight:600}}>👤 {p.parentPhone}</a>}
        </div>
        {p.parentName&&<div style={{fontSize:10,color:'var(--t2)',marginTop:3}}>Rodič: {p.parentName}</div>}
        <div style={{display:'flex',alignItems:'center',gap:6,marginTop:4,paddingTop:4,borderTop:'1px solid var(--b)'}}>
          <input type="checkbox" checked={!!p.feePaid} onChange={()=>togFee(p.id)} style={{accentColor:p.feePaid?'var(--g)':'var(--r)',width:16,height:16,cursor:'pointer'}}/>
          <span style={{fontSize:10,fontWeight:600,color:p.feePaid?'var(--g)':'var(--r)'}}>{p.feePaid?'Příspěvek zaplacen':'Příspěvek nezaplacen'}</span>
        </div>
      </div>
      <div style={{display:'flex',gap:4}}><button className="ib" onClick={()=>setMod({type:"eP",ev:p})} style={{padding:4}}>✎</button><button className="ib d" onClick={()=>del("players",p.id)}><Ic.Del/></button></div>
    </div>)}
    {plTab==="stats"&&(<div>
      <div style={{fontSize:10,color:'var(--t3)',marginBottom:8}}>Pouze dokončené události (✓ Proběhlo)</div>
      <div style={{overflowX:'auto',background:'var(--cd)',borderRadius:12,boxShadow:'0 2px 8px rgba(14,116,144,.05)'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
        <thead><tr style={{background:'var(--ag)'}}><th style={{padding:'8px 6px',textAlign:'left',fontWeight:700,color:'var(--ac)'}}>Hráč</th><th style={{padding:'8px 6px',textAlign:'center',fontWeight:700,color:'var(--ac)'}}>Zápasy</th><th style={{padding:'8px 6px',textAlign:'center',fontWeight:700,color:'var(--ac)'}}>Tréninky</th><th style={{padding:'8px 6px',textAlign:'center',fontWeight:700,color:'var(--ac)'}}>Celkem</th><th style={{padding:'8px 6px',textAlign:'center',fontWeight:700,color:'var(--ac)'}}>%</th></tr></thead>
        <tbody>{T.players.sort((a,b)=>getStats(b.name).total-getStats(a.name).total).map(p=>{const s=getStats(p.name);const pct=s.totalAll>0?Math.round(s.total/s.totalAll*100):0;return <tr key={p.id} style={{borderBottom:'1px solid var(--b)'}}>
          <td style={{padding:'7px 6px',fontWeight:500}}>{pName(p)}</td>
          <td style={{padding:'7px 6px',textAlign:'center'}}><span style={{color:s.ma>0?'var(--g)':'var(--t3)'}}>{s.ma}</span><span style={{color:'var(--t3)'}}> / {s.mt}</span></td>
          <td style={{padding:'7px 6px',textAlign:'center'}}><span style={{color:s.ta>0?'var(--g)':'var(--t3)'}}>{s.ta}</span><span style={{color:'var(--t3)'}}> / {s.tt}</span></td>
          <td style={{padding:'7px 6px',textAlign:'center',fontWeight:700}}><span style={{color:s.total>0?'var(--ac)':'var(--t3)'}}>{s.total}</span><span style={{color:'var(--t3)'}}> / {s.totalAll}</span></td>
          <td style={{padding:'7px 6px',textAlign:'center'}}><div style={{width:'100%',height:16,background:'var(--bg)',borderRadius:8,overflow:'hidden'}}><div style={{height:'100%',width:pct+'%',background:pct>=75?'var(--g)':pct>=50?'var(--ac)':pct>=25?'var(--y)':'var(--r)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:3}}><span style={{fontSize:8,fontWeight:700,color:'#fff'}}>{pct>10?pct+'%':''}</span></div></div></td>
        </tr>})}</tbody>
      </table></div>
      <div style={{marginTop:10,padding:10,background:'var(--cd)',borderRadius:'var(--rd)'}}>
        <div style={{fontSize:10,fontWeight:600,color:'var(--t3)',marginBottom:4}}>Příspěvky</div>
        <div style={{display:'flex',gap:16}}><span style={{fontSize:12,color:'var(--g)',fontWeight:700}}>✓ {T.players.filter(p=>p.feePaid).length} zaplaceno</span><span style={{fontSize:12,color:'var(--r)',fontWeight:700}}>✗ {T.players.filter(p=>!p.feePaid).length} nezaplaceno</span></div>
      </div>
    </div>)}
  </div>);

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
    :<><div className="cmg">{T.chat.map(msg=> <div className={`cbb ${msg.from===me?'me':'ot'}`} key={msg.id}><div className="cin"><div className="cfr">{msg.from}</div>{msg.text}<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:3}}><span className="cti">{ts(msg.ts)}</span><button onClick={()=>{if(!window.confirm("Smazat zprávu?"))return;saveT({...T,chat:T.chat.filter(c=>c.id!==msg.id)})}} style={{background:'none',border:'none',color:'var(--r)',cursor:'pointer',padding:'2px 6px',fontSize:10,fontFamily:'var(--f)',opacity:.7}}>✕ smazat</button></div></div></div>)}<div ref={ce}/></div>
    <div className="cip"><input value={ci} onChange={e=>setCi(e.target.value)} placeholder="Zpráva..." onKeyDown={e=>{if(e.key==='Enter')sChat(ci,me)}}/><button className="csb" onClick={()=>sChat(ci,me)}><Ic.Send/></button></div></>}</div>);

  const pgAbs=()=>(<div><div className="ph"><div className="pt">Omluvenky</div><button className="ba" onClick={()=>setMod("aAb")}><Ic.Plus/></button></div>
    {T.absences.length===0&&<div className="es"><p>Žádné omluvenky</p></div>}
    {T.absences.map(a=> <div className="pr" key={a.id}><div style={{width:10,height:10,borderRadius:'50%',background:a.status==="pending"?'var(--y)':'var(--g)'}}/><div style={{flex:1}}><div style={{fontWeight:600,fontSize:12}}>{a.playerName}</div><div style={{fontSize:10,color:'var(--t3)'}}>{a.reason} · {fd(a.eventDate)}</div></div>{a.status==="pending"&&<button className="ib" onClick={()=>apA(a.id)} style={{color:'var(--g)'}}><Ic.Chk/></button>}<button className="ib d" onClick={()=>del("absences",a.id)} style={{marginLeft:2}}><Ic.Del/></button><span className="tg" style={{background:a.status==='pending'?'var(--yb)':'var(--gb)',color:a.status==='pending'?'var(--y)':'var(--g)'}}>{a.status==="pending"?"Čeká":"OK"}</span></div>)}</div>);

  const pgPo=()=>(<div><div className="ph"><div className="pt">Ankety</div><button className="ba" onClick={()=>setMod("aPo")}><Ic.Plus/></button></div>
    {T.polls.length===0&&<div className="es"><p>Žádné ankety</p></div>}
    {T.polls.map(p=>{const tot=p.options.reduce((s,o)=>s+o.votes,0)||1;const cl=['var(--ac)','var(--g)','var(--y)','var(--o)','var(--p)'];
    return (<div className="pc" key={p.id}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}><div className="pq" style={{marginBottom:0}}>{p.question}</div><button className="ib d" onClick={()=>del("polls",p.id)} style={{flexShrink:0}}><Ic.Del/></button></div>{p.options.map((o,i)=> <div key={i}><div className="pbw"><div className="pbl">{o.text}</div><div className="pbb"><div className="pbf" style={{width:Math.round(o.votes/tot*100)+"%",background:cl[i%5],color:'#fff'}}>{o.votes}</div></div></div></div>)}<div style={{marginTop:5}}>{p.options.map((o,i)=> <button key={i} className="pvb" onClick={()=>vP(p.id,i)}>+ {o.text}</button>)}</div>{(p.voters||[]).length>0&&<div style={{fontSize:9,color:'var(--t3)',marginTop:6,borderTop:'1px solid var(--b)',paddingTop:4}}>Hlasovali: {(p.voters||[]).join(', ')}</div>}</div>)})}</div>);

  const pgPh=()=>(<div><div className="ph"><div className="pt">Fotky</div><button className="ba" onClick={()=>setMod("aPh")}><Ic.Plus/></button></div>
    {T.photos.length===0? <div className="es"><p>Žádné fotky</p></div>:
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:3,borderRadius:'var(--rd)',overflow:'hidden'}}>{T.photos.map((p,i)=> <div key={i} style={{aspectRatio:1,background:'var(--bg3)',overflow:'hidden',position:'relative',cursor:'pointer'}} onClick={()=>setViewPhoto(p)}>{p.url&&<img src={p.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>}<button className="ib d" onClick={e=>{e.stopPropagation();del("photos",p.id||("ph_"+i))}} style={{position:'absolute',top:4,right:4,padding:3,background:'rgba(255,255,255,.85)',borderColor:'transparent'}}><Ic.Del/></button></div>)}</div>}</div>);

  const FM=({title,ch,onS})=>(<div className="mo" onClick={()=>setMod(null)}><div className="ml" onClick={e=>e.stopPropagation()}><button className="mc3" onClick={()=>setMod(null)}><Ic.XC/></button><div className="mlt">{title}</div><form onSubmit={e=>{e.preventDefault();onS(new FormData(e.target))}}>{ch}</form></div></div>);
  const F=(n,l,t="text",p="",r=true)=> <div className="fg"><label className="fl">{l}</label>{t==="textarea"? <textarea name={n} className="fi ft2" required={r} placeholder={p}/>: <input name={n} type={t} className="fi" required={r} placeholder={p}/>}</div>;

  const modals=()=>{if(!mod) return null;
    if(mod==="aM") return (<FM title="Nový zápas" onS={f=>addM({date:f.get('d'),time:f.get('t'),meetTime:f.get('mt'),opponent:f.get('o'),location:f.get('l'),type:f.get('tp')})} ch={<>{F("o","Soupeř")}{F("d","Datum","date")}{F("t","Čas zápasu","time")}<div className="fg"><label className="fl">Čas srazu</label><input name="mt" type="time" className="fi"/></div><div className="fg"><label className="fl">Místo</label><select name="l" className="fi"><option value="Domácí">Doma</option><option value="Venku">Venku</option></select></div><div className="fg"><label className="fl">Typ</label><select name="tp" className="fi"><option>Liga</option><option>Pohár</option><option>Přátelský</option></select></div><button type="submit" className="fs">Přidat</button></>}/>);
    if(mod==="aT") return (<FM title="Nový trénink" onS={f=>addTr({date:f.get('d'),time:f.get('t'),duration:f.get('dr'),location:f.get('l'),focus:f.get('f'),notes:f.get('n')})} ch={<>{F("f","Zaměření")}{F("d","Datum","date")}<div className="fg"><label className="fl">Čas (nepovinný)</label><input name="t" type="time" className="fi"/></div><div className="fg"><label className="fl">Délka</label><select name="dr" className="fi"><option value="30 min">30 min</option><option value="60 min">60 min</option><option value="90 min" selected>90 min</option><option value="120 min">120 min</option></select></div>{F("l","Místo")}{F("n","Poznámky","textarea","",false)}<button type="submit" className="fs">Přidat</button></>}/>);
    if(mod==="aP") return (<FM title="Nový hráč" onS={f=>addPl({name:f.get('nm'),number:0,position:f.get('po'),birthYear:parseInt(f.get('yr')),phone:f.get('ph'),parentName:f.get('pn'),parentPhone:f.get('pp'),feePaid:false})} ch={<>{F("nm","Jméno hráče")}<div className="fg"><label className="fl">Pozice</label><select name="po" className="fi"><option>Brankář</option><option>Obránce</option><option>Záložník</option><option>Útočník</option></select></div><div className="fg"><label className="fl">Rok narození</label><select name="yr" className="fi">{Array.from({length:30},(_,i)=>2030-i).map(y=> <option key={y} value={y}>{y}</option>)}</select></div>{F("ph","Telefon hráče","tel","+420...",false)}<div style={{borderTop:'1px solid var(--b)',paddingTop:10,marginTop:4,marginBottom:8}}><div style={{fontSize:10,fontWeight:700,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8}}>Rodič / Zákonný zástupce</div></div>{F("pn","Jméno rodiče","text","",false)}{F("pp","Telefon rodiče","tel","+420...",false)}<button type="submit" className="fs">Přidat hráče</button></>}/>);
    if(mod==="aCt") return (<FM title={isV?"Nový člen":"Nový kontakt"} onS={f=>addCt({name:f.get('nm'),relation:f.get('rl'),phone:f.get('ph'),email:f.get('em')})} ch={<>{F("nm","Jméno")}{F("rl",isV?"Funkce":"Vztah","text",isV?"Předseda":"Otec–Jakub",false)}{F("ph","Telefon","tel","+420...",false)}{F("em","E-mail","email","",false)}<button type="submit" className="fs">Přidat</button></>}/>);
    if(mod==="aNw") return (<FM title="Nová aktualita" onS={f=>addNw({from:f.get('fr'),title:f.get('ti'),text:f.get('tx'),important:f.get('im')==="on"})} ch={<>{F("fr","Autor")}{F("ti","Nadpis")}{F("tx","Text","textarea")}<div className="fg" style={{display:'flex',alignItems:'center',gap:8}}><input type="checkbox" name="im" id="ic"/><label htmlFor="ic" style={{fontSize:12,color:'var(--t2)'}}>Důležité</label></div><button type="submit" className="fs">Publikovat</button></>}/>);
    if(mod==="aAb") return (<FM title="Omluvit hráče" onS={f=>addAb({playerName:f.get('pl'),reason:f.get('rs'),eventDate:f.get('dt'),from:f.get('fr')})} ch={<>{F("fr","Vaše jméno")}<div className="fg"><label className="fl">Hráč</label><select name="pl" className="fi">{T.players.map(p=> <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>{F("dt","Datum","date")}<div className="fg"><label className="fl">Důvod</label><select name="rs" className="fi"><option>Nemoc</option><option>Zranění</option><option>Rodina</option><option>Škola</option></select></div><button type="submit" className="fs">Odeslat</button></>}/>);
    if(mod==="aPo") return (<FM title="Nová anketa" onS={f=>{const opts=f.get('op').split('\n').filter(x=>x.trim()).map(t=>({text:t.trim(),votes:0}));if(opts.length>=2)addPo({question:f.get('q'),options:opts})}} ch={<>{F("q","Otázka")}{F("op","Možnosti","textarea","Modrá\nČervená")}<button type="submit" className="fs">Vytvořit</button></>}/>);
    if(mod==="aMt") return (<FM title="Nová schůze" onS={f=>addMeet({date:f.get('d'),time:f.get('t'),location:f.get('l'),topic:f.get('tp')})} ch={<>{F("tp","Téma/program")}{F("d","Datum","date")}{F("t","Čas","time")}{F("l","Místo")}<button type="submit" className="fs">Vytvořit schůzi</button></>}/>);
    if(mod==="aVt") return (<FM title="Nové hlasování" onS={f=>addVoting({topic:f.get('tp'),description:f.get('ds')})} ch={<>{F("tp","Téma hlasování")}{F("ds","Popis / zdůvodnění","textarea","",false)}<button type="submit" className="fs">Vytvořit hlasování</button></>}/>);
    if(mod==="aTk") return (<FM title="Nový zápis" onS={f=>addTask({title:f.get('ti'),text:f.get('tx')})} ch={<>{F("ti","Název zápisu")}<div className="fg"><label className="fl">Text zápisu</label><textarea name="tx" className="fi ft2" rows="5" style={{minHeight:100}}/></div><button type="submit" className="fs">Vytvořit zápis</button></>}/>);
    if(mod?.type==="eTk"){const ev=mod.ev;return (<div className="mo" onClick={()=>setMod(null)}><div className="ml" onClick={e=>e.stopPropagation()}><button className="mc3" onClick={()=>setMod(null)}><Ic.XC/></button><div className="mlt">Upravit zápis</div>
      <form onSubmit={e=>{e.preventDefault();const f=new FormData(e.target);editTask(ev.id,{title:f.get('ti'),text:f.get('tx')})}}>
      <div className="fg"><label className="fl">Název</label><input name="ti" className="fi" defaultValue={ev.title} required/></div>
      <div className="fg"><label className="fl">Text zápisu</label><textarea name="tx" className="fi ft2" rows="5" style={{minHeight:100}} defaultValue={ev.text||""}/></div>
      <button type="submit" className="fs">Uložit</button></form></div></div>)}
    if(mod?.type==="aSt"){return (<FM title="Nový úkol" onS={f=>addSubtask(mod.tkId,{title:f.get('ti'),description:f.get('ds'),assignee:f.get('as'),deadline:f.get('dl')})} ch={<>{F("ti","Název úkolu")}{F("ds","Popis","textarea","",false)}<div className="fg"><label className="fl">Přiřadit</label><select name="as" className="fi"><option value="">-- vyberte --</option><option>Martin</option><option>Tibor</option><option>Petr</option><option>Pepa</option><option>Broňa</option><option>Michal</option><option>Marek</option></select></div><div className="fg"><label className="fl">Termín splnění</label><input name="dl" type="date" className="fi"/></div><button type="submit" className="fs">Přidat úkol</button></>}/>)}
    if(mod==="aPh") return (<div className="mo" onClick={()=>setMod(null)}><div className="ml" onClick={e=>e.stopPropagation()}><button className="mc3" onClick={()=>setMod(null)}><Ic.XC/></button><div className="mlt">Přidat fotku</div>
      <div className="fg"><label className="fl">Vyberte fotku</label><input type="file" accept="image/*" id="ph-file" style={{width:'100%',padding:10,background:'var(--bg)',border:'1.5px solid var(--b2)',borderRadius:'var(--rs)',color:'var(--t)',fontSize:13,fontFamily:'var(--f)'}}/></div>
      <div className="fg"><label className="fl">Popis</label><input type="text" id="ph-cap" className="fi" placeholder="Popis fotky"/></div>
      <button className="fs" onClick={async()=>{const f=document.getElementById('ph-file').files[0];if(!f)return;const data=await compressImg(f);const n=nt("Nová fotka","photos");saveT({...T,...n,photos:[...T.photos,{id:"ph_"+uid(),url:data,caption:document.getElementById('ph-cap').value||"",date:td()}]});setMod(null)}}>Nahrát</button>
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
      <div className="fg"><label className="fl">Čas (nepovinný)</label><input name="t" type="time" className="fi" defaultValue={ev.time||""}/></div>
      <div className="fg"><label className="fl">Délka</label><select name="dr" className="fi" defaultValue={ev.duration||"90 min"}><option value="30 min">30 min</option><option value="60 min">60 min</option><option value="90 min">90 min</option><option value="120 min">120 min</option></select></div>
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

  const taskColors={"přiděleno":"#3b82f6","zpracovávám":"#f59e0b","hotovo":"#16a34a"};
  const pgTasks=()=>{const tasks=(T.tasks||[]);
    const allSubs=tasks.flatMap(t=>(t.subtasks||[]).map(s=>({...s,_parent:t.title})));
    const subA=allSubs.filter(s=>s.status==="přiděleno").length;
    const subP=allSubs.filter(s=>s.status==="zpracovávám").length;
    const subD=allSubs.filter(s=>s.status==="hotovo").length;

    if(selTk){const tk=(T.tasks||[]).find(x=>x.id===(selTk.id||selTk))||selTk;const subs=tk.subtasks||[];return (<div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <button style={{display:'flex',alignItems:'center',gap:5,color:'var(--ac)',fontSize:12,fontWeight:600,fontFamily:'var(--f)',background:'none',border:'none',cursor:'pointer'}} onClick={()=>setSelTk(null)}><Ic.Bk/> Zpět</button>
        <div style={{display:'flex',gap:6}}>
          <button className="ba" style={{fontSize:10}} onClick={()=>setMod({type:"eTk",ev:tk})}>✎ Upravit</button>
          <button className="ib d" onClick={()=>{delTask(tk.id);setSelTk(null)}}><Ic.Del/></button>
        </div>
      </div>
      <div className="pt" style={{marginBottom:4}}>{tk.title}</div>
      <div style={{fontSize:10,color:'var(--t3)',marginBottom:10}}>{fd(tk.date)} · {tk.createdBy}</div>
      {tk.text&&<div style={{fontSize:12,color:'var(--t2)',lineHeight:1.6,marginBottom:14,padding:12,background:'var(--bg)',borderRadius:12,borderLeft:'3px solid var(--ac)',whiteSpace:'pre-wrap'}}>{tk.text}</div>}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <div className="lb" style={{margin:0}}>Úkoly ({subs.length})</div>
        <button className="ba" style={{fontSize:10}} onClick={()=>setMod({type:"aSt",tkId:tk.id})}><Ic.Plus/> Přidat úkol</button>
      </div>
      {subs.length===0&&<div style={{textAlign:'center',padding:16,color:'var(--t3)',fontSize:11,background:'var(--cd)',borderRadius:12}}>Zatím žádné úkoly v tomto zápisu</div>}
      {subs.map(s=><div key={s.id} style={{background:'var(--cd)',borderRadius:12,padding:12,marginBottom:6,borderLeft:`4px solid ${taskColors[s.status]||'#999'}`,boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
          <div style={{fontWeight:700,fontSize:12}}>{s.title}</div>
          <button className="ib d" onClick={()=>delSubtask(tk.id,s.id)} style={{padding:3,flexShrink:0}}><Ic.Del/></button>
        </div>
        {s.description&&<div style={{fontSize:11,color:'var(--t2)',marginBottom:4}}>{s.description}</div>}
        <div style={{fontSize:10,color:'var(--t3)',marginBottom:6}}>
          {s.assignee&&<span>👤 {s.assignee}</span>}
          {s.deadline&&<span> · 📅 do {fd(s.deadline)}</span>}
          {s.deadline&&new Date(s.deadline)<new Date()&&s.status!=="hotovo"&&<span style={{color:'#dc2626',fontWeight:700}}> ⚠ po termínu</span>}
        </div>
        <div style={{display:'flex',gap:4}}>
          {["přiděleno","zpracovávám","hotovo"].map(st=><button key={st} onClick={()=>setSubStatus(tk.id,s.id,st)} style={{fontSize:9,padding:'3px 8px',borderRadius:10,border:s.status===st?`2px solid ${taskColors[st]}`:'1.5px solid var(--b2)',background:s.status===st?taskColors[st]+'18':'var(--bg)',color:taskColors[st],cursor:'pointer',fontFamily:'var(--f)',fontWeight:s.status===st?700:500}}>{st==="přiděleno"?"📋 Přiděleno":st==="zpracovávám"?"⚙️ Zpracovávám":"✓ Hotovo"}</button>)}
        </div>
      </div>)}
    </div>)}

    return (<div>
    <div className="ph"><div className="pt">Zápis</div><button className="ba" onClick={()=>setMod("aTk")}><Ic.Plus/> Nový</button></div>
    {/* Dashboard */}
    <div style={{display:'flex',gap:6,marginBottom:14}}>
      <div style={{flex:1,background:'rgba(59,130,246,.08)',borderRadius:10,padding:'8px 6px',textAlign:'center'}}><div style={{fontFamily:'var(--fd)',fontSize:20,color:'#3b82f6'}}>{subA}</div><div style={{fontSize:8,fontWeight:700,color:'var(--t3)'}}>Přiděleno</div></div>
      <div style={{flex:1,background:'rgba(245,158,11,.08)',borderRadius:10,padding:'8px 6px',textAlign:'center'}}><div style={{fontFamily:'var(--fd)',fontSize:20,color:'#f59e0b'}}>{subP}</div><div style={{fontSize:8,fontWeight:700,color:'var(--t3)'}}>Zpracovávám</div></div>
      <div style={{flex:1,background:'rgba(22,163,74,.08)',borderRadius:10,padding:'8px 6px',textAlign:'center'}}><div style={{fontFamily:'var(--fd)',fontSize:20,color:'#16a34a'}}>{subD}</div><div style={{fontSize:8,fontWeight:700,color:'var(--t3)'}}>Hotovo</div></div>
    </div>
    {tasks.length===0&&<div className="es"><p>Žádné zápisy</p></div>}
    {tasks.map(t=>{const subs=t.subtasks||[];const doneC=subs.filter(s=>s.status==="hotovo").length;return <div key={t.id} style={{background:'var(--cd)',borderRadius:12,padding:12,marginBottom:8,boxShadow:'0 2px 8px rgba(0,0,0,.04)',cursor:'pointer'}} onClick={()=>setSelTk({id:t.id})}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div style={{fontWeight:700,fontSize:13}}>{t.title}</div>
        <button className="ib d" onClick={e=>{e.stopPropagation();delTask(t.id)}} style={{padding:3,flexShrink:0}}><Ic.Del/></button>
      </div>
      <div style={{fontSize:10,color:'var(--t3)',marginTop:2}}>{fd(t.date)} · {t.createdBy}</div>
      {t.text&&<div style={{fontSize:11,color:'var(--t2)',marginTop:4,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{t.text}</div>}
      {subs.length>0&&<>
        <div style={{display:'flex',alignItems:'center',gap:6,marginTop:8,marginBottom:6}}>
          <div style={{flex:1,height:5,borderRadius:3,overflow:'hidden',background:'var(--bg)',display:'flex'}}>{doneC>0&&<div style={{flex:doneC,background:'#16a34a'}}/>}{(subs.length-doneC)>0&&<div style={{flex:subs.length-doneC,background:'var(--b2)'}}/>}</div>
          <span style={{fontSize:9,color:'var(--t3)',fontWeight:600}}>{doneC}/{subs.length}</span>
        </div>
        {subs.map(s=><div key={s.id} style={{display:'flex',alignItems:'center',gap:6,padding:'4px 0',borderTop:'1px solid var(--b)',fontSize:10}} onClick={e=>e.stopPropagation()}>
          <span style={{width:7,height:7,borderRadius:'50%',background:taskColors[s.status]||'#999',flexShrink:0}}/>
          <span style={{flex:1,fontWeight:600,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.title}</span>
          {s.assignee&&<span style={{color:'var(--ac)',fontSize:9,flexShrink:0}}>👤 {s.assignee}</span>}
          {s.deadline&&<span style={{fontSize:8,color:new Date(s.deadline)<new Date()&&s.status!=="hotovo"?'#dc2626':'var(--t3)',flexShrink:0,fontWeight:600}}>{new Date(s.deadline).toLocaleDateString('cs-CZ',{day:'numeric',month:'short'})}{new Date(s.deadline)<new Date()&&s.status!=="hotovo"?" ⚠":""}</span>}
          <span style={{fontSize:8,padding:'1px 6px',borderRadius:8,background:taskColors[s.status]+'18',color:taskColors[s.status],fontWeight:700,flexShrink:0,whiteSpace:'nowrap'}}>{s.status==="přiděleno"?"Přiděleno":s.status==="zpracovávám"?"Zpracov.":"✓ Hotovo"}</span>
        </div>)}
      </>}
      {subs.length===0&&<div style={{fontSize:9,color:'var(--t3)',marginTop:4,fontStyle:'italic'}}>Žádné úkoly</div>}
    </div>})}
  </div>)};

  const pages={home:pgHome,matches:pgMatches,trainings:pgTr,players:pgPl,coaches:pgCoaches,contacts:pgCt,news:pgNw,chat:pgChat,polls:pgPo,photos:pgPh,meetings:pgMeetings,votings:pgVotings,tasks:pgTasks};

  return (
    <div><style>{S}</style>
      <div className="shell">
        <div className="rail" style={{"--team-color":tInfo.color}}>
          <div style={{color:tInfo.color,padding:'6px 0 4px',opacity:.9,flexShrink:0}}><Ic.Ball/></div>
          <div className="rdv"/>
          {nav.map(n=>(<div key={n.k}>{n.dv&&<div className="rdv"/>}<button className={`ri ${pg===n.k?'a':''}`} style={pg===n.k?{color:tInfo.color,background:`${tInfo.color}20`}:{}} onClick={()=>go(n.k)}>{n.i}<span>{n.l}</span>{(bg[n.k]||0)>0&&<span className="bd">{bg[n.k]}</span>}</button></div>))}
          <div className="rft">
            <button onClick={()=>{setTeam(null);setAuth(false);setPg("home");setSelM(null);setSelMt(null);setSelVt(null);setSelTk(null)}} title="Změnit tým"><Ic.Grid/></button>
            <button onClick={()=>{setAuth(false);setPg("home");setSelM(null);setSelMt(null);setSelVt(null);setSelTk(null)}} title="Odhlásit"><Ic.Out/></button>
            <div style={{width:50,height:1,background:'rgba(0,0,0,.08)',margin:'6px auto 4px'}}/>
            <div style={{fontSize:7,color:'#64748b',textAlign:'center',lineHeight:1.4,fontWeight:600}}>Made for TJ DD<br/>by Martin Staša</div>
          </div>
        </div>
        <div className="cnt">
          <div className="top" style={{background:`linear-gradient(90deg,#0c2d48,${tInfo.color}22)`}}><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:8,height:8,borderRadius:'50%',background:tInfo.color}}/><div style={{fontFamily:'var(--fd)',fontSize:13,textTransform:'uppercase',color:'#fff'}}>{tInfo.name}</div></div></div>
          <div className="ms">{pages[pg]?pages[pg]():pgHome()}</div>
        </div>
      </div>
      {modals()}
      {viewPhoto&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',zIndex:260,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}} onClick={()=>setViewPhoto(null)}>
        <div style={{position:'absolute',top:12,right:12,left:12,display:'flex',justifyContent:'space-between',zIndex:2}}>
          <button onClick={()=>setViewPhoto(null)} style={{background:'rgba(255,255,255,.15)',border:'none',color:'#fff',padding:'8px 16px',borderRadius:20,fontSize:13,fontFamily:'var(--f)',fontWeight:600,cursor:'pointer'}}>← Zavřít</button>
          <button onClick={e=>{e.stopPropagation();if(viewPhoto.url)dlDoc0({name:(viewPhoto.caption||"fotka")+".jpg",data:viewPhoto.url})}} style={{background:'rgba(255,255,255,.15)',border:'none',color:'#fff',padding:'8px 16px',borderRadius:20,fontSize:13,fontFamily:'var(--f)',fontWeight:600,cursor:'pointer'}}>⬇ Stáhnout</button>
        </div>
        {viewPhoto.url&&<img src={viewPhoto.url} alt="" style={{maxWidth:'95%',maxHeight:'80vh',borderRadius:8,objectFit:'contain'}} onClick={e=>e.stopPropagation()}/>}
        {viewPhoto.caption&&<div style={{color:'#fff',fontSize:13,marginTop:10,opacity:.8}}>{viewPhoto.caption}</div>}
      </div>}
    </div>
  );
}
