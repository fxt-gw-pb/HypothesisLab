import {mean,sd,normal,random,normalQuantile,tP,tCritical,logGamma,clamp} from './stats';
export type Tail='right'|'two'|'left';
export type Shape='normal'|'skew'|'bimodal';
export const normalPDF=(x:number,mu=0,sigma=1)=>Math.exp(-.5*((x-mu)/sigma)**2)/(sigma*Math.sqrt(2*Math.PI));
export function normalSF(x:number):number {
  if(x===0)return .5;
  const z=Math.abs(x)/Math.sqrt(2),t=1/(1+.5*z);
  const q=.5*t*Math.exp(-z*z-1.26551223+t*(1.00002368+t*(.37409196+t*(.09678418+t*(-.18628806+t*(.27886807+t*(-1.13520398+t*(1.48851587+t*(-.82215223+t*.17087277)))))))));
  return x>0?q:1-q;
}
export const normalCDF=(x:number)=>normalSF(-x);
export const tPDF=(x:number,df:number)=>Math.exp(logGamma((df+1)/2)-logGamma(df/2)-.5*Math.log(df*Math.PI)-(df+1)/2*Math.log1p(x*x/df));
export function probability(value:number,tail:Tail,df?:number){
  const small=df===undefined?normalSF(Math.abs(value)):tP(value,df)/2;
  return clamp(tail==='two'?2*small:tail==='right'?(value>=0?small:1-small):(value<=0?small:1-small),0,1);
}
export const critical=(alpha:number,tail:Tail,df?:number)=>{
  const c=df===undefined?normalQuantile(1-alpha/(tail==='two'?2:1)):tCritical(df,alpha*(tail==='two'?1:2));
  return tail==='left'?-c:c;
};
export const rejects=(z:number,c:number,tail:Tail)=>tail==='two'?Math.abs(z)>=c:tail==='right'?z>=c:z<=c;
export const moreExtreme=(x:number,observed:number,tail:Tail)=>tail==='two'?Math.abs(x)>=Math.abs(observed)-1e-10:tail==='right'?x>=observed-1e-10:x<=observed+1e-10;
export function power(n:number,sigma:number,delta:number,alpha:number,tail:Tail){
  const shift=delta*Math.sqrt(n)/sigma,c=critical(alpha,tail);
  return tail==='right'?normalSF(c-shift):tail==='left'?normalCDF(c-shift):normalCDF(-c-shift)+normalSF(c-shift);
}
export function requiredN(sigma:number,delta:number,alpha:number,tail:Tail,target:number,max=10000){
  for(let n=4;n<=max;n++)if(power(n,sigma,delta,alpha,tail)>=target)return n;
  return null;
}
export function drawSample(n:number,mu:number,sigma:number,seed:number,shape:Shape='normal'){
  const r=random(seed);
  return Array.from({length:n},()=>{const z=shape==='skew'?-Math.log(Math.max(r(),1e-12))-1:shape==='bimodal'?(r()<.5?-.86:.86)+Math.sqrt(1-.86**2)*normal(r):normal(r);return mu+sigma*z;});
}
export function populationPDF(x:number,mu:number,sigma:number,shape:Shape){
  if(shape==='normal')return normalPDF(x,mu,sigma);
  if(shape==='skew')return x<mu-sigma?0:Math.exp(-(x-mu+sigma)/sigma)/sigma;
  return .5*normalPDF(x,mu-.86*sigma,sigma*Math.sqrt(1-.86**2))+.5*normalPDF(x,mu+.86*sigma,sigma*Math.sqrt(1-.86**2));
}
export function oneSample(values:number[],mu0:number,alpha=.05,knownSigma?:number){
  const n=values.length,m=mean(values),s=sd(values),se=(knownSigma??s)/Math.sqrt(n),df=n-1,t=(m-mu0)/se;
  const c=knownSigma===undefined?tCritical(df,alpha):normalQuantile(1-alpha/2);
  return{n,mean:m,s,se,df,t,p:probability(t,'two',knownSigma===undefined?df:undefined),lo:m-c*se,hi:m+c*se,c};
}
export function twoSample(a:number[],b:number[],pooled=false,alpha=.05){
  const n1=a.length,n2=b.length,m1=mean(a),m2=mean(b),s1=sd(a),s2=sd(b),v1=s1*s1/n1,v2=s2*s2/n2;
  const sp2=((n1-1)*s1*s1+(n2-1)*s2*s2)/(n1+n2-2);
  const se=pooled?Math.sqrt(sp2*(1/n1+1/n2)):Math.sqrt(v1+v2);
  const df=pooled?n1+n2-2:(v1+v2)**2/(v1*v1/(n1-1)+v2*v2/(n2-1));
  const difference=m2-m1,t=difference/se,c=tCritical(df,alpha);
  return{n1,n2,m1,m2,s1,s2,se,df,t,p:tP(t,df),difference,lo:difference-c*se,hi:difference+c*se,sp2};
}
export function pairedData(n:number,rho:number,delta:number,sigma:number,seed:number){
  const r=random(seed);
  const before:number[]=[],after:number[]=[];
  for(let i=0;i<n;i++){const z=normal(r),w=normal(r);before.push(60+sigma*z);after.push(60+delta+sigma*(rho*z+Math.sqrt(1-rho*rho)*w));}
  return{before,after};
}
export function covariance(a:number[],b:number[]){const ma=mean(a),mb=mean(b);return a.reduce((s,x,i)=>s+(x-ma)*(b[i]-mb),0)/(a.length-1);}
export type Assignment={indices:number[];a:number[];b:number[];difference:number};
export function assignments(values:number[],size:number):Assignment[]{
  const result:Assignment[]=[];
  function choose(start:number,ids:number[]){
    if(ids.length===size){const a=ids.map(i=>values[i]),b=values.filter((_,i)=>!ids.includes(i));result.push({indices:[...ids],a,b,difference:mean(b)-mean(a)});return;}
    for(let i=start;i<=values.length-(size-ids.length);i++)choose(i+1,[...ids,i]);
  }
  choose(0,[]);return result;
}
export function shuffled<T>(values:T[],seed:number){const a=[...values],r=random(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
