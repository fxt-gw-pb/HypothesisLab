"use client";
import {useState,useMemo} from 'react';
import {Button} from '@/components/ui/button';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from '@/components/ui/table';
import {Range,Segments,Talk,Insight,Deeper,Formula,Frac,Metric,Legend,Quiz,Plot,Curve,BLUE,ORANGE,GREEN,type LabProps,type Question} from './learning-ui';
import {Area} from './distribution-ui';
import {normalPDF,critical,power,requiredN,drawSample,rejects,type Tail} from '@/lib/hypothesis';
import {mean,fmt} from '@/lib/stats';
const question:Question={id:'power',prompt:'固定有效的检验规则 α = 0.05，把计划样本量增大，通常发生什么？',options:['一类错误率自动趋近 0','给定真实效应的检验力提高，H₀ 下错误率仍由 α 控制','真实效应本身变大'],correct:1,feedback:['样本更多不等于拒绝规则更保守。按同一 α 校准的规则仍保留相应的误报预算。','对。更多信息让两个抽样分布更容易区分，但不会把设定的效应或 α 偷偷改掉。','样本量改变估计精度和侦测能力，不会替真实世界放大效应。']};
export function PowerLab({solved,onSolve}:LabProps){
  const [n,setN]=useState(36),[sigma,setSigma]=useState(12),[delta,setDelta]=useState(5),[alpha,setAlpha]=useState(.05),[tail,setTail]=useState<Tail>('right'),[B,setB]=useState(0),[target,setTarget]=useState(.8);
  const se=sigma/Math.sqrt(n),c=critical(alpha,tail)*se,pow=power(n,sigma,delta,alpha,tail),needed=requiredN(sigma,delta,alpha,tail,target);
  const lo=Math.min(-4.5*se,delta-4.5*se),hi=Math.max(4.5*se,delta+4.5*se),peak=normalPDF(0,0,se)*1.22;
  const rejectRegions=tail==='two'?[[lo,-c],[c,hi]]:[[c,hi]];
  const retainRegions=tail==='two'?[[-c,c]]:[[lo,c]];
  const sim=useMemo(()=>{let fp=0,tp=0;const zc=critical(alpha,tail);for(let i=0;i<B;i++){if(rejects(mean(drawSample(n,0,sigma,1201+i*127))/se,zc,tail))fp++;if(rejects(mean(drawSample(n,delta,sigma,3301+i*131))/se,zc,tail))tp++;}return{fp,tp};},[n,sigma,delta,alpha,tail,B,se]);
  function adjust(fn:(v:number)=>void,v:number){fn(v);setB(0);}
  return <><div className="experiment-shell"><div className="experiment-main">
    <div className="panel-top"><span className="section-label">03 / 同一个门槛，两个世界</span><span className="context-tag">独立正态观测，σ 已知</span></div>
    <Segments value={tail} onChange={v=>{setTail(v as Tail);setB(0);}} label="功效检验方向" options={[["right","只问是否增加"],["two","两个方向都查"]]}/>
    <p className="plot-note">蓝色世界：真实效应为 0。橙色世界：真实效应为 {fmt(delta,1)}。两边使用同一条拒绝规则。</p>
    <Plot xDomain={[lo,hi]} yDomain={[0,peak]} height={380} xLabel="样本均值 − 零假设均值" yLabel="概率密度" label="零假设与备择假设下的分布及两类错误区域">{({X,Y})=><>
      {rejectRegions.map(([a,b],i)=><Area key={`a${i}`} fn={x=>normalPDF(x,0,se)} from={Math.max(lo,a)} to={Math.min(hi,b)} X={X} Y={Y} color={BLUE} opacity={.35}/>)}
      {retainRegions.map(([a,b],i)=><Area key={`b${i}`} fn={x=>normalPDF(x,delta,se)} from={Math.max(lo,a)} to={Math.min(hi,b)} X={X} Y={Y} color={ORANGE} opacity={.2}/>)}
      {rejectRegions.map(([a,b],i)=><Area key={`p${i}`} fn={x=>normalPDF(x,delta,se)} from={Math.max(lo,a)} to={Math.min(hi,b)} X={X} Y={Y} color={GREEN} opacity={.32}/>)}
      <Curve fn={x=>normalPDF(x,0,se)} X={X} Y={Y} from={lo} to={hi}/><Curve fn={x=>normalPDF(x,delta,se)} X={X} Y={Y} from={lo} to={hi} color={ORANGE}/>
      {(tail==='two'?[-c,c]:[c]).map(v=><line key={v} x1={X(v)} x2={X(v)} y1={Y(0)} y2={Y(peak*.94)} stroke="#243e55" strokeDasharray="5 5"/>)}
      <text x={X(0)} y={Y(peak*.99)} className="plot-annotation" textAnchor="middle" fill={BLUE}>H₀</text><text x={X(delta)} y={Y(peak*.9)} className="plot-annotation" textAnchor="middle" fill={ORANGE}>真实效应 δ</text>
    </>}</Plot>
    <Legend items={[[BLUE,'α：H₀ 世界里的误报'],[ORANGE,'β：有效应世界里的漏报'],[GREEN,'1 − β：成功发现效应']]}/>
    <div className="metrics-strip"><Metric label="一类错误率 α" value={`${fmt(alpha*100,0)}%`} color={BLUE}/><Metric label="漏掉这个效应的概率 β" value={`${fmt((1-pow)*100,1)}%`} color={ORANGE}/><Metric label="检验力 1 − β" value={`${fmt(pow*100,1)}%`} color={GREEN}/></div>
    <div className="power-meter"><span style={{width:`${pow*100}%`}}/></div>
  </div><aside className="control-panel"><div className="equation-card"><span>真实差异，是事先设想的</span><div>δ = <em>{fmt(delta,1)}</em><br/><small>d = δ / σ = {fmt(delta/sigma,2)}</small></div></div>
    <Range label="真实效应 δ" value={delta} onChange={v=>adjust(setDelta,v)} min={.5} max={12} step={.5} digits={1}/>
    <Range label="计划样本量 n" value={n} onChange={v=>adjust(setN,v)} min={4} max={240} step={1}/>
    <Range label="个体噪声 σ" value={sigma} onChange={v=>adjust(setSigma,v)} min={4} max={24}/>
    <div><span className="control-label">α：愿意承担多少误报？</span><Segments value={String(alpha)} onChange={v=>adjust(setAlpha,Number(v))} label="功效显著性水平" options={[["0.01","1%"],["0.05","5%"],["0.1","10%"]]}/></div>
    <Button className="primary-action" onClick={()=>setB(v=>Math.min(2000,v+200))} disabled={B>=2000}>两个世界各重做 200 次</Button>
    <p className="control-note">{B?`各 ${B} 次研究：H₀ 世界误报 ${sim.fp} 次；有效应世界发现 ${sim.tp} 次。`:'先选好方案，再看看它反复运行的表现。'} 改方案后重新计数。</p>
  </aside></div>
  <Talk question="α 和 β 为什么加起来不是 1？"><p>因为它们来自两张不同的概率账本。α 的前提是 H₀ 为真；β 的前提是某个具体效应确实存在。只有同一个世界里，“拒绝”和“不拒绝”的概率才相加为 1。</p></Talk>
  <div className="results-table"><Table><TableHeader><TableRow><TableHead>真实世界</TableHead><TableHead>不拒绝 H₀</TableHead><TableHead>拒绝 H₀</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>H₀ 为真</TableCell><TableCell>正确不报 · 1 − α</TableCell><TableCell>一类错误 · α</TableCell></TableRow><TableRow><TableCell>真实效应为 δ</TableCell><TableCell>二类错误 · β(δ)</TableCell><TableCell>发现效应 · 1 − β(δ)</TableCell></TableRow></TableBody></Table></div>
  <div className="planning-card"><div><span className="section-label">研究开始前，先算算把握</span><h3>如果想有 {fmt(target*100,0)}% 的机会发现这个效应呢？</h3><p>在当前 σ、δ、α 和检验方向下，从 n = 4 起，逐个检查整数样本量。</p></div><Segments value={String(target)} onChange={v=>setTarget(Number(v))} label="目标检验力" options={[["0.8","80%"],["0.9","90%"],["0.95","95%"]]}/><div className="planning-answer"><span>n ≥ 4 范围内所需最小 n</span><strong>{needed??'> 10,000'}</strong><small>正态、σ 已知的单样本设计；实际研究还需考虑设计与失访。</small></div></div>
  <Insight>样本更多，抽样分布变窄；效应更大，两世界离得更远；噪声更小，更容易分清。放宽 α 也能提高检验力，但同时增加误报。</Insight>
  <Deeper items={[
    {title:'功效公式为什么就是另一条曲线下面积？',content:<><p>右侧拒绝门槛由 H₀ 定为 μ₀ + z₁₋α·SE。在真实均值 μ₀ + δ 的世界里，重新计算越过这条固定线的概率。</p><Formula>Power(δ) = 1 − Φ(z₁₋α − δ / SE)<br/>SE = σ / √n</Formula><p>这不是“本次结论正确的概率”。它是指定方案面对指定真实效应时的长期发现概率。备择假设含许多效应，因此有一条功效函数，不是唯一一个 β。</p></>},
    {title:'显著说明效应很大吗？',content:<><p>同样大小的差异，在 SE 很小时更容易显著。很小的实际效应也可以被大样本精确发现。是否有实际意义，要看原始单位下的效应、可信的区间，以及领域中的重要程度。</p><p>更大的样本本身不是问题。不要为了避免发现小效应而故意牺牲精度；应事先说明有意义的效应大小，并把估计值和区间一起报告。</p></>},
    {title:'为什么不能边看 p 值，边补样本直到显著？',content:<><p>固定样本量的检验，只为预先约定的一次分析校准了 α。若不断查看，每次都给自己一次越线机会，并在第一次显著时停止，整个程序的误报率会改变。</p><p>需要中途查看时，应提前设计相应的序贯检验或错误率控制规则。这里的样本量旋钮是在比较事先制定的方案，不是建议追着 p 值收数据。</p></>},
    {title:'没显著，是不是说明两边差不多？',content:<><p>可能真的没有差异，也可能效应小、噪声大，或样本还不足以提供精确判断。看区间是否仍容许有实际意义的差异，比把 p 大直接翻译成“相同”更有信息。</p><p>如果研究目标是支持差异足够小，应事先界定等效范围，并采用匹配的等效性分析；普通差异检验的不显著不能完成这个任务。</p></>}
  ]}/><Quiz q={question} solved={solved.has(question.id)} onSolve={onSolve}/></>;
}
