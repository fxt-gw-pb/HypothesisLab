export type Point={x:number;y:number};
export const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export const mean=(v:number[])=>v.length?v.reduce((a,b)=>a+b,0)/v.length:0;
export const sd=(v:number[])=>{if(v.length<2)return 0;const m=mean(v);return Math.sqrt(v.reduce((a,b)=>a+(b-m)**2,0)/(v.length-1));};
export function random(seed:number){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
export function normal(r:()=>number){return Math.sqrt(-2*Math.log(Math.max(r(),1e-12)))*Math.cos(2*Math.PI*r());}
export function logGamma(z:number):number {const c=[676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];if(z<.5)return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-logGamma(1-z);z-=1;let x=.99999999999980993;for(let i=0;i<c.length;i++)x+=c[i]/(z+i+1);const t=z+c.length-.5;return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x);}
function betaFraction(a:number,b:number,x:number){let c=1,d=1-(a+b)*x/(a+1);if(Math.abs(d)<1e-30)d=1e-30;d=1/d;let h=d;for(let m=1;m<180;m++){const m2=2*m;let aa=m*(b-m)*x/((a+m2-1)*(a+m2));d=1+aa*d;if(Math.abs(d)<1e-30)d=1e-30;c=1+aa/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;h*=d*c;aa=-(a+m)*(a+b+m)*x/((a+m2)*(a+m2+1));d=1+aa*d;if(Math.abs(d)<1e-30)d=1e-30;c=1+aa/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<3e-12)break;}return h;}
function betaI(x:number,a:number,b:number){if(x<=0)return 0;if(x>=1)return 1;const bt=Math.exp(logGamma(a+b)-logGamma(a)-logGamma(b)+a*Math.log(x)+b*Math.log1p(-x));return x<(a+1)/(a+b+2)?bt*betaFraction(a,b,x)/a:1-bt*betaFraction(b,a,1-x)/b;}
export function tP(t:number,df:number){return clamp(betaI(df/(df+t*t),df/2,.5),0,1);}
export function tCritical(df:number,alpha=.05){let lo=0,hi=100;for(let i=0;i<55;i++){const m=(lo+hi)/2;if(tP(m,df)>alpha)lo=m;else hi=m;}return (lo+hi)/2;}
export function normalQuantile(p:number):number{if(p===0)return -Infinity;if(p===1)return Infinity;const a=[-39.6968302866538,220.946098424521,-275.928510446969,138.357751867269,-30.6647980661472,2.50662827745924],b=[-54.4760987982241,161.585836858041,-155.698979859887,66.8013118877197,-13.2806815528857],c=[-.00778489400243029,-.322396458041136,-2.40075827716184,-2.54973253934373,4.37466414146497,2.93816398269878],d=[.00778469570904146,.32246712907004,2.445134137143,3.75440866190742];if(p<.02425){const q=Math.sqrt(-2*Math.log(p));return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}if(p>1-.02425)return-normalQuantile(1-p);const q=p-.5,r=q*q;return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);}

export const fmt=(v:number,d=2)=>Number.isFinite(v)?(Math.abs(v)<.5*10**(-d)?0:v).toFixed(d):'—';
export const pFmt=(p:number)=>p<.001?'< 0.001':p.toFixed(3);
