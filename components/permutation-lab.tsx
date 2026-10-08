"use client";
import {useState,useMemo} from 'react';
import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';
import {Segments,Talk,Insight,Deeper,Formula,Frac,Metric,Legend,Quiz,Plot,BLUE,ORANGE,type LabProps,type Question} from './learning-ui';
import {Decision} from './distribution-ui';
import {assignments,moreExtreme,shuffled,type Tail} from '@/lib/hypothesis';
import {fmt,pFmt} from '@/lib/stats';
const values=[42,47,53,56,50,58,62,65];
const question:Question={id:'permutation',prompt:'为什么不能只凭“两组均值相等”，就随便打乱组标签？',options:['因为置换必须要求正态分布','因为相同均值不保证两组分布相同，标签未必可交换','因为每组必须至少有 30 人'],correct:1,feedback:['置换可以不依赖正态总体，但仍然依赖合适的交换性或随机分配机制。','对。同均值、不同方差或形状时，未标准化均值差的简单置换不自动是均值零假设的精确检验。','完整置换甚至可以在很小的样本上做；关键是研究设计与零假设能否支撑等可能分组。']};
export function PermutationLab({solved,onSolve}:LabProps){
  const all=useMemo(()=>assignments(values,4),[]),order=useMemo(()=>[0,...shuffled(Array.from({length:all.length-1},(_,i)=>i+1),731)], [all.length]);
  const [shown,setShown]=useState(1),[tail,setTail]=useState<Tail>('right'),[selected,setSelected]=useState(0);
  const total=all.length,observed=all[0].difference,current=all[selected],visible=order.slice(0,shown).map(i=>all[i]),complete=shown===total;
  const extreme=all.filter(v=>moreExtreme(v.difference,observed,tail)).length,p=extreme/total;
  const lo=Math.floor(Math.min(...all.map(v=>v.difference)))-2,hi=Math.ceil(Math.max(...all.map(v=>v.difference)))+2;
  const seen=new Set(order.slice(0,shown));const stack=new Map<number,number>();
  const dots=visible.map((v)=>{const k=Math.round(v.difference*1000000)/1000000,y=(stack.get(k)??0)+1;stack.set(k,y);return{x:v.difference,y};});
  const ymax=Math.max(3,...dots.map(v=>v.y))+1;
  function add(count:number){const next=Math.min(total,shown+count);setShown(next);setSelected(order[next-1]);}
  return <><div className="experiment-shell"><div className="experiment-main">
    <div className="panel-top"><span className="section-label">07 / 分数不动，标签洗牌</span><span className="context-tag">4 人对 4 人 · 70 种分组</span></div>
    <p className="plot-note">8 人的任务成绩已经摆好。原始 A、B 各 4 人。观察到的均值差始终固定为 {fmt(observed)}。</p>
    <div className="assignment-board"><div><span>A 组</span><div>{current.a.map((v,i)=><span className="score-tile group-a" key={i}>{v}</span>)}</div></div><div><span>B 组</span><div>{current.b.map((v,i)=><span className="score-tile group-b" key={i}>{v}</span>)}</div></div></div>
    <div className="current-assignment"><span>{selected===0?'原始分组':'当前查看的重新分组'}</span><strong>均值差 B − A = {fmt(current.difference)}</strong></div>
    <Plot xDomain={[lo,hi]} yDomain={[0,ymax]} xLabel="重新分组的均值差 T" yLabel="相同差值的分组数" height={260} label="完整标签置换下的均值差离散零分布">{({X,Y})=><>
      {dots.map((v,i)=><circle key={i} cx={X(v.x)} cy={Y(v.y)} r={4.5} fill={moreExtreme(v.x,observed,tail)?ORANGE:BLUE}><title>{`差值 ${fmt(v.x)}`}</title></circle>)}
      <line x1={X(observed)} x2={X(observed)} y1={Y(0)} y2={Y(ymax)} stroke={ORANGE} strokeWidth={2} strokeDasharray="5 4"/>
      {tail==='two'&&<line x1={X(-Math.abs(observed))} x2={X(-Math.abs(observed))} y1={Y(0)} y2={Y(ymax)} stroke={ORANGE} strokeWidth={2} strokeDasharray="5 4"/>}
    </>}</Plot>
    <Legend items={[[BLUE,'每个圆点是一种等可能分组'],[ORANGE,'至少与原始观察同样极端']]}/>
    <div className="permutation-progress"><Progress value={shown/total*100} aria-label={`已展开 ${shown} 种，共 ${total} 种分组`}/><span>已展开 {shown} / {total}</span></div>
    <div className="permutation-grid" aria-label="全部分组一览">{all.map((v,i)=><button key={i} disabled={!seen.has(i)} className={`${seen.has(i)?'seen':''} ${seen.has(i)&&moreExtreme(v.difference,observed,tail)?'extreme':''} ${selected===i?'selected':''}`} onClick={()=>setSelected(i)} aria-label={`查看第 ${i+1} 种分组${seen.has(i)?`，差值 ${fmt(v.difference)}`:'，尚未展开'}`}>{seen.has(i)?i+1:'·'}</button>)}</div>
  </div><aside className="control-panel"><div className="equation-card"><span>等可能的世界有多少种？</span><div>C(8, 4)<br/>= <em>70</em></div></div>
    <Segments value={tail} onChange={v=>setTail(v as Tail)} label="置换的极端方向" options={[["right","B 更高"],["two","两边都算"]]}/>
    <Button className="primary-action" disabled={complete} onClick={()=>add(1)}>再展开一种分组</Button>
    <Button variant="outline" disabled={complete} onClick={()=>add(10)}>再展开 10 种</Button>
    <Button variant="outline" disabled={complete} onClick={()=>{setShown(total);setSelected(0);}}>一次展开全部 70 种</Button>
    <Button variant="ghost" onClick={()=>{setShown(1);setSelected(0);}}>回到原始分组</Button>
    {complete?<><Metric label="至少同样极端的分组数" value={`${extreme} / ${total}`}/><Metric label="完整枚举的精确 p" value={pFmt(p)} color={ORANGE}/><Decision p={p}/></>:<div className="control-note">先把分组看全，再报告精确 p。当前的展示进度不被当作一个近似检验。</div>}
    <p className="control-note">这里的零假设设定为两独立组来自同一总体分布，观测在组标签下可交换。标签重新分配时始终保持每组 4 人。</p>
  </aside></div>
  <Talk question="没有套一条正态曲线，p 值怎么还算得出来？"><p>我们直接列出了零假设下所有等可能的分组。每组算一个统计量，数一数有多少至少和原来一样极端，就得到尾部概率。参考分布可以长成台阶，不必是一条光滑曲线。</p></Talk>
  <Insight>变的是分组标签，数据值与每组人数不变。置换把“如果没有组别差异，这些标签可以怎样重新分配”变成一个可数清的零假设世界。</Insight>
  <Deeper items={[
    {title:'这 70 种分组，为什么不是 8! 种？',content:<><p>只需从 8 个人中选出 4 个放入 A，剩下自动进入 B。同一组内部排队的先后顺序不改变均值差，因此不额外计算。</p><Formula>C(8,4) = <Frac top="8!" bottom="4! × 4!"/> = 70</Formula><p>在交换性成立时，每种单位分配等可能。即使两个人成绩相同，身份不同仍然对应不同分配，不能只保留不重复的数值组合。</p></>},
    {title:'p 的分母里，要不要算上原始分组？',content:<><p>完整枚举包含原始分组。它至少与自己一样极端，因此必须计入分子和分母。</p><Formula>p = <Frac top="至少同样极端的分组数" bottom="全部等可能分组数"/></Formula><p>所以这里的 p 有离散台阶，不会因为有限枚举中没找到“更大”的值就变成 0。若只随机抽取 B 次置换，常用 (b+1)/(B+1) 的 Monte Carlo 计算；不要再把它与完整枚举的公式混用。</p></>},
    {title:'非参数检验真的没有假设吗？',content:<><p>没有要求一切都正态，并不等于没有要求。直接打乱独立组标签，依赖零假设下的交换性；两组均值相同、但方差或分布形状不同，不自动满足这个条件。</p><p>随机分配实验可以在相应“每个单位都无处理效应”的尖锐零假设下，依据真实分配机制做随机化检验。配对、分层、整群等设计，也需要相应受限的置换方式。</p><p>这是用研究设计和交换性构造参考分布，而不是把所有模型条件删除。</p></>},
    {title:'能把均值差换成中位数或秩吗？',content:<><p>可以，但换统计量是在换你对差异的关注方式，必须连同目标和解释一起考虑。对每一种允许的分组重新算新统计量，才能形成它自己的参考分布。</p><p>当前用 T=均值差，因此叫“均值差置换检验”。若使用标准化的 t 统计量，才是置换 t 检验。秩检验也不自动等价于一个纯粹的中位数检验。</p><p>参数与非参数方法各有条件和效能表现，不能笼统说哪一类永远更强。</p></>}
  ]}/><Quiz q={question} solved={solved.has(question.id)} onSolve={onSolve}/></>;
}
