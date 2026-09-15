import {readFile} from "node:fs/promises";
const file=process.argv[2];
if(!file) throw new Error("Uso: node scripts/import-customers.mjs CAMINHO_DA_CARTEIRA_REAL.json");
const data=JSON.parse(await readFile(file,"utf8"));
const r=await fetch((process.env.VIGIA_API_URL||"http://localhost:3001")+"/api/segurados",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
const result=await r.json();console.log(JSON.stringify(result,null,2));if(!r.ok)process.exitCode=1;
