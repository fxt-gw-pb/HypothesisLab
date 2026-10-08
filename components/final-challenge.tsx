"use client";
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from '@/components/ui/table';
import {Check,Trophy} from 'lucide-react';
import {Quiz,Talk,type Question,type LabProps} from './learning-ui';
const questions:Question[]=[
{id:'final0',prompt:'一条概率密度曲线的最高处为 1.8，出错了吗？',options:['出错了，概率不能超过 1','没出错，密度的高度不等于概率','说明 180% 的人都在最高点'],correct:1,feedback:['限制在 0 到 1 的是概率。密度与长度形成面积，才得到区间概率。','对。改变单位或让分布更集中，密度高度可以超过 1，整条曲线下面积仍是 1。','连续变量恰好落在一点的概率为 0，不能把密度读成人数比例。']},
{id:'final1',prompt:'H₀: μ≤100，H₁: μ>100。观察到 z=−3，该用哪一个尾部？',options:['右尾，因此 p 很大','左尾，因为这边面积小','自动改成双侧检验'],correct:0,feedback:['对。研究方向事先设为更大，负向极端并不支持这个备择。','尾部不是看见结果后挑最小的，而是由预设备择和统计量决定。','可以讨论另一个问题，但不能看完方向后悄悄更换检验方案。']},
{id:'final2',prompt:'得到 p=.02，就能说“这次结论出错的概率是 2%”吗？',options:['能，p 就是错误率','不能，p 的条件是 H₀ 与模型条件成立','只有样本量大时才可以'],correct:1,feedback:['α 控制规则的长期误报；p 描述当前数据的尾部位置。都不自动给出本次结论出错的概率。','对。P(至少同样极端的数据 | H₀) 不能直接倒成 P(H₀ | 数据)。','增加样本量不会改变条件概率方向，这个解释在大样本下也不成立。']},
{id:'final3',prompt:'每次仍然只抽 20 人，把模拟次数增大十倍，会怎样？',options:['每次研究的 SE 缩小十倍','更清楚地看见原来的抽样分布','真实效应会更接近观察效应'],correct:1,feedback:['每次的信息量没有增加，理论 SE 不会因模拟更多次而縮小。','对。B 决定模拟精细程度，n 决定单次研究的信息量。','真实效应是生成世界的设定，重复模拟不会修改它。']},
{id:'final4',prompt:'为什么 t 的尾部通常比标准正态更厚？',options:['小样本会制造更多真实效应','估计标准差带来了随机分母的不确定性','因为 t 检验允许更大的 α'],correct:1,feedback:['样本量不会制造真实效应，需要区分参数和统计量的波动。','对。均值与估计标准差共同决定 t；额外不确定性由参考分布承担。','相同 α 也可以使用 t。更厚的尾部通常意味着需要更远的临界值。']},
{id:'final5',prompt:'独立两组人数与方差都可能不同，要比较均值，哪个说法准确？',options:['只能把两组都补到一样大','Welch 分别估计两组波动，并采用近似自由度','方差检验不显著就证明方差相等'],correct:1,feedback:['不等样本量不阻止比较，应把每组信息正确计入标准误。','对。SE=√(sA²/nA+sB²/nB)，自由度通常不是整数。','没有拒绝方差相等，不等于证明相等，小样本也可能缺乏识别能力。']},
{id:'final6',prompt:'24 人完整前后配对，配对 t 检验的自由度是多少？',options:['47，因为有 48 次测量','46，因为减去两个组均值','23，因为分析的是 24 个差值'],correct:2,feedback:['前后测属于同一个人，不能把每次测量当成独立分析单位。','这是把独立两组的思路搬过来了，配对分析是差值的单样本问题。','对。先按人求 24 个差值，再做单样本 t，df=24−1。']},
{id:'final7',prompt:'精确置换检验 p=.057，事先 α=.05。怎样报告？',options:['四舍五入算 .05，宣布拒绝','未达到预设阈值，同时报告效应与不确定性','证明两组完全相同'],correct:1,feedback:['不能通过事后舍入改变决定。.057 仍大于预设 .05。','对。遵守规则，也不把证据强弱简化成一堵突然跳变的墙。','不拒绝并不等于证明相同；离散 p 值要结合其他信息解释。']},
{id:'final8',prompt:'给定真实效应，检验力为 80%，它表达什么？',options:['显著以后，效应有 80% 的概率是真的','这个效应确实存在时，同样设计有 80% 的概率拒绝 H₀','80% 的个体都存在这个效应'],correct:1,feedback:['这是把发现概率倒成了结果真实性概率，还缺少其他建模信息。','对。还要说清真实效应、样本量、噪声、α 与检验方案。','功效讨论研究层面的拒绝概率，不描述个体发生比例。']},
{id:'final9',prompt:'想证实“差异小到可以忽略”，普通差异检验 p>.05 够不够？',options:['够，不显著就是等效','不够，要预先界定有意义的差异范围并做匹配分析','只要把 α 改成 .01 就够了'],correct:1,feedback:['不显著可能只是区间很宽，仍容许大的差异。','对。先定义什么叫足够接近，再用适当区间或等效性分析回答。','让普通差异检验更难拒绝，不能提供等效的正面证据。']}
];
export function FinalChallenge({solved,onSolve}:LabProps){const[index,setIndex]=useState(0),count=questions.filter(q=>solved.has(q.id)).length;return <>
<div className="challenge-header"><div><span className="section-label">最后十次追问</span><h2>小问：这回我来解释。</h2><p>阿 p：可以。每次先说清楚，你站在哪个假设世界里。</p></div><div className="challenge-score"><strong>{count}<small>/ 10</small></strong><Progress value={count*10} aria-label={`通关挑战已理解 ${count} 题`}/></div></div>
<div className="question-steps">{questions.map((q,i)=><Button key={q.id} variant="outline" className={i===index?'selected':''} aria-label={`第 ${i+1} 题${solved.has(q.id)?'，已理解':''}`} onClick={()=>setIndex(i)}>{solved.has(q.id)?<Check size={15}/>:i+1}</Button>)}</div>
{questions.map((q,i)=><div key={q.id} hidden={i!==index}><Quiz q={q} solved={solved.has(q.id)} onSolve={onSolve}/></div>)}
<div className="challenge-actions"><Button variant="outline" disabled={index===0} onClick={()=>setIndex(v=>v-1)}>上一题</Button><span>{index+1} / 10</span><Button variant="outline" disabled={index===9} onClick={()=>setIndex(v=>v+1)}>下一题</Button></div>
{count===10&&<div className="completion"><Trophy size={28}/><div><h2>不是记住了答案，是分清了问题。</h2><p>试着不看公式解释：为什么 p 不是 H₀ 的概率，为什么没显著不是没有差异，为什么同样差 5 分可能给出不同结论。</p></div></div>}
<div className="results-table"><h2>先问数据怎么来，再决定怎么算。</h2><Table><TableHeader><TableRow><TableHead>眼前的结构</TableHead><TableHead>统计量抓住什么</TableHead><TableHead>关键条件与参考</TableHead></TableRow></TableHeader><TableBody>
<TableRow><TableCell>单样本，σ 已知</TableCell><TableCell>均值偏离 μ₀ 多少个 SE</TableCell><TableCell>正态模型下用 z；适当大样本下可近似</TableCell></TableRow>
<TableRow><TableCell>单样本，σ 未知</TableCell><TableCell>用 s 估计均值的波动</TableCell><TableCell>独立正态样本下用 tₙ₋₁</TableCell></TableRow>
<TableRow><TableCell>两独立组</TableCell><TableCell>均值差与两边不确定性</TableCell><TableCell>Welch 分别估计方差；汇合 t 另需共同方差条件</TableCell></TableRow>
<TableRow><TableCell>同一人前后测</TableCell><TableCell>每一对的差值</TableCell><TableCell>差值的单样本 t；不同对之间独立</TableCell></TableRow>
<TableRow><TableCell>可交换的独立组标签</TableCell><TableCell>每种允许分组下的统计量</TableCell><TableCell>置换参考分布，条件由零假设与设计支撑</TableCell></TableRow>
</TableBody></Table></div><Talk question="最后，假设检验最应该记住哪一句？"><p>先把世界说清，再把波动算对。观察结果有多反常、规则会犯什么错、效应有多大，是三个需要分别回答的问题。</p></Talk></>;}
