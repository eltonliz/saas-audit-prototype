import{p as I}from"./chunk-JWPE2WC7-DrXNDG2t.js";import{s as _,g as E,q as D,p as F,a as G,b as P,_ as c,G as z,r as B,D as w,A as C,E as W,l as b,X as V,d as H}from"./ProtoViewerPage-CRwd8LRw.js";import{p as X}from"./cynefin-OW5HDTMX-CGAluo0E.js";import"./index-DYxPIB4D.js";import"./useCaseCardData-CcBUrEUe.js";import"./_plugin-vue_export-helper-DlAUqK2U.js";import"./audit-level-config-41MskOb6.js";import"./static-mode-DKkcSwqx.js";import"./MessageCenter-D3VpVi41.js";import"./im-friend-store-DaKZdS7a.js";import"./im-sync-nCyAJ-1w.js";import"./im-aftersale-store-1OpL6R1z.js";import"./im-conversation-store-Bx9Z4qcS.js";import"./im-sim-adapter-DYNFehDk.js";import"./im-group-store-B_Yl2CrM.js";import"./im-visibility-engine-C4H5Fedr.js";import"./NotifyListPage-BvmQrGZP.js";import"./ContactsPage-Bp9MEW9r.js";import"./FriendRequests-IJ-vHNgB.js";import"./AddFriend-eY63yWoe.js";import"./FriendProfile-Cwoisq4q.js";import"./FriendSettings-Fl1eGlQK.js";import"./MyGroups-BEgigM7T.js";import"./ChatPage-C4FS91dQ.js";import"./im-aftersale-service-DkF5SbEO.js";import"./ReportDialog-DUcdxHNe.js";import"./im-live-store-DJwULP9r.js";import"./GroupSettings-XsSvDT0f.js";import"./im-group-orchestrator-Dj2NZHTX.js";import"./GlobalSearch-P1utqNsy.js";import"./ImLiveRoom-8WlcKCE3.js";import"./im-mass-send-store-CrP2xWV5.js";import"./LivePromoPage-CaXgUVrQ.js";import"./MassSendRecordsPage-DSZ4W7Ax.js";import"./JoinGroupPage-XFXtHRmt.js";import"./StoreMgmtPage-Bv9fPgQY.js";import"./PageUseCaseHelp-_7DoENY9.js";import"./StoreMemberPage-Dm-P1_sU.js";import"./PayResultPage-CIxlnjSv.js";import"./ConsultEntryPage-DyEInWKX.js";import"./AftersaleApplyPage-BCtj4dK9.js";import"./AccountClosePage-DZWzrXRl.js";var x={showLegend:!0,ticks:5,max:null,min:0,graticule:"circle"},y=32,A={axes:[],curves:[],options:x},g=structuredClone(A),j=W.radar,U=c(()=>w({...j,...C().radar}),"getConfig"),M=c(()=>g.axes,"getAxes"),q=c(()=>g.curves,"getCurves"),K=c(()=>g.options,"getOptions"),N=c(r=>{g.axes=r.map(t=>({name:t.name,label:t.label??t.name}))},"setAxes"),Y=c(r=>{g.curves=r.map(t=>({name:t.name,label:t.label??t.name,entries:Z(t.entries)}))},"setCurves"),Z=c(r=>{if(r[0].axis==null)return r.map(e=>e.value);const t=M();if(t.length===0)throw new Error("Axes must be populated before curves for reference entries");return t.map(e=>{const a=r.find(o=>{var s;return((s=o.axis)==null?void 0:s.$refText)===e.name});if(a===void 0)throw new Error("Missing entry for axis "+e.label);return a.value})},"computeCurveEntries"),J=c(r=>{var e,a,o,s,l;const t=r.reduce((n,i)=>(n[i.name]=i,n),{});g.options={showLegend:((e=t.showLegend)==null?void 0:e.value)??x.showLegend,ticks:((a=t.ticks)==null?void 0:a.value)??x.ticks,max:((o=t.max)==null?void 0:o.value)??x.max,min:((s=t.min)==null?void 0:s.value)??x.min,graticule:((l=t.graticule)==null?void 0:l.value)??x.graticule},g.options.ticks>y&&(b.warn(`Radar diagram ticks (${g.options.ticks}) exceeds maximum allowed (${y}). Using ${y} instead.`),g.options.ticks=y)},"setOptions"),Q=c(()=>{B(),g=structuredClone(A)},"clear"),$={getAxes:M,getCurves:q,getOptions:K,setAxes:N,setCurves:Y,setOptions:J,getConfig:U,clear:Q,setAccTitle:P,getAccTitle:G,setDiagramTitle:F,getDiagramTitle:D,getAccDescription:E,setAccDescription:_},tt=c(r=>{I(r,$);const{axes:t,curves:e,options:a}=r;$.setAxes(t),$.setCurves(e),$.setOptions(a)},"populate"),et={parse:c(async r=>{const t=await X("radar",r);b.debug(t),tt(t)},"parse")},rt=c((r,t,e,a)=>{const o=a.db,s=o.getAxes(),l=o.getCurves(),n=o.getOptions(),i=o.getConfig(),p=o.getDiagramTitle(),m=z(t),d=at(m,i),u=n.max??Math.max(...l.map(f=>Math.max(...f.entries))),h=n.min,v=Math.min(i.width,i.height)/2;ot(d,s,v,n.ticks,n.graticule),st(d,s,v,i),L(d,s,l,h,u,n.graticule,i),k(d,l,n.showLegend,i),d.append("text").attr("class","radarTitle").text(p).attr("x",0).attr("y",-i.height/2-i.marginTop)},"draw"),at=c((r,t)=>{const e=t.width+t.marginLeft+t.marginRight,a=t.height+t.marginTop+t.marginBottom,o={x:t.marginLeft+t.width/2,y:t.marginTop+t.height/2};return H(r,a,e,t.useMaxWidth??!0),r.attr("viewBox",`0 0 ${e} ${a}`).attr("overflow","visible"),r.append("g").attr("transform",`translate(${o.x}, ${o.y})`)},"drawFrame"),ot=c((r,t,e,a,o)=>{if(o==="circle")for(let s=0;s<a;s++){const l=e*(s+1)/a;r.append("circle").attr("r",l).attr("class","radarGraticule")}else if(o==="polygon"){const s=t.length;for(let l=0;l<a;l++){const n=e*(l+1)/a,i=t.map((p,m)=>{const d=2*m*Math.PI/s-Math.PI/2,u=n*Math.cos(d),h=n*Math.sin(d);return`${u},${h}`}).join(" ");r.append("polygon").attr("points",i).attr("class","radarGraticule")}}},"drawGraticule"),st=c((r,t,e,a)=>{const o=t.length;for(let s=0;s<o;s++){const l=t[s].label,n=2*s*Math.PI/o-Math.PI/2,i=Math.cos(n),p=Math.sin(n);r.append("line").attr("x1",0).attr("y1",0).attr("x2",e*a.axisScaleFactor*i).attr("y2",e*a.axisScaleFactor*p).attr("class","radarAxisLine");const m=i>.01?"start":i<-.01?"end":"middle",d=p>.01?"hanging":p<-.01?"auto":"central",u=4;r.append("text").text(l).attr("x",e*a.axisLabelFactor*i+u*i).attr("y",e*a.axisLabelFactor*p+u*p).attr("text-anchor",m).attr("dominant-baseline",d).attr("class","radarAxisLabel")}},"drawAxes");function L(r,t,e,a,o,s,l){const n=t.length,i=Math.min(l.width,l.height)/2;e.forEach((p,m)=>{if(p.entries.length!==n)return;const d=p.entries.map((u,h)=>{const v=2*Math.PI*h/n-Math.PI/2,f=T(u,a,o,i),O=f*Math.cos(v),R=f*Math.sin(v);return{x:O,y:R}});s==="circle"?r.append("path").attr("d",S(d,l.curveTension)).attr("class",`radarCurve-${m}`):s==="polygon"&&r.append("polygon").attr("points",d.map(u=>`${u.x},${u.y}`).join(" ")).attr("class",`radarCurve-${m}`)})}c(L,"drawCurves");function T(r,t,e,a){const o=Math.min(Math.max(r,t),e);return a*(o-t)/(e-t)}c(T,"relativeRadius");function S(r,t){const e=r.length;let a=`M${r[0].x},${r[0].y}`;for(let o=0;o<e;o++){const s=r[(o-1+e)%e],l=r[o],n=r[(o+1)%e],i=r[(o+2)%e],p={x:l.x+(n.x-s.x)*t,y:l.y+(n.y-s.y)*t},m={x:n.x-(i.x-l.x)*t,y:n.y-(i.y-l.y)*t};a+=` C${p.x},${p.y} ${m.x},${m.y} ${n.x},${n.y}`}return`${a} Z`}c(S,"closedRoundCurve");function k(r,t,e,a){if(!e)return;const o=(a.width/2+a.marginRight)*3/4,s=-(a.height/2+a.marginTop)*3/4,l=20;t.forEach((n,i)=>{const p=r.append("g").attr("transform",`translate(${o}, ${s+i*l})`);p.append("rect").attr("width",12).attr("height",12).attr("class",`radarLegendBox-${i}`),p.append("text").attr("x",16).attr("y",0).attr("class","radarLegendText").text(n.label)})}c(k,"drawLegend");var nt={draw:rt},it=c((r,t)=>{let e="";for(let a=0;a<r.THEME_COLOR_LIMIT;a++){const o=r[`cScale${a}`];e+=`
		.radarCurve-${a} {
			color: ${o};
			fill: ${o};
			fill-opacity: ${t.curveOpacity};
			stroke: ${o};
			stroke-width: ${t.curveStrokeWidth};
		}
		.radarLegendBox-${a} {
			fill: ${o};
			fill-opacity: ${t.curveOpacity};
			stroke: ${o};
		}
		`}return e},"genIndexStyles"),lt=c(r=>{const t=V(),e=C(),a=w(t,e.themeVariables),o=w(a.radar,r);return{themeVariables:a,radarOptions:o}},"buildRadarStyleOptions"),ct=c(({radar:r}={})=>{const{themeVariables:t,radarOptions:e}=lt(r);return`
	.radarTitle {
		font-size: ${t.fontSize};
		color: ${t.titleColor};
		dominant-baseline: hanging;
		text-anchor: middle;
	}
	.radarAxisLine {
		stroke: ${e.axisColor};
		stroke-width: ${e.axisStrokeWidth};
	}
	.radarAxisLabel {
		font-size: ${e.axisLabelFontSize}px;
		color: ${e.axisColor};
	}
	.radarGraticule {
		fill: ${e.graticuleColor};
		fill-opacity: ${e.graticuleOpacity};
		stroke: ${e.graticuleColor};
		stroke-width: ${e.graticuleStrokeWidth};
	}
	.radarLegendText {
		text-anchor: start;
		font-size: ${e.legendFontSize}px;
		dominant-baseline: hanging;
	}
	${it(t,e)}
	`},"styles"),Jt={parser:et,db:$,renderer:nt,styles:ct};export{Jt as diagram};
