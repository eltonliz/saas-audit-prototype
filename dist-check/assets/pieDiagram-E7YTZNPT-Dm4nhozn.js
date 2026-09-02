import{p as at}from"./chunk-JWPE2WC7-Dh4OETsM.js";import{L as T,O as P,b3 as it,g as nt,s as ot,a as st,b as lt,q as ct,p as pt,_ as g,l as B,c as ut,D as gt,G as dt,a2 as mt,d as ht,r as ft,E as vt}from"./ProtoViewerPage-B2M65u28.js";import{p as xt}from"./cynefin-OW5HDTMX-2sFPWJ9s.js";import{d as J}from"./arc-Bbnf_qYl.js";import{o as St}from"./ordinal-Cboi1Yqb.js";import"./index-DiSLaYcf.js";import"./useCaseCardData-vsBMMPzK.js";import"./_plugin-vue_export-helper-DlAUqK2U.js";import"./audit-level-config-41MskOb6.js";import"./static-mode-BPSJ3VWZ.js";import"./MessageCenter-CBQtoq_s.js";import"./im-friend-store-Bk0a1Uw1.js";import"./im-sync-UuwRFZsX.js";import"./im-aftersale-store-LcqrWqpT.js";import"./im-conversation-store-DxSsQ6Ht.js";import"./im-sim-adapter-BUQByjeL.js";import"./im-group-store-Bk7lj4Ta.js";import"./im-visibility-engine-C4H5Fedr.js";import"./NotifyListPage-Bn46QF4a.js";import"./ContactsPage-h9jJvAI2.js";import"./FriendRequests-pnp-5NMa.js";import"./AddFriend-CSfIG2PI.js";import"./FriendProfile-BsqTGqwf.js";import"./FriendSettings-jD6mJ0O6.js";import"./MyGroups-BCpEmVmh.js";import"./ChatPage-BktqMciJ.js";import"./im-aftersale-service-B_y8-lax.js";import"./ReportDialog-Yk39jHwK.js";import"./im-live-store-C-FZ_P0E.js";import"./GroupSettings-Bky7Udeh.js";import"./im-group-orchestrator-Ct1dpilW.js";import"./GlobalSearch-D-nLbIMF.js";import"./ImLiveRoom-Bl7kvddj.js";import"./im-mass-send-store-BvdAP98S.js";import"./LivePromoPage-BKxcju11.js";import"./MassSendRecordsPage-ECnXAjUA.js";import"./JoinGroupPage-IVZikTN0.js";import"./StoreMgmtPage-Bo4jYsny.js";import"./PageUseCaseHelp-DZm1s50e.js";import"./StoreMemberPage-Dza5illy.js";import"./PayResultPage-Ck_h8PnP.js";import"./ConsultEntryPage-CNFBfLoo.js";import"./AftersaleApplyPage-wps0utnR.js";import"./AccountClosePage-CqZL4L3F.js";import"./init-Gi6I4Gst.js";function yt(t,i){return i<t?-1:i>t?1:i>=t?0:NaN}function wt(t){return t}function At(){var t=wt,i=yt,y=null,b=T(0),l=T(P),d=T(0);function n(e){var a,s=(e=it(e)).length,m,w,$=0,h=new Array(s),o=new Array(s),D=+b.apply(this,arguments),z=Math.min(P,Math.max(-P,l.apply(this,arguments)-D)),k,R=Math.min(Math.abs(z)/s,d.apply(this,arguments)),p=R*(z<0?-1:1),A;for(a=0;a<s;++a)(A=o[h[a]=a]=+t(e[a],a,e))>0&&($+=A);for(i!=null?h.sort(function(M,f){return i(o[M],o[f])}):y!=null&&h.sort(function(M,f){return y(e[M],e[f])}),a=0,w=$?(z-s*p)/$:0;a<s;++a,D=k)m=h[a],A=o[m],k=D+(A>0?A*w:0)+p,o[m]={data:e[m],index:a,value:A,startAngle:D,endAngle:k,padAngle:R};return o}return n.value=function(e){return arguments.length?(t=typeof e=="function"?e:T(+e),n):t},n.sortValues=function(e){return arguments.length?(i=e,y=null,n):i},n.sort=function(e){return arguments.length?(y=e,i=null,n):y},n.startAngle=function(e){return arguments.length?(b=typeof e=="function"?e:T(+e),n):b},n.endAngle=function(e){return arguments.length?(l=typeof e=="function"?e:T(+e),n):l},n.padAngle=function(e){return arguments.length?(d=typeof e=="function"?e:T(+e),n):d},n}var Ct=vt.pie,I={sections:new Map,showData:!1},_=I.sections,V=I.showData,$t=structuredClone(Ct),Dt=g(()=>structuredClone($t),"getConfig"),Tt=g(()=>{_=new Map,V=I.showData,ft()},"clear"),bt=g(({label:t,value:i})=>{if(i<0)throw new Error(`"${t}" has invalid value: ${i}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);_.has(t)||(_.set(t,i),B.debug(`added new section: ${t}, with value: ${i}`))},"addSection"),kt=g(()=>_,"getSections"),Et=g(t=>{V=t},"setShowData"),zt=g(()=>V,"getShowData"),K={getConfig:Dt,clear:Tt,setDiagramTitle:pt,getDiagramTitle:ct,setAccTitle:lt,getAccTitle:st,setAccDescription:ot,getAccDescription:nt,addSection:bt,getSections:kt,setShowData:Et,getShowData:zt},Mt=g((t,i)=>{at(t,i),i.setShowData(t.showData),t.sections.map(i.addSection)},"populateDb"),Lt={parse:g(async t=>{const i=await xt("pie",t);B.debug(i),Mt(i,K)},"parse")},Rt=g(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieCircle.highlighted{
    scale: 1.05;
    opacity: 1;
  }
  .pieCircle.highlightedOnHover:hover{
    transition-duration: 250ms;
    scale: 1.05;
    opacity: 1;
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),Ot=Rt,Wt=g(t=>{const i=[...t.values()].reduce((l,d)=>l+d,0),y=[...t.entries()].map(([l,d])=>({label:l,value:d})).filter(l=>l.value/i*100>=1);return At().value(l=>l.value).sort(null)(y)},"createPieArcs"),_t=g((t,i,y,b)=>{var Z;B.debug(`rendering pie chart
`+t);const l=b.db,d=ut(),n=gt(l.getConfig(),d.pie),e=40,a=18,s=4,m=450,w=m,$=dt(i),h=$.append("g");h.attr("transform","translate("+w/2+","+m/2+")");const{themeVariables:o}=d;let[D]=mt(o.pieOuterStrokeWidth);D??(D=2);const z=n.legendPosition,k=n.textPosition,R=n.donutHole>0&&n.donutHole<=.9?n.donutHole:0,p=Math.min(w,m)/2-e,A=J().innerRadius(R*p).outerRadius(p),M=J().innerRadius(p*k).outerRadius(p*k),f=h.append("g");f.append("circle").attr("cx",0).attr("cy",0).attr("r",p+D/2).attr("class","pieOuterCircle");const O=l.getSections(),Q=Wt(O),Y=[o.pie1,o.pie2,o.pie3,o.pie4,o.pie5,o.pie6,o.pie7,o.pie8,o.pie9,o.pie10,o.pie11,o.pie12];let F=0;O.forEach(r=>{F+=r});const U=Q.filter(r=>(r.data.value/F*100).toFixed(0)!=="0"),G=St(Y).domain([...O.keys()]);f.selectAll("mySlices").data(U).enter().append("path").attr("d",A).attr("fill",r=>G(r.data.label)).attr("class",r=>{let c="pieCircle";return n.highlightSlice==="hover"?c+=" highlightedOnHover":n.highlightSlice===r.data.label&&(c+=" highlighted"),c}),f.selectAll("mySlices").data(U).enter().append("text").text(r=>(r.data.value/F*100).toFixed(0)+"%").attr("transform",r=>"translate("+M.centroid(r)+")").style("text-anchor","middle").attr("class","slice");const tt=h.append("text").text(l.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText"),L=[...O.entries()].map(([r,c])=>({label:r,value:c})),C=h.selectAll(".legend").data(L).enter().append("g").attr("class","legend");C.append("rect").attr("width",a).attr("height",a).style("fill",r=>G(r.label)).style("stroke",r=>G(r.label)),C.append("text").attr("x",a+s).attr("y",a-s).text(r=>l.getShowData()?`${r.label} [${r.value}]`:r.label);const E=Math.max(...C.selectAll("text").nodes().map(r=>(r==null?void 0:r.getBoundingClientRect().width)??0));let W=m,H=w+e;const u=a+s,N=L.length*u;switch(z){case"center":C.attr("transform",(r,c)=>{const v=u*L.length/2,x=-E/2-(a+s),S=c*u-v;return"translate("+x+","+S+")"});break;case"top":W+=N,C.attr("transform",(r,c)=>{const v=p,x=-E/2-(a+s),S=c*u-v;return`translate(${x}, ${S})`}),f.attr("transform",()=>`translate(0, ${N+u})`);break;case"bottom":W+=N,C.attr("transform",(r,c)=>{const v=-p-u,x=-E/2-(a+s),S=c*u-v;return"translate("+x+","+S+")"});break;case"left":H+=a+s+E,C.attr("transform",(r,c)=>{const v=u*L.length/2,x=-p-(a+s),S=c*u-v;return"translate("+x+","+S+")"}),f.attr("transform",()=>`translate(${E+a+s}, 0)`);break;case"right":default:H+=a+s+E,C.attr("transform",(r,c)=>{const v=u*L.length/2,x=12*a,S=c*u-v;return"translate("+x+","+S+")"});break}const j=((Z=tt.node())==null?void 0:Z.getBoundingClientRect().width)??0,et=w/2-j/2,rt=w/2+j/2,q=Math.min(0,et),X=Math.max(H,rt)-q;$.attr("viewBox",`${q} 0 ${X} ${W}`),ht($,W,X,n.useMaxWidth)},"draw"),Ft={draw:_t},ze={parser:Lt,db:K,renderer:Ft,styles:Ot};export{ze as diagram};
