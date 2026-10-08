"use client";
import {useState,useMemo} from 'react';
import {Button} from '@/components/ui/button';
import {Range,Segments,Talk,Insight,Deeper,Formula,Frac,Metric,Legend,Quiz,Plot,Curve,BLUE,ORANGE,type LabProps,type Question} from './learning-ui';
import {Area,Histogram} from './distribution-ui';
import {drawSample,populationPDF,normalPDF,normalCDF,type Shape} from '@/lib/hypothesis';
import {mean,sd,fmt} from '@/lib/stats';
const question:Question={id:'sampling',prompt:'偏态总体中，把每次样本量从 5 增加到 100，哪句话最准确？',options:['总体里的个体值变成了正态分布','在适当条件下，标准化样本均值的分布更接近正态','只要重复模拟超过 100 次，就一定服从正态'],correct:1,feedback:['总体没有被改造。改变的是统计量在反复抽样中的分布。','这里三个总体都具有有限方差，且独立抽样。n 增大让标准化均值更接近正态；没有通用的神奇门槛。','重复次数 B 只是让我们更清楚地看见分布。它不能替代每次研究的样本量 n。']};
export function SamplingLab({solved,onSolve}:LabProps){
  const [view,setView]=useState('means'),[shape,setShape]=useState<Shape>('skew'),[n,setN]=useState(8),[B,setB]=useState(200),[bins,setBins]=useState(24),[standard,setStandard]=useState('raw');
  const [densitySigma,setDensitySigma]=useState(1),[low,setLow]=useState(-1),[high,setHigh]=useState(1);
  const mu=50,sigma=10,se=sigma/Math.sqrt(n);
  const individuals=useMemo(()=>drawSample(1000,mu,sigma,211,shape),[shape]);
  const means=useMemo(()=>Array.from({length:B},(_,i)=>mean(drawSample(n,mu,sigma,7001+i*83,shape))),[n,B,shape]);
  const rawDomain:[number,number]=[Math.min(mu-4*sigma,...individuals,...means)-1,Math.max(mu+4*sigma,...individuals,...means)+1];
  const mvalues=standard==='z'?means.map(v=>(v-mu)/se):means;
  const meanDomain:[number,number]=standard==='z'?[Math.min(-4,...mvalues)-.2,Math.max(4,...mvalues)+.2]:rawDomain;
  const densityPoints=useMemo(()=>drawSample(1000,0,densitySigma,313),[densitySigma]);
  const dRadius=Math.max(3.3,4*densitySigma,...densityPoints.map(Math.abs)),bw=2*dRadius/bins,counts=Array(bins).fill(0);
  densityPoints.forEach(x=>counts[Math.min(bins-1,Math.max(0,Math.floor((x+dRadius)/bw)))]++);
  const peak=Math.max(normalPDF(0,0,densitySigma),...counts.map(c=>c/1000/bw))*1.22;
  return <><div className="experiment-shell"><div className="experiment-main">
    <div className="panel-top"><span className="section-label">02 / 把平均值收集起来</span><span className="context-tag">一个点 ≠ 一次研究</span></div>
    <Segments value={view} onChange={setView} label="分布实验" options={[["means","均值为什么更稳定"],["density","高度不是概率"]]}/>
    {view==='means'?<>
      <div className="plot-title"><span className="number-chip">A</span><h3>总体：每个点，是一个个体。</h3></div>
      <Histogram values={individuals} domain={rawDomain} bins={bins} theory={x=>populationPDF(x,mu,sigma,shape)} height={225} xLabel="个体值 X"/>
      <div className="plot-title"><span className="number-chip coral">B</span><h3>抽样分布：每个点，是一批人的平均。</h3></div>
      <Histogram values={mvalues} domain={meanDomain} bins={bins} theory={x=>standard==='z'?normalPDF(x):normalPDF(x,mu,se)} color={ORANGE} height={260} xLabel={standard==='z'?'(X̄ − μ) / (σ / √n)':'样本均值 X̄'}/>
      <Legend items={[[BLUE,'1000 个独立个体'],[ORANGE,`${B} 次独立研究的均值`],['#203f58',shape==='normal'?'理论密度':'总体密度 / 正态近似']]}/>
      <p className="tiny-note">{standard==='raw'?'两张图共用同一横轴范围；纵轴都是密度，但刻度可不同。':'下图换成标准误单位，上图仍保留个体的原始单位。'} 虚线对偏态与双峰均值是近似，不是把模拟强行画成正态。</p>
      <div className="metrics-strip"><Metric label="总体个体 SD" value="10.00"/><Metric label="均值的理论 SE" value={fmt(se)} note="σ / √n"/><Metric label="模拟均值的 SD" value={fmt(sd(means))} color={ORANGE}/></div>
    </>:<>
      <p className="plot-note">让分箱变宽、变窄，再把 σ 调小。密度可以高过 1，但一块区域的概率不会超过 1。</p>
      <Plot xDomain={[-dRadius,dRadius]} yDomain={[0,peak]} xLabel="个体值 X" yLabel="概率密度" label="密度直方图与指定区间概率面积">{({X,Y})=><>
        {counts.map((v,i)=><rect key={i} x={X(-dRadius+i*bw)} y={Y(v/1000/bw)} width={X(bw)-X(0)-.6} height={Y(0)-Y(v/1000/bw)} fill={BLUE} opacity={.19}/>)}
        <Area fn={x=>normalPDF(x,0,densitySigma)} from={low} to={high} X={X} Y={Y}/>
        <Curve fn={x=>normalPDF(x,0,densitySigma)} from={-dRadius} to={dRadius} X={X} Y={Y}/>
        {[low,high].map(v=><line key={v} x1={X(v)} x2={X(v)} y1={Y(0)} y2={Y(normalPDF(v,0,densitySigma))} stroke={ORANGE} strokeWidth={2}/>)}
      </>}</Plot>
      <div className="metrics-strip"><Metric label={`P(${fmt(low,1)} ≤ X ≤ ${fmt(high,1)})`} value={`${fmt((normalCDF(high/densitySigma)-normalCDF(low/densitySigma))*100,1)}%`} color={ORANGE}/><Metric label="曲线最高处的密度" value={fmt(normalPDF(0,0,densitySigma))}/><Metric label="整条密度曲线的面积" value="1"/></div>
      <p className="tiny-note">柱子来自 1000 个观测，曲线是设定的正态总体。改变分箱改变柱形，不改变总体概率。</p>
    </>}
  </div><aside className="control-panel">
    {view==='means'?<><div className="equation-card"><span>不是个体变乖了</span><div>SE = <Frac top="10" bottom="√n"/></div></div>
      <div><span className="control-label">总体的模样</span><Segments value={shape} onChange={v=>setShape(v as Shape)} label="总体形状" options={[["normal","正态"],["skew","右偏"],["bimodal","双峰"]]}/></div>
      <Range label="每次抽取人数 n" value={n} onChange={setN} min={4} max={160} step={4}/>
      <div className="batch-count"><span>重复研究 B</span><strong>{B}</strong><small>改变 n 或总体后，重新生成同样次数的研究。</small></div>
      <Button className="primary-action" onClick={()=>setB(v=>Math.min(2000,v+100))} disabled={B>=2000}>再做 100 次研究</Button>
      <Button variant="outline" onClick={()=>setB(200)}>回到 200 次</Button>
      <Segments value={standard} onChange={setStandard} label="均值的单位" options={[["raw","原始单位"],["z","标准化均值"]]}/>
    </>:<><div className="equation-card"><span>记得把组距也除掉</span><div>面积<br/>= 高 × 宽</div></div>
      <Range label="总体标准差 σ" value={densitySigma} onChange={setDensitySigma} min={.2} max={2} step={.1} digits={1}/>
      <Range label="区间左端" value={low} onChange={setLow} min={-3} max={0} step={.1} digits={1}/>
      <Range label="区间右端" value={high} onChange={setHigh} min={0} max={3} step={.1} digits={1}/>
    </>}
    <Range label="直方图分箱数量" value={bins} onChange={setBins} min={8} max={40} step={2}/>
    <p className="control-note">这三个总体均有有限方差，观测独立同分布。每次 n 相同，模拟次数 B 单独计算。</p>
  </aside></div>
  <Talk question="我把研究重做一万遍，原来那次研究是不是就更精确了？"><p>原来那批人并没有增加。重复次数 B 让你更清楚地看见抽样分布；每次样本量 n 才决定均值有多稳定。别把两个旋钮拧成一个。</p></Talk>
  <Insight>假设检验比较的是统计量在 H₀ 下的分布。研究总体均值时，参考分布里的一个点是一份样本的平均值，绝不是一个人的测量值。</Insight>
  <Deeper items={[
    {title:'为什么 n 增加四倍，SE 才缩小一半？',content:<><p>独立观测的方差可以相加。均值先把 n 个值相加，再整体除以 n；缩放作用在方差上，需要平方。</p><Formula>Var(X̄) = <Frac top="nσ²" bottom="n²"/> = <Frac top="σ²" bottom="n"/><br/>SE(X̄) = σ / √n</Formula><p>σ 描述个体差异；SE 描述估计量的抽样波动。这里采用独立抽样模型；有聚类、时间相关或有限总体不放回抽样时，要按设计调整。</p></>},
    {title:'中心极限定理到底把谁变成了正态？',content:<><p>在独立同分布、有限非零方差等条件下，标准化均值的分布随着 n 增大趋近标准正态。总体本身的偏态与双峰不会被改变。</p><Formula><Frac top="X̄ − μ" bottom="σ / √n"/> ⇒ N(0, 1)</Formula><p>需要多大的 n，取决于偏态、尾部等特征。30 不是开关。方差不存在的总体，例如柯西分布，不能套用这条经典版本。</p><p>正态总体是更强的特例：任意 n 的均值就已经精确正态，不必等待大样本。</p></>},
    {title:'密度柱高、频率和概率，怎样一次分清？',content:<><Formula>密度柱高 = <Frac top="该箱频数" bottom="总数 × 组距"/><br/>柱子面积 = 密度柱高 × 组距 = 该箱频率</Formula><p>如果只把频数除以总数，得到的是每箱频率。把分箱越切越细，频率柱高会变小，不能直接将它当成概率密度。</p><p>连续变量恰好落在一点的概率是 0；一段区间的概率由密度曲线下的面积给出。密度有「每单位 x」的单位，因此可以大于 1。</p></>},
    {title:'只有均值才有抽样分布吗？',content:<><p>均值、中位数、比例、均值差、相关系数和回归斜率，只要由随机样本计算而来，都有各自的抽样分布。标准误就是这个估计量的抽样标准差。</p><p>抽样前它是会变的统计量，抽样后你得到它的一次实现。重复抽样是理解这个分布的思想实验，实际做一次检验不需要真的重做几千次研究。</p></>}
  ]}/><Quiz q={question} solved={solved.has(question.id)} onSolve={onSolve}/></>;
}
