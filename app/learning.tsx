"use client";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {SidebarProvider,Sidebar,SidebarHeader,SidebarContent,SidebarFooter,SidebarMenu,SidebarMenuItem,SidebarMenuButton,SidebarInset,useSidebar} from '@/components/ui/sidebar';
import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';
import {Menu,Check,ScanLine,BarChart3,AudioLines,GitCompare,Users,Shuffle,Target,Sigma} from 'lucide-react';
import {NullLab} from '@/components/null-lab';
import {SamplingLab} from '@/components/sampling-lab';
import {PowerLab} from '@/components/power-lab';
import {IntervalLab} from '@/components/interval-lab';
import {IndependentLab} from '@/components/independent-lab';
import {PairedLab} from '@/components/paired-lab';
import {PermutationLab} from '@/components/permutation-lab';
import {FinalChallenge} from '@/components/final-challenge';
const guides=[
"假设检验先设定零假设，再看观测数据有多反常。先拖动平均重量，观察橙色尾面积与 p 值；再改 α，比较决定。",
"这里把个体值和一批人的平均值放在一起比较。先增加每次抽取人数 n，看均值分布变窄；再增加重复次数，比较两者的作用。",
"同一检验规则既可能误报，也可能漏掉真实效应。先增加计划样本量，观察检验力；再重做两种世界的研究，比较实际计数。",
"总体标准差未知时，检验要用样本来估计波动。先切换 t 与 z，比较尾部；再打开区间视图，移动候选均值。",
"两组均值差的精度取决于各组人数和波动。先减少 A 组人数、增大 σA，再切换 Welch 与汇合 t，观察标准误。",
"先打乱后测身份，看均值不变时差值的散布和标准误如何变化，再恢复身份作比较。",
"这个实验按可交换标签的假设，枚举所有可能分组。先逐步展开，观察均值差怎样分布；全部展开后再读精确 p 值。",
"这十道题连起前面的实验。选一个答案，读完反馈再继续；答错可以重选，也可以回到对应实验核对。",
];
const lessons=[
{title:'先住进 H₀ 的世界',short:'p 值与拒绝域',headline:'这点差异，是偶然在捣乱吗？',kicker:'先假装没有变化，再看数据有多反常',icon:ScanLine,key:'null'},
{title:'一批人，一个平均数',short:'密度、SE 与抽样分布',headline:'人很分散，平均值却很稳？',kicker:'别把个体的分布，认成均值的分布',icon:BarChart3,key:'sampling'},
{title:'报警器也会犯两种错',short:'α、β 与检验力',headline:'怕误报，也怕漏掉真变化。',kicker:'同一个规则，在两个世界里会怎样',icon:AudioLines,key:'power'},
{title:'连尺子也会晃',short:'t 检验与置信区间',headline:'不知道 σ，就多算一层不确定性。',kicker:'从一个候选假设，走向一整个候选区间',icon:ScanLine,key:'interval'},
{title:'两组差多少，才算多',short:'独立样本与 Welch',headline:'均值在相减，波动却要相加。',kicker:'两边都不确定，不能漏算任何一边',icon:GitCompare,key:'independent'},
{title:'别把同一个人拆散',short:'配对与协方差',headline:'先认对人，再算变化。',kicker:'共同的起点，可能在作差时抵消',icon:Users,key:'paired'},
{title:'打乱标签，重造世界',short:'精确置换检验',headline:'没有钟形曲线，也能数出 p。',kicker:'让全部等可能分组，交出自己的答案',icon:Shuffle,key:'permutation'},
{title:'直觉通关挑战',short:'把判断说清楚',headline:'这一次，让理由站得住。',kicker:'不是认出公式，而是认清它回答的问题',icon:Target,key:'final'}];
const Labs=[NullLab,SamplingLab,PowerLab,IntervalLab,IndependentLab,PairedLab,PermutationLab,FinalChallenge];
function Navigation({active,onSelect,solved}:{active:number;onSelect:(n:number)=>void;solved:Set<string>}){const{setOpenMobile}=useSidebar();return <Sidebar className="lab-sidebar"><SidebarHeader><div className="brand"><div className="brand-icon">p</div><div>假设检验实验室<small>把反常，变成可以计算的证据</small></div></div></SidebarHeader><SidebarContent><div className="sidebar-caption">八次实验，拆开统计直觉</div><SidebarMenu>{lessons.map((l,i)=>{const Icon=l.icon,done=i===7?[...solved].filter(k=>k.startsWith('final')).length===10:solved.has(l.key);return <SidebarMenuItem key={l.key}><SidebarMenuButton isActive={active===i} className="lesson-nav" onClick={()=>{onSelect(i);setOpenMobile(false);}}><span className="lesson-num">{String(i+1).padStart(2,'0')}</span><div><span>{l.title}</span><small>{l.short}</small></div>{done?<Check size={17} className="nav-done"/>:<Icon size={16} className="nav-icon"/>}</SidebarMenuButton></SidebarMenuItem>;})}</SidebarMenu><div className="sidebar-thinking"><Sigma size={23}/><p>先说清假设，<br/>再让数据开口。</p><span>小概率，不等于不可能。</span></div></SidebarContent><SidebarFooter><div className="side-progress"><span>已理解的挑战</span><span>{solved.size} / 17</span></div><Progress value={solved.size/17*100} aria-label={`已理解 ${solved.size} 道，共 17 道挑战`}/></SidebarFooter></Sidebar>;}
function App(){const[active,setActive]=useState(0),[solved,setSolved]=useState<Set<string>>(new Set());const{toggleSidebar}=useSidebar();const state=useRef({active,solved});const pending=useRef<((value:unknown)=>void)|null>(null);function navigate(i:number){setActive(i);window.scrollTo({top:0,behavior:'instant'});}const solve=(id:string)=>setSolved(v=>new Set(v).add(id));
useEffect(()=>{state.current={active,solved};pending.current?.({experiment:active+1,title:lessons[active].title});pending.current=null;},[active,solved]);
useEffect(()=>{const context=(document as Document&{modelContext?:{registerTool:(t:unknown,o:unknown)=>void|Promise<void>}}).modelContext;if(!context?.registerTool)return;const life=new AbortController();const entries=[{name:'get_hypothesis_learning_state',title:'读取假设检验学习进度',description:'Read the current experiment and correctly solved challenge count.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>({experiment:state.current.active+1,title:lessons[state.current.active].title,solved:state.current.solved.size,total:17})},{name:'open_hypothesis_experiment',title:'打开假设检验实验',description:'Navigate to one of eight hypothesis testing experiments, preserving current session state.',inputSchema:{type:'object',properties:{experiment:{type:'integer',minimum:1,maximum:8}},required:['experiment'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:(input:unknown)=>{if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Expected experiment integer 1–8');const v=input as Record<string,unknown>,n=v.experiment;if(Object.keys(v).some(k=>k!=='experiment')||typeof n!=='number'||!Number.isInteger(n)||n<1||n>8)throw new Error('Expected experiment integer 1–8');if(state.current.active===n-1)return{experiment:n,title:lessons[n-1].title};return new Promise(resolve=>{pending.current=resolve;navigate(n-1);});}}];for(const entry of entries){try{void Promise.resolve(context.registerTool(entry,{signal:life.signal})).catch(()=>{});}catch{}}return()=>life.abort();},[]);
const current=lessons[active];return <><Navigation active={active} onSelect={navigate} solved={solved}/><SidebarInset className="app-main"><header className="topbar"><div className="topbar-left"><Button className="mobile-menu" size="icon" variant="ghost" aria-label="打开学习目录" onClick={toggleSidebar}><Menu size={20}/></Button><span>假设检验</span><span className="topbar-slash">/</span><span>{current.short}</span></div><span className="chapter-pill">{String(active+1).padStart(2,'0')} / 08</span></header><div className="lesson-content"><div className="lesson-heading"><div className="eyebrow"><span>实验 {String(active+1).padStart(2,'0')}</span><i/>{current.kicker}</div><h1>{current.headline}</h1><p className="lesson-guide">{guides[active]}</p></div>{Labs.map((Lab,i)=><div key={i} hidden={active!==i}><Lab solved={solved} onSolve={solve}/></div>)}<div className="lesson-navigation"><span>{active+1} / 8</span><div>{active>0&&<Button variant="outline" onClick={()=>navigate(active-1)}>上一个实验</Button>}{active<7&&<Button className="next-lesson" onClick={()=>navigate(active+1)}>继续：{lessons[active+1].title}</Button>}</div></div></div></SidebarInset></>;}
export default function Learning(){return <SidebarProvider style={{'--sidebar-width':'264px'} as CSSProperties}><App/></SidebarProvider>;}
