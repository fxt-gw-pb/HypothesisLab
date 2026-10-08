import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'假设检验实验室 · 让统计直觉站得住',description:'拖动观察值，反复生成样本，亲手理解 p 值、两类错误、检验力、t 检验与精确置换。',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>;}
