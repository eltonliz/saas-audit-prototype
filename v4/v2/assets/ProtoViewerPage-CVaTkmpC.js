var It=Object.defineProperty;var mt=(n,e,t)=>e in n?It(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var b=(n,e,t)=>mt(n,typeof e!="symbol"?e+"":e,t);import{m as A,H as ce,ae as ft,s as m,t as o,x as f,n as V,w as j,D as T,v as D,F as S,N as x,ay as _e,R as Le,aR as ze,J as Mt,c as oe,r as H,p as ie,q as g,z as B,an as kt,y as ge,a4 as vt,L as G,aS as bt,G as _t,aN as Pt,aT as Rt,h as St,u as tt,ag as Ve,ar as nt,O as xt,ah as yt}from"./index-boeCcs4J.js";import{B as st,I as Oe,r as wt,a as Bt}from"./useCaseCardData-CeRsGVIm.js";import{S as Ct}from"./static-mode-C39Ycu0u.js";import{_ as F}from"./_plugin-vue_export-helper-DlAUqK2U.js";import Dt from"./MessageCenter-CEzvoYOx.js";import Qe from"./NotifyListPage-Bb55t5q7.js";import qe from"./ContactsPage-VmtyJu7_.js";import At from"./FriendRequests-D1-2_nL0.js";import Tt from"./AddFriend-BtzFeNTV.js";import Nt from"./FriendProfile-BnKmScIP.js";import $t from"./FriendSettings-BgfE23m5.js";import Ft from"./MyGroups-BuQZtMzQ.js";import{E as Ut,A as Gt,C as Y}from"./ChatPage-vnlYWMdv.js";import z from"./GroupSettings-BETAk81h.js";import Et from"./GlobalSearch-DpeVxai7.js";import Lt from"./ImLiveRoom-9ZYWEBp7.js";import Ke from"./LivePromoPage-CvoTdrKu.js";import zt from"./MassSendRecordsPage-DQT_ULNp.js";import Vt from"./JoinGroupPage-nMsD9hD6.js";import ee from"./StoreMgmtPage-jjgmqps-.js";import te from"./StoreMemberPage-KK9-tgMP.js";import Ot from"./PayResultPage-DGQo6h4Z.js";import Qt from"./ConsultEntryPage-BQ0QBvp4.js";import qt from"./AftersaleApplyPage-zs4dMv5W.js";import Kt from"./AccountClosePage-CHVNq2zv.js";import{P as jt}from"./ReportDialog-CL6yOvWv.js";import{u as Zt}from"./im-aftersale-store-Bvt1rF-A.js";import{m as Ht}from"./im-aftersale-service-CNLPN6lF.js";import{aC as fe}from"./mermaid.core-Da2iWDz-.js";import{u as Wt}from"./im-live-store-vHzgzBPv.js";import"./audit-level-config-41MskOb6.js";import"./im-friend-store-CRTuYDGg.js";import"./im-sync-BKPf-ZWV.js";import"./im-conversation-store-Dd6566_W.js";import"./im-sim-adapter-CNf9PFlC.js";import"./im-group-store-r_UPP03s.js";import"./im-visibility-engine-C4H5Fedr.js";import"./im-group-orchestrator-C_vmp4qe.js";import"./im-mass-send-store-BFwduvPF.js";import"./PageUseCaseHelp-rc5_TkvL.js";function Pe(n){const e=[],t=r=>r.forEach(s=>{e.push(s),s.children&&t(s.children)});return n.forEach(r=>t(r.pages)),e}const Jt={class:"proto-viewer"},Xt={class:"pv-topbar"},Yt={class:"pv-brand"},en={class:"pv-title"},tn={class:"pv-sub"},nn={class:"pv-actions"},sn={class:"pv-body"},rn={class:"pv-tree"},an={class:"pv-tree-scroll"},ln={class:"pv-group-title"},on=["onClick"],cn={class:"pv-node-title"},pn=["onClick"],un={class:"pv-node-title"},dn=["onClick"],hn={class:"pv-node-title"},gn={class:"pv-stage"},In={class:"pv-stage-head"},mn={class:"pv-stage-title"},fn={class:"pv-stage-page"},Mn={key:0,class:"pv-roles"},kn=["onClick"],vn={class:"pv-canvas"},bn={key:0,class:"pv-doc"},_n={key:1,class:"pv-pc"},Pn={key:2,class:"pv-phone"},Rn={key:0,class:"pv-persona-badge"},Sn={class:"pv-cards"},xn={class:"pv-cards-scroll"},yn={class:"pvc-head"},wn={class:"pvc-title"},Bn={class:"pvc-sub"},Cn={key:0,class:"pvc-sec"},Dn={class:"pvc-text"},An={key:1,class:"pvc-sec"},Tn={class:"pvc-el-name"},Nn={class:"pvc-el-behavior"},$n={class:"pvc-sec"},Fn={class:"pvc-text"},Un={class:"pvc-sec"},Gn={class:"pvc-text"},En={class:"pvc-sec"},Ln={class:"pvc-list"},zn={class:"pvc-sec"},Vn={class:"pvc-text"},On={class:"pvc-sec"},Qn={class:"pvc-list"},qn={class:"pvc-sec"},Kn={class:"pvc-rule-head"},jn={key:2,class:"pvc-sec"},Zn={class:"pvc-label"},Hn={class:"pvc-text",style:{"margin-bottom":"6px"}},Wn={class:"pvc-el-name"},Jn={class:"pvc-el-behavior"},Xn=A({__name:"ProtoViewerShell",props:{title:{},sub:{},tree:{},cards:{},ruleResolver:{type:Function},personas:{},activePersonaId:{},personaLabel:{},initialNodeId:{},prdNodeId:{}},emits:["switchPersona"],setup(n){Rt(Ct,!0),ce(()=>{document.body.classList.add("handoff-static")}),ft(()=>{document.body.classList.remove("handoff-static")});const e=n,t=Mt();_t();const r=oe(()=>Pe(e.tree)[0]),s=H(void 0),i=H("");ce(()=>{const h=t.query.node||e.initialNodeId,c=h?Pe(e.tree).find(M=>M.taskId===h):void 0;s.value=c||r.value});const l=oe(()=>{const h=i.value.trim().toLowerCase();if(!h)return e.tree;const c=M=>M.toLowerCase().includes(h);return e.tree.map(M=>({...M,pages:M.pages.map(I=>{const P=(I.children??[]).map(R=>{const E=(R.children??[]).filter(K=>c(K.title));return c(R.title)?R:E.length>0?{...R,children:E}:null}).filter(R=>!!R);return c(I.title)?I:P.length>0?{...I,children:P}:null}).filter(I=>!!I)})).filter(M=>M.pages.length>0)}),p=oe(()=>e.cards.filter(h=>s.value?h.nodeId?Array.isArray(h.nodeId)?h.nodeId.includes(s.value.taskId):h.nodeId===s.value.taskId:h.pageId===s.value.pageId:!1));function a(h){s.value=h}function d(){const h=e.prdNodeId?Pe(e.tree).find(c=>c.taskId===e.prdNodeId):void 0;h&&a(h)}function u(){var R;const h=(R=s.value)==null?void 0:R.livePath;if(!h||!s.value)return;const c=new URLSearchParams({debug:"1",from:"proto",node:s.value.taskId}),M=new URL("./",window.location.href).pathname.replace(/\/$/,""),I=h.includes("?")?"&":"?",P=`${window.location.origin}${M}/#${h}${I}${c.toString()}`;window.open(P,"_blank")}return(h,c)=>{var de,he,X,Q,Fe,Ue;const M=ie("el-icon"),I=ie("el-button"),P=ie("el-input"),R=ie("el-empty"),E=ie("el-tag"),K=Pt("static-freeze");return g(),m("div",Jt,[o("header",Xt,[o("div",Yt,[c[1]||(c[1]=o("span",{class:"pv-logo"},"POM",-1)),o("span",en,f(n.title),1),o("span",tn,f(n.sub),1)]),o("div",nn,[n.prdNodeId?(g(),V(I,{key:0,text:"",type:"primary",onClick:d},{default:j(()=>[D(M,{class:"mr-4"},{default:j(()=>[D(B(kt))]),_:1}),c[2]||(c[2]=ge("PRD 文档 ",-1))]),_:1})):T("",!0),c[4]||(c[4]=o("span",{class:"pv-hint"},"静态展示模式（交互已冻结）",-1)),D(I,{type:"primary",onClick:u},{default:j(()=>[D(M,{class:"mr-4"},{default:j(()=>[D(B(vt))]),_:1}),c[3]||(c[3]=ge("查看动态高保真原型 ",-1))]),_:1})])]),o("div",sn,[o("aside",rn,[c[5]||(c[5]=o("div",{class:"pv-tree-head"},[o("span",null,"功能树")],-1)),D(P,{modelValue:i.value,"onUpdate:modelValue":c[0]||(c[0]=v=>i.value=v),size:"small",placeholder:"搜索功能页面",class:"pv-filter",clearable:""},null,8,["modelValue"]),o("div",an,[(g(!0),m(S,null,x(l.value,v=>(g(),m("div",{key:v.key,class:"pv-group"},[o("div",ln,f(v.title),1),(g(!0),m(S,null,x(v.pages,L=>{var y;return g(),m(S,{key:L.taskId},[o("div",{class:G(["pv-node",{active:((y=s.value)==null?void 0:y.taskId)===L.taskId}]),onClick:w=>a(L)},[o("span",cn,f(L.title),1)],10,on),(g(!0),m(S,null,x(L.children,w=>{var Ge;return g(),m(S,{key:w.taskId},[o("div",{class:G(["pv-node","pv-node-child",{active:((Ge=s.value)==null?void 0:Ge.taskId)===w.taskId}]),onClick:re=>a(w)},[o("span",un,f(w.title),1)],10,pn),(g(!0),m(S,null,x(w.children,re=>{var Ee;return g(),m("div",{key:re.taskId,class:G(["pv-node","pv-node-grand",{active:((Ee=s.value)==null?void 0:Ee.taskId)===re.taskId}]),onClick:Ii=>a(re)},[o("span",hn,f(re.title),1)],10,dn)}),128))],64)}),128))],64)}),128))]))),128)),l.value.length===0?(g(),V(R,{key:0,description:"无匹配功能","image-size":60})):T("",!0)])]),o("main",gn,[o("div",In,[o("div",null,[o("span",mn,f((de=s.value)==null?void 0:de.title),1),o("span",fn,f((he=s.value)==null?void 0:he.pageId),1)]),(X=n.personas)!=null&&X.length?(g(),m("div",Mn,[(g(!0),m(S,null,x(n.personas,v=>(g(),m("span",{key:v.userId,class:G(["pv-role",{active:n.activePersonaId===v.userId}]),onClick:L=>h.$emit("switchPersona",v.userId)},f(v.label),11,kn))),128))])):T("",!0),(Q=s.value)!=null&&Q.livePath?(g(),V(I,{key:1,size:"small",text:"",type:"primary",onClick:u},{default:j(()=>[c[6]||(c[6]=ge(" 在新窗口查看动态效果",-1)),D(M,null,{default:j(()=>[D(B(bt))]),_:1})]),_:1})):T("",!0)]),o("div",vn,[((Fe=s.value)==null?void 0:Fe.frame)==="doc"?(g(),m("div",bn,[(g(),V(_e(s.value.component),{key:s.value.taskId}))])):((Ue=s.value)==null?void 0:Ue.frame)==="pc"?(g(),m("div",_n,[Le((g(),V(_e(s.value.component),ze({key:s.value.taskId},s.value.staticQuery,{class:"pv-page"}),null,16)),[[K]])])):s.value?(g(),m("div",Pn,[n.personaLabel?(g(),m("span",Rn,f(n.personaLabel),1)):T("",!0),Le((g(),V(_e(s.value.component),ze({key:s.value.taskId},s.value.staticQuery,{class:"pv-page"}),null,16)),[[K]])])):T("",!0)])]),o("aside",Sn,[c[15]||(c[15]=o("div",{class:"pv-cards-head"},"需求注释 · 用例卡",-1)),o("div",xn,[(g(!0),m(S,null,x(p.value,v=>{var L;return g(),m("div",{key:v.ucId+v.fnId,class:"pvc-card"},[o("div",yn,[D(E,{size:"small",type:"primary"},{default:j(()=>[ge(f(v.fnId),1)]),_:2},1024),o("span",wn,f(v.fnName),1)]),o("div",Bn,f(v.ucId)+" "+f(v.ucName)+" · "+f(v.pageId),1),v.businessGoal?(g(),m("div",Cn,[c[7]||(c[7]=o("div",{class:"pvc-label"},"业务目标",-1)),o("div",Dn,f(v.businessGoal),1)])):T("",!0),(L=v.elements)!=null&&L.length?(g(),m("div",An,[c[8]||(c[8]=o("div",{class:"pvc-label"},"页面元素与交互",-1)),(g(!0),m(S,null,x(v.elements,(y,w)=>(g(),m("div",{key:w,class:"pvc-el"},[o("div",Tn,f(y.name),1),o("div",Nn,f(y.behavior),1)]))),128))])):T("",!0),o("div",$n,[c[9]||(c[9]=o("div",{class:"pvc-label"},"触发条件",-1)),o("div",Fn,f(v.trigger),1)]),o("div",Un,[c[10]||(c[10]=o("div",{class:"pvc-label"},"前置条件",-1)),o("div",Gn,f(v.precondition),1)]),o("div",En,[c[11]||(c[11]=o("div",{class:"pvc-label"},"主流程",-1)),o("ol",Ln,[(g(!0),m(S,null,x(v.mainFlow,(y,w)=>(g(),m("li",{key:w},f(y),1))),128))])]),o("div",zn,[c[12]||(c[12]=o("div",{class:"pvc-label"},"后置条件",-1)),o("div",Vn,f(v.postcondition),1)]),o("div",On,[c[13]||(c[13]=o("div",{class:"pvc-label"},"异常路径",-1)),o("ul",Qn,[(g(!0),m(S,null,x(v.exceptions,(y,w)=>(g(),m("li",{key:w},f(y),1))),128))])]),o("div",qn,[c[14]||(c[14]=o("div",{class:"pvc-label"},"关联业务规则",-1)),(g(!0),m(S,null,x(v.rules,y=>{var w;return g(),m("div",{key:y,class:"pvc-rule"},[o("div",Kn,f(y),1),(w=n.ruleResolver)!=null&&w.call(n,y)?(g(),V(st,{key:0,detail:n.ruleResolver(y).detail,class:"pvc-rule-detail"},null,8,["detail"])):T("",!0)])}),128))]),v.levelMapping?(g(),m("div",jn,[o("div",Zn,f(v.levelMapping.title),1),o("div",Hn,f(v.levelMapping.note),1),(g(!0),m(S,null,x(v.levelMapping.rows,(y,w)=>(g(),m("div",{key:w,class:"pvc-el"},[o("div",Wn,f(y.category)+" → "+f(y.level),1),o("div",Jn,f(y.action),1)]))),128))])):T("",!0)])}),128)),p.value.length===0?(g(),V(R,{key:0,description:"当前页面无用例卡","image-size":80})):T("",!0)])])])])}}}),Yn=F(Xn,[["__scopeId","data-v-8fc9b619"]]),es={class:"mod-stage"},ts=A({__name:"MEmojiPicker",setup(n){const e=()=>{};return(t,r)=>(g(),m("div",es,[r[0]||(r[0]=o("div",{class:"mod-chat-bg"},[o("div",{class:"mod-input-bar"})],-1)),D(Ut,{onSelect:e})]))}}),je=F(ts,[["__scopeId","data-v-ff5cbdeb"]]),ns={class:"mod-stage"},ss=A({__name:"MProfilePopup",setup(n){const e=St("u-f-01")??null,t=()=>{};return(r,s)=>(g(),m("div",ns,[D(jt,{user:B(e),"current-user-id":"u-clerk-1",onClose:t,onChat:t},null,8,["user"])]))}}),rs=F(ss,[["__scopeId","data-v-0a97855f"]]),is={class:"mod-stage"},as=A({__name:"MAftersalePanel",setup(n){const e=tt(),t=oe(()=>e.activeIdentity!=="customer"),r=Zt().records.find(l=>l.aftersale_id==="AS-002")??null,s=Ht(),i=()=>{};return(l,p)=>(g(),m("div",is,[D(Gt,{detail:B(r),"is-staff":t.value,"current-user-id":B(e).activeUserId,"logistics-trace":B(s),onClose:i,onHandle:i,onAction:i},null,8,["detail","is-staff","current-user-id","logistics-trace"])]))}}),ls=F(as,[["__scopeId","data-v-027a3841"]]),os={class:"rules-doc"},cs={class:"doc-sub"},ps={class:"rg-title"},us={class:"rc-head"},ds={class:"rc-id"},hs={class:"rc-name"},gs=A({__name:"BusinessRulesPage",setup(n){const e=[{title:"群与建群",ids:["BR-IM-001","BR-IM-002","BR-IM-005","BR-IM-013","BR-IM-019","BR-IM-021","BR-IM-023","BR-IM-024","BR-IM-025","BR-IM-031"]},{title:"可见性与权限",ids:["BR-IM-003","BR-IM-007","BR-IM-009","BR-IM-014","BR-IM-022"]},{title:"入群与邀请",ids:["BR-IM-006","FN-IM-018"]},{title:"消息与审核",ids:["BR-IM-011","BR-IM-012","BR-IM-017","BR-IM-020","BR-IM-032"]},{title:"好友体系",ids:["BR-IM-008"]},{title:"售后与服务",ids:["BR-IM-015","BR-IM-016","BR-IM-018"]},{title:"公告与搜索",ids:["BR-IM-010","FN-IM-013","FN-IM-007"]},{title:"直播分享",ids:["BR-IM-026","BR-IM-027","BR-IM-028","BR-IM-029","BR-IM-030"]}];return(t,r)=>(g(),m("div",os,[r[0]||(r[0]=o("div",{class:"doc-title"},"通讯录域 · 业务规则",-1)),o("div",cs,"共 "+f(e.reduce((s,i)=>s+i.ids.length,0))+" 条，按主题分组；与用例卡「关联业务规则」同源",1),(g(),m(S,null,x(e,s=>o("div",{key:s.title,class:"rule-group"},[o("div",ps,f(s.title),1),(g(!0),m(S,null,x(s.ids,i=>(g(),m("div",{key:i,class:"rule-card"},[o("div",us,[o("span",ds,f(i),1),o("span",hs,f(B(Oe)[i].name),1)]),D(st,{detail:B(Oe)[i].detail,class:"rc-detail"},null,8,["detail"])]))),128))])),64))]))}}),Is=F(gs,[["__scopeId","data-v-bc68ba32"]]);let Re=Promise.resolve();function ms(n){return Re=Re.then(n).catch(()=>{}),Re}const fs={key:0,class:"mmd-error"},Ms=["innerHTML"],ks=A({__name:"MermaidBlock",props:{source:{},highlight:{}},setup(n){fe.initialize({startOnLoad:!1,theme:"base",themeVariables:{primaryColor:"#E7F8F0",primaryBorderColor:"#12B76A",primaryTextColor:"#303133",lineColor:"#8C8C8C",secondaryColor:"#FFFBE6",tertiaryColor:"#F5F7FA",fontSize:"13px"},flowchart:{htmlLabels:!0},sequence:{actorMargin:60,messageMargin:32}});const e=n,t=H(""),r=H(""),s=H();let i=0;function l(){var d;s.value&&(s.value.querySelectorAll(".highlight").forEach(u=>u.classList.remove("highlight")),(d=e.highlight)!=null&&d.length&&s.value.querySelectorAll("g").forEach(u=>{var c;const h=(c=u.textContent)==null?void 0:c.trim();h&&e.highlight.includes(h)&&u.classList.add("highlight")}))}async function p(){r.value="";try{const d=`mmd-${Date.now()}-${++i}`,u=await Promise.race([fe.render(d,e.source),new Promise((h,c)=>setTimeout(()=>c(new Error("渲染超时（10s）")),1e4))]);t.value=u.svg,await nt(),l()}catch(d){r.value=d instanceof Error?d.message:String(d)}}function a(){return ms(p)}return ce(a),Ve(()=>e.source,a),Ve(()=>e.highlight,l,{deep:!0}),(d,u)=>(g(),m("div",{ref_key:"root",ref:s,class:"mermaid-block"},[r.value?(g(),m("div",fs,"图渲染失败："+f(r.value),1)):(g(),m("div",{key:1,class:"mmd-svg",innerHTML:t.value},null,8,Ms))],512))}}),rt=F(ks,[["__scopeId","data-v-0a8f1d46"]]),vs={class:"flows-doc"},bs={class:"d-title"},_s=`flowchart TB
    A[群创建] --> B{三类系统群<br/>无个人群聊}
    B --> O[门店通用群<br/>门店创建即建: 店长+店员]
    B --> S[客户群<br/>店长群/店员群]
    B --> K[客服群<br/>一对一]
    O --> O1[门店成员变动<br/>T+0 实时同步]
    S --> S1[客户绑定/扫码<br/>→入归属人客户群 不建群]
    S --> S2[全员禁言开关<br/>活动推送/开播提醒]
    K --> K1[客户主动咨询<br/>商品/订单详情「联系客服」才建]
    K1 --> K2[订单卡片→售后单→进度回写]
    S1 --> F{消息类型}
    K2 --> F
    F --> F1[文本/图片/文件→云端审核后投递]
    F --> F3[群公告→群内触达]
    S1 --> G{归属变更}
    G --> G1[换绑→可选同步转移<br/>客户群成员 BR-IM-025]`,Ps=`flowchart LR
    subgraph S4[数据源-既有域]
        D1[分销域: 组织树/锁客]
        D2[门店域: 门店/成员]
        D3[订单域: 订单查询]
        D4[售后域: 售后单]
        D5[租户门户域: 身份]
    end
    subgraph S3[通讯录业务服务]
        V[可见性引擎]
        G[群编排器: 自动建/同步/禁言/换绑转移]
        C[订单卡片适配器]
        A[售后联动器]
    end
    subgraph S2[腾讯云IM通道]
        SDK[客户端SDK/TUIKit]
        ROAM[漫游/历史消息]
        AUDIT[云端审核]
        CB[审核/消息回调]
    end
    subgraph S1[APP前端]
        UI[3角色视图/会话/聊天/群设置]
        DB[(本地DB双写)]
    end
    D1 & D2 & D5 --> V
    D3 --> C
    D4 <--> A
    V --> G --> SDK
    C --> SDK
    A --> SDK
    SDK --> UI
    SDK --> ROAM --> UI
    UI --> DB
    SDK --> AUDIT --> CB --> S3`,Rs=`sequenceDiagram
    participant C as 客户(APP)
    participant S1 as 通讯录前端
    participant S3 as 业务服务
    participant O as 订单域
    participant IM as 腾讯云IM
    participant ST as 店长/店员
    participant AS as 售后域
    C->>S1: 卡片区选择订单→「我要咨询此订单」
    S1->>S3: 提交咨询(仅本人订单只读)
    S3->>AS: 创建售后单(pending, 来源=IM)
    S3->>IM: 卡片入群+推送店员通知
    IM-->>ST: 卡片展示+通知badge
    Note over C,ST: 分支：客户模糊咨询时
    ST->>S3: 查客户以往订单(本店,进行中置顶)
    ST->>IM: 发送询问卡(不产生售后单)
    IM-->>C: 「是这笔/不是」
    C->>S3: 确认「是这笔」→创建售后单
    ST->>S1: 点击卡片→售后详情页
    S1->>ST: 开始处理(pending→processing)
    Note over C,AS: 客户视角全程=「进行中」
    alt 仅退款
        ST->>AS: 确认退款(金额+原因)
        AS-->>S3: 同意售后+退款完成(原路退回)→done
    else 退货退款
        ST->>AS: 同意退货→买家寄回→确认签收退款→done
    else 查物流
        ST->>S1: 展示物流轨迹时间线(状态不变)
    end
    S3->>IM: 进度卡回写+卡片标签同步「已完成」
    IM-->>C: 客户看到「已完成」+售后记录时间线*`,Ss=`sequenceDiagram
    participant U as 发送方
    participant SDK as IM SDK(客户端)
    participant IM as IM服务端
    participant AUD as 云端审核
    participant R as 接收方
    participant B as App后台
    Note over SDK,B: V1=Sim通道模拟，real切换腾讯云IM
    U->>SDK: 发送消息(文本/图片/文件)
    SDK->>IM: 消息上行
    IM->>AUD: 送审(文本/图片同步~50ms)
    alt 通过
        AUD-->>IM: pass
        IM-->>R: 正常投递
    else 可疑
        AUD-->>IM: review
        IM-->>R: 标记投递(待人工复审)
    else 拦截
        AUD-->>IM: block
        IM-->>U: 拦截通知(接收方无感知)
    end
    IM->>B: 审核结果回调(含异步音/视频结果)
    B->>B: 审核记录落库(ENT-IM-006)`,xs=A({__name:"FlowChartsPage",setup(n){const e=[{key:"flow-61",title:"§6.1 业务流程图（三类群与建群时机，v3.0 口径）",source:_s},{key:"flow-62",title:"§6.2 信息流转图",source:Ps},{key:"seq-64",title:"§6.4 业务时序图 — 订单卡片售后闭环",source:Rs},{key:"seq-65",title:"§6.5 三方接口时序图 — 消息云端审核链路",source:Ss}];return(t,r)=>(g(),m("div",vs,[r[0]||(r[0]=o("div",{class:"doc-title"},"通讯录域 · 流程图",-1)),r[1]||(r[1]=o("div",{class:"doc-sub"},"图形定义来自 PRD §6（mermaid 源渲染）；§6.1 已按 v3.0 现行口径重绘（三类群/绑定仅入客户群/主动咨询建客服群），「售后记录」命名按现行口径",-1)),(g(),m(S,null,x(e,s=>o("div",{key:s.key,class:"diagram"},[o("div",bs,f(s.title),1),D(rt,{source:s.source},null,8,["source"])])),64))]))}}),ys=F(xs,[["__scopeId","data-v-fa9e4a9a"]]),ws={class:"sm-doc"},Bs={class:"m-title"},Cs={class:"m-desc"},Ds={class:"m-table"},As=["onClick"],Ts=`stateDiagram-v2
    [*] --> 正常: 建群(门店创建/店员入职/主动咨询)
    正常 --> 已解散: 门店删除/群主解散/后台禁用选「同时解散」
    已解散 --> [*]: 记录按保留策略归档`,Ns=`stateDiagram-v2
    [*] --> 待处理: 客户咨询/确认询问卡
    待处理 --> 处理中: 店员接单(锁定处理人)
    处理中 --> 已完成: 退款完成/退货签收
    待处理 --> 已关闭: 关闭售后单
    处理中 --> 已关闭: 关闭售后单`,$s=`stateDiagram-v2
    [*] --> 待通过: 收到好友申请
    [*] --> 等待验证: 发出好友申请
    待通过 --> 已添加: 我点「通过」
    待通过 --> 已拒绝: 我拒绝
    等待验证 --> 已添加: 对方通过
    等待验证 --> 已拒绝: 对方拒绝(24h限再申请3次)`,Fs=A({__name:"StateMachinesPage",setup(n){const e=[{key:"group",title:"① 群状态机（PRD §6.3，v3.0 两档）",desc:"仅「正常」可发言；门店禁用/启用不影响群（BR-IM-024），换绑=成员转移不改变群状态（BR-IM-025），无沉睡托管（D12）",source:Ts,table:[{from:"—",event:"建群",to:"正常",actor:"系统自动",cond:"门店创建/店员入职/客户主动咨询（下单不触发；绑定仅入客户群不建群）",result:"群主=服务者本人",states:["正常"]},{from:"正常",event:"解散",to:"已解散",actor:"门店删除（系统）/群主解散（App 唯一途径）/后台禁用选「同时解散」",cond:"—",result:"不可发言仅可查看+记录归档",states:["正常","已解散"]}]},{key:"aftersale",title:"② 售后单状态机（契约实现对齐）",desc:"客户视角：待处理+处理中=「进行中」；处理中仅当前处理人可操作（服务独占）",source:Ns,table:[{from:"—",event:"建单",to:"待处理",actor:"系统自动",cond:"客户咨询/确认询问卡",result:"卡片入群+店员通知",states:["待处理"]},{from:"待处理",event:"接单",to:"处理中",actor:"店员",cond:"点「开始处理」",result:"锁定处理人，客户见「进行中」",states:["待处理","处理中"]},{from:"处理中",event:"完成",to:"已完成",actor:"店员",cond:"仅退款确认/退货签收退款",result:"卡片回写「已完成」",states:["处理中","已完成"]},{from:"待处理/处理中",event:"关闭",to:"已关闭",actor:"店员",cond:"点「关闭售后单」",result:"单关闭，群常开",states:["待处理","已关闭"]}]},{key:"friend",title:"③ 好友申请状态机（契约实现对齐）",desc:"「待通过」= 我收到的申请；「等待验证」= 我发出的申请",source:$s,table:[{from:"待通过",event:"通过",to:"已添加",actor:"我",cond:"点「通过」",result:"互为好友，可互发消息",states:["待通过","已添加"]},{from:"待通过",event:"拒绝",to:"已拒绝",actor:"我",cond:"拒绝申请",result:"对方 24h 内限再申请 3 次",states:["待通过","已拒绝"]},{from:"等待验证",event:"对方通过",to:"已添加",actor:"对方",cond:"对方点「通过」",result:"互为好友",states:["等待验证","已添加"]},{from:"等待验证",event:"对方拒绝",to:"已拒绝",actor:"对方",cond:"对方拒绝",result:"我 24h 内限再申请 3 次",states:["等待验证","已拒绝"]}]}],t=H({});function r(s,i){var l;t.value[s]=((l=t.value[s])==null?void 0:l.join())===i.join()?[]:[...i]}return(s,i)=>(g(),m("div",ws,[i[1]||(i[1]=o("div",{class:"doc-title"},"通讯录域 · 状态机",-1)),i[2]||(i[2]=o("div",{class:"doc-sub"},"图形定义来自 PRD v1.0.0 §6.3（mermaid 源 1:1 渲染）；点击下方过渡表任意行，图上对应状态高亮脉冲",-1)),(g(),m(S,null,x(e,l=>o("div",{key:l.key,class:"machine"},[o("div",Bs,f(l.title),1),o("div",Cs,f(l.desc),1),D(rt,{source:l.source,highlight:t.value[l.key]??[]},null,8,["source","highlight"]),o("table",Ds,[i[0]||(i[0]=o("thead",null,[o("tr",null,[o("th",null,"原状态"),o("th",null,"触发"),o("th",null,"新状态"),o("th",null,"触发者"),o("th",null,"条件"),o("th",null,"结果")])],-1)),o("tbody",null,[(g(!0),m(S,null,x(l.table,(p,a)=>{var d;return g(),m("tr",{key:a,class:G({active:((d=t.value[l.key])==null?void 0:d.join())===p.states.join()}),onClick:u=>r(l.key,p.states)},[o("td",null,f(p.from),1),o("td",null,f(p.event),1),o("td",null,f(p.to),1),o("td",null,f(p.actor),1),o("td",null,f(p.cond),1),o("td",null,f(p.result),1)],10,As)}),128))])])])),64))]))}}),Us=F(Fs,[["__scopeId","data-v-46ef6587"]]);function we(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var J=we();function it(n){J=n}var Z={exec:()=>null};function ne(n){let e=[];return t=>{let r=Math.max(0,Math.min(3,t-1)),s=e[r];return s||(s=n(r),e[r]=s),s}}function k(n,e=""){let t=typeof n=="string"?n:n.source,r={replace:(s,i)=>{let l=typeof i=="string"?i:i.source;return l=l.replace(C.caret,"$1"),t=t.replace(s,l),r},getRegex:()=>new RegExp(t,e)};return r}var Gs=((n="")=>{try{return!!new RegExp("(?<=1)(?<!1)"+n)}catch{return!1}})(),C={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] +\S/,listReplaceTask:/^\[[ xX]\] +/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:n=>new RegExp(`^( {0,3}${n})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:ne(n=>new RegExp(`^ {0,${n}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),hrRegex:ne(n=>new RegExp(`^ {0,${n}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`)),fencesBeginRegex:ne(n=>new RegExp(`^ {0,${n}}(?:\`\`\`|~~~)`)),headingBeginRegex:ne(n=>new RegExp(`^ {0,${n}}#`)),htmlBeginRegex:ne(n=>new RegExp(`^ {0,${n}}<(?:[a-z].*>|!--)`,"i")),blockquoteBeginRegex:ne(n=>new RegExp(`^ {0,${n}}>`))},Es=/^(?:[ \t]*(?:\n|$))+/,Ls=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,zs=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,pe=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Vs=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,Be=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,at=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,lt=k(at).replace(/bull/g,Be).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),Os=k(at).replace(/bull/g,Be).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),Ce=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/,Qs=/^[^\n]+/,De=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,qs=k(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",De).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Ks=k(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g,Be).getRegex(),be="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",Ae=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,js=k("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",Ae).replace("tag",be).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),ot=n=>k(Ce).replace("hr",pe).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list",n).replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",be).getRegex(),Zs=ot(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/),Hs=ot(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/),Ws=k(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",Hs).getRegex(),Te={blockquote:Ws,code:Ls,def:qs,fences:zs,heading:Vs,hr:pe,html:js,lheading:lt,list:Ks,newline:Es,paragraph:Zs,table:Z,text:Qs},Ze=k("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",pe).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",be).getRegex(),Js={...Te,lheading:Os,table:Ze,paragraph:k(Ce).replace("hr",pe).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",Ze).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",be).getRegex()},Xs={...Te,html:k(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",Ae).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:Z,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:k(Ce).replace("hr",pe).replace("heading",` *#{1,6} *[^
]`).replace("lheading",lt).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Ys=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,er=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,ct=/^( {2,}|\\)\n(?!\s*$)/,tr=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,O=/[\p{P}\p{S}]/u,se=/[\s\p{P}\p{S}]/u,ue=/[^\s\p{P}\p{S}]/u,nr=k(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,se).getRegex(),sr=/[\p{Pi}\p{Ps}"']/u,pt=/(?!~)[\p{P}\p{S}]/u,rr=/(?!~)[\s\p{P}\p{S}]/u,ir=/(?:[^\s\p{P}\p{S}]|~)/u,ar=k(/link|precode-code|html/,"g").replace("link",/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-",Gs?"(?<!`)()":"(^^|[^`])").replace("code",/(?<b>`+)[^`]+\k<b>(?!`)/).replace("html",/<(?! )[^<>]*?>/).getRegex(),ut=/^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,lr=k(ut,"u").replace(/punct/g,O).getRegex(),or=k(ut,"u").replace(/punct/g,pt).getRegex(),cr=/^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/,pr=k(cr,"u").replace(/openQuote/g,sr).replace(/punct/g,O).getRegex(),dt="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",ur=k(dt,"gu").replace(/notPunctSpace/g,ue).replace(/punctSpace/g,se).replace(/punct/g,O).getRegex(),dr=k(dt,"gu").replace(/notPunctSpace/g,ir).replace(/punctSpace/g,rr).replace(/punct/g,pt).getRegex(),hr="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)",gr=k(hr,"gu").replace(/notPunctSpace/g,ue).replace(/punctSpace/g,se).replace(/punct/g,O).getRegex(),Ir=k("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,ue).replace(/punctSpace/g,se).replace(/punct/g,O).getRegex(),mr="^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)",fr=k(mr,"gu").replace(/notPunctSpace/g,ue).replace(/punctSpace/g,se).replace(/punct/g,O).getRegex(),Mr=k(/^~~?(?:((?!~)punct)|[^\s~])/,"u").replace(/punct/g,O).getRegex(),kr="^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)",vr=k(kr,"gu").replace(/notPunctSpace/g,ue).replace(/punctSpace/g,se).replace(/punct/g,O).getRegex(),br=k(/\\(punct)/,"gu").replace(/punct/g,O).getRegex(),_r=k(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),Pr=k(Ae).replace("(?:-->|$)","-->").getRegex(),Rr=k("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",Pr).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),Me=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/,Sr=k(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label",Me).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),ht=k(/^!?\[(label)\]\[(ref)\]/).replace("label",Me).replace("ref",De).getRegex(),gt=k(/^!?\[(ref)\](?:\[\])?/).replace("ref",De).getRegex(),xr=k("reflink|nolink(?!\\()","g").replace("reflink",ht).replace("nolink",gt).getRegex(),He=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,Ne={_backpedal:Z,anyPunctuation:br,autolink:_r,blockSkip:ar,br:ct,code:er,del:Z,delLDelim:Z,delRDelim:Z,emStrongLDelim:lr,emStrongRDelimAst:ur,emStrongRDelimUnd:Ir,escape:Ys,link:Sr,nolink:gt,punctuation:nr,reflink:ht,reflinkSearch:xr,tag:Rr,text:tr,url:Z},yr={...Ne,emStrongLDelim:pr,emStrongRDelimAst:gr,emStrongRDelimUnd:fr,link:k(/^!?\[(label)\]\((.*?)\)/).replace("label",Me).getRegex(),reflink:k(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",Me).getRegex()},Se={...Ne,emStrongRDelimAst:dr,emStrongLDelim:or,delLDelim:Mr,delRDelim:vr,url:k(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol",He).replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:k(/^(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol",He).getRegex()},wr={...Se,br:k(ct).replace("{2,}","*").getRegex(),text:k(Se.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},Ie={normal:Te,gfm:Js,pedantic:Xs},ae={normal:Ne,gfm:Se,breaks:wr,pedantic:yr},Br={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},We=n=>Br[n];function U(n,e){if(e){if(C.escapeTest.test(n))return n.replace(C.escapeReplace,We)}else if(C.escapeTestNoEncode.test(n))return n.replace(C.escapeReplaceNoEncode,We);return n}function Je(n){try{n=encodeURI(n).replace(C.percentDecode,"%")}catch{return null}return n}function Xe(n,e){var i;let t=n.replace(C.findPipe,(l,p,a)=>{let d=!1,u=p;for(;--u>=0&&a[u]==="\\";)d=!d;return d?"|":" |"}),r=t.split(C.splitPipe),s=0;if(r[0].trim()||r.shift(),r.length>0&&!((i=r.at(-1))!=null&&i.trim())&&r.pop(),e)if(r.length>e)r.splice(e);else for(;r.length<e;)r.push("");for(;s<r.length;s++)r[s]=r[s].trim().replace(C.slashPipe,"|");return r}function q(n,e,t){let r=n.length;if(r===0)return"";let s=0;for(;s<r&&n.charAt(r-s-1)===e;)s++;return n.slice(0,r-s)}function Ye(n){let e=n.split(`
`),t=e.length-1;for(;t>=0&&C.blankLine.test(e[t]);)t--;return e.length-t<=2?n:e.slice(0,t+1).join(`
`)}function Cr(n,e){if(n.indexOf(e[1])===-1)return-1;let t=0;for(let r=0;r<n.length;r++)if(n[r]==="\\")r++;else if(n[r]===e[0])t++;else if(n[r]===e[1]&&(t--,t<0))return r;return t>0?-2:-1}function Dr(n,e=0){let t=e,r="";for(let s of n)if(s==="	"){let i=4-t%4;r+=" ".repeat(i),t+=i}else r+=s,t++;return r}function et(n,e,t,r,s){let i=e.href,l=e.title||null,p=n[1].replace(s.other.outputLinkReplace,"$1"),a=n[0].charAt(0)==="!";r.state.inLink=!0;let d=r.state.linkEmitted,u=r.state.inRawBlock;r.state.linkEmitted=!1;let h=r.inlineTokens(p),c=r.state.linkEmitted;if(r.state.linkEmitted=d,r.state.inLink=!1,!a){if(c){r.state.inRawBlock=u;return}r.state.linkEmitted=!0}return{type:a?"image":"link",raw:t,href:i,title:l,text:p,tokens:h}}function Ar(n,e,t){let r=n.match(t.other.indentCodeCompensation);if(r===null)return e;let s=r[1];return e.split(`
`).map(i=>{let l=i.match(t.other.beginningSpace);if(l===null)return i;let[p]=l;return p.length>=s.length?i.slice(s.length):i}).join(`
`)}var ke=class{constructor(n){b(this,"options");b(this,"rules");b(this,"lexer");this.options=n||J}space(n){let e=this.rules.block.newline.exec(n);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(n){let e=this.rules.block.code.exec(n);if(e){let t=this.options.pedantic?e[0]:Ye(e[0]),r=t.replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:t,codeBlockStyle:"indented",text:r}}}fences(n){let e=this.rules.block.fences.exec(n);if(e){let t=e[0],r=Ar(t,e[3]||"",this.rules);return{type:"code",raw:t,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:r}}}heading(n){let e=this.rules.block.heading.exec(n);if(e){let t=e[2].trim();if(this.rules.other.endingHash.test(t)){let r=q(t,"#");(this.options.pedantic||!r||this.rules.other.endingSpaceChar.test(r))&&(t=r.trim())}return{type:"heading",raw:q(e[0],`
`),depth:e[1].length,text:t,tokens:this.lexer.inline(t)}}}hr(n){let e=this.rules.block.hr.exec(n);if(e)return{type:"hr",raw:q(e[0],`
`)}}blockquote(n){let e=this.rules.block.blockquote.exec(n);if(e){let t=q(e[0],`
`).split(`
`),r="",s="",i=[];for(;t.length>0;){let l=!1,p=[],a;for(a=0;a<t.length;a++)if(this.rules.other.blockquoteStart.test(t[a]))p.push(t[a]),l=!0;else if(!l)p.push(t[a]);else break;t=t.slice(a);let d=p.join(`
`),u=d.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");r=r?`${r}
${d}`:d,s=s?`${s}
${u}`:u;let h=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(u,i,!0),this.lexer.state.top=h,t.length===0)break;let c=i.at(-1);if((c==null?void 0:c.type)==="code")break;if((c==null?void 0:c.type)==="blockquote"){let M=c,I=t.join(`
`),P=M.raw+`
`+I.replace(this.rules.other.blockquoteSetextReplace2,""),R=this.blockquote(P);i[i.length-1]=R,r=`${r}
${I}`,s=s.substring(0,s.length-M.text.length)+R.text;break}else if((c==null?void 0:c.type)==="list"){let M=c,I=M.raw+`
`+t.join(`
`),P=this.list(I);i[i.length-1]=P,r=r.substring(0,r.length-c.raw.length)+P.raw,s=s.substring(0,s.length-M.raw.length)+P.raw,t=I.substring(i.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:r,tokens:i,text:s}}}list(n){let e=this.rules.block.list.exec(n);if(e){let t=e[1].trim(),r=t.length>1,s={type:"list",raw:"",ordered:r,start:r?+t.slice(0,-1):"",loose:!1,items:[]};t=r?`\\d{1,9}\\${t.slice(-1)}`:`\\${t}`,this.options.pedantic&&(t=r?t:"[*+-]");let i=this.rules.other.listItemRegex(t),l=!1;for(;n;){let a=!1,d="",u="";if(!(e=i.exec(n))||this.rules.block.hr.test(n))break;d=e[0],n=n.substring(d.length);let h=Dr(e[2].split(`
`,1)[0],e[1].length),c=n.split(`
`,1)[0],M=!h.trim(),I=0;if(this.options.pedantic?(I=2,u=h.trimStart()):M?I=e[1].length+1:(I=h.search(this.rules.other.nonSpaceChar),I=I>4?1:I,u=h.slice(I),I+=e[1].length),M&&this.rules.other.blankLine.test(c)&&(d+=c+`
`,n=n.substring(c.length+1),a=!0),!a){let P=this.rules.other.nextBulletRegex(I),R=this.rules.other.hrRegex(I),E=this.rules.other.fencesBeginRegex(I),K=this.rules.other.headingBeginRegex(I),de=this.rules.other.htmlBeginRegex(I),he=this.rules.other.blockquoteBeginRegex(I);for(;n;){let X=n.split(`
`,1)[0],Q;if(c=X,this.options.pedantic?(c=c.replace(this.rules.other.listReplaceNesting,"  "),Q=c):Q=c.replace(this.rules.other.tabCharGlobal,"    "),E.test(c)||K.test(c)||de.test(c)||he.test(c)||P.test(c)||R.test(c))break;if(Q.search(this.rules.other.nonSpaceChar)>=I||!c.trim())u+=`
`+Q.slice(I);else{if(M||h.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||E.test(h)||K.test(h)||R.test(h))break;u+=`
`+c}M=!c.trim(),d+=X+`
`,n=n.substring(X.length+1),h=Q.slice(I)}}s.loose||(l?s.loose=!0:this.rules.other.doubleBlankLine.test(d)&&(l=!0)),s.items.push({type:"list_item",raw:d,task:!!this.options.gfm&&this.rules.other.listIsTask.test(u),loose:!1,text:u,tokens:[]}),s.raw+=d}let p=s.items.at(-1);if(p)p.raw=p.raw.trimEnd(),p.text=p.text.trimEnd();else return;s.raw=s.raw.trimEnd();for(let a of s.items)if(this.lexer.state.top=!1,a.tokens=this.lexer.blockTokens(a.text,[]),!s.loose){let d=a.tokens.filter(h=>h.type==="space"),u=d.length>0&&d.some(h=>this.rules.other.anyLine.test(h.raw));s.loose=u}for(let a of s.items){let d=a.tokens[0];if(a.task&&((d==null?void 0:d.type)==="text"||(d==null?void 0:d.type)==="paragraph")){a.text=a.text.replace(this.rules.other.listReplaceTask,""),d.raw=d.raw.replace(this.rules.other.listReplaceTask,""),d.text=d.text.replace(this.rules.other.listReplaceTask,"");for(let h=this.lexer.inlineQueue.length-1;h>=0;h--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[h].src)){this.lexer.inlineQueue[h].src=this.lexer.inlineQueue[h].src.replace(this.rules.other.listReplaceTask,"");break}let u=this.rules.other.listTaskCheckbox.exec(a.raw);if(u){let h={type:"checkbox",raw:u[0]+" ",checked:u[0]!=="[ ]"};a.checked=h.checked,s.loose?a.tokens[0]&&["paragraph","text"].includes(a.tokens[0].type)&&"tokens"in a.tokens[0]&&a.tokens[0].tokens?(a.tokens[0].raw=h.raw+a.tokens[0].raw,a.tokens[0].text=h.raw+a.tokens[0].text,a.tokens[0].tokens.unshift(h)):a.tokens.unshift({type:"paragraph",raw:h.raw,text:h.raw,tokens:[h]}):a.tokens.unshift(h)}}else a.task&&(a.task=!1)}if(s.loose)for(let a of s.items){a.loose=!0;for(let d of a.tokens)d.type==="text"&&(d.type="paragraph")}return s}}html(n){let e=this.rules.block.html.exec(n);if(e){let t=Ye(e[0]);return{type:"html",block:!0,raw:t,pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:t}}}def(n){let e=this.rules.block.def.exec(n);if(e){let t=e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),r=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",s=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:t,raw:q(e[0],`
`),href:r,title:s}}}table(n){var l;let e=this.rules.block.table.exec(n);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;let t=Xe(e[1]),r=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),s=(l=e[3])!=null&&l.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],i={type:"table",raw:q(e[0],`
`),header:[],align:[],rows:[]};if(t.length===r.length){for(let p of r)this.rules.other.tableAlignRight.test(p)?i.align.push("right"):this.rules.other.tableAlignCenter.test(p)?i.align.push("center"):this.rules.other.tableAlignLeft.test(p)?i.align.push("left"):i.align.push(null);for(let p=0;p<t.length;p++)i.header.push({text:t[p],tokens:this.lexer.inline(t[p]),header:!0,align:i.align[p]});for(let p of s)i.rows.push(Xe(p,i.header.length).map((a,d)=>({text:a,tokens:this.lexer.inline(a),header:!1,align:i.align[d]})));return i}}lheading(n){let e=this.rules.block.lheading.exec(n);if(e){let t=e[1].trim();return{type:"heading",raw:q(e[0],`
`),depth:e[2].charAt(0)==="="?1:2,text:t,tokens:this.lexer.inline(t)}}}paragraph(n){let e=this.rules.block.paragraph.exec(n);if(e){let t=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:t,tokens:this.lexer.inline(t)}}}text(n){let e=this.rules.block.text.exec(n);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(n){let e=this.rules.inline.escape.exec(n);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(n){let e=this.rules.inline.tag.exec(n);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(n){let e=this.rules.inline.link.exec(n);if(e){let t=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(t)){if(!this.rules.other.endAngleBracket.test(t))return;let i=q(t.slice(0,-1),"\\");if((t.length-i.length)%2===0)return}else{let i=Cr(e[2],"()");if(i===-2)return;if(i>-1){let l=(e[0].indexOf("!")===0?5:4)+e[1].length+i;e[2]=e[2].substring(0,i),e[0]=e[0].substring(0,l).trim(),e[3]=""}}let r=e[2],s="";if(this.options.pedantic){let i=this.rules.other.pedanticHrefTitle.exec(r);i&&(r=i[1],s=i[3])}else s=e[3]?e[3].slice(1,-1):"";return r=r.trim(),this.rules.other.startAngleBracket.test(r)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(t)?r=r.slice(1):r=r.slice(1,-1)),et(e,{href:r&&r.replace(this.rules.inline.anyPunctuation,"$1"),title:s&&s.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(n,e){let t;if((t=this.rules.inline.reflink.exec(n))||(t=this.rules.inline.nolink.exec(n))){let r=(t[2]||t[1]).replace(this.rules.other.multipleSpaceGlobal," "),s=e[r.toLowerCase()];if(!s){let i=t[0].charAt(0);return{type:"text",raw:i,text:i}}return et(t,s,t[0],this.lexer,this.rules)}}emStrong(n,e,t=""){let r=this.rules.inline.emStrongLDelim.exec(n);if(!(!r||!r[1]&&!r[2]&&!r[3]&&!r[4]||r[4]&&t.match(this.rules.other.unicodeAlphaNumeric))&&(!(r[1]||r[3])||!t||this.rules.inline.punctuation.exec(t))){let s=[...r[0]].length-1,i,l,p=s,a=0,d=r[0][0],u=t===d,h=d==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(h.lastIndex=0,e=e.slice(-1*n.length+s);(r=h.exec(e))!==null;){if(i=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!i)continue;if(l=[...i].length,r[3]||r[4]){p+=l;continue}else if(r[5]||r[6]){if(s%3&&!((s+l)%3)){a+=l;continue}if(u)break}if(p-=l,p>0)continue;l=Math.min(l,l+p+a);let c=[...r[0]][0].length,M=n.slice(0,s+r.index+c+l);if(Math.min(s,l)%2){let P=M.slice(1,-1);return{type:"em",raw:M,text:P,tokens:this.lexer.inlineTokens(P)}}let I=M.slice(2,-2);return{type:"strong",raw:M,text:I,tokens:this.lexer.inlineTokens(I)}}}}codespan(n){let e=this.rules.inline.code.exec(n);if(e){let t=e[2].replace(this.rules.other.newLineCharGlobal," "),r=this.rules.other.nonSpaceChar.test(t),s=this.rules.other.startingSpaceChar.test(t)&&this.rules.other.endingSpaceChar.test(t);return r&&s&&(t=t.substring(1,t.length-1)),{type:"codespan",raw:e[0],text:t}}}br(n){let e=this.rules.inline.br.exec(n);if(e)return{type:"br",raw:e[0]}}del(n,e,t=""){let r=this.rules.inline.delLDelim.exec(n);if(r&&(!r[1]||!t||this.rules.inline.punctuation.exec(t))){let s=[...r[0]].length-1,i,l,p=s,a=this.rules.inline.delRDelim;for(a.lastIndex=0,e=e.slice(-1*n.length+s);(r=a.exec(e))!==null;){if(i=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!i||(l=[...i].length,l!==s))continue;if(r[3]||r[4]){p+=l;continue}if(p-=l,p>0)continue;l=Math.min(l,l+p);let d=[...r[0]][0].length,u=n.slice(0,s+r.index+d+l),h=u.slice(s,-s);return{type:"del",raw:u,text:h,tokens:this.lexer.inlineTokens(h)}}}}autolink(n){let e=this.rules.inline.autolink.exec(n);if(e){let t,r;return e[2]==="@"?(t=e[1],r="mailto:"+t):(t=e[1],r=t),{type:"link",raw:e[0],text:t,href:r,tokens:[{type:"text",raw:t,text:t}]}}}url(n){var t;let e;if(e=this.rules.inline.url.exec(n)){let r,s;if(e[2]==="@")r=e[0],s="mailto:"+r;else{let i;do i=e[0],e[0]=((t=this.rules.inline._backpedal.exec(e[0]))==null?void 0:t[0])??"";while(i!==e[0]);r=e[0],e[1]==="www."?s="http://"+e[0]:s=e[0]}return{type:"link",raw:e[0],text:r,href:s,tokens:[{type:"text",raw:r,text:r}]}}}inlineText(n){let e=this.rules.inline.text.exec(n);if(e){let t=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:e[0],escaped:t}}}},N=class xe{constructor(e){b(this,"tokens");b(this,"options");b(this,"state");b(this,"inlineQueue");b(this,"tokenizer");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||J,this.options.tokenizer=this.options.tokenizer||new ke,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,linkEmitted:!1,top:!0};let t={other:C,block:Ie.normal,inline:ae.normal};this.options.pedantic?(t.block=Ie.pedantic,t.inline=ae.pedantic):this.options.gfm&&(t.block=Ie.gfm,this.options.breaks?t.inline=ae.breaks:t.inline=ae.gfm),this.tokenizer.rules=t}static get rules(){return{block:Ie,inline:ae}}static lex(e,t){return new xe(t).lex(e)}static lexInline(e,t){return new xe(t).inlineTokens(e)}lex(e){e=e.replace(C.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){let r=this.inlineQueue[t];this.inlineTokens(r.src,r.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],r=!1){var i,l,p;this.tokenizer.lexer=this,this.options.pedantic&&(e=e.replace(C.tabCharGlobal,"    ").replace(C.spaceLine,""));let s=1/0;for(;e;){if(e.length<s)s=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}let a;if((l=(i=this.options.extensions)==null?void 0:i.block)!=null&&l.some(u=>(a=u.call({lexer:this},e,t))?(e=e.substring(a.raw.length),t.push(a),!0):!1))continue;if(a=this.tokenizer.space(e)){e=e.substring(a.raw.length);let u=t.at(-1);a.raw.length===1&&u!==void 0?u.raw+=`
`:t.push(a);continue}if(a=this.tokenizer.code(e)){e=e.substring(a.raw.length);let u=t.at(-1);(u==null?void 0:u.type)==="paragraph"||(u==null?void 0:u.type)==="text"?(u.raw+=(u.raw.endsWith(`
`)?"":`
`)+a.raw,u.text+=`
`+a.text,this.inlineQueue.at(-1).src=u.text):t.push(a);continue}if(a=this.tokenizer.fences(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.heading(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.hr(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.blockquote(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.list(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.html(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.def(e)){e=e.substring(a.raw.length);let u=t.at(-1);(u==null?void 0:u.type)==="paragraph"||(u==null?void 0:u.type)==="text"?(u.raw+=(u.raw.endsWith(`
`)?"":`
`)+a.raw,u.text+=`
`+a.raw,this.inlineQueue.at(-1).src=u.text):this.tokens.links[a.tag]||(this.tokens.links[a.tag]={href:a.href,title:a.title},t.push(a));continue}if(a=this.tokenizer.table(e)){e=e.substring(a.raw.length),t.push(a);continue}if(a=this.tokenizer.lheading(e)){e=e.substring(a.raw.length),t.push(a);continue}let d=e;if((p=this.options.extensions)!=null&&p.startBlock){let u=1/0,h=e.slice(1),c;this.options.extensions.startBlock.forEach(M=>{c=M.call({lexer:this},h),typeof c=="number"&&c>=0&&(u=Math.min(u,c))}),u<1/0&&u>=0&&(d=e.substring(0,u+1))}if(this.state.top&&(a=this.tokenizer.paragraph(d))){let u=t.at(-1);r&&(u==null?void 0:u.type)==="paragraph"?(u.raw+=(u.raw.endsWith(`
`)?"":`
`)+a.raw,u.text+=`
`+a.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=u.text):t.push(a),r=d.length!==e.length,e=e.substring(a.raw.length);continue}if(a=this.tokenizer.text(e)){e=e.substring(a.raw.length);let u=t.at(-1);(u==null?void 0:u.type)==="text"?(u.raw+=(u.raw.endsWith(`
`)?"":`
`)+a.raw,u.text+=`
`+a.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=u.text):t.push(a);continue}if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}linkInText(e){if(!e.includes("["))return!1;let t=this.tokenizer.rules.inline.link;for(let r of e.matchAll(this.tokenizer.rules.inline.blockSkip))if(t.test(r[0])&&e.charAt(r.index-1)!=="!")return!0;for(let r of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)){let s=r[0],i=s.lastIndexOf("[");if(!(s.charAt(0)==="!"||!Object.hasOwn(this.tokens.links,s.slice(i+1,-1)))&&!(i>1&&this.linkInText(s.slice(1,i-1))))return!0}return!1}inlineTokens(e,t=[]){var p,a,d,u,h;this.tokenizer.lexer=this;let r=e;if(this.tokens.links&&e.includes("[")){let c=this.tokenizer.rules.inline.reflinkSearch,M=I=>{let P=I.lastIndexOf("[");if(!Object.hasOwn(this.tokens.links,I.slice(P+1,-1)))return I;if(P>1&&I.charAt(0)!=="!"){let R=I.slice(1,P-1);if(this.linkInText(R))return"["+R.replace(c,M)+"]["+"a".repeat(I.length-P-2)+"]"}return"["+"a".repeat(I.length-2)+"]"};r=r.replace(c,M)}r=r.replace(this.tokenizer.rules.inline.anyPunctuation,c=>"+".repeat(c.length)),r=r.replace(this.tokenizer.rules.inline.blockSkip,(c,M,I)=>{let P=I?I.length:0;return c.slice(0,P)+"["+"a".repeat(c.length-P-2)+"]"}),r=((a=(p=this.options.hooks)==null?void 0:p.emStrongMask)==null?void 0:a.call({lexer:this},r))??r;let s=!1,i="",l=1/0;for(;e;){if(e.length<l)l=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}s||(i=""),s=!1;let c;if((u=(d=this.options.extensions)==null?void 0:d.inline)!=null&&u.some(I=>(c=I.call({lexer:this},e,t))?(e=e.substring(c.raw.length),t.push(c),!0):!1))continue;if(c=this.tokenizer.escape(e)){e=e.substring(c.raw.length),t.push(c);continue}if(c=this.tokenizer.tag(e)){e=e.substring(c.raw.length),t.push(c);continue}if(c=this.tokenizer.link(e)){e=e.substring(c.raw.length),t.push(c);continue}if(c=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(c.raw.length);let I=t.at(-1);c.type==="text"&&(I==null?void 0:I.type)==="text"?(I.raw+=c.raw,I.text+=c.text):t.push(c);continue}if(c=this.tokenizer.emStrong(e,r,i)){e=e.substring(c.raw.length),t.push(c);continue}if(c=this.tokenizer.codespan(e)){e=e.substring(c.raw.length),t.push(c);continue}if(c=this.tokenizer.br(e)){e=e.substring(c.raw.length),t.push(c);continue}if(c=this.tokenizer.del(e,r,i)){e=e.substring(c.raw.length),t.push(c);continue}if(c=this.tokenizer.autolink(e)){e=e.substring(c.raw.length),t.push(c);continue}if(!this.state.inLink&&(c=this.tokenizer.url(e))){e=e.substring(c.raw.length),t.push(c);continue}let M=e;if((h=this.options.extensions)!=null&&h.startInline){let I=1/0,P=e.slice(1),R;this.options.extensions.startInline.forEach(E=>{R=E.call({lexer:this},P),typeof R=="number"&&R>=0&&(I=Math.min(I,R))}),I<1/0&&I>=0&&(M=e.substring(0,I+1))}if(c=this.tokenizer.inlineText(M)){e=e.substring(c.raw.length),c.raw.slice(-1)!=="_"&&(i=c.raw.slice(-1)),s=!0;let I=t.at(-1);(I==null?void 0:I.type)==="text"?(I.raw+=c.raw,I.text+=c.text):t.push(c);continue}if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return t}infiniteLoopError(e){let t="Infinite loop on byte: "+e;if(this.options.silent)console.error(t);else throw new Error(t)}},ve=class{constructor(n){b(this,"options");b(this,"parser");this.options=n||J}space(n){return""}code({text:n,lang:e,escaped:t}){var i;let r=(i=(e||"").match(C.notSpaceStart))==null?void 0:i[0],s=n.replace(C.endingNewline,"")+`
`;return r?'<pre><code class="language-'+U(r)+'">'+(t?s:U(s,!0))+`</code></pre>
`:"<pre><code>"+(t?s:U(s,!0))+`</code></pre>
`}blockquote({tokens:n}){return`<blockquote>
${this.parser.parse(n)}</blockquote>
`}html({text:n}){return n}def(n){return""}heading({tokens:n,depth:e}){return`<h${e}>${this.parser.parseInline(n)}</h${e}>
`}hr(n){return`<hr>
`}list(n){let e=n.ordered,t=n.start,r="";for(let l=0;l<n.items.length;l++){let p=n.items[l];r+=this.listitem(p)}let s=e?"ol":"ul",i=e&&t!==1?' start="'+t+'"':"";return"<"+s+i+`>
`+r+"</"+s+`>
`}listitem(n){return`<li>${this.parser.parse(n.tokens)}</li>
`}checkbox({checked:n}){return"<input "+(n?'checked="" ':"")+'disabled="" type="checkbox"> '}paragraph({tokens:n}){return`<p>${this.parser.parseInline(n)}</p>
`}table(n){let e="",t="";for(let s=0;s<n.header.length;s++)t+=this.tablecell(n.header[s]);e+=this.tablerow({text:t});let r="";for(let s=0;s<n.rows.length;s++){let i=n.rows[s];t="";for(let l=0;l<i.length;l++)t+=this.tablecell(i[l]);r+=this.tablerow({text:t})}return r&&(r=`<tbody>${r}</tbody>`),`<table>
<thead>
`+e+`</thead>
`+r+`</table>
`}tablerow({text:n}){return`<tr>
${n}</tr>
`}tablecell(n){let e=this.parser.parseInline(n.tokens),t=n.header?"th":"td";return(n.align?`<${t} align="${n.align}">`:`<${t}>`)+e+`</${t}>
`}strong({tokens:n}){return`<strong>${this.parser.parseInline(n)}</strong>`}em({tokens:n}){return`<em>${this.parser.parseInline(n)}</em>`}codespan({text:n}){return`<code>${U(n,!0)}</code>`}br(n){return"<br>"}del({tokens:n}){return`<del>${this.parser.parseInline(n)}</del>`}link({href:n,title:e,tokens:t}){let r=this.parser.parseInline(t),s=Je(n);if(s===null)return r;n=s;let i='<a href="'+n+'"';return e&&(i+=' title="'+U(e)+'"'),i+=">"+r+"</a>",i}image({href:n,title:e,text:t,tokens:r}){r&&(t=this.parser.parseInline(r,this.parser.textRenderer));let s=Je(n);if(s===null)return U(t);n=s;let i=`<img src="${n}" alt="${U(t)}"`;return e&&(i+=` title="${U(e)}"`),i+=">",i}text(n){return"tokens"in n&&n.tokens?this.parser.parseInline(n.tokens):"escaped"in n&&n.escaped?n.text:U(n.text)}},$e=class{strong({text:n}){return n}em({text:n}){return n}codespan({text:n}){return n}del({text:n}){return n}html({text:n}){return n}text({text:n}){return n}link({text:n}){return""+n}image({text:n}){return""+n}br(){return""}checkbox({raw:n}){return n}},$=class ye{constructor(e){b(this,"options");b(this,"renderer");b(this,"textRenderer");this.options=e||J,this.options.renderer=this.options.renderer||new ve,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new $e}static parse(e,t){return new ye(t).parse(e)}static parseInline(e,t){return new ye(t).parseInline(e)}parse(e){var r,s;this.renderer.parser=this;let t="";for(let i=0;i<e.length;i++){let l=e[i];if((s=(r=this.options.extensions)==null?void 0:r.renderers)!=null&&s[l.type]){let a=l,d=this.options.extensions.renderers[a.type].call({parser:this},a);if(d!==!1||!["space","hr","heading","code","table","blockquote","list","checkbox","html","def","paragraph","text"].includes(a.type)){t+=d||"";continue}}let p=l;switch(p.type){case"space":{t+=this.renderer.space(p);break}case"hr":{t+=this.renderer.hr(p);break}case"heading":{t+=this.renderer.heading(p);break}case"code":{t+=this.renderer.code(p);break}case"table":{t+=this.renderer.table(p);break}case"blockquote":{t+=this.renderer.blockquote(p);break}case"list":{t+=this.renderer.list(p);break}case"checkbox":{t+=this.renderer.checkbox(p);break}case"html":{t+=this.renderer.html(p);break}case"def":{t+=this.renderer.def(p);break}case"paragraph":{t+=this.renderer.paragraph(p);break}case"text":{t+=this.renderer.text(p);break}default:{let a='Token with "'+p.type+'" type was not found.';if(this.options.silent)return console.error(a),"";throw new Error(a)}}}return t}parseInline(e,t=this.renderer){var s,i;this.renderer.parser=this;let r="";for(let l=0;l<e.length;l++){let p=e[l];if((i=(s=this.options.extensions)==null?void 0:s.renderers)!=null&&i[p.type]){let d=this.options.extensions.renderers[p.type].call({parser:this},p);if(d!==!1||!["escape","html","link","image","checkbox","strong","em","codespan","br","del","text"].includes(p.type)){r+=d||"";continue}}let a=p;switch(a.type){case"escape":{r+=t.text(a);break}case"html":{r+=t.html(a);break}case"link":{r+=t.link(a);break}case"image":{r+=t.image(a);break}case"checkbox":{r+=t.checkbox(a);break}case"strong":{r+=t.strong(a);break}case"em":{r+=t.em(a);break}case"codespan":{r+=t.codespan(a);break}case"br":{r+=t.br(a);break}case"del":{r+=t.del(a);break}case"text":{r+=t.text(a);break}default:{let d='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(d),"";throw new Error(d)}}}return r}},me,le=(me=class{constructor(n){b(this,"options");b(this,"block");this.options=n||J}preprocess(n){return n}postprocess(n){return n}processAllTokens(n){return n}emStrongMask(n){return n}provideLexer(n=this.block){return n?N.lex:N.lexInline}provideParser(n=this.block){return n?$.parse:$.parseInline}},b(me,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens","emStrongMask"])),b(me,"passThroughHooksRespectAsync",new Set(["preprocess","postprocess","processAllTokens"])),me),Tr=class{constructor(...n){b(this,"defaults",we());b(this,"options",this.setOptions);b(this,"parse",this.parseMarkdown(!0));b(this,"parseInline",this.parseMarkdown(!1));b(this,"Parser",$);b(this,"Renderer",ve);b(this,"TextRenderer",$e);b(this,"Lexer",N);b(this,"Tokenizer",ke);b(this,"Hooks",le);this.use(...n)}walkTokens(n,e){var r,s;let t=[];for(let i of n)switch(t=t.concat(e.call(this,i)),i.type){case"table":{let l=i;for(let p of l.header)t=t.concat(this.walkTokens(p.tokens,e));for(let p of l.rows)for(let a of p)t=t.concat(this.walkTokens(a.tokens,e));break}case"list":{let l=i;t=t.concat(this.walkTokens(l.items,e));break}default:{let l=i;(s=(r=this.defaults.extensions)==null?void 0:r.childTokens)!=null&&s[l.type]?this.defaults.extensions.childTokens[l.type].forEach(p=>{let a=l[p].flat(1/0);t=t.concat(this.walkTokens(a,e))}):l.tokens&&(t=t.concat(this.walkTokens(l.tokens,e)))}}return t}use(...n){let e=this.defaults.extensions||{renderers:{},childTokens:{}};return n.forEach(t=>{let r={...t};if(r.async=this.defaults.async||r.async||!1,t.extensions&&(t.extensions.forEach(s=>{if(!s.name)throw new Error("extension name required");if("renderer"in s){let i=e.renderers[s.name];i?e.renderers[s.name]=function(...l){let p=s.renderer.apply(this,l);return p===!1&&(p=i.apply(this,l)),p}:e.renderers[s.name]=s.renderer}if("tokenizer"in s){if(!s.level||s.level!=="block"&&s.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let i=e[s.level];i?i.unshift(s.tokenizer):e[s.level]=[s.tokenizer],s.start&&(s.level==="block"?e.startBlock?e.startBlock.push(s.start):e.startBlock=[s.start]:s.level==="inline"&&(e.startInline?e.startInline.push(s.start):e.startInline=[s.start]))}"childTokens"in s&&s.childTokens&&(e.childTokens[s.name]=s.childTokens)}),r.extensions=e),t.renderer){let s=this.defaults.renderer||new ve(this.defaults);for(let i in t.renderer){if(!(i in s))throw new Error(`renderer '${i}' does not exist`);if(["options","parser"].includes(i))continue;let l=i,p=t.renderer[l],a=s[l];s[l]=(...d)=>{let u=p.apply(s,d);return u===!1&&(u=a.apply(s,d)),u||""}}r.renderer=s}if(t.tokenizer){let s=this.defaults.tokenizer||new ke(this.defaults);for(let i in t.tokenizer){if(!(i in s))throw new Error(`tokenizer '${i}' does not exist`);if(["options","rules","lexer"].includes(i))continue;let l=i,p=t.tokenizer[l],a=s[l];s[l]=(...d)=>{let u=p.apply(s,d);return u===!1&&(u=a.apply(s,d)),u}}r.tokenizer=s}if(t.hooks){let s=this.defaults.hooks||new le;for(let i in t.hooks){if(!(i in s))throw new Error(`hook '${i}' does not exist`);if(["options","block"].includes(i))continue;let l=i,p=t.hooks[l],a=s[l];le.passThroughHooks.has(i)?s[l]=d=>{if(this.defaults.async&&le.passThroughHooksRespectAsync.has(i))return(async()=>{let h=await p.call(s,d);return a.call(s,h)})();let u=p.call(s,d);return a.call(s,u)}:s[l]=(...d)=>{if(this.defaults.async)return(async()=>{let h=await p.apply(s,d);return h===!1&&(h=await a.apply(s,d)),h})();let u=p.apply(s,d);return u===!1&&(u=a.apply(s,d)),u}}r.hooks=s}if(t.walkTokens){let s=this.defaults.walkTokens,i=t.walkTokens;r.walkTokens=function(l){let p=[];return p.push(i.call(this,l)),s&&(p=p.concat(s.call(this,l))),p}}this.defaults={...this.defaults,...r}}),this}setOptions(n){return this.defaults={...this.defaults,...n},this}lexer(n,e){return N.lex(n,e??this.defaults)}parser(n,e){return $.parse(n,e??this.defaults)}parseMarkdown(n){return(e,t)=>{let r={...t},s={...this.defaults,...r},i=this.onError(!!s.silent,!!s.async);if(this.defaults.async===!0&&r.async===!1)return i(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof e>"u"||e===null)return i(new Error("marked(): input parameter is undefined or null"));if(typeof e!="string")return i(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected"));if(s.hooks&&(s.hooks.options=s,s.hooks.block=n),s.async)return(async()=>{let l=s.hooks?await s.hooks.preprocess(e):e,p=await(s.hooks?await s.hooks.provideLexer(n):n?N.lex:N.lexInline)(l,s),a=s.hooks?await s.hooks.processAllTokens(p):p;s.walkTokens&&await Promise.all(this.walkTokens(a,s.walkTokens));let d=await(s.hooks?await s.hooks.provideParser(n):n?$.parse:$.parseInline)(a,s);return s.hooks?await s.hooks.postprocess(d):d})().catch(i);try{s.hooks&&(e=s.hooks.preprocess(e));let l=(s.hooks?s.hooks.provideLexer(n):n?N.lex:N.lexInline)(e,s);s.hooks&&(l=s.hooks.processAllTokens(l)),s.walkTokens&&this.walkTokens(l,s.walkTokens);let p=(s.hooks?s.hooks.provideParser(n):n?$.parse:$.parseInline)(l,s);return s.hooks&&(p=s.hooks.postprocess(p)),p}catch(l){return i(l)}}}onError(n,e){return t=>{if(t.message+=`
Please report this to https://github.com/markedjs/marked.`,n){let r="<p>An error occurred:</p><pre>"+U(t.message+"",!0)+"</pre>";return e?Promise.resolve(r):r}if(e)return Promise.reject(t);throw t}}},W=new Tr;function _(n,e){return W.parse(n,e)}_.options=_.setOptions=function(n){return W.setOptions(n),_.defaults=W.defaults,it(_.defaults),_};_.getDefaults=we;_.defaults=J;function Nr(...n){return W.use(...n),_.defaults=W.defaults,it(_.defaults),_}_.use=Nr;_.walkTokens=function(n,e){return W.walkTokens(n,e)};_.parseInline=W.parseInline;_.Parser=$;_.parser=$.parse;_.Renderer=ve;_.TextRenderer=$e;_.Lexer=N;_.lexer=N.lex;_.Tokenizer=ke;_.Hooks=le;_.parse=_;_.options;_.setOptions;_.walkTokens;_.parseInline;$.parse;N.lex;const $r=`# 17-通讯录域 PRD — V1.0.0（确认稿）

> **需求流**：STR-SAAS-003｜**类型**：新增｜**优先级**：P0
> **基线**：脑暴确认稿 + 2026-08-03 门店群聊会议纪要（D1~D14 决策）+ 2026-08-04 用户裁决（D15 群容量/D16 禁用话术与公海/D17 取消单端登录/D18 直播模块本期不开发/D19 消息免打扰归本期），全部并入正文
> **刷新日期**：2026-08-04｜**刷新原则**：正文=现行唯一口径；已决策项不再保留【待确认】标注；作废规则/功能直接删除（决策轨迹见 §15）
> **版本说明**：本稿为通讯录域 PRD 首个正式版本（V1.0.0）；此前迭代过程稿已清理（决策沿革见 §16）

---

## 0. 版本总览

| 维度 | 规模 | 说明 |
|---|---|---|
| 功能模块（FN） | 23 项 | 含 INFRA/LIVE-001/直播群发 019~021/绑定入群 022/联系客服 023/全员禁言 024/任职角色变更与群联动 027 |
| 业务规则（BR） | 34 条 | 含 022（身份与任职）/023（全员禁言）/024（门店禁用与群）/025（换绑群转移）/026~030（直播分享）/033（通用群操作）/034（客服群操作）/035（任职角色变更与群联动） |
| 数据实体（ENT） | 11 项 | 含 ENT-IM-011 群发批次 |
| UC | 26 个 | 新增 UC-IM-010A 客户发起售后申请、UC-IM-025 主动咨询建客服群、UC-IM-028 通用群操作闭环、UC-IM-029 客服群操作闭环、UC-IM-030 任职角色变更与群联动、UC-IM-033 后台门店管理群联动入口（更换店长）、UC-IM-034 后台门店成员角色变更与群联动 |
| 页面/路由 | 17 页 / 19 路由 | 新增 PG-IM-021 发起售后页、PG-IM-019 联系客服入口演示；PG-IM-020 门店管理+门店成员页（IM 聚焦：更换店长/禁用/修改身份/更换门店/转为客户 + 群联动确认） |
| 群模型（v3.0） | 三类系统群 | 门店通用群（店长+店员，无客户）/客户群（服务者+名下客户，按归属隔离）/客服群（一对一，主动咨询才建）；**无个人群聊；下单不触发建群；无沉睡托管** |
| 身份 | 3 种 | 店长/店员/买家（v3.0 代理整体移除，群只有店长、店员、普通买家） |

**本稿替代关系**：v1.2.1 确认稿发布后，v1.0.0/v1.1.0 及其增补作为历史版本归档；设计与架构文档以本稿为基线。

---

## 1. 背景与问题陈述

SAAS 缺少 APP 内 IM 能力（14-租户门户域 Non-Goal「APP端通讯录/群聊暂未规划」）：

| 编号 | 问题 | 严重度 |
|---|---|---|
| IM-ISSUE-001 | 客户与门店沟通依赖店外渠道（私人微信），沟通资产随员工离职流失 | 🔴 高 |
| IM-ISSUE-002 | 售后无在线化入口，订单与沟通割裂 | 🔴 高 |
| IM-ISSUE-003 | 门店对客触达无合规通道（无审核/无留存/不可追溯） | 🟡 中 |
| IM-ISSUE-004 | 店长/店员经营协同无内部通道 | 🟡 中 |

**需求目标（BO）**：建立 APP 内 IM 中枢（通讯录），以「一客一群」为核心实现客户服务在线化、售后闭环数字化、内部协同组织化，消息全量合规可审。

## 2. 需求边界与 Non-Goals

**In-Scope（V1）**：好友体系（单聊私信）、三类群（门店通用群/客户群/客服群）、单聊群聊消息（文本/图片/文件/语音消息/表情）、聊天记录双写、云端审核、订单卡片售后、消息中心、数据权限
**In-Scope 增补**：群公告（单群，发布+历史）、二维码邀请客户、绑定自动入客户群（绑定结果页）、联系客服入口（一对一客服群）、全员禁言（客户群）、头像资料卡（他人查看/自己编辑）、修改群名称（群主）、消息/会话模块拆分与展开收起、全局搜索、+按钮菜单（添加好友）、消息免打扰（会话级，群聊/单聊）
**Non-Goals**：**个人群聊（普通聊天群）与手动建群（任何身份不可建，D9）**、**下单自动建群（D1）**、**绑定自动建独立服务群（D11：绑定仅入客户群）**、客户-店铺私信（由一对一客服群承接，D14）、临时群（咨询完即散，D14）、**群沉睡托管/回收（D12：移除 90 天托管，回收机制另行评估）**、语音/视频通话、红包（营销）、TIMPush 离线推送（待定）、跨租户聚合（V2）、平台侧视图（V2）、AI 客服（V2 候选）、门店公告群发（V2）、真二维码服务（real 阶段）、真实语音录制（real 阶段）、**直播模块：纯直播/直播推广分享/直播卡片/群发记录（2026-08-04 裁决本期不开发，原型保留演示，V2 候选，D18）**

## 3. 与既有模块关系（融合分析）

| 关系 | 模块 | 内容 | 方式 |
|---|---|---|---|
| 依赖（只读） | 07-分销域 | 组织树/锁客关系（BR-DIS-004） | API 只读，单一事实源在分销域 |
| 依赖（只读） | 11-门店域 | 门店/门店成员（店长/店员） | API 只读 |
| 依赖（读写） | 04-售后域 | 售后单创建/处理/进度（新增「IM 渠道」来源标记） | 经售后域 API，不直连数据 |
| 依赖（只读） | 02-订单域 | 订单查询（仅本人） | 只读快照引用，不复制数据 |
| 依赖（只读） | 14-租户门户域 | 账号/认证/3 身份 | 复用；该域 Non-Goal 由本模块补齐 |
| 依赖（底层复用） | 09-直播域 | CSS 推拉流底层（纯直播） | 复用，零改造 |
| 依赖 | 12-平台域 | 数据隔离策略（行级）/Feature Flag | 遵循（策略待建🔴 U4） |
| 协同 | 内容审查域 | 纯直播主播音视频审核 | 复用审核链路；聊天文本走 IM 云端审核（边界一致） |

## 4. 三阶段摘要（已冻结）

**业务还原**：4 问题/4 业务目标（BG-IM-01~04）/5 核心业务流/闭环 7 要素全过/10 项扫盲（离职继承/入群≠锁客/群膨胀/审核时延/离线/换绑/抢客/并发/时效/数据一致性）。

**系统划分**（四层）：
\`\`\`
S1 通讯录前端（APP消息Tab，零规则硬编码）
S2 IM 通道层（腾讯云IM：SDK/REST/回调/云端审核，不感知业务语义）
S3 通讯录业务服务（唯一规则计算点：可见性引擎/群编排/卡片适配/售后联动/UserSig签发）
S4 既有域接口层（分销/门店/售后/订单/租户门户，只读为主契约调用）
\`\`\`
系统闭环 9 要素全过；关键约束：S2↔S3 契约先行、内部群 C 端零暴露双保险（S3 过滤+群类型标记）、群类型字段预留扩展位、业务侧不存副本仅缓存。

**终端划分**：V1 唯一终端=APP 端（H5 375px）；**16 个页面**（PG-IM-001~010/012/015/016/017/018/019，17 条路由，\`/h5/im/**\` 独立命名空间，见 §13）；入口=底部导航消息/娱乐 Tab+商品/订单详情「联系客服」+群内⊕面板。

## 5. 业务目标映射与用户故事

### 5.1 业务目标映射

| 业务目标 | 映射 FN | 度量指标 |
|---|---|---|
| BG-IM-01 客户服务在线化 | FN-IM-003/008/011/013/022 | METRIC-IM-001/005 |
| BG-IM-02 售后闭环数字化 | FN-IM-009 | METRIC-IM-002/003 |
| BG-IM-03 沟通合规可审计 | FN-IM-005/006 | METRIC-IM-004 |
| BG-IM-04 客户资产平台化 | FN-IM-002/010 + BR-IM-002 | METRIC-IM-006 |

### 5.2 用户故事

| 编号 | 角色 | 故事 |
|---|---|---|
| US-IM-001 | 客户 | 绑定门店或接受邀请后，即进入归属服务者的客户群（自己+归属店长/店员+同服务者其他客户）；咨询商品/订单时点「联系客服」即有一对一客服群，随时售后 |
| US-IM-002 | 客户 | 在客服群里直接发送订单卡片，门店快速定位订单处理售后 |
| US-IM-003 | 店员 | 拥有自己的客户群（名下客户聚合），可跨店任职时每个门店各一个客户群；客户主动咨询后在一对一客服群服务 |
| US-IM-004 | 店长 | 拥有自己的店长群（名下客户）+门店通用群（全员协同），一键公告触达名下客户，活动/开播可开全员禁言 |

## 6. 五类图

> 完整 mermaid 源嵌入；§6.1 为 v3.0 现行口径（三类系统群/绑定与邀请两路径/归属制（门店禁用选解散群→客户进公海，D16）/下单不建群/无个人群聊）。

### 6.1 业务流程图（v3.0）

\`\`\`mermaid
flowchart TB
    A[群创建] --> B{三类系统群<br/>无个人群聊}
    B --> O[门店通用群<br/>门店创建即建: 店长+店员]
    B --> S[客户群<br/>店长群/店员群]
    B --> K[客服群<br/>一对一]
    O --> O1[门店成员变动<br/>T+0 实时同步]
    S --> S1[客户绑定/扫码<br/>→入归属人客户群 不建群]
    S --> S2[全员禁言开关<br/>活动推送/开播提醒]
    K --> K1[客户主动咨询<br/>商品/订单详情「联系客服」才建]
    K1 --> K2[订单卡片→售后单→进度回写]
    S1 --> F{消息类型}
    K2 --> F
    F --> F1[文本/图片/文件→云端审核后投递]
    F --> F3[群公告→群内触达]
    S1 --> G{归属变更}
    G --> G1[换绑→自动转移<br/>客户群成员 BR-IM-025]
\`\`\`

### 6.2 信息流转图

\`\`\`mermaid
flowchart LR
    subgraph S4[数据源-既有域]
        D1[分销域: 组织树/锁客]
        D2[门店域: 门店/成员]
        D3[订单域: 订单查询]
        D4[售后域: 售后单]
        D5[租户门户域: 身份]
    end
    subgraph S3[通讯录业务服务]
        V[可见性引擎]
        G[群编排器: 自动建/同步/归档/重建]
        C[订单卡片适配器]
        A[售后联动器]
    end
    subgraph S2[腾讯云IM通道]
        SDK[客户端SDK/TUIKit]
        ROAM[漫游/历史消息]
        AUDIT[云端审核]
        CB[审核/消息回调]
    end
    subgraph S1[APP前端]
        UI[4角色视图/会话/聊天/群设置]
        DB[(本地DB双写)]
    end
    D1 & D2 & D5 --> V
    D3 --> C
    D4 <--> A
    V --> G --> SDK
    C --> SDK
    A --> SDK
    SDK --> UI
    SDK --> ROAM --> UI
    UI --> DB
    SDK --> AUDIT --> CB --> S3
\`\`\`

### 6.3 状态机 — 群状态机（v3.0 两档）

\`\`\`mermaid
stateDiagram-v2
    [*] --> 正常: 建群(门店创建/店员入职/主动咨询)
    正常 --> 已解散: 门店删除/群主解散/后台禁用选「同时解散」
    已解散 --> [*]: 记录按保留策略归档
\`\`\`

**状态过渡操作表**：

| 原状态 | 触发 | 新状态 | 触发者 | 条件 | 结果 |
|---|---|---|---|---|---|
| — | 建群 | 正常 | 系统自动 | 门店创建/店员入职/客户主动咨询（下单不触发；绑定仅入客户群不建群） | 群主=服务者本人 |
| 正常 | 解散 | 已解散 | 门店删除（系统）/群主解散（App 唯一途径）/后台禁用选「同时解散」（BR-IM-024） | — | 群不可发言仅可查看 |

**说明**：门店禁用/启用不影响群（BR-IM-024）；换绑=客户群成员转移，不改变群状态（BR-IM-025）；无 90 天沉睡托管（D12）。

### 6.4 业务时序图 — 订单卡片售后闭环

\`\`\`mermaid
sequenceDiagram
    participant C as 客户(APP)
    participant S1 as 通讯录前端
    participant S3 as 业务服务
    participant O as 订单域
    participant IM as 腾讯云IM
    participant ST as 店长/店员
    participant AS as 售后域
    C->>S1: 卡片区选择订单→「我要咨询此订单」
    S1->>S3: 仅发送订单卡片入群（不创建售后单）
    C->>S3: 点击订单卡片→进入「发起售后」页
    C->>AS: 提交申请（类型/原因/电话/描述/凭证）
    AS-->>S3: 创建售后单(pending, 来源=IM)
    S3->>IM: 进度卡回写群内+推送店员通知
    IM-->>ST: 卡片展示+通知badge
    Note over C,ST: 店员不可代为申请售后
    ST->>S1: 点击已申请卡片→售后详情页
    S1->>ST: 开始处理(pending→processing)
    Note over C,AS: 客户视角全程=「进行中」
    alt 仅退款
        ST->>AS: 确认退款(金额+原因)
        AS-->>S3: 同意售后+退款完成(原路退回)→done
    else 退货退款
        ST->>AS: 同意退货→买家寄回→确认签收退款→done
    else 查物流
        ST->>S1: 展示物流轨迹时间线(状态不变)
    end
    S3->>IM: 进度卡回写+卡片标签同步「已完成」
    IM-->>C: 客户看到「已完成」+售后记录时间线
\`\`\`

### 6.5 三方接口时序图 — 消息云端审核链路（V1 模拟，real 对接）

\`\`\`mermaid
sequenceDiagram
    participant U as 发送方
    participant SDK as IM SDK(客户端)
    participant IM as IM服务端
    participant AUD as 云端审核
    participant R as 接收方
    participant B as App后台
    Note over SDK,B: V1=Sim通道模拟，real切换腾讯云IM
    U->>SDK: 发送消息(文本/图片/文件)
    SDK->>IM: 消息上行
    IM->>AUD: 送审(文本/图片同步~50ms)
    alt 通过
        AUD-->>IM: pass
        IM-->>R: 正常投递
    else 可疑
        AUD-->>IM: review
        IM-->>R: 标记投递(待人工复审)
    else 拦截
        AUD-->>IM: block
        IM-->>U: 拦截通知(接收方无感知)
    end
    IM->>B: 审核结果回调(含异步音/视频结果)
    B->>B: 审核记录落库(ENT-IM-006)
\`\`\`

## 7. 功能需求（FN，共 22 项）

### FN-IM-INFRA-001 IM 基础设施（P0，基础设施）

**前置条件**：腾讯云 IM 应用已创建（backend_config：SDKAppID/密钥/回调 URL/审核策略）
**基本流程**：1. [系统自动] APP 启动初始化 IM SDK 并登录（Sim=模拟通道）；2. [系统自动] 服务端签发 UserSig（real）；3. [系统自动] 审核/消息回调接收端点就绪
**备选流程**：1a. 初始化失败→本地缓存只读模式+重试；2a. UserSig 过期→自动续签
**后置条件**：IM 通道可用，回调链路通
**关联UC**：全部（前置依赖）

### FN-IM-001 通讯录列表+3 身份视图（P0）

**前置条件**：用户已登录 APP+IM 通道就绪
**基本流程**：1. [手动] 进入消息 Tab「通讯录」；2. [系统自动] 按当前身份（客户/店员/店长，BR-IM-022）渲染视图；3. [手动] 好友列表 A-Z 字母索引定位；4. [手动] 入口：新的朋友/我的群聊/⊕添加；5. [手动] 「切换身份」复用 APP 既有交互
**备选流程**：2a. 多角色默认上次身份；5a. 身份未审核通过不展示该身份入口（BR-APP-008 沿用，留 APP 域落地）
**数据范围(R/W)**：R: 好友关系/身份 / W: 无
**后置条件**：视图与身份匹配（BR-IM-007）
**关联UC**：UC-IM-001
**补充**：页面顶部为搜索框入口（跳全局搜索）；好友按 A-Z 字母索引分组展示，不再单独显示本人信息行。

### FN-IM-002 好友体系（P0）

**前置条件**：IM 关系链可用
**基本流程**：1. [手动] 按手机号搜索（不支持昵称）/名片页点「添加好友」；2. [手动] 填写打招呼内容（≤100 字）发送；3. [系统自动] 对方「新的朋友」出现申请（等待验证）+消息中心 badge+1；4. [手动] 对方通过→成为好友（已添加）；5. [手动] 朋友设置：备注名（≤30 字）/拉黑/删除（二次确认）
**备选流程**：4a. 拒绝→已拒绝（24h 限再申请 3 次）；5a. 删除好友→仅清本地记录，**云端漫游保留**（Q-A 合规）；**拉黑后单聊互发拦截并提示「对方已被你拉黑，消息未发送」**（本期已实现）；2a. **等待验证期间禁止重复申请**（搜索结果显示「已申请」置灰）；2b. **禁用/待审核/拉黑状态不可被添加**（搜索结果按钮置灰）；3a. **申请记录保留 7 天**超期自动清理（BR-IM-008b）
**数据范围(R/W)**：R/W: 好友关系/申请记录
**后置条件**：关系链同步 IM
**关联UC**：UC-IM-002/003

### FN-IM-003 门店群聚合入口（P0，核心）

**前置条件**：客户与门店存在归属关系（绑定/邀请，BR-IM-006；下单不触发建群）
**基本流程**：
1. [系统自动] 三类群自动构成（BR-IM-021）：**门店通用群**（门店创建即建，店长+店员，无客户）；**客户群**（店长群「{门店名}·店长群」/店员群「{门店名}·{店员昵称}群」，群主=服务者本人，成员=服务者+名下客户）；**客服群**（一对一，主动咨询才建，FN-IM-023）
2. [系统自动] 客户绑定/扫码→加入归属服务者的客户群（不建独立群，批量导入不产生群）；客户按归属隔离——店长的客户在店长群，店员的客户在店员群（BR-IM-007）；归属客户群满 2000 人→自动裂变下一序号群承接新客户（1800 人预警，BR-IM-031）
3. [手动] 客户视角：仅见自己所在的客户群+客服群；同客户群内可见彼此（同群成员）
4. [手动] 店员/店长视角：自己的客户群+客服群聚合列表+「搜索群聊/门店/好友」实时筛选（可按客户昵称检索同名客服群）；店员可跨店任职（每店各一个客户群），店长单店（BR-IM-022）；群行显示门店标签+任职项目标签（跨项目群显示「跨项目」标）
5. [手动] 群主可在群设置修改群名称（≤20 字非空，BR-IM-009）

**备选流程**：1a. 换绑→自动转移客户群成员到新归属人客户群（BR-IM-025）；1b. 门店禁用/启用不影响群（后台可选「同时解散」，BR-IM-024）；1c. 门店删除→解散+记录归档
**数据范围(R/W)**：R: 归属关系/锁客/任职 / W: 群实体/群成员快照
**后置条件**：群与客户归属一致，成员制隔离生效（BR-IM-007）
**关联UC**：UC-IM-004/005/020

### FN-IM-004 单聊/群聊消息（P0）

**前置条件**：会话存在（好友单聊或群成员）
**基本流程**：1. [手动] 发送文本/图片/文件；2. [系统自动] 云端审核→投递（FN-IM-006）；3. [系统自动] 已读标记/时间戳；4. [手动] 撤回：自己的文本/语音消息 2 分钟内可撤回（悬停行显现「撤回」），撤回后显示「消息已撤回」，跨页同步（本期已实现）；5. [手动] 语音消息：点 Mic 切换「按住说话」→按住录音（最长 60s，<1s 提示「说话时间太短」）→松开发送，气泡可播放（BR-IM-020 异步审核）；6. [手动] 表情：点表情按钮→32 格面板→点击直接发送（发送后面板自动收起）；7. [手动] ⊕面板：图片/相机（**直播仅对客群显示：客户群/客服群**，BR-IM-001）
**备选流程**：2a. 审核拦截→发送方红字提示+接收方无感知；可疑→橙字「内容待复审」；1a. 弱网失败→本地标记自动重发；语音审核 pending→异步回调 passed（Sim 2s 模拟）
**数据范围(R/W)**：R/W: 消息
**后置条件**：消息漫游+本地双写（FN-IM-005）
**关联UC**：UC-IM-006

### FN-IM-005 聊天记录存储（P0）

**基本流程**：1. [系统自动] 消息写 IM 漫游（云端）；2. [系统自动] 同步写本地 DB（离线可读；Sim 阶段为内存实现，本地 DB 双写方案 real 阶段确定）；3. [手动] 换设备/回前台→拉漫游增量合并；4. [系统自动] 归档群漫游保留（≥售后时效）
**备选流程**：删除好友→仅清本地（云端保留，Q-A）；漫游与本地冲突→以云端为准
**关联UC**：UC-IM-006（支撑）
**V1 限制**：① 文件上传/发送暂不支持（V1 仅文本/图片/语音/表情，文件类型随 IM SDK real 阶段落地）；② 聊天记录暂不持久化存储，全局搜索仅覆盖当前会话内存数据（real 阶段随腾讯 IM 本地库双写落地）

### FN-IM-006 聊天内容云端审核（P0）

**前置条件**：IM 审核策略已配置（控制台 6+N 场景，backend_config）
**基本流程**：1. [系统自动] 文本/图片同步审核（~50ms）→放行/拦截/可疑标记；2. [系统自动] 音/视频消息异步审核→回调处置（违规撤回）；3. [系统自动] 审核结果回调 App 后台→审核记录落库可查
**备选流程**：审核服务异常→消息标记「待审」后补审；白名单用户免审（运营配置项，real 阶段随审核策略配置落地）
**后置条件**：消息 100% 过审（BG-IM-03）
**关联UC**：UC-IM-007

### FN-IM-007 全局搜索（P0）

**基本流程**：1. [手动] 搜索框输入关键词（页面自动聚焦）；2. [系统自动] 结果分组：联系人（≤5）/群聊（≤5）/聊天记录（≤10）；文件组固定「暂无匹配文件」；未输入时历史区固定「暂无历史」；3. [手动] 点击结果跳转对应页面
**备选流程**：三组均无结果→「无搜索结果」；**受 BR-IM-003/007 约束：客户搜索不出现其他客户与内部管理群（含聊天记录）**
**关联UC**：UC-IM-008
**V1 限制**：① 全局搜索为关键词模糊匹配（联系人昵称/群名/文本内容），暂不支持像微信那样的图片识别、聊天记录精确片段检索、文件全文检索（real 阶段随 IM SDK 搜索能力落地）；② 聊天记录搜索仅覆盖当前会话内存数据，跨设备/历史漫游搜索随 FN-IM-005 持久化落地

### FN-IM-008 数据权限规则（P0，核心）

**基本流程**：1. [系统自动] 任何列表/搜索/漫游请求→可见性引擎计算（身份×租户×归属×组织）；2. [系统自动] 输出过滤结果（前端零规则）；3. [系统自动] V1 按租户隔离（D4），同租户单门店（BR-TNT-008）
**备选流程**：多租户账号→按当前租户上下文计算，切换租户重算
**后置条件**：BR-IM-007 全局生效；内部管理群 C 端零暴露（BR-IM-003 双保险）
**关联UC**：全部（横切）

### FN-IM-009 订单卡片+售后处理（P0，核心）

**前置条件**：会话为一对一客服群（FN-IM-023）+客户有有效订单
**基本流程**：
1. [手动] **客户选择订单**：卡片区打开订单选择器（**仅本人进行中订单只读快照，已完成订单不展示**）→ 点「**我要咨询此订单**」→ **仅发送订单卡片入群，此时不创建售后单**
2. [手动] **客户发起售后**：客户点击群内订单卡片 → 进入**「发起售后」独立页**（PG-IM-021）→ 选择售后类型（仅退款/退货退款/查物流/仅咨询）→ 选择原因 → 填写联系电话、问题描述、上传凭证 → 提交 → **才真正创建售后单（pending）** + 推送店员通知 + 群内回写进度卡
3. [手动] 店长/店员点击已发起售后的卡片→打开**售后详情面板**（对齐 App：状态头/商品信息卡/**售后记录**时间线）→ **用户未发起售后时，店员不可代为申请，仅提示「用户尚未发起售后申请」**
4. [手动] **三类售后操作**：①**仅退款**（金额+原因→原路退回，一步完成）②**退货退款**（同意→寄回→签收退款，分步）③**查看物流**（物流轨迹时间线，状态不变）；待处理时先「开始处理」
5. [系统自动] 状态同步：**pending+processing 客户视角=「进行中」，done=「已完成」**；进度卡回写群内+卡片标签+时间线实时更新+未读联动

**备选流程**：2a. 无有效订单→空态「暂无可用订单」；4a. 关闭售后单→**先弹二次确认（关闭后不可恢复），确认才关闭**（本期已实现）；归档群只读但历史卡片链接仍有效
**数据范围(R/W)**：R: 订单(本人/本店客户)/售后单 / W: 卡片消息+售后单（经售后域 API）
**后置条件**：售后闭环（BG-IM-02）；订单数据不落地通讯录（R2 红线）；服务归属=售后操作人（留痕）；**服务独占（BR-IM-018）**；**客户主动申请，店员仅处理不代申请**
**关联UC**：UC-IM-009/010/010A

### FN-IM-010 门店通用群（P0）

**前置条件**：门店创建（资质审核通过）
**基本流程**：1. [系统自动] 门店创建→自动建门店通用群（命名「{门店名}通用群」，群类型=internal_mgmt+门店ID，群主=店长，成员=店长+店员，无客户）；2. [系统自动] 成员随门店成员变动 T+0 同步（店员入职自动入群/离职自动移出，差集计算）；3. [手动] 群内门店全员协同沟通；4. [系统自动] 店长降级/离职/跨店调任时群主自动转移给继任店长（后台门店管理指定继任，BR-IM-035）；5. [系统自动] 门店更名时群名自动更新为「{新门店名}通用群」
**备选流程**：门店删除→群解散+记录归档；**客户任何入口零暴露（BR-IM-003：S3 过滤+群类型标记双保险）**；群解散=门店删除/后台禁用勾选「同时解散」/群主 App 端解散（BR-IM-024/033）
**功能边界**：无公告/无全员禁言/无添加成员入口（成员仅由门店成员变动驱动）/无直播入口；群名固定不可手动改（仅系统随门店更名自动更新）
**关联UC**：UC-IM-011、UC-IM-030

### FN-IM-011 群组两类分组展示（P0）

**基本流程**：我的群聊页按客户群（绿标）/客服群（蓝标）/门店通用群（紫标）三类分组+类型标签；仅展示当前账号可见分组；已解散群带状态标签；无个人群聊，不提供手动建群入口（BR-IM-019）；**任职信息条**（店员/店长视角，标题下）：店员=任职门店×项目（跨项目跨门店标注）+名下客户数，店长=跨项目单店+名下客户数（BR-IM-022）；群名旁显示归属门店标签（跨店任职可辨）；同名客服群以「客户·昵称」标签区分归属客户（客户看自己无标签）；筛选支持按客户昵称检索
**关联UC**：UC-IM-004（支撑）

### FN-IM-012 消息中心（P0）

**基本流程**：1. [系统自动] 三类系统消息入口：系统通知/群消息提醒/好友申请（各带未读 badge）；2. [系统自动] **既有四类 APP 通知入口保留**：订单通知/物流通知/售后通知/营销通知（点击跳 APP 域对应页面；原型内为提示占位）；3. [系统自动] 会话未读聚合到底部导航 badge（按账号独立）；4. [系统自动] 时间显示（刚刚/HH:mm/昨天/前天）；5. [手动] 「消息」「会话」两模块可展开/收起（默认展开）；6. [手动] 顶部搜索框→全局搜索
**关联UC**：UC-IM-012

### FN-IM-013 群公告（P0）

**前置条件**：群类型=客户群/客服群（对客群）；发布者=群主（BR-IM-009）
**基本流程**：1. [手动] 群设置点「发布公告」→ 输入内容（≤200 字，为空不可发布）→ 发布；2. [系统自动] 公告入历史（最新在前）+ 聊天页顶部公告条展示最新一条 + 群内系统消息回写「群公告：xxx」；3. [手动] 成员点公告条/公告区 → 全部历史弹层
**备选流程**：门店通用群无公告入口；空公告展示「暂无公告」；批量公告群发=V2
**后置条件**：公告跨页/跨标签页同步
**关联UC**：UC-IM-013

### FN-IM-018 二维码邀请客户（P0）

**前置条件**：客户群存在；操作者为店长/店员
**基本流程**：1. [手动] 客户群设置「添加成员」→ 邀请卡（二维码+群名+门店+邀请人+48h 有效）；2. [手动] 复制邀请链接（提示已复制）或客户扫码；3. [系统自动] 打开加入页（/h5/im/join/:groupId）→ 客户确认→**扫码即绑定邀请人为归属人**（BR-IM-006）→入归属人客户群（via=invite，幂等不重复计数）→ 直达会话
**备选流程**：已在群→提示「你已在群内」直达会话；链接无效/群已解散→「邀请链接无效或群已解散」；邀请留痕（BR-IM-006）
**关联UC**：UC-IM-019

### FN-IM-LIVE-001 纯直播（P0，本期不开发→V2，D18）

**基本流程**：1. [手动] 群内⊕面板点「直播」发起（创建直播间，主播=当前账号；**直播入口仅对客群显示：客户群/客服群**，BR-IM-001）；2. [手动] 进入直播间：LIVE 标+观看数（观众进入+1）+弹幕发送+点赞飘心；3. [手动] 主播点「结束直播」→ 已结束覆盖层+「返回群聊」；4. [手动] 观众可发送弹幕（复用消息通道，跨页同步）
**备选流程**：**无任何营销入口**（无商品/订单/优惠券/分销）；直播结束→无回放（V1 纯直播）；弹幕走 IM 云端审核
**关联UC**：UC-IM-014

### FN-IM-019 直播推广与分享（P0，本期不开发→V2，D18）

**基本流程**：1. [手动] 店员/店长进入「直播推广」页（/h5/im/live-promo，底部导航「娱乐」Tab）：正在直播的直播间列表（封面/标题/编号可复制/主播/观看数）；仅店员/店长可见可用（客户显示无权限）；2. [手动] 直播间卡片点「分享」→ 目标选择弹层：按群聊（仅自己的客户群+「本店全部客户」一键全选）/按个人（客户多选，映射各自归属客户群会话）；通用群/客服群不可作为目标（BR-IM-029）；3. [系统自动] 频控：同一直播间×同一目标会话 10 分钟内不可重复分享（BR-IM-028）；目标跨路径去重（BR-IM-027）
**备选流程**：仅「直播中」可分享，回放/未开播不出现（BR-IM-026）
**关联UC**：UC-IM-022

### FN-IM-020 直播卡片消息（P0，本期不开发→V2，D18）

**基本流程**：1. [系统自动] 新消息类型 live_card：封面+状态标（直播中红/已结束灰）+标题+主播·观看数+「{发起人} 邀请你观看直播」；以发起人身份写入目标会话；2. [手动] 点击卡片（直播中）→ 进入直播间（?via=mass_send&batch=批次ID，观看身份=本人）；直播结束后卡片置灰显示「直播已结束」不可点（BR-IM-030）；3. [系统自动] 会话列表摘要显示「[直播] 直播标题」
**关联UC**：UC-IM-023

### FN-IM-021 群发记录与统计（P0，本期不开发→V2，D18）

**基本流程**：1. [系统自动] 发送回执：目标 N → 成功 N / 失败 N + 发送成功率；2. [手动] 群发记录页（/h5/im/live-promo/records）：批次列表（时间/直播间/发起人/目标方式/目标数/成功/失败/成功率/点击观看/点击率）；3. [系统自动] 点击归因：客户点卡片进直播（via=mass_send）→ 批次点击数+1 → 点击率=点击÷成功
**数据范围(R/W)**：W: ENT-IM-011 群发批次
**关联UC**：UC-IM-024

### FN-IM-022 绑定自动入群与绑定结果页（P0，核心）

**前置条件**：分销域绑定动作发生（后台绑定生效，或客户扫码接受邀请）
**基本流程**：
1. [系统自动] 绑定生效→S3 \`onCustomerBound(customerId, storeId, ownerClerkId)\`：归属人写入锁客关系（分销域引用）→ 客户自动加入归属人的客户群（不建独立群，群主=归属服务者，成员快照 joined_via=auto_binding/invite/auto_lock 留痕，ENT-IM-003）
2. [手动] 绑定结果页（/h5/im/pay-result，PG-IM-016）三场景：**新客绑定**=入群成功卡（可进入群聊）；**老客复扫**=幂等卡（不重复入群）；**门店异常**=失败卡+补偿提示（**不阻断绑定主流程**）
3. [手动] App 端移除客户→**双端校验二次确认**：仅通讯录层面移除（绑定关系保留，不影响分佣政策，本期实现）或按后台业务绑定关系解除（需走业务侧流程）（BR-IM-006）

**备选流程**：已在归属人客户群→幂等复用（重复绑定/重复扫码不重复入群）；换绑→自动转移客户群成员到新归属人客户群（BR-IM-025）；门店不存在/缺信息→返回失败（{ok:false, reason}）不阻断，记录后补偿重试
**后置条件**：绑定即可在消息中看到归属人的客户群（T+0）
**关联UC**：UC-IM-020

### FN-IM-023 联系客服入口与一对一客服群（P0，核心）

**前置条件**：客户与门店存在归属关系（绑定/扫码，BR-IM-006）
**基本流程**：
1. [手动] 客户在**商品详情页底部操作栏「客服」/订单详情页「联系客服」**发起咨询（入口本体属商城域；原型以 /h5/im/consult-entry 演示触发链路，PG-IM-019）
2. [系统自动] \`startConsult(customerId, storeId)\`：已有与该门店归属服务者的一对一客服群→幂等直达；否则创建（命名「{门店名}·客服群」，**群主=归属服务者**，成员=客户+归属服务者）
3. [手动] 在客服群内发起订单卡片/售后（FN-IM-009）

**备选流程**：**不咨询不建群**——批量导入客户不会产生群（BR-IM-021）；门店不存在→建群失败提示，不影响商城主流程；同一服务者的多个客服群同名，列表以「客户·昵称」标签区分（BR-IM-005）；归属服务者变更（店长降级/店员离职/换绑新归属）时群主自动转给新归属服务者，成员不变（BR-IM-035）
**功能边界**：无全员禁言/无添加成员入口（仅客户+归属服务者二人）/无直播入口/无公告（V1）；售后订单卡片仅在客服群发起（BR-IM-001）；客服群不因售后单完成而解散（售后完结群保留，便于追溯）
**后置条件**：客服群建立/复用，承载一对一咨询与售后
**关联UC**：UC-IM-025、UC-IM-031

### FN-IM-024 全员禁言（P1，客户群）

**前置条件**：群类型=客户群（店长群/店员群）；操作者=群主（BR-IM-009/023）
**基本流程**：1. [手动] 群设置「全员禁言」开关→开/关；2. [系统自动] 开启时仅群主可发言（其他成员输入区不可用+提示「全员禁言中，仅群主可发言」），群内回写系统消息；3. [手动] 典型场景=活动推送/开播提醒（防垃圾消息摊高审核成本）
**备选流程**：私聊与客服群不受限；状态跨页同步
**关联UC**：UC-IM-004（支撑）

### FN-IM-025 消息免打扰（P1，会话级）

**前置条件**：会话存在（群聊/单聊均可）
**基本流程**：1. [手动] 群聊=群设置页「消息免打扰」开关；单聊=朋友设置页「消息免打扰」开关（任何成员可设，按账号独立）；2. [系统自动] 开启后该会话未读仍计数（会话行未读灰显+免打扰图标），**不计入底部导航 badge**、不强提醒；3. [手动] 再点关闭即恢复计入
**备选流程**：多账号互不影响——A 账号设免打扰不影响 B 账号的 badge 与会话行（BR-IM-032）
**后置条件**：底部 badge=当前账号可见会话未读合计（免打扰会话除外，BR-IM-017）
**关联UC**：UC-IM-026

### FN-IM-026 门店禁用与群解散提示（P0，租户后台）

**前置条件**：租户后台-门店管理页；门店下存在 IM 群
**基本流程**：
1. [手动] 门店列表操作列点「禁用」→ 弹窗提示（**原有文案保留不变**）：「一旦禁用，该门店将无法对外经营！」
2. [手动] 追加选择「**同时解散群聊**」（默认不勾选）：勾选则确认后该门店通用群/客户群/客服群**全部解散，客户进入公海**（失去归属服务者，待重新分配；重新绑定后按 BR-IM-006 入新归属人客户群）；不勾选则群不受影响、可正常收发（BR-IM-024）
3. [手动] 「启用」恢复门店状态（**已解散群不可恢复**）
**页面字段**：门店名称、当前店主、门店类型、群聊数（通用/客户/客服）、状态、创建时间；操作列含**更换店长**（→ 群主转移+群名重命名）、**禁用/启用**（→ 可选同时解散群聊）。真实后台字段（门店地址/售后地址/所属代理/资质状态等）与 IM 群无关，原型不罗列
**备选流程**：解散后 H5 侧群行显示「已解散」，仅可查看不可发言
**后置条件**：禁用动作与群处置解耦，处置结果全端一致
**关联UC**：UC-IM-027、UC-IM-033、UC-IM-034

### FN-IM-027 任职角色变更与群联动（P0，后台驱动）

**前置条件**：后台门店管理页执行店长/店员的角色变更（降级/升级/调任/离职/转为客户）
**基本流程**：
1. [手动] 后台执行角色变更：
   - **门店管理页**：操作列「更换店长」→ 填写新店长名称/手机号 → 弹窗提示「将同步转移群主与重命名群，是否继续？」→ 运营确认
   - **门店成员页**：操作列「修改身份」（店员↔店长）、「更换门店」（跨店调任）、「转为客户」（离职/退出）→ 弹窗提示「将同步转移群主与重命名群，是否继续？」→ 运营确认
2. [系统自动] 按 BR-IM-035 规则联动三类群：
   - **通用群**：离职/调任/转为客户→自动移出；降级/升级/更换店长→成员不变，群主转给继任店长
   - **客户群**：降级/升级/更换店长→群主转移+群名重命名（「店长群」↔「{昵称}群」）；离职/调任/转为客户→群主转给继任（无继任则群保留只读待分配）
   - **客服群**：群主转给新归属服务者，成员不变，历史保留
3. [系统自动] 原群主不再保留任何管理权限
4. [系统自动] 名下客户的归属关系由分销域重新分配，重新绑定后按 BR-IM-006 入新归属人客户群
**页面字段（门店成员）**：成员姓名、手机号、所属门店、当前身份、名下客户群数、任职项目；操作列含**修改身份**（店员↔店长）、**更换门店**（跨店调任）、**转为客户**（退出任职）。真实后台字段（编号/在售商品数/最后操作时间/邀请码等）与 IM 群无关，原型不罗列
**备选流程**：无继任店长→客户群保留只读待分配（客户进公海待重新绑定）；继任店长跨店调任时按新店入职建群规则执行
**后置条件**：三类群群主与群名与新任职角色一致，客户归属关系同步更新
**关联UC**：UC-IM-033、UC-IM-034

### FN-IM-028 举报功能（P1，APP 上架合规）

**前置条件**：当前会话存在（单聊或群聊均可）
**基本流程**：
1. [手动] 单聊：聊天页右上角「⋯」直接打开举报弹窗；群聊：群设置页底部「举报」入口打开（群聊举报不走聊天页菜单）
2. [手动] 举报弹窗：举报对象（自动展示）+ 举报类型（5 选 1：骚扰谩骂/欺诈诈骗/色情低俗/广告引流/其他违规）+ 问题描述（选填 200 字）+ 凭证图片（最多 3 张）
3. [手动] 点「提交举报」按钮 → 提示「已提交至平台审核」并关闭弹窗
**备选流程**：未选举报类型 → 提交按钮置灰；取消（关闭/点遮罩）→ 关闭不提交
**后置条件**：举报提交成功，进入平台审核流程（V1 仅前端流程，real 接审核系统）
**关联UC**：UC-IM-035

### FN-IM-029 注销账号（P1，APP 上架合规）

**前置条件**：用户已登录 APP
**基本流程**：1. [手动] 底部导航「我的」→注销账号页；2. [手动] 阅读警示+5 条注销须知；3. [手动] 勾选「已阅读并理解」→点「申请注销」；4. [手动] 二次确认弹窗输入「确认注销」文字匹配→提交
**备选流程**：未勾选须知→按钮置灰；二次确认文字不匹配→确认置灰
**后置条件**：注销申请提交（V1 仅前端流程，real 走账号注销流程）
**关联UC**：UC-IM-036

## 8. 业务规则（BR，共 36 条）

| 编号 | 规则 |
|---|---|
| BR-IM-001 | 群组三分类规则：门店通用群（店长+店员，无客户）/客户群（店长群·店员群：服务者+名下客户）/客服群（一对一：客户×归属服务者，主动咨询才建）严格分类，三类群全部由系统自动创建，没有个人群聊；类型决定成员/可见性/能力，禁止混用；直播/公告等业务能力仅对客群（客户群/客服群），订单卡片仅客服群 |
| BR-IM-002 | 门店群体系规则：通用群=门店全员协同（无客户）；客户群=服务者的客户触达（活动推送/开播提醒，支持全员禁言）；客服群=一对一售后咨询；客户按归属进入唯一服务者的客户群，**群主=服务者本人**；群长期存在，不做沉睡托管；服务归属以售后单操作人为准 |
| BR-IM-003 | 门店通用群客户不可见规则：C 端列表/搜索/漫游零暴露（S3 过滤+群类型标记双保险）；门店成员变动 T+0 同步通用群成员 |
| BR-IM-005 | 建群规则集：命名规范（无需人工填写）——通用群「{门店名}通用群」/店长群「{门店名}·店长群」/店员群「{门店名}·{店员昵称}群」/客服群「{门店名}·客服群」；同一服务者多个客服群同名，列表以「客户·昵称」标签区分归属客户；客户群容量裂变时自动追加序号——「{门店名}·店长2群」/「{门店名}·{店员昵称}2群」（首个群不带序号，BR-IM-031） |
| BR-IM-006 | 绑定与移除规则：通讯录遵循分销域锁客关系；客户入客户群仅两条路径=后台绑定生效自动入归属人客户群/扫码接受邀请（扫码即绑定归属人），均不单独建群；通讯录与分佣政策无关；换绑自动转移群（BR-IM-025）；**App 端移除客户须双端校验二次确认**：仅通讯录层面移除（绑定保留、不影响分佣，本期实现）或按后台业务绑定解除（需业务侧流程）；邀请留痕 |
| BR-IM-007 | 双向视角规则：群可见性=成员制；客户仅见自己所在的客户群与客服群，同客户群内可见彼此（隔离在群与群之间——店长的客户看不见店员的客户），其余入口客户互不可见；店长/店员仅见自己的客户群与客服群，不见其他同事的客户群；通用群客户零暴露 |
| BR-IM-008 | 好友申请规则：四态流转（待通过/已添加/已拒绝/等待验证）；拒绝后 24h 限再申请 3 次；删除好友只删本地、云端保留；**添加好友仅支持按手机号搜索（不支持昵称）** |
| BR-IM-008b | 好友申请补充规则：①等待验证（waiting）期间禁止重复发起，搜索结果显示「已申请」置灰；②禁用/待审核/拉黑状态不可被添加好友（按钮置灰）；③申请记录保留 7 天，超期自动清理 |
| BR-IM-008a | 黑名单分级规则：拉黑动作按操作者身份分流写入不同范围——**店员/店长拉黑客户**（被拉黑对象身份=customer）写入「后台黑名单管理」，后台可见可审计，用于风控/投诉处理/防骚扰；**买家拉黑好友**（操作者与被拉黑对象均非员工身份）仅写入好友关系，标记 \`block_scope=relation_only\`，**不进入后台黑名单管理**，仅影响双方单聊互发拦截；黑名单列表在通讯录主页独立入口展示（仅本人已拉黑的好友），后台黑名单管理在门店管理页独立 Tab 展示（仅店员/店长拉黑的客户记录） |
| BR-IM-009 | 群管理权限矩阵：**群主=服务者本人**；仅门店通用群有管理员（店长可设店员为管理员协助管理，≤3 人，管理员可移除成员）；客户群无管理员（服务者+名下客户结构，客户不可成为管理员），所有管理操作（发公告/移除成员/修改群名称/全员禁言/解散群）仅群主可做；客服群（一对一）同样无管理员；移除客户群的客户成员须双端校验二次确认（BR-IM-006） |
| BR-IM-010 | 群公告规则：本期=单群公告（对客群=客户群/客服群），群主可发，公告条+全量历史+群内系统消息回写，全量过云端审核；客户群裂变出多序号群时需逐群发布（一键覆盖随批量公告群发=V2，BR-IM-031） |
| BR-IM-011 | 审核处置映射：文本/图片同步（拦截不投递/可疑标记）；音/视频异步（违规撤回）；审核异常→待审补审 |
| BR-IM-012 | 多端登录规则：**允许多端同时在线，不做单端互踢**（2026-08-04 裁决取消单端登录限制，D17 关闭 TBD-11）；消息以服务端漫游为准 |
| BR-IM-013 | 群类型标记规则：群自定义属性含 type（internal_mgmt=通用群/staff_group=客户群/store_service=客服群）+store_id/owner_id/customer_id，供过滤与扩展（V2 预留新类） |
| BR-IM-014 | 隐私分级规则：手机号两档可见（好友明文/其他脱敏；服务沟通在 IM 闭环，店员无需客户电话）；订单数据仅本人+本店店员可见卡片快照 |
| BR-IM-015 | 售后发起权限规则：售后单仅可由客户主动发起（「发起售后」独立页提交申请），**店员/店长不可代为申请售后**；店员点击未发起售后的订单卡片仅提示「用户尚未发起售后申请」；订单卡片发起权限=仅客户本人；**订单选择器仅展示进行中订单（待付款/待发货/配送中/待收货），已完成订单不可发起售后** |
| BR-IM-016 | 售后操作与客户视角状态规则：售后类型=仅退款/退货退款/查物流/仅咨询；仅退款=同意+退款完成（原路退回）一步到 done；退货=同意→寄回→签收退款分步；**客户视角 pending+processing=进行中，done=已完成**；服务归属=售后操作人（留痕） |
| BR-IM-017 | 未读模型规则：未读按「会话×账号」独立（已读时间戳模型）；自己发送与系统消息不计未读；底部导航 badge=当前账号可见会话未读合计（免打扰会话除外，BR-IM-032）；跨标签页经 BroadcastChannel 同步（消息/售后/通知/成员/已读 5 类事件） |
| BR-IM-018 | 服务独占规则：同一售后单同一时刻仅一个处理人；pending 时任何人可接单（接单即锁定 handler_id）；**processing 中仅当前处理人可操作，店长也不例外（仅可监督查看）**；服务归属与客户归属相互独立不混淆 |
| BR-IM-019 | 禁止个人群聊规则：系统内没有个人群聊（普通聊天群），店长/店员/买家任何身份都不能手动创建群聊，App 不提供「创建群聊」入口；群聊只有三类且全部由系统自动创建；好友一对一沟通走单聊（c2c 私信），单聊不是群聊 |
| BR-IM-020 | 语音消息规则：按住说话录音（最长 60s，<1s 提示太短），松开发送；语音走**异步审核**（pending→回调 passed）；气泡可播放（进度动画） |
| BR-IM-021 | 建群时机规则：门店创建（资质审核通过）→自动建通用群+店长群；店员入职（被邀通过）→自动建店员群+入通用群（T+0 同步）；客户绑定/扫码→仅入归属人客户群，不单独建群（批量导入不产生群）；客户主动咨询（商品/订单详情「联系客服」）→建一对一客服群，不咨询不建；同一关系重复触发幂等不重复建；**下单不触发任何建群** |
| BR-IM-022 | 身份与任职规则：通讯录群体系仅三种身份=店长/店员/买家（客户）；店员可跨项目、跨门店任职，每个任职门店各有一个自己的客户群，群聊列表展示其任职的全部群；店长可跨项目但不能跨门店，同一时间只能在一个门店任职；**列表呈现**：群聊列表与群成员（会员）列表按任职项目打标（项目标签），跨项目任职的群/成员显示「跨项目」标识 |
| BR-IM-023 | 全员禁言规则：客户群（店长群/店员群）仅群主可开/关全员禁言；开启时仅群主可发言，群内回写系统消息；典型场景=活动推送/开播提醒防垃圾消息摊高审核成本；私聊与客服群不受限 |
| BR-IM-024 | 门店禁用与群规则：后台禁用/启用门店或成员不影响 IM 群（不解散、可正常收发）；后台执行禁用时弹窗提示：「一旦禁用，该门店将无法对外经营！**是否同时解散群聊？解散后客户将进入公海**（失去归属服务者，待重新分配；重新绑定后按 BR-IM-006 入新归属人客户群）」——确定解散才解散，不确定群不动（D16）；App 端仅群主可解散群 |
| BR-IM-025 | 换绑群转移规则：后台更改客户归属时自动转移（无需开关）：客户自动退出旧归属人客户群并加入新归属人客户群；转入目标=新归属人当前未满的客户群（已满则入其最新序号群，BR-IM-031）；一对一客服群保留历史不动，需要时按新归属复用/新建（历史沟通记录不丢失） |
| BR-IM-026 | 直播分享仅直播中规则：只有正在直播的直播间可以分享推广，回放或未开播不出现；直播推广页与分享按钮仅店员/店长可见可用（本期不开发，随直播模块顺延 V2，D18） |
| BR-IM-027 | 分享目标去重规则：同一客户无论经「按群聊」还是「按个人」被重复选中，合并后只收到一次直播卡片（本期不开发，随直播模块顺延 V2，D18） |
| BR-IM-028 | 分享频控规则：同一直播间对同一目标会话 10 分钟内不可重复分享；被频控拦截的目标自动跳过并提示数量（本期不开发，随直播模块顺延 V2，D18） |
| BR-IM-029 | 分享目标范围规则：按群聊分享时仅可选择客户群（店长群/店员群，开播提醒场景），通用群与客服群不可作为分享目标；快捷项「本店全部客户」= 名下全部客户群（含裂变序号群，BR-IM-031）一键全选（本期不开发，随直播模块顺延 V2，D18） |
| BR-IM-030 | 直播卡片状态联动规则：直播卡片随直播状态联动——直播中可点击进入；结束后自动置灰显示「直播已结束」（本期不开发，随直播模块顺延 V2，D18） |
| BR-IM-031 | 群容量规则：单群成员上限=2000 人（腾讯 IM 专业版档位）；客户群达 1800 人触发**容量预警**（群主 App 内提示+后台门店视图标注，引导分客/新增店员分流）；满 2000 **自动分群（裂变）**——系统自动为该服务者开下一序号客户群（命名见 BR-IM-005），新绑定/扫码客户进入最新未满群，**存量客户不迁移**；客户无感知（成员制可见性：每个客户仍只见自己所在的一个客户群，BR-IM-007）；群主=服务者本人，跨全部序号群；全员禁言按单群开关、公告逐群发布、直播群发按服务者客户群集合全覆盖；通用群/客服群不受容量约束；**real 阶段随腾讯 IM 接入落地，套餐档位与群配额商务并行评估**（详解见 §8.1） |
| BR-IM-032 | 消息免打扰规则：会话级开关（群聊=群设置页/单聊=朋友设置页，任何成员可设，**按账号独立**）；免打扰会话未读仍计数（会话行未读灰显+免打扰图标）但**不计入底部导航 badge**、不强提醒；随时可关闭恢复计入 |
| BR-IM-033 | 门店通用群操作规则：① 建群=门店创建（资质审核通过）时系统自动建，群主=店长，成员=店长+全部店员，无客户；② 成员同步=店员入职自动入群、离职/解雇自动移出（T+0 差集计算，FN-IM-010）；③ 群主转移=店长降为店员/离职/跨店调任时，群主自动转移给继任店长（后台门店管理指定继任，App 端无入口）；④ 群名=「{门店名}通用群」固定不可手动改（门店更名时系统自动重命名）；⑤ 管理员设置=店长可设店员为管理员协助管理（≤3 人，管理员可移除成员）；⑥ 功能边界=无公告/无全员禁言/无添加成员入口（成员仅由门店成员变动驱动）/无直播入口；客户任何入口零暴露（BR-IM-003）；⑦ 解散=门店删除（系统）/后台禁用勾选「同时解散」（BR-IM-024）/群主 App 端解散，解散后记录归档不可恢复 |
| BR-IM-034 | 客服群操作规则：① 建群=客户在商品/订单详情点「联系客服」首次咨询时系统自动建（不咨询不建，BR-IM-021），群主=归属服务者，成员=客户+归属服务者（一对一）；② 幂等=已有该客户在该店的正常客服群则复用直达，不重复建；③ 群名=「{门店名}·客服群」固定，同一服务者多个客服群同名以「客户·昵称」标签区分（BR-IM-005）；④ 功能边界=无全员禁言/无添加成员入口（仅客户+归属服务者二人）/无直播入口/无公告（V1）；售后订单卡片仅在客服群发起（BR-IM-001）；⑤ 群主转移=归属服务者变更（店长降级/店员离职/换绑新归属）时群主自动转给新归属服务者，成员不变（客户仍在群，历史保留）；客户归属转移（BR-IM-025）后客服群不主动迁移，客户再咨询时按新归属复用或新建；⑥ 解散=门店删除/后台禁用勾选「同时解散」（BR-IM-024）/群主 App 端解散；客服群不因售后单完成而解散（售后完结群保留，便于追溯） |
| BR-IM-035 | 任职角色变更与群联动规则：覆盖店长/店员的降级、升级、调任、离职、转为客户五种角色变更场景，系统自动联动三类群，无需人工干预。入口分两个后台页面：门店管理页（更换店长）和门店成员页（修改身份/更换门店/转为客户）。<br><br>**① 店长降为店员（同店）**：通用群成员不变（仍为店长+店员）；原店长名下「{门店名}·店长群」群主转移给继任店长（后台指定）+群名改为「{门店名}·店长群」，原店长降为普通成员；若继任店长已有店员群则该群群主转给继任店长+群名改为「{门店名}·店长群」，原店长的店长群群名改为「{门店名}·{原店长昵称}群」（系统自动重命名）；客服群群主不变（仍为原店长，历史保留，新咨询按新身份建群）。<br><br>**② 店员升为店长（同店）**：通用群成员不变；新店长原「{门店名}·{昵称}群」群主不变+群名改为「{门店名}·店长群」；旧店长降为店员则其「店长群」群主转给新店长+群名改为「{门店名}·{旧店长昵称}群」。<br><br>**③ 店长/店员跨店调任**：旧店通用群自动移出+旧店客户群群主转给旧店继任（后台指定，无继任则群保留只读待分配）；新店按入职建群（店长调任=建新店长群+入通用群，店员调任=建新店员群+入通用群）；客服群历史保留不迁移。<br><br>**④ 离职（无新任职）**：通用群自动移出（T+0）；客户群/客服群自动解散；IM_LOCKS 中名下客户锁客关系解绑，客户回归公海池（待重新分配）。<br><br>**⑤ 转为客户（退出任职）**：该店员名下所有群（通用群/客户群/客服群）自动解散；IM_LOCKS 中该店员名下的全部客户锁客关系解绑，客户回归公海池（待重新分配）。<br><br>**⑥ 复职（离职后再次入职，2026-08-13 裁决）**：历史群不归还——离职/转为客户时群已解散不可恢复；复职=新入职，按 BR-IM-021 店员入职规则自动建新客户群（初始为空，名下客户数归零），同时 T+0 重新加入通用群；此前名下客户已重新分配，不随复职自动回流。<br><br>**通用约束**：所有群主转移与群名重命名由系统自动执行，App 端无手动入口；后台门店管理页「更换店长」与门店成员页「修改身份/更换门店/转为客户」执行时弹窗提示「将同步转移群主与重命名群，是否继续？」供运营确认；群主转移后原群主不再保留任何管理权限 |
| BR-IM-036 | 举报规则：入口=单聊右上角「⋯」直接打开、群聊在群设置页「举报」cell 承载。举报弹窗含举报对象（自动展示）+举报类型（5 选 1：骚扰谩骂/欺诈诈骗/色情低俗/广告引流/其他违规）+问题描述（选填 200 字）+凭证图片（最多 3 张）；提交按钮=未选举报类型时置灰；提交后提示「已提交至平台审核」（V1 仅前端流程，real 接审核系统） |
| BR-IM-037 | 注销账号规则：入口=底部导航「我的」→注销账号页（APP 上架合规）。流程=阅读警示+5 条注销须知→勾选「已阅读并理解」→点「申请注销」→二次确认输入「确认注销」文字匹配才可提交；注销后数据永久删除不可恢复、进行中售后需先关闭、店长/店员名下客户重新分配；V1 仅前端流程，real 走账号注销流程 |

### 8.1 客户群容量策略详解（BR-IM-031 / D15）

**① 上限与阈值**
- 单群成员硬上限=**2000 人**（来源：腾讯云 IM 专业版群组档位；若商务升级旗舰版/万人群档位，上限数值随档位调整，策略机制不变）
- 预警线=**1800 人**（约 90% 水位）：为门店预留分客/新增店员的运营缓冲期
- 适用范围：**仅客户群**（店长群/店员群）；通用群（成员=门店员工，量级极小）与客服群（一对一）天然不受限，不参与本策略

**② 预警机制（达 1800）**
- 触发时机：绑定生效/扫码/换绑转入导致客户群成员数首次达到 1800
- 触达方式（双端）：
  - 群主 App：客户群内系统消息+消息中心服务通知——「你的客户群「{门店名}·店长群」已达 1800 人，满 2000 后将自动分群，新客将进入新群；可提前分客或新增店员分流」
  - 运营后台：门店视图对该群标注「容量预警」（后台配合项）
- 幂等：每群仅提示一次；回落后再次达到不重复提示
- 运营动作（引导非强制）：换绑分流部分客户给同店其他服务者 / 新增店员任职分客

**③ 自动分群/裂变（满 2000）**
- 触发时机：第 2001 名客户需要入群时（绑定生效/扫码/换绑转入）
- 系统动作：自动为该服务者创建下一序号客户群（「{门店名}·店长2群」/「{门店名}·{店员昵称}2群」，首个群不带序号）；群主=服务者本人；序号无上限（2→3→…）
- 新客去向：始终进入该服务者**最新未满**的序号群
- 存量客户：**不迁移、不拆群**；满员老群仅停止进新客，消息/公告/售后/禁言一切正常
- 新群属性继承：群类型（staff_group）/门店归属/群主继承；**全员禁言默认关闭**（不复制）；**公告不复制**（新群无历史公告）
- 客户无感知：成员制可见性（BR-IM-007）下每个客户仍只见自己所在的一个客户群；同群互见范围=各自序号群内
- 裂变留痕：群事件记录（seq_no、split_from）供后台审计与排障

**④ 各业务链路口径**

| 链路 | 口径 |
|---|---|
| 新客绑定/扫码入群 | 进入归属服务者「最新未满」序号群（BR-IM-006/021） |
| 换绑转移 | 转入新归属人当前未满群；其群全满则入最新序号群（BR-IM-025） |
| 直播群发（V2） | 「本店全部客户」= 服务者全部序号客户群，逐群投递（BR-IM-029） |
| 群公告 | 本期单群发布，多序号群需逐群各发一次；一键覆盖随门店公告群发=V2（BR-IM-010） |
| 全员禁言 | 按单群开关，序号群之间互不影响（BR-IM-023） |
| 客服群 | 一对一，不受容量约束、不参与裂变（FN-IM-023） |
| 可见性/搜索 | 客户仅见自己所在序号群；服务者群列表按序号群分别展示（BR-IM-007） |

**⑤ 三端视角**
- **客户**：完全无感——始终只在一个客户群，不被迁移、不收任何提示
- **服务者（群主）**：我的群聊中同店多个序号群并列（「{门店名}·店长群」「{门店名}·店长2群」…），各自独立管理成员/禁言/公告；达预警线收系统提示
- **运营后台（配合项）**：门店视图展示各服务者的群数量与容量水位，预警群标注；禁用门店选「解散群」时全序号群一并解散（客户进公海，D16）

**⑥ 落地与开放项**
- real 阶段随腾讯 IM 接入落地（建群/成员写入走 ImChannelApi 契约）；套餐档位与群配额费用商务并行评估
- 本期 Sim 数据量级达不到 2000，**原型不演示**，以业务规则卡与本节为准

## 9. 数据实体（ENT，共 11 项）

### ENT-IM-001 好友关系(FriendRelation)
| 字段 | 类型 | 说明 |
|---|---|---|
| relation_id | String | 关系ID |
| from_user / to_user | String | 双方用户ID |
| status | Enum | 待通过(pending_approve)/已添加(added)/已拒绝(rejected)/等待验证(waiting) |
| greeting | String | 打招呼内容（≤100 字） |
| remark | String | 备注名（≤30 字） |
| is_blocked | Boolean | 是否拉黑 |
| created_at / updated_at | DateTime | — |

### ENT-IM-002 群(Group)
| 字段 | 类型 | 说明 |
|---|---|---|
| group_id | String | IM 群ID |
| group_type | Enum | internal_mgmt 通用群/staff_group 客户群/store_service 客服群（BR-IM-013） |
| store_id / org_id | String | 归属门店/组织（按类型其一） |
| customer_id | String | 服务群所属客户（仅 store_service） |
| owner_id | String | 群主（服务群=店长） |
| status | Enum | normal 正常/dissolved 已解散（v3.0 两档） |
| member_ids | String[] | 成员 ID 列表 |
| mute_all | Boolean | 全员禁言（客户群适用，BR-IM-023） |
| announces | Array | 公告历史[{text, by_user, created_at}]，最新在前（FN-IM-013） |
| created_at / archived_at | DateTime | — |

### ENT-IM-003 群成员快照(GroupMemberSnapshot)
| 字段 | 类型 | 说明 |
|---|---|---|
| group_id / user_id | String | — |
| role | Enum | member 成员/server 服务人（群主由 group.owner_id 表达） |
| joined_via | Enum | invite 邀请/auto_binding 绑定/auto_lock 锁客归属/org_sync 门店成员同步/assist 售后补位 |
| invited_by | String | 邀请人（BR-IM-006 留痕） |
| joined_at / left_at | DateTime | — |

### ENT-IM-004 消息(Message)
| 字段 | 类型 | 说明 |
|---|---|---|
| msg_id | String | IM 消息ID |
| conv_id / group_id | String | 会话/群 |
| from_user | String | 发送方（系统消息=system） |
| msg_type | Enum | text/image/file/voice/order_card/live_card/progress_card |
| content | JSON | 消息体（卡片含订单快照；语音含 duration） |
| audit_status | Enum | passed 通过/blocked 拦截/suspicious 可疑/pending 待审 |
| is_recalled | Boolean | 已撤回 |
| created_at | DateTime | — |

### ENT-IM-005 订单卡片(OrderCard) — msg_type=order_card 的 content 结构
| 字段 | 类型 | 说明 |
|---|---|---|
| order_id | String | 订单号（订单域引用，不复制数据） |
| snapshot | JSON | 快照（商品/金额/时间/状态，U9 粒度已冻结） |
| aftersale_id | String | 关联售后单（可空） |
| aftersale_status | Enum | 未发起/处理中/已完成/已关闭 |

### ENT-IM-006 审核记录(AuditRecord)
| 字段 | 类型 | 说明 |
|---|---|---|
| audit_id / msg_id | String | — |
| audit_type | Enum | 同步/异步 |
| result | Enum | 通过/拦截/可疑 |
| scene | String | 审核场景（6+N） |
| handled_at | DateTime | 回调时间 |

### ENT-IM-007 会话(Conversation)
| 字段 | 类型 | 说明 |
|---|---|---|
| conv_id | String | 会话ID（单聊=c2c-{userId}；直播弹幕=live-{roomId}） |
| conv_type | Enum | c2c/store_service/internal_mgmt/staff_group/live |
| unread_count | Number | 未读 |
| last_msg | JSON | 最后一条摘要 |
| updated_at | DateTime | — |

### ENT-IM-008 直播间(LiveRoom)
| 字段 | 类型 | 说明 |
|---|---|---|
| room_id | String | AVChatRoom ID |
| host_id / store_id | String | 主播/归属门店 |
| status | Enum | living 直播中/ended 已结束（决策：两态，不做「准备中」） |
| viewer_count | Number | 观看数 |

### ENT-IM-009 售后单详情(AftersaleDetail)
| 字段 | 类型 | 说明 |
|---|---|---|
| aftersale_id / order_id | String | 售后单号/订单号 |
| order_snapshot | JSON | 订单快照（商品/金额/时间/状态） |
| customer_id / customer_name | String | 客户 |
| store_id / group_id | String | 归属门店/服务群 |
| reason | String | 申请原因 |
| service_type | Enum | refund 仅退款/return 退货退款/logistics 查物流/consult 仅咨询 |
| status | Enum | pending 待处理/processing 处理中/done 已完成/closed 已关闭（客户视角：pending+processing=进行中） |
| handler_id | String | 处理人（服务归属留痕） |
| logs | Array | 售后记录[{log_id, action, operator_id, operator_name, note, created_at, extra?}]（action 含 create/accept/refund/return_agree/return_receive/logistics/close；退款方式/金额等存于 extra 结构化卡片） |
| source_channel | Enum | im/app（IM 渠道标记） |
| created_at / updated_at | DateTime | — |

### ENT-IM-010 店员通知(ImNotify)
| 字段 | 类型 | 说明 |
|---|---|---|
| notify_id / type | String/Enum | 通知ID/order_card_new/aftersale_update/group_event |
| store_id / group_id | String | 目标门店/服务群 |
| title / desc / payload | String/JSON | 标题/描述/关联数据 |
| read_by | Array | 已读账号（提交者预置已读；仅店员/店长可见） |

### ENT-IM-011 群发批次(MassSendBatch)
| 字段 | 类型 | 说明 |
|---|---|---|
| batch_id | String | 批次ID |
| room_id / sender_id | String | 直播间/发起人 |
| target_type | Enum | group 按群聊/person 按个人 |
| targets | Array | 目标会话列表（跨路径已去重，BR-IM-027） |
| success / fail | Number | 成功/失败数 |
| clicks | Number | 点击观看数（via=mass_send 归因） |
| created_at | DateTime | — |

## 10. API 映射（V1 Sim 模拟，real 对接）

API-IM-001~011：关系链 15 个/群组 38 个/消息收发/漫游/审核回调/本地搜索/直播群/UserSig/订单查询/售后单/组织树锁客门店成员。

## 11. 指标登记

METRIC-IM-001~006：一客一群覆盖率（≥95%）/售后线上化率/售后响应时长/审核覆盖率（=100%）/公告触达率/群同步成功率。

## 12. UC 清单（共 26 个）

| UC 编号 | 名称 | 关联 FN | 摘要 |
|---|---|---|---|
| UC-IM-001 | 切换身份查看通讯录 | FN-IM-001/008 | 4 身份视图+可见性过滤 |
| UC-IM-002 | 添加好友 | FN-IM-002 | 手机号搜索→打招呼→等待验证 |
| UC-IM-003 | 处理好友申请/管理好友 | FN-IM-002 | 通过/拒绝；备注/拉黑/删除 |
| UC-IM-004 | 查看我的群聊 | FN-IM-003/011/008 | 两类分组+双向视角 |
| UC-IM-005 | 门店群建立与流转 | FN-IM-003/022 | 通用群/客户群自动构成+绑定入客户群+换绑转移（成员制隔离） |
| UC-IM-006 | 单聊/群聊收发消息 | FN-IM-004/005/006 | 五类型+审核+漫游双写 |
| UC-IM-007 | 违规消息审核处置 | FN-IM-006 | 同步拦截/异步撤回/回调记录 |
| UC-IM-008 | 全局搜索 | FN-IM-007 | 三类分组+权限过滤 |
| UC-IM-009 | 客户发送订单卡片 | FN-IM-009 | 选择器→「我要咨询此订单」→卡片入群（不创建售后单） |
| UC-IM-010 | 店员处理卡片售后 | FN-IM-009 | 已发起售后的卡片→售后详情面板→开始处理（客户见进行中）→仅退款/退货退款/查物流→已完成回写；未发起时仅提示 |
| UC-IM-010A | 客户主动发起售后申请 | FN-IM-009 | 点击订单卡片→「发起售后」页→选择类型/原因/电话/描述/凭证→提交创建售后单+通知店员 |
| UC-IM-011 | 内部管理群协同 | FN-IM-010 | 组织链邀请建群/成员 T+0 同步/C 端零暴露 |
| UC-IM-012 | 消息中心查收 | FN-IM-012 | 三类系统消息+既有四类通知入口+未读聚合 |
| UC-IM-013 | 群公告发布与查看 | FN-IM-013 | 群主发布→公告条→历史弹层→群内系统消息回写 |
| UC-IM-014 | 群内发起纯直播 | FN-IM-LIVE-001 | ⊕直播（仅服务群）→开播/观看/弹幕/点赞/结束（本期不开发） |
| UC-IM-019 | 二维码邀请客户 | FN-IM-018 | 邀请卡+二维码→复制链接/扫码→确认加入（扫码即绑定归属人，幂等） |
| UC-IM-020 | 绑定结果与自动入群 | FN-IM-022 | 新客绑定入客户群/老客复扫幂等/门店异常不阻断 |
| UC-IM-025 | 主动咨询建客服群 | FN-IM-023 | 商品/订单详情「联系客服」→ 首次创建/再次幂等直达一对一客服群 |
| UC-IM-026 | 设置会话免打扰 | FN-IM-025 | 群设置/朋友设置开关 → 未读灰显+图标，不计入底部 badge |
| UC-IM-027 | 禁用门店与解散群选择 | FN-IM-026 | 禁用弹窗（原文案保留）→勾选「同时解散群聊」→三类群解散+客户进公海 |
| UC-IM-022 | 分享直播间到会话 | FN-IM-019 | 直播推广→分享→按群聊/按个人→去重+频控（本期不开发） |
| UC-IM-023 | 接收并点击直播卡片 | FN-IM-020 | live_card→直播中进直播间/结束置灰（本期不开发） |
| UC-IM-024 | 查看群发批次效果 | FN-IM-021 | 批次列表+成功率+点击率归因（本期不开发） |
| UC-IM-030 | 门店通用群操作闭环 | FN-IM-010 | 建群+成员 T+0 同步+群主转移+门店更名重命名+功能边界+解散 |
| UC-IM-031 | 客服群操作闭环 | FN-IM-023 | 首次咨询建群+幂等复用+群主转移+售后专属+不因完结解散 |
| UC-IM-032 | ~~任职角色变更与群联动~~ | FN-IM-027 | 已拆分到 UC-IM-033（更换店长）+ UC-IM-034（门店成员三操作），本条作废 |
| UC-IM-033 | 后台门店管理群联动入口（更换店长） | FN-IM-026/027 | 门店管理页更换店长→群主转移+群名重命名 |
| UC-IM-034 | 后台门店成员角色变更与群联动 | FN-IM-027 | 门店成员页修改身份/更换门店/转为客户→三类群群主转移+重命名+归属重分配 |
| UC-IM-035 | 举报当前会话/对方 | FN-IM-028 | 单聊右上角⋯/群设置页举报入口→两步选择（类别+子原因chip）→提交至平台审核 |
| UC-IM-036 | 申请注销账号 | FN-IM-029 | 我的→注销账号页→读须知→勾选→二次确认输入文字→提交 |

## 13. 页面与路由清单（17 页 / 18 路由）

| 页面编号 | 页面 | 路由 | 关联 FN |
|---|---|---|---|
| PG-IM-001 | 消息中心 / 通知列表 | /h5/im/message、/h5/im/notify/:type | FN-IM-012 |
| PG-IM-002 | 通讯录列表 | /h5/im/contacts | FN-IM-001 |
| PG-IM-003 | 新的朋友 | /h5/im/friend-requests | FN-IM-002 |
| PG-IM-004 | 添加好友 | /h5/im/friend/add | FN-IM-002 |
| PG-IM-005 | 好友资料页 | /h5/im/friend/:userId | FN-IM-002 |
| PG-IM-006 | 朋友设置 | /h5/im/friend/:userId/settings | FN-IM-002 |
| PG-IM-007 | 我的群聊 | /h5/im/groups | FN-IM-003/011 |
| PG-IM-008 | 聊天会话 | /h5/im/chat/:convId | FN-IM-004/009 |
| PG-IM-009 | 群设置 | /h5/im/group/:groupId/settings | FN-IM-003/013 |
| PG-IM-010 | 全局搜索 | /h5/im/search | FN-IM-007 |
| PG-IM-012 | 纯直播间（本期不开发） | /h5/im/live/:roomId | FN-IM-LIVE-001 |
| PG-IM-015 | 扫码加入群 | /h5/im/join/:groupId | FN-IM-018 |
| PG-IM-016 | 绑定结果页 | /h5/im/pay-result | FN-IM-022 |
| PG-IM-017 | 直播推广（本期不开发） | /h5/im/live-promo | FN-IM-019 |
| PG-IM-018 | 群发记录（本期不开发） | /h5/im/live-promo/records | FN-IM-021 |
| PG-IM-019 | 联系客服入口演示 | /h5/im/consult-entry | FN-IM-023 |
| PG-IM-020 | 门店管理 + 门店成员（租户后台·PC，IM 聚焦：更换店长/禁用/修改身份/更换门店/转为客户 + 群联动确认） | /admin/im/stores、/admin/im/stores/members | FN-IM-026/027 |
| PG-IM-021 | 发起售后（客户主动申请） | /h5/im/aftersale/apply | FN-IM-009 |

**演示辅助**：三屏联动 /h5/im-grid（3 角色平铺实时联动）；原型查看工具 /proto/im（功能树/静态页/用例卡/业务规则/流程图/状态机）。
**Sim/Real 策略**：V1 高保真原型以 Sim 通道模拟 IM（契约与 API-IM-001~011 对齐），real 阶段切换腾讯云 IM SDK/REST；审核策略/回调配置为 backend_config（控制台人工）。

## 14. 入口点标注（研发友好）

| 终端 | 入口路径 | 路由 | 关联 FN |
|---|---|---|---|
| APP | 底部导航「消息」→消息 Tab | /h5/im/message | FN-IM-012 |
| APP | 底部导航「消息」→通讯录 Tab | /h5/im/contacts | FN-IM-001 |
| APP | 底部导航「娱乐」→直播推广 | /h5/im/live-promo | FN-IM-019 |
| APP | 通讯录→新的朋友/群聊/好友详情 | /h5/im/friend*、/h5/im/groups | FN-IM-002/003 |
| APP | 会话页 | /h5/im/chat/:convId | FN-IM-004/009 |
| APP | 订单/售后详情「联系门店」 | 跳 /h5/im/chat/:convId | FN-IM-003/009 |
| APP | 群内⊕面板「直播」（仅服务群） | /h5/im/live/:roomId | FN-IM-LIVE-001 |
| APP | 邀请卡扫码/链接 | /h5/im/join/:groupId | FN-IM-018 |
| APP | 绑定完成（后台绑定/扫码）→绑定结果页 | /h5/im/pay-result | FN-IM-022 |
| APP | 商品详情/订单详情「联系客服」（入口属商城域，原型演示） | /h5/im/consult-entry | FN-IM-023 |
| 租户后台 | 门店管理·禁用（原文案保留+「同时解散群聊」选择） | /admin/im/stores | FN-IM-026 |

## 15. 决策记录（全部已决策关闭，正文已按决策刷新）

### 15.1 原待确认项（TBD-01~13）决策

| 编号 | 事项 | 决策 |
|---|---|---|
| TBD-01 | 消息撤回 | ✅ 本期实现：自己的文本/语音消息 2 分钟内可撤回，跨页同步 |
| TBD-02 | 拉黑后消息拦截 | ✅ 本期实现：单聊互发拦截并提示「对方已被你拉黑，消息未发送」 |
| TBD-03 | 移除群成员 | ✅ 本期实现：群主移除+二次确认 |
| TBD-04 | 关闭售后单二次确认 | ✅ 本期实现：关闭前弹二次确认（不可恢复） |
| TBD-05 | 门店公告群发 | 转 V2：本期单群公告已闭环 |
| TBD-06 | 审核白名单免审 | real 阶段：随腾讯云审核策略配置落地 |
| TBD-07 | 身份审核入口控制 | 留 APP 域：依赖 BR-APP-008，跨域联动 |
| TBD-08 | 直播「准备中」状态 | 不做：纯直播两态（living/ended）满足本期 |
| TBD-09 | 订单卡片快照粒度 | 冻结：商品/金额/时间/状态四字段 |
| TBD-10 | 手机号分级 | 维持两档：好友明文/其他脱敏（隐私最小化） |
| TBD-11 | 单端登录 | ✅ 已决策（2026-08-04，D17）：取消单端限制，多端同时在线不互踢 |
| TBD-12 | 本地 DB 双写方案 | real 阶段：随 IM SDK 本地库能力确认 |
| TBD-13 | 代理/渠道对服务群可见性 | ✅ 采纳 B 方案（随 D4/D5 关闭）：代理不可见；渠道角色取消 |

### 15.2 群模型决策（D1~D9，2026-08-03 用户裁决，已并入正文）

| # | 决策 |
|---|---|
| D1 | 客户入群只有两条路径：分销域绑定（后台绑定生效自动入群）+ 被邀请（扫码即绑定归属人）；**下单不触发建群**（onOrderPaid 触发链与支付结果场景作废，改为绑定结果页 FN-IM-022） |
| D2 | 绑定语义：通讯录遵循分销域锁客关系；App 端移除客户须双端校验二次确认（本期仅通讯录层面移除，不走业务侧） |
| D3 | 无公海：客户必有归属人；店长/店员仅见自己名下归属客户；店长原「本店全量视野」取消 |
| D4 | 代理不可见客户与门店服务群（监督走数据看板）；关闭 TBD-13（B 方案） |
| D5 | 身份仅四种：代理/店长/店员/买家；渠道成员角色取消（其层级由直营/非直营代理群承载） |
| D6 | 代理群分直营店/非直营店（已落地：直营店代理群/非直营店代理群分群演示，代理零可见客户与服务群） |
| D7 | 店员可跨项目、跨门店任职，群聊列表展示其任职的全部群（已落地：任职表 IM_EMPLOYMENTS + 任职信息条 + 群行门店标签，李店员=南山·项目A+福田·项目B） |
| D8 | 店长可跨项目但不能跨门店，同一时间只能在一个门店任职（已落地：王店长=南山门店×项目A/项目C，单店任职） |
| D9 | 没有个人群聊：取消普通聊天群，任何身份不可手动建群；群组两分类全部系统创建；单聊（c2c 私信）保留；FN-IM-017/UC-IM-015/UC-IM-006D/UC-IM-016 与 BR-IM-004 同步删除 |
| D10 | 群模型 v3.0（2026-08-03 晚会议纪要+用户补充裁决）：三类群=**门店通用群**（店长+店员，无客户，门店创建即建）+**客户群**（店长群/店员群：服务者+名下客户，按归属隔离——店长的客户在店长群，店员的客户在店员群）+**客服群**（一对一：客户×归属服务者）；原「一客一群·绑定即建」作废 |
| D11 | 一对一客服群只在**客户主动咨询**时创建（商品详情/订单详情「联系客服」入口）；绑定/扫码仅入归属人客户群，不建独立群（防批量导入爆群） |
| D12 | 90 天沉睡托管/群回收本期移除（群长期正常）；回收机制先跑三个月再定 |
| D13 | 客户群做完整**全员禁言**开关（仅群主可开关，开启时仅群主可发言；活动推送/开播提醒场景）；后台禁用/启用门店不影响群（可选「同时解散」）；换绑加「同步转移群」选项（**2026-08-13 裁决变更：取消开关，换绑自动转移，见 BR-IM-025**；**2026-08-17 裁决变更：管理员仅通用群保留，客户群/客服群无管理员，见 BR-IM-009**） |
| D14 | 代理身份整体移除（群只有店长、店员、普通买家）；客户-店铺私信先不做（由一对一客服群承接，对标淘宝客服）；临时群（咨询完即散）不搞 |
| D15 | 客户群容量策略（2026-08-04 用户裁决）：单群上限 2000 人（IM 专业版档位）→ **1800 预警+满员自动分群（裂变序号群）**；存量客户不迁移，客户无感知（成员制可见性天然兼容）；套餐档位/群配额商务并行评估；real 阶段随腾讯 IM 接入落地（BR-IM-031） |
| D16 | 门店禁用话术与公海（2026-08-04 用户裁决）：后台禁用门店弹窗增加「是否同时解散群聊？解散后客户将进入公海」——解散=该门店客户失去归属服务者进入公海待重新分配（重新绑定后按 BR-IM-006 入新归属人客户群）；不确定解散则群不动（BR-IM-024） |
| D17 | 取消单端登录限制（2026-08-04 用户裁决）：允许多端同时在线，不做同平台互踢（BR-IM-012，关闭 TBD-11） |
| D18 | 直播模块本期不开发（2026-08-04 用户裁决）：纯直播/直播推广分享/直播卡片/群发记录（FN-IM-LIVE-001、FN-IM-019/020/021，BR-IM-026~030）整体顺延 V2；原型保留演示并加「本期不开发」标记 |
| D19 | 消息免打扰归本期（2026-08-04 用户裁决）：会话级免打扰（群聊/单聊）=V1 本期能力（非 V2）；免打扰会话未读不计入底部导航 badge，按账号独立（BR-IM-032） |

## 16. 确认结论

1. 本稿（v1.0.0）与高保真原型逐项核对完成：24 FN + 31 BR + 11 ENT + 11 API + 22 UC + 6 METRIC + 17 页面（18 路由）。
2. 群模型最终口径（D10~D14）：三类群（通用群/客户群/客服群）+绑定仅入客户群+主动咨询建客服群+全员禁言+换绑转移+禁用不影响群+代理移除+无沉睡托管+容量策略（D15：1800 预警+满员自动分群）；全部决策已并入正文（§15.2）。
3. 决策沿革：脑暴成稿（一客一群方案）→ 取消个人群聊 → 2026-08-03 门店群聊会议纪要（三类群方案定稿，D10~D14）→ 本稿整合为 V1.0.0 正式版（过程版本号不再保留）→ 2026-08-04 群容量策略（D15：预警+自动分群）→ 2026-08-04 禁用话术与公海+取消单端登录（D16/D17）→ 2026-08-04 直播模块本期不开发（D18）+容量策略详解（§8.1）→ 2026-08-04 消息免打扰归本期（D19）。
4. 确认通过后：design-flow 以本稿为基线复核设计稿；real 对接按 §10 API 映射与 ImChannelApi 契约执行。
`,Fr={class:"prd-doc"},Ur=["innerHTML"],Gr=A({__name:"PrdDocPage",setup(n){fe.initialize({startOnLoad:!1,theme:"base",themeVariables:{primaryColor:"#E7F8F0",primaryBorderColor:"#12B76A",primaryTextColor:"#303133",lineColor:"#8C8C8C",secondaryColor:"#FFFBE6",tertiaryColor:"#F5F7FA",fontSize:"13px"},flowchart:{htmlLabels:!0},sequence:{actorMargin:60,messageMargin:32}});const e=H(),t=oe(()=>_.parse($r,{async:!1}));async function r(){var l;await nt();const s=e.value;if(!s)return;const i=Array.from(s.querySelectorAll("pre > code.language-mermaid"));for(let p=0;p<i.length;p++){const a=i[p],d=a.textContent??"";try{const{svg:u}=await fe.render(`prd-mmd-${p}`,d),h=document.createElement("div");h.className="mmd-svg",h.innerHTML=u,(l=a.parentElement)==null||l.replaceWith(h)}catch{}}}return ce(r),(s,i)=>(g(),m("div",Fr,[o("div",{ref_key:"bodyRef",ref:e,class:"md-body",innerHTML:t.value},null,8,Ur)]))}}),Er=F(Gr,[["__scopeId","data-v-6b6230ce"]]),Lr={class:"gfs"},zr={class:"gfs-list"},Vr={class:"gfs-row-main"},Or={class:"gfs-name"},Qr={class:"gfs-desc"},qr={class:"gfs-list"},Kr={class:"gfs-row-main"},jr={class:"gfs-name"},Zr={class:"gfs-desc"},Hr={class:"gfs-list"},Wr={class:"gfs-row-main"},Jr={class:"gfs-name"},Xr={class:"gfs-desc"},Yr=A({__name:"GroupFeatureSimplePage",setup(n){const e=[{name:"门店通用群「{门店}通用群」",desc:"店长+店员的内部协同群，没有客户；门店一开就有",tag:"自动建",tagClass:"ok"},{name:"客户群「{门店}·店长群 / {门店}·{店员昵称}群」",desc:"一个服务者+他名下的客户；入职就有；客户只看得见自己那一个",tag:"自动建",tagClass:"ok"},{name:"客服群「{门店}·客服群」",desc:"客户×归属服务者一对一；客户点「联系客服」才建，不咨询不建",tag:"咨询才建",tagClass:"ok"}],t=[{name:"群成员列表",desc:"同群成员互相可见；群主可移除成员（二次确认）",tag:"本期",tagClass:"ok"},{name:"群公告",desc:"群主发布，成员顶栏可见+历史可查",tag:"本期",tagClass:"ok"},{name:"禁言（全员禁言）",desc:"客户群可开关，开启后仅群主可发言",tag:"本期",tagClass:"ok"},{name:"管理员设置",desc:"仅通用群（店长设店员协助管理，≤3 人）",tag:"本期",tagClass:"ok"},{name:"修改群名称",desc:"群主可改，20 字内",tag:"本期",tagClass:"ok"},{name:"邀请客户（二维码）",desc:"扫码即绑定归属人，并自动进入其客户群",tag:"本期",tagClass:"ok"},{name:"任职与跨项目标签",desc:"店员可跨项目跨门店任职、店长跨项目单店；群聊与成员列表按项目打标，跨项目有标识",tag:"本期",tagClass:"ok"},{name:"绑定自动入群",desc:"后台绑定生效自动进归属人客户群，不单独建群",tag:"本期",tagClass:"ok"},{name:"换绑转移",desc:"更改客户归属可选「同步转移群」，移到新归属人的群",tag:"本期",tagClass:"ok"},{name:"未读消息计数",desc:"按「会话×账号」独立，底部导航聚合",tag:"本期",tagClass:"ok"},{name:"历史消息存储",desc:"云端漫游，删除好友也保留",tag:"本期",tagClass:"ok"},{name:"撤回消息",desc:"自己的文本/语音消息 2 分钟内可撤回，全端同步显示「消息已撤回」",tag:"本期",tagClass:"ok"},{name:"一对一售后",desc:"客服群内订单卡片 → 仅退款/退货退款/查物流",tag:"本期",tagClass:"ok"},{name:"群容量保护（2000 人）",desc:"1800 预警；满 2000 自动开「2 群」，老客户不动、客户无感",tag:"本期",tagClass:"ok"},{name:"消息免打扰",desc:"群聊/单聊均可设；免打扰会话未读不计入底部角标",tag:"本期",tagClass:"ok"},{name:"多端登录",desc:"手机+平板可同时在线，不互踢",tag:"本期",tagClass:"ok"}],r=[{name:"个人群聊 / 手动建群",desc:"任何身份都不能建群，单聊走私信",tag:"不做",tagClass:"no"},{name:"下单自动建群",desc:"下单不触发任何建群",tag:"不做",tagClass:"no"},{name:"申请加群审批",desc:"不做审批流，扫码/绑定即入群",tag:"不做",tagClass:"no"},{name:"直播（直播间/分享/卡片/群发记录）",desc:"本期不开发，原型仅演示",tag:"V2",tagClass:"v2"}];return(s,i)=>(g(),m("div",Lr,[i[0]||(i[0]=o("div",{class:"gfs-head"},[o("div",{class:"gfs-title"},"群功能 · 简化版"),o("div",{class:"gfs-sub"},"一句话：群只有三种，全部系统自动建，客户只看得到自己那一个服务群。")],-1)),i[1]||(i[1]=o("div",{class:"gfs-section"},"三种群（不用建，系统自动来）",-1)),o("div",zr,[(g(),m(S,null,x(e,l=>o("div",{key:l.name,class:"gfs-row"},[o("div",Vr,[o("span",Or,f(l.name),1),o("span",Qr,f(l.desc),1)]),o("span",{class:G(["gfs-tag",l.tagClass])},f(l.tag),3)])),64))]),i[2]||(i[2]=o("div",{class:"gfs-section"},"群功能清单",-1)),o("div",qr,[(g(),m(S,null,x(t,l=>o("div",{key:l.name,class:"gfs-row"},[o("div",Kr,[o("span",jr,f(l.name),1),o("span",Zr,f(l.desc),1)]),o("span",{class:G(["gfs-tag",l.tagClass])},f(l.tag),3)])),64))]),i[3]||(i[3]=o("div",{class:"gfs-section"},"不做 / 顺延",-1)),o("div",Hr,[(g(),m(S,null,x(r,l=>o("div",{key:l.name,class:"gfs-row"},[o("div",Wr,[o("span",Jr,f(l.name),1),o("span",Xr,f(l.desc),1)]),o("span",{class:G(["gfs-tag",l.tagClass])},f(l.tag),3)])),64))]),i[4]||(i[4]=o("div",{class:"gfs-foot"},"详细口径见旁边「PRD V1.0.0（确认稿）」与「业务规则总览」",-1))]))}}),ei=F(Yr,[["__scopeId","data-v-58a53080"]]),ti={class:"perm-doc"},ni={class:"perm-table"},si={class:"col-feature"},ri={key:0,class:"yes"},ii={key:1,class:"no"},ai={key:2},li={class:"perm-table"},oi={class:"col-feature"},ci={key:0,class:"yes"},pi={key:1,class:"no"},ui={key:2},di=A({__name:"GroupPermissionTablePage",setup(n){const e=[{name:"群公告",cells:["no","yes","no（V1）"]},{name:"全员禁言",cells:["no","yes","no"]},{name:"邀请客户（添加成员）",cells:["no","yes","no"]},{name:"移除成员",cells:["系统驱动","群主","no"]},{name:"管理员设置",cells:["yes（店长设店员）","no","no"]},{name:"修改群名称",cells:["no（固定）","群主","no（固定）"]},{name:"解散群",cells:["群主","群主","群主"]},{name:"举报",cells:["yes","yes","yes"]},{name:"消息免打扰 / 置顶",cells:["yes","yes","yes"]},{name:"订单卡片 / 售后",cells:["no","no","yes"]}],t=[{name:"发公告",cells:["yes（客户群/客服群）","no","no"]},{name:"移除成员",cells:["yes","yes（仅通用群）","no"]},{name:"设置管理员",cells:["yes（仅通用群）","no","no"]},{name:"修改群名称",cells:["yes（客户群）","no","no"]},{name:"全员禁言",cells:["yes（客户群）","no","no"]},{name:"解散群",cells:["yes","no","no"]},{name:"发言 / 聊天",cells:["yes","yes","yes"]},{name:"消息免打扰 / 置顶",cells:["yes","yes","yes"]},{name:"举报",cells:["yes","yes","yes"]}];function r(s){return s==="yes"?"cell-yes":s==="no"||String(s).startsWith("no")?"cell-no":"cell-text"}return(s,i)=>(g(),m("div",ti,[i[2]||(i[2]=o("div",{class:"doc-title"},"三类群功能和操作权限",-1)),i[3]||(i[3]=o("div",{class:"doc-sub"},"门店通用群 / 客户群 / 客服群 · 功能边界与操作权限矩阵（口径见业务规则 BR-IM-009/023/033/034）",-1)),i[4]||(i[4]=o("div",{class:"sec-title"},"一、三类群功能对比",-1)),o("table",ni,[i[0]||(i[0]=o("thead",null,[o("tr",null,[o("th",{class:"col-feature"},"功能"),o("th",null,"门店通用群"),o("th",null,"客户群"),o("th",null,"客服群")])],-1)),o("tbody",null,[(g(),m(S,null,x(e,l=>o("tr",{key:l.name},[o("td",si,f(l.name),1),(g(!0),m(S,null,x(l.cells,(p,a)=>(g(),m("td",{key:a,class:G(r(p))},[p==="yes"?(g(),m("span",ri,"✓")):p==="no"?(g(),m("span",ii,"✗")):(g(),m("span",ai,f(p),1))],2))),128))])),64))])]),i[5]||(i[5]=o("div",{class:"sec-title"},"二、操作权限矩阵（谁可以做什么）",-1)),o("table",li,[i[1]||(i[1]=o("thead",null,[o("tr",null,[o("th",{class:"col-feature"},"操作"),o("th",null,"群主"),o("th",null,"管理员"),o("th",null,"普通成员 / 客户")])],-1)),o("tbody",null,[(g(),m(S,null,x(t,l=>o("tr",{key:l.name},[o("td",oi,f(l.name),1),(g(!0),m(S,null,x(l.cells,(p,a)=>(g(),m("td",{key:a,class:G(r(p))},[p==="yes"?(g(),m("span",ci,"✓")):p==="no"?(g(),m("span",pi,"✗")):(g(),m("span",ui,f(p),1))],2))),128))])),64))])]),i[6]||(i[6]=xt('<div class="notes" data-v-9435562f><div class="note-item" data-v-9435562f>· 管理员仅存在于门店通用群（店长设店员为管理员，≤3 人），客户群/客服群无管理员。</div><div class="note-item" data-v-9435562f>· 移除客户群的客户成员须「双端校验」二次确认（仅通讯录移除 / 按业务绑定解除，BR-IM-006）。</div><div class="note-item" data-v-9435562f>· 通用群、客服群成员变动由系统驱动（入职/离职同步、咨询才建），无手动添加成员入口。</div><div class="note-item" data-v-9435562f>· 通用群、客服群群名固定不可手动改；客户群群名由群主修改。</div></div>',1))]))}}),hi=F(di,[["__scopeId","data-v-9435562f"]]),gi=[{key:"prd",title:"PRD 文档",pages:[{taskId:"IM-DOC-PRD",title:"PRD V1.0.0（确认稿）",pageId:"PG-IM-DOC",component:Er,livePath:"",frame:"doc"},{taskId:"IM-DOC-SIMPLE",title:"群功能简化版",pageId:"PG-IM-DOC",component:ei,livePath:"",frame:"doc"}]},{key:"rules",title:"业务规则",pages:[{taskId:"IM-DOC-RULES",title:"业务规则总览",pageId:"PG-IM-DOC",component:Is,livePath:"",frame:"doc"}]},{key:"flows",title:"流程图",pages:[{taskId:"IM-DOC-FLOWS",title:"核心业务流程",pageId:"PG-IM-DOC",component:ys,livePath:"",frame:"doc"}]},{key:"machines",title:"状态机",pages:[{taskId:"IM-DOC-SM",title:"状态机与流转",pageId:"PG-IM-DOC",component:Us,livePath:"",frame:"doc"}]},{key:"message",title:"消息模块",pages:[{taskId:"IM-MSG-01",title:"消息中心",pageId:"PG-IM-001",component:Dt,livePath:"/h5/im/message",children:[{taskId:"IM-MSG-01-1",title:"系统通知列表",pageId:"PG-IM-001",component:Qe,livePath:"/h5/im/notify/system",staticQuery:{type:"system"}},{taskId:"IM-MSG-01-2",title:"群消息提醒列表",pageId:"PG-IM-001",component:Qe,livePath:"/h5/im/notify/group",staticQuery:{type:"group"}},{taskId:"IM-MSG-01-3",title:"全局搜索",pageId:"PG-IM-010",component:Et,livePath:"/h5/im/search"}]}]},{key:"contacts",title:"通讯录模块",pages:[{taskId:"IM-CON-01",title:"通讯录列表",pageId:"PG-IM-002",component:qe,livePath:"/h5/im/contacts",children:[{taskId:"IM-CON-01-1",title:"新的朋友",pageId:"PG-IM-003",component:At,livePath:"/h5/im/friend-requests"},{taskId:"IM-CON-01-2",title:"添加好友",pageId:"PG-IM-004",component:Tt,livePath:"/h5/im/friend/add"},{taskId:"IM-CON-01-3",title:"好友资料页",pageId:"PG-IM-005",component:Nt,livePath:"/h5/im/friend/u-f-01",staticQuery:{userId:"u-f-01"},children:[{taskId:"IM-CON-01-3-0",title:"删除好友后：被删方发消息失败",pageId:"PG-IM-008",component:Y,livePath:"/h5/im/chat/c2c-u-f-01",staticQuery:{convId:"c2c-u-f-01",initialNotFriend:!0}},{taskId:"IM-CON-01-3-1",title:"朋友设置",pageId:"PG-IM-006",component:$t,livePath:"/h5/im/friend/u-f-01/settings",staticQuery:{userId:"u-f-01"}}]},{taskId:"IM-CON-01-5",title:"黑名单列表",pageId:"PG-IM-002",component:qe,livePath:"/h5/im/contacts",staticQuery:{initialTab:"blacklist"}},{taskId:"IM-CON-01-4",title:"头像资料弹层",pageId:"PG-IM-002",component:rs,livePath:"/h5/im/contacts"}]},{taskId:"IM-CON-02",title:"注销账号（APP上架合规）",pageId:"PG-IM-022",component:Kt,livePath:"/h5/im/account/close"}]},{key:"group",title:"群聊模块",pages:[{taskId:"IM-GRP-00",title:"三类群功能和操作权限",pageId:"PG-IM-DOC",component:hi,livePath:"",frame:"doc"},{taskId:"IM-GRP-01",title:"我的群聊",pageId:"PG-IM-007",component:Ft,livePath:"/h5/im/groups"},{taskId:"IM-GRP-02",title:"聊天会话（服务群）",pageId:"PG-IM-008",component:Y,livePath:"/h5/im/chat/g-svc-u-c-02",staticQuery:{convId:"g-svc-u-c-02"},children:[{taskId:"IM-GRP-02-1",title:"订单选择器",pageId:"PG-IM-008",component:Y,livePath:"/h5/im/chat/g-svc-u-c-02",staticQuery:{convId:"g-svc-u-c-02",initialPanel:"orders"}},{taskId:"IM-GRP-02-2",title:"表情面板",pageId:"PG-IM-008",component:je,livePath:"/h5/im/chat/g-svc-u-c-02"},{taskId:"IM-GRP-02-3",title:"⊕ 更多功能面板",pageId:"PG-IM-008",component:Y,livePath:"/h5/im/chat/g-svc-u-c-02",staticQuery:{convId:"g-svc-u-c-02",initialPanel:"plus"}},{taskId:"IM-GRP-02-4",title:"售后详情面板",pageId:"PG-IM-008",component:ls,livePath:"/h5/im/chat/g-svc-u-c-02"},{taskId:"IM-GRP-02-5",title:"发起售后页",pageId:"PG-IM-021",component:qt,livePath:"/h5/im/aftersale/apply",staticQuery:{orderId:"OD20260828006",convId:"g-svc-u-c-02"}},{taskId:"IM-GRP-02-6",title:"举报弹窗（群设置→举报）",pageId:"PG-IM-009",component:z,livePath:"/h5/im/group/g-svc-u-c-02/settings",staticQuery:{groupId:"g-svc-u-c-02",initialModal:"report"}}]},{taskId:"IM-GRP-04",title:"聊天会话（单聊）",pageId:"PG-IM-008",component:Y,livePath:"/h5/im/chat/c2c-u-f-04",staticQuery:{convId:"c2c-u-f-04"},children:[{taskId:"IM-GRP-04-1",title:"表情面板",pageId:"PG-IM-008",component:je,livePath:"/h5/im/chat/c2c-u-f-04"},{taskId:"IM-GRP-04-2",title:"举报弹窗（右上角⋯→举报）",pageId:"PG-IM-008",component:Y,livePath:"/h5/im/chat/c2c-u-f-04",staticQuery:{convId:"c2c-u-f-04",initialModal:"report"}}]},{taskId:"IM-GRP-05",title:"群设置",pageId:"PG-IM-009",component:z,livePath:"/h5/im/group/g-svc-u-c-02/settings",staticQuery:{groupId:"g-svc-u-c-02"},children:[{taskId:"IM-GRP-05-1",title:"邀请二维码卡",pageId:"PG-IM-009",component:z,livePath:"/h5/im/group/g-svc-u-c-02/settings",staticQuery:{groupId:"g-svc-u-c-02",initialModal:"invite"}},{taskId:"IM-GRP-05-2",title:"发布公告弹层",pageId:"PG-IM-009",component:z,livePath:"/h5/im/group/g-svc-u-c-02/settings",staticQuery:{groupId:"g-svc-u-c-02",initialModal:"announce"}},{taskId:"IM-GRP-05-3",title:"公告历史弹层",pageId:"PG-IM-009",component:z,livePath:"/h5/im/group/g-svc-u-c-02/settings",staticQuery:{groupId:"g-svc-u-c-02",initialModal:"announceList"}},{taskId:"IM-GRP-05-4",title:"管理员设置弹层（通用群）",pageId:"PG-IM-009",component:z,livePath:"/h5/im/group/g-common-store-1/settings",staticQuery:{groupId:"g-common-store-1",initialModal:"admin"}},{taskId:"IM-GRP-05-5",title:"解散群确认弹层",pageId:"PG-IM-009",component:z,livePath:"/h5/im/group/g-svc-u-c-02/settings",staticQuery:{groupId:"g-svc-u-c-02",initialModal:"dissolve"}},{taskId:"IM-GRP-05-6",title:"修改群名称弹层",pageId:"PG-IM-009",component:z,livePath:"/h5/im/group/g-svc-u-c-02/settings",staticQuery:{groupId:"g-svc-u-c-02",initialModal:"rename"}},{taskId:"IM-GRP-05-7",title:"举报弹窗（群设置→举报）",pageId:"PG-IM-009",component:z,livePath:"/h5/im/group/g-svc-u-c-02/settings",staticQuery:{groupId:"g-svc-u-c-02",initialModal:"report"}}]},{taskId:"IM-GRP-06",title:"扫码加入群",pageId:"PG-IM-015",component:Vt,livePath:"/h5/im/join/g-staff-u-clerk-1-store-1",staticQuery:{groupId:"g-staff-u-clerk-1-store-1"}},{taskId:"IM-GRP-07",title:"绑定结果（绑定自动入客户群）",pageId:"PG-IM-016",component:Ot,livePath:"/h5/im/pay-result"},{taskId:"IM-GRP-08",title:"商品详情（联系客服·咨询建群）",pageId:"PG-IM-019",component:Qt,livePath:"/h5/im/consult-entry"}]},{key:"live",title:"直播模块（本期不开发）",pages:[{taskId:"IM-LIVE-01",title:"纯直播间",pageId:"PG-IM-012",component:Lt,livePath:"/h5/im/live/room-demo-1",staticQuery:{roomId:"room-demo-1"}},{taskId:"IM-LIVE-02",title:"直播推广（分享发起）",pageId:"PG-IM-017",component:Ke,livePath:"/h5/im/live-promo",children:[{taskId:"IM-LIVE-02-1",title:"分享目标选择弹层",pageId:"PG-IM-017",component:Ke,livePath:"/h5/im/live-promo",staticQuery:{initialShare:!0}}]},{taskId:"IM-LIVE-03",title:"群发记录",pageId:"PG-IM-018",component:zt,livePath:"/h5/im/live-promo/records"}]},{key:"admin",title:"租户后台（PC）",pages:[{taskId:"IM-ADM-01",title:"门店管理（更换店长·禁用·启用提示）",pageId:"PG-IM-020",component:ee,livePath:"/admin/im/stores",frame:"pc",children:[{taskId:"IM-ADM-01-1",title:"更换店长弹窗（群联动确认）",pageId:"PG-IM-020",component:ee,livePath:"/admin/im/stores",frame:"pc",staticQuery:{initialModal:"changeManager"}},{taskId:"IM-ADM-01-2",title:"禁用提示弹窗（v2.0 不解散群）",pageId:"PG-IM-020",component:ee,livePath:"/admin/im/stores",frame:"pc",staticQuery:{initialModal:"disable"}},{taskId:"IM-ADM-01-3",title:"启用提示弹窗（默认不恢复群聊）",pageId:"PG-IM-020",component:ee,livePath:"/admin/im/stores",frame:"pc",staticQuery:{initialModal:"enable"}},{taskId:"IM-ADM-01-4",title:"启用提示弹窗（勾选群聊回复）",pageId:"PG-IM-020",component:ee,livePath:"/admin/im/stores",frame:"pc",staticQuery:{initialModal:"enable",resumeOn:!0}},{taskId:"IM-ADM-01-5",title:"黑名单管理（店员/店长拉黑客户）",pageId:"PG-IM-020",component:ee,livePath:"/admin/im/stores",frame:"pc",staticQuery:{initialTab:"blacklist"}}]},{taskId:"IM-ADM-02",title:"门店成员（修改身份·更换门店·转为客户·禁启用）",pageId:"PG-IM-020",component:te,livePath:"/admin/im/stores/members",frame:"pc",children:[{taskId:"IM-ADM-02-1",title:"修改身份弹窗（店员↔店长·群联动）",pageId:"PG-IM-020",component:te,livePath:"/admin/im/stores/members",frame:"pc",staticQuery:{initialAction:"role_switch"}},{taskId:"IM-ADM-02-2",title:"更换门店弹窗（跨店调任·群联动）",pageId:"PG-IM-020",component:te,livePath:"/admin/im/stores/members",frame:"pc",staticQuery:{initialAction:"transfer_store"}},{taskId:"IM-ADM-02-3",title:"转为客户弹窗（退出任职·群联动）",pageId:"PG-IM-020",component:te,livePath:"/admin/im/stores/members",frame:"pc",staticQuery:{initialAction:"to_customer"}},{taskId:"IM-ADM-02-4",title:"店员禁用提示弹窗（不解散群）",pageId:"PG-IM-020",component:te,livePath:"/admin/im/stores/members",frame:"pc",staticQuery:{initialAction:"disable_staff"}},{taskId:"IM-ADM-02-5",title:"店员启用提示弹窗（勾选群聊回复）",pageId:"PG-IM-020",component:te,livePath:"/admin/im/stores/members",frame:"pc",staticQuery:{initialAction:"enable_staff"}}]}]}],sa=A({__name:"ProtoViewerPage",setup(n){const e=Wt(),t=tt();return ce(()=>{e.getRoom("room-demo-1")||e.startRoom("room-demo-1","u-clerk-1","g-svc-u-c-02","store-1")}),(r,s)=>(g(),V(Yn,{title:"通讯录原型查看工具",sub:"静态页面 · 需求注释",tree:B(gi),cards:B(Bt),"rule-resolver":B(wt),personas:B(yt),"active-persona-id":B(t).activeUserId,"persona-label":B(t).activePersona.label,"initial-node-id":"IM-MSG-01","prd-node-id":"IM-DOC-PRD",onSwitchPersona:B(t).switchPersona},null,8,["tree","cards","rule-resolver","personas","active-persona-id","persona-label","onSwitchPersona"]))}});export{sa as default};
