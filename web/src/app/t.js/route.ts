import { NextResponse } from 'next/server';

function buildScript(workerUrl: string): string {
  return `(function(){
  var s=document.currentScript;
  if(!s)return;
  var project=s.getAttribute('data-project');
  if(!project)return;
  var endpoint='${workerUrl}/v1/collect';
  if(location.hostname==='localhost'||location.hostname==='127.0.0.1')return;
  var BOT_RE=/bot|crawl|slurp|spider|mediapartners|lighthouse|pagespeed|chrome-lighthouse/i;
  if(BOT_RE.test(navigator.userAgent))return;
  function send(type,name,meta){
    try{
      var payload={p:project,u:location.pathname,t:type};
      var ref=document.referrer;
      if(ref)payload.r=ref;
      if(name)payload.n=name;
      if(meta)payload.m=meta;
      var body=JSON.stringify(payload);
      if(navigator.sendBeacon){navigator.sendBeacon(endpoint,new Blob([body],{type:'application/json'}));return;}
      fetch(endpoint,{method:'POST',body:body,headers:{'Content-Type':'application/json'},keepalive:true}).catch(function(){});
    }catch(e){}
  }
  send('pageview');
  var _push=history.pushState;
  history.pushState=function(){
    _push.apply(this,arguments);
    send('pageview');
  };
  var _replace=history.replaceState;
  history.replaceState=function(){
    _replace.apply(this,arguments);
    send('pageview');
  };
  window.addEventListener('popstate',function(){send('pageview');});
  window.jabb=function(name,meta){send('event',name,meta);};
})();`;
}

export function GET() {
  const workerUrl = process.env.WORKER_URL;
  if (!workerUrl) {
    return new NextResponse('// WORKER_URL not configured', {
      status: 500,
      headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
    });
  }

  return new NextResponse(buildScript(workerUrl), {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
