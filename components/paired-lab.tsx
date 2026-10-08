"use client";
import {useState,useMemo} from 'react';
import {Button} from '@/components/ui/button';
import {Range,Segments,Talk,Insight,Deeper,Formula,Frac,Metric,Legend,Quiz,Plot,BLUE,ORANGE,type LabProps,type Question} from './learning-ui';
import {Histogram,Decision} from './distribution-ui';
import {pairedData,oneSample,covariance,shuffled} from '@/lib/hypothesis';
import {mean,sd,fmt,pFmt} from '@/lib/stats';
const question:Question={id:'paired',prompt:'同一批人做前后测，判断是否使用配对分析，主要依据什么？',options:['样本相关系数的 p 值是否显著','研究设计中每个人前后测的对应关系','哪一种分析得到更小的 p 值'],correct:1,feedback:['配对身份在采集数据时就已存在，不能由一次相关性检验决定。','对。先确定谁和谁构成一对，再分析每一对的差值。对与对之间仍需满足独立等条件。','结果是否好看不能改变设计。为了更小的 p 选择配对或不配对，会破坏推断。']};
export function PairedLab({solved,onSolve}:LabProps){
  const [n,setN]=useState(24),[rho,setRho]=useState(.8),[delta,setDelta]=useState(4),[seed,setSeed]=useState(812),[scrambled,setScrambled]=useState(false),[view,setView]=useState('pairs');
  const points=useMemo(()=>pairedData(n,rho,delta,10,seed),[n,rho,delta,seed]),after=scrambled?shuffled(points.after,seed+531):points.after;
  const originalD=points.after.map((x,i)=>x-points.before[i]),differences=after.map((x,i)=>x-points.before[i]);
  const original=oneSample(originalD,0),f=oneSample(differences,0),sa=sd(points.before),sb=sd(after),cov=covariance(points.before,after),corr=cov/(sa*sb),naive=Math.sqrt((sa*sa+sb*sb)/n);
  const lo=Math.min(...points.before,...after)-4,hi=Math.max(...points.before,...after)+6,dlo=Math.min(-3,...differences)-2,dhi=Math.max(3,...differences)+2;
  return <><div className="experiment-shell"><div className="experiment-main">
    <div className="panel-top"><span className="section-label">06 / 一个人，前后各一次</span><Button variant="ghost" className="quiet-button" onClick={()=>{setSeed(v=>v+1);setScrambled(false);}}>换一批人</Button></div>
    <Segments value={view} onChange={setView} label="配对数据视角" options={[["pairs","把同一个人连起来"],["difference","每个人只留下一个差值"]]}/>
    <p className="plot-note">{scrambled?'现在故意打乱了后测身份。两列均值没变，但每个人的差值不再正确。':'两次任务得分按人一一对应。D = 后测 − 前测，正值表示得分增加。'}</p>
    {view==='pairs'?<Plot hideXTicks xDomain={[-.4,1.4]} yDomain={[lo,hi]} height={365} xLabel={scrambled?'错误的身份对应':'前测与后测'} yLabel="任务得分" label={scrambled?'打乱后测身份后的错误连线':'同一受试者前后得分的正确配对连线'}>{({X,Y})=><>
      {points.before.map((v,i)=><g key={i}><line x1={X(0)} x2={X(1)} y1={Y(v)} y2={Y(after[i])} stroke={scrambled?ORANGE:BLUE} strokeWidth={1.2} opacity={.28}/><circle cx={X(0)} cy={Y(v)} r={3.8} fill={BLUE} opacity={.7}/><circle cx={X(1)} cy={Y(after[i])} r={3.8} fill={ORANGE} opacity={.7}/></g>)}
      <text x={X(0)} y={Y(hi-1)} textAnchor="middle" className="plot-annotation">前测</text><text x={X(1)} y={Y(hi-1)} textAnchor="middle" className="plot-annotation">后测</text>
    </>}</Plot>:<Histogram values={differences} domain={[dlo,dhi]} bins={16} density={false} color={BLUE} height={350} xLabel="每个人的差值 D" observed={mean(differences)}/>}
    <Legend items={[[BLUE,'前测 / 个体差值'],[ORANGE,'后测 / 平均差值']]}/>
    <div className="metrics-strip"><Metric label="平均变化 D̄" value={fmt(f.mean)}/><Metric label="差值标准差 sD" value={fmt(f.s)}/><Metric label={scrambled?'错误配对的 SE':'配对标准误 sD / √n'} value={fmt(f.se)} color={ORANGE}/></div>
    {scrambled&&<div className="experiment-warning">打乱只是反例演示。这些差值不再来自同一个人，不能用它们报告配对检验结论。</div>}
  </div><aside className="control-panel"><div className="equation-card"><span>先求每个人的变化</span><div>Dᵢ = 后ᵢ − 前ᵢ</div></div>
    <Range label="成对人数 n" value={n} onChange={setN} min={4} max={80} step={4}/>
    <Range label="总体前后相关 ρ" value={rho} onChange={setRho} min={-.8} max={.95} step={.05} digits={2}/>
    <Range label="真实平均变化 δ" value={delta} onChange={setDelta} min={-8} max={8} step={.5} digits={1}/>
    <Button variant={scrambled?'default':'outline'} onClick={()=>setScrambled(v=>!v)}>{scrambled?'恢复每个人的身份':'故意打乱后测身份'}</Button>
    <Metric label="当前样本相关 r" value={fmt(corr,3)}/><Metric label="正确配对的双侧 p" value={pFmt(original.p)}/><Decision p={original.p}/>
    <p className="control-note">模拟前后观测为联合正态，各自 σ = 10。不同人之间独立。H₀: μD=0；H₁: μD≠0。结论始终使用正确的配对。</p>
  </aside></div>
  <Talk question="两列的平均数一点都没变，为什么打乱身份以后，标准误却变了？"><p>因为均值差只看两列平均，而配对分析还看每个人变化多少。正相关时，一起高、一起低的共同波动会在作差时抵消；负相关时，一高一低反而放大差值的波动。打乱对应关系，就把原有的配对信息扔掉了。</p></Talk>
  <div className="variance-board"><div><span className="section-label">差值方差，把协方差带上</span><Formula>sD² = s前² + s后² − 2s前,后</Formula><p>当前：{fmt(f.s*f.s)} = {fmt(sa*sa)} + {fmt(sb*sb)} − 2 × {fmt(cov)}</p></div><div><Metric label="正确配对的 SE" value={fmt(original.se)}/><Metric label="误当独立时计算的 SE" value={fmt(naive)}/></div></div>
  <Insight>配对 t 检验，就是对 n 个正确配对的差值做单样本 t 检验。分析单位是“一对”，自由度是 n − 1，不是 2n − 2。</Insight>
  <Deeper items={[
    {title:'配对是不是一定更省样本？',content:<><Formula>Var(D) = σ前² + σ后² − 2Cov(前, 后)</Formula><p>正相关时，共同起点抵消，差值方差通常更小。负相关时，协方差为负，减去它反而扩大差值方差。所以“配对总能提升精度”并不成立。</p><p>这里两边 σ 相同，理论上 Var(D)=2σ²(1−ρ)。把相关旋钮从 0.8 转到 −0.8，亲眼看看差值的波动。</p></>},
    {title:'配对 t 的正态性，应该检查哪一列？',content:<><p>检验统计量由 D₁,…,Dₙ 构造，小样本精确 t 推断的正态条件针对差值 D。没有必要要求前测和后测分别正态。</p><Formula>T = <Frac top="D̄ − δ₀" bottom="sD / √n"/>； df = n − 1</Formula><p>还要注意不同对之间的独立性、极端差值与缺失配对。任意两个独立样本不能因为人数相同就硬配成对。</p></>},
    {title:'前后显著变化，就能说训练造成了改善吗？',content:<><p>配对检验回答平均变化是否与某个零值相容。仅靠前后测，时间趋势、熟悉任务、回归均值等因素仍可能解释变化。</p><p>要回答干预是否造成变化，需要相应的对照、随机分配或其他因果识别设计。统计检验不能替研究设计补上这一环。</p></>}
  ]}/><Quiz q={question} solved={solved.has(question.id)} onSolve={onSolve}/></>;
}
