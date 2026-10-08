"use client";
import {useState,useMemo} from 'react';
import {Button} from '@/components/ui/button';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from '@/components/ui/table';
import {Range,Segments,Talk,Insight,Deeper,Formula,Frac,Metric,Legend,Quiz,Plot,BLUE,ORANGE,type LabProps,type Question} from './learning-ui';
import {Density,Decision} from './distribution-ui';
import {drawSample,twoSample,tPDF} from '@/lib/hypothesis';
import {fmt,pFmt} from '@/lib/stats';
const question:Question={id:'independent',prompt:'独立两组做均值相减，为什么标准误里的两项方差反而相加？',options:['因为相减时随机误差总是方向相反','两组均值都在独立波动，协方差项为 0','只有两组样本量相等才可以相加'],correct:1,feedback:['随机误差不会总按某个方向配合。需要从方差与协方差的运算出发。','对。Var(X̄B−X̄A)=Var(X̄B)+Var(X̄A)−2Cov；独立使最后一项为 0。','不要求 n 相等。两组分别贡献 σA²/nA 与 σB²/nB。']};
export function IndependentLab({solved,onSolve}:LabProps){
  const [n1,setN1]=useState(12),[n2,setN2]=useState(36),[s1,setS1]=useState(12),[s2,setS2]=useState(5),[delta,setDelta]=useState(5),[seed,setSeed]=useState(71),[method,setMethod]=useState('welch');
  const a=useMemo(()=>drawSample(n1,50,s1,seed),[n1,s1,seed]),b=useMemo(()=>drawSample(n2,50+delta,s2,seed+517),[n2,s2,delta,seed]);
  const w=twoSample(a,b),pooled=twoSample(a,b,true),f=method==='welch'?w:pooled;
  const lo=Math.min(...a,...b)-3,hi=Math.max(...a,...b)+3,radius=Math.max(4.5,Math.abs(f.t)+1);
  return <><div className="experiment-shell"><div className="experiment-main">
    <div className="panel-top"><span className="section-label">05 / 比较两批不同的人</span><Button variant="ghost" className="quiet-button" onClick={()=>setSeed(v=>v+1)}>两组都重抽</Button></div>
    <p className="plot-note">A、B 来自独立的正态总体。让“更小的组”波动更大，看看汇合方差与 Welch 会怎样。</p>
    <Plot xDomain={[lo,hi]} yDomain={[0,3]} height={230} xLabel="测量值" yLabel="" label="两个独立样本的散点与组均值">{({X,Y})=><>
      {[a,b].map((values,g)=><g key={g}><text x={X(lo+.2)} y={Y(g===0?2.55:.98)} className="plot-annotation" fill={g===0?BLUE:ORANGE}>{g===0?'A 组':'B 组'}</text>{values.map((v,i)=><circle key={i} cx={X(v)} cy={Y((g===0?2:.55)+((i%5)-2)*.065)} r={4} fill={g===0?BLUE:ORANGE} opacity={.65}/>)}<line x1={X(g===0?f.m1:f.m2)} x2={X(g===0?f.m1:f.m2)} y1={Y(g===0?1.65:.2)} y2={Y(g===0?2.35:.9)} stroke={g===0?BLUE:ORANGE} strokeWidth={3}/></g>)}
    </>}</Plot>
    <Segments value={method} onChange={setMethod} label="独立样本检验方法" options={[["welch","Welch · 分别估计方差"],["pooled","汇合 t · 假定方差相等"]]}/>
    <Density from={-radius} to={radius} fn={x=>tPDF(x,f.df)} shades={[{from:-radius,to:-Math.abs(f.t)},{from:Math.abs(f.t),to:radius}]} marks={[{x:f.t,label:`t = ${fmt(f.t)}`}]} height={260} xLabel={`参考 t 分布 · df=${fmt(f.df,1)}`} label="两独立样本检验的统计量与双侧尾概率"/>
    <div className="metrics-strip"><Metric label="均值差 B − A" value={fmt(f.difference)}/><Metric label="差值的标准误" value={fmt(f.se)}/><Metric label="双侧 p 值" value={pFmt(f.p)} color={ORANGE}/></div>
  </div><aside className="control-panel"><div className="equation-card"><span>两边的不确定性都要算</span><div>{method==='welch'?<>SE² = <Frac top="sA²" bottom="nA"/> + <Frac top="sB²" bottom="nB"/></>:<>SE² = sp²<br/>× (1/nA + 1/nB)</>}</div></div>
    <Range label="A 组人数 nA" value={n1} onChange={setN1} min={4} max={100} step={4}/>
    <Range label="B 组人数 nB" value={n2} onChange={setN2} min={4} max={100} step={4}/>
    <Range label="A 总体标准差 σA" value={s1} onChange={setS1} min={2} max={18}/>
    <Range label="B 总体标准差 σB" value={s2} onChange={setS2} min={2} max={18}/>
    <Range label="真实均值差 μB − μA" value={delta} onChange={setDelta} min={-10} max={10} step={.5} digits={1}/>
    <Decision p={f.p}/><p className="control-note">H₀: μB − μA = 0；H₁: μB − μA ≠ 0。生成用的 σ 已设定，检验计算只使用样本标准差。</p>
  </aside></div>
  <Talk question="不是只问两个平均数差多少吗？怎么还要管每组的波动？"><p>同样差 5 分，如果每组都稳定得像尺子，和每组都晃得像过山车，证据当然不同。两组均值的不确定性一起进入分母，才能知道“差这么多”究竟有多反常。</p></Talk>
  <div className="results-table"><div className="section-label">同一份数据，用两把不同的尺子</div><Table><TableHeader><TableRow><TableHead>方法</TableHead><TableHead>SE</TableHead><TableHead>自由度</TableHead><TableHead>p</TableHead><TableHead>95% CI</TableHead></TableRow></TableHeader><TableBody>{[['Welch',w],['汇合 t',pooled]].map(([name,r])=>{const v=r as typeof w;return <TableRow key={name as string}><TableCell>{name as string}</TableCell><TableCell>{fmt(v.se,3)}</TableCell><TableCell>{fmt(v.df,2)}</TableCell><TableCell>{pFmt(v.p)}</TableCell><TableCell>[{fmt(v.lo)}, {fmt(v.hi)}]</TableCell></TableRow>;})}</TableBody></Table></div>
  <Insight>Welch 不要求两组总体方差相等，分别估计两边的波动，并调整参考自由度。选方法应依据研究设计和假设，不应挑那一个更小的 p 值。</Insight>
  <Deeper items={[
    {title:'减去一个会晃的数，为什么不会更稳定？',content:<><Formula>Var(X̄B − X̄A)<br/>= Var(X̄B) + Var(X̄A) − 2Cov(X̄A, X̄B)</Formula><p>对独立样本，协方差为 0。A 比真实均值偏低时，差值会被抬高；B 偏高时，差值也会被抬高。两个来源的不确定性都会贡献差值的方差。</p><Formula>SE = √(σA²/nA + σB²/nB)</Formula></>},
    {title:'Welch 的自由度为什么有小数？',content:<><p>把两份方差估计加起来后，分母的不确定性不再由简单的 nA+nB−2 完整描述。Welch–Satterthwaite 公式用一个近似自由度匹配它的波动，因此通常不是整数。</p><Formula>ν = <Frac top="(sA²/nA + sB²/nB)²" bottom="(sA²/nA)²/(nA−1) + (sB²/nB)²/(nB−1)"/></Formula><p>这称为 Welch t 检验。它使用近似 t 参考分布，不是 Wilcoxon 检验，也不是简单把两组人数加起来。</p></>},
    {title:'汇合方差是在“汇合”什么？',content:<><p>若独立正态两组具有共同总体方差，可以让两组一起估计这一个共同量。权重是各自的自由度，而不是简单平均标准差。</p><Formula>sp² = <Frac top="(nA−1)sA² + (nB−1)sB²" bottom="nA+nB−2"/><br/>SE = sp · √(1/nA + 1/nB)</Formula><p>总体方差确实相等时，汇合 t 的参考自由度为 nA+nB−2。若方差不同且人数不平衡，盲目汇合可能让错误率偏离预设水平。</p></>},
    {title:'先检验方差齐性，再决定用哪个 t，行不行？',content:<><p>方差检验不显著，只是没有足够证据拒绝方差相等，并没有证明它。用一次预检验的 p 值机械切换方法，还会让整个流程的性质更复杂。</p><p>在独立组均值比较中，可以直接使用不强求方差相等的 Welch 方法，再结合分布形态、离群值与样本量判断推断是否可靠。</p><p>正态独立样本下，样本方差比在方差相等时服从 FₙA₋₁,ₙB₋₁；这项经典 F 检验对非正态性敏感。</p></>}
  ]}/><Quiz q={question} solved={solved.has(question.id)} onSolve={onSolve}/></>;
}
