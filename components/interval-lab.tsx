"use client";
import {useState,useMemo} from 'react';
import {Button} from '@/components/ui/button';
import {Range,Segments,Talk,Insight,Deeper,Formula,Frac,Metric,Legend,Quiz,Plot,Curve,BLUE,ORANGE,GREEN,type LabProps,type Question} from './learning-ui';
import {Density,Decision} from './distribution-ui';
import {drawSample,oneSample,tPDF,normalPDF} from '@/lib/hypothesis';
import {fmt,pFmt} from '@/lib/stats';
const question:Question={id:'interval',prompt:'同一方法的双侧 5% 检验与 95% 置信区间，怎样对应？',options:['候选 μ₀ 在区间外时，双侧检验拒绝它','区间中每个数都有 95% 的概率为真','区间里含有 95% 的个体数据'],correct:0,feedback:['对。用同一模型、标准误和双侧方法，区间正是未被拒绝的候选参数集合（端点按相应约定处理）。','区间是兼容候选值的集合，并没有为里面每个参数赋予概率。','这里是总体均值的区间，不是个体值的范围，也不是预测区间。']};
export function IntervalLab({solved,onSolve}:LabProps){
  const [n,setN]=useState(16),[seed,setSeed]=useState(351),[method,setMethod]=useState('t'),[mu0,setMu0]=useState(50),[tab,setTab]=useState('tails'),[B,setB]=useState(0);
  const sigma=10,trueMu=52,known=method==='z',values=useMemo(()=>drawSample(n,trueMu,sigma,seed),[n,seed]);
  const f=oneSample(values,mu0,.05,known?sigma:undefined),radius=Math.max(4.5,Math.abs(f.t)+1,f.c+.8),fn=(x:number)=>known?normalPDF(x):tPDF(x,f.df);
  const studies=useMemo(()=>Array.from({length:B},(_,i)=>oneSample(drawSample(n,trueMu,sigma,911+i*191),trueMu,.05,known?sigma:undefined)),[B,n,known]);
  const cover=studies.filter(v=>v.lo<=trueMu&&v.hi>=trueMu).length,recent=studies.slice(-40);
  const intervalLo=Math.min(mu0-1,trueMu-2,f.lo-2,...recent.map(v=>v.lo-1)),intervalHi=Math.max(mu0+1,trueMu+2,f.hi+2,...recent.map(v=>v.hi+1));
  return <><div className="experiment-shell"><div className="experiment-main">
    <div className="panel-top"><span className="section-label">04 / 当尺子也有不确定性</span><Button variant="ghost" className="quiet-button" onClick={()=>setSeed(v=>v+1)}>重抽这份样本</Button></div>
    <Segments value={tab} onChange={setTab} label="t 与区间实验" options={[["tails","为什么 t 的尾巴更厚"],["intervals","把检验反过来，得到区间"]]}/>
    <p className="plot-note">{tab==='tails'?`当前样本有 ${n} 个观测。${known?'把总体 σ=10 当作已知，使用 z。':'用当前样本 s 估计总体 σ，使用 t。'}`:'拖动候选 μ₀：点落到置信区间外时，看看双侧检验的决定。'}</p>
    {tab==='tails'?<>
      <Density from={-radius} to={radius} fn={fn} shades={[{from:-radius,to:-Math.abs(f.t)},{from:Math.abs(f.t),to:radius}]} marks={[{x:f.t,label:`${known?'z':'t'} = ${fmt(f.t)}`},{x:f.c,color:BLUE,dash:true},{x:-f.c,color:BLUE,dash:true}]} label="z 或 t 参考分布、双侧尾面积与拒绝门槛" xLabel={known?'z 统计量':`t 统计量（df=${f.df}）`} extra={p=>!known?<Curve fn={normalPDF} X={p.X} Y={p.Y} from={-radius} to={radius} color="#97aabd" dash="4 4" stroke={2}/>:null}/>
      <Legend items={[[BLUE,known?'标准正态参考分布':`t 分布 · df=${f.df}`],...(!known?[['#97aabd','标准正态，对照用'] as [string,string]]:[]),[ORANGE,'双侧 p 值面积']]}/>
    </>:<>
      <Plot xDomain={[intervalLo,intervalHi]} yDomain={[0,4]} height={230} xLabel="总体均值的候选值" yLabel="" label="当前置信区间与候选零假设均值">{({X,Y})=><>
        <line x1={X(f.lo)} x2={X(f.hi)} y1={Y(2)} y2={Y(2)} stroke={BLUE} strokeWidth={6} strokeLinecap="round"/>
        {[f.lo,f.hi].map(v=><g key={v}><line x1={X(v)} x2={X(v)} y1={Y(1.65)} y2={Y(2.35)} stroke={BLUE} strokeWidth={2}/><text x={X(v)} y={Y(.95)} textAnchor="middle" className="plot-annotation">{fmt(v,2)}</text></g>)}
        <circle cx={X(f.mean)} cy={Y(2)} r={6} fill="white" stroke={BLUE} strokeWidth={3}/>
        <line x1={X(mu0)} x2={X(mu0)} y1={Y(.4)} y2={Y(3.6)} stroke={ORANGE} strokeWidth={2} strokeDasharray="5 4"/>
        <text x={X(mu0)} y={Y(3.7)} textAnchor="middle" fill={ORANGE} className="plot-annotation">候选 μ₀ = {fmt(mu0,1)}</text>
      </>}</Plot>
      <div className="interval-equivalence"><span>95% CI：[{fmt(f.lo)}, {fmt(f.hi)}]</span><span>{mu0>=f.lo&&mu0<=f.hi?'候选值在区间内':'候选值在区间外'}</span></div>
      <p className="plot-note">区间由样本决定。仅改变待检验的 μ₀，区间位置不变，p 值会变。</p>
    </>}
    <div className="metrics-strip"><Metric label="样本均值 x̄" value={fmt(f.mean)}/><Metric label={known?'已知 σ / √n':'估计 SE = s / √n'} value={fmt(f.se)}/><Metric label="双侧 p 值" value={pFmt(f.p)} color={ORANGE}/></div>
  </div><aside className="control-panel"><div className="equation-card"><span>{known?'已知总体波动':'估计总体波动'}</span><div>{known?'Z':'T'} = <Frac top="X̄ − μ₀" bottom={known?'σ / √n':'s / √n'}/></div></div>
    <Segments value={method} onChange={v=>{setMethod(v);setB(0);}} label="标准差是否已知" options={[["t","σ 未知 · t"],["z","σ 已知 · z"]]}/>
    <Range label="这份样本的人数 n" value={n} onChange={v=>{setN(v);setB(0);}} min={4} max={120} step={4}/>
    <Range label="候选零假设均值 μ₀" value={mu0} onChange={setMu0} min={Math.floor(Math.min(35,f.lo-5,mu0))} max={Math.ceil(Math.max(70,f.hi+5,mu0))} step={.1} digits={1}/>
    <Metric label="当前样本标准差 s" value={fmt(f.s)}/><Metric label="双侧 5% 临界值" value={`± ${fmt(f.c,3)}`}/><Decision p={f.p}/>
    <p className="control-note">生成世界：独立 N(52, 10²) 观测。总体均值固定为 52。选择 t 时，分析只用样本估计 σ。</p>
  </aside></div>
  <Talk question="都叫标准化了，为什么 t 还比 z 多了一条尾巴？"><p>分母里的 s 也由这份样本估计，会忽大忽小。偶尔估得太小，t 就被放大了。t 分布把这份额外的不确定性算进去：相同 α 下，小样本需要更远的统计量才能越线。</p></Talk>
  <div className="coverage-card"><div className="panel-top"><div><span className="section-label">95% 是一套方法的长期表现</span><h3>真值不动，让区间一条条换。</h3></div><Button onClick={()=>setB(v=>Math.min(2000,v+100))} disabled={B>=2000}>重做 100 次并画区间</Button></div>
    {B?<><Plot xDomain={[intervalLo,intervalHi]} yDomain={[0,Math.max(1,recent.length)+1]} height={360} xLabel="总体均值 μ" yLabel="最近的研究" label="重复研究置信区间与固定真值">{({X,Y})=><>
      <line x1={X(trueMu)} x2={X(trueMu)} y1={Y(0)} y2={Y(recent.length+1)} stroke="#243e55" strokeWidth={2} strokeDasharray="5 4"/>
      {recent.map((v,i)=>{const yes=v.lo<=trueMu&&v.hi>=trueMu;return <g key={i}><line x1={X(v.lo)} x2={X(v.hi)} y1={Y(i+1)} y2={Y(i+1)} stroke={yes?BLUE:ORANGE} strokeWidth={2}/><circle cx={X(v.mean)} cy={Y(i+1)} r={2.4} fill={yes?BLUE:ORANGE}/></g>;})}
    </>}</Plot><div className="coverage-summary"><span>{B} 次研究</span><span>{cover} 个区间包含真值 52</span><strong>覆盖率 {fmt(cover/B*100,1)}%</strong></div><p className="tiny-note">图上展示最近 40 个区间，覆盖率使用全部 {B} 次研究。有限次数会波动，不必恰好为 95%。</p></>:<p className="empty-experiment">每次重新抽 n 个人、重新算均值和区间。先猜：100 条区间会不会恰好有 95 条包含真值？</p>}
  </div>
  <Insight>95% 描述随机区间生成方法的覆盖率。抽样完成后，这条区间已经固定；它没有自动给固定参数赋予“95% 落在这里”的概率。</Insight>
  <Deeper items={[
    {title:'自由度 n − 1，是谁拿走了一个位置？',content:<><p>估计完均值后，n 个离均差之和必须为 0。前 n − 1 个确定，最后一个就被约束住。这是样本方差分母使用 n − 1 的一个直观入口。</p><Formula>s² = <Frac top="Σ(xᵢ − x̄)²" bottom="n − 1"/></Formula><p>在独立正态样本中，T=(X̄−μ₀)/(s/√n) 在 H₀ 下精确服从 tₙ₋₁。自由度增大时，s 的相对波动通常减小，t 分布逐渐接近标准正态。</p><p>s² 是 σ² 的无偏估计，不代表开平方后的 s 也是 σ 的无偏估计。</p></>},
    {title:'置信区间怎样从检验里反解出来？',content:<><p>对每一个候选 μ₀，都做同一个双侧检验。保留那些没有被拒绝的值，就是与检验配套的区间。</p><Formula>|(x̄ − μ₀)/SE| ≤ c<br/>⇔ x̄ − c·SE ≤ μ₀ ≤ x̄ + c·SE</Formula><p>这条对偶关系要求模型、标准误、置信水平、单双侧和方法互相匹配。不能拿单侧 p 值与双侧 95% 区间直接对照。</p></>},
    {title:'数据不正态，t 检验就一定不能用吗？',content:<><p>精确的小样本 t 结论依赖正态等条件。对适当的非正态总体，大样本下可获得近似推断；近似质量受偏态、重尾、离群值和样本量影响。</p><p>不能仅凭“样本均值大致正态”就宣称有限样本的统计量精确服从 t。也不能用一个正态性检验不显著，来证明总体正态。</p></>},
    {title:'单侧检验对应什么区间？',content:<><p>右侧 α 检验对应一个单侧置信下限：若下限高于 μ₀，就拒绝 H₀: μ≤μ₀。左侧则对应上限。</p><Formula>右侧 (1 − α) 下限：L = x̄ − t₁₋α,ₙ₋₁ · s/√n</Formula><p>单侧 95% 下限与双侧 95% 区间使用不同临界值，所以必须先讲清楚是哪一种。</p></>}
  ]}/><Quiz q={question} solved={solved.has(question.id)} onSolve={onSolve}/></>;
}
