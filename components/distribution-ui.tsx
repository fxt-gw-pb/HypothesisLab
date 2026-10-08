"use client";
import {type ReactNode} from 'react';
import {Plot,Curve,BLUE,ORANGE,type PlotTools} from './learning-ui';
import {normalPDF} from '@/lib/hypothesis';
import {fmt} from '@/lib/stats';
export function Area({fn,from,to,X,Y,color=ORANGE,opacity=.22}:{fn:(x:number)=>number;from:number;to:number;X:(x:number)=>number;Y:(y:number)=>number;color?:string;opacity?:number}){
  if(to<=from)return null;
  const path=`M ${X(from)} ${Y(0)} `+Array.from({length:101},(_,i)=>{const x=from+(to-from)*i/100;return `L ${X(x)} ${Y(fn(x))}`;}).join(' ')+` L ${X(to)} ${Y(0)} Z`;
  return <path d={path} fill={color} opacity={opacity}/>;
}
export function Density({from,to,fn=normalPDF,shades=[],marks=[],height=340,xLabel='标准化统计量',label,extra}:{from:number;to:number;fn?:(x:number)=>number;shades?:{from:number;to:number;color?:string}[];marks?:{x:number;label?:string;color?:string;dash?:boolean}[];height?:number;xLabel?:string;label:string;extra?:(p:PlotTools)=>ReactNode}){
  const peak=Math.max(...Array.from({length:301},(_,i)=>fn(from+(to-from)*i/300)))*1.2;
  return <Plot xDomain={[from,to]} yDomain={[0,peak]} xLabel={xLabel} yLabel="概率密度" height={height} label={label}>{p=><>
    {shades.map((s,i)=><Area key={i} fn={fn} from={Math.max(from,s.from)} to={Math.min(to,s.to)} X={p.X} Y={p.Y} color={s.color}/>)}
    <Curve fn={fn} X={p.X} Y={p.Y} from={from} to={to}/>
    {marks.filter(m=>m.x>=from&&m.x<=to).map((m,i)=><g key={i}><line x1={p.X(m.x)} x2={p.X(m.x)} y1={p.Y(0)} y2={p.Y(peak*.9)} stroke={m.color??ORANGE} strokeWidth={2} strokeDasharray={m.dash?'5 5':undefined}/>{m.label&&<text x={p.X(m.x)} y={p.Y(peak*.91)} className="plot-annotation" textAnchor={m.x>to-(to-from)*.15?'end':m.x<from+(to-from)*.15?'start':'middle'} fill={m.color??ORANGE}>{m.label}</text>}</g>)}
    {extra?.(p)}
  </>}</Plot>;
}
export function Histogram({values,domain,bins=24,theory,color=BLUE,xLabel='观察值',height=280,density=true,observed,extreme}:{values:number[];domain:[number,number];bins?:number;theory?:(x:number)=>number;color?:string;xLabel?:string;height?:number;density?:boolean;observed?:number;extreme?:(x:number)=>boolean}){
  const [lo,hi]=domain,bw=(hi-lo)/bins,count=Array(bins).fill(0);
  values.forEach(v=>{const j=Math.floor((v-lo)/bw);if(j>=0&&j<bins)count[j]++;else if(v===hi)count[bins-1]++;});
  const unit=density?1/Math.max(1,values.length)/bw:1;
  const scale=density?1:values.length*bw;
  const max=Math.max(1e-5,...count.map(v=>v*unit),...(theory?Array.from({length:201},(_,i)=>theory(lo+(hi-lo)*i/200)*scale):[]))*1.15;
  return <Plot xDomain={domain} yDomain={[0,max]} xLabel={xLabel} yLabel={density?'密度':'次数'} height={height} label={`${xLabel}的直方图`}>{({X,Y})=><>
    {count.map((v,i)=><rect key={i} x={X(lo+i*bw)+.5} y={Y(v*unit)} width={Math.max(0,X(lo+bw)-X(lo)-1)} height={Math.max(0,Y(0)-Y(v*unit))} fill={extreme?.(lo+(i+.5)*bw)?ORANGE:color} opacity={.64} rx={2}><title>{`${fmt(lo+i*bw)} 至 ${fmt(lo+(i+1)*bw)}：${v} 次`}</title></rect>)}
    {theory&&<Curve fn={x=>theory(x)*scale} from={lo} to={hi} X={X} Y={Y} color="#203f58" dash="5 4" stroke={2}/>}
    {observed!==undefined&&<line x1={X(observed)} x2={X(observed)} y1={Y(0)} y2={Y(max)} stroke={ORANGE} strokeWidth={2.5}/>}
  </>}</Plot>;
}
export function Decision({p,alpha=.05}:{p:number;alpha?:number}){return <div className={`decision ${p<=alpha?'reject':'retain'}`}><span>{p<=alpha?'拒绝 H₀':'暂不拒绝 H₀'}</span><p>{p<=alpha?'数据越过了事先约定的拒绝门槛。':'这份数据尚未越过拒绝门槛；这不等于证实 H₀。'}</p></div>;}
