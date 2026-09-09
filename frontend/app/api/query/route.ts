import { NextResponse } from 'next/server';
import { runQuery } from '../../../lib/engine';

export const dynamic='force-dynamic';

export async function POST(req:Request){
  const len=Number(req.headers.get('content-length')||0);
  if(len>32768)return NextResponse.json({error:'payload too large'},{status:413});
  let body:any;
  try{body=await req.json()}catch{return NextResponse.json({error:'malformed JSON'},{status:400})}
  if(!body||Array.isArray(body)||typeof body!=='object')return NextResponse.json({error:'JSON object required'},{status:422});
  const allowed=new Set(['question']);
  const bad=Object.keys(body).filter(k=>!allowed.has(k));
  if(bad.length)return NextResponse.json({error:`Unknown fields: ${bad.join(', ')}`},{status:422});
  if(typeof body.question!=='string'||body.question.trim().length<5||body.question.length>2000)return NextResponse.json({error:'question must be a string between 5 and 2000 characters'},{status:422});
  return NextResponse.json(runQuery(body.question.trim(),false),{headers:{'cache-control':'no-store','x-knowledgeops-mode':'deterministic-public-demo'}})
}
