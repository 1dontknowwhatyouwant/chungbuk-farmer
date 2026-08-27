const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
process.env.NEXT_PUBLIC_API_BASE_URL='http://127.0.0.1:18081';
const statePath=path.join(__dirname,'state.json');
const pending=[];
const state=()=>JSON.parse(fs.readFileSync(statePath,'utf8'));
const respond=(res,data)=>{res.statusCode=state().status||200;res.end(JSON.stringify(res.statusCode===200?data:{}));};
setInterval(()=>{if(!state().hold)while(pending.length){const [res,data]=pending.shift();if(!res.destroyed)respond(res,data);}},100);
http.createServer((req,res)=>{
 res.setHeader('Access-Control-Allow-Origin','http://127.0.0.1:3001');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
 if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
 fs.appendFileSync(path.join(__dirname,'requests.log'),`${req.method} ${req.url}\n`);
 res.setHeader('Content-Type','application/json');
 const empty={content:[],page:0,size:100,totalElements:0,totalPages:0,hasNext:false};
 const posting={id:1,title:'옥수수 수확',farmName:'테스트 농장',cityCounty:'제천시',workDate:'2026-08-28',startTime:'08:30',endTime:'17:00',status:'APPROVED',displayStatus:'승인',capacity:4,meetingPlace:'농장'};
 const data=req.url==='/api/admin/dashboard'?{submittedParticipationApplications:11,pendingJobPostings:13,pendingJobApplications:17,pendingEducationSubmissions:7}:req.url.startsWith('/api/admin/job-postings')?{...empty,content:[posting],totalElements:1,totalPages:1}:req.url==='/api/admin/participation-applications'?[]:empty;
 if(state().hold)pending.push([res,data]);else respond(res,data);
}).listen(18081,'127.0.0.1');
const app=require('next')({dev:true,dir:__dirname});app.prepare().then(()=>http.createServer(app.getRequestHandler()).listen(3001,'127.0.0.1',()=>console.log('LOADING_PREVIEW_READY')));
