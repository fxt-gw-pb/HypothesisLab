"use client";
import {useState,useMemo} from 'react';
import {Button} from '@/components/ui/button';
import {Range,Segments,Talk,Insight,Deeper,Formula,Frac,Metric,Legend,Quiz,BLUE,ORANGE,type LabProps,type Question} from './learning-ui';
import {Density,Decision} from './distribution-ui';
import {normalPDF,probability,critical,drawSample,rejects,type Tail} from '@/lib/hypothesis';
import {mean,fmt,pFmt} from '@/lib/stats';
const question:Question={id:'null',prompt:'p = 0.023，究竟是哪件事的概率约为 2.3%？',options:['H₀ 为真的概率','H₀ 与模型条件成立时，出现至少同样极端统计量的概率','这一次拒绝 H₀ 后，结论出错的概率'],correct:1,feedback:['p 的计算从 H₀ 成立出发，没有倒过来给 H₀ 分配概率。','对。先说清「在哪个世界里」，再说「哪些结果算更极端」。','这是把条件倒过来了。一次研究的 p 值不是这次结论的错误概率。']};
export function NullLab({solved,onSolve}:LabProps){
  const [observed,setObserved]=useState(104),[n,setN]=useState(36),[sigma,setSigma]=useState(12),[tail,setTail]=useState<Tail>('right'),[alpha,setAlpha]=useState(.05),[scale,setScale]=useState('raw'),[B,setB]=useState(0);
  const se=sigma/Math.sqrt(n),z=(observed-100)/se,p=probability(z,tail),c=critical(alpha,tail),standard=scale==='z';
  const transform=(v:number)=>standard?v:100+v*se;
  const radius=Math.max(4.2,Math.abs(z)+.9,Math.abs(c)+.7),lo=transform(-radius),hi=transform(radius),obs=transform(z);
  const fn=(x:number)=>standard?normalPDF(x):normalPDF(x,100,se);
  const shades=tail==='two'?[{from:lo,to:transform(-Math.abs(z))},{from:transform(Math.abs(z)),to:hi}]:tail==='right'?[{from:obs,to:hi}]:[{from:lo,to:obs}];
  const simulations=useMemo(()=>Array.from({length:B},(_,i)=>(mean(drawSample(n,100,sigma,163+i*97))-100)/se),[B,n,sigma,se]);
  const rejected=simulations.filter(v=>rejects(v,c,tail)).length;
  function change(fn:(v:number)=>void,v:number){fn(v);setB(0);}
  return <>
    <div className="experiment-shell"><div className="experiment-main">
      <div className="panel-top"><span className="section-label">01 / 先假装机器没有变</span><span className="context-tag">包装重量 · g</span></div>
      <div className="hypothesis-pair"><div><small>零假设 H₀</small><strong>μ {tail==='right'?'≤':tail==='left'?'≥':'='} 100</strong></div><div><small>备择假设 H₁</small><strong>μ {tail==='right'?'>':tail==='left'?'<':'≠'} 100</strong></div></div>
      <Segments value={tail} onChange={v=>{setTail(v as Tail);setB(0);}} label="检验方向" options={[["right","只问是否多装"],["two","多装、少装都问"],["left","只问是否少装"]]}/>
      <p className="plot-note">假设总体均值为 100 g。橙色面积：同样的研究重来时，至少这么极端的结果有多常见？</p>
      <Density from={lo} to={hi} fn={fn} shades={shades} marks={[{x:obs,label:`观察值 ${fmt(standard?z:observed,2)}`},{x:transform(c),color:BLUE,dash:true},...(tail==='two'?[{x:transform(-c),color:BLUE,dash:true}]:[])]} xLabel={standard?'z：离零假设均值多少个 SE':'样本平均重量 x̄（g）'} label="零假设分布、观察值与 p 值尾面积"/>
      <div className="plot-footer"><Legend items={[[BLUE,'H₀ 的参考分布 / 门槛'],[ORANGE,'p 值面积']]}/><Segments value={scale} onChange={setScale} label="横轴刻度" options={[["raw","原始单位"],["z","换成 z"]]}/></div>
      <div className="metrics-strip"><Metric label="标准误 SE" value={fmt(se)} note="平均值会晃多远"/><Metric label="标准化距离 z" value={fmt(z)} note="差多少 ÷ 晃多远"/><Metric label="p 值" value={pFmt(p)} color={ORANGE}/></div>
    </div><aside className="control-panel">
      <div className="equation-card"><span>先量距离，再量尾部</span><div>z = <Frac top="x̄ − 100" bottom="σ / √n"/></div></div>
      <Range label="观察到的平均重量" value={observed} onChange={setObserved} min={80} max={120} step={.1} digits={1} suffix=" g"/>
      <Range label="每次抽多少包 n" value={n} onChange={v=>change(setN,v)} min={4} max={200} step={4}/>
      <Range label="个体标准差 σ" value={sigma} onChange={v=>change(setSigma,v)} min={4} max={24} suffix=" g"/>
      <div><span className="control-label">事先约定的 α</span><Segments value={String(alpha)} onChange={v=>{setAlpha(Number(v));setB(0);}} label="显著性水平" options={[["0.01","1%"],["0.05","5%"],["0.1","10%"]]}/></div>
      <Decision p={p} alpha={alpha}/><p className="control-note">这里设定独立正态观测，σ 已知。方向与 α 应在看数据前确定；旋钮用于比较不同方案。</p>
    </aside></div>
    <Talk question="只要 p 很小，就能证明机器真的多装了吗？"><p>它说明：在 H₀ 和模型条件成立的世界里，这样的数据不常见。我们据此作出可犯错的统计判断；还要检查抽样、测量和模型条件，不能把低概率当成逻辑矛盾。</p></Talk>
    <Insight>p 值从这一次观察值往尾部量；α 在观察之前画下决策门槛。移动 α 会改变决定，不会改变这份数据的 p 值。</Insight>
    <div className="inline-lab"><div><h3>H₀ 明明为真，也会偶尔响警报。</h3><p>固定当前检验规则，在 μ = 100 的世界重新抽样。</p></div><Button onClick={()=>setB(v=>Math.min(2000,v+100))} disabled={B>=2000}>在 H₀ 下重做 100 次</Button><div className="inline-result" aria-live="polite">{B?`${B} 次研究中，${rejected} 次拒绝 H₀（${fmt(rejected/B*100,1)}%）`:'还没开始重复研究'}</div></div>
    <Deeper items={[
      {title:'为什么要量「至少同样极端」，不能只算眼前这个数？',content:<><p>连续分布中，恰好等于一个数的概率为 0。概率密度的高度也不是概率。我们用事先定义的统计量与极端方向，把观察值和更极端的结果合在一起，计算一块面积。</p><Formula>右侧：p = P₍H₀₎(Z ≥ zₒᵦₛ)<br/>双侧：p = P₍H₀₎(|Z| ≥ |zₒᵦₛ|)</Formula><p>对称的正态参考分布中，双侧 p 值是较小单侧尾概率的两倍。离散或不对称的检验，不应不加判断地照搬这一规则。</p></>},
      {title:'μ ≤ 100 是一整个世界，为什么只画 μ = 100？',content:<><p>对这个固定 σ 的右侧检验，μ 越小，出现大样本均值越困难。H₀ 内最容易误拒绝的位置恰好在边界 μ = 100。按这个最不利位置设置门槛，就控制了整个 μ ≤ 100 范围的一类错误率。</p><Formula>sup₍μ≤100₎ Pμ(拒绝 H₀) ≤ α</Formula><p>这不是把「≤」改成「=」后两条命题就等价，而是利用本模型的单调性，在边界校准规则。左侧检验同理。</p></>},
      {title:'为什么单侧 5% 用 1.645，双侧却用 1.960？',content:<><p>单侧把全部 5% 放在一个尾部。双侧需要把总预算分到两端，每端 2.5%。因此两个方向都查，单边就需要更远的观察值才能越线。</p><Formula>z₀.₉₅ ≈ 1.645； z₀.₉₇₅ ≈ 1.960</Formula><p>不能看见方向以后才挑较有利的单侧检验，否则原来承诺的错误率会改变。</p></>},
      {title:'p = 0.04 与 p = 0.06，差的是两个结论世界吗？',content:<><p>预设 α = 0.05 时，它们分处规则两侧，需要如实报告决定。但证据不会在 0.05 处突然跳变。解释结果时，应一起看效应估计、区间宽度与研究质量。</p><p>也不能因为 0.057「很接近」0.05，就在看过数据后把它改判为达到该阈值。灵活解释证据，与临时更改决策规则，是两件事。</p></>}
    ]}/><Quiz q={question} solved={solved.has(question.id)} onSolve={onSolve}/>
  </>;
}
