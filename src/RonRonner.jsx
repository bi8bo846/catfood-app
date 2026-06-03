import React, { useState, useEffect } from "react";

var P = {
  bg:"#F4F0EA", card:"#F1EEE8", block:"#F7F3EC",
  ink:"#51463D", muted:"#9A8D80", border:"#E1DAD1",
  input:"#FAF8F4", btn:"#8F7A66", red:"#E57373",
  gText:"#2D7A4F", aText:"#8A6A2A", rText:"#B91C1C",
  gBorder:"#B7DFC7", aBorder:"#F5E6CC", rBorder:"#FCCACA",
  gBg:"#F0FAF4", aBg:"#FEF9F0", rBg:"#FEF2F2"
};

// ─── Storage Layer ────────────────────────────────────────────
// loadStorage / saveStorage: unified API, safe for PWA offline use
function loadStorage(key,fallback){
  try{
    var v=localStorage.getItem(key);
    if(v===null||v===undefined||v==="")return fallback;
    var parsed=JSON.parse(v);
    // 防止空值意外覆蓋：若資料為空陣列/物件但 fallback 有值，仍回傳 parsed
    return parsed;
  }catch(e){
    return fallback;
  }
}
function saveStorage(key,val){
  try{
    localStorage.setItem(key,JSON.stringify(val));
  }catch(e){
    // QuotaExceededError or SecurityError in private browsing
    // Silently fail - data still in memory for this session
  }
}
// Backward-compatible aliases
var lsGet=loadStorage;
var lsSet=saveStorage;

function Btn(props){var style=Object.assign({padding:"9px 18px",borderRadius:10,border:"none",background:P.btn,color:"#fff",fontSize:14,cursor:"pointer",fontWeight:600},props.style||{});return <button type="button" onClick={props.onClick} style={style}>{props.children}</button>;}
function BtnGhost(props){var style=Object.assign({padding:"9px 18px",borderRadius:10,border:"1px solid "+P.border,background:"transparent",color:P.ink,fontSize:14,cursor:"pointer"},props.style||{});return <button type="button" onClick={props.onClick} style={style}>{props.children}</button>;}
function TextInput(props){return <input type={props.type||"text"} value={props.value} onChange={props.onChange} placeholder={props.placeholder||""} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid "+P.border,background:P.input,color:P.ink,fontSize:14,boxSizing:"border-box"}}/>;}
function Label(props){return <div style={{fontSize:12,color:P.muted,marginBottom:4,fontWeight:500}}>{props.children}</div>;}
function FieldRow(props){return <div style={{marginBottom:14}}><Label>{props.label}</Label>{props.children}</div>;}
function Modal(props){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:100,display:"flex",alignItems:"flex-end"}}>
      <div style={{background:P.card,borderRadius:"20px 20px 0 0",width:"100%",maxHeight:"85vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"20px 16px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:16,fontWeight:700,color:P.ink}}>{props.title}</div>
          <button type="button" onClick={props.onClose} style={{background:"none",border:"none",fontSize:20,color:P.muted,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"0 16px 16px"}}>{props.children}</div>
        {!props.hideFooter&&(
          <div style={{display:"flex",gap:8,padding:"12px 16px 80px",borderTop:"1px solid "+P.border}}>
            <BtnGhost onClick={props.onClose} style={{flex:1}}>取消</BtnGhost>
            <Btn onClick={props.onSave} style={{flex:1}}>{props.saveLabel||"儲存"}</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
function SwipeRow(props){
  var onDelete=props.onDelete,onEdit=props.onEdit;
  var [offset,setOffset]=React.useState(0),[dragging,setDragging]=React.useState(false);
  var startX=React.useRef(0),REVEAL=onEdit?152:80;
  function onTS(e){startX.current=e.touches[0].clientX;setDragging(true);}
  function onTM(e){if(!dragging)return;var dx=e.touches[0].clientX-startX.current;if(dx>0){setOffset(0);return;}setOffset(Math.max(dx,-REVEAL));}
  function onTE(){setDragging(false);if(offset<-(REVEAL/2)){setOffset(-REVEAL);}else{setOffset(0);}}
  function close(){setOffset(0);}
  return(
    <div style={{position:"relative",overflow:"hidden",borderRadius:14,marginBottom:8}}>
      <div style={{position:"absolute",right:0,top:0,bottom:0,display:"flex",alignItems:"stretch"}}>
        {onEdit&&<button type="button" onClick={function(){close();onEdit();}} style={{width:76,border:"none",background:"#F6F1E8",color:"#8A6A2A",fontSize:12,fontWeight:600,cursor:"pointer"}}>✏️ 編輯</button>}
        <button type="button" onClick={function(){close();onDelete();}} style={{width:76,border:"none",background:"#F9EFEF",color:"#B91C1C",fontSize:12,fontWeight:600,cursor:"pointer"}}>🗑 刪除</button>
      </div>
      <div onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE} style={{transform:"translateX("+offset+"px)",transition:dragging?"none":"transform 0.2s ease",position:"relative",zIndex:1}}>{props.children}</div>
    </div>
  );
}



function Lightbox(props){
  var photos=props.photos,onClose=props.onClose;
  var [cur,setCur]=React.useState(props.index||0);
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:300,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <button type="button" onClick={onClose} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",fontSize:22,width:40,height:40,borderRadius:"50%",cursor:"pointer"}}>×</button>
      <img src={photos[cur]} onClick={function(e){e.stopPropagation();}} style={{maxWidth:"90vw",maxHeight:"75vh",objectFit:"contain",borderRadius:8}}/>
      {photos.length>1&&(
        <div style={{display:"flex",gap:8,marginTop:12}}>
          {photos.map(function(p,i){return <img key={i} src={p} onClick={function(e){e.stopPropagation();setCur(i);}} style={{width:48,height:48,objectFit:"cover",borderRadius:6,border:cur===i?"2px solid #fff":"2px solid transparent",cursor:"pointer",opacity:cur===i?1:0.5}}/>;}) }
        </div>
      )}
      <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginTop:8}}>{cur+1} / {photos.length}</div>
    </div>
  );
}

function RecordDetailPage(props){
  var rec=props.rec,onBack=props.onBack,onEdit=props.onEdit,onDelete=props.onDelete;
  var cats=props.cats||[];
  var [lightboxIdx,setLightboxIdx]=React.useState(null);
  var photos=rec.photos||[];
  return(
    <div style={{position:"fixed",inset:0,background:P.bg,zIndex:150,overflowY:"auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:P.card,borderBottom:"1px solid "+P.border,position:"sticky",top:0,zIndex:2}}>
        <button type="button" onClick={onBack} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:P.muted}}>←</button>
        <div style={{fontSize:15,fontWeight:700,color:P.ink}}>{rec.type}</div>
        <div style={{display:"flex",gap:8}}>
          <button type="button" onClick={onEdit} style={{background:"none",border:"none",fontSize:14,cursor:"pointer",color:P.muted}}>編輯</button>
          <button type="button" onClick={onDelete} style={{background:"none",border:"none",fontSize:14,cursor:"pointer",color:P.red}}>刪除</button>
        </div>
      </div>
      <div style={{padding:"16px"}}>
        <div style={{background:P.card,borderRadius:16,border:"1px solid "+P.border,padding:"14px",marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:13,color:P.muted}}>類型</span><span style={{fontSize:13,fontWeight:600,color:P.ink}}>{rec.type}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:(rec.catIds||[]).length>0?8:0}}>
            <span style={{fontSize:13,color:P.muted}}>日期</span><span style={{fontSize:13,color:P.ink}}>{rec.date}</span>
          </div>
          {(rec.catIds||[]).length>0&&(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <span style={{fontSize:13,color:P.muted}}>相關貓咪</span>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
                {(rec.catIds||[]).map(function(cid){var cat=cats.find(function(c){return c.id===cid;});return cat?<span key={cid} style={{fontSize:12,background:P.block,borderRadius:10,padding:"2px 8px",color:P.ink}}>{cat.name}</span>:null;})}
              </div>
            </div>
          )}
          {rec.type==="🏥 體檢"&&(rec.hospital||rec.doctor||rec.bodyWeight)&&(
            <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid "+P.border}}>
              {rec.hospital&&<div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:13,color:P.muted}}>醫院</span><span style={{fontSize:13,color:P.ink}}>{rec.hospital}</span>🥫</div>}
              {rec.doctor&&<div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:13,color:P.muted}}>醫師</span><span style={{fontSize:13,color:P.ink}}>{rec.doctor}</span>🥫</div>}
              {rec.bodyWeight&&<div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:13,color:P.muted}}>當日體重</span><span style={{fontSize:13,fontWeight:600,color:P.ink}}>{rec.bodyWeight} kg</span>🥫</div>}
            </div>
          )}
          {rec.type==="💉 疫苗"&&(rec.vaccineType||rec.hospital||rec.batchNo||rec.nextDate)&&(
            <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid "+P.border}}>
              {rec.vaccineType&&<div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:13,color:P.muted}}>疫苗種類</span><span style={{fontSize:13,color:P.ink,fontWeight:600}}>{(rec.vaccineType==="其他（自訂）"||rec.vaccineType==="其他")?rec.vaccineCustom||rec.vaccineType:rec.vaccineType}</span>🥫</div>}
              {rec.hospital&&<div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:13,color:P.muted}}>醫院</span><span style={{fontSize:13,color:P.ink}}>{rec.hospital}</span>🥫</div>}
              {rec.batchNo&&<div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:13,color:P.muted}}>批號</span><span style={{fontSize:13,color:P.ink}}>{rec.batchNo}</span>🥫</div>}
              {rec.nextDate&&<div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:13,color:P.muted}}>下次施打</span><span style={{fontSize:13,color:P.btn,fontWeight:600}}>{rec.nextDate}</span>🥫</div>}
            </div>
          )}
          {rec.type==="🐛 驅蟲"&&(rec.dewormType||rec.dewormBrand||rec.dewormNextDate)&&(
            <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid "+P.border}}>
              {rec.dewormType&&<div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:13,color:P.muted}}>驅蟲類型</span><span style={{fontSize:13,color:P.ink,fontWeight:600}}>{rec.dewormType}</span>🥫</div>}
              {rec.dewormBrand&&<div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:13,color:P.muted}}>品牌</span><span style={{fontSize:13,color:P.ink}}>{rec.dewormBrand==="其他（自訂）"?rec.dewormBrandCustom||rec.dewormBrand:rec.dewormBrand}</span>🥫</div>}
              {rec.dewormNextDate&&<div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:13,color:P.muted}}>下次驅蟲</span><span style={{fontSize:13,color:P.btn,fontWeight:600}}>{rec.dewormNextDate}</span>🥫</div>}
            </div>
          )}
        </div>
        {Object.keys(rec.bloodVals||{}).length>0&&rec.type==="🏥 體檢"&&(
          <BloodAISection bloodVals={rec.bloodVals} groups={BLOOD_GROUPS}/>
        )}
        {rec.note&&<div style={{background:P.card,borderRadius:16,border:"1px solid "+P.border,padding:"14px",marginBottom:8}}><div style={{fontSize:12,color:P.muted,marginBottom:4}}>備註</div><div style={{fontSize:14,color:P.ink,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{rec.note}</div>🥫</div>}
        {Object.keys(rec.bloodVals||{}).length>0&&rec.type==="🏥 體檢"&&(
          <div style={{background:P.card,borderRadius:16,border:"1px solid "+P.border,padding:"14px",marginBottom:8}}>
            <div style={{fontSize:12,color:P.muted,marginBottom:10}}>血檢數值</div>
            {BLOOD_GROUPS.map(function(grp){
              var filledItems=grp.items.filter(function(it){var e=(rec.bloodVals||{})[it.key];return e&&e.val!==undefined&&e.val!=="";});
              if(filledItems.length===0)return null;
              return(
                <div key={grp.group} style={{marginBottom:10}}>
                  <div style={{fontSize:12,color:P.ink,fontWeight:700,marginBottom:8,marginTop:4}}>{grp.group}</div>
                  {filledItems.map(function(it){return <BloodRow key={it.key} it={it} val={(rec.bloodVals||{})[it.key]}/>;}) }
                </div>
              );
            })}
          </div>
        )}
        {photos.length>0&&(
          <div style={{background:P.card,borderRadius:16,border:"1px solid "+P.border,padding:"14px"}}>
            <div style={{fontSize:12,color:P.muted,marginBottom:8}}>照片</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {photos.map(function(p,i){return <img key={i} src={p} onClick={function(){setLightboxIdx(i);}} style={{width:80,height:80,objectFit:"cover",borderRadius:10,border:"1px solid "+P.border,cursor:"pointer"}}/>;}) }
            </div>
          </div>
        )}
      </div>
      {lightboxIdx!==null&&<Lightbox photos={photos} index={lightboxIdx} onClose={function(){setLightboxIdx(null);}}/>}
    </div>
  );
}

// ─── BLOOD GROUPS ────────────────────────────────────
var BLOOD_GROUPS = [
  {group:"CBC 全血球計數",items:[
    {key:"RBC",label:"RBC",zh:"紅血球",unit:"M/μL",lo:5.65,hi:8.87},
    {key:"HCT",label:"HCT",zh:"血容比",unit:"%",lo:30.3,hi:52.3},
    {key:"HGB",label:"HGB",zh:"血紅素",unit:"g/dL",lo:9.8,hi:16.2},
    {key:"MCV",label:"MCV",zh:"平均紅血球體積",unit:"fL",lo:41.5,hi:52.8},
    {key:"MCH",label:"MCH",zh:"平均紅血球血紅素量",unit:"pg",lo:13.1,hi:17.4},
    {key:"MCHC",label:"MCHC",zh:"平均血球血紅素濃度",unit:"g/dL",lo:30.0,hi:36.0},
    {key:"RDW",label:"RDW",zh:"紅血球分布寬度",unit:"%",lo:14.0,hi:18.4},
    {key:"PRETICP",label:"％RETIC",zh:"網狀紅血球百分比",unit:"%",lo:null,hi:null},
    {key:"RETIC",label:"RETIC",zh:"網狀紅血球",unit:"K/μL",lo:null,hi:null},
    {key:"WBC",label:"WBC",zh:"白血球",unit:"K/μL",lo:2.87,hi:17.02},
    {key:"PNEUP",label:"％NEU",zh:"嗜中性球百分比",unit:"%",lo:null,hi:null},
    {key:"PLYMP",label:"％LYM",zh:"淋巴球百分比",unit:"%",lo:null,hi:null},
    {key:"PMONOP",label:"％MONO",zh:"單核球百分比",unit:"%",lo:null,hi:null},
    {key:"PEOSP",label:"％EOS",zh:"嗜酸性球百分比",unit:"%",lo:null,hi:null},
    {key:"PBASOP",label:"％BASO",zh:"嗜鹼性球百分比",unit:"%",lo:null,hi:null},
    {key:"NEU",label:"NEU",zh:"嗜中性球",unit:"K/μL",lo:1.48,hi:10.29},
    {key:"LYM",label:"LYM",zh:"淋巴球",unit:"K/μL",lo:0.92,hi:6.88},
    {key:"MONO",label:"MONO",zh:"單核球",unit:"K/μL",lo:0.05,hi:0.67},
    {key:"EOS",label:"EOS",zh:"嗜酸性球",unit:"K/μL",lo:0.0,hi:0.75},
    {key:"BASO",label:"BASO",zh:"嗜鹼性球",unit:"K/μL",lo:0.0,hi:0.1},
    {key:"PLT",label:"PLT",zh:"血小板",unit:"K/μL",lo:151,hi:600},
    {key:"MPV",label:"MPV",zh:"平均血小板體積",unit:"fL",lo:7.0,hi:12.9},
    {key:"PCT",label:"PCT",zh:"血小板容積比",unit:"%",lo:0.1,hi:0.6}
  ]},
  {group:"電解質",items:[
    {key:"Na",label:"Na",zh:"鈉",unit:"mmol/L",lo:149,hi:163},
    {key:"K",label:"K",zh:"鉀",unit:"mmol/L",lo:3.5,hi:5.8},
    {key:"Cl",label:"Cl",zh:"氯",unit:"mmol/L",lo:112,hi:129}
  ]},
  {group:"生化 CHEM",items:[
    {key:"GLU",label:"GLU",zh:"血糖",unit:"mg/dL",lo:74,hi:159},
    {key:"CREA",label:"CREA",zh:"肌酐",unit:"mg/dL",lo:0.8,hi:2.4},
    {key:"BUN",label:"BUN",zh:"尿素氮",unit:"mg/dL",lo:16,hi:36},
    {key:"BUNCEA",label:"BUN/CREA",zh:"血中尿素氮／肌酸酐",unit:"",lo:null,hi:null},
    {key:"PHOS",label:"PHOS",zh:"磷",unit:"mg/dL",lo:3.1,hi:7.5},
    {key:"Ca",label:"Ca",zh:"鈣",unit:"mg/dL",lo:8.2,hi:11.8},
    {key:"TP",label:"TP",zh:"總蛋白",unit:"g/dL",lo:5.7,hi:8.9},
    {key:"ALB",label:"ALB",zh:"白蛋白",unit:"g/dL",lo:2.3,hi:3.9},
    {key:"GLOB",label:"GLOB",zh:"球蛋白",unit:"g/dL",lo:2.6,hi:5.1},
    {key:"ALBGLOB",label:"ALB/GLOB",zh:"白蛋白／球蛋白",unit:"",lo:null,hi:null},
    {key:"ALT",label:"ALT",zh:"丙胺酸轉胺",unit:"U/L",lo:12,hi:130},
    {key:"ALKP",label:"ALKP",zh:"鹼性磷酸酶",unit:"U/L",lo:14,hi:111},
    {key:"GGT",label:"GGT",zh:"加瑪麩氨肌轉換酶",unit:"U/L",lo:0,hi:8},
    {key:"TBIL",label:"TBIL",zh:"總膽紅素",unit:"mg/dL",lo:0,hi:0.4},
    {key:"CHOL",label:"CHOL",zh:"膽固醇",unit:"mg/dL",lo:65,hi:225}
  ]},
  {group:"特殊項目",items:[
    {key:"SDMA",label:"SDMA",zh:"對稱二甲基精胺酸",unit:"μg/dL",lo:0,hi:14},
    {key:"TT4",label:"TT4",zh:"甲狀腺素",unit:"μg/dL",lo:0.8,hi:4.7},
    {key:"BNP",label:"BNP",zh:"心臟指標",unit:"pmol/L",lo:null,hi:100},
    {key:"FRU",label:"FRU",zh:"果糖胺",unit:"μmol/L",lo:190,hi:365},
    {key:"NH3",label:"NH3",zh:"氨",unit:"μmol/L",lo:0,hi:91},
    {key:"LAC",label:"LAC",zh:"乳酸",unit:"mmol/L",lo:0.5,hi:2.0}
  ]}
];

var VACCINE_ALL=["三合一","四合一","五合一","狂犬病","白血病（FeLV）","腹膜炎（FIP）","其他（自訂）"];
var DEWORM_TYPES=["體內","體外","內外合一"];
var DEWORM_BRANDS=["寵愛","寵愛 Plus","心疥爽","其他（自訂）"];

function BloodInput(props){
  var it=props.it,vals=props.vals,onChange=props.onChange;
  var entry=vals[it.key]||{};
  var val=entry.val||"";
  var lo=entry.lo!==undefined?entry.lo:it.lo;
  var hi=entry.hi!==undefined?entry.hi:it.hi;
  var unit=entry.unit||it.unit||"";
  var v=parseFloat(val);
  var hasRange=lo!==null||hi!==null;
  var isHi=hasRange&&!isNaN(v)&&hi!==null&&v>hi;
  var isLo=hasRange&&!isNaN(v)&&lo!==null&&v<lo;
  var tc=isHi?"#B91C1C":isLo?"#1D4ED8":P.ink;
  var bc=isHi?"#FCCACA":isLo?"#BFDBFE":P.border;
  var rangeStr="";
  if(lo!==null&&hi!==null)rangeStr=lo+"–"+hi;
  else if(hi!==null)rangeStr="<"+hi;
  else if(lo!==null)rangeStr=">"+lo;
  function setEntry(patch){onChange(it.key,Object.assign({val:val,lo:lo,hi:hi,unit:unit},patch));}
  return(
    <div style={{marginBottom:14}}>
      <div style={{fontSize:13,fontWeight:600,color:P.ink,marginBottom:rangeStr?2:6}}>{it.label}{it.zh?" "+it.zh:""}</div>
      {(it.lo!==null||it.hi!==null)&&(
        <div style={{display:"flex",alignItems:"center",marginBottom:6,fontSize:11,color:"#BDB6AD"}}>
          <span>參考：</span>
          <input type="number" step="any" defaultValue={lo!==null?lo:""} onBlur={function(e){setEntry({lo:e.target.value===""?null:Number(e.target.value)});}} style={{width:50,fontSize:11,color:"#BDB6AD",border:"1px dashed #E1DAD1",borderRadius:4,background:"transparent",padding:"1px 3px",margin:"0 1px",outline:"none"}}/>
          <span>–</span>
          <input type="number" step="any" defaultValue={hi!==null?hi:""} onBlur={function(e){setEntry({hi:e.target.value===""?null:Number(e.target.value)});}} style={{width:50,fontSize:11,color:"#BDB6AD",border:"1px dashed #E1DAD1",borderRadius:4,background:"transparent",padding:"1px 3px",margin:"0 1px",outline:"none"}}/>
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <input type="number" value={val} onChange={function(e){setEntry({val:e.target.value});}} style={{flex:1,height:44,padding:"0 12px",borderRadius:12,border:"1px solid "+bc,background:"#fff",color:tc,fontSize:15,fontWeight:600,boxSizing:"border-box"}}/>
        {unit&&<div style={{minWidth:60,fontSize:12,color:P.muted}}>{unit}</div>}
      </div>
    </div>
  );
}

function BloodRow(props){
  var it=props.it,entry=props.val;
  if(!entry||entry.val===undefined||entry.val==="")return null;
  var val=entry.val;
  var lo=entry.lo!==undefined?entry.lo:it.lo;
  var hi=entry.hi!==undefined?entry.hi:it.hi;
  var unit=entry.unit||it.unit||"";
  var v=parseFloat(val);
  var hasRange=lo!==null||hi!==null;
  var isHi=hasRange&&!isNaN(v)&&hi!==null&&v>hi;
  var isLo=hasRange&&!isNaN(v)&&lo!==null&&v<lo;
  var tc=isHi?"#B91C1C":isLo?"#1D4ED8":"#51463D";
  var arrow="";
  var rangeStr="";
  if(lo!==null&&hi!==null)rangeStr=lo+"–"+hi;
  else if(hi!==null)rangeStr="<"+hi;
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",paddingBottom:8,marginBottom:8,borderBottom:"1px solid "+P.block}}>
      <div style={{fontSize:13,fontWeight:600,color:P.ink,paddingTop:4}}>{it.label}{it.zh?" "+it.zh:""}</div>
      <div style={{textAlign:"right"}}>
        <div><span style={{fontSize:13,fontWeight:600,color:tc}}>{val}{arrow}</span><span style={{fontSize:12,color:P.muted,marginLeft:4}}>{unit}</span>🥫</div>
        {rangeStr&&<div style={{fontSize:11,color:"#BDB6AD"}}>參考：{rangeStr}</div>}
      </div>
    </div>
  );
}

var BLOOD_ITEM_INFO={
  RBC:{desc:"紅血球數量",hi:"可能與脫水或血液濃縮有關",lo:"可能與貧血或出血有關",note:"建議配合 HGB、HCT 一起判讀"},
  HCT:{desc:"血容比（紅血球體積佔比）",hi:"可能與脫水有關",lo:"可能與貧血有關",note:"建議配合 HGB、RBC 一起判讀"},
  HGB:{desc:"血紅素含量",hi:"可能與脫水或紅血球增多有關",lo:"可能與貧血有關",note:"評估攜氧能力的重要指標"},
  MCV:{desc:"平均紅血球體積",hi:"可能與大球性貧血或維生素B12缺乏有關",lo:"可能與缺鐵性貧血有關",note:"搭配 MCH、MCHC 一起評估"},
  MCH:{desc:"平均紅血球血紅素量",hi:"偶見於大球性貧血",lo:"可能與缺鐵有關",note:"搭配 MCV、MCHC 一起評估"},
  MCHC:{desc:"平均血球血紅素濃度",hi:"可能與溶血有關",lo:"可能與缺鐵性貧血有關",note:"搭配 MCV、MCH 一起評估"},
  RDW:{desc:"紅血球大小分布寬度",hi:"紅血球大小不均，常見於貧血恢復期或混合性原因",lo:"偏低通常無臨床意義",note:"偏高時建議追蹤其他紅血球指標"},
  RETIC:{desc:"網狀紅血球（新生紅血球比例）",hi:"可能代表骨髓正在積極造血",lo:"可能代表骨髓造血能力下降",note:"評估貧血是否有再生反應的重要指標"},
  WBC:{desc:"白血球總數",hi:"可能與感染、發炎或應激有關",lo:"可能與病毒感染或骨髓抑制有關",note:"建議配合分類白血球一起判讀"},
  NEU:{desc:"嗜中性球（抗菌主力）",hi:"可能與細菌感染或發炎有關",lo:"可能與骨髓抑制或嚴重感染有關",note:"偏低時需注意感染風險"},
  LYM:{desc:"淋巴球（免疫細胞）",hi:"可能與病毒感染或慢性刺激有關",lo:"可能與壓力或免疫抑制有關",note:"搭配 WBC 一起判讀"},
  MONO:{desc:"單核球（慢性發炎指標）",hi:"可能與慢性感染或發炎有關",lo:"偏低通常無特殊臨床意義",note:"持續偏高建議追蹤"},
  EOS:{desc:"嗜酸性球（過敏/寄生蟲指標）",hi:"可能與過敏、寄生蟲或嗜酸性球疾病有關",lo:"可能與急性應激或類固醇使用有關",note:"偏高時建議考慮驅蟲"},
  BASO:{desc:"嗜鹼性球",hi:"較少見，可能與過敏有關",lo:"偏低通常無臨床意義",note:"單獨異常意義有限"},
  PLT:{desc:"血小板數量",hi:"可能與發炎或缺鐵有關",lo:"可能與免疫性血小板減少或骨髓問題有關",note:"偏低時需注意出血風險"},
  MPV:{desc:"平均血小板體積",hi:"可能代表血小板更新加快",lo:"偏低通常無特殊意義",note:"建議配合 PLT 一起判讀"},
  PCT:{desc:"血小板容積比",hi:"可能與血小板數量或體積增加有關",lo:"可能與血小板偏低有關",note:"建議配合 PLT 一起判讀"},
  TP:{desc:"總蛋白",hi:"常見於脫水或慢性發炎",lo:"可能與蛋白質流失或肝臟合成不足有關",note:"建議配合 ALB、GLOB 一起判讀"},
  ALB:{desc:"白蛋白（主要血液蛋白）",hi:"常見於脫水",lo:"可能與肝臟疾病或腸道蛋白流失有關",note:"低白蛋白可能影響藥物結合與水腫"},
  GLOB:{desc:"球蛋白（免疫相關蛋白）",hi:"可能與慢性感染或免疫性疾病有關",lo:"可能與免疫功能下降有關",note:"建議配合 TP、ALB 一起判讀"},
  GLU:{desc:"血糖",hi:"可能與糖尿病、應激或飯後採血有關",lo:"可能與胰島素過量或長期禁食有關",note:"建議空腹重測確認"},
  CREA:{desc:"肌酸酐（腎臟過濾指標）",hi:"可能與腎臟功能下降有關",lo:"可能與肌肉量不足有關",note:"建議配合 BUN、SDMA 一起判讀"},
  BUN:{desc:"尿素氮（腎臟廢物）",hi:"可能與腎臟問題、脫水或高蛋白飲食有關",lo:"可能與肝臟功能異常有關",note:"建議配合 CREA 一起判讀"},
  PHOS:{desc:"磷",hi:"可能與腎臟功能下降有關",lo:"可能與飲食不均衡有關",note:"腎臟病患需特別注意"},
  Ca:{desc:"鈣",hi:"可能與惡性腫瘤或甲狀旁腺亢進有關",lo:"可能與低白蛋白或甲狀旁腺功能不足有關",note:"需排除假性高鈣血症"},
  ALT:{desc:"丙胺酸轉胺酶（肝細胞指標）",hi:"可能與肝細胞受損、發炎或藥物影響有關",lo:"偏低通常無臨床意義",note:"最常用的肝臟損傷指標"},
  ALKP:{desc:"鹼性磷酸酶",hi:"可能與肝臟疾病、骨骼或類固醇有關",lo:"偏低通常無特殊意義",note:"建議配合 ALT、GGT 一起判讀"},
  GGT:{desc:"麩胺醯轉移酶（膽道指標）",hi:"可能與膽道問題或肝臟疾病有關",lo:"偏低通常無臨床意義",note:"偏高時建議評估膽道狀況"},
  TBIL:{desc:"總膽紅素",hi:"可能與溶血、肝臟疾病或膽道阻塞有關",lo:"偏低通常無臨床意義",note:"偏高時觀察是否有黃疸跡象"},
  CHOL:{desc:"膽固醇",hi:"可能與甲狀腺功能低下或高脂飲食有關",lo:"可能與肝臟疾病有關",note:"需配合臨床症狀判讀"},
  SDMA:{desc:"對稱性二甲基精胺酸（早期腎臟指標）",hi:"可能是腎功能早期下降的敏感指標",lo:"偏低通常無臨床意義",note:"比 CREA 更早反映腎臟變化"},
  TT4:{desc:"甲狀腺素",hi:"可能與甲狀腺功能亢進有關（老貓常見）",lo:"可能與甲狀腺功能低下有關",note:"老年貓建議定期檢測"},
  BNP:{desc:"心肌利鈉胜肽（心臟指標）",hi:"可能與心臟疾病或心臟負荷增加有關",lo:"偏低通常無臨床意義",note:"偏高時建議評估心臟功能"},
  FRU:{desc:"果糖胺（2-3週血糖平均）",hi:"代表過去2-3週血糖控制不佳",lo:"偏低通常無臨床意義",note:"比單次血糖更能反映長期血糖狀況"},
  NH3:{desc:"血氨",hi:"可能與肝臟功能嚴重受損有關",lo:"偏低通常無臨床意義",note:"偏高時建議盡快就醫"},
  LAC:{desc:"乳酸",hi:"可能與組織缺氧或循環障礙有關",lo:"偏低通常無臨床意義",note:"偏高時建議盡快就醫"}
};

function AnomalyList(props){
  var anomalies=props.anomalies||[];
  var bloodRules=props.bloodRules||{};
  var [openKey,setOpenKey]=React.useState(null);

  return(
    <div style={{background:P.card,borderRadius:16,border:"1px solid "+P.border,padding:"14px",marginBottom:8}}>
      <div style={{fontSize:13,fontWeight:700,color:P.ink,marginBottom:10}}>⚠️ 異常項目（{anomalies.length}）</div>
      {anomalies.map(function(a,idx){
        var info=bloodRules[a.key];
        var isOpen=openKey===a.key;
        return(
          <div key={idx} style={{borderBottom:idx<anomalies.length-1?"1px solid "+P.border:"none"}}>
            <div onClick={function(){setOpenKey(isOpen?null:a.key);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:13,fontWeight:500,color:P.ink}}>{a.label}</span>
                <span style={{fontSize:11,color:P.muted}}>{a.zh}</span>
                {info&&<span style={{fontSize:10,color:P.muted}}>{isOpen?"▲":"▼"}</span>}
              </div>
              <span style={{fontSize:13,fontWeight:700,color:a.isHi?"#B91C1C":"#1D4ED8",whiteSpace:"nowrap",marginLeft:8}}>{a.val} {a.unit} {a.dir}</span>
            </div>
            {isOpen&&info&&(
              <div style={{background:P.block,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                <div style={{fontSize:12,color:P.muted,marginBottom:4}}>{info.desc}</div>
                <div style={{fontSize:12,color:P.ink,marginBottom:3}}>
                  <span style={{fontWeight:600,color:a.isHi?"#B91C1C":"#1D4ED8"}}>常見原因：</span>
                  {a.isHi?info.hi:info.lo}
                </div>
                <div style={{fontSize:12,color:P.muted}}>
                  <span style={{fontWeight:600}}>判讀重點：</span>{info.note}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BloodAISection(props){
  var bloodVals=props.bloodVals||{};
  var groups=props.groups||[];
  var [showAnalysis,setShowAnalysis]=React.useState(false);

  // AIAnalysisService 接口（未來接 /api/analyze 時替換此處）
  var AIAnalysisService={mode:"local"};

  var SYSTEMS=[
    {id:"rbc",keys:["RBC","HCT","HGB","MCV","MCH","MCHC","RDW","RETIC"]},
    {id:"wbc",keys:["WBC","NEU","LYM","MONO","EOS","BASO"]},
    {id:"plt",keys:["PLT","MPV","PCT"]},
    {id:"protein",keys:["TP","ALB","GLOB"]},
    {id:"kidney",keys:["CREA","BUN","SDMA"]},
    {id:"liver",keys:["ALT","ALKP","GGT","TBIL"]},
    {id:"elec",keys:["Na","K","Cl","Ca","PHOS"]},
    {id:"chem",keys:["GLU","CHOL","FRU","NH3","LAC"]},
    {id:"special",keys:["TT4","BNP"]}
  ];

  // 收集異常
  var anomalies=[];
  groups.forEach(function(grp){
    grp.items.forEach(function(it){
      var e=bloodVals[it.key];
      if(!e||e.val===undefined||e.val===null||e.val===""||e.val==="—"||e.val==="-1")return;
      var v=parseFloat(e.val);
      if(isNaN(v))return;
      var lo=(e.lo!==undefined&&e.lo!==null)?e.lo:it.lo;
      var hi=(e.hi!==undefined&&e.hi!==null)?e.hi:it.hi;
      var isHi=(hi!==null&&hi!==undefined&&v>hi);
      var isLo=(lo!==null&&lo!==undefined&&v<lo);
      if(!isHi&&!isLo)return;
      var sid="other";
      SYSTEMS.forEach(function(s){if(s.keys.indexOf(it.key)>=0)sid=s.id;});
      anomalies.push({key:it.key,label:it.label,zh:it.zh,unit:e.unit||it.unit||"",val:v,dir:isHi?"↑":"↓",isHi:isHi,sid:sid});
    });
  });

  if(anomalies.length===0){return(
    <div style={{background:"#F0FAF4",border:"1px solid #B7DFC7",borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:18}}>✅</span>
      <span style={{fontSize:13,color:"#2D7A4F",fontWeight:500}}>所有檢測項目均在參考範圍內</span>
    </div>
  );}

  // 判讀引擎：每個 card = {emoji, title, body}
  function buildCards(a){
    var cards=[];
    function has(k,d){return a.some(function(x){return x.key===k&&(d==="hi"?x.isHi:!x.isHi);})}
    function sid(s){return a.filter(function(x){return x.sid===s;})}
    function ns(keys,d){return a.filter(function(x){return keys.indexOf(x.key)>=0&&(d==="hi"?x.isHi:!x.isHi);}).map(function(x){return x.label;}).join("、");}

    // 水分/脫水
    var hiRBC=has("RBC","hi")||has("HCT","hi")||has("HGB","hi");
    var hiProt=has("TP","hi")||has("ALB","hi");
    if(hiRBC&&hiProt){
      var nn=[];
      if(has("RBC","hi"))nn.push("RBC");if(has("HCT","hi"))nn.push("HCT");if(has("HGB","hi"))nn.push("HGB");
      if(has("TP","hi"))nn.push("TP");if(has("ALB","hi"))nn.push("ALB");
      cards.push({emoji:"💧",title:"水分狀況",body:nn.join("、")+"同時偏高，\n常見於飲水不足或輕度脫水。"});
    } else if(hiProt&&!hiRBC){
      var nn=[];if(has("TP","hi"))nn.push("TP");if(has("ALB","hi"))nn.push("ALB");
      cards.push({emoji:"🥚",title:"蛋白質指標",body:nn.join("、")+"偏高，\n可能與脫水或慢性發炎有關。"});
    } else if(has("ALB","lo")){
      cards.push({emoji:"🥚",title:"蛋白質指標",body:"ALB（白蛋白）偏低，\n可能與肝臟疾病或腸道蛋白流失有關，\n建議後續追蹤。"});
    }

    // 紅血球（排除已在水分卡出現的）
    var rbcItems=sid("rbc");
    if(rbcItems.length>0){
      var loCount=rbcItems.filter(function(x){return !x.isHi;}).length;
      var hiCount=rbcItems.filter(function(x){return x.isHi;}).length;
      var hasRDWhi=has("RDW","hi");
      var hasMCVlo=has("MCV","lo")||has("MCH","lo");
      var hasHGBlo=has("HGB","lo")||has("HCT","lo")||has("RBC","lo");
      // 如果 RBC↑ 已被水分卡處理，只處理其餘
      var remainRBC=rbcItems.filter(function(x){
        if((hiRBC&&hiProt)&&(x.key==="RBC"||x.key==="HCT"||x.key==="HGB")&&x.isHi)return false;
        return true;
      });
      if(remainRBC.length>0){
        var body="";
        if(hasHGBlo&&hasMCVlo){
          body=ns(["HGB","HCT","RBC"],"lo")+"偏低，"+ns(["MCV","MCH","MCHC"],"lo")+"偏低，\n代表紅血球數量與體積同時下降，\n常見於缺鐵性貧血，建議後續追蹤。";
        } else if(hasHGBlo){
          body=ns(["HGB","HCT","RBC"],"lo")+"偏低，\n可能與貧血有關，建議觀察黏膜顏色與精神狀態。";
        } else if(hasMCVlo&&hasRDWhi){
          body=ns(["MCV","MCH"],"lo")+"偏低且 RDW 偏高，\n代表紅血球大小與血紅素含量出現變化，\n建議後續追蹤。";
        } else if(hasMCVlo){
          body=ns(["MCV","MCH","MCHC"],"lo")+"偏低，\n代表紅血球體積較小，建議搭配其他指標一起評估。";
        } else if(hasRDWhi){
          body="RDW 偏高，\n代表紅血球大小不均，建議持續追蹤。";
        } else {
          body=remainRBC.map(function(x){return x.label+(x.isHi?"↑":"↓");}).join("、")+"，\n建議持續追蹤。";
        }
        if(body)cards.push({emoji:"🩸",title:"紅血球變化",body:body});
      }
    }

    // 白血球
    var wbcItems=sid("wbc");
    if(wbcItems.length>0){
      var hiW=wbcItems.filter(function(x){return x.isHi;});
      var loW=wbcItems.filter(function(x){return !x.isHi;});
      var body="";
      if(hiW.length>=1&&(has("WBC","hi")||has("NEU","hi"))){
        body=hiW.map(function(x){return x.label+"↑";}).join("、")+"，\n可能與感染或發炎有關，建議觀察精神與體溫。";
      } else if(loW.length>=2){
        body=loW.map(function(x){return x.label+"↓";}).join("、")+"偏低，\n若精神食慾正常可持續觀察；\n若有異狀請盡快就醫。";
      } else {
        body=wbcItems.map(function(x){return x.label+(x.isHi?"↑":"↓");}).join("、")+"，\n建議結合臨床症狀判讀。";
      }
      cards.push({emoji:"🛡️",title:"白血球指標",body:body});
    }

    // 血小板
    var pltItems=sid("plt");
    if(pltItems.length>0){
      var body="";
      if(has("PLT","lo")){
        body="PLT（血小板）偏低，\n需注意是否有異常出血，建議盡快與獸醫討論。";
      } else {
        body=pltItems.map(function(x){return x.label+(x.isHi?"↑":"↓");}).join("、")+"，\n需搭配血小板數量一起評估。";
      }
      cards.push({emoji:"🟣",title:"血小板指標",body:body});
    }

    // 腎臟
    var kidneyItems=sid("kidney");
    if(kidneyItems.length>0){
      var hiK=kidneyItems.filter(function(x){return x.isHi;});
      var body=hiK.length>=2?
        hiK.map(function(x){return x.label+"↑";}).join("、")+"同步偏高，\n需優先評估腎臟功能，建議盡快與獸醫討論。":
        kidneyItems.map(function(x){return x.label+(x.isHi?"↑":"↓");}).join("、")+"，\n建議追蹤腎功能相關指標。";
      cards.push({emoji:"💧",title:"腎臟指標",body:body});
    }

    // 肝膽
    var liverItems=sid("liver");
    if(liverItems.length>0){
      var hiL=liverItems.filter(function(x){return x.isHi;});
      var body=hiL.length>=2?
        hiL.map(function(x){return x.label+"↑";}).join("、")+"同步偏高，\n可能與肝細胞受損或膽道問題有關，\n建議與獸醫討論是否需要進一步檢查。":
        (has("ALT","hi")?"ALT 偏高，\n可能與肝細胞輕度受損有關，建議持續追蹤 ALT 變化。":
        liverItems.map(function(x){return x.label+(x.isHi?"↑":"↓");}).join("、")+"，\n建議與獸醫討論追蹤方向。");
      cards.push({emoji:"🟡",title:"肝膽指標",body:body});
    }

    // 電解質/生化/特殊（簡短呈現）
    ["elec","chem","special"].forEach(function(s){
      var items=sid(s);
      if(items.length===0)return;
      var emojiMap={elec:"⚡",chem:"🔬",special:"⭐"};
      var titleMap={elec:"電解質",chem:"生化指標",special:"特殊項目"};
      cards.push({
        emoji:emojiMap[s],
        title:titleMap[s],
        body:items.map(function(x){return x.label+(x.isHi?"↑":"↓");}).join("、")+"，\n建議與獸醫討論，結合臨床症狀判讀。"
      });
    });

    return cards;
  }

  // 優先注意事項
  function buildPriority(a,cards){
    var pts=[];
    function has(k,d){return a.some(function(x){return x.key===k&&(d==="hi"?x.isHi:!x.isHi);})}
    var dehydration=(has("RBC","hi")||has("HCT","hi"))&&(has("TP","hi")||has("ALB","hi"));
    if(dehydration)pts.push("近期飲水量、精神與食慾變化");
    var kidneyHi=a.filter(function(x){return x.sid==="kidney"&&x.isHi;}).length>=2;
    if(kidneyHi)pts.push("腎臟功能評估，建議盡快回診");
    var liverHi=a.filter(function(x){return x.sid==="liver"&&x.isHi;}).length>=2;
    if(liverHi)pts.push("肝膽功能評估，與獸醫討論是否需要進一步檢查");
    if(has("PLT","lo"))pts.push("是否有異常出血或瘀血的跡象");
    if(has("WBC","hi")||has("NEU","hi"))pts.push("體溫、精神及食慾是否正常");
    var anemiaLo=(has("HGB","lo")||has("HCT","lo")||has("RBC","lo"));
    if(anemiaLo)pts.push("黏膜顏色與精神活力，評估貧血狀況");
    if(pts.length===0)pts.push("持續追蹤各項指標，並依獸醫建議安排回診");
    return pts.slice(0,3);
  }

  var cards=showAnalysis?buildCards(anomalies):[];
  var priorities=showAnalysis?buildPriority(anomalies,cards):[];

  return(
    <div style={{marginBottom:8}}>
      <AnomalyList anomalies={anomalies} bloodRules={BLOOD_ITEM_INFO}/>
      {!showAnalysis&&(
        <button type="button" onClick={function(){setShowAnalysis(true);}} style={{display:"block",width:"100%",padding:"12px",borderRadius:14,border:"none",background:P.btn,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
          📋 AI 整體分析
        </button>
      )}
      {showAnalysis&&(
        <div>
          {cards.map(function(card,ci){return(
            <div key={ci} style={{background:"#FEF9F0",border:"1px solid #F5E6CC",borderRadius:16,padding:"14px",marginBottom:8}}>
              <div style={{fontSize:13,fontWeight:700,color:"#8A6A2A",marginBottom:6}}>{card.emoji} {card.title}</div>
              <div style={{fontSize:13,color:P.ink,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{card.body}</div>
            </div>
          );})}
          {priorities.length>0&&(
            <div style={{background:"#F0FAF4",border:"1px solid #B7DFC7",borderRadius:16,padding:"14px",marginBottom:8}}>
              <div style={{fontSize:13,fontWeight:700,color:"#2D7A4F",marginBottom:8}}>⭐ 最值得優先注意</div>
              {priorities.map(function(p,pi){return(
                <div key={pi} style={{fontSize:13,color:"#2D4A30",lineHeight:1.8,display:"flex",gap:8,marginBottom:pi<priorities.length-1?4:0}}>
                  <span style={{color:"#2D7A4F"}}>•</span><span>{p}</span>
                </div>
              );})}
            </div>
          )}
          <div style={{fontSize:11,color:P.muted,padding:"8px 10px",background:P.block,borderRadius:8,marginBottom:8}}>
            ⚠️ 以上分析僅供參考，不構成醫療診斷。所有決策請與獸醫師討論後進行。
          </div>
          <button type="button" onClick={function(){setShowAnalysis(false);}} style={{display:"block",width:"100%",padding:"9px",borderRadius:12,border:"1px solid "+P.border,background:"transparent",color:P.muted,fontSize:12,cursor:"pointer"}}>收起分析</button>
        </div>
      )}
    </div>
  );
}








// ─── HEALTH EDIT PAGE ────────────────────────────────
function HealthEditPage(props){
  var onSave=props.onSave,onBack=props.onBack,isEdit=props.isEdit;
  var [form,setForm]=React.useState(props.initialForm||{date:new Date().toISOString().slice(0,10),type:"🏥 體檢",note:"",photos:[],bloodVals:{},vaccineType:"三合一",vaccineCustom:"",hospital:"",batchNo:"",nextDate:"",doctor:"",bodyWeight:"",dewormType:"體外",dewormBrand:"寵愛",dewormBrandCustom:"",dewormNextDate:""});
  var [openGroup,setOpenGroup]=React.useState(null);
  function set(key,val){setForm(Object.assign({},form,{[key]:val}));}
  function handlePhoto(e){
    var files=Array.prototype.slice.call(e.target.files);var current=(form.photos||[]).slice();var count=0;
    function readNext(){if(count>=files.length)return;var reader=new FileReader();var file=files[count];count++;reader.onload=function(ev){current=current.concat([ev.target.result]);setForm(function(prev){return Object.assign({},prev,{photos:current.slice()});});readNext();};reader.readAsDataURL(file);}
    readNext();e.target.value="";
  }
  function setBlood(key,entry){
    var next=Object.assign({},form.bloodVals||{});
    if(!entry){delete next[key];}else{next[key]=entry;}
    setForm(Object.assign({},form,{bloodVals:next}));
  }
  var canSave=form.date.trim().length>0;
  return(
    <div style={{position:"fixed",inset:0,background:P.bg,zIndex:150,overflowY:"auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:P.card,borderBottom:"1px solid "+P.border,position:"sticky",top:0,zIndex:2}}>
        <button type="button" onClick={onBack} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:P.muted}}>←</button>
        <div style={{fontSize:15,fontWeight:700,color:P.ink}}>{isEdit?"編輯健康紀錄":"新增健康紀錄"}</div>
        <button type="button" onClick={function(){if(canSave&&onSave)onSave(form);}} style={{background:"none",border:"none",fontSize:14,fontWeight:700,color:canSave?P.btn:P.muted,cursor:"pointer"}}>儲存</button>
      </div>
      <div style={{padding:"16px"}}>
        <FieldRow label="日期 *"><TextInput type="date" value={form.date} onChange={function(e){set("date",e.target.value);}}/></FieldRow>
        <FieldRow label="類型">
          <select value={form.type} onChange={function(e){set("type",e.target.value);}} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid "+P.border,background:P.input,color:P.ink,fontSize:14}}>
            {["🏥 體檢","💉 疫苗","🐛 驅蟲","其他"].map(function(t){return <option key={t} value={t}>{t}</option>;})}
          </select>
        </FieldRow>
        {form.type==="💉 疫苗"&&(
          <div>
            <FieldRow label="疫苗種類">
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                {VACCINE_ALL.map(function(v){var active=(form.vaccineType||"三合一")===v;return <button type="button" key={v} onClick={function(){set("vaccineType",v);}} style={{padding:"5px 12px",borderRadius:14,fontSize:12,cursor:"pointer",border:"1.5px solid "+(active?P.btn:P.border),background:active?P.btn:"transparent",color:active?"#fff":P.ink}}>{v}</button>;})}
              </div>
              {(form.vaccineType==="其他（自訂）"||form.vaccineType==="其他")&&<TextInput value={form.vaccineCustom||""} onChange={function(e){set("vaccineCustom",e.target.value);}} placeholder="疫苗名稱"/>}
            </FieldRow>
            <FieldRow label="醫院"><TextInput value={form.hospital||""} onChange={function(e){set("hospital",e.target.value);}} placeholder="（選填）"/></FieldRow>
            <FieldRow label="批號"><TextInput value={form.batchNo||""} onChange={function(e){set("batchNo",e.target.value);}} placeholder="（選填）"/></FieldRow>
            <FieldRow label="下次施打日期"><TextInput type="date" value={form.nextDate||""} onChange={function(e){set("nextDate",e.target.value);}}/></FieldRow>
          </div>
        )}
        {form.type==="🐛 驅蟲"&&(
          <div>
            <FieldRow label="驅蟲類型">
              <div style={{display:"flex",gap:8}}>
                {DEWORM_TYPES.map(function(t){var active=form.dewormType===t;return <button type="button" key={t} onClick={function(){set("dewormType",t);}} style={{flex:1,padding:"9px",borderRadius:10,fontSize:13,cursor:"pointer",border:"1.5px solid "+(active?P.btn:P.border),background:active?P.btn:"transparent",color:active?"#fff":P.ink}}>{t}</button>;})}
              </div>
            </FieldRow>
            <FieldRow label="品牌">
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                {DEWORM_BRANDS.map(function(b){var active=form.dewormBrand===b;return <button type="button" key={b} onClick={function(){set("dewormBrand",b);}} style={{padding:"5px 12px",borderRadius:14,fontSize:12,cursor:"pointer",border:"1.5px solid "+(active?P.btn:P.border),background:active?P.btn:"transparent",color:active?"#fff":P.ink}}>{b}</button>;})}
              </div>
              {form.dewormBrand==="其他（自訂）"&&<TextInput value={form.dewormBrandCustom||""} onChange={function(e){set("dewormBrandCustom",e.target.value);}} placeholder="品牌名稱"/>}
            </FieldRow>
            <FieldRow label="下次驅蟲日期"><TextInput type="date" value={form.dewormNextDate||""} onChange={function(e){set("dewormNextDate",e.target.value);}}/></FieldRow>
          </div>
        )}
        {form.type==="🏥 體檢"&&(
          <div style={{background:P.block,borderRadius:12,padding:"12px",marginBottom:14}}>
            <div style={{fontSize:12,color:P.muted,fontWeight:600,marginBottom:10}}>報告資訊（選填）</div>
            <FieldRow label="醫院"><TextInput value={form.hospital||""} onChange={function(e){set("hospital",e.target.value);}} placeholder="醫院名稱"/></FieldRow>
            <FieldRow label="醫師"><TextInput value={form.doctor||""} onChange={function(e){set("doctor",e.target.value);}} placeholder="醫師姓名"/></FieldRow>
            <FieldRow label="當日體重(kg)"><TextInput type="number" value={form.bodyWeight||""} onChange={function(e){set("bodyWeight",e.target.value);}} placeholder="例：4.5"/></FieldRow>
          </div>
        )}
        {form.type==="🏥 體檢"&&(
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,color:P.muted,marginBottom:6,fontWeight:500}}>
              血檢數值（選填）
              {Object.values(form.bloodVals||{}).filter(function(e){return e&&e.val!=="";}).length>0&&<span style={{color:P.btn,marginLeft:6}}>{Object.values(form.bloodVals||{}).filter(function(e){return e&&e.val!=="";}).length} 項</span>}
            </div>
            {BLOOD_GROUPS.map(function(grp){
              var isOpen=openGroup===grp.group;
              var filled=grp.items.filter(function(it){var e=(form.bloodVals||{})[it.key];return e&&e.val!==undefined&&e.val!=="";}).length;
              return(
                <div key={grp.group} style={{marginBottom:6,borderRadius:10,border:"1px solid "+P.border,overflow:"hidden"}}>
                  <button type="button" onClick={function(){setOpenGroup(isOpen?null:grp.group);}} style={{width:"100%",padding:"9px 12px",background:P.block,border:"none",textAlign:"left",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:13,fontWeight:600,color:P.ink}}>{grp.group}</span>
                    <span style={{fontSize:12,color:P.muted}}>{filled>0?filled+"項 ":""}{isOpen?"▲":"▼"}</span>
                  </button>
                  {isOpen&&(
                    <div style={{padding:"10px 12px",background:P.input}}>
                      {grp.items.map(function(it){return <BloodInput key={it.key} it={it} vals={form.bloodVals||{}} onChange={setBlood}/>;}) }
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <FieldRow label="備註"><textarea value={form.note||""} onChange={function(e){set("note",e.target.value);}} placeholder="備註說明" rows={3} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid "+P.border,background:P.input,color:P.ink,fontSize:14,boxSizing:"border-box",resize:"vertical",fontFamily:"system-ui,sans-serif"}}/></FieldRow>
        <FieldRow label="照片（可多張）">
          <label style={{display:"inline-block",padding:"7px 14px",borderRadius:10,border:"1px solid "+P.border,background:P.block,fontSize:13,cursor:"pointer",color:P.ink}}>＋ 上傳照片<input type="file" accept="image/*" multiple style={{display:"none"}} onChange={handlePhoto}/></label>
          {(form.photos||[]).length>0&&(
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
              {(form.photos||[]).map(function(p,i){return(
                <div key={i} style={{position:"relative"}}>
                  <img src={p} style={{width:60,height:60,borderRadius:8,objectFit:"cover",border:"1px solid "+P.border}}/>
                  <button type="button" onClick={function(){setForm(function(prev){var n=(prev.photos||[]).filter(function(_,j){return j!==i;});return Object.assign({},prev,{photos:n});})}} style={{position:"absolute",top:-4,right:-4,width:18,height:18,borderRadius:"50%",background:"#B91C1C",color:"#fff",border:"none",fontSize:11,cursor:"pointer",lineHeight:1}}>×</button>
                </div>
              );})}
            </div>
          )}
        </FieldRow>
        <Btn onClick={function(){if(canSave&&onSave)onSave(form);}} style={{width:"100%",marginTop:8,fontSize:15,padding:"13px"}}>{isEdit?"儲存變更":"新增紀錄"}</Btn>
        <BtnGhost onClick={onBack} style={{width:"100%",marginTop:8,fontSize:14}}>取消</BtnGhost>
      </div>
    </div>
  );
}

// ─── NEXT DATE BADGE ─────────────────────────────────
function NextDateBadge(props){
  var nextDate=props.nextDate,icon=props.icon||"📅";
  if(!nextDate)return null;
  var today=new Date();today.setHours(0,0,0,0);
  var nd=new Date(nextDate);nd.setHours(0,0,0,0);
  var d=Math.floor((nd-today)/86400000);
  var txt=d<0?"已過期":d===0?"今天":d+"天後";
  var col=d<0?"#B91C1C":d<=7?"#8A6A2A":"#9A8D80";
  return <div style={{fontSize:11,color:col,marginTop:2}}>下次 {nextDate}（{txt}）</div>;
}

// ─── BOTTOM SHEET PICKER ─────────────────────────────
function BottomSheetPicker(props){
  var label=props.label,value=props.value,options=props.options,onChange=props.onChange;
  var [open,setOpen]=React.useState(false);
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",padding:"13px 16px",minHeight:52,cursor:"pointer"}} onClick={function(){setOpen(true);}}>
        <div style={{fontSize:15,color:"#3A3028",flex:1}}>{label}</div>
        <span style={{fontSize:15,color:value?P.muted:"#C4BAB0",marginRight:6}}>{value||""}</span>
        <span style={{fontSize:13,color:"#C4BAB0"}}>›</span>
      </div>
      {open&&(
        <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.3)"}} onClick={function(){setOpen(false);}}/>
          <div style={{position:"relative",background:P.card,borderRadius:"20px 20px 0 0",paddingBottom:32}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px 10px"}}>
              <div style={{fontSize:14,fontWeight:600,color:P.ink}}>{label}</div>
              <button type="button" onClick={function(){setOpen(false);}} style={{background:"none",border:"none",fontSize:14,color:P.btn,cursor:"pointer",fontWeight:600}}>完成</button>
            </div>
            <div style={{height:1,background:P.border}}/>
            {options.map(function(opt){
              var active=value===opt;
              return(
                <div key={opt} onClick={function(){onChange(opt);setOpen(false);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"15px 20px",borderBottom:"1px solid "+P.border,cursor:"pointer"}}>
                  <span style={{fontSize:16,color:P.ink}}>{opt}</span>
                  {active&&<span style={{fontSize:16,color:P.btn}}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── IOS ROW ─────────────────────────────────────────
function IosRow(props){
  var label=props.label,value=props.value,onChange=props.onChange,type=props.type||"text",last=props.last;
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",padding:"13px 16px",minHeight:52}}>
        <div style={{fontSize:15,color:"#3A3028",flex:1}}>{label}</div>
        <input type={type} value={value} onChange={onChange} placeholder="" style={{textAlign:"right",fontSize:15,color:value?P.muted:"#C4BAB0",border:"none",background:"transparent",outline:"none",width:"auto",maxWidth:"55%",minWidth:80,padding:0}}/>
        <span style={{fontSize:13,color:"#C4BAB0",marginLeft:4}}>›</span>
      </div>
      {!last&&<div style={{height:1,background:P.border,marginLeft:16}}/>}
    </div>
  );
}

// ─── CAT EDIT PAGE ───────────────────────────────────
var BLANK_CAT={id:"",name:"",breed:"貓咪",color:"",birthday:"",homeday:"",gender:"",neutered:"未知",chip:"",photo:"",note:"",status:"在地球玩耍中"};

function CatEditPage(props){
  var onSave=props.onSave,onBack=props.onBack,isEdit=props.isEdit,onDelete=props.onDelete;
  var [form,setForm]=React.useState(props.initialForm||Object.assign({},BLANK_CAT,{id:Date.now()+""}));
  function handlePhotoUpload(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(ev){setForm(function(prev){return Object.assign({},prev,{photo:ev.target.result});})};reader.readAsDataURL(file);}
  function F(key){return form[key]||"";}
  function set(key,val){setForm(Object.assign({},form,{[key]:val}));}
  return(
    <div style={{position:"fixed",inset:0,background:P.bg,zIndex:150,overflowY:"auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:P.card,borderBottom:"1px solid "+P.border,position:"sticky",top:0,zIndex:2}}>
        <button type="button" onClick={onBack} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:P.muted}}>←</button>
        <div style={{fontSize:15,fontWeight:700,color:P.ink}}>{isEdit?"編輯寵物":"新增寵物"}</div>
        <button type="button" onClick={function(){if(form.name.trim()&&onSave)onSave(form);}} style={{background:"none",border:"none",fontSize:14,fontWeight:700,color:form.name.trim()?P.btn:P.muted,cursor:"pointer"}}>儲存</button>
      </div>
      <div style={{padding:"16px"}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24}}>
          <label style={{cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center"}}>
            {form.photo?(
              <img src={form.photo} style={{width:100,height:100,borderRadius:22,objectFit:"cover",boxShadow:"0 2px 12px rgba(0,0,0,0.10)",marginBottom:8}}/>
            ):(
              <div style={{width:100,height:100,borderRadius:22,background:"#EDE8E0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",marginBottom:8}}>
                <span style={{fontSize:28}}>📷</span>
              </div>
            )}
            <span style={{fontSize:13,color:P.muted}}>{form.photo?"更換照片":"上傳照片"}</span>
            <input type="file" accept="image/*" style={{display:"none"}} onChange={handlePhotoUpload}/>
          </label>
          {form.photo&&<button type="button" onClick={function(){setForm(Object.assign({},form,{photo:""}));}} style={{background:"none",border:"none",color:P.muted,fontSize:11,cursor:"pointer",marginTop:4}}>移除</button>}
        </div>
        <div style={{background:"#fff",borderRadius:16,border:"1px solid "+P.border,overflow:"hidden",marginBottom:16}}>
          <IosRow label="寵物名字" value={F("name")} onChange={function(e){set("name",e.target.value);}} type="text"/>
          <div style={{height:1,background:P.border,marginLeft:16}}/>
          <IosRow label="種類" value={F("breed")} onChange={function(e){set("breed",e.target.value);}} type="text"/>
          <div style={{height:1,background:P.border,marginLeft:16}}/>
          <IosRow label="品種 / 花色" value={F("color")} onChange={function(e){set("color",e.target.value);}} type="text"/>
          <div style={{height:1,background:P.border,marginLeft:16}}/>
          <BottomSheetPicker label="性別" value={F("gender")} options={["公","母","未知"]} onChange={function(v){set("gender",v);}}/>
          <div style={{height:1,background:P.border,marginLeft:16}}/>
          <BottomSheetPicker label="是否絕育" value={F("neutered")||"未知"} options={["已絕育","未絕育","未知"]} onChange={function(v){set("neutered",v);}}/>
          <div style={{height:1,background:P.border,marginLeft:16}}/>
          <IosRow label="晶片號" value={F("chip")} onChange={function(e){set("chip",e.target.value);}} type="text" last={true}/>
        </div>
        <div style={{background:"#fff",borderRadius:16,border:"1px solid "+P.border,overflow:"hidden",marginBottom:16}}>
          <BottomSheetPicker label="寵物狀態" value={F("status")||"在地球玩耍中"} options={["在地球玩耍中","已過彩虹橋"]} onChange={function(v){set("status",v);}}/>
          <div style={{height:1,background:P.border,marginLeft:16}}/>
          <IosRow label="出生日期" value={F("birthday")} onChange={function(e){set("birthday",e.target.value);}} type="date"/>
          <div style={{height:1,background:P.border,marginLeft:16}}/>
          <IosRow label="到家日期" value={F("homeday")} onChange={function(e){set("homeday",e.target.value);}} type="date" last={true}/>
        </div>
        {!isEdit&&<Btn onClick={function(){if(form.name.trim()&&onSave)onSave(form);}} style={{width:"100%",marginTop:8,fontSize:15,padding:"13px"}}>新增寵物</Btn>}
        {isEdit&&<button type="button" onClick={onBack} style={{display:"block",width:"100%",marginTop:16,padding:"8px",background:"none",border:"none",color:P.muted,fontSize:14,cursor:"pointer",textAlign:"center"}}>取消</button>}
        {isEdit&&onDelete&&<button type="button" onClick={onDelete} style={{display:"block",width:"100%",marginTop:8,padding:"4px",background:"none",border:"none",color:"#C0392B",fontSize:12,cursor:"pointer",textAlign:"center",opacity:0.7}}>刪除此寵物</button>}
      </div>
    </div>
  );
}

// ─── CAT PICKER MODAL ────────────────────────────────
function CatPickerModal(props){
  var cats=props.cats,onSelect=props.onSelect,onClose=props.onClose,title=props.title||"選擇貓咪";
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:120,display:"flex",alignItems:"flex-end"}}>
      <div style={{background:P.card,borderRadius:"20px 20px 0 0",width:"100%",padding:"20px 16px 32px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:700,color:P.ink}}>{title}</div>
          <button type="button" onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:P.muted,cursor:"pointer"}}>✕</button>
        </div>
        {cats.length===0&&<div style={{textAlign:"center",color:P.muted,padding:20}}>尚無貓咪，請先新增</div>}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {cats.map(function(cat){
            return(
              <button type="button" key={cat.id} onClick={function(){onSelect(cat);}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:14,border:"1px solid "+P.border,background:P.block,cursor:"pointer",textAlign:"left"}}>
                {cat.photo?<img src={cat.photo} style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>:<div style={{width:36,height:36,borderRadius:"50%",background:P.card,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🐱</div>}
                <div style={{fontSize:14,fontWeight:600,color:P.ink}}>{cat.name}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────
function calcAge(birthday){
  if(!birthday)return null;
  var b=new Date(birthday),now=new Date();
  var y=now.getFullYear()-b.getFullYear();
  var m=now.getMonth()-b.getMonth();
  if(m<0||(m===0&&now.getDate()<b.getDate())){y--;m+=12;}
  if(m<0)m+=12;
  if(y===0)return m+"個月";
  if(m===0)return y+"歲";
  return y+"歲"+m+"個月";
}

// ─── CAT CARD SWIPER ─────────────────────────────────
function CatCardSwiper(props){
  var cats=props.cats,selId=props.selId,onSelect=props.onSelect;
  var weights=props.weights,onEdit=props.onEdit;
  var [startX,setStartX]=React.useState(null);
  var idx=cats.findIndex(function(c){return c.id===selId;});
  if(idx<0)idx=0;
  var cat=cats[idx]||cats[0];
  var catWeights=(weights[cat.id]||[]).slice().sort(function(a,b){return b.date>a.date?1:b.date<a.date?-1:0;});
  var latestW=catWeights.length?catWeights[0].val:null;
  var age=calcAge(cat.birthday);
  function onTS(e){setStartX(e.touches[0].clientX);}
  function onTE(e){
    if(startX===null)return;
    var dx=e.changedTouches[0].clientX-startX;
    if(Math.abs(dx)<40){setStartX(null);return;}
    var newIdx=dx<0?Math.min(idx+1,cats.length-1):Math.max(idx-1,0);
    if(newIdx!==idx)onSelect(cats[newIdx].id);
    setStartX(null);
  }
  return(
    <div style={{padding:"12px 32px 0"}}>
      <div onTouchStart={onTS} onTouchEnd={onTE} style={{background:"#FDFAF6",borderRadius:20,border:"1px solid rgba(225,218,209,0.9)",boxShadow:"0 1px 8px rgba(0,0,0,0.05)",marginBottom:10,position:"relative",overflow:"hidden"}}>
        {cats.length>1&&(
          <div style={{display:"flex",justifyContent:"center",gap:4,paddingTop:10}}>
            {cats.map(function(c,i){return <div key={c.id} style={{width:i===idx?8:4,height:3,borderRadius:2,background:i===idx?P.btn:"#D9D2C8",transition:"width 0.2s"}}/>;}) }
          </div>
        )}
        <div style={{display:"flex",gap:16,alignItems:"center",padding:cats.length>1?"10px 16px 14px":"16px"}}>
          {cat.photo?(
            <img src={cat.photo} style={{width:84,height:84,borderRadius:18,objectFit:"cover",flexShrink:0,boxShadow:"0 2px 10px rgba(0,0,0,0.12)"}}/>
          ):(
            <div style={{width:84,height:84,borderRadius:18,background:"linear-gradient(135deg,#F5DFE0,#EDD5C5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,flexShrink:0}}>🐱</div>
          )}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:20,fontWeight:800,color:cat.status==="已過彩虹橋"?"#9A8D80":"#3A3028",letterSpacing:"-0.4px",marginBottom:4,display:"flex",alignItems:"center",gap:4}}>
              {cat.name}{cat.status==="已過彩虹橋"&&<span style={{fontSize:12}}>🌈</span>}
            </div>
            {(age||latestW)&&(
              <div style={{fontSize:13,color:"#6B6057",marginBottom:2}}>
                {age}{age&&latestW&&<span style={{margin:"0 4px",color:"#C4BAB0"}}>·</span>}{latestW&&latestW+" kg"}
              </div>
            )}
            {(cat.color||(cat.breed&&cat.breed!=="貓咪")||( cat.gender&&cat.gender!=="未知"))&&(
              <div style={{fontSize:12,color:"#9A8D80",marginBottom:6}}>
                {cat.breed&&cat.breed!=="貓咪"&&<span>{cat.breed}</span>}
                {cat.color&&<span>{(cat.breed&&cat.breed!=="貓咪")?" ":""}{cat.color}</span>}
                {cat.gender&&cat.gender==="公"&&<span>{(cat.breed&&cat.breed!=="貓咪"||cat.color)?" · ":""} 弟弟（公）</span>}{cat.gender&&cat.gender==="母"&&<span>{(cat.breed&&cat.breed!=="貓咪"||cat.color)?" · ":""} 妹妹（母）</span>}
              </div>
            )}
            {(cat.birthday||cat.chip)&&<div style={{height:1,background:"rgba(225,218,209,0.9)",marginBottom:6}}/>}
            <div style={{display:"flex",flexDirection:"column",gap:2}}>
              {cat.birthday&&<div style={{fontSize:12,color:"#B0A699"}}>🎂 {cat.birthday}</div>}
              {cat.chip&&<div style={{fontSize:12,color:"#B0A699"}}>🪪 {cat.chip}</div>}
            </div>
          </div>
        </div>
        <button type="button" onClick={function(){onEdit(cat);}} style={{position:"absolute",bottom:8,right:14,background:"none",border:"none",fontSize:11,color:"#C4BAB0",cursor:"pointer",padding:0,fontWeight:500}}>進入檔案 →</button>
      </div>
    </div>
  );
}


// ─── CATS PAGE ───────────────────────────────────────
function CatsPage(props){
  var onModalOpen=props.onModalOpen||function(){};
  var onModalClose=props.onModalClose||function(){};
  var fabCatCb=props.fabCatCb,fabTrigger=props.fabTrigger,onFabHandled=props.onFabHandled||function(){};
  var saved=lsGet("rr_cats",[]);
  var [cats,setCats]=useState(saved);
  var [selId,setSelId]=useState(saved.length?saved[0].id:null);
  var [catTab,setCatTab]=useState("weight");
  var [showCatEdit,setShowCatEdit]=useState(false);
  var [editCat,setEditCat]=useState(null);
  var [catForm,setCatForm]=useState(Object.assign({},BLANK_CAT,{id:Date.now()+""}));
  var [weights,setWeights]=useState(lsGet("rr_weights",{}));
  var [showWeightForm,setShowWeightForm]=useState(false);
  var [editWeight,setEditWeight]=useState(null);
  var [weightVal,setWeightVal]=useState("");
  var [weightDate,setWeightDate]=useState("");
  var [healths,setHealths]=useState(lsGet("rr_healths",{}));
  var [showHealthEdit,setShowHealthEdit]=useState(false);
  var [editHealth,setEditHealth]=useState(null);
  var [healthForm,setHealthForm]=useState({date:"",type:"🏥 體檢",note:"",photos:[],bloodVals:{},vaccineType:"三合一",vaccineCustom:"",hospital:"",batchNo:"",nextDate:"",doctor:"",bodyWeight:"",dewormType:"體外",dewormBrand:"寵愛",dewormBrandCustom:"",dewormNextDate:""});
  var [detailHealth,setDetailHealth]=useState(null);
  React.useEffect(function(){
    if(!fabTrigger)return;
    if(fabTrigger&&fabTrigger.indexOf("weight")===0){var parts=fabTrigger.split(":");if(parts[1])setSelId(parts[1]);setShowWeightForm(true);onModalOpen();onFabHandled();}
    if(fabTrigger&&fabTrigger.indexOf("health")===0){var hparts=fabTrigger.split(":");if(hparts[1])setSelId(hparts[1]);setEditHealth(null);setHealthForm({date:new Date().toISOString().slice(0,10),type:"🏥 體檢",note:"",photos:[],bloodVals:{}});setShowHealthEdit(true);onModalOpen();onFabHandled();}
  },[fabTrigger]);


  function saveWeights(next){setWeights(next);lsSet("rr_weights",next);}

  function saveCats(next){setCats(next);lsSet("rr_cats",next);}
  function saveHealths(next){setHealths(next);lsSet("rr_healths",next);}
  var cat=cats.find(function(c){return c.id===selId;})||null;
  var catWeights=(weights[selId]||[]).slice().sort(function(a,b){return b.date>a.date?1:b.date<a.date?-1:0;});
  var catHealths=(healths[selId]||[]).slice().sort(function(a,b){return b.date>a.date?1:b.date<a.date?-1:0;});
  function openAddCat(){setCatForm(Object.assign({},BLANK_CAT,{id:Date.now()+""}));setEditCat(null);setShowCatEdit(true);onModalOpen();}
  function handleSaveCat(f){var ft=f||catForm;if(!ft.name.trim())return;var next=editCat?cats.map(function(c){return c.id===ft.id?ft:c;}):cats.concat([ft]);saveCats(next);setSelId(ft.id);setShowCatEdit(false);onModalClose();}
  function handleDeleteCat(){if(!cat)return;var next=cats.filter(function(c){return c.id!==selId;});saveCats(next);setSelId(next.length?next[0].id:null);}
  function openEditWeight(w){setEditWeight(w);setWeightVal(String(w.val));setWeightDate(w.date);setShowWeightForm(true);onModalOpen();}
  function handleSaveWeight(){if(!weightVal||!selId)return;var nextW=Object.assign({},weights);if(editWeight){nextW[selId]=(nextW[selId]||[]).map(function(w){return w.id===editWeight.id?Object.assign({},w,{val:parseFloat(weightVal),date:weightDate||w.date}):w;})}else{var entry={id:Date.now()+"",date:weightDate||new Date().toISOString().slice(0,10),val:parseFloat(weightVal)};nextW[selId]=(nextW[selId]||[]).concat([entry]);}saveWeights(nextW);setWeightVal("");setWeightDate("");setEditWeight(null);setShowWeightForm(false);onModalClose();}
  function handleDeleteWeight(wid){var nextW=Object.assign({},weights);nextW[selId]=(nextW[selId]||[]).filter(function(w){return w.id!==wid;});saveWeights(nextW);}
  function openEditHealth(h){setEditHealth(h);setHealthForm(Object.assign({photos:[],bloodVals:{},vaccineType:"三合一",vaccineCustom:"",hospital:"",batchNo:"",nextDate:"",doctor:"",bodyWeight:"",dewormType:"體外",dewormBrand:"寵愛",dewormBrandCustom:"",dewormNextDate:""},h));setShowHealthEdit(true);onModalOpen();}
  function handleSaveHealth(f){var ft=f||healthForm;var sid=selId||(cats.length?cats[0].id:null);if(!ft.date||!sid)return;var nextH=Object.assign({},healths);if(editHealth){nextH[sid]=(nextH[sid]||[]).map(function(h){return h.id===editHealth.id?Object.assign({},ft,{id:editHealth.id}):h;})}else{nextH[sid]=(nextH[sid]||[]).concat([Object.assign({id:Date.now()+""},ft)]);}saveHealths(nextH);if(sid&&sid!==selId)setSelId(sid);setEditHealth(null);setShowHealthEdit(false);onModalClose();}
  function handleDeleteHealth(hid){var nextH=Object.assign({},healths);nextH[selId]=(nextH[selId]||[]).filter(function(h){return h.id!==hid;});saveHealths(nextH);}
  function typeLabel(t){if(t==="🐛 驅蟲")return "🐛 驅蟲";if(t==="💉 疫苗")return "💉 疫苗";if(t==="🏥 體檢")return "🏥 體檢";return "其他";}
  return(
    <div style={{background:P.bg,minHeight:"100vh",paddingBottom:80}}>
      {cats.length===0?(
        <div style={{padding:40,textAlign:"center",color:P.muted}}>
          <div style={{fontSize:48,marginBottom:6}}>🐱</div>
          <div style={{fontSize:15,fontWeight:600,color:P.ink}}>還沒有寵物</div>
        </div>
      ):(
        <div>
          <CatCardSwiper cats={cats} selId={selId} onSelect={function(id){setSelId(id);}} weights={weights} onEdit={function(selectedCat){setEditCat(selectedCat);setCatForm(Object.assign({},BLANK_CAT,selectedCat));setShowCatEdit(true);onModalOpen();}}/>
          {cat&&(
            <div style={{padding:"0 16px"}}>
              <div style={{display:"flex",background:P.block,borderRadius:12,padding:3,marginBottom:8}}>
                {["weight","health"].map(function(t){var active=catTab===t;return <button type="button" key={t} onClick={function(){setCatTab(t);}} style={{flex:1,padding:"9px",borderRadius:10,border:"none",background:active?P.card:"transparent",color:active?P.ink:P.muted,fontSize:13,cursor:"pointer",fontWeight:active?700:400}}>{t==="weight"?"📈 體重":"🩺 健康"}</button>;})}
              </div>
              {catTab==="weight"&&(
                <div style={{padding:"4px 0"}}>
                  {catWeights.length>0&&(
                    <div style={{display:"flex",gap:10,marginBottom:16}}>
                      <div style={{flex:1,background:"#fff",borderRadius:14,border:"1px solid "+P.border,padding:"10px 14px"}}>
                        <div style={{fontSize:11,color:P.muted,marginBottom:4,fontWeight:500}}>目前體重</div>
                        <div style={{display:"flex",alignItems:"baseline",gap:4}}><span style={{fontSize:18,fontWeight:600,color:P.ink,lineHeight:1}}>{catWeights[0].val}</span><span style={{fontSize:13,color:P.muted}}>kg</span>🥫</div>
                      </div>
                      {catWeights.length>1&&(
                        <div style={{flex:1,background:"#fff",borderRadius:14,border:"1px solid "+P.border,padding:"10px 14px"}}>
                          <div style={{fontSize:11,color:P.muted,marginBottom:4,fontWeight:500}}>上次變化</div>
                          <div style={{display:"flex",alignItems:"baseline",gap:4}}><span style={{fontSize:18,fontWeight:600,color:"#7A8FA6",lineHeight:1}}>{(catWeights[0].val-catWeights[1].val)>0?"+":""}{(catWeights[0].val-catWeights[1].val).toFixed(1)}</span><span style={{fontSize:13,color:P.muted}}>kg</span>🥫</div>
                        </div>
                      )}
                    </div>
                  )}
                  {catWeights.length===0&&<div style={{textAlign:"center",color:P.muted,padding:"40px 0",fontSize:13}}><div style={{fontSize:32,marginBottom:8}}>⚖️</div>尚無體重紀錄</div>}
                  {catWeights.map(function(w){return(
                    <SwipeRow key={w.id} onEdit={function(){openEditWeight(w);}} onDelete={function(){handleDeleteWeight(w.id);}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",background:"#fff",borderRadius:12,border:"1px solid "+P.border}}>
                        <span style={{fontSize:14,color:P.muted}}>{w.date}</span>
                        <span style={{fontSize:16,fontWeight:600,color:P.muted}}>{w.val} <span style={{fontSize:12,fontWeight:400,color:P.muted}}>kg</span>🌈</span>
                      </div>
                    </SwipeRow>
                  );})}
                </div>
              )}
              {catTab==="health"&&(
                <div>
                  {catHealths.length===0&&<div style={{textAlign:"center",color:P.muted,padding:"40px 0",fontSize:13}}><div style={{fontSize:32,marginBottom:8}}>🩺</div>尚無健康紀錄</div>}
                  {catHealths.map(function(h){return(
                    <SwipeRow key={h.id} onEdit={function(){openEditHealth(h);}} onDelete={function(){handleDeleteHealth(h.id);}}>
                      <div onClick={function(){setDetailHealth(h);}} style={{padding:"12px 14px",background:P.card,borderRadius:12,border:"1px solid "+P.border,cursor:"pointer"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{fontSize:13,fontWeight:600,color:P.ink}}>{typeLabel(h.type)}</div>
                          <span style={{fontSize:12,color:P.muted}}>{h.date}</span>
                        </div>
                        {h.type==="💉 疫苗"&&h.nextDate&&<NextDateBadge nextDate={h.nextDate} icon=""/>}
                        {h.type==="🐛 驅蟲"&&h.dewormNextDate&&<NextDateBadge nextDate={h.dewormNextDate} icon=""/>}
                        {(h.photos||[]).length>0&&(
                        <div style={{display:"flex",gap:4,marginTop:6}}>
                          {(h.photos||[]).slice(0,3).map(function(p,i){return <img key={i} src={p} style={{width:44,height:44,borderRadius:8,objectFit:"cover",border:"1px solid "+P.border}}/>;}) }
                          {(h.photos||[]).length>3&&<div style={{width:44,height:44,borderRadius:8,background:P.block,border:"1px solid "+P.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,color:P.muted}}>+{(h.photos||[]).length-3}</div>}
                        </div>
                      )}
                      </div>
                    </SwipeRow>
                  );})}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {showCatEdit&&<CatEditPage initialForm={catForm} isEdit={editCat!==null} onBack={function(){setShowCatEdit(false);onModalClose();}} onSave={function(f){handleSaveCat(f);}} onDelete={editCat!==null?function(){handleDeleteCat();setShowCatEdit(false);onModalClose();}:null}/>}
      {detailHealth&&<RecordDetailPage rec={detailHealth} cats={cats} onBack={function(){setDetailHealth(null);onModalClose();}} onEdit={function(){openEditHealth(detailHealth);setDetailHealth(null);onModalClose();}} onDelete={function(){handleDeleteHealth(detailHealth.id);setDetailHealth(null);onModalClose();}}/>}
      {showWeightForm&&(
        <Modal title={editWeight?"編輯體重":"新增體重"} onClose={function(){setShowWeightForm(false);onModalClose();setEditWeight(null);setWeightVal("");setWeightDate("");}} onSave={handleSaveWeight}>
          <FieldRow label="體重 (kg) *"><TextInput type="number" value={weightVal} onChange={function(e){setWeightVal(e.target.value);}} placeholder="例：4.5"/></FieldRow>
          <FieldRow label="日期"><TextInput type="date" value={weightDate} onChange={function(e){setWeightDate(e.target.value);}}/></FieldRow>
        </Modal>
      )}
      {showHealthEdit&&<HealthEditPage initialForm={healthForm} isEdit={editHealth!==null} onBack={function(){setShowHealthEdit(false);onModalClose();setEditHealth(null);}} onSave={function(f){handleSaveHealth(f);}}/>}
    </div>
  );
}

// ─── CALENDAR PAGE ───────────────────────────────────
var CARE_TYPES=["換貓砂","洗貓砂盆","洗玩具用品","洗澡","其他"];
var CLEAN_TYPES=["換貓砂","洗貓砂盆","洗玩具用品"];

function IconCalendar(){return(
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );}

function IconSearch(){return(
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );}

function CalendarPage(props){
  var onModalOpen=props.onModalOpen||function(){};
  var onModalClose=props.onModalClose||function(){};
  var fabTrigger=props.fabTrigger;
  var onFabHandled=props.onFabHandled||function(){};

  var [records,setRecords]=useState(lsGet("rr_records",[]));
  function saveRecords(next){setRecords(next);lsSet("rr_records",next);}
  var cats=lsGet("rr_cats",[]);
  var today=new Date();
  var todayStr=today.toISOString().slice(0,10);

  // ─── 篩選狀態 ──────────────────────────────────────────
  var [filterMode,setFilterMode]=useState("all");   // "all" | "cat"
  var [filterType,setFilterType]=useState("all");   // type or "all"
  var [filterCatId,setFilterCatId]=useState("all"); // cat id or "all"
  var [searchOpen,setSearchOpen]=useState(false);
  var [searchQ,setSearchQ]=useState("");
  var [calOpen,setCalOpen]=useState(false);
  var [calDate,setCalDate]=useState(null); // null = show all

  // ─── 月曆狀態 ──────────────────────────────────────────
  var [year,setYear]=useState(today.getFullYear());
  var [month,setMonth]=useState(today.getMonth());

  // ─── 表單狀態 ──────────────────────────────────────────
  var [showForm,setShowForm]=useState(false);
  var [editRec,setEditRec]=useState(null);
  var [form,setForm]=useState({date:todayStr,type:"換貓砂",note:"",catIds:[],photos:[]});
  var [detailRec,setDetailRec]=useState(null);

  React.useEffect(function(){if(fabTrigger==="record"){openAdd();onFabHandled();}},[fabTrigger]);

  var TYPES=["換貓砂","洗貓砂盆","洗玩具用品","洗澡","其他"];

  function openAdd(){
    setEditRec(null);
    setForm({date:calDate||todayStr,type:"換貓砂",note:"",catIds:[],photos:[]});
    setShowForm(true);onModalOpen();
  }
  function openEdit(rec){setEditRec(rec);setForm(Object.assign({catIds:[],photos:[]},rec));setShowForm(true);onModalOpen();}
  function handleCalPhoto(e){
    var files=Array.prototype.slice.call(e.target.files);
    var current=(form.photos||[]).slice();
    var count=0;
    function readNext(){
      if(count>=files.length)return;
      var reader=new FileReader();
      reader.onload=function(ev){current.push(ev.target.result);count++;setForm(Object.assign({},form,{photos:current}));readNext();};
      reader.readAsDataURL(files[count]);
    }
    readNext();
  }
  function handleSave(){
    var ft=Object.assign({},form);
    if(!ft.date)ft.date=todayStr;
    var next=editRec?records.map(function(r){return r.id===editRec.id?Object.assign({},ft,{id:editRec.id}):r;}):records.concat([Object.assign({},ft,{id:Date.now()+""})]);
    saveRecords(next);
    if(!editRec){var newRec=next[next.length-1];setDetailRec(newRec);}
    setShowForm(false);onModalClose();
  }
  function handleDelete(id){saveRecords(records.filter(function(r){return r.id!==id;}));}
  function typeLabel(t){
    if(t==="換貓砂")return "換貓砂";
    if(t==="洗貓砂盆")return "洗貓砂盆";
    if(t==="洗玩具用品")return "洗玩具用品";
    if(t==="洗澡")return "洗澡";
    return "其他";
  }

  // ─── 篩選後紀錄 ────────────────────────────────────────
  var filtered=records.slice().sort(function(a,b){return b.date>a.date?1:-1;});
  if(calDate)filtered=filtered.filter(function(r){return r.date===calDate;});
  if(filterMode==="all"&&filterType!=="all")filtered=filtered.filter(function(r){return r.type===filterType;});
  if(filterMode==="cat"&&filterCatId!=="all")filtered=filtered.filter(function(r){return (r.catIds||[]).indexOf(filterCatId)>=0;});
  if(searchOpen&&searchQ.trim()){
    var q=searchQ.toLowerCase();
    filtered=filtered.filter(function(r){
      return r.type.toLowerCase().indexOf(q)>=0||
        (r.note||"").toLowerCase().indexOf(q)>=0||
        (r.catIds||[]).some(function(cid){var cat=cats.find(function(c){return c.id===cid;});return cat&&cat.name.toLowerCase().indexOf(q)>=0;});
    });
  }

  // ─── 月曆 helpers ──────────────────────────────────────
  var daysInMonth=new Date(year,month+1,0).getDate();
  var firstDay=new Date(year,month,1).getDay();
  var monthNames=["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  var dotDates={};records.forEach(function(r){dotDates[r.date]=true;});
  function prevMonth(){if(month===0){setYear(year-1);setMonth(11);}else setMonth(month-1);}
  function nextMonth(){if(month===11){setYear(year+1);setMonth(0);}else setMonth(month+1);}















  return(
    <div style={{background:P.bg,minHeight:"100vh",paddingBottom:80}}>

      
      <div style={{background:P.card,borderBottom:"1px solid "+P.border,padding:"10px 16px 0"}}>
        
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{display:"flex",gap:2,background:P.block,borderRadius:99,padding:2}}>
            {["all","cat"].map(function(m){var active=filterMode===m;return(
              <button type="button" key={m} onClick={function(){setFilterMode(m);setFilterType("all");setFilterCatId("all");}}
                style={{padding:"5px 14px",borderRadius:99,border:"none",fontSize:12,fontWeight:active?700:400,
                  background:active?P.card:"transparent",color:active?P.ink:P.muted,cursor:"pointer",
                  boxShadow:active?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>
                {m==="all"?"全部":"寵物"}
              </button>
            );})}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {calDate&&(
              <button type="button" onClick={function(){setCalDate(null);}} style={{fontSize:11,padding:"3px 8px",borderRadius:99,border:"1px solid "+P.border,background:P.block,color:P.muted,cursor:"pointer"}}>
                {calDate} <span>✕</span>
              </button>
            )}
            <button type="button" onClick={function(){setCalOpen(true);}} style={{background:"none",border:"none",cursor:"pointer",padding:4,borderRadius:8,color:P.ink}}>
              <IconCalendar/>
            </button>
            <button type="button" onClick={function(){setSearchOpen(function(o){return !o;});if(searchOpen)setSearchQ("");}} style={{background:"none",border:"none",cursor:"pointer",padding:4,borderRadius:8,color:P.ink}}>
              <IconSearch/>
            </button>
          </div>
        </div>

        
        {searchOpen&&(
          <div style={{marginBottom:8}}>
            <input value={searchQ} onChange={function(e){setSearchQ(e.target.value);}} placeholder="搜尋紀錄內容、備註、寵物名稱…"
              autoFocus={true}
              style={{width:"100%",padding:"8px 12px",borderRadius:10,border:"1px solid "+P.border,background:P.input,color:P.ink,fontSize:13,boxSizing:"border-box",outline:"none"}}/>
          </div>
        )}

        
        {filterMode==="all"&&(
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:10,scrollbarWidth:"none",msOverflowStyle:"none"}}>
            {["all"].concat(TYPES).map(function(t){var active=filterType===t;return(
              <button type="button" key={t} onClick={function(){setFilterType(t);}}
                style={{flexShrink:0,padding:"5px 13px",borderRadius:99,border:"1.5px solid "+(active?P.btn:P.border),
                  background:active?P.btn:"transparent",color:active?"#fff":P.ink,fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>
                {t==="all"?"全部":typeLabel(t)}
              </button>
            );})}
          </div>
        )}
        {filterMode==="cat"&&(
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:10,scrollbarWidth:"none",msOverflowStyle:"none",alignItems:"center"}}>
            <button type="button" onClick={function(){setFilterCatId("all");}}
              style={{flexShrink:0,padding:"5px 13px",borderRadius:99,border:"1.5px solid "+(filterCatId==="all"?P.btn:P.border),
                background:filterCatId==="all"?P.btn:"transparent",color:filterCatId==="all"?"#fff":P.ink,fontSize:12,cursor:"pointer"}}>
              全部
            </button>
            {cats.map(function(cat){var active=filterCatId===cat.id;return(
              <button type="button" key={cat.id} onClick={function(){setFilterCatId(cat.id);}}
                style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:3,border:"none",background:"none",cursor:"pointer"}}>
                <div style={{width:38,height:38,borderRadius:999,overflow:"hidden",border:"2.5px solid "+(active?P.btn:P.border),background:P.block}}>
                  {cat.photo?<img src={cat.photo} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🐱</div>}
                </div>
                <span style={{fontSize:10,color:active?P.btn:P.muted,fontWeight:active?700:400}}>{cat.name}</span>
              </button>
            );})}
          </div>
        )}
      </div>

      
      <div style={{padding:"12px 16px"}}>
        {filtered.length===0&&(
          <div style={{textAlign:"center",color:P.muted,padding:"40px 0",fontSize:13}}>
            {calDate?"當日無紀錄":searchOpen&&searchQ?"找不到符合的紀錄":"還沒有日常紀錄"}
          </div>
        )}
        {filtered.map(function(r){return(
          <SwipeRow key={r.id} onEdit={function(){openEdit(r);}} onDelete={function(){handleDelete(r.id);}}>
            <div onClick={function(){setDetailRec(r);}} style={{padding:"12px 14px",background:P.card,borderRadius:14,marginBottom:8,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <span style={{fontSize:13,fontWeight:600,color:P.ink}}>{typeLabel(r.type)}</span>
                  <span style={{fontSize:11,color:P.muted,marginLeft:8}}>{r.date}</span>
                </div>
                {(r.catIds||[]).length>0&&(
                  <div style={{display:"flex",gap:3}}>
                    {(r.catIds||[]).map(function(cid){var cat=cats.find(function(c){return c.id===cid;});return cat?(
                      <div key={cid} style={{width:22,height:22,borderRadius:999,overflow:"hidden",border:"1px solid "+P.border,background:P.block}}>
                        {cat.photo?<img src={cat.photo} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:12}}>🐱</span>}
                      </div>
                    ):null;})}
                  </div>
                )}
              </div>
              {r.note&&<div style={{fontSize:12,color:P.muted,marginTop:4}}>{r.note}</div>}
              {(r.photos||[]).length>0&&(
                <div style={{display:"flex",gap:4,marginTop:6}}>
                  {(r.photos||[]).slice(0,3).map(function(p,i){return <img key={i} src={p} style={{width:44,height:44,objectFit:"cover",borderRadius:8}}/>;})}
                  {(r.photos||[]).length>3&&<div style={{width:44,height:44,borderRadius:8,background:P.block,border:"1px solid "+P.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:P.muted}}>+{(r.photos||[]).length-3}</div>}
                </div>
              )}
            </div>
          </SwipeRow>
        );})}
      </div>

      
      {calOpen&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:100,display:"flex",alignItems:"flex-end"}} onClick={function(){setCalOpen(false);}}>
          <div style={{background:P.card,borderRadius:"20px 20px 0 0",width:"100%",padding:"16px 16px 32px"}} onClick={function(e){e.stopPropagation();}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <button type="button" onClick={prevMonth} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:P.muted,padding:"4px 8px"}}>‹</button>
              <div style={{fontSize:15,fontWeight:700,color:P.ink}}>{year} {monthNames[month]}</div>
              <button type="button" onClick={nextMonth} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:P.muted,padding:"4px 8px"}}>›</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
              {["日","一","二","三","四","五","六"].map(function(d){return <div key={d} style={{textAlign:"center",fontSize:10,color:P.muted,padding:"2px 0"}}>{d}</div>;})}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
              {Array(firstDay).fill(null).map(function(_,i){return <div key={"e"+i}/>;})}
              {Array(daysInMonth).fill(null).map(function(_,i){
                var d=i+1;
                var m2=String(month+1);if(m2.length<2)m2="0"+m2;
                var d2=String(d);if(d2.length<2)d2="0"+d2;
                var dateStr=year+"-"+m2+"-"+d2;
                var isToday=dateStr===todayStr;
                var hasDot=dotDates[dateStr];
                var isSel=dateStr===calDate;
                return(
                  <button type="button" key={d} onClick={function(){setCalDate(dateStr);setCalOpen(false);}}
                    style={{padding:"6px 2px",border:"none",background:isSel?P.btn:isToday?"#E8DDD2":"transparent",
                      borderRadius:8,cursor:"pointer",textAlign:"center",position:"relative"}}>
                    <div style={{fontSize:13,fontWeight:isToday||isSel?700:400,color:isSel?"#fff":P.ink}}>{d}</div>
                    {hasDot&&<div style={{width:4,height:4,borderRadius:999,background:isSel?"rgba(255,255,255,0.7)":P.btn,margin:"1px auto 0"}}/>}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={function(){setCalOpen(false);}} style={{display:"block",width:"100%",marginTop:14,padding:"10px",borderRadius:12,border:"1px solid "+P.border,background:"transparent",color:P.muted,fontSize:13,cursor:"pointer"}}>關閉</button>
          </div>
        </div>
      )}

      
      {detailRec&&<RecordDetailPage rec={detailRec} cats={cats} onBack={function(){setDetailRec(null);}} onEdit={function(r){setDetailRec(null);openEdit(r);}} onDelete={function(id){handleDelete(id);setDetailRec(null);}}/>}

      
      {showForm&&(
        <Modal title={editRec?"編輯紀錄":"新增紀錄"} onClose={function(){setShowForm(false);onModalClose();}} onSave={handleSave}>
          <FieldRow label="日期 *"><TextInput type="date" value={form.date} onChange={function(e){setForm(Object.assign({},form,{date:e.target.value}));}}/></FieldRow>
          <FieldRow label="類型"><select value={form.type} onChange={function(e){setForm(Object.assign({},form,{type:e.target.value}));}} style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid "+P.border,background:P.input,color:P.ink,fontSize:15}}>
            {TYPES.map(function(t){return <option key={t} value={t}>{t}</option>;})}
          </select></FieldRow>
          <FieldRow label="備註"><textarea value={form.note} onChange={function(e){setForm(Object.assign({},form,{note:e.target.value}));}} placeholder="備註…" style={{width:"100%",minHeight:60,padding:"10px",borderRadius:10,border:"1px solid "+P.border,background:P.input,color:P.ink,fontSize:15,resize:"vertical",boxSizing:"border-box"}}/></FieldRow>
          {cats.length>0&&CLEAN_TYPES.indexOf(form.type)===-1&&(<FieldRow label="相關貓咪"><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{cats.map(function(cat){var sel=(form.catIds||[]).indexOf(cat.id)>=0;return <button type="button" key={cat.id} onClick={function(){var ids=sel?(form.catIds||[]).filter(function(x){return x!==cat.id;}):(form.catIds||[]).concat([cat.id]);setForm(Object.assign({},form,{catIds:ids}));}} style={{padding:"5px 12px",borderRadius:99,border:"1.5px solid "+(sel?P.btn:P.border),background:sel?P.btn:"transparent",color:sel?"#fff":P.ink,fontSize:12,cursor:"pointer"}}>{cat.name}</button>;})}
          </div></FieldRow>)}
          <FieldRow label="照片（可多張）"><label style={{display:"inline-block",padding:"7px 14px",borderRadius:10,border:"1px solid "+P.border,background:P.block,cursor:"pointer",fontSize:13}}>+ 選取照片<input type="file" accept="image/*" multiple onChange={handleCalPhoto} style={{display:"none"}}/></label>{(form.photos||[]).length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>{(form.photos||[]).map(function(p,i){return <img key={i} src={p} style={{width:52,height:52,objectFit:"cover",borderRadius:8}}/>;})}</div>}</FieldRow>
        </Modal>
      )}
    </div>
  );
}

var CAN_CATS=["乾糧","罐頭","生食","零食","保健"];
var BLANK_CAN={id:"",brand:"",flavor:"",qty:1,unit:"罐",category:"罐頭",expiry:"",note:"",photo:""};
function InventoryPage(props){
  var onModalOpen=props.onModalOpen||function(){};
  var onModalClose=props.onModalClose||function(){};
  var fabTrigger=props.fabTrigger;
  var onFabHandled=props.onFabHandled||function(){};
  var fabInventoryCb=props.fabInventoryCb;
  var [cans,setCans]=useState(lsGet("rr_inventory",[]));
  var [showForm,setShowForm]=useState(false);
  var [editCan,setEditCan]=useState(null);
  var [form,setForm]=useState(BLANK_CAN);
  var [search,setSearch]=useState("");
  var [activeCategory,setActiveCategory]=useState("全部");
  var [detailCan,setDetailCan]=useState(null);
  React.useEffect(function(){if(fabTrigger==="inventory"){openAdd();onFabHandled();}},[fabTrigger]);
  function saveCans(next){setCans(next);lsSet("rr_inventory",next);}
  function daysLeft(expiry){if(!expiry)return null;var today=new Date();today.setHours(0,0,0,0);var exp=new Date(expiry);exp.setHours(0,0,0,0);return Math.floor((exp-today)/86400000);}
  var filtered=cans.filter(function(c){var matchCat=activeCategory==="全部"||c.category===activeCategory;if(!matchCat)return false;if(!search)return true;var q=search.toLowerCase();return(c.brand+c.flavor+(c.note||"")).toLowerCase().indexOf(q)>=0;}).slice().sort(function(a,b){var da=daysLeft(a.expiry);da=da===null?9999:da;var db=daysLeft(b.expiry);db=db===null?9999:db;if(da<0&&db>=0)return -1;if(db<0&&da>=0)return 1;return da-db;});
  var total=cans.reduce(function(s,c){return s+(Number(c.qty)||0);},0);
  var expiredCount=cans.filter(function(c){var d=daysLeft(c.expiry);return d!==null&&d<0;}).length;
  var soonCount=cans.filter(function(c){var d=daysLeft(c.expiry);return d!==null&&d>=0&&d<=7;}).length;
  function openAdd(){setEditCan(null);setForm(Object.assign({},BLANK_CAN,{id:Date.now()+""}));setShowForm(true);onModalOpen();}
  function openEdit(can){setEditCan(can);setForm(Object.assign({},can));setShowForm(true);onModalOpen();}
  function handleSave(){if(!form.brand.trim())return;var next=editCan?cans.map(function(c){return c.id===editCan.id?form:c;}):cans.concat([form]);saveCans(next);setShowForm(false);onModalClose();}
  function handleDelete(id){saveCans(cans.filter(function(c){return c.id!==id;}));}
  function adj(id,delta){saveCans(cans.map(function(c){if(c.id!==id)return c;var q=Math.max(0,(Number(c.qty)||0)+delta);return Object.assign({},c,{qty:q});}));}
  function handleInventoryPhoto(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(ev){setForm(function(prev){return Object.assign({},prev,{photo:ev.target.result});})};reader.readAsDataURL(file);e.target.value="";}
  return(
    <div style={{background:P.bg,minHeight:"100vh",paddingBottom:80}}>

      
      <div style={{display:"flex",gap:6,padding:"12px 16px 0"}}>
        {[
          {val:cans.length,label:"品項",col:"#3A3028",bg:"#fff"},
          {val:total,label:"總數量",col:"#3A3028",bg:"#fff"},
          {val:soonCount,label:"即將到期",col:soonCount>0?"#8A6A2A":"#9A8D80",bg:soonCount>0?"#FEF9F0":"#fff"},
          {val:expiredCount,label:"已過期",col:expiredCount>0?"#B91C1C":"#9A8D80",bg:expiredCount>0?"#FEF2F2":"#fff"}
        ].map(function(s,i){return(
          <div key={i} style={{flex:1,background:s.bg,borderRadius:12,border:"1px solid "+P.border,padding:"6px 4px",textAlign:"center"}}>
            <div style={{fontSize:20,fontWeight:800,color:s.col,lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:10,color:P.muted,marginTop:3,lineHeight:1.2}}>{s.label}</div>
          </div>
        );}) }
      </div>

      
      <div style={{display:"flex",justifyContent:"center",flexWrap:"wrap",padding:"14px 16px 0",gap:6}}>
        {["全部"].concat(CAN_CATS).map(function(cat){var active=activeCategory===cat;return <button type="button" key={cat} onClick={function(){setActiveCategory(cat);}} style={{flexShrink:0,padding:"5px 12px",borderRadius:14,fontSize:12,cursor:"pointer",border:"1.5px solid "+(active?P.btn:P.border),background:active?P.btn:"transparent",color:active?"#fff":P.ink,fontWeight:active?600:400}}>{cat}</button>;})}
      </div>

      
      <div style={{padding:"14px 16px 4px"}}>
        <TextInput value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="搜尋品牌或口味…"/>
      </div>

      
      <div style={{padding:"14px 16px"}}>
        {filtered.length===0&&<div style={{textAlign:"center",color:P.muted,padding:40,fontSize:13}}>{cans.length===0?"庫存是空的":"沒有符合結果"}</div>}
        {filtered.map(function(can){
          var dl=daysLeft(can.expiry);
          var isExpired=dl!==null&&dl<0;
          var isSoon7=dl!==null&&dl>=0&&dl<=7;
          var isSoon30=dl!==null&&dl>7&&dl<=30;
          var expiryColor=isExpired?"#B91C1C":isSoon7?"#C05C1A":isSoon30?"#8A6A2A":"#2D7A4F";
          var expiryBg=isExpired?"#FEF2F2":isSoon7?"#FFF0E8":isSoon30?"#FEF9F0":"#F0FAF4";
          var expiryBadgeBorder=isExpired?"#FCCACA":isSoon7?"#F5D5C0":isSoon30?"#F5E6CC":"#B7DFC7";
          var expiryText=isExpired?"已過期 "+Math.abs(dl)+"天":dl!==null?"剩餘 "+dl+" 天":"";
          var cardBorder=isExpired?"#FCCACA":isSoon7?"#F5D5C0":P.border;
          var cardBg=isExpired?"#FEF7F7":isSoon7?"#FFF8F4":P.card;
          return(
            <div key={can.id} style={{marginBottom:8}}>
              <div onClick={function(){setDetailCan(can);}} style={{background:cardBg,borderRadius:16,border:"1px solid "+cardBorder,padding:"10px 12px",cursor:"pointer"}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  
                  <div style={{flexShrink:0}}>
                    {can.photo?(
                      <img src={can.photo} style={{width:68,height:68,borderRadius:12,objectFit:"cover",border:"1px solid "+P.border}}/>
                    ):(
                      <div style={{width:68,height:68,borderRadius:12,background:"#EDE8E0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🥫</div>
                    )}
                  </div>
                  
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",gap:5,marginBottom:5,flexWrap:"wrap"}}>
                      <span style={{fontSize:10,fontWeight:600,background:P.block,color:P.muted,borderRadius:6,padding:"2px 7px"}}>{can.category}</span>
                      {expiryText&&<span style={{fontSize:10,fontWeight:600,background:expiryBg,color:expiryColor,border:"1px solid "+expiryBadgeBorder,borderRadius:6,padding:"2px 7px"}}>{expiryText}</span>}
                    </div>
                    <div style={{fontSize:15,fontWeight:700,color:"#3A3028",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{can.brand}</div>
                    {can.flavor&&<div style={{fontSize:12,color:P.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{can.flavor}</div>}
                  </div>
                  
                  <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                    <button type="button" onClick={function(e){e.stopPropagation();adj(can.id,-1);}} style={{width:28,height:28,borderRadius:8,border:"1px solid "+P.border,background:P.block,color:P.ink,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                    <span style={{fontSize:16,fontWeight:800,color:"#3A3028",minWidth:18,textAlign:"center"}}>{can.qty}</span>
                    <button type="button" onClick={function(e){e.stopPropagation();adj(can.id,1);}} style={{width:28,height:28,borderRadius:8,border:"1px solid "+P.border,background:P.block,color:P.ink,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>＋</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {detailCan&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:100,display:"flex",alignItems:"flex-end"}}>
          <div style={{background:P.card,borderRadius:"20px 20px 0 0",width:"100%",maxHeight:"75vh",overflowY:"auto",padding:"20px 16px 32px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:16,fontWeight:700,color:P.ink}}>{detailCan.brand}</div>
              <button type="button" onClick={function(){setDetailCan(null);}} style={{background:"none",border:"none",fontSize:20,color:P.muted,cursor:"pointer"}}>✕</button>
            </div>
            {detailCan.photo&&<img src={detailCan.photo} style={{width:"100%",maxHeight:200,objectFit:"cover",borderRadius:12,marginBottom:12}}/>}
            {detailCan.flavor&&<div style={{fontSize:14,color:P.muted,marginBottom:8}}>{detailCan.flavor}</div>}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:P.muted}}>分類</span><span style={{fontSize:13,color:P.ink}}>{detailCan.category}</span>🥫</div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:P.muted}}>數量</span><span style={{fontSize:13,fontWeight:700,color:P.ink}}>{detailCan.qty}</span>🥫</div>
              {detailCan.expiry&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:P.muted}}>到期日</span><span style={{fontSize:13,color:P.ink}}>{detailCan.expiry}</span>🥫</div>}
              {detailCan.note&&<div><div style={{fontSize:13,color:P.muted,marginBottom:4}}>備註</div><div style={{fontSize:13,color:P.ink,whiteSpace:"pre-wrap",lineHeight:1.6}}>{detailCan.note}</div>🥫</div>}
            </div>
            <div style={{display:"flex",gap:8,marginTop:20}}>
              <BtnGhost onClick={function(){handleDelete(detailCan.id);setDetailCan(null);}} style={{flex:1,color:"#B91C1C",borderColor:"#FCCACA"}}>刪除</BtnGhost>
              <Btn onClick={function(){openEdit(detailCan);setDetailCan(null);}} style={{flex:1}}>編輯</Btn>
            </div>
          </div>
        </div>
      )}
      {showForm&&(
        <Modal title={editCan?"編輯庫存":"新增庫存"} onClose={function(){setShowForm(false);onModalClose();}} onSave={handleSave}>
          <FieldRow label="品牌 *"><TextInput value={form.brand} onChange={function(e){setForm(Object.assign({},form,{brand:e.target.value}));}} placeholder="品牌名稱"/></FieldRow>
          <FieldRow label="口味"><TextInput value={form.flavor||""} onChange={function(e){setForm(Object.assign({},form,{flavor:e.target.value}));}} placeholder="口味"/></FieldRow>
          <FieldRow label="數量"><TextInput type="number" value={form.qty} onChange={function(e){setForm(Object.assign({},form,{qty:e.target.value}));}} placeholder="1"/></FieldRow>
          <FieldRow label="分類"><select value={form.category} onChange={function(e){setForm(Object.assign({},form,{category:e.target.value}));}} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid "+P.border,background:P.input,color:P.ink,fontSize:14}}>{CAN_CATS.map(function(t){return <option key={t} value={t}>{t}</option>;})}</select></FieldRow>
          <FieldRow label="到期日"><TextInput type="date" value={form.expiry||""} onChange={function(e){setForm(Object.assign({},form,{expiry:e.target.value}));}}/></FieldRow>
          <FieldRow label="備註"><textarea value={form.note||""} onChange={function(e){setForm(Object.assign({},form,{note:e.target.value}));}} placeholder="備註" rows={2} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid "+P.border,background:P.input,color:P.ink,fontSize:14,boxSizing:"border-box",resize:"vertical",fontFamily:"system-ui,sans-serif"}}/></FieldRow>
          <FieldRow label="照片"><div style={{display:"flex",alignItems:"center",gap:10}}><label style={{padding:"7px 14px",borderRadius:10,border:"1px solid "+P.border,background:P.block,fontSize:13,cursor:"pointer",color:P.ink}}>{form.photo?"更換照片":"＋ 上傳"}<input type="file" accept="image/*" style={{display:"none"}} onChange={handleInventoryPhoto}/></label>{form.photo&&<img src={form.photo} style={{width:48,height:48,borderRadius:8,objectFit:"cover",border:"1px solid "+P.border}}/>}{form.photo&&<button type="button" onClick={function(){setForm(Object.assign({},form,{photo:""}));}} style={{background:"none",border:"none",color:P.muted,fontSize:12,cursor:"pointer"}}>移除</button>}</div></FieldRow>
        </Modal>
      )}
    </div>
  )
}


// ─── ANALYSIS PAGE ───────────────────────────────────
// ─── ANALYSIS PAGE ───────────────────────────────────
var PRESETS = ["Ziwi Peak","K9 Natural","Couch Potato"];
var BRANDS = {
"ziwi_peak":{"label":"Ziwi Peak 巔峰","aliases":["ziwi peak","ziwi","巔峰","ziwipeak"],"flavors":[{"id":"lamb","label":"羊肉","data":{"brandName":"Ziwi Peak 巔峰","brandSub":"羊肉主食罐","overallScore":"9.5/10","overallClass":"g","meatPercent":"92%","tags":[{"text":"無穀無膠","cls":"g"},{"text":"92%鮮肉","cls":"g"},{"text":"紐西蘭產","cls":"g"}],"nutrients":{"water":72,"protein":14,"fat":7,"phos":0.24,"calcium":0.32,"sodium":0.28,"magnesium":0.022,"ash":2.6},"verdict":"頂級主食罐首選，羊肉肉量高達92%，成分乾淨無添加，強烈推薦","_bk":"ziwi_peak","_fk":"lamb"}},{"id":"beef","label":"牛肉","data":{"brandName":"Ziwi Peak 巔峰","brandSub":"牛肉主食罐","overallScore":"9.5/10","overallClass":"g","meatPercent":"92%","tags":[{"text":"無穀無膠","cls":"g"},{"text":"草飼牛肉","cls":"g"},{"text":"92%鮮肉","cls":"g"}],"nutrients":{"water":71,"protein":15,"fat":7.5,"phos":0.25,"calcium":0.31,"sodium":0.26,"magnesium":0.021,"ash":2.7},"verdict":"紐西蘭草飼牛肉高蛋白，鐵質豐富無添加，適合活躍成貓","_bk":"ziwi_peak","_fk":"beef"}},{"id":"venison","label":"鹿肉","data":{"brandName":"Ziwi Peak 巔峰","brandSub":"鹿肉主食罐","overallScore":"9.6/10","overallClass":"g","meatPercent":"92%","tags":[{"text":"野生鹿肉","cls":"g"},{"text":"低敏蛋白","cls":"g"},{"text":"92%鮮肉","cls":"g"}],"nutrients":{"water":72,"protein":15,"fat":6.5,"phos":0.24,"calcium":0.3,"sodium":0.27,"magnesium":0.02,"ash":2.5},"verdict":"紐西蘭野生鹿肉，低敏稀有蛋白，適合食物過敏貓咪，強烈推薦","_bk":"ziwi_peak","_fk":"venison"}},{"id":"mackerel_lamb","label":"鯖魚羊肉","data":{"brandName":"Ziwi Peak 巔峰","brandSub":"鯖魚羊肉主食罐","overallScore":"9.4/10","overallClass":"g","meatPercent":"92%","tags":[{"text":"雙蛋白","cls":"g"},{"text":"高Omega-3","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":72,"protein":14,"fat":8,"phos":0.25,"calcium":0.31,"sodium":0.29,"magnesium":0.022,"ash":2.6},"verdict":"鯖魚羊肉雙蛋白，Omega-3豐富，護眼護心護皮毛，強力推薦","_bk":"ziwi_peak","_fk":"mackerel_lamb"}},{"id":"mackerel","label":"鯖魚","data":{"brandName":"Ziwi Peak 巔峰","brandSub":"鯖魚主食罐","overallScore":"9.4/10","overallClass":"g","meatPercent":"92%","tags":[{"text":"純鯖魚","cls":"g"},{"text":"高Omega-3","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":72,"protein":14,"fat":8.5,"phos":0.25,"calcium":0.3,"sodium":0.28,"magnesium":0.022,"ash":2.5},"verdict":"純鯖魚配方Omega-3最豐富，適合對哺乳類蛋白過敏的貓","_bk":"ziwi_peak","_fk":"mackerel"}},{"id":"chicken","label":"雞肉","data":{"brandName":"Ziwi Peak 巔峰","brandSub":"雞肉主食罐","overallScore":"9.4/10","overallClass":"g","meatPercent":"92%","tags":[{"text":"放牧雞肉","cls":"g"},{"text":"92%鮮肉","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":72,"protein":14,"fat":7,"phos":0.23,"calcium":0.3,"sodium":0.27,"magnesium":0.021,"ash":2.5},"verdict":"放牧雞肉92%，適口性極佳，無穀無膠，日常主食首選","_bk":"ziwi_peak","_fk":"chicken"}},{"id":"rabbit","label":"兔肉","data":{"brandName":"Ziwi Peak 巔峰","brandSub":"兔肉主食罐","overallScore":"9.5/10","overallClass":"g","meatPercent":"92%","tags":[{"text":"野生兔肉","cls":"g"},{"text":"極低敏蛋白","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":72,"protein":15,"fat":6,"phos":0.23,"calcium":0.29,"sodium":0.26,"magnesium":0.02,"ash":2.4},"verdict":"極稀有兔肉蛋白，低敏指數最高，嚴重過敏貓首選","_bk":"ziwi_peak","_fk":"rabbit"}},{"id":"dual_lamb","label":"雙羊","data":{"brandName":"Ziwi Peak 巔峰","brandSub":"雙羊主食罐","overallScore":"9.5/10","overallClass":"g","meatPercent":"92%","tags":[{"text":"雙羊蛋白","cls":"g"},{"text":"無穀無膠","cls":"g"},{"text":"低敏配方","cls":"g"}],"nutrients":{"water":72,"protein":14,"fat":7,"phos":0.24,"calcium":0.32,"sodium":0.27,"magnesium":0.021,"ash":2.6},"verdict":"羊肉羊奶雙重蛋白，低敏高營養，適合各年齡層貓咪","_bk":"ziwi_peak","_fk":"dual_lamb"}},{"id":"white_meat","label":"白肉","data":{"brandName":"Ziwi Peak 巔峰","brandSub":"白肉主食罐","overallScore":"9.3/10","overallClass":"g","meatPercent":"92%","tags":[{"text":"多種白肉","cls":"g"},{"text":"低脂配方","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":72,"protein":13,"fat":6,"phos":0.23,"calcium":0.29,"sodium":0.26,"magnesium":0.02,"ash":2.4},"verdict":"多種低脂白肉，清淡易消化，適合老貓或腸胃敏感貓咪","_bk":"ziwi_peak","_fk":"white_meat"}},{"id":"beef_venison","label":"牛鹿","data":{"brandName":"Ziwi Peak 巔峰","brandSub":"牛鹿主食罐","overallScore":"9.5/10","overallClass":"g","meatPercent":"92%","tags":[{"text":"雙肉配方","cls":"g"},{"text":"野生鹿肉","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":72,"protein":15,"fat":7,"phos":0.25,"calcium":0.31,"sodium":0.27,"magnesium":0.021,"ash":2.6},"verdict":"牛肉鹿肉雙重蛋白，高鐵低敏，成分頂尖，強烈推薦","_bk":"ziwi_peak","_fk":"beef_venison"}},{"id":"cod","label":"鱈魚","data":{"brandName":"Ziwi Peak 巔峰","brandSub":"鱈魚主食罐","overallScore":"9.4/10","overallClass":"g","meatPercent":"92%","tags":[{"text":"野生鱈魚","cls":"g"},{"text":"低脂低敏","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":73,"protein":14,"fat":5.5,"phos":0.23,"calcium":0.29,"sodium":0.27,"magnesium":0.02,"ash":2.4},"verdict":"野生鱈魚低脂低敏，適合老貓、腎貓與過敏貓咪","_bk":"ziwi_peak","_fk":"cod"}}]},
"k9_natural":{"label":"K9 Natural","aliases":["k9 natural","k9natural","k9","k9 natual"],"flavors":[{"id":"beef","label":"牛肉","data":{"brandName":"K9 Natural","brandSub":"凍乾牛肉主食罐（紐西蘭）","overallScore":"9.2/10","overallClass":"g","meatPercent":"90%","tags":[{"text":"凍乾工藝","cls":"g"},{"text":"無穀無膠","cls":"g"},{"text":"90%鮮肉","cls":"g"}],"nutrients":{"water":74,"protein":14,"fat":6.5,"phos":0.25,"calcium":0.31,"sodium":0.27,"magnesium":0.021,"ash":2.5},"verdict":"紐西蘭頂級凍乾罐，牛肉90%，原料透明乾淨","_bk":"k9_natural","_fk":"beef"}},{"id":"lamb","label":"羊肉","data":{"brandName":"K9 Natural","brandSub":"凍乾羊肉主食罐（紐西蘭）","overallScore":"9.2/10","overallClass":"g","meatPercent":"90%","tags":[{"text":"凍乾工藝","cls":"g"},{"text":"無穀無膠","cls":"g"},{"text":"紐西蘭羊","cls":"g"}],"nutrients":{"water":73,"protein":14,"fat":7,"phos":0.24,"calcium":0.3,"sodium":0.26,"magnesium":0.021,"ash":2.5},"verdict":"紐西蘭羊肉凍乾，保留最高營養密度，無添加","_bk":"k9_natural","_fk":"lamb"}},{"id":"chicken","label":"雞肉","data":{"brandName":"K9 Natural","brandSub":"凍乾雞肉主食罐（紐西蘭）","overallScore":"9.1/10","overallClass":"g","meatPercent":"90%","tags":[{"text":"凍乾工藝","cls":"g"},{"text":"無穀無膠","cls":"g"},{"text":"高適口性","cls":"g"}],"nutrients":{"water":74,"protein":14,"fat":6.5,"phos":0.23,"calcium":0.29,"sodium":0.26,"magnesium":0.021,"ash":2.4},"verdict":"凍乾雞肉配方，適口性佳，適合挑嘴貓咪","_bk":"k9_natural","_fk":"chicken"}},{"id":"salmon","label":"鮭魚","data":{"brandName":"K9 Natural","brandSub":"凍乾鮭魚主食罐（紐西蘭）","overallScore":"9.2/10","overallClass":"g","meatPercent":"90%","tags":[{"text":"凍乾工藝","cls":"g"},{"text":"高Omega-3","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":73,"protein":14,"fat":7,"phos":0.24,"calcium":0.3,"sodium":0.27,"magnesium":0.021,"ash":2.5},"verdict":"凍乾鮭魚高Omega-3，護眼護膚護心，強力推薦","_bk":"k9_natural","_fk":"salmon"}},{"id":"venison","label":"鹿肉","data":{"brandName":"K9 Natural","brandSub":"凍乾鹿肉主食罐（紐西蘭）","overallScore":"9.3/10","overallClass":"g","meatPercent":"90%","tags":[{"text":"野生鹿肉","cls":"g"},{"text":"低敏配方","cls":"g"},{"text":"凍乾工藝","cls":"g"}],"nutrients":{"water":73,"protein":15,"fat":6,"phos":0.23,"calcium":0.29,"sodium":0.26,"magnesium":0.02,"ash":2.4},"verdict":"野生鹿肉凍乾，低敏稀有蛋白，適合嚴重過敏貓咪","_bk":"k9_natural","_fk":"venison"}}]},
"farmina":{"label":"N&D Farmina 法米納","aliases":["farmina","n&d","法米納","farmina n&d","n&d farmina"],"flavors":[{"id":"salmon_pumpkin","label":"鮭魚南瓜","data":{"brandName":"N&D Farmina 法米納","brandSub":"有機無穀鮭魚南瓜主食罐（義大利）","overallScore":"9.0/10","overallClass":"g","meatPercent":"87%","tags":[{"text":"有機蔬果","cls":"g"},{"text":"無穀無膠","cls":"g"},{"text":"義大利製","cls":"g"}],"nutrients":{"water":74,"protein":14,"fat":6.5,"phos":0.24,"calcium":0.3,"sodium":0.26,"magnesium":0.021,"ash":2.4},"verdict":"義大利頂級，有機鮭魚南瓜，高Omega-3，強烈推薦","_bk":"farmina","_fk":"salmon_pumpkin"}},{"id":"chicken_pumpkin","label":"雞肉南瓜","data":{"brandName":"N&D Farmina 法米納","brandSub":"有機無穀雞肉南瓜主食罐（義大利）","overallScore":"8.9/10","overallClass":"g","meatPercent":"87%","tags":[{"text":"有機雞肉","cls":"g"},{"text":"南瓜有機","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":74,"protein":13,"fat":6,"phos":0.23,"calcium":0.29,"sodium":0.26,"magnesium":0.021,"ash":2.3},"verdict":"有機雞肉南瓜，義大利製，無穀無膠，成分透明優質","_bk":"farmina","_fk":"chicken_pumpkin"}},{"id":"duck_pumpkin","label":"鴨肉南瓜","data":{"brandName":"N&D Farmina 法米納","brandSub":"有機無穀鴨肉南瓜主食罐（義大利）","overallScore":"9.0/10","overallClass":"g","meatPercent":"87%","tags":[{"text":"有機鴨肉","cls":"g"},{"text":"低敏配方","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":74,"protein":14,"fat":6,"phos":0.23,"calcium":0.29,"sodium":0.26,"magnesium":0.02,"ash":2.3},"verdict":"有機鴨肉低敏配方，義大利製，適合食物過敏貓咪","_bk":"farmina","_fk":"duck_pumpkin"}},{"id":"lamb_pumpkin","label":"羊肉南瓜","data":{"brandName":"N&D Farmina 法米納","brandSub":"有機無穀羊肉南瓜主食罐（義大利）","overallScore":"9.0/10","overallClass":"g","meatPercent":"87%","tags":[{"text":"有機羊肉","cls":"g"},{"text":"稀有蛋白","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":74,"protein":14,"fat":7,"phos":0.24,"calcium":0.3,"sodium":0.26,"magnesium":0.021,"ash":2.4},"verdict":"有機羊肉稀有蛋白，南瓜纖維豐富，義大利製，強烈推薦","_bk":"farmina","_fk":"lamb_pumpkin"}},{"id":"venison_apple","label":"鹿肉蘋果","data":{"brandName":"N&D Farmina 法米納","brandSub":"有機無穀鹿肉蘋果主食罐（義大利）","overallScore":"9.2/10","overallClass":"g","meatPercent":"87%","tags":[{"text":"野生鹿肉","cls":"g"},{"text":"有機蘋果","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":74,"protein":15,"fat":6.5,"phos":0.24,"calcium":0.3,"sodium":0.26,"magnesium":0.02,"ash":2.4},"verdict":"野生鹿肉極低敏，有機蘋果富含抗氧化，嚴重過敏貓首選","_bk":"farmina","_fk":"venison_apple"}}]},
"terra_canis":{"label":"TERRA CANIS 醍菈鮮廚","aliases":["terra canis","醍菈鮮廚","terra"],"flavors":[{"id":"turkey","label":"1號浪漫火雞","data":{"brandName":"TERRA CANIS 醍菈鮮廚","brandSub":"1號浪漫火雞（德國）","overallScore":"8.8/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"德國製造","cls":"g"},{"text":"有機蔬果","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":74,"protein":13,"fat":6,"phos":0.23,"calcium":0.28,"sodium":0.26,"magnesium":0.022,"ash":2.3},"verdict":"德國有機火雞，低脂無穀無膠","_bk":"terra_canis","_fk":"turkey"}},{"id":"chicken","label":"2號嫩粉鮮雞","data":{"brandName":"TERRA CANIS 醍菈鮮廚","brandSub":"2號嫩粉鮮雞（德國）","overallScore":"8.8/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"德國製造","cls":"g"},{"text":"有機雞肉","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":74,"protein":13,"fat":6.5,"phos":0.22,"calcium":0.28,"sodium":0.26,"magnesium":0.022,"ash":2.3},"verdict":"德國有機雞肉，無穀無膠，強烈推薦","_bk":"terra_canis","_fk":"chicken"}},{"id":"salmon","label":"3號野生鮭魚","data":{"brandName":"TERRA CANIS 醍菈鮮廚","brandSub":"3號野生鮭魚（德國）","overallScore":"9.0/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"德國製造","cls":"g"},{"text":"野生鮭魚","cls":"g"},{"text":"高Omega-3","cls":"g"}],"nutrients":{"water":74,"protein":13,"fat":7,"phos":0.23,"calcium":0.28,"sodium":0.26,"magnesium":0.021,"ash":2.3},"verdict":"德國野生鮭魚高Omega-3，有機蔬果，護眼護膚護心","_bk":"terra_canis","_fk":"salmon"}},{"id":"rabbit","label":"4號純真兔肉","data":{"brandName":"TERRA CANIS 醍菈鮮廚","brandSub":"4號純真兔肉（德國）","overallScore":"9.0/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"德國製造","cls":"g"},{"text":"低敏兔肉","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":74,"protein":14,"fat":5.5,"phos":0.22,"calcium":0.28,"sodium":0.26,"magnesium":0.021,"ash":2.3},"verdict":"德國低敏兔肉，適合嚴重食物過敏貓，強烈推薦","_bk":"terra_canis","_fk":"rabbit"}},{"id":"chicken_turkey","label":"5號鮮雞火雞","data":{"brandName":"TERRA CANIS 醍菈鮮廚","brandSub":"5號鮮雞火雞（德國）","overallScore":"8.8/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"德國製造","cls":"g"},{"text":"雙禽配方","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":74,"protein":13,"fat":6,"phos":0.22,"calcium":0.27,"sodium":0.26,"magnesium":0.022,"ash":2.2},"verdict":"德國雙禽低脂無穀無膠，適合日常主食","_bk":"terra_canis","_fk":"chicken_turkey"}},{"id":"salmon_chicken","label":"6號鮭魚鮮雞","data":{"brandName":"TERRA CANIS 醍菈鮮廚","brandSub":"6號鮭魚鮮雞（德國）","overallScore":"8.9/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"德國製造","cls":"g"},{"text":"海陸雙蛋白","cls":"g"},{"text":"高Omega-3","cls":"g"}],"nutrients":{"water":74,"protein":13,"fat":6.5,"phos":0.22,"calcium":0.27,"sodium":0.26,"magnesium":0.022,"ash":2.3},"verdict":"鮭魚雞肉雙蛋白高Omega-3，德國製","_bk":"terra_canis","_fk":"salmon_chicken"}},{"id":"rabbit_turkey","label":"7號兔肉火雞","data":{"brandName":"TERRA CANIS 醍菈鮮廚","brandSub":"7號兔肉火雞（德國）","overallScore":"8.9/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"德國製造","cls":"g"},{"text":"低敏兔肉","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":74,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.26,"magnesium":0.021,"ash":2.2},"verdict":"兔肉火雞低敏雙蛋白，德國製，過敏貓輪替","_bk":"terra_canis","_fk":"rabbit_turkey"}},{"id":"lamb_chicken","label":"8號羊肉鮮雞","data":{"brandName":"TERRA CANIS 醍菈鮮廚","brandSub":"8號羊肉鮮雞（德國）","overallScore":"8.9/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"德國製造","cls":"g"},{"text":"低敏羊肉","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":74,"protein":13,"fat":6,"phos":0.22,"calcium":0.27,"sodium":0.26,"magnesium":0.022,"ash":2.3},"verdict":"羊肉雞肉雙蛋白，德國製無穀無膠，適合輪替","_bk":"terra_canis","_fk":"lamb_chicken"}}]},
"instinct_brand":{"label":"Instinct 原點","aliases":["instinct","原點"],"flavors":[{"id":"chicken","label":"皇極鮮雞","data":{"brandName":"Instinct 原點","brandSub":"皇極鮮雞主食罐","overallScore":"8.7/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"85%動物原料","cls":"g"},{"text":"無穀無膠","cls":"g"},{"text":"添加益生菌","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":6,"phos":0.22,"calcium":0.28,"sodium":0.27,"magnesium":0.023,"ash":2.3},"verdict":"85%動物原料添加益生菌，無穀無膠，腸道健康首選","_bk":"instinct_brand","_fk":"chicken"}},{"id":"venison_gf","label":"無穀鹿肉","data":{"brandName":"Instinct 原點","brandSub":"無穀鹿肉主食罐","overallScore":"8.9/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"無穀物","cls":"g"},{"text":"低敏鹿肉","cls":"g"},{"text":"添加益生菌","cls":"g"}],"nutrients":{"water":75,"protein":14,"fat":6,"phos":0.23,"calcium":0.28,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"低敏鹿肉添加益生菌，適合過敏腸胃敏感貓","_bk":"instinct_brand","_fk":"venison_gf"}},{"id":"duck_gf","label":"無穀鴨肉","data":{"brandName":"Instinct 原點","brandSub":"無穀鴨肉主食罐","overallScore":"8.7/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"無穀物","cls":"g"},{"text":"低敏鴨肉","cls":"g"},{"text":"添加益生菌","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":6,"phos":0.22,"calcium":0.28,"sodium":0.27,"magnesium":0.023,"ash":2.3},"verdict":"低敏鴨肉益生菌，無穀，適合輪替日常主食","_bk":"instinct_brand","_fk":"duck_gf"}},{"id":"salmon_gf","label":"無穀鮭魚","data":{"brandName":"Instinct 原點","brandSub":"無穀鮭魚主食罐","overallScore":"8.8/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"無穀物","cls":"g"},{"text":"高Omega-3","cls":"g"},{"text":"添加益生菌","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":6.5,"phos":0.22,"calcium":0.28,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"無穀鮭魚Omega-3加益生菌，三重護眼護膚腸道","_bk":"instinct_brand","_fk":"salmon_gf"}},{"id":"chicken_gf","label":"無穀雞肉","data":{"brandName":"Instinct 原點","brandSub":"無穀雞肉主食罐","overallScore":"8.6/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"無穀物","cls":"g"},{"text":"高適口性","cls":"g"},{"text":"添加益生菌","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":6,"phos":0.22,"calcium":0.28,"sodium":0.27,"magnesium":0.023,"ash":2.3},"verdict":"無穀雞肉益生菌，高適口日常主食首選","_bk":"instinct_brand","_fk":"chicken_gf"}},{"id":"lamb_gf","label":"無穀羊肉","data":{"brandName":"Instinct 原點","brandSub":"無穀羊肉主食罐","overallScore":"8.7/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"無穀物","cls":"g"},{"text":"低敏羊肉","cls":"g"},{"text":"添加益生菌","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":6,"phos":0.22,"calcium":0.28,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"低敏羊肉益生菌，無穀物，輪替飲食佳","_bk":"instinct_brand","_fk":"lamb_gf"}},{"id":"salmon_lp","label":"低敏鮭魚","data":{"brandName":"Instinct 原點","brandSub":"低敏鮭魚主食罐","overallScore":"8.9/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"限制成分","cls":"g"},{"text":"低敏配方","cls":"g"},{"text":"高Omega-3","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":6.5,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.022,"ash":2.2},"verdict":"限制成分低敏鮭魚，適合嚴重過敏貓排除飲食","_bk":"instinct_brand","_fk":"salmon_lp"}},{"id":"turkey_lp","label":"低敏火雞肉","data":{"brandName":"Instinct 原點","brandSub":"低敏火雞肉主食罐","overallScore":"8.7/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"限制成分","cls":"g"},{"text":"低敏配方","cls":"g"},{"text":"低脂設計","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":5.5,"phos":0.21,"calcium":0.27,"sodium":0.26,"magnesium":0.022,"ash":2.2},"verdict":"限制成分低敏火雞，低脂排除飲食首選","_bk":"instinct_brand","_fk":"turkey_lp"}}]},
"abao":{"label":"Abao 阿寶","aliases":["abao","阿寶"],"flavors":[{"id":"tuna_bass","label":"鮪魚×鱸魚","data":{"brandName":"Abao 阿寶","brandSub":"鮪魚×鱸魚主食罐（台灣）","overallScore":"8.4/10","overallClass":"g","meatPercent":"80%","tags":[{"text":"雙魚蛋白","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":78,"protein":12,"fat":4.5,"phos":0.22,"calcium":0.26,"sodium":0.3,"magnesium":0.024,"ash":2.1},"verdict":"雙魚蛋白高適口，台灣製無穀無膠","_bk":"abao","_fk":"tuna_bass"}},{"id":"chicken_quail","label":"雞肉×鵪鶉","data":{"brandName":"Abao 阿寶","brandSub":"雞肉×鵪鶉主食罐（台灣）","overallScore":"8.5/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"稀有禽肉","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":13,"fat":5,"phos":0.23,"calcium":0.27,"sodium":0.29,"magnesium":0.023,"ash":2.2},"verdict":"雞肉搭配稀有鵪鶉，低敏禽肉配方","_bk":"abao","_fk":"chicken_quail"}},{"id":"beef_tuna","label":"牛肉×鮪魚","data":{"brandName":"Abao 阿寶","brandSub":"牛肉×鮪魚主食罐（台灣）","overallScore":"8.4/10","overallClass":"g","meatPercent":"80%","tags":[{"text":"海陸雙蛋白","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":13,"fat":5,"phos":0.23,"calcium":0.27,"sodium":0.3,"magnesium":0.023,"ash":2.2},"verdict":"牛肉鮪魚海陸雙蛋白，豐富胺基酸","_bk":"abao","_fk":"beef_tuna"}},{"id":"marlin_bonito","label":"旗魚×鰹魚","data":{"brandName":"Abao 阿寶","brandSub":"旗魚×鰹魚主食罐（台灣）","overallScore":"8.4/10","overallClass":"g","meatPercent":"80%","tags":[{"text":"台灣在地魚","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":78,"protein":12,"fat":4,"phos":0.21,"calcium":0.25,"sodium":0.31,"magnesium":0.023,"ash":2},"verdict":"台灣在地旗魚鰹魚，天然牛磺酸豐富","_bk":"abao","_fk":"marlin_bonito"}}]},
"betty's":{"label":"Betty's 蓓蒂奶奶","aliases":["betty's","蓓蒂奶奶","bettys"],"flavors":[{"id":"duck","label":"鴨肉","data":{"brandName":"Betty's 蓓蒂奶奶","brandSub":"鴨肉主食罐（德國）","overallScore":"8.8/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"德國製造","cls":"g"},{"text":"低敏鴨肉","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.23,"calcium":0.28,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"德國製低敏鴨肉，成分乾淨，適合過敏貓","_bk":"betty's","_fk":"duck"}},{"id":"chicken_salmon","label":"雞肉+鮭魚+琉璃苣籽油","data":{"brandName":"Betty's 蓓蒂奶奶","brandSub":"雞肉鮭魚琉璃苣籽油主食罐（德國）","overallScore":"9.0/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"Omega-3+6","cls":"g"},{"text":"琉璃苣籽油","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":7,"phos":0.23,"calcium":0.28,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"雞肉鮭魚+琉璃苣籽油，Omega-3/6雙效護膚護毛","_bk":"betty's","_fk":"chicken_salmon"}},{"id":"chicken_pheasant","label":"雞肉+野雞+琉璃苣籽油","data":{"brandName":"Betty's 蓓蒂奶奶","brandSub":"雞肉野雞琉璃苣籽油主食罐（德國）","overallScore":"9.0/10","overallClass":"g","meatPercent":"86%","tags":[{"text":"稀有野雞肉","cls":"g"},{"text":"琉璃苣籽油","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":14,"fat":7,"phos":0.24,"calcium":0.29,"sodium":0.27,"magnesium":0.021,"ash":2.3},"verdict":"野雞稀有蛋白搭配琉璃苣籽油，護膚護毛首選","_bk":"betty's","_fk":"chicken_pheasant"}},{"id":"chicken_turkey","label":"雞肉+火雞肉+琉璃苣籽油","data":{"brandName":"Betty's 蓓蒂奶奶","brandSub":"雞肉火雞肉琉璃苣籽油主食罐（德國）","overallScore":"8.9/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"雙禽蛋白","cls":"g"},{"text":"琉璃苣籽油","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":7,"phos":0.23,"calcium":0.28,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"雞火雙禽+琉璃苣籽油，均衡蛋白護毛","_bk":"betty's","_fk":"chicken_turkey"}},{"id":"chicken_turkey_kitten","label":"雞肉+火雞肉（幼貓）","data":{"brandName":"Betty's 蓓蒂奶奶","brandSub":"雞肉火雞肉幼貓主食罐（德國）","overallScore":"8.9/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"幼貓配方","cls":"g"},{"text":"高蛋白","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":14,"fat":7,"phos":0.24,"calcium":0.3,"sodium":0.27,"magnesium":0.022,"ash":2.4},"verdict":"幼貓專屬高蛋白配方，DHA助發育","_bk":"betty's","_fk":"chicken_turkey_kitten"}},{"id":"kangaroo","label":"袋鼠肉+馬鈴薯","data":{"brandName":"Betty's 蓓蒂奶奶","brandSub":"袋鼠肉馬鈴薯主食罐（德國）","overallScore":"9.1/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"極稀有低敏","cls":"g"},{"text":"袋鼠野生肉","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":14,"fat":5.5,"phos":0.23,"calcium":0.28,"sodium":0.26,"magnesium":0.02,"ash":2.3},"verdict":"袋鼠野生肉極低敏，嚴重過敏貓咪首選","_bk":"betty's","_fk":"kangaroo"}},{"id":"goatmilk_chick_tuna","label":"羊奶幼貓-雞鮪戀乳","data":{"brandName":"Betty's 蓓蒂奶奶","brandSub":"羊奶幼貓雞鮪戀乳主食罐（德國）","overallScore":"8.8/10","overallClass":"g","meatPercent":"80%","tags":[{"text":"羊奶配方","cls":"g"},{"text":"幼貓專屬","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6.5,"phos":0.23,"calcium":0.3,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"羊奶幼貓配方，含DHA助發育，適口性佳","_bk":"betty's","_fk":"goatmilk_chick_tuna"}},{"id":"goatmilk_chicken","label":"羊奶幼貓-嫩雞戀乳","data":{"brandName":"Betty's 蓓蒂奶奶","brandSub":"羊奶幼貓嫩雞戀乳主食罐（德國）","overallScore":"8.8/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"羊奶雞肉","cls":"g"},{"text":"幼貓配方","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6.5,"phos":0.23,"calcium":0.3,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"羊奶嫩雞幼貓配方，鈣質豐富助骨骼發育","_bk":"betty's","_fk":"goatmilk_chicken"}},{"id":"poultry","label":"家禽肉","data":{"brandName":"Betty's 蓓蒂奶奶","brandSub":"家禽肉主食罐（德國）","overallScore":"8.6/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"多種禽肉","cls":"g"},{"text":"無穀無膠","cls":"g"},{"text":"高蛋白","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6.5,"phos":0.23,"calcium":0.28,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"多種禽肉均衡配方，德國製造品質保證","_bk":"betty's","_fk":"poultry"}}]},
"carnivore raw":{"label":"Carnivore Raw 卡尼","aliases":["carnivore raw","卡尼","carnivore"],"flavors":[{"id":"chicken_venison","label":"雞肉+鹿肉","data":{"brandName":"Carnivore Raw 卡尼","brandSub":"雞肉鹿肉主食罐","overallScore":"8.9/10","overallClass":"g","meatPercent":"88%","tags":[{"text":"低敏鹿肉","cls":"g"},{"text":"無穀無膠","cls":"g"},{"text":"高肉量","cls":"g"}],"nutrients":{"water":74,"protein":14,"fat":6.5,"phos":0.24,"calcium":0.29,"sodium":0.27,"magnesium":0.021,"ash":2.4},"verdict":"雞肉搭配低敏鹿肉，高肉量無添加","_bk":"carnivore raw","_fk":"chicken_venison"}},{"id":"chicken_duck","label":"雞肉+鴨肉","data":{"brandName":"Carnivore Raw 卡尼","brandSub":"雞肉鴨肉主食罐","overallScore":"8.8/10","overallClass":"g","meatPercent":"88%","tags":[{"text":"低敏鴨肉","cls":"g"},{"text":"無穀無膠","cls":"g"},{"text":"高肉量","cls":"g"}],"nutrients":{"water":74,"protein":14,"fat":6,"phos":0.23,"calcium":0.28,"sodium":0.27,"magnesium":0.021,"ash":2.3},"verdict":"雞鴨雙禽低敏配方，高肉量無添加","_bk":"carnivore raw","_fk":"chicken_duck"}},{"id":"chicken_beef","label":"雞肉+牛肉","data":{"brandName":"Carnivore Raw 卡尼","brandSub":"雞肉牛肉主食罐","overallScore":"8.8/10","overallClass":"g","meatPercent":"88%","tags":[{"text":"海陸雙蛋白","cls":"g"},{"text":"無穀無膠","cls":"g"},{"text":"高鐵質","cls":"g"}],"nutrients":{"water":74,"protein":14,"fat":6.5,"phos":0.24,"calcium":0.29,"sodium":0.27,"magnesium":0.021,"ash":2.4},"verdict":"雞牛雙蛋白高鐵質，胺基酸完整均衡","_bk":"carnivore raw","_fk":"chicken_beef"}},{"id":"chicken","label":"雞肉","data":{"brandName":"Carnivore Raw 卡尼","brandSub":"雞肉主食罐","overallScore":"8.7/10","overallClass":"g","meatPercent":"90%","tags":[{"text":"單一蛋白","cls":"g"},{"text":"無穀無膠","cls":"g"},{"text":"90%高肉量","cls":"g"}],"nutrients":{"water":74,"protein":14,"fat":6,"phos":0.23,"calcium":0.28,"sodium":0.27,"magnesium":0.021,"ash":2.3},"verdict":"單一雞肉蛋白90%高肉量，適合排除飲食","_bk":"carnivore raw","_fk":"chicken"}}]},
"catdives":{"label":"catdives 貓爾地夫","aliases":["catdives","貓爾地夫"],"flavors":[{"id":"filet_beef","label":"菲力牛（頂級）","data":{"brandName":"catdives 貓爾地夫","brandSub":"頂級享受菲力牛主食罐","overallScore":"9.0/10","overallClass":"g","meatPercent":"88%","tags":[{"text":"頂級牛肉","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":14,"fat":6.5,"phos":0.25,"calcium":0.3,"sodium":0.27,"magnesium":0.021,"ash":2.4},"verdict":"頂級菲力牛肉低脂高蛋白，台灣製無添加","_bk":"catdives","_fk":"filet_beef"}},{"id":"venison","label":"嚴選鹿（頂級）","data":{"brandName":"catdives 貓爾地夫","brandSub":"頂級享受嚴選鹿主食罐","overallScore":"9.1/10","overallClass":"g","meatPercent":"88%","tags":[{"text":"野生鹿肉","cls":"g"},{"text":"低敏稀有","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":74,"protein":15,"fat":6,"phos":0.24,"calcium":0.29,"sodium":0.26,"magnesium":0.02,"ash":2.3},"verdict":"頂級野生鹿肉低敏，過敏貓咪首選","_bk":"catdives","_fk":"venison"}},{"id":"tuna_chicken","label":"鮪魚雞胸肉（經典）","data":{"brandName":"catdives 貓爾地夫","brandSub":"經典回味鮪魚雞胸肉主食罐","overallScore":"8.5/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"高適口雙蛋白","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":78,"protein":12,"fat":4,"phos":0.21,"calcium":0.25,"sodium":0.3,"magnesium":0.023,"ash":2},"verdict":"鮪魚雞胸雙蛋白，高適口性日常主食","_bk":"catdives","_fk":"tuna_chicken"}},{"id":"chicken_breast","label":"雞胸肉（經典）","data":{"brandName":"catdives 貓爾地夫","brandSub":"經典回味雞胸肉主食罐","overallScore":"8.4/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"純雞胸低脂","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":78,"protein":12,"fat":3.5,"phos":0.21,"calcium":0.25,"sodium":0.29,"magnesium":0.022,"ash":2},"verdict":"純雞胸低脂高蛋白，適合體重管理","_bk":"catdives","_fk":"chicken_breast"}},{"id":"beef_chicken","label":"板腱牛雞胸肉（經典）","data":{"brandName":"catdives 貓爾地夫","brandSub":"經典回味板腱牛雞胸肉主食罐","overallScore":"8.5/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"海陸雙蛋白","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":13,"fat":5,"phos":0.22,"calcium":0.26,"sodium":0.3,"magnesium":0.022,"ash":2.1},"verdict":"板腱牛搭配雞胸，海陸均衡蛋白","_bk":"catdives","_fk":"beef_chicken"}},{"id":"lamb_chicken","label":"嚴選羊雞胸肉（經典）","data":{"brandName":"catdives 貓爾地夫","brandSub":"經典回味嚴選羊雞胸肉主食罐","overallScore":"8.6/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"低敏羊肉","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":13,"fat":5.5,"phos":0.23,"calcium":0.28,"sodium":0.29,"magnesium":0.022,"ash":2.2},"verdict":"羊肉雞胸雙蛋白低敏，適合過敏貓日常","_bk":"catdives","_fk":"lamb_chicken"}}]},
"furkid lab":{"label":"FURKID LAB 毛研所","aliases":["furkid lab","毛研所","furkidlab"],"flavors":[{"id":"duck","label":"香舒嫩鴨","data":{"brandName":"FURKID LAB 毛研所","brandSub":"香舒嫩鴨主食罐（台灣）","overallScore":"8.8/10","overallClass":"g","meatPercent":"86%","tags":[{"text":"低敏鴨肉","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":6,"phos":0.23,"calcium":0.28,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"低敏嫩鴨，台灣科學配方，無穀無膠","_bk":"furkid lab","_fk":"duck"}},{"id":"venison","label":"野味燉鹿","data":{"brandName":"FURKID LAB 毛研所","brandSub":"野味燉鹿主食罐（台灣）","overallScore":"9.0/10","overallClass":"g","meatPercent":"87%","tags":[{"text":"野生鹿肉","cls":"g"},{"text":"低敏稀有","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":74,"protein":14,"fat":6,"phos":0.23,"calcium":0.28,"sodium":0.26,"magnesium":0.02,"ash":2.3},"verdict":"野生鹿肉低敏，台灣科學配方，過敏貓首選","_bk":"furkid lab","_fk":"venison"}},{"id":"beef","label":"爆濃牛排","data":{"brandName":"FURKID LAB 毛研所","brandSub":"爆濃牛排主食罐（台灣）","overallScore":"8.8/10","overallClass":"g","meatPercent":"86%","tags":[{"text":"高鐵牛肉","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":74,"protein":14,"fat":7,"phos":0.25,"calcium":0.3,"sodium":0.27,"magnesium":0.021,"ash":2.4},"verdict":"高鐵牛肉爆濃配方，活躍貓咪首選","_bk":"furkid lab","_fk":"beef"}},{"id":"fish","label":"海味鮮魚","data":{"brandName":"FURKID LAB 毛研所","brandSub":"海味鮮魚主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"多種鮮魚","cls":"g"},{"text":"Omega-3","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.29,"magnesium":0.023,"ash":2.2},"verdict":"多種鮮魚Omega-3豐富，護眼護膚護心","_bk":"furkid lab","_fk":"fish"}},{"id":"seafood","label":"活跳雙鮮","data":{"brandName":"FURKID LAB 毛研所","brandSub":"活跳雙鮮主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"海鮮雙寶","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":4,"phos":0.21,"calcium":0.25,"sodium":0.31,"magnesium":0.024,"ash":2},"verdict":"海鮮雙鮮適口性佳，含甲殼類需注意過敏","_bk":"furkid lab","_fk":"seafood"}},{"id":"chicken","label":"多汁雞腿","data":{"brandName":"FURKID LAB 毛研所","brandSub":"多汁雞腿主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"86%","tags":[{"text":"台灣製造","cls":"g"},{"text":"高適口性","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.23,"calcium":0.27,"sodium":0.27,"magnesium":0.022,"ash":2.2},"verdict":"多汁雞腿肉高適口，台灣科學配方","_bk":"furkid lab","_fk":"chicken"}}]},
"gussto":{"label":"Gussto 惡魔喵","aliases":["gussto","惡魔喵"],"flavors":[{"id":"chicken","label":"1號鮮嫩雞肉","data":{"brandName":"Gussto 惡魔喵","brandSub":"1號鮮嫩雞肉主食罐（波蘭）","overallScore":"8.5/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"波蘭製造","cls":"g"},{"text":"無穀無膠","cls":"g"},{"text":"高肉量","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.23,"calcium":0.27,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"波蘭製鮮嫩雞肉，無穀無膠成分乾淨","_bk":"gussto","_fk":"chicken"}},{"id":"salmon","label":"2號野生鮭魚","data":{"brandName":"Gussto 惡魔喵","brandSub":"2號野生鮭魚主食罐（波蘭）","overallScore":"8.8/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"野生鮭魚","cls":"g"},{"text":"高Omega-3","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":7,"phos":0.23,"calcium":0.28,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"野生鮭魚Omega-3豐富，護眼護膚護心","_bk":"gussto","_fk":"salmon"}},{"id":"pork","label":"3號野味豬肉","data":{"brandName":"Gussto 惡魔喵","brandSub":"3號野味豬肉主食罐（波蘭）","overallScore":"8.5/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"野味豬肉","cls":"g"},{"text":"稀有蛋白","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.23,"calcium":0.27,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"野味豬肉稀有蛋白，適合輪替使用","_bk":"gussto","_fk":"pork"}},{"id":"lamb","label":"4號稚嫩羊肉","data":{"brandName":"Gussto 惡魔喵","brandSub":"4號稚嫩羊肉主食罐（波蘭）","overallScore":"8.7/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"低敏羊肉","cls":"g"},{"text":"無穀無膠","cls":"g"},{"text":"高肉量","cls":"g"}],"nutrients":{"water":75,"protein":14,"fat":6.5,"phos":0.24,"calcium":0.29,"sodium":0.27,"magnesium":0.021,"ash":2.3},"verdict":"低敏羊肉配方，過敏貓咪適合輪替","_bk":"gussto","_fk":"lamb"}},{"id":"turkey_duck","label":"5號美味火雞+嫩鴨","data":{"brandName":"Gussto 惡魔喵","brandSub":"5號美味火雞嫩鴨主食罐（波蘭）","overallScore":"8.7/10","overallClass":"g","meatPercent":"86%","tags":[{"text":"雙禽低敏","cls":"g"},{"text":"無穀無膠","cls":"g"},{"text":"高肉量","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":6,"phos":0.23,"calcium":0.28,"sodium":0.27,"magnesium":0.021,"ash":2.3},"verdict":"火雞鴨肉雙禽低敏配方，適合過敏貓輪替","_bk":"gussto","_fk":"turkey_duck"}},{"id":"turkey_tuna","label":"6號美味火雞+鮪魚","data":{"brandName":"Gussto 惡魔喵","brandSub":"6號美味火雞鮪魚主食罐（波蘭）","overallScore":"8.6/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"禽魚雙蛋白","cls":"g"},{"text":"無穀無膠","cls":"g"},{"text":"高適口性","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"火雞鮪魚禽魚雙蛋白，高適口性無添加","_bk":"gussto","_fk":"turkey_tuna"}}]},
"catssay":{"label":"Catssay 貓有話說","aliases":["catssay","貓有話說"],"flavors":[{"id":"mahi_seacucumber","label":"鬼頭刀海參","data":{"brandName":"Catssay 貓有話說","brandSub":"尋寶罐鬼頭刀海參","overallScore":"8.6/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣在地食材","cls":"g"},{"text":"天然海參","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":78,"protein":12,"fat":4,"phos":0.21,"calcium":0.25,"sodium":0.3,"magnesium":0.023,"ash":2},"verdict":"鬼頭刀配海參膠原蛋白，關節護眼雙效","_bk":"catssay","_fk":"mahi_seacucumber"}},{"id":"pure_chicken","label":"純雞肉","data":{"brandName":"Catssay 貓有話說","brandSub":"尋寶罐純雞肉","overallScore":"8.4/10","overallClass":"g","meatPercent":"88%","tags":[{"text":"單一蛋白","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"純雞肉單一蛋白，適合排除飲食","_bk":"catssay","_fk":"pure_chicken"}},{"id":"beef_chicken","label":"牛肉嫩雞","data":{"brandName":"Catssay 貓有話說","brandSub":"尋寶罐牛肉嫩雞","overallScore":"8.5/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"海陸雙蛋白","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":13,"fat":5.5,"phos":0.23,"calcium":0.27,"sodium":0.29,"magnesium":0.022,"ash":2.2},"verdict":"牛雞雙蛋白均衡，高鐵質胺基酸完整","_bk":"catssay","_fk":"beef_chicken"}},{"id":"seafood","label":"澎魚宴","data":{"brandName":"Catssay 貓有話說","brandSub":"尋寶罐澎魚宴","overallScore":"8.5/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"多種海鮮","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"高適口性","cls":"g"}],"nutrients":{"water":78,"protein":12,"fat":3.5,"phos":0.2,"calcium":0.24,"sodium":0.32,"magnesium":0.024,"ash":2},"verdict":"多種海鮮澎湃宴，天然牛磺酸豐富","_bk":"catssay","_fk":"seafood"}},{"id":"sea_urchin_shrimp","label":"海膽大蝦","data":{"brandName":"Catssay 貓有話說","brandSub":"尋寶罐海膽大蝦","overallScore":"8.6/10","overallClass":"g","meatPercent":"80%","tags":[{"text":"頂級海鮮","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"高適口性","cls":"g"}],"nutrients":{"water":78,"protein":12,"fat":3.5,"phos":0.2,"calcium":0.24,"sodium":0.32,"magnesium":0.024,"ash":2},"verdict":"頂級海膽大蝦適口性極佳，含甲殼類需注意過敏","_bk":"catssay","_fk":"sea_urchin_shrimp"}},{"id":"pigeon_chicken","label":"乳鴿嫩雞","data":{"brandName":"Catssay 貓有話說","brandSub":"尋寶罐乳鴿嫩雞","overallScore":"8.7/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"稀有乳鴿肉","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.23,"calcium":0.28,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"稀有乳鴿搭配嫩雞，禽肉低敏高適口","_bk":"catssay","_fk":"pigeon_chicken"}},{"id":"cod_salmon_lactoferrin","label":"鱈魚+鮭魚（乳鐵蛋白）","data":{"brandName":"Catssay 貓有話說","brandSub":"乳鐵蛋白鱈魚鮭魚","overallScore":"8.9/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"乳鐵蛋白機能","cls":"g"},{"text":"Omega-3","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5.5,"phos":0.21,"calcium":0.26,"sodium":0.28,"magnesium":0.022,"ash":2.1},"verdict":"乳鐵蛋白+魚油雙效，免疫護眼一罐完成","_bk":"catssay","_fk":"cod_salmon_lactoferrin"}},{"id":"sea_urchin_scallop_lactoferrin","label":"海膽+干貝（乳鐵蛋白）","data":{"brandName":"Catssay 貓有話說","brandSub":"乳鐵蛋白海膽干貝","overallScore":"8.9/10","overallClass":"g","meatPercent":"80%","tags":[{"text":"乳鐵蛋白機能","cls":"g"},{"text":"頂級海鮮","cls":"g"},{"text":"高適口性","cls":"g"}],"nutrients":{"water":78,"protein":12,"fat":3.5,"phos":0.2,"calcium":0.24,"sodium":0.31,"magnesium":0.023,"ash":2},"verdict":"乳鐵蛋白強效免疫，頂級海鮮高適口","_bk":"catssay","_fk":"sea_urchin_scallop_lactoferrin"}},{"id":"duck_lactoferrin","label":"櫻桃鴨（乳鐵蛋白）","data":{"brandName":"Catssay 貓有話說","brandSub":"乳鐵蛋白櫻桃鴨","overallScore":"8.9/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"低敏鴨肉","cls":"g"},{"text":"乳鐵蛋白","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.021,"ash":2.2},"verdict":"低敏鴨肉+乳鐵蛋白，免疫護眼低敏三效","_bk":"catssay","_fk":"duck_lactoferrin"}},{"id":"goat_chicken_lactoferrin","label":"山羊奶+雞（乳鐵蛋白）","data":{"brandName":"Catssay 貓有話說","brandSub":"乳鐵蛋白山羊奶雞","overallScore":"8.8/10","overallClass":"g","meatPercent":"80%","tags":[{"text":"羊奶機能","cls":"g"},{"text":"乳鐵蛋白","cls":"g"},{"text":"高適口性","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5.5,"phos":0.21,"calcium":0.3,"sodium":0.28,"magnesium":0.022,"ash":2.1},"verdict":"羊奶雞肉+乳鐵蛋白，適口性佳骨骼免疫雙效","_bk":"catssay","_fk":"goat_chicken_lactoferrin"}},{"id":"rabbit_quail_lactoferrin","label":"兔肉+鵪鶉（乳鐵蛋白）","data":{"brandName":"Catssay 貓有話說","brandSub":"乳鐵蛋白兔肉鵪鶉","overallScore":"9.0/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"雙稀有低敏","cls":"g"},{"text":"乳鐵蛋白","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.26,"magnesium":0.02,"ash":2.2},"verdict":"兔肉鵪鶉雙稀有低敏+乳鐵蛋白，嚴重過敏貓最佳選擇","_bk":"catssay","_fk":"rabbit_quail_lactoferrin"}}]},
"couch_potato":{"label":"Couch Potato 沙發馬鈴薯","aliases":["couch potato","沙發馬鈴薯","couchpotato"],"flavors":[{"id":"pure_chicken","label":"溫體雞（PURE）","data":{"brandName":"Couch Potato 沙發馬鈴薯","brandSub":"PURE純粹罐溫體雞","overallScore":"9.0/10","overallClass":"g","meatPercent":"92%","tags":[{"text":"台灣溫體雞","cls":"g"},{"text":"成分極簡","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":73,"protein":15,"fat":7,"phos":0.25,"calcium":0.3,"sodium":0.26,"magnesium":0.021,"ash":2.4},"verdict":"台灣溫體雞成分極簡，92%鮮肉無添加","_bk":"couch_potato","_fk":"pure_chicken"}},{"id":"pure_pork","label":"溫體豬（PURE）","data":{"brandName":"Couch Potato 沙發馬鈴薯","brandSub":"PURE純粹罐溫體豬","overallScore":"8.9/10","overallClass":"g","meatPercent":"92%","tags":[{"text":"台灣溫體豬","cls":"g"},{"text":"稀有豬肉罐","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":73,"protein":15,"fat":7.5,"phos":0.26,"calcium":0.3,"sodium":0.27,"magnesium":0.021,"ash":2.5},"verdict":"台灣溫體豬稀有蛋白，成分極簡92%無添加","_bk":"couch_potato","_fk":"pure_pork"}},{"id":"pure_beef","label":"溫體牛（PURE）","data":{"brandName":"Couch Potato 沙發馬鈴薯","brandSub":"PURE純粹罐溫體牛","overallScore":"9.1/10","overallClass":"g","meatPercent":"92%","tags":[{"text":"台灣溫體牛","cls":"g"},{"text":"高鐵質","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":72,"protein":15,"fat":7.5,"phos":0.26,"calcium":0.31,"sodium":0.26,"magnesium":0.02,"ash":2.5},"verdict":"台灣溫體牛高鐵質92%極簡配方，活躍貓首選","_bk":"couch_potato","_fk":"pure_beef"}},{"id":"berry_chicken","label":"莓果佐雞（Power）","data":{"brandName":"Couch Potato 沙發馬鈴薯","brandSub":"Power超能罐莓果佐雞","overallScore":"8.9/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"莓果抗氧化","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":6,"phos":0.23,"calcium":0.28,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"莓果花青素+雞肉，抗氧化護眼雙效","_bk":"couch_potato","_fk":"berry_chicken"}},{"id":"rabbit","label":"綠野兔肉（Power）","data":{"brandName":"Couch Potato 沙發馬鈴薯","brandSub":"Power超能罐綠野兔肉","overallScore":"9.1/10","overallClass":"g","meatPercent":"88%","tags":[{"text":"極稀有低敏","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":74,"protein":14,"fat":6,"phos":0.23,"calcium":0.28,"sodium":0.26,"magnesium":0.02,"ash":2.3},"verdict":"極稀有兔肉低敏，嚴重過敏貓咪最佳選擇","_bk":"couch_potato","_fk":"rabbit"}},{"id":"pomegranate_chicken","label":"紅石榴雞（Power）","data":{"brandName":"Couch Potato 沙發馬鈴薯","brandSub":"Power超能罐紅石榴雞","overallScore":"8.9/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"石榴抗氧化","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":6,"phos":0.23,"calcium":0.28,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"紅石榴多酚+雞肉，護心抗氧化雙效","_bk":"couch_potato","_fk":"pomegranate_chicken"}},{"id":"pastoral_chicken","label":"田園嫩雞（Power）","data":{"brandName":"Couch Potato 沙發馬鈴薯","brandSub":"Power超能罐田園嫩雞","overallScore":"8.8/10","overallClass":"g","meatPercent":"87%","tags":[{"text":"台灣田園雞","cls":"g"},{"text":"蔬果豐富","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":6,"phos":0.23,"calcium":0.27,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"田園嫩雞蔬果豐富，均衡配方日常主食","_bk":"couch_potato","_fk":"pastoral_chicken"}},{"id":"salmon","label":"活力野鮭（Power）","data":{"brandName":"Couch Potato 沙發馬鈴薯","brandSub":"Power超能罐活力野鮭","overallScore":"9.0/10","overallClass":"g","meatPercent":"87%","tags":[{"text":"野生鮭魚","cls":"g"},{"text":"高Omega-3","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":7,"phos":0.23,"calcium":0.28,"sodium":0.27,"magnesium":0.021,"ash":2.3},"verdict":"野生鮭魚高Omega-3，活力能量護眼護膚","_bk":"couch_potato","_fk":"salmon"}},{"id":"venison","label":"原野鮮鹿（Power）","data":{"brandName":"Couch Potato 沙發馬鈴薯","brandSub":"Power超能罐原野鮮鹿","overallScore":"9.1/10","overallClass":"g","meatPercent":"88%","tags":[{"text":"野生低敏鹿肉","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":74,"protein":14,"fat":6.5,"phos":0.24,"calcium":0.29,"sodium":0.26,"magnesium":0.02,"ash":2.4},"verdict":"野生鹿肉低敏，超能配方過敏貓首選","_bk":"couch_potato","_fk":"venison"}},{"id":"land_sea_chicken","label":"海陸雞魚（Power）","data":{"brandName":"Couch Potato 沙發馬鈴薯","brandSub":"Power超能罐海陸雞魚","overallScore":"8.9/10","overallClass":"g","meatPercent":"86%","tags":[{"text":"海陸雙蛋白","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"雞魚海陸雙蛋白+Omega-3，均衡全效配方","_bk":"couch_potato","_fk":"land_sea_chicken"}}]},
"firstmate":{"label":"FirstMate 第一饗宴","aliases":["firstmate","第一饗宴"],"flavors":[{"id":"chicken","label":"非籠養雞","data":{"brandName":"FirstMate 第一饗宴","brandSub":"非籠養雞主食罐（加拿大）","overallScore":"8.8/10","overallClass":"g","meatPercent":"80%","tags":[{"text":"非籠養認證","cls":"g"},{"text":"無穀無膠","cls":"g"},{"text":"加拿大製","cls":"g"}],"nutrients":{"water":78,"protein":11,"fat":5,"phos":0.21,"calcium":0.25,"sodium":0.29,"magnesium":0.023,"ash":2.1},"verdict":"非籠養人道認證雞肉，加拿大製無穀無膠","_bk":"firstmate","_fk":"chicken"}},{"id":"turkey","label":"非籠養火雞","data":{"brandName":"FirstMate 第一饗宴","brandSub":"非籠養火雞主食罐（加拿大）","overallScore":"8.9/10","overallClass":"g","meatPercent":"80%","tags":[{"text":"非籠養認證","cls":"g"},{"text":"低脂高蛋白","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":78,"protein":11,"fat":4.5,"phos":0.2,"calcium":0.24,"sodium":0.28,"magnesium":0.022,"ash":2},"verdict":"非籠養火雞低脂，加拿大製體重管理首選","_bk":"firstmate","_fk":"turkey"}},{"id":"salmon","label":"野生鮭魚","data":{"brandName":"FirstMate 第一饗宴","brandSub":"野生鮭魚主食罐（加拿大）","overallScore":"9.0/10","overallClass":"g","meatPercent":"80%","tags":[{"text":"野生鮭魚","cls":"g"},{"text":"高Omega-3","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":78,"protein":11,"fat":6,"phos":0.21,"calcium":0.25,"sodium":0.28,"magnesium":0.022,"ash":2.1},"verdict":"野生鮭魚Omega-3豐富，加拿大製護眼護膚","_bk":"firstmate","_fk":"salmon"}}]},
"munchee":{"label":"Munchee 貪貪","aliases":["munchee","貪貪"],"flavors":[{"id":"chicken_super","label":"經典嫩雞（超肉泥）","data":{"brandName":"Munchee 貪貪","brandSub":"超肉泥機能經典嫩雞","overallScore":"8.7/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"台灣製造","cls":"g"},{"text":"超肉泥質地","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.23,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"超肉泥嫩雞，適口性極佳，老貓幼貓均適","_bk":"munchee","_fk":"chicken_super"}},{"id":"bass_chicken_super","label":"鱸魚雞肉（超肉泥）","data":{"brandName":"Munchee 貪貪","brandSub":"超肉泥機能鱸魚雞肉","overallScore":"8.8/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"台灣鱸魚","cls":"g"},{"text":"超肉泥","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5,"phos":0.21,"calcium":0.25,"sodium":0.29,"magnesium":0.023,"ash":2},"verdict":"台灣鱸魚搭配雞肉，Omega-3護眼護膚","_bk":"munchee","_fk":"bass_chicken_super"}},{"id":"chicken_duck_super","label":"雞肉鴨肉（超肉泥）","data":{"brandName":"Munchee 貪貪","brandSub":"超肉泥機能雞肉鴨肉","overallScore":"8.7/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"低敏雙禽","cls":"g"},{"text":"超肉泥","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.23,"calcium":0.27,"sodium":0.27,"magnesium":0.022,"ash":2.2},"verdict":"雞鴨雙禽低敏超肉泥，適口性佳易消化","_bk":"munchee","_fk":"chicken_duck_super"}},{"id":"venison_bass_super","label":"鹿肉鱸（超肉泥）","data":{"brandName":"Munchee 貪貪","brandSub":"超肉泥機能鹿肉鱸","overallScore":"9.0/10","overallClass":"g","meatPercent":"86%","tags":[{"text":"低敏鹿肉","cls":"g"},{"text":"超肉泥","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":14,"fat":6.5,"phos":0.24,"calcium":0.28,"sodium":0.27,"magnesium":0.02,"ash":2.3},"verdict":"鹿肉鱸魚低敏超肉泥，過敏貓咪適合","_bk":"munchee","_fk":"venison_bass_super"}},{"id":"island_chicken","label":"寶島鮮雞（肉泥）","data":{"brandName":"Munchee 貪貪","brandSub":"肉泥機能寶島鮮雞","overallScore":"8.6/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"台灣製造","cls":"g"},{"text":"機能肉泥","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5.5,"phos":0.22,"calcium":0.26,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"台灣寶島鮮雞機能肉泥，日常主食佳選","_bk":"munchee","_fk":"island_chicken"}},{"id":"chicken_beef_strips","label":"鮮雞火雞（肉絲）","data":{"brandName":"Munchee 貪貪","brandSub":"肉絲機能鮮雞火雞","overallScore":"8.6/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"雙禽肉絲","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5,"phos":0.22,"calcium":0.26,"sodium":0.28,"magnesium":0.022,"ash":2.1},"verdict":"雞火雙禽肉絲質地，老貓幼貓均適合","_bk":"munchee","_fk":"chicken_beef_strips"}}]},
"paw_paw_nian":{"label":"Paw Paw 年年","aliases":["paw paw 年年","年年","paw paw年年","pawpaw年年"],"flavors":[{"id":"chicken_sunflower","label":"嫩煎雞腿佐葵花籽","data":{"brandName":"Paw Paw 年年","brandSub":"嫩煎雞腿佐葵花籽主食罐","overallScore":"8.7/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣製造","cls":"g"},{"text":"Omega-6葵花籽","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6.5,"phos":0.23,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"嫩煎雞腿+葵花籽Omega-6，護皮毛高適口","_bk":"paw_paw_nian","_fk":"chicken_sunflower"}},{"id":"salmon_scallop","label":"銀鮭干貝雜炊","data":{"brandName":"Paw Paw 年年","brandSub":"銀鮭干貝雜炊主食罐","overallScore":"9.0/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"頂級海鮮","cls":"g"},{"text":"Omega-3","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5.5,"phos":0.21,"calcium":0.26,"sodium":0.29,"magnesium":0.022,"ash":2.1},"verdict":"銀鮭干貝頂級海鮮Omega-3，護眼護膚護心","_bk":"paw_paw_nian","_fk":"salmon_scallop"}},{"id":"filet_beef","label":"菲力牛佐無花果紅藜","data":{"brandName":"Paw Paw 年年","brandSub":"菲力牛佐無花果紅藜主食罐","overallScore":"9.0/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"頂級菲力牛","cls":"g"},{"text":"無花果抗氧化","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":14,"fat":6.5,"phos":0.24,"calcium":0.29,"sodium":0.27,"magnesium":0.021,"ash":2.4},"verdict":"頂級菲力牛+無花果紅藜，高端抗氧化護心配方","_bk":"paw_paw_nian","_fk":"filet_beef"}}]},
"tata_care":{"label":"tata.care 踏踏寵膳","aliases":["tata.care","踏踏寵膳","tata care","踏踏"],"flavors":[{"id":"chicken_herb","label":"香草嫩雞（機能）","data":{"brandName":"tata.care 踏踏寵膳","brandSub":"機能香草嫩雞主食罐","overallScore":"8.7/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"台灣製造","cls":"g"},{"text":"天然香草","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.022,"ash":2.2},"verdict":"香草嫩雞天然抗菌，機能配方日常主食","_bk":"tata_care","_fk":"chicken_herb"}},{"id":"salmon","label":"嫩煎鮭魚（機能）","data":{"brandName":"tata.care 踏踏寵膳","brandSub":"機能嫩煎鮭魚主食罐","overallScore":"8.9/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"Omega-3豐富","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":7,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.022,"ash":2.2},"verdict":"嫩煎鮭魚高Omega-3，護眼護膚護心機能配方","_bk":"tata_care","_fk":"salmon"}},{"id":"duck","label":"鮮燉鴨胸（機能）","data":{"brandName":"tata.care 踏踏寵膳","brandSub":"機能鮮燉鴨胸主食罐","overallScore":"8.8/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"低敏鴨胸","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.021,"ash":2.2},"verdict":"低敏鴨胸機能配方，過敏貓日常適用","_bk":"tata_care","_fk":"duck"}},{"id":"beef","label":"草飼燉牛（機能）","data":{"brandName":"tata.care 踏踏寵膳","brandSub":"機能草飼燉牛主食罐","overallScore":"8.9/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"草飼牛肉","cls":"g"},{"text":"高鐵質","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":14,"fat":7,"phos":0.24,"calcium":0.29,"sodium":0.27,"magnesium":0.021,"ash":2.4},"verdict":"草飼牛機能配方高鐵質，活躍貓咪首選","_bk":"tata_care","_fk":"beef"}},{"id":"earth_chicken_egg","label":"土雞滑蛋（土雞煲）","data":{"brandName":"tata.care 踏踏寵膳","brandSub":"土雞煲土雞滑蛋主食罐","overallScore":"8.8/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣土雞","cls":"g"},{"text":"滑蛋增鮮","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"台灣土雞滑蛋，適口性佳鮮味濃郁","_bk":"tata_care","_fk":"earth_chicken_egg"}},{"id":"turkey","label":"老甕熬火雞（土雞煲）","data":{"brandName":"tata.care 踏踏寵膳","brandSub":"土雞煲老甕熬火雞主食罐","overallScore":"8.8/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"慢燉火雞","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.26,"sodium":0.27,"magnesium":0.022,"ash":2.1},"verdict":"老甕慢燉火雞，湯汁鮮美補水效果佳","_bk":"tata_care","_fk":"turkey"}},{"id":"milkfish","label":"嫩煲虱目魚（土雞煲）","data":{"brandName":"tata.care 踏踏寵膳","brandSub":"土雞煲嫩煲虱目魚主食罐","overallScore":"8.7/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣虱目魚","cls":"g"},{"text":"高天然Omega","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5.5,"phos":0.21,"calcium":0.25,"sodium":0.3,"magnesium":0.023,"ash":2.1},"verdict":"台灣虱目魚高Omega-3，土雞高湯補水護眼","_bk":"tata_care","_fk":"milkfish"}},{"id":"clam","label":"溫燉海瓜子（土雞煲）","data":{"brandName":"tata.care 踏踏寵膳","brandSub":"土雞煲溫燉海瓜子主食罐","overallScore":"8.7/10","overallClass":"g","meatPercent":"80%","tags":[{"text":"天然牛磺酸","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"高適口性","cls":"g"}],"nutrients":{"water":78,"protein":12,"fat":3.5,"phos":0.2,"calcium":0.25,"sodium":0.32,"magnesium":0.024,"ash":2},"verdict":"海瓜子天然牛磺酸豐富，高湯補水適口性佳","_bk":"tata_care","_fk":"clam"}}]},
"cody_mao":{"label":"Cody Mao Mao 可蒂毛毛","aliases":["cody mao mao","可蒂毛毛","cody"],"flavors":[{"id":"bonito_berry","label":"鰹魚鮮雞×雙莓","data":{"brandName":"Cody Mao Mao 可蒂毛毛","brandSub":"呼呼罐鰹魚鮮雞×雙莓","overallScore":"8.7/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣製造","cls":"g"},{"text":"莓果抗氧化","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5,"phos":0.22,"calcium":0.26,"sodium":0.29,"magnesium":0.023,"ash":2.1},"verdict":"鰹魚雞肉搭配雙莓抗氧化，泌尿護眼雙效","_bk":"cody_mao","_fk":"bonito_berry"}},{"id":"tuna_edamame","label":"鮮嫩鮪魚×毛豆","data":{"brandName":"Cody Mao Mao 可蒂毛毛","brandSub":"呼呼罐鮮嫩鮪魚×毛豆","overallScore":"8.6/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣製造","cls":"g"},{"text":"植物蛋白輔助","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":4,"phos":0.21,"calcium":0.25,"sodium":0.3,"magnesium":0.023,"ash":2},"verdict":"鮪魚毛豆均衡配方，Omega-3豐富適口性佳","_bk":"cody_mao","_fk":"tuna_edamame"}},{"id":"chicken_apple","label":"鮮嫩雞肉×蘋果","data":{"brandName":"Cody Mao Mao 可蒂毛毛","brandSub":"呼呼罐鮮嫩雞肉×蘋果","overallScore":"8.6/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"台灣製造","cls":"g"},{"text":"蘋果多酚","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"雞肉蘋果多酚，天然抗氧化日常主食","_bk":"cody_mao","_fk":"chicken_apple"}},{"id":"milkfish_black_fungus","label":"虱目魚雞×黑木耳","data":{"brandName":"Cody Mao Mao 可蒂毛毛","brandSub":"呼呼罐虱目魚雞×黑木耳","overallScore":"8.7/10","overallClass":"g","meatPercent":"81%","tags":[{"text":"台灣在地魚","cls":"g"},{"text":"黑木耳益生元","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":4.5,"phos":0.21,"calcium":0.25,"sodium":0.3,"magnesium":0.023,"ash":2},"verdict":"虱目魚搭配黑木耳多醣體，腸道護眼雙效","_bk":"cody_mao","_fk":"milkfish_black_fungus"}}]},
"hoorooroo":{"label":"Hoorooroo 厚肉肉","aliases":["hoorooroo","厚肉肉"],"flavors":[{"id":"chicken_turkey","label":"鮮燉雞拼火雞肉","data":{"brandName":"Hoorooroo 厚肉肉","brandSub":"鮮燉雞拼火雞肉主食罐","overallScore":"8.6/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"台灣製造","cls":"g"},{"text":"雙禽蛋白","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"雞火雙禽均衡蛋白，台灣鮮燉高湯補水","_bk":"hoorooroo","_fk":"chicken_turkey"}},{"id":"chicken_beef","label":"鮮燉雞拼極上牛","data":{"brandName":"Hoorooroo 厚肉肉","brandSub":"鮮燉雞拼極上牛主食罐","overallScore":"8.7/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"海陸雙蛋白","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.23,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"雞牛雙蛋白高鐵質，台灣鮮燉風味佳","_bk":"hoorooroo","_fk":"chicken_beef"}},{"id":"chicken_salmon","label":"鮮燉雞拼嫩鮭魚","data":{"brandName":"Hoorooroo 厚肉肉","brandSub":"鮮燉雞拼嫩鮭魚主食罐","overallScore":"8.8/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"Omega-3豐富","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"雞肉搭鮭魚Omega-3，護眼護膚護心","_bk":"hoorooroo","_fk":"chicken_salmon"}},{"id":"bonito_whitebait","label":"至尊鰹魚拼魩仔魚","data":{"brandName":"Hoorooroo 厚肉肉","brandSub":"至尊鰹魚拼魩仔魚主食罐","overallScore":"8.6/10","overallClass":"g","meatPercent":"81%","tags":[{"text":"天然牛磺酸","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"高適口性","cls":"g"}],"nutrients":{"water":78,"protein":12,"fat":3.5,"phos":0.2,"calcium":0.24,"sodium":0.31,"magnesium":0.023,"ash":2},"verdict":"鰹魚魩仔魚天然牛磺酸鈣質豐富","_bk":"hoorooroo","_fk":"bonito_whitebait"}},{"id":"tuna_salmon","label":"一品鮪魚拼嫩鮭魚","data":{"brandName":"Hoorooroo 厚肉肉","brandSub":"一品鮪魚拼嫩鮭魚主食罐","overallScore":"8.7/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"雙魚高Omega-3","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5,"phos":0.21,"calcium":0.25,"sodium":0.3,"magnesium":0.022,"ash":2.1},"verdict":"鮪魚鮭魚雙魚高Omega-3，護眼護膚高適口","_bk":"hoorooroo","_fk":"tuna_salmon"}},{"id":"marlin_clam","label":"海味旗魚拼海瓜子","data":{"brandName":"Hoorooroo 厚肉肉","brandSub":"海味旗魚拼海瓜子主食罐","overallScore":"8.6/10","overallClass":"g","meatPercent":"80%","tags":[{"text":"台灣在地海鮮","cls":"g"},{"text":"天然牛磺酸","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":78,"protein":12,"fat":3.5,"phos":0.2,"calcium":0.24,"sodium":0.31,"magnesium":0.023,"ash":2},"verdict":"台灣在地旗魚海瓜子，天然牛磺酸護眼","_bk":"hoorooroo","_fk":"marlin_clam"}}]},
"maoup":{"label":"MAOUP 毛起來","aliases":["maoup","毛起來"],"flavors":[{"id":"chicken_fish","label":"鮮雞雙魚宴","data":{"brandName":"MAOUP 毛起來","brandSub":"鮮雞雙魚宴主食罐（台灣）","overallScore":"8.6/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣製造","cls":"g"},{"text":"雙魚高Omega","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5,"phos":0.21,"calcium":0.25,"sodium":0.29,"magnesium":0.022,"ash":2.1},"verdict":"雞肉搭雙魚高Omega-3，護眼護膚高適口","_bk":"maoup","_fk":"chicken_fish"}},{"id":"chicken_marlin","label":"鮮雞與旗魚","data":{"brandName":"MAOUP 毛起來","brandSub":"鮮雞與旗魚主食罐（台灣）","overallScore":"8.5/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"台灣在地旗魚","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":4.5,"phos":0.21,"calcium":0.25,"sodium":0.29,"magnesium":0.022,"ash":2},"verdict":"台灣在地旗魚搭雞肉，清爽均衡日常主食","_bk":"maoup","_fk":"chicken_marlin"}},{"id":"pastoral_chicken","label":"牧野田園雞","data":{"brandName":"MAOUP 毛起來","brandSub":"牧野田園雞主食罐（台灣）","overallScore":"8.5/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"台灣田園雞","cls":"g"},{"text":"蔬果均衡","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"田園放養雞蔬果均衡，日常主食首選","_bk":"maoup","_fk":"pastoral_chicken"}},{"id":"goat_chicken","label":"山羊奶雞肉","data":{"brandName":"MAOUP 毛起來","brandSub":"山羊奶雞肉主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"80%","tags":[{"text":"羊奶機能","cls":"g"},{"text":"高鈣補充","cls":"g"},{"text":"台灣製造","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5.5,"phos":0.21,"calcium":0.31,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"羊奶雞肉高鈣補充，幼貓老貓骨骼健康","_bk":"maoup","_fk":"goat_chicken"}}]},
"xin_tou_rou":{"label":"XIN TOU ROU 心頭肉","aliases":["xin tou rou","心頭肉","xintouro"],"flavors":[{"id":"lamb","label":"羊肉（洛神）","data":{"brandName":"XIN TOU ROU 心頭肉","brandSub":"洛神羊肉主食罐（台灣）","overallScore":"8.8/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"洛神花抗氧化","cls":"g"},{"text":"低敏羊肉","cls":"g"},{"text":"台灣製造","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.23,"calcium":0.28,"sodium":0.27,"magnesium":0.021,"ash":2.2},"verdict":"低敏羊肉+洛神花抗氧化，護心護眼雙效","_bk":"xin_tou_rou","_fk":"lamb"}},{"id":"duck","label":"鴨肉（洛神）","data":{"brandName":"XIN TOU ROU 心頭肉","brandSub":"洛神鴨肉主食罐（台灣）","overallScore":"8.8/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"洛神花機能","cls":"g"},{"text":"低敏鴨肉","cls":"g"},{"text":"台灣製造","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.021,"ash":2.2},"verdict":"低敏鴨肉+洛神抗氧化，過敏貓護心首選","_bk":"xin_tou_rou","_fk":"duck"}},{"id":"turkey","label":"火雞肉（洛神）","data":{"brandName":"XIN TOU ROU 心頭肉","brandSub":"洛神火雞肉主食罐（台灣）","overallScore":"8.8/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"洛神花機能","cls":"g"},{"text":"低脂火雞","cls":"g"},{"text":"台灣製造","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.021,"ash":2.2},"verdict":"低脂火雞+洛神花，護心輕盈配方","_bk":"xin_tou_rou","_fk":"turkey"}},{"id":"seafood","label":"海鮮（心絲罐）","data":{"brandName":"XIN TOU ROU 心頭肉","brandSub":"心絲罐海鮮主食罐（台灣）","overallScore":"8.6/10","overallClass":"g","meatPercent":"80%","tags":[{"text":"多種海鮮","cls":"g"},{"text":"肉絲質地","cls":"g"},{"text":"台灣製造","cls":"g"}],"nutrients":{"water":78,"protein":12,"fat":3.5,"phos":0.2,"calcium":0.24,"sodium":0.31,"magnesium":0.023,"ash":2},"verdict":"海鮮肉絲高適口，含甲殼類需注意過敏","_bk":"xin_tou_rou","_fk":"seafood"}},{"id":"beef_silk","label":"牛肉（心絲罐）","data":{"brandName":"XIN TOU ROU 心頭肉","brandSub":"心絲罐牛肉主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"高鐵牛肉","cls":"g"},{"text":"肉絲質地","cls":"g"},{"text":"台灣製造","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.23,"calcium":0.27,"sodium":0.28,"magnesium":0.021,"ash":2.2},"verdict":"高鐵牛肉肉絲，適合挑嘴貓咪日常","_bk":"xin_tou_rou","_fk":"beef_silk"}},{"id":"chicken_silk","label":"雞肉（心絲罐）","data":{"brandName":"XIN TOU ROU 心頭肉","brandSub":"心絲罐雞肉主食罐（台灣）","overallScore":"8.6/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"台灣製造","cls":"g"},{"text":"肉絲質地","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"雞肉肉絲質地細膩，老貓幼貓均適用","_bk":"xin_tou_rou","_fk":"chicken_silk"}},{"id":"salmon_silk","label":"鮭魚（心絲罐）","data":{"brandName":"XIN TOU ROU 心頭肉","brandSub":"心絲罐鮭魚主食罐（台灣）","overallScore":"8.8/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"高Omega-3","cls":"g"},{"text":"肉絲質地","cls":"g"},{"text":"台灣製造","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.021,"ash":2.2},"verdict":"鮭魚肉絲Omega-3豐富，護眼護膚心絲配方","_bk":"xin_tou_rou","_fk":"salmon_silk"}}]},
"jijie_wan":{"label":"乖乖吃飯","aliases":["乖乖吃飯","乖乖"],"flavors":[{"id":"pork_mackerel","label":"豬肉鯖魚","data":{"brandName":"乖乖吃飯","brandSub":"豬豬罐豬肉鯖魚主食罐（台灣）","overallScore":"8.5/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣製造","cls":"g"},{"text":"稀有豬肉罐","cls":"g"},{"text":"Omega-3","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.23,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"稀有豬肉搭鯖魚Omega-3，護眼護膚輪替佳","_bk":"jijie_wan","_fk":"pork_mackerel"}},{"id":"duck_egg_yolk","label":"櫻桃鴨肝蛋黃（肉泥）","data":{"brandName":"乖乖吃飯","brandSub":"小尾巴泥泥櫻桃鴨肝蛋黃","overallScore":"8.7/10","overallClass":"g","meatPercent":"80%","tags":[{"text":"肉泥質地","cls":"g"},{"text":"低敏鴨肉","cls":"g"},{"text":"台灣製造","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"鴨肝蛋黃卵磷脂豐富，老貓腦部護眼雙效","_bk":"jijie_wan","_fk":"duck_egg_yolk"}},{"id":"roast_chicken","label":"香煨嫩雞（獨享餐）","data":{"brandName":"乖乖吃飯","brandSub":"獨享餐香煨嫩雞主食罐","overallScore":"8.6/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"台灣製造","cls":"g"},{"text":"獨享份量","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"香煨嫩雞獨享份量，適口性佳日常主食","_bk":"jijie_wan","_fk":"roast_chicken"}},{"id":"beef","label":"老甕珍牛（獨享餐）","data":{"brandName":"乖乖吃飯","brandSub":"獨享餐老甕珍牛主食罐","overallScore":"8.7/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"老甕慢燉","cls":"g"},{"text":"高鐵牛肉","cls":"g"},{"text":"台灣製造","cls":"g"}],"nutrients":{"water":75,"protein":14,"fat":6.5,"phos":0.24,"calcium":0.29,"sodium":0.27,"magnesium":0.021,"ash":2.4},"verdict":"老甕慢燉珍牛，高鐵質湯汁濃郁補水佳","_bk":"jijie_wan","_fk":"beef"}}]},
"vet_research":{"label":"獸研所","aliases":["獸研所","vet research"],"flavors":[{"id":"kitten_chicken","label":"牧野雞（幼貓）","data":{"brandName":"獸研所","brandSub":"幼貓牧野雞主食罐（台灣）","overallScore":"8.8/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"幼貓配方","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":14,"fat":7,"phos":0.24,"calcium":0.31,"sodium":0.27,"magnesium":0.022,"ash":2.4},"verdict":"幼貓高蛋白+DHA助發育，台灣獸醫研發配方","_bk":"vet_research","_fk":"kitten_chicken"}},{"id":"kitten_fish","label":"鮮海魚（幼貓）","data":{"brandName":"獸研所","brandSub":"幼貓鮮海魚主食罐（台灣）","overallScore":"8.8/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"幼貓配方","cls":"g"},{"text":"高Omega-3","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":7,"phos":0.23,"calcium":0.3,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"幼貓海魚高Omega-3 DHA，腦部護眼雙效","_bk":"vet_research","_fk":"kitten_fish"}},{"id":"immune_chicken","label":"牧野雞（免疫）","data":{"brandName":"獸研所","brandSub":"免疫牧野雞主食罐（台灣）","overallScore":"8.9/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"免疫機能","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":6,"phos":0.23,"calcium":0.28,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"免疫配方添加益生菌強化腸道，獸醫研發","_bk":"vet_research","_fk":"immune_chicken"}},{"id":"urinary_chicken","label":"牧野雞（泌尿）","data":{"brandName":"獸研所","brandSub":"泌尿舒壓牧野雞主食罐（台灣）","overallScore":"9.0/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"泌尿保護","cls":"g"},{"text":"低鎂配方","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":78,"protein":13,"fat":5.5,"phos":0.21,"calcium":0.27,"sodium":0.28,"magnesium":0.018,"ash":2.1},"verdict":"低鎂+蔓越莓+蛋胺酸，泌尿三重保護獸醫配方","_bk":"vet_research","_fk":"urinary_chicken"}},{"id":"kidney_chicken","label":"牧野雞（腎臟）","data":{"brandName":"獸研所","brandSub":"腎臟牧野雞主食罐（台灣）","overallScore":"9.1/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"低磷腎臟配方","cls":"g"},{"text":"獸醫研發","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":80,"protein":12,"fat":4.5,"phos":0.18,"calcium":0.22,"sodium":0.26,"magnesium":0.017,"ash":1.8},"verdict":"低磷高水分腎臟專屬配方，獸醫嚴格研發","_bk":"vet_research","_fk":"kidney_chicken"}}]},
"pinjitu":{"label":"拼圖貓廚房","aliases":["拼圖貓廚房","拼圖"],"flavors":[{"id":"turkey","label":"Q彈多汁火雞肉","data":{"brandName":"拼圖貓廚房","brandSub":"Q彈多汁火雞肉主食罐（台灣）","overallScore":"8.6/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"台灣製造","cls":"g"},{"text":"低脂火雞","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5,"phos":0.22,"calcium":0.26,"sodium":0.27,"magnesium":0.022,"ash":2.1},"verdict":"低脂火雞Q彈質地，體重管理適口性佳","_bk":"pinjitu","_fk":"turkey"}},{"id":"bass","label":"養生補氣吃鱸魚","data":{"brandName":"拼圖貓廚房","brandSub":"養生補氣鱸魚主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣鱸魚","cls":"g"},{"text":"養生配方","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":78,"protein":12,"fat":4,"phos":0.2,"calcium":0.24,"sodium":0.29,"magnesium":0.023,"ash":2},"verdict":"台灣鱸魚養生配方，低脂補水護腎佳選","_bk":"pinjitu","_fk":"bass"}},{"id":"quail","label":"鄉野奔放鵪鶉肉","data":{"brandName":"拼圖貓廚房","brandSub":"鄉野奔放鵪鶉肉主食罐（台灣）","overallScore":"8.8/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"稀有鵪鶉肉","cls":"g"},{"text":"低敏配方","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.021,"ash":2.2},"verdict":"稀有鵪鶉低敏蛋白，適合過敏貓輪替使用","_bk":"pinjitu","_fk":"quail"}},{"id":"duck","label":"法式軟嫩鮮鴨肉","data":{"brandName":"拼圖貓廚房","brandSub":"法式軟嫩鮮鴨肉主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"低敏鴨肉","cls":"g"},{"text":"法式烹調","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.021,"ash":2.2},"verdict":"法式低敏鴨肉，過敏貓日常主食首選","_bk":"pinjitu","_fk":"duck"}},{"id":"beef","label":"尊榮頂級燉牛肉","data":{"brandName":"拼圖貓廚房","brandSub":"尊榮頂級燉牛肉主食罐（台灣）","overallScore":"8.8/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"頂級牛肉","cls":"g"},{"text":"慢燉工藝","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":14,"fat":6.5,"phos":0.24,"calcium":0.29,"sodium":0.27,"magnesium":0.021,"ash":2.4},"verdict":"頂級牛肉慢燉，高鐵質活力配方","_bk":"pinjitu","_fk":"beef"}}]},
"hao_shi_yusu":{"label":"好食寓所","aliases":["好食寓所"],"flavors":[{"id":"chicken","label":"唐伯虎點嫩雞","data":{"brandName":"好食寓所","brandSub":"唐伯虎點嫩雞主食罐（台灣）","overallScore":"8.6/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"台灣製造","cls":"g"},{"text":"文青風格","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"台灣文青品牌嫩雞主食，成分乾淨日常適用","_bk":"hao_shi_yusu","_fk":"chicken"}},{"id":"quail","label":"鵪鶉你好","data":{"brandName":"好食寓所","brandSub":"鵪鶉你好主食罐（台灣）","overallScore":"8.8/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"稀有鵪鶉","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.021,"ash":2.2},"verdict":"稀有鵪鶉低敏，過敏貓咪輪替首選","_bk":"hao_shi_yusu","_fk":"quail"}},{"id":"tuna_salmon","label":"鮪鮭正傳","data":{"brandName":"好食寓所","brandSub":"鮪鮭正傳主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"雙魚高Omega","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5.5,"phos":0.21,"calcium":0.26,"sodium":0.29,"magnesium":0.022,"ash":2.1},"verdict":"鮪鮭雙魚高Omega-3，護眼護膚護心三效","_bk":"hao_shi_yusu","_fk":"tuna_salmon"}},{"id":"beef","label":"進擊的牛牛","data":{"brandName":"好食寓所","brandSub":"進擊的牛牛主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"高鐵牛肉","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":14,"fat":6,"phos":0.23,"calcium":0.28,"sodium":0.27,"magnesium":0.021,"ash":2.3},"verdict":"高鐵牛肉活力配方，適合活躍貓咪","_bk":"hao_shi_yusu","_fk":"beef"}}]},
"mao_yan_gong":{"label":"毛研工事","aliases":["毛研工事","mao yan gong shi"],"flavors":[{"id":"double_egg_tomato","label":"雙蛋茄汁雞","data":{"brandName":"毛研工事","brandSub":"雙蛋茄汁雞主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣製造","cls":"g"},{"text":"茄紅素護心","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"雙蛋茄汁雞茄紅素護心，適口性佳日常主食","_bk":"mao_yan_gong","_fk":"double_egg_tomato"}},{"id":"swordfish","label":"鮮蔬劍旗魚","data":{"brandName":"毛研工事","brandSub":"鮮蔬劍旗魚主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣在地旗魚","cls":"g"},{"text":"蔬果均衡","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":4.5,"phos":0.21,"calcium":0.25,"sodium":0.29,"magnesium":0.022,"ash":2},"verdict":"台灣在地旗魚鮮蔬均衡，Omega-3護眼","_bk":"mao_yan_gong","_fk":"swordfish"}},{"id":"duck_flaxseed","label":"亞麻香草鴨","data":{"brandName":"毛研工事","brandSub":"亞麻香草鴨主食罐（台灣）","overallScore":"8.9/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"低敏鴨肉","cls":"g"},{"text":"亞麻籽Omega","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.021,"ash":2.2},"verdict":"低敏鴨肉+亞麻籽植物Omega-3，護膚護心雙效","_bk":"mao_yan_gong","_fk":"duck_flaxseed"}},{"id":"double_fish","label":"葉黃素雙魚","data":{"brandName":"毛研工事","brandSub":"葉黃素雙魚主食罐（台灣）","overallScore":"8.9/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"葉黃素護眼","cls":"g"},{"text":"雙魚高Omega","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5.5,"phos":0.21,"calcium":0.25,"sodium":0.29,"magnesium":0.022,"ash":2.1},"verdict":"葉黃素+雙魚Omega-3，護眼效果業界最強","_bk":"mao_yan_gong","_fk":"double_fish"}}]},
"wu_hang":{"label":"五行貓膳","aliases":["五行貓膳","五行"],"flavors":[{"id":"red","label":"紅罐","data":{"brandName":"五行貓膳","brandSub":"五行紅罐主食罐（台灣）","overallScore":"8.6/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"五行理論","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"五行紅罐護心配方，茄紅素+牛肉均衡","_bk":"wu_hang","_fk":"red"}},{"id":"white","label":"白罐","data":{"brandName":"五行貓膳","brandSub":"五行白罐主食罐（台灣）","overallScore":"8.6/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"五行理論","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":4.5,"phos":0.2,"calcium":0.25,"sodium":0.28,"magnesium":0.022,"ash":2},"verdict":"五行白罐肺腸配方，白魚低脂護肺健腸","_bk":"wu_hang","_fk":"white"}},{"id":"yellow","label":"黃罐","data":{"brandName":"五行貓膳","brandSub":"五行黃罐主食罐（台灣）","overallScore":"8.6/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"五行理論","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.23,"calcium":0.28,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"五行黃罐健脾配方，薑黃抗發炎+雞肉均衡","_bk":"wu_hang","_fk":"yellow"}},{"id":"green","label":"綠罐","data":{"brandName":"五行貓膳","brandSub":"五行綠罐主食罐（台灣）","overallScore":"8.6/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"五行理論","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5,"phos":0.21,"calcium":0.26,"sodium":0.28,"magnesium":0.022,"ash":2.1},"verdict":"五行綠罐護肝配方，低敏鴨肉+綠色蔬菜","_bk":"wu_hang","_fk":"green"}},{"id":"purple","label":"紫罐","data":{"brandName":"五行貓膳","brandSub":"五行紫罐主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"五行理論","cls":"g"},{"text":"花青素","cls":"g"},{"text":"台灣製造","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5,"phos":0.21,"calcium":0.25,"sodium":0.28,"magnesium":0.022,"ash":2.1},"verdict":"五行紫罐護腎，花青素+Omega-3強效抗氧化","_bk":"wu_hang","_fk":"purple"}}]},
"heromama":{"label":"HeroMama","aliases":["heromama","hero mama"],"flavors":[{"id":"chicken_breast_light","label":"雞胸肉（輕盈低卡）","data":{"brandName":"HeroMama","brandSub":"輕盈低卡雞胸肉主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"台灣製造","cls":"g"},{"text":"低卡低脂","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":80,"protein":13,"fat":2.5,"phos":0.19,"calcium":0.22,"sodium":0.27,"magnesium":0.021,"ash":1.9},"verdict":"低卡雞胸高水分，體重控制與補水首選","_bk":"heromama","_fk":"chicken_breast_light"}},{"id":"clam_chicken_light","label":"花蛤雞肉（輕盈低卡）","data":{"brandName":"HeroMama","brandSub":"輕盈低卡花蛤雞肉主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣製造","cls":"g"},{"text":"天然牛磺酸","cls":"g"},{"text":"低卡配方","cls":"g"}],"nutrients":{"water":80,"protein":12,"fat":2.5,"phos":0.19,"calcium":0.23,"sodium":0.28,"magnesium":0.022,"ash":1.9},"verdict":"花蛤天然牛磺酸+低卡雞肉，護眼補水輕盈","_bk":"heromama","_fk":"clam_chicken_light"}},{"id":"beef_light","label":"牛腿肉（輕盈低卡）","data":{"brandName":"HeroMama","brandSub":"輕盈低卡牛腿肉主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"台灣製造","cls":"g"},{"text":"低卡牛肉","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":80,"protein":13,"fat":2.5,"phos":0.2,"calcium":0.22,"sodium":0.27,"magnesium":0.02,"ash":1.9},"verdict":"低卡牛腿高鐵質，活躍貓咪體重管理首選","_bk":"heromama","_fk":"beef_light"}},{"id":"bass_light","label":"清蒸鱸魚（輕盈低卡）","data":{"brandName":"HeroMama","brandSub":"輕盈低卡清蒸鱸魚主食罐（台灣）","overallScore":"8.8/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"台灣鱸魚","cls":"g"},{"text":"極低脂","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":81,"protein":12,"fat":2,"phos":0.18,"calcium":0.21,"sodium":0.27,"magnesium":0.021,"ash":1.8},"verdict":"清蒸鱸魚極低脂高水分，腎貓泌尿問題貓首選","_bk":"heromama","_fk":"bass_light"}},{"id":"native_chicken","label":"黑羽土雞（溯源鮮肉）","data":{"brandName":"HeroMama","brandSub":"溯源鮮肉黑羽土雞主食罐（台灣）","overallScore":"9.0/10","overallClass":"g","meatPercent":"88%","tags":[{"text":"台灣黑羽土雞","cls":"g"},{"text":"產地溯源","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":14,"fat":6,"phos":0.23,"calcium":0.28,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"台灣黑羽土雞產地溯源，成分透明品質保證","_bk":"heromama","_fk":"native_chicken"}},{"id":"bass_traceable","label":"金目鱸魚（溯源鮮肉）","data":{"brandName":"HeroMama","brandSub":"溯源鮮肉金目鱸魚主食罐（台灣）","overallScore":"8.9/10","overallClass":"g","meatPercent":"86%","tags":[{"text":"金目鱸溯源","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":13,"fat":4.5,"phos":0.2,"calcium":0.25,"sodium":0.27,"magnesium":0.022,"ash":2},"verdict":"金目鱸魚溯源低脂，護腎補水高適口","_bk":"heromama","_fk":"bass_traceable"}},{"id":"bass_chicken_party","label":"鱸魚×嫩雞（海陸派對）","data":{"brandName":"HeroMama","brandSub":"海陸派對鱸魚嫩雞主食罐（台灣）","overallScore":"8.8/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"海陸雙蛋白","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":13,"fat":5,"phos":0.21,"calcium":0.26,"sodium":0.27,"magnesium":0.022,"ash":2.1},"verdict":"鱸魚雞肉海陸雙蛋白，Omega-3護眼護膚","_bk":"heromama","_fk":"bass_chicken_party"}}]},
"hururu":{"label":"Hururu 防禦工事","aliases":["hururu","防禦工事"],"flavors":[{"id":"tuna","label":"鮪魚魔髮師","data":{"brandName":"Hururu 防禦工事","brandSub":"鮪魚魔髮師主食罐（台灣）","overallScore":"8.6/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"台灣製造","cls":"g"},{"text":"護毛配方","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5,"phos":0.21,"calcium":0.25,"sodium":0.29,"magnesium":0.022,"ash":2.1},"verdict":"鮪魚Omega-3護毛配方，皮膚毛髮光澤首選","_bk":"hururu","_fk":"tuna"}},{"id":"chicken","label":"雞肉大力士","data":{"brandName":"Hururu 防禦工事","brandSub":"雞肉大力士主食罐（台灣）","overallScore":"8.6/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"台灣製造","cls":"g"},{"text":"高蛋白強肌","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"高蛋白雞肉強肌配方，活躍肌肉型貓首選","_bk":"hururu","_fk":"chicken"}},{"id":"beef","label":"牛肉大胃王","data":{"brandName":"Hururu 防禦工事","brandSub":"牛肉大胃王主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"台灣製造","cls":"g"},{"text":"高鐵牛肉","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.23,"calcium":0.27,"sodium":0.27,"magnesium":0.021,"ash":2.3},"verdict":"高鐵牛肉大份量，活躍貓咪能量補充首選","_bk":"hururu","_fk":"beef"}}]},
"meow_servant":{"label":"Meow Servant 喵皇奴","aliases":["meow servant","喵皇奴","meowservant"],"flavors":[{"id":"quail_chicken","label":"鵪鶉+雞肉（經典）","data":{"brandName":"Meow Servant 喵皇奴","brandSub":"經典鵪鶉雞肉主食罐（台灣）","overallScore":"8.8/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"台灣製造","cls":"g"},{"text":"稀有鵪鶉","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"稀有鵪鶉搭雞肉，低敏雙禽配方","_bk":"meow_servant","_fk":"quail_chicken"}},{"id":"salmon_chicken","label":"鮭魚+雞肉（經典）","data":{"brandName":"Meow Servant 喵皇奴","brandSub":"經典鮭魚雞肉主食罐（台灣）","overallScore":"8.8/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"Omega-3豐富","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.022,"ash":2.2},"verdict":"鮭魚雞肉Omega-3豐富，護眼護膚護心三效","_bk":"meow_servant","_fk":"salmon_chicken"}},{"id":"chicken_beef","label":"雞肉+牛肉（經典）","data":{"brandName":"Meow Servant 喵皇奴","brandSub":"經典雞肉牛肉主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"海陸雙蛋白","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.23,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"雞牛雙蛋白高鐵質，均衡胺基酸日常主食","_bk":"meow_servant","_fk":"chicken_beef"}},{"id":"pure_chicken","label":"純雞肉（經典）","data":{"brandName":"Meow Servant 喵皇奴","brandSub":"經典純雞肉主食罐（台灣）","overallScore":"8.6/10","overallClass":"g","meatPercent":"88%","tags":[{"text":"單一蛋白","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.26,"sodium":0.27,"magnesium":0.022,"ash":2.2},"verdict":"單一雞肉適合排除飲食，成分簡單乾淨","_bk":"meow_servant","_fk":"pure_chicken"}},{"id":"chicken_bsf","label":"雞與黑水虻（虻貓機能）","data":{"brandName":"Meow Servant 喵皇奴","brandSub":"虻貓機能雞與黑水虻主食罐","overallScore":"8.9/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"黑水虻機能","cls":"g"},{"text":"環保蛋白","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"黑水虻月桂酸強效免疫，環保永續蛋白來源","_bk":"meow_servant","_fk":"chicken_bsf"}},{"id":"tuna_bsf","label":"鮪魚與黑水虻（虻貓機能）","data":{"brandName":"Meow Servant 喵皇奴","brandSub":"虻貓機能鮪魚黑水虻主食罐","overallScore":"8.9/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"黑水虻機能","cls":"g"},{"text":"高適口性","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":4.5,"phos":0.21,"calcium":0.25,"sodium":0.29,"magnesium":0.022,"ash":2},"verdict":"鮪魚Omega-3+黑水虻免疫，護眼免疫雙效","_bk":"meow_servant","_fk":"tuna_bsf"}}]},
"missbebe":{"label":"missbebe 想比比","aliases":["missbebe","想比比"],"flavors":[{"id":"chicken","label":"卜蜂雞肉","data":{"brandName":"missbebe 想比比","brandSub":"卜蜂雞肉主食罐（台灣）","overallScore":"8.6/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"台灣製造","cls":"g"},{"text":"高品質雞肉","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"卜蜂優質雞肉，成分乾淨日常主食","_bk":"missbebe","_fk":"chicken"}},{"id":"quail","label":"山林鵪鶉鳥","data":{"brandName":"missbebe 想比比","brandSub":"山林鵪鶉鳥主食罐（台灣）","overallScore":"8.9/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"稀有鵪鶉","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":14,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.021,"ash":2.2},"verdict":"稀有山林鵪鶉，低敏蛋白過敏貓輪替首選","_bk":"missbebe","_fk":"quail"}},{"id":"salmon_chicken","label":"鮭魚雞肉餐","data":{"brandName":"missbebe 想比比","brandSub":"鮭魚雞肉餐主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"Omega-3豐富","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.022,"ash":2.2},"verdict":"鮭魚雞肉Omega-3護眼護膚，日常輪替佳","_bk":"missbebe","_fk":"salmon_chicken"}},{"id":"tuna_chicken","label":"鮪魚雞肉","data":{"brandName":"missbebe 想比比","brandSub":"鮪魚雞肉主食罐（台灣）","overallScore":"8.6/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"高適口雙蛋白","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":4.5,"phos":0.21,"calcium":0.25,"sodium":0.28,"magnesium":0.022,"ash":2},"verdict":"鮪魚雞肉雙蛋白高適口，日常主食首選","_bk":"missbebe","_fk":"tuna_chicken"}},{"id":"krill_chicken","label":"磷蝦油嫩雞（機能）","data":{"brandName":"missbebe 想比比","brandSub":"機能磷蝦油嫩雞主食罐（台灣）","overallScore":"9.0/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"磷蝦油機能","cls":"g"},{"text":"高Omega-3","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.022,"ash":2.2},"verdict":"磷蝦油磷脂型Omega-3吸收效率最高，護眼護心","_bk":"missbebe","_fk":"krill_chicken"}}]},
"natural10":{"label":"Natural10 自然食","aliases":["natural10","自然食"],"flavors":[{"id":"bass_chicken_soup","label":"鱸魚濃湯雞肉","data":{"brandName":"Natural10 自然食","brandSub":"嚼世饗宴鱸魚濃湯雞肉","overallScore":"8.7/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣製造","cls":"g"},{"text":"濃湯質地","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":78,"protein":12,"fat":4.5,"phos":0.21,"calcium":0.25,"sodium":0.29,"magnesium":0.022,"ash":2},"verdict":"鱸魚雞肉濃湯質地，高水分護腎護眼","_bk":"natural10","_fk":"bass_chicken_soup"}},{"id":"salmon_sauce_frog","label":"鮭魚濃醬田雞","data":{"brandName":"Natural10 自然食","brandSub":"嚼世饗宴鮭魚濃醬田雞","overallScore":"8.8/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"稀有田雞","cls":"g"},{"text":"Omega-3","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.26,"sodium":0.28,"magnesium":0.021,"ash":2.1},"verdict":"鮭魚田雞稀有低敏配方，Omega-3豐富護眼","_bk":"natural10","_fk":"salmon_sauce_frog"}},{"id":"bonito_chicken","label":"鰹魚雞肉燒（宵夜場）","data":{"brandName":"Natural10 自然食","brandSub":"宵夜場鰹魚雞肉燒","overallScore":"8.6/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣製造","cls":"g"},{"text":"天然牛磺酸","cls":"g"},{"text":"高適口性","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":4.5,"phos":0.21,"calcium":0.25,"sodium":0.29,"magnesium":0.022,"ash":2},"verdict":"鰹魚天然牛磺酸+雞肉，護眼護心高適口","_bk":"natural10","_fk":"bonito_chicken"}},{"id":"beef_chicken_luna","label":"月見牛肉燒（宵夜場）","data":{"brandName":"Natural10 自然食","brandSub":"宵夜場月見牛肉燒","overallScore":"8.7/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣製造","cls":"g"},{"text":"高鐵牛肉","cls":"g"},{"text":"高適口性","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.26,"sodium":0.28,"magnesium":0.021,"ash":2.2},"verdict":"月見牛肉燒高鐵高適口，適合活躍貓咪","_bk":"natural10","_fk":"beef_chicken_luna"}}]},
"paw_paw_land":{"label":"paw paw land 肉球世界","aliases":["paw paw land","肉球世界","pawpawland"],"flavors":[{"id":"chicken_resveratrol","label":"純雞肉×白藜蘆醇（歪嘴貓）","data":{"brandName":"paw paw land 肉球世界","brandSub":"歪嘴貓純雞肉白藜蘆醇","overallScore":"8.9/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"白藜蘆醇機能","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"白藜蘆醇強效心血管保護，雞肉主食最佳機能配方","_bk":"paw_paw_land","_fk":"chicken_resveratrol"}},{"id":"tuna_fucoidan","label":"純鮪魚×褐藻醣膠（歪嘴貓）","data":{"brandName":"paw paw land 肉球世界","brandSub":"歪嘴貓純鮪魚褐藻醣膠","overallScore":"9.0/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"褐藻醣膠機能","cls":"g"},{"text":"免疫強化","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":4.5,"phos":0.21,"calcium":0.25,"sodium":0.29,"magnesium":0.022,"ash":2},"verdict":"褐藻醣膠強效免疫抗氧化，鮪魚高適口機能配方","_bk":"paw_paw_land","_fk":"tuna_fucoidan"}},{"id":"krill_chicken_cranberry","label":"雞肉×蔓越莓（南極磷蝦）","data":{"brandName":"paw paw land 肉球世界","brandSub":"南極磷蝦雞肉蔓越莓","overallScore":"9.0/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"南極磷蝦Omega","cls":"g"},{"text":"蔓越莓泌尿","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.022,"ash":2.2},"verdict":"磷蝦油高效Omega-3+蔓越莓泌尿，護眼泌尿雙效","_bk":"paw_paw_land","_fk":"krill_chicken_cranberry"}},{"id":"krill_tuna_prebiotics","label":"鮪魚×益生元（南極磷蝦）","data":{"brandName":"paw paw land 肉球世界","brandSub":"南極磷蝦鮪魚益生元","overallScore":"8.9/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"益生元機能","cls":"g"},{"text":"南極磷蝦","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5.5,"phos":0.21,"calcium":0.25,"sodium":0.29,"magnesium":0.022,"ash":2},"verdict":"益生元腸道健康+磷蝦油Omega-3，腸道護眼雙效","_bk":"paw_paw_land","_fk":"krill_tuna_prebiotics"}}]},
"petcook":{"label":"Petcook 派庫廚房","aliases":["petcook","派庫廚房"],"flavors":[{"id":"crocodile_chicken","label":"鱷魚佐雞肉","data":{"brandName":"Petcook 派庫廚房","brandSub":"鱷魚佐雞肉主食罐（台灣）","overallScore":"9.0/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"極稀有鱷魚肉","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":14,"fat":5.5,"phos":0.23,"calcium":0.27,"sodium":0.27,"magnesium":0.021,"ash":2.3},"verdict":"極稀有鱷魚肉超低敏，嚴重過敏貓首選排除飲食","_bk":"petcook","_fk":"crocodile_chicken"}},{"id":"turtle_marlin","label":"鱉肉佐旗魚","data":{"brandName":"Petcook 派庫廚房","brandSub":"鱉肉佐旗魚主食罐（台灣）","overallScore":"8.9/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"珍稀鱉肉","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5,"phos":0.22,"calcium":0.26,"sodium":0.27,"magnesium":0.021,"ash":2.2},"verdict":"珍稀鱉肉膠原蛋白+旗魚，護關節護眼雙效","_bk":"petcook","_fk":"turtle_marlin"}},{"id":"eel_chicken","label":"鰻魚佐雞肉","data":{"brandName":"Petcook 派庫廚房","brandSub":"鰻魚佐雞肉主食罐（台灣）","overallScore":"9.0/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"台灣鰻魚","cls":"g"},{"text":"高DHA","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":75,"protein":13,"fat":7,"phos":0.23,"calcium":0.27,"sodium":0.27,"magnesium":0.022,"ash":2.3},"verdict":"台灣鰻魚高DHA護腦護眼，稀有食材高適口","_bk":"petcook","_fk":"eel_chicken"}},{"id":"shrimp_marlin","label":"蝦仁佐旗魚","data":{"brandName":"Petcook 派庫廚房","brandSub":"蝦仁佐旗魚主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"甲殼海鮮","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"高適口性","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":4,"phos":0.2,"calcium":0.24,"sodium":0.3,"magnesium":0.022,"ash":2},"verdict":"蝦仁旗魚高適口，含甲殼類需注意過敏","_bk":"petcook","_fk":"shrimp_marlin"}}]},
"petpaws":{"label":"PETPAWS 毛爪村","aliases":["petpaws","毛爪村"],"flavors":[{"id":"catnip_pumpkin_chicken","label":"南瓜雞（貓薄荷）","data":{"brandName":"PETPAWS 毛爪村","brandSub":"貓薄荷南瓜雞主食罐（台灣）","overallScore":"8.6/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"貓薄荷機能","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5,"phos":0.21,"calcium":0.25,"sodium":0.28,"magnesium":0.022,"ash":2},"verdict":"貓薄荷放鬆+南瓜雞均衡，舒壓護眼日常","_bk":"petpaws","_fk":"catnip_pumpkin_chicken"}},{"id":"catnip_tuna","label":"鮪魚（貓薄荷）","data":{"brandName":"PETPAWS 毛爪村","brandSub":"貓薄荷鮪魚主食罐（台灣）","overallScore":"8.6/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"貓薄荷機能","cls":"g"},{"text":"高適口性","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":4.5,"phos":0.2,"calcium":0.24,"sodium":0.29,"magnesium":0.022,"ash":2},"verdict":"鮪魚高適口+貓薄荷舒壓，挑嘴貓放鬆配方","_bk":"petpaws","_fk":"catnip_tuna"}},{"id":"sturgeon_cranberry","label":"雪鱘龍×蔓越莓（機能慕斯）","data":{"brandName":"PETPAWS 毛爪村","brandSub":"機能慕斯雪鱘龍蔓越莓","overallScore":"9.0/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"珍稀鱘龍魚","cls":"g"},{"text":"蔓越莓泌尿","cls":"g"},{"text":"慕斯質地","cls":"g"}],"nutrients":{"water":77,"protein":13,"fat":5,"phos":0.21,"calcium":0.25,"sodium":0.27,"magnesium":0.021,"ash":2.1},"verdict":"珍稀鱘龍魚+蔓越莓泌尿，護眼泌尿關節三效","_bk":"petpaws","_fk":"sturgeon_cranberry"}},{"id":"chicken_green_lipped","label":"鮮嫩雞×綠貽貝（機能）","data":{"brandName":"PETPAWS 毛爪村","brandSub":"機能鮮嫩雞綠貽貝","overallScore":"8.9/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"綠貽貝關節","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"綠貽貝護關節消炎+雞肉，老貓關節護眼首選","_bk":"petpaws","_fk":"chicken_green_lipped"}}]},
"pet_tomodachi":{"label":"Pet Tomodachi 寵心出發","aliases":["pet tomodachi","寵心出發","pettomodachi"],"flavors":[{"id":"milkfish_chicken","label":"虱目魚雞肉","data":{"brandName":"Pet Tomodachi 寵心出發","brandSub":"開這罐虱目魚雞肉主食罐","overallScore":"8.6/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣在地魚","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5,"phos":0.21,"calcium":0.25,"sodium":0.29,"magnesium":0.022,"ash":2},"verdict":"台灣虱目魚Omega-3+雞肉，護眼護膚在地配方","_bk":"pet_tomodachi","_fk":"milkfish_chicken"}},{"id":"pure_chicken","label":"香嫩鮮雞","data":{"brandName":"Pet Tomodachi 寵心出發","brandSub":"開這罐香嫩鮮雞主食罐","overallScore":"8.5/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"單一蛋白","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.26,"sodium":0.28,"magnesium":0.022,"ash":2.2},"verdict":"香嫩單一雞肉，成分簡單適合排除飲食","_bk":"pet_tomodachi","_fk":"pure_chicken"}},{"id":"mahi_chicken","label":"鬼頭刀雞肉","data":{"brandName":"Pet Tomodachi 寵心出發","brandSub":"開這罐鬼頭刀雞肉主食罐","overallScore":"8.6/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣在地魚","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5,"phos":0.21,"calcium":0.25,"sodium":0.29,"magnesium":0.022,"ash":2},"verdict":"台灣鬼頭刀搭雞肉，在地食材均衡Omega-3","_bk":"pet_tomodachi","_fk":"mahi_chicken"}},{"id":"salmon_beef","label":"鮭魚牛肉","data":{"brandName":"Pet Tomodachi 寵心出發","brandSub":"開這罐鮭魚牛肉主食罐","overallScore":"8.7/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"海陸雙蛋白","cls":"g"},{"text":"Omega-3","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.021,"ash":2.2},"verdict":"鮭魚牛肉海陸雙蛋白，Omega-3護眼護心","_bk":"pet_tomodachi","_fk":"salmon_beef"}}]},
"proudpet":{"label":"Proudpet 嬌寵醫生","aliases":["proudpet","嬌寵醫生"],"flavors":[{"id":"snail_chicken","label":"白玉蝸牛+雞肉","data":{"brandName":"Proudpet 嬌寵醫生","brandSub":"白玉蝸牛雞肉主食罐（台灣）","overallScore":"9.0/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"白玉蝸牛機能","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.28,"sodium":0.27,"magnesium":0.022,"ash":2.2},"verdict":"白玉蝸牛玻尿酸護關節護膚，老貓養生首選","_bk":"proudpet","_fk":"snail_chicken"}},{"id":"snail_salmon","label":"白玉蝸牛+鮭魚","data":{"brandName":"Proudpet 嬌寵醫生","brandSub":"白玉蝸牛鮭魚主食罐（台灣）","overallScore":"9.1/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"白玉蝸牛機能","cls":"g"},{"text":"高Omega-3","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6.5,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.021,"ash":2.2},"verdict":"白玉蝸牛玻尿酸+鮭魚Omega-3，護關節護眼護膚三效","_bk":"proudpet","_fk":"snail_salmon"}},{"id":"bee_chicken","label":"蜂子蛹+雞肉","data":{"brandName":"Proudpet 嬌寵醫生","brandSub":"蜂子蛹雞肉主食罐（台灣）","overallScore":"9.0/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"蜂子蛹機能","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.022,"ash":2.2},"verdict":"蜂子蛹天然酵素強化免疫，特殊機能台灣製","_bk":"proudpet","_fk":"bee_chicken"}},{"id":"bee_salmon","label":"蜂子蛹+鮭魚","data":{"brandName":"Proudpet 嬌寵醫生","brandSub":"蜂子蛹鮭魚主食罐（台灣）","overallScore":"9.1/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"蜂子蛹機能","cls":"g"},{"text":"高Omega-3","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6.5,"phos":0.21,"calcium":0.27,"sodium":0.27,"magnesium":0.021,"ash":2.2},"verdict":"蜂子蛹免疫+鮭魚Omega-3，護眼免疫雙效","_bk":"proudpet","_fk":"bee_salmon"}}]},
"push":{"label":"Push! 噗滋包","aliases":["push!","噗滋包","push"],"flavors":[{"id":"happy_y","label":"貪吃小嘴Y（HAPPY機能）","data":{"brandName":"Push! 噗滋包","brandSub":"HAPPY機能貪吃小嘴Y主食罐","overallScore":"8.7/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"台灣製造","cls":"g"},{"text":"機能配方","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5,"phos":0.21,"calcium":0.25,"sodium":0.28,"magnesium":0.022,"ash":2},"verdict":"益生菌機能配方，腸道健康護眼日常","_bk":"push","_fk":"happy_y"}},{"id":"flagship_duck_cod","label":"鴨肉鱈魚（旗艦）","data":{"brandName":"Push! 噗滋包","brandSub":"旗艦鴨肉鱈魚主食罐","overallScore":"8.9/10","overallClass":"g","meatPercent":"84%","tags":[{"text":"低敏雙蛋白","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.021,"ash":2.2},"verdict":"低敏鴨肉鱈魚雙蛋白，過敏貓首選旗艦配方","_bk":"push","_fk":"flagship_duck_cod"}},{"id":"flagship_salmon_tuna","label":"鮭魚鮪魚（旗艦）","data":{"brandName":"Push! 噗滋包","brandSub":"旗艦鮭魚鮪魚主食罐","overallScore":"8.9/10","overallClass":"g","meatPercent":"83%","tags":[{"text":"雙魚Omega-3","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":6,"phos":0.21,"calcium":0.26,"sodium":0.27,"magnesium":0.021,"ash":2.1},"verdict":"鮭魚鮪魚雙魚Omega-3，護眼護膚護心三效","_bk":"push","_fk":"flagship_salmon_tuna"}},{"id":"flagship_chicken","label":"雞肉（旗艦）","data":{"brandName":"Push! 噗滋包","brandSub":"旗艦雞肉主食罐","overallScore":"8.7/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"台灣製造","cls":"g"},{"text":"高肉量","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":76,"protein":13,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.022,"ash":2.2},"verdict":"旗艦雞肉高肉量成分乾淨，日常主食首選","_bk":"push","_fk":"flagship_chicken"}}]},
"mao_zhou":{"label":"毛孩舟舟","aliases":["毛孩舟舟","舟舟"],"flavors":[{"id":"chicken_guava_seaweed","label":"雞肉+芭樂+海藻","data":{"brandName":"毛孩舟舟","brandSub":"開罐罐罐雞肉芭樂海藻主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"81%","tags":[{"text":"台灣製造","cls":"g"},{"text":"海藻碘補充","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5,"phos":0.21,"calcium":0.25,"sodium":0.29,"magnesium":0.022,"ash":2},"verdict":"雞肉搭芭樂維生素C+海藻碘，甲狀腺護眼均衡","_bk":"mao_zhou","_fk":"chicken_guava_seaweed"}},{"id":"chicken_marlin_oat","label":"雞肉+旗魚+燕麥+薑黃","data":{"brandName":"毛孩舟舟","brandSub":"開罐罐罐雞肉旗魚燕麥薑黃主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"80%","tags":[{"text":"薑黃抗發炎","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"燕麥纖維","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":5,"phos":0.21,"calcium":0.25,"sodium":0.28,"magnesium":0.022,"ash":2},"verdict":"薑黃強效抗發炎+旗魚Omega-3，關節護心配方","_bk":"mao_zhou","_fk":"chicken_marlin_oat"}},{"id":"tuna_scallop_cucumber","label":"鮪魚+干貝+大黃瓜","data":{"brandName":"毛孩舟舟","brandSub":"開罐罐罐鮪魚干貝大黃瓜主食罐（台灣）","overallScore":"8.7/10","overallClass":"g","meatPercent":"81%","tags":[{"text":"天然牛磺酸","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"補水蔬菜","cls":"g"}],"nutrients":{"water":78,"protein":12,"fat":4,"phos":0.2,"calcium":0.24,"sodium":0.3,"magnesium":0.023,"ash":1.9},"verdict":"干貝天然牛磺酸+大黃瓜補水，護眼補水雙效","_bk":"mao_zhou","_fk":"tuna_scallop_cucumber"}},{"id":"tuna_coix_pumpkin","label":"鮪魚+薏仁+南瓜","data":{"brandName":"毛孩舟舟","brandSub":"開罐罐罐鮪魚薏仁南瓜主食罐（台灣）","overallScore":"8.6/10","overallClass":"g","meatPercent":"81%","tags":[{"text":"薏仁消水腫","cls":"g"},{"text":"台灣製造","cls":"g"},{"text":"均衡蔬果","cls":"g"}],"nutrients":{"water":77,"protein":12,"fat":4.5,"phos":0.2,"calcium":0.24,"sodium":0.29,"magnesium":0.022,"ash":2},"verdict":"薏仁消水腫+南瓜纖維，助消化均衡配方","_bk":"mao_zhou","_fk":"tuna_coix_pumpkin"}}]},
"trilogy":{"label":"TRILOGY 奇境","aliases":["trilogy","奇境","trilogy奇境"],"flavors":[{"id":"tuna_chicken_soup","label":"野生鮪魚燉雞湯","data":{"brandName":"TRILOGY 奇境","brandSub":"野生鮪魚燉雞湯主食罐（紐西蘭）","overallScore":"8.8/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"紐西蘭製","cls":"g"},{"text":"無穀無膠","cls":"g"},{"text":"高肉量","cls":"g"}],"nutrients":{"water":78,"protein":12,"fat":5,"phos":0.21,"calcium":0.26,"sodium":0.27,"magnesium":0.019,"ash":2.1},"verdict":"紐西蘭製無穀無膠，鮪魚燉雞湯口感佳，成分乾淨","_bk":"trilogy","_fk":"tuna_chicken_soup"}},{"id":"mackerel_chicken_soup","label":"野生鯖魚燉雞湯","data":{"brandName":"TRILOGY 奇境","brandSub":"野生鯖魚燉雞湯主食罐（紐西蘭）","overallScore":"8.9/10","overallClass":"g","meatPercent":"82%","tags":[{"text":"紐西蘭製","cls":"g"},{"text":"高Omega-3","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":78,"protein":12,"fat":5.5,"phos":0.22,"calcium":0.27,"sodium":0.27,"magnesium":0.02,"ash":2.1},"verdict":"鯖魚高Omega-3，護眼護心效果佳，紐西蘭製無膠","_bk":"trilogy","_fk":"mackerel_chicken_soup"}},{"id":"chicken_broth","label":"牧場純雞燉雞肉","data":{"brandName":"TRILOGY 奇境","brandSub":"牧場純雞燉雞肉主食罐（紐西蘭）","overallScore":"8.7/10","overallClass":"g","meatPercent":"85%","tags":[{"text":"紐西蘭製","cls":"g"},{"text":"純雞肉","cls":"g"},{"text":"無穀無膠","cls":"g"}],"nutrients":{"water":80,"protein":11,"fat":4.5,"phos":0.2,"calcium":0.25,"sodium":0.26,"magnesium":0.018,"ash":2},"verdict":"純雞肉無穀無膠，適合挑嘴貓及腸胃敏感貓咪","_bk":"trilogy","_fk":"chicken_broth"}}]}
};

var BRANDS_DETAIL = {
"ziwi_peak":{"lamb":{"i":[{"n":"羊肉","c":"動物蛋白","s":"g"},{"n":"羊肺","c":"器官肉","s":"g"},{"n":"羊心","c":"器官肉","s":"g"},{"n":"羊肝","c":"器官肉","s":"g"},{"n":"海帶","c":"植物","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加任何膠類，成分極為乾淨","cls":"g"},{"cat":"誘食劑","text":"無任何人工誘食劑","cls":"g"}]},"beef":{"i":[{"n":"牛肉","c":"動物蛋白","s":"g"},{"n":"牛肺","c":"器官肉","s":"g"},{"n":"牛心","c":"器官肉","s":"g"},{"n":"牛肝","c":"器官肉","s":"g"},{"n":"海帶","c":"植物","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"venison":{"i":[{"n":"鹿肉","c":"動物蛋白","s":"g"},{"n":"鹿肺","c":"器官肉","s":"g"},{"n":"鹿心","c":"器官肉","s":"g"},{"n":"鹿肝","c":"器官肉","s":"g"},{"n":"海帶","c":"植物","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"mackerel_lamb":{"i":[{"n":"鯖魚","c":"動物蛋白","s":"g"},{"n":"羊肉","c":"動物蛋白","s":"g"},{"n":"羊心","c":"器官肉","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"海帶","c":"植物","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加","cls":"g"},{"cat":"誘食劑","text":"無人工添加","cls":"g"}]},"mackerel":{"i":[{"n":"鯖魚","c":"動物蛋白","s":"g"},{"n":"鯖魚心","c":"器官肉","s":"g"},{"n":"鯖魚肝","c":"器官肉","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"海帶","c":"植物","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加","cls":"g"},{"cat":"誘食劑","text":"無人工添加","cls":"g"}]},"chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞肺","c":"器官肉","s":"g"},{"n":"雞心","c":"器官肉","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"海帶","c":"植物","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加","cls":"g"},{"cat":"誘食劑","text":"無人工添加","cls":"g"}]},"rabbit":{"i":[{"n":"兔肉","c":"動物蛋白","s":"g"},{"n":"兔肺","c":"器官肉","s":"g"},{"n":"兔心","c":"器官肉","s":"g"},{"n":"兔肝","c":"器官肉","s":"g"},{"n":"海帶","c":"植物","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加","cls":"g"},{"cat":"誘食劑","text":"無任何添加","cls":"g"}]},"dual_lamb":{"i":[{"n":"羊肉","c":"動物蛋白","s":"g"},{"n":"羊奶","c":"動物蛋白","s":"g"},{"n":"羊心","c":"器官肉","s":"g"},{"n":"羊肝","c":"器官肉","s":"g"},{"n":"海帶","c":"植物","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加","cls":"g"},{"cat":"誘食劑","text":"無人工添加","cls":"g"}]},"white_meat":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"兔肉","c":"動物蛋白","s":"g"},{"n":"雞心","c":"器官肉","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"海帶","c":"植物","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加","cls":"g"},{"cat":"誘食劑","text":"無人工添加","cls":"g"}]},"beef_venison":{"i":[{"n":"牛肉","c":"動物蛋白","s":"g"},{"n":"鹿肉","c":"動物蛋白","s":"g"},{"n":"牛心","c":"器官肉","s":"g"},{"n":"鹿肝","c":"器官肉","s":"g"},{"n":"海帶","c":"植物","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加","cls":"g"},{"cat":"誘食劑","text":"無人工添加","cls":"g"}]},"cod":{"i":[{"n":"鱈魚","c":"動物蛋白","s":"g"},{"n":"鱈魚心","c":"器官肉","s":"g"},{"n":"鱈魚肝","c":"器官肉","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"海帶","c":"植物","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加","cls":"g"},{"cat":"誘食劑","text":"無人工添加","cls":"g"}]}},
"k9_natural":{"beef":{"i":[{"n":"牛肉","c":"動物蛋白","s":"g"},{"n":"牛心","c":"器官肉","s":"g"},{"n":"牛肝","c":"器官肉","s":"g"},{"n":"牛腎","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加任何膠類","cls":"g"},{"cat":"誘食劑","text":"無任何添加，天然原料","cls":"g"}]},"lamb":{"i":[{"n":"羊肉","c":"動物蛋白","s":"g"},{"n":"羊心","c":"器官肉","s":"g"},{"n":"羊肝","c":"動物蛋白","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加","cls":"g"},{"cat":"誘食劑","text":"無任何添加","cls":"g"}]},"chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞心","c":"器官肉","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"地瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加","cls":"g"},{"cat":"誘食劑","text":"無任何添加","cls":"g"}]},"salmon":{"i":[{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"鮭魚油","c":"脂肪","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"維生素D3","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加","cls":"g"},{"cat":"誘食劑","text":"無任何添加","cls":"g"}]},"venison":{"i":[{"n":"鹿肉","c":"動物蛋白","s":"g"},{"n":"鹿心","c":"器官肉","s":"g"},{"n":"鹿肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加","cls":"g"},{"cat":"誘食劑","text":"無任何添加","cls":"g"}]}},
"farmina":{"salmon_pumpkin":{"i":[{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"有機菠菜","c":"蔬菜","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無任何人工誘食劑","cls":"g"}]},"chicken_pumpkin":{"i":[{"n":"有機雞肉","c":"動物蛋白","s":"g"},{"n":"有機南瓜","c":"蔬果","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"duck_pumpkin":{"i":[{"n":"有機鴨肉","c":"動物蛋白","s":"g"},{"n":"有機南瓜","c":"蔬果","s":"g"},{"n":"鴨肝","c":"器官肉","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"lamb_pumpkin":{"i":[{"n":"有機羊肉","c":"動物蛋白","s":"g"},{"n":"有機南瓜","c":"蔬果","s":"g"},{"n":"羊肝","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加","cls":"g"},{"cat":"誘食劑","text":"無人工添加","cls":"g"}]},"venison_apple":{"i":[{"n":"有機鹿肉","c":"動物蛋白","s":"g"},{"n":"有機蘋果","c":"蔬果","s":"g"},{"n":"鹿肝","c":"器官肉","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加","cls":"g"},{"cat":"誘食劑","text":"無人工添加","cls":"g"}]}},
"terra_canis":{"turkey":{"i":[{"n":"火雞肉","c":"動物蛋白","s":"g"},{"n":"火雞心","c":"器官肉","s":"g"},{"n":"有機蔬菜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"chicken":{"i":[{"n":"有機雞肉","c":"動物蛋白","s":"g"},{"n":"雞心","c":"器官肉","s":"g"},{"n":"有機蔬菜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"salmon":{"i":[{"n":"野生鮭魚","c":"動物蛋白","s":"g"},{"n":"鮭魚油","c":"脂肪","s":"g"},{"n":"有機蔬菜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"rabbit":{"i":[{"n":"兔肉","c":"動物蛋白","s":"g"},{"n":"兔心","c":"器官肉","s":"g"},{"n":"有機蔬菜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"chicken_turkey":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"火雞肉","c":"動物蛋白","s":"g"},{"n":"有機蔬菜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"salmon_chicken":{"i":[{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"鮭魚油","c":"脂肪","s":"g"},{"n":"有機蔬菜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"rabbit_turkey":{"i":[{"n":"兔肉","c":"動物蛋白","s":"g"},{"n":"火雞肉","c":"動物蛋白","s":"g"},{"n":"有機蔬菜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"lamb_chicken":{"i":[{"n":"羊肉","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"有機蔬菜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]}},
"instinct_brand":{"chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"益生菌","c":"補充劑","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"venison_gf":{"i":[{"n":"鹿肉","c":"動物蛋白","s":"g"},{"n":"鹿肝","c":"器官肉","s":"g"},{"n":"益生菌","c":"補充劑","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"duck_gf":{"i":[{"n":"鴨肉","c":"動物蛋白","s":"g"},{"n":"鴨肝","c":"器官肉","s":"g"},{"n":"益生菌","c":"補充劑","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"salmon_gf":{"i":[{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"鮭魚油","c":"脂肪","s":"g"},{"n":"益生菌","c":"補充劑","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"chicken_gf":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"益生菌","c":"補充劑","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"lamb_gf":{"i":[{"n":"羊肉","c":"動物蛋白","s":"g"},{"n":"羊肝","c":"器官肉","s":"g"},{"n":"益生菌","c":"補充劑","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"salmon_lp":{"i":[{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"鮭魚油","c":"脂肪","s":"g"},{"n":"木薯粉","c":"增稠劑","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"turkey_lp":{"i":[{"n":"火雞肉","c":"動物蛋白","s":"g"},{"n":"木薯粉","c":"增稠劑","s":"g"},{"n":"椰子油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]}},
"abao":{"tuna_bass":{"i":[{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"鱸魚","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加任何膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"chicken_quail":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"鵪鶉肉","c":"動物蛋白","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"beef_tuna":{"i":[{"n":"牛肉","c":"動物蛋白","s":"g"},{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"牛肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"marlin_bonito":{"i":[{"n":"旗魚","c":"動物蛋白","s":"g"},{"n":"鰹魚","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"betty's":{"duck":{"i":[{"n":"鴨肉","c":"動物蛋白","s":"g"},{"n":"鴨肝","c":"器官肉","s":"g"},{"n":"鴨心","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_salmon":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"琉璃苣籽油","c":"脂肪","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_pheasant":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"野雞肉","c":"動物蛋白","s":"g"},{"n":"琉璃苣籽油","c":"脂肪","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_turkey":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"火雞肉","c":"動物蛋白","s":"g"},{"n":"琉璃苣籽油","c":"脂肪","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_turkey_kitten":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"火雞肉","c":"動物蛋白","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"kangaroo":{"i":[{"n":"袋鼠肉","c":"動物蛋白","s":"g"},{"n":"馬鈴薯","c":"碳水","s":"g"},{"n":"袋鼠肝","c":"器官肉","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"goatmilk_chick_tuna":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"羊奶","c":"乳製品","s":"a"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"goatmilk_chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"羊奶","c":"乳製品","s":"a"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"poultry":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"火雞肉","c":"動物蛋白","s":"g"},{"n":"家禽肝臟","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"carnivore raw":{"chicken_venison":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"鹿肉","c":"動物蛋白","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_duck":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"鴨肉","c":"動物蛋白","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_beef":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"牛肉","c":"動物蛋白","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞心","c":"器官肉","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"catdives":{"filet_beef":{"i":[{"n":"菲力牛肉","c":"動物蛋白","s":"g"},{"n":"牛肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"venison":{"i":[{"n":"鹿肉","c":"動物蛋白","s":"g"},{"n":"鹿肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"tuna_chicken":{"i":[{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"雞胸肉","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_breast":{"i":[{"n":"雞胸肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"beef_chicken":{"i":[{"n":"板腱牛肉","c":"動物蛋白","s":"g"},{"n":"雞胸肉","c":"動物蛋白","s":"g"},{"n":"牛肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"lamb_chicken":{"i":[{"n":"羊肉","c":"動物蛋白","s":"g"},{"n":"雞胸肉","c":"動物蛋白","s":"g"},{"n":"羊肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"furkid lab":{"duck":{"i":[{"n":"鴨肉","c":"動物蛋白","s":"g"},{"n":"鴨心","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"venison":{"i":[{"n":"鹿肉","c":"動物蛋白","s":"g"},{"n":"鹿肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"beef":{"i":[{"n":"牛肉","c":"動物蛋白","s":"g"},{"n":"牛心","c":"器官肉","s":"g"},{"n":"牛肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"fish":{"i":[{"n":"白魚","c":"動物蛋白","s":"g"},{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"seafood":{"i":[{"n":"蝦","c":"動物蛋白","s":"a"},{"n":"魚肉","c":"動物蛋白","s":"g"},{"n":"魚湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken":{"i":[{"n":"雞腿肉","c":"動物蛋白","s":"g"},{"n":"雞心","c":"器官肉","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"gussto":{"chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞心","c":"器官肉","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"salmon":{"i":[{"n":"野生鮭魚","c":"動物蛋白","s":"g"},{"n":"鮭魚油","c":"脂肪","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"pork":{"i":[{"n":"野味豬肉","c":"動物蛋白","s":"g"},{"n":"豬肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"lamb":{"i":[{"n":"羊肉","c":"動物蛋白","s":"g"},{"n":"羊肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"turkey_duck":{"i":[{"n":"火雞肉","c":"動物蛋白","s":"g"},{"n":"鴨肉","c":"動物蛋白","s":"g"},{"n":"家禽肝臟","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"turkey_tuna":{"i":[{"n":"火雞肉","c":"動物蛋白","s":"g"},{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"家禽肝臟","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"catssay":{"mahi_seacucumber":{"i":[{"n":"鬼頭刀","c":"動物蛋白","s":"g"},{"n":"海參","c":"補充劑","s":"g"},{"n":"魚湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"pure_chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"beef_chicken":{"i":[{"n":"牛肉","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"seafood":{"i":[{"n":"白魚","c":"動物蛋白","s":"g"},{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"海瓜子","c":"動物蛋白","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"sea_urchin_shrimp":{"i":[{"n":"海膽","c":"動物蛋白","s":"g"},{"n":"蝦","c":"動物蛋白","s":"a"},{"n":"魚湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"pigeon_chicken":{"i":[{"n":"乳鴿肉","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"家禽肝臟","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"cod_salmon_lactoferrin":{"i":[{"n":"鱈魚","c":"動物蛋白","s":"g"},{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"乳鐵蛋白","c":"補充劑","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"sea_urchin_scallop_lactoferrin":{"i":[{"n":"海膽","c":"動物蛋白","s":"g"},{"n":"干貝","c":"動物蛋白","s":"g"},{"n":"乳鐵蛋白","c":"補充劑","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"duck_lactoferrin":{"i":[{"n":"櫻桃鴨肉","c":"動物蛋白","s":"g"},{"n":"鴨肝","c":"器官肉","s":"g"},{"n":"乳鐵蛋白","c":"補充劑","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"goat_chicken_lactoferrin":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"山羊奶","c":"乳製品","s":"a"},{"n":"乳鐵蛋白","c":"補充劑","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"rabbit_quail_lactoferrin":{"i":[{"n":"兔肉","c":"動物蛋白","s":"g"},{"n":"鵪鶉肉","c":"動物蛋白","s":"g"},{"n":"乳鐵蛋白","c":"補充劑","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"couch_potato":{"pure_chicken":{"i":[{"n":"溫體雞肉","c":"動物蛋白","s":"g"},{"n":"雞心","c":"器官肉","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"雞骨泥","c":"礦物質來源","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"pure_pork":{"i":[{"n":"溫體豬肉","c":"動物蛋白","s":"g"},{"n":"豬心","c":"器官肉","s":"g"},{"n":"豬肝","c":"器官肉","s":"g"},{"n":"雞骨泥","c":"礦物質來源","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"pure_beef":{"i":[{"n":"溫體牛肉","c":"動物蛋白","s":"g"},{"n":"牛心","c":"器官肉","s":"g"},{"n":"牛肝","c":"器官肉","s":"g"},{"n":"雞骨泥","c":"礦物質來源","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"berry_chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"莓果","c":"蔬果","s":"g"},{"n":"雞心","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"rabbit":{"i":[{"n":"兔肉","c":"動物蛋白","s":"g"},{"n":"兔肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"pomegranate_chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"紅石榴","c":"蔬果","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"pastoral_chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"田園蔬菜","c":"蔬菜","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"salmon":{"i":[{"n":"野生鮭魚","c":"動物蛋白","s":"g"},{"n":"鮭魚油","c":"脂肪","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"venison":{"i":[{"n":"鹿肉","c":"動物蛋白","s":"g"},{"n":"鹿肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"land_sea_chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"白魚","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"firstmate":{"chicken":{"i":[{"n":"非籠養雞肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"木薯粉","c":"增稠劑","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"turkey":{"i":[{"n":"非籠養火雞肉","c":"動物蛋白","s":"g"},{"n":"火雞湯","c":"水分","s":"g"},{"n":"木薯粉","c":"增稠劑","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"salmon":{"i":[{"n":"野生鮭魚","c":"動物蛋白","s":"g"},{"n":"鮭魚油","c":"脂肪","s":"g"},{"n":"木薯粉","c":"增稠劑","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"munchee":{"chicken_super":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞心","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"bass_chicken_super":{"i":[{"n":"鱸魚","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_duck_super":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"鴨肉","c":"動物蛋白","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"venison_bass_super":{"i":[{"n":"鹿肉","c":"動物蛋白","s":"g"},{"n":"鱸魚","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"island_chicken":{"i":[{"n":"台灣雞肉","c":"動物蛋白","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_beef_strips":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"火雞肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"paw_paw_nian":{"chicken_sunflower":{"i":[{"n":"雞腿肉","c":"動物蛋白","s":"g"},{"n":"葵花籽油","c":"脂肪","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"salmon_scallop":{"i":[{"n":"銀鮭魚","c":"動物蛋白","s":"g"},{"n":"干貝","c":"動物蛋白","s":"g"},{"n":"鮭魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"filet_beef":{"i":[{"n":"菲力牛肉","c":"動物蛋白","s":"g"},{"n":"無花果","c":"蔬果","s":"g"},{"n":"紅藜麥","c":"補充劑","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"tata_care":{"chicken_herb":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"天然香草","c":"植物","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"salmon":{"i":[{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"鮭魚油","c":"脂肪","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"duck":{"i":[{"n":"鴨胸肉","c":"動物蛋白","s":"g"},{"n":"鴨肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"beef":{"i":[{"n":"草飼牛肉","c":"動物蛋白","s":"g"},{"n":"牛心","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"earth_chicken_egg":{"i":[{"n":"土雞肉","c":"動物蛋白","s":"g"},{"n":"雞蛋","c":"動物蛋白","s":"a"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"turkey":{"i":[{"n":"火雞肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"milkfish":{"i":[{"n":"虱目魚","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"clam":{"i":[{"n":"海瓜子","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"cody_mao":{"bonito_berry":{"i":[{"n":"鰹魚","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"藍莓","c":"蔬果","s":"g"},{"n":"蔓越莓","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"tuna_edamame":{"i":[{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"毛豆","c":"蔬菜","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_apple":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"蘋果","c":"蔬果","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"milkfish_black_fungus":{"i":[{"n":"虱目魚","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"黑木耳","c":"蔬菜","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"hoorooroo":{"chicken_turkey":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"火雞肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_beef":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"牛肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_salmon":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"bonito_whitebait":{"i":[{"n":"鰹魚","c":"動物蛋白","s":"g"},{"n":"魩仔魚","c":"動物蛋白","s":"g"},{"n":"魚湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"tuna_salmon":{"i":[{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"marlin_clam":{"i":[{"n":"旗魚","c":"動物蛋白","s":"g"},{"n":"海瓜子","c":"動物蛋白","s":"g"},{"n":"魚湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"maoup":{"chicken_fish":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_marlin":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"旗魚","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"pastoral_chicken":{"i":[{"n":"田園雞肉","c":"動物蛋白","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"goat_chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"山羊奶","c":"乳製品","s":"a"},{"n":"雞湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"xin_tou_rou":{"lamb":{"i":[{"n":"羊肉","c":"動物蛋白","s":"g"},{"n":"洛神花","c":"蔬果","s":"g"},{"n":"羊肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"duck":{"i":[{"n":"鴨肉","c":"動物蛋白","s":"g"},{"n":"洛神花","c":"蔬果","s":"g"},{"n":"鴨肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"turkey":{"i":[{"n":"火雞肉","c":"動物蛋白","s":"g"},{"n":"洛神花","c":"蔬果","s":"g"},{"n":"火雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"seafood":{"i":[{"n":"白魚","c":"動物蛋白","s":"g"},{"n":"蝦","c":"動物蛋白","s":"a"},{"n":"魚湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"beef_silk":{"i":[{"n":"牛肉","c":"動物蛋白","s":"g"},{"n":"牛心","c":"器官肉","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_silk":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"salmon_silk":{"i":[{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"鮭魚油","c":"脂肪","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"jijie_wan":{"pork_mackerel":{"i":[{"n":"豬肉","c":"動物蛋白","s":"g"},{"n":"鯖魚","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"duck_egg_yolk":{"i":[{"n":"櫻桃鴨肝","c":"器官肉","s":"g"},{"n":"雞蛋黃","c":"動物蛋白","s":"a"},{"n":"鴨肉","c":"動物蛋白","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"roast_chicken":{"i":[{"n":"嫩雞肉","c":"動物蛋白","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"beef":{"i":[{"n":"牛肉","c":"動物蛋白","s":"g"},{"n":"牛心","c":"器官肉","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"vet_research":{"kitten_chicken":{"i":[{"n":"放牧雞肉","c":"動物蛋白","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"kitten_fish":{"i":[{"n":"海魚","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"immune_chicken":{"i":[{"n":"放牧雞肉","c":"動物蛋白","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"益生菌","c":"補充劑","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"urinary_chicken":{"i":[{"n":"放牧雞肉","c":"動物蛋白","s":"g"},{"n":"蔓越莓","c":"蔬果","s":"g"},{"n":"益生菌","c":"補充劑","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"DL-蛋胺酸","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"kidney_chicken":{"i":[{"n":"放牧雞肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"益生菌","c":"補充劑","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"維生素B群","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"pinjitu":{"turkey":{"i":[{"n":"火雞肉","c":"動物蛋白","s":"g"},{"n":"火雞湯","c":"水分","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"bass":{"i":[{"n":"鱸魚","c":"動物蛋白","s":"g"},{"n":"魚湯","c":"水分","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"quail":{"i":[{"n":"鵪鶉肉","c":"動物蛋白","s":"g"},{"n":"鵪鶉肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"duck":{"i":[{"n":"鴨肉","c":"動物蛋白","s":"g"},{"n":"鴨肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"beef":{"i":[{"n":"牛肉","c":"動物蛋白","s":"g"},{"n":"牛心","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"hao_shi_yusu":{"chicken":{"i":[{"n":"嫩雞肉","c":"動物蛋白","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"quail":{"i":[{"n":"鵪鶉肉","c":"動物蛋白","s":"g"},{"n":"鵪鶉蛋","c":"動物蛋白","s":"a"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"tuna_salmon":{"i":[{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"beef":{"i":[{"n":"牛肉","c":"動物蛋白","s":"g"},{"n":"牛心","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"mao_yan_gong":{"double_egg_tomato":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"番茄","c":"蔬果","s":"g"},{"n":"雞蛋","c":"動物蛋白","s":"a"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"swordfish":{"i":[{"n":"旗魚","c":"動物蛋白","s":"g"},{"n":"鮮蔬","c":"蔬菜","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"duck_flaxseed":{"i":[{"n":"鴨肉","c":"動物蛋白","s":"g"},{"n":"亞麻籽油","c":"脂肪","s":"g"},{"n":"香草","c":"植物","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"double_fish":{"i":[{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"白魚","c":"動物蛋白","s":"g"},{"n":"葉黃素","c":"補充劑","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"wu_hang":{"red":{"i":[{"n":"牛肉","c":"動物蛋白","s":"g"},{"n":"番茄","c":"蔬果","s":"g"},{"n":"紅蘿蔔","c":"蔬菜","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"white":{"i":[{"n":"白魚","c":"動物蛋白","s":"g"},{"n":"白蘿蔔","c":"蔬菜","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"yellow":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"薑黃","c":"植物","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"green":{"i":[{"n":"鴨肉","c":"動物蛋白","s":"g"},{"n":"菠菜","c":"蔬菜","s":"g"},{"n":"地瓜葉","c":"蔬菜","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"purple":{"i":[{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"紫地瓜","c":"蔬果","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"heromama":{"chicken_breast_light":{"i":[{"n":"雞胸肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"clam_chicken_light":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"花蛤","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"beef_light":{"i":[{"n":"牛腿肉","c":"動物蛋白","s":"g"},{"n":"牛湯","c":"水分","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"bass_light":{"i":[{"n":"鱸魚","c":"動物蛋白","s":"g"},{"n":"魚湯","c":"水分","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"native_chicken":{"i":[{"n":"黑羽土雞","c":"動物蛋白","s":"g"},{"n":"雞心","c":"器官肉","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"bass_traceable":{"i":[{"n":"金目鱸魚","c":"動物蛋白","s":"g"},{"n":"魚湯","c":"水分","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"bass_chicken_party":{"i":[{"n":"鱸魚","c":"動物蛋白","s":"g"},{"n":"嫩雞肉","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"hururu":{"tuna":{"i":[{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞心","c":"器官肉","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"beef":{"i":[{"n":"牛肉","c":"動物蛋白","s":"g"},{"n":"牛心","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"meow_servant":{"quail_chicken":{"i":[{"n":"鵪鶉肉","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"家禽肝臟","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"salmon_chicken":{"i":[{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_beef":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"牛肉","c":"動物蛋白","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"pure_chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_bsf":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"黑水虻","c":"補充劑","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"tuna_bsf":{"i":[{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"黑水虻","c":"補充劑","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"missbebe":{"chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"quail":{"i":[{"n":"鵪鶉肉","c":"動物蛋白","s":"g"},{"n":"鵪鶉肝","c":"器官肉","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"salmon_chicken":{"i":[{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"tuna_chicken":{"i":[{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"krill_chicken":{"i":[{"n":"嫩雞肉","c":"動物蛋白","s":"g"},{"n":"磷蝦油","c":"脂肪","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"natural10":{"bass_chicken_soup":{"i":[{"n":"鱸魚","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"魚湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"salmon_sauce_frog":{"i":[{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"田雞","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"bonito_chicken":{"i":[{"n":"鰹魚","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"beef_chicken_luna":{"i":[{"n":"牛肉","c":"動物蛋白","s":"g"},{"n":"雞蛋黃","c":"動物蛋白","s":"a"},{"n":"雞湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"paw_paw_land":{"chicken_resveratrol":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"白藜蘆醇","c":"補充劑","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"tuna_fucoidan":{"i":[{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"褐藻醣膠","c":"補充劑","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"krill_chicken_cranberry":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"南極磷蝦油","c":"脂肪","s":"g"},{"n":"蔓越莓","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"krill_tuna_prebiotics":{"i":[{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"南極磷蝦油","c":"脂肪","s":"g"},{"n":"益生元","c":"補充劑","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"petcook":{"crocodile_chicken":{"i":[{"n":"鱷魚肉","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"turtle_marlin":{"i":[{"n":"鱉肉","c":"動物蛋白","s":"g"},{"n":"旗魚","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"eel_chicken":{"i":[{"n":"鰻魚","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"鰻魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"shrimp_marlin":{"i":[{"n":"蝦仁","c":"動物蛋白","s":"a"},{"n":"旗魚","c":"動物蛋白","s":"g"},{"n":"魚湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"petpaws":{"catnip_pumpkin_chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"貓薄荷","c":"植物","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"catnip_tuna":{"i":[{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"貓薄荷","c":"植物","s":"g"},{"n":"魚湯","c":"水分","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"sturgeon_cranberry":{"i":[{"n":"鱘龍魚","c":"動物蛋白","s":"g"},{"n":"蔓越莓","c":"蔬果","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_green_lipped":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"綠貽貝","c":"補充劑","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"pet_tomodachi":{"milkfish_chicken":{"i":[{"n":"虱目魚","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"pure_chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"mahi_chicken":{"i":[{"n":"鬼頭刀","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"salmon_beef":{"i":[{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"牛肉","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"proudpet":{"snail_chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"白玉蝸牛","c":"補充劑","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"snail_salmon":{"i":[{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"白玉蝸牛","c":"補充劑","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"bee_chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"蜂子蛹","c":"補充劑","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"bee_salmon":{"i":[{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"蜂子蛹","c":"補充劑","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"push":{"happy_y":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"益生菌","c":"補充劑","s":"g"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"flagship_duck_cod":{"i":[{"n":"鴨肉","c":"動物蛋白","s":"g"},{"n":"鱈魚","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"flagship_salmon_tuna":{"i":[{"n":"鮭魚","c":"動物蛋白","s":"g"},{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"魚油","c":"脂肪","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"flagship_chicken":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞心","c":"器官肉","s":"g"},{"n":"雞肝","c":"器官肉","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"mao_zhou":{"chicken_guava_seaweed":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"芭樂","c":"蔬果","s":"g"},{"n":"海藻","c":"植物","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"chicken_marlin_oat":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"旗魚","c":"動物蛋白","s":"g"},{"n":"薑黃","c":"植物","s":"g"},{"n":"燕麥","c":"碳水","s":"a"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"tuna_scallop_cucumber":{"i":[{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"干貝","c":"動物蛋白","s":"g"},{"n":"大黃瓜","c":"蔬菜","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]},"tuna_coix_pumpkin":{"i":[{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"薏仁","c":"碳水","s":"a"},{"n":"南瓜","c":"蔬果","s":"g"},{"n":"牛磺酸","c":"補充劑","s":"g"},{"n":"維生素E","c":"補充劑","s":"g"},{"n":"鋅","c":"礦物質","s":"g"}],"r":[{"cat":"膠類","text":"無添加","cls":"g"},{"cat":"誘食劑","text":"無添加","cls":"g"}]}},
"trilogy":{"tuna_chicken_soup":{"i":[{"n":"鮪魚","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"mackerel_chicken_soup":{"i":[{"n":"鯖魚","c":"動物蛋白","s":"g"},{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]},"chicken_broth":{"i":[{"n":"雞肉","c":"動物蛋白","s":"g"},{"n":"雞湯","c":"水分","s":"g"}],"r":[{"cat":"膠類","text":"完全無添加膠類","cls":"g"},{"cat":"誘食劑","text":"無人工誘食劑","cls":"g"}]}}
};
// ─── PRESETS ──────────────────────────────────

var PRESETS = ["Ziwi Peak","K9 Natural","Couch Potato"];

// ─── SEARCH ───────────────────────────────────

function searchBrands(query,db){
  var q=query.toLowerCase().trim();
  var results=[];
  var keys=Object.keys(db);
  for(var i=0;i<keys.length;i++){
    var key=keys[i];
    var brand=db[key];
    var aliases=brand.aliases||[];
    var brandMatch=false;
    for(var ai=0;ai<aliases.length;ai++){
      var a=aliases[ai];
      if(q===a||q.startsWith(a)||a.startsWith(q.split(" ")[0])){brandMatch=true;break;}
      var parts=q.split(" ");
      for(var pi=0;pi<parts.length;pi++){if(parts[pi].length>1&&a.indexOf(parts[pi])>=0){brandMatch=true;break;}}
      if(brandMatch)break;
    }
    if(brandMatch){
      var flavorHint=q;
      for(var ai2=0;ai2<aliases.length;ai2++){flavorHint=flavorHint.replace(aliases[ai2],"").trim();}
      flavorHint=flavorHint.trim();
      var found=null;
      if(flavorHint){
        for(var fi=0;fi<(brand.flavors||[]).length;fi++){
          var f=brand.flavors[fi];
          if(f.label.toLowerCase().indexOf(flavorHint)>=0||flavorHint.indexOf(f.label.toLowerCase())>=0){found=f;break;}
        }
      }
      if(found){results.push({type:"direct",data:found.data,brand:brand});continue;}
      if((brand.flavors||[]).length===1){results.push({type:"direct",data:brand.flavors[0].data,brand:brand});continue;}
      results.push({type:"brand",brand:brand,key:key});continue;
    }
    var matchedFlavors=[];
    for(var fi2=0;fi2<(brand.flavors||[]).length;fi2++){
      var fl=brand.flavors[fi2];
      if(fl.label.toLowerCase().indexOf(q)>=0){matchedFlavors.push(fl);continue;}
      var parts2=q.split(" ");
      for(var pi2=0;pi2<parts2.length;pi2++){if(parts2[pi2].length>1&&fl.label.toLowerCase().indexOf(parts2[pi2])>=0){matchedFlavors.push(fl);break;}}
    }
    if(matchedFlavors.length>0)results.push({type:"flavorMatch",brand:brand,key:key,flavors:matchedFlavors});
  }
  if(results.length===0)return null;
  if(results.length===1)return results[0];
  return {type:"multi",results:results};
}

// ─── ANALYSIS HELPERS ─────────────────────────

var ST = {
  g:{bg:P.gBg,border:P.gBorder,text:P.gText},
  a:{bg:P.aBg,border:P.aBorder,text:P.aText},
  r:{bg:P.rBg,border:P.rBorder,text:P.rText},
  ok:{bg:P.gBg,border:P.gBorder,text:P.gText},
  warn:{bg:P.aBg,border:P.aBorder,text:P.aText},
  fail:{bg:P.rBg,border:P.rBorder,text:P.rText},
};
var BAR_CLR = {g:"#A8BFAA", a:"#C4A882", r:"#C4A0A0"};
var I_LABEL = {g:"安全", a:"注意", r:"警示"};
var NUTR_DEF = [
  {key:"water",name:"水分",unit:"%"},{key:"protein",name:"蛋白質",unit:"%"},
  {key:"fat",name:"脂肪",unit:"%"},{key:"phos",name:"磷（P）",unit:"%"},
  {key:"calcium",name:"鈣（Ca）",unit:"%"},{key:"sodium",name:"鈉（Na）",unit:"%"},
  {key:"magnesium",name:"鎂（Mg）",unit:"%"},{key:"ash",name:"灰分（Ash）",unit:"%"},
];
var REF = {water:"70–85%",protein:"10–16%",fat:"4–8%",phos:"0.12–0.25%",calcium:"0.15–0.35%",sodium:"0.2–0.5%",magnesium:"0.02–0.035%",ash:"1.5–3.0%"};
var BAR_MAX = {water:100,protein:20,fat:12,phos:0.5,calcium:0.6,sodium:0.8,magnesium:0.07,ash:5};

function lamp(key, v) {
  var c;
  if(key==="water")      c=v>=70&&v<=85?"g":v>=65&&v<=88?"a":"r";
  else if(key==="protein")   c=v>=10&&v<=16?"g":v>=8&&v<=18?"a":"r";
  else if(key==="fat")       c=v>=4&&v<=8?"g":v>=3&&v<=10?"a":"r";
  else if(key==="phos")      c=v<=0.25?"g":v<=0.35?"a":"r";
  else if(key==="calcium")   c=v>=0.15&&v<=0.35?"g":v<=0.5?"a":"r";
  else if(key==="sodium")    c=v>=0.2&&v<=0.5?"g":v<=0.6?"a":"r";
  else if(key==="magnesium") c=v>=0.02&&v<=0.035?"g":v<=0.05?"a":"r";
  else if(key==="ash")       c=v>=1.5&&v<=3.0?"g":v<=3.5?"a":"r";
  else c="g";
  return {cls:c, label:{g:"正常",a:"注意",r:"偏高"}[c]};
}
function bPct(key, v) { return Math.min(100, Math.round((v/(BAR_MAX[key]||1))*100)); }
function spGroups(N) {
  var ph=N.phos||0, na=N.sodium||0, mg=N.magnesium||0;
  return [
    ph>0.35?{name:"腎臟病貓",cls:"fail",icon:"🫘",status:"不建議",reason:"磷 >0.35%"}:ph>0.25?{name:"腎臟病貓",cls:"warn",icon:"🫘",status:"需注意",reason:"磷 >0.25%"}:{name:"腎臟病貓",cls:"ok",icon:"🫘",status:"適合",reason:"磷在安全範圍"},
    na>0.6?{name:"心臟病貓",cls:"fail",icon:"❤️",status:"不建議",reason:"鈉 >0.6%"}:na>0.5?{name:"心臟病貓",cls:"warn",icon:"❤️",status:"需注意",reason:"鈉 >0.5%"}:{name:"心臟病貓",cls:"ok",icon:"❤️",status:"適合",reason:"鈉在安全範圍"},
    mg>0.05?{name:"泌尿問題",cls:"fail",icon:"💧",status:"不建議",reason:"鎂 >0.05%"}:mg>0.04?{name:"泌尿問題",cls:"warn",icon:"💧",status:"需注意",reason:"鎂 >0.04%"}:{name:"泌尿問題",cls:"ok",icon:"💧",status:"適合",reason:"鎂在安全範圍"},
  ];
}

// ─────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────

// ─── IC ICONS ──────────────────────────────────

function IC_search(sz,c){sz=sz===undefined?18:sz;c=c===undefined?"#fff":c;return(<svg width={sz} height={sz} viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="8.5" cy="8.5" r="5.5"/><line x1="12.8" y1="13.2" x2="17" y2="17.5"/></svg>);}
function IC_chart(sz,c){sz=sz===undefined?15:sz;c=c===undefined?P.muted:c;return(<svg width={sz} height={sz} viewBox="0 0 18 18" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="10" width="3" height="6" rx="1"/><rect x="7.5" y="5" width="3" height="11" rx="1"/><rect x="13" y="7" width="3" height="9" rx="1"/></svg>);}
function IC_shield(sz,c){sz=sz===undefined?15:sz;c=c===undefined?P.muted:c;return(<svg width={sz} height={sz} viewBox="0 0 18 18" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2 L16 5 L16 10 Q16 15 9 17 Q2 15 2 10 L2 5 Z"/><path d="M6 9 L8 11 L12 7"/></svg>);}
function IC_eye(sz,c){sz=sz===undefined?15:sz;c=c===undefined?P.muted:c;return(<svg width={sz} height={sz} viewBox="0 0 20 14" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><path d="M1 7 Q5 1 10 1 Q15 1 19 7 Q15 13 10 13 Q5 13 1 7Z"/><circle cx="10" cy="7" r="2.5"/></svg>);}
function IC_star(sz,c){sz=sz===undefined?14:sz;c=c===undefined?P.aText:c;return(<svg width={sz} height={sz} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5 L9.8 5.8 L14.5 6.2 L11.2 9.2 L12.3 13.8 L8 11.3 L3.7 13.8 L4.8 9.2 L1.5 6.2 L6.2 5.8 Z"/></svg>);}
function IC_brain(sz,c){sz=sz===undefined?16:sz;c=c===undefined?P.muted:c;return(<svg width={sz} height={sz} viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 Q8 5 7 7 Q4.5 7 3.5 9.5 Q2 12 4.5 14 Q3.5 16.5 6 17.5 Q7 19.5 9.5 18.5 L11 18.5"/><path d="M11 5 Q14 5 15 7 Q17.5 7 18.5 9.5 Q20 12 17.5 14 Q18.5 16.5 16 17.5 Q15 19.5 12.5 18.5 L11 18.5"/><line x1="11" y1="5" x2="11" y2="18.5"/><path d="M7.5 11.5 Q9 10.5 11 11.5 Q13 12.5 14.5 11.5"/></svg>);}
function IC_dna(sz,c){sz=sz===undefined?15:sz;c=c===undefined?P.muted:c;return(<svg width={sz} height={sz} viewBox="0 0 18 18" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><path d="M5 2 Q9 6 5 10 Q1 14 5 18"/><path d="M13 2 Q9 6 13 10 Q17 14 13 18"/><line x1="5.5" y1="6" x2="12.5" y2="6"/><line x1="5.5" y1="12" x2="12.5" y2="12"/></svg>);}
function IC_bolt(sz,c){sz=sz===undefined?12:sz;c=c===undefined?P.aText:c;return(<svg width={sz} height={sz} viewBox="0 0 14 16" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1 L3 9 L7 9 L5 15 L11 7 L7 7 Z"/></svg>);}
function IC_check(sz,c){sz=sz===undefined?12:sz;c=c===undefined?P.gText:c;return(<svg width={sz} height={sz} viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7 L5.5 10 L11.5 4"/></svg>);}
function IC_warnIc(sz,c){sz=sz===undefined?12:sz;c=c===undefined?P.aText:c;return(<svg width={sz} height={sz} viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 2 L13 12 L1 12 Z"/><line x1="7" y1="6" x2="7" y2="9"/><circle cx="7" cy="11" r="0.7" fill={c} stroke="none"/></svg>);}
function IC_cross(sz,c){sz=sz===undefined?12:sz;c=c===undefined?P.rText:c;return(<svg width={sz} height={sz} viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/></svg>);}
var IC = {search:IC_search,chart:IC_chart,shield:IC_shield,eye:IC_eye,star:IC_star,brain:IC_brain,dna:IC_dna,bolt:IC_bolt,check:IC_check,warnIc:IC_warnIc,cross:IC_cross};

// ─── UI COMPONENTS ─────────────────────────────

function SIcon(props){var cls=props.cls,sz=props.sz;
  var s=sz||12;
  if(cls==="g"||cls==="ok")   return IC.check(s,P.gText);
  if(cls==="a"||cls==="warn") return IC.warnIc(s,P.aText);
  return IC.cross(s,P.rText);
}

// ─────────────────────────────────────────────────────────
// UI ATOMS
// ─────────────────────────────────────────────────────────
function StatusTag(props){var text=props.text,cls=props.cls,c=ST[cls];return(
  <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 13px",borderRadius:99,fontSize:12,fontWeight:500,border:"1.5px solid "+c.border+"",background:c.bg,color:c.text,lineHeight:1}}>
    <SIcon cls={cls} sz={12}/> {text}
  </span>
);}
function LampBadge(props){var cls=props.cls,label=props.label,c=ST[cls];return(
  <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,fontSize:11,border:"1px solid "+c.border+"",background:c.bg,color:c.text,whiteSpace:"nowrap"}}>
    <SIcon cls={cls} sz={11}/> {label}
  </span>
);}
function SecLabel(props){var icon=props.icon,children=props.children;return(
  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:14}}>
    {icon}<span style={{fontSize:10,fontWeight:700,letterSpacing:"0.13em",color:P.muted,textTransform:"uppercase"}}>{children}</span>
  </div>
);}
function Card(props){var children=props.children,style=props.style;return(
  <div style={{background:P.card,borderRadius:20,border:"1px solid "+P.border+"",padding:"1.25rem 1.375rem",marginBottom:"0.875rem"}}>{children}</div>
);}

// ─────────────────────────────────────────────────────────
// FLAVOR PICKER
// ─────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────
var TABS = [
  {id:"ingredients",label:"成分",icon:"🧪"},
  {id:"nutrition",label:"營養",icon:"📊"},
  {id:"benefits",label:"功效",icon:"✨"},
];
function TabBar(props){var active=props.active,onChange=props.onChange;return(
  <div style={{background:P.card,borderRadius:99,padding:4,display:"flex",gap:2,marginBottom:"0.875rem",border:"1px solid "+P.border+""}}>
    {ANALYSIS_TABS.map(function(t){var on=active===t.id;return(
      <button key={t.id} onClick={function(){onChange(t.id);}} style={{
        flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,
        padding:"9px 8px",borderRadius:99,border:"none",cursor:"pointer",
        background:on?"#FFFFFF":"transparent",color:on?P.ink:P.muted,
        fontSize:13,fontWeight:on?600:400,
        boxShadow:on?"0 2px 8px rgba(74,58,48,0.10)":"none",transition:"all 0.18s",
      }}><span style={{fontSize:14}}>{t.icon}</span><span>{t.label}</span></button>
    );})}
  </div>
);}

// Dot color per category
function getCatDotColor(cat){
  if(cat==="動物蛋白"||cat==="器官肉"||cat==="內臟") return "#B07070";
  if(cat==="脂肪") return "#C4A87A";
  if(cat==="蔬果"||cat==="植物"||cat==="益生元") return "#7A9E7A";
  if(cat==="補充劑"||cat==="礦物質來源") return "#7A8FAA";
  if(cat==="添加劑"||cat==="增稠劑"||cat==="碳水") return "#A8A09A";
  if(cat==="水分") return "#88B4C4";
  if(cat==="誘食劑") return "#B08A5A";
  return "#A8A09A";
}
function catDot(cat){ return getCatDotColor(cat) || P.muted; }


var ANALYSIS_TABS = [
  {id:"ingredients",label:"成分",icon:"🧪"},
  {id:"nutrition",label:"營養",icon:"📊"},
  {id:"benefits",label:"功效",icon:"✨"},
];

// ─── TAB CONTENT ───────────────────────────────

function TabIngredients(props){var data=props.data;
  var _detail=(data._bk&&data._fk&&BRANDS_DETAIL[data._bk])?BRANDS_DETAIL[data._bk][data._fk]:{};
  return(<div>
    <Card>
      <SecLabel icon={IC.shield(15,P.muted)}>安全評估</SecLabel>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {((_detail&&_detail.r)||[]).map(function(r,i){var c=ST[r.cls];
          // Simplify text: show "無添加" for clean items, keep detail for warnings/risks
          var displayText = r.cls==="g" ? "無添加" : r.text;
          return(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:14,fontSize:13,lineHeight:1.5,background:c.bg,border:"1px solid "+c.border+"",color:c.text}}>
            <span style={{flexShrink:0}}><SIcon cls={r.cls} sz={13}/>🌈</span>
            <span style={{fontWeight:600}}>{r.cat}</span>
            <span style={{opacity:.75,fontSize:12}}>{displayText}</span>
          </div>
        );})}
      </div>

    </Card>
    <Card>
      <SecLabel icon={IC.dna(15,P.muted)}>成分解析</SecLabel>
      <div style={{display:"flex",flexDirection:"column",gap:0}}>
        {((_detail&&_detail.i)||[]).map(function(ing,i){
          var dot = catDot(ing.c);
          var isLast = i === ((_detail&&_detail.i)||[]).length - 1;
          return(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 0",borderBottom:isLast?"none":"1px solid "+P.block+""}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:dot,flexShrink:0,marginTop:5}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:14,fontWeight:700,color:P.ink}}>{ing.n}</span>
                  <span style={{fontSize:10,padding:"3px 9px",borderRadius:99,background:P.block,color:P.muted,flexShrink:0,marginLeft:8}}>{ing.c}</span>
                </div>
                <div style={{fontSize:12,color:P.muted,lineHeight:1.5}}>{ing.role}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  </div>);
}

function TabNutrition(props){var data=props.data;
  var N=data.nutrients;
  var lamps=NUTR_DEF.map(function(d){return lamp(d.key,N[d.key]||0).cls;});
  var capr=N.calcium&&N.phos?(N.calcium/N.phos).toFixed(2):null;
  var caprCls=capr?(parseFloat(capr)>=1.1&&parseFloat(capr)<=1.3?"g":parseFloat(capr)>=0.9&&parseFloat(capr)<=1.5?"a":"r"):null;
  var macros=[
    {label:"動物蛋白",pct:parseInt(data.meatPercent)||0,color:"#A8BFAA"},
    {label:"脂肪",pct:Math.round((N.fat||0)/12*100),color:P.aText},
    {label:"水分",pct:N.water||0,color:"#7BBFD4"},
    {label:"礦物質",pct:Math.round((N.ash||0)/5*100),color:"#C4A8D5"},
  ];
  return(<div>
    <Card>
      <SecLabel icon={IC.chart(15,P.muted)}>主要營養分佈</SecLabel>
      {macros.map(function(m,i){return(
        <div key={i} style={{display:"grid",gridTemplateColumns:"60px 1fr 40px",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<macros.length-1?"1px solid "+P.block+"":"none"}}>
          <span style={{fontSize:12,color:P.ink,fontWeight:600}}>{m.label}</span>
          <div style={{background:P.block,borderRadius:99,height:7,overflow:"hidden"}}>
            <div style={{width:(Math.min(m.pct,100))+"%",height:"100%",background:m.color,borderRadius:99}}/>
          </div>
          <span style={{fontSize:12,color:P.muted,textAlign:"right"}}>{Math.min(m.pct,100)}%</span>
        </div>
      );})}
    </Card>
    <Card>
      <SecLabel icon={IC.chart(15,P.muted)}>營養素分析（as-fed）</SecLabel>
      {NUTR_DEF.map(function(def,i){
        var v=N[def.key]||0;var lp=lamp(def.key,v);var pct=bPct(def.key,v);
        var dv=v<0.1?v.toFixed(3):v<1?v.toFixed(2):v.toFixed(1);
        return(
          <div key={def.key} style={{display:"grid",gridTemplateColumns:"88px 52px 80px 1fr auto",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<NUTR_DEF.length-1?"1px solid "+P.block+"":"none"}}>
            <span style={{fontSize:12,fontWeight:600,color:P.ink}}>{def.name}</span>
            <span style={{fontSize:12,color:P.ink}}>{dv}{def.unit}</span>
            <span style={{fontSize:10,color:P.muted}}>{REF[def.key]}</span>
            <div style={{background:P.block,borderRadius:99,height:5,overflow:"hidden"}}>
              <div style={{width:""+pct+"%",height:"100%",background:BAR_CLR[lp.cls],borderRadius:99}}/>
            </div>
            <LampBadge cls={lp.cls} label={lp.label}/>
          </div>
        );
      })}
      {capr&&(
        <div style={{marginTop:10,padding:"8px 0 0 0",borderTop:"1px solid "+P.block+"",fontSize:12,display:"flex",alignItems:"center",gap:6}}>
          <span style={{color:P.muted}}>鈣磷比（Ca:P）=</span>
          <span style={{color:caprCls==="r"?P.rText:P.muted}}>{capr}</span>
        </div>
      )}
    </Card>
    <Card>
      <SecLabel icon={IC.eye(15,P.muted)}>特殊族群適用性</SecLabel>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {spGroups(N).map(function(sp){var c=ST[sp.cls];return(
          <div key={sp.name} style={{borderRadius:16,padding:"14px 10px",textAlign:"center",border:"1px solid "+c.border+"",background:c.bg}}>
            <div style={{fontSize:20,marginBottom:6}}>{sp.icon}</div>
            <div style={{fontSize:11,fontWeight:700,color:c.text,marginBottom:3}}>{sp.name}</div>
            <div style={{display:"flex",justifyContent:"center",gap:4,alignItems:"center",marginBottom:3}}>
              <SIcon cls={sp.cls} sz={11}/>
              <span style={{fontSize:11,color:c.text,fontWeight:500}}>{sp.status}</span>
            </div>
            <div style={{fontSize:10,color:c.text,opacity:.7}}>{sp.reason}</div>
          </div>
        );})}
      </div>
    </Card>
  </div>);
}

function TabBenefits(props){var data=props.data;
  var _detail=(data._bk&&data._fk&&BRANDS_DETAIL[data._bk])?BRANDS_DETAIL[data._bk][data._fk]:{};
  var N=data.nutrients;
  var ings=((_detail&&_detail.i)||[]).map(function(i){return (i.n||i.name||"").toLowerCase();});
  var has=function(kw){return ings.some(function(n){return n.includes(kw);})};
  // Conclusion chips - no numbers, only qualitative descriptions
  var capr = N.calcium&&N.phos ? N.calcium/N.phos : null;
  var items=[
    {icon:"👁",title:"護眼健康",chips:[
      "牛磺酸",
      has("肝")?"維生素A":"",
      has("魚油")||has("鮭魚")?"DHA / EPA":"",
    ].filter(Boolean)},
    {icon:"🦠",title:"腸道健康",chips:[
      has("益生")?"益生菌":"",
      has("南瓜")||has("菊苣")||has("蔬")?"膳食纖維":"",
      has("菊苣")?"益生元":"",
    ].filter(Boolean).length?[
      has("益生")?"益生菌":"",
      has("南瓜")||has("菊苣")||has("蔬")?"膳食纖維":"",
      has("菊苣")?"益生元":"",
    ].filter(Boolean):["成分未特別標示"]},
    {icon:"🛡️",title:"免疫健康",chips:[
      "維生素E",
      has("鋅")?"鋅":"",
      has("魚油")||has("鮭魚")?"Omega-3":"",
    ].filter(Boolean)},
    {icon:"❤️",title:"心臟健康",chips:[
      "牛磺酸",
      has("心")?"輔酶Q10":"",
      N.sodium<=0.5?"鈉含量適中":"鈉偏高注意",
    ].filter(Boolean)},
    {icon:"🧠",title:"腦部發展",chips:[
      has("魚油")||has("鮭魚")?"DHA / EPA":"",
    ].filter(Boolean)},
    {icon:"🦴",title:"骨骼健康",chips:[
      capr&&capr>=1.1&&capr<=1.3?"鈣磷比例均衡":capr&&capr<1.1?"鈣磷比偏低":capr?"鈣磷比偏高":"",
      N.phos<=0.25?"磷含量適中":N.phos<=0.35?"磷偏高注意":"高磷需謹慎",
    ].filter(Boolean)},
    {icon:"✨",title:"皮膚毛髮",chips:[
      has("魚油")||has("鮭魚")?"Omega-3":"",
      "維生素E",
      has("葵花")||has("椰子")?"Omega-6":"",
    ].filter(Boolean)},
    {icon:"💧",title:"泌尿道健康",chips:[
      N.magnesium<=0.035?"礦物質適中":N.magnesium<=0.05?"鎂偏高注意":"高鎂需謹慎",
      N.water>=78?"水分充足":N.water>=70?"水分適中":"水分偏低",
      has("蛋胺")||has("methio")?"DL-蛋胺酸":"",
    ].filter(Boolean)},
    {icon:"⚖️",title:"體重控制",chips:[
      N.fat<=6?"低脂":N.fat<=8?"脂肪適中":"脂肪偏高",
      N.protein>=12?"高蛋白":N.protein>=10?"蛋白適中":"蛋白偏低",
    ].filter(Boolean)},
    {icon:"🍃",title:"抗氧化",chips:[
      "維生素E",
      has("蔬")||has("南瓜")||has("莓")||has("蘋果")?"天然蔬果植化素":"",
    ].filter(Boolean)},
  ];
  return(
    <Card>
      <SecLabel icon={IC.star(14,P.muted)}>功效總覽</SecLabel>
      {items.map(function(b,i){return(
        <div key={i} style={{borderRadius:14,padding:"12px 14px",background:P.bg,border:"1px solid "+P.border+"",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:17}}>{b.icon}</span>
            <span style={{fontSize:13,fontWeight:700,color:P.ink}}>{b.title}</span>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {b.chips.map(function(chip,j){return(
              <span key={j} style={{
                fontSize:12,padding:"4px 12px",borderRadius:99,
                background:P.card,border:"1px solid "+P.border+"",color:P.ink,
              }}>{chip}</span>
            );})}
          </div>
        </div>
      );})}
    </Card>
  );
}

// ─── DB ────────────────────────────────────────


// ─── NUTRIENT CALCULATOR ────────────────────────

function NutrientCalculator(){
  var [open, setOpen] = useState(false);
  var [vals, setVals] = useState({protein:"",fat:"",carb:"",water:"",fiber:"",ash:"",phos:"",kcal:""});
  function v(k){ return parseFloat(vals[k])||0; }
  function set(k,val){ setVals(function(p){var _n=Object.assign({},p); _n[k]=val; return _n;}); }

  var protein=v("protein"), fat=v("fat"), water=v("water"),
        fiber=v("fiber"), ash=v("ash"), phos=v("phos"), kcalInput=v("kcal");

  var carbInput = parseFloat(vals.carb);
  var carbAuto = Math.max(0, 100 - (protein + fat + water + ash + fiber));
  var carb = (!isNaN(carbInput) && vals.carb !== "") ? carbInput : carbAuto;
  var carbIsAuto = isNaN(carbInput) || vals.carb === "";

  function dm(n){ if(water>=100||n===0) return null; return (n/(100-water)*100).toFixed(1); };
  var dmProtein=dm(protein), dmFat=dm(fat), dmCarb=dm(carb),
        dmFiber=dm(fiber), dmAsh=dm(ash), dmPhos=dm(phos);

  var pCal=protein*3.5, fCal=fat*8.5, cCal=carb*3.5;
  var meCalc = pCal + fCal + cCal;
  var meDisplay = meCalc > 0 ? meCalc.toFixed(0) : null;
  var total = pCal + fCal + cCal;
  var pMePct = total>0 ? parseFloat((pCal/total*100).toFixed(0)) : 0;
  var fMePct = total>0 ? parseFloat((fCal/total*100).toFixed(0)) : 0;
  var cMePct = total>0 ? parseFloat((cCal/total*100).toFixed(0)) : 0;

  function meCheck(key, val){
    if(key==="protein") return val>=45&&val<=60?"g":val>=35&&val<=70?"a":"r";
    if(key==="fat")     return val>=30&&val<=50?"g":val>=20&&val<=60?"a":"r";
    if(key==="carb")    return val<=10?"g":val<=20?"a":"r";
    return "g";
  };

  var hasNutrients = protein>0 || fat>0;
  var inputStyle = {width:"100%",padding:"9px 12px",borderRadius:10,border:"1.5px solid "+P.border+"",background:P.input,color:P.ink,fontSize:14,boxSizing:"border-box"};
  var fields = [
    {key:"protein",label:"蛋白質",unit:"%"},
    {key:"fat",label:"脂肪",unit:"%"},
    {key:"carb",label:"碳水（NFE）",unit:"%",optional:true},
    {key:"water",label:"水分",unit:"%"},
    {key:"fiber",label:"粗纖維",unit:"%"},
    {key:"ash",label:"灰質（Ash）",unit:"%"},
    {key:"phos",label:"磷（P）",unit:"%"},
    {key:"kcal",label:"廠標熱量",unit:"kcal/100g"},
  ];

  return(
    <div style={{marginBottom:16,borderRadius:16,border:"1px solid "+P.border+"",background:P.card,overflow:"hidden"}}>
      <button onClick={function(){setOpen(function(o){return !o;})}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"14px 16px",border:"none",background:"transparent",cursor:"pointer"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}}>🧮</span>
          <span style={{fontSize:13,fontWeight:700,color:P.ink}}>成分計算機</span>
        </div>
        <span style={{color:P.muted,fontSize:12,display:"inline-block",transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s"}}>▾</span>
      </button>
      {open&&(
        <div style={{padding:"0 16px 16px"}}>
          <div style={{height:1,background:P.block,marginBottom:14}}/>
          <div style={{fontSize:11,color:P.muted,fontWeight:600,letterSpacing:"0.08em",marginBottom:10}}>輸入標示成分（as-fed）</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {fields.map(function(f){return(
              <div key={f.key}>
                <div style={{fontSize:11,color:P.muted,marginBottom:4,display:"flex",alignItems:"center",gap:4}}>
                  {f.label}
                  {f.key==="carb"&&carbIsAuto&&protein>0&&(
                    <span style={{fontSize:9,background:P.aBg,color:P.aText,borderRadius:4,padding:"1px 5px"}}>估算</span>
                  )}
                </div>
                <input type="number" min="0" max="100" step="0.1" value={vals[f.key]} onChange={function(e){set(f.key,e.target.value);}}
                  placeholder={f.key==="carb"&&carbIsAuto&&protein>0 ? carbAuto.toFixed(1) : "–"}
                  style={{width:"100%",padding:"9px 12px",borderRadius:10,border:"1px solid "+(f.key==="carb"&&carbIsAuto&&protein>0?P.aBorder:P.border),background:P.input,color:P.ink,fontSize:14,boxSizing:"border-box"}}/>
              </div>
            );})}
          </div>
          {!hasNutrients&&<div style={{textAlign:"center",padding:"8px 0 4px",color:P.muted,fontSize:13}}>輸入成分數值即可自動換算</div>}
          {hasNutrients&&(<div>
            {meDisplay&&(
              <div style={{marginBottom:14}}>
                {kcalInput>0?(
                  <div style={{marginBottom:10}}>
                    <div style={{background:P.block,borderRadius:12,padding:"12px 14px",marginBottom:6}}>
                      <div style={{fontSize:11,color:P.muted,marginBottom:4}}>廠標熱量</div>
                      <div style={{fontSize:20,fontWeight:800,color:P.ink}}>{kcalInput} <span style={{fontSize:12,fontWeight:400,color:P.muted}}>kcal/100g</span>🥫</div>
                    </div>
                    <div style={{background:P.bg,borderRadius:12,padding:"10px 14px",border:"1px solid "+P.block+""}}>
                      <div style={{fontSize:11,color:P.muted,marginBottom:2}}>估算熱量（ME）</div>
                      <div style={{fontSize:15,fontWeight:700,color:P.muted}}>{meDisplay} <span style={{fontSize:11,fontWeight:400}}>kcal/100g</span>🥫</div>
                    </div>
                    <div style={{fontSize:10,color:P.muted,marginTop:6,lineHeight:1.5}}>※ 估算熱量（ME）主要用於分析熱量來源比例，非實際產品熱量。</div>
                  </div>
                ):(
                  <div style={{background:P.block,borderRadius:12,padding:"12px 14px",marginBottom:10}}>
                    <div style={{fontSize:11,color:P.muted,marginBottom:4}}>估算熱量（ME）</div>
                    <div style={{fontSize:20,fontWeight:800,color:P.ink}}>{meDisplay} <span style={{fontSize:12,fontWeight:400,color:P.muted}}>kcal/100g</span>🥫</div>
                    <div style={{fontSize:10,color:P.muted,marginTop:4}}>※ 僅供分析熱量來源比例，非實際產品熱量。</div>
                  </div>
                )}
                <div style={{fontSize:11,color:P.muted,fontWeight:600,letterSpacing:"0.08em",marginBottom:6}}>熱量來源比例（ME%）</div>
                <div style={{fontSize:10,color:P.muted,marginBottom:10}}>參考蘇青青營養師：蛋白質 45–60%、脂肪 30–50%、碳水 &lt;10%</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {label:"蛋白質",pct:pMePct,key:"protein",range:"45–60%"},
                    {label:"脂肪",pct:fMePct,key:"fat",range:"30–50%"},
                    {label:carbIsAuto?"估算碳水（NFE）":"碳水（NFE）",pct:cMePct,key:"carb",range:"<10%"},
                  ].filter(function(r){return r.pct>0;}).map(function(r){
                    var cls = meCheck(r.key, r.pct);
                    var barCol = cls==="g"?"#A8BFAA":cls==="a"?"#C4A882":P.rBorder;
                    var textCol = cls==="g"?P.gText:cls==="a"?P.aText:P.rText;
                    var tag = cls==="g"?"理想":r.pct>(r.key==="carb"?10:r.key==="protein"?60:50)?"偏高":"偏低";
                    return(
                      <div key={r.key}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                          <span style={{fontSize:12,color:P.ink}}>{r.label}</span>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontSize:10,color:P.muted}}>{r.range}</span>
                            <span style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:cls==="g"?P.gBg:cls==="a"?P.aBg:P.rBg,color:textCol,fontWeight:600}}>{tag}</span>
                            <span style={{fontSize:13,fontWeight:700,color:textCol}}>{r.pct}%</span>
                          </div>
                        </div>
                        <div style={{background:P.block,borderRadius:99,height:7,overflow:"hidden"}}>
                          <div style={{width:(Math.min(r.pct,100))+"%",height:"100%",background:barCol,borderRadius:99,transition:"width 0.3s"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {water>0&&(
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,color:P.muted,fontWeight:600,letterSpacing:"0.08em",marginBottom:10}}>乾物比（DM Basis）— 去除 {water}% 水分</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {[
                    {label:"蛋白質",val:dmProtein,key:"protein"},
                    {label:"脂肪",val:dmFat,key:"fat"},
                    {label:carbIsAuto?"估算碳水（NFE）":"碳水（NFE）",val:dmCarb,key:"carb"},
                    {label:"粗纖維",val:dmFiber,key:"fiber"},
                    {label:"灰質",val:dmAsh,key:"ash"},
                    {label:"磷",val:dmPhos,key:"phos"},
                  ].filter(function(r){return r.val!==null&&parseFloat(r.val)>0;}).map(function(row){
                    var cls="g";
                    if(row.key==="protein") cls=parseFloat(row.val)>=30?"g":parseFloat(row.val)>=20?"a":"r";
                    if(row.key==="phos") cls=parseFloat(row.val)<=0.8?"g":parseFloat(row.val)<=1.2?"a":"r";
                    var col=cls==="g"?P.gText:cls==="a"?P.aText:P.rText;
                    var bg=cls==="g"?P.gBg:cls==="a"?P.aBg:P.rBg;
                    return(<div key={row.key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:10,background:bg}}>
                      <span style={{fontSize:13,color:P.ink}}>{row.label}</span>
                      <span style={{fontSize:14,fontWeight:700,color:col}}>{row.val}%</span>
                    </div>);
                  })}
                </div>
              </div>
            )}
            {water===0&&<div style={{fontSize:11,color:P.muted,textAlign:"center",padding:"4px 0 10px"}}>請輸入水分以計算乾物比</div>}
            <div style={{fontSize:11,color:P.muted,lineHeight:1.7,padding:"10px 12px",background:P.bg,borderRadius:10,marginBottom:8}}>
              <div style={{fontWeight:600,marginBottom:4,color:P.ink}}>📌 計算說明</div>
              <div>• 乾物比 = 成分 ÷ (100 – 水分) × 100</div>
              <div>• ME = 蛋白質×3.5 + 脂肪×8.5 + 碳水×3.5</div>
              <div>• 估算碳水（NFE）= 100 – 蛋白質 – 脂肪 – 水分 – 灰分 – 粗纖維</div>
            </div>
            <button onClick={function(){setVals({protein:"",fat:"",carb:"",water:"",fiber:"",ash:"",phos:"",kcal:""});}} 
              style={{width:"100%",padding:"10px",borderRadius:99,border:"1px solid "+P.border+"",background:P.bg,color:P.muted,fontSize:13,cursor:"pointer"}}>清除所有數值</button>
          </div>)}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PRESETS
// ─────────────────────────────────────────────────────────

function TabBarResult(props){
  var data=props.data;
  var [tab,setTab]=useState("ingredients");
  return(
    <div>
      <TabBar active={tab} onChange={setTab}/>
      {tab==="ingredients"&&<TabIngredients data={data}/>}
      {tab==="nutrition"&&<TabNutrition data={data}/>}
      {tab==="benefits"&&<TabBenefits data={data}/>}
    </div>
  );
}

function AnalysisPage(){
  var [input,setInput]=useState("");
  var [result,setResult]=useState(null);
  var [notFound,setNotFound]=useState(false);
  var [selFlavor,setSelFlavor]=useState(null);
  var [showAllBrands,setShowAllBrands]=useState(false);

  function run(override){
    var q=(override||input).trim();
    if(!q)return;
    if(override)setInput(override);
    setNotFound(false);setSelFlavor(null);setResult(null);setShowAllBrands(false);
    var found=searchBrands(q,BRANDS);
    if(!found){setNotFound(true);}else{setResult(found);}
  }

  var showData=null;
  if(result&&result.type==="direct")showData=result.data;
  if(result&&(result.type==="brand"||result.type==="flavorMatch")&&selFlavor)showData=selFlavor.data;

  return(
    <div style={{background:P.bg,minHeight:"100vh",paddingBottom:80}}>
      <div style={{padding:"1.25rem"}}>
        <div style={{position:"relative",marginBottom:10}}>
          <input value={input} onChange={function(e){setInput(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")run();}} placeholder="例如：Ziwi Peak 羊肉" style={{display:"block",width:"100%",padding:"13px 48px 13px 18px",borderRadius:16,border:"1.5px solid "+P.border,background:P.input,color:P.ink,fontSize:15,boxSizing:"border-box",outline:"none"}}/>
          {input&&<button type="button" onClick={function(){setInput("");setResult(null);setSelFlavor(null);setNotFound(false);}} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:18,color:P.muted,cursor:"pointer"}}>✕</button>}
        </div>
        <button type="button" onClick={function(){run();}} style={{display:"block",width:"100%",padding:"13px",borderRadius:16,border:"none",background:P.btn,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:16}}>🔍 開始分析</button>
        <div style={{marginBottom:16}}>
          <button type="button" onClick={function(){setShowAllBrands(function(b){return !b;})}} style={{padding:"7px 15px",borderRadius:99,fontSize:12,fontWeight:500,border:"1.5px solid "+P.border,background:"transparent",color:P.ink,cursor:"pointer"}}>🌐 全部品牌</button>
        </div>
        {showAllBrands&&(
          <div style={{background:P.card,borderRadius:16,border:"1px solid "+P.border,padding:"12px",marginBottom:16}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {Object.keys(BRANDS).map(function(key){var brand=BRANDS[key];return(
                <button type="button" key={key} onClick={function(){setShowAllBrands(false);run(brand.label);}} style={{padding:"5px 12px",borderRadius:99,fontSize:12,border:"1px solid "+P.border,background:P.block,color:P.ink,cursor:"pointer"}}>{brand.label}</button>
              );})}
            </div>
          </div>
        )}
        {notFound&&(
          <div style={{background:"#FEF9F0",border:"1px solid #F5E6CC",borderRadius:16,padding:"12px 16px",marginBottom:16}}>
            <div style={{fontWeight:700,marginBottom:4,color:"#8A6A2A"}}>⚠️ 尚未收錄「{input}」</div>
            <div style={{fontSize:11,color:P.muted}}>點擊「🌐 全部品牌」查看已收錄品牌</div>
          </div>
        )}
        {result&&(result.type==="brand"||result.type==="flavorMatch")&&(
          <div style={{marginBottom:16,background:P.card,borderRadius:16,border:"1px solid "+P.border,padding:"12px 14px"}}>
            <div style={{fontSize:13,fontWeight:700,color:P.ink,marginBottom:8}}>{result.brand.label}</div>
            <div style={{display:"flex",gap:8,overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none",msOverflowStyle:"none"}}>
              {((result.type==="brand"?result.brand.flavors:result.flavors)||[]).map(function(f){var active=selFlavor&&selFlavor.id===f.id;return(
                <button type="button" key={f.id} onClick={function(){setSelFlavor(f);}} style={{flexShrink:0,height:36,padding:"0 16px",borderRadius:999,border:"1.5px solid "+(active?"#907D68":"#E7DED2"),background:active?"#907D68":"#FFFFFF",color:active?"#FFFFFF":"#6B5E52",fontSize:12,fontWeight:active?600:400,cursor:"pointer",whiteSpace:"nowrap",display:"inline-flex",alignItems:"center"}}>{f.label}</button>
              );})}
            </div>
          </div>
        )}
        {result&&result.type==="multi"&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:P.ink,marginBottom:8}}>找到多個結果</div>
            {result.results.map(function(r,i){return(
              <button type="button" key={i} onClick={function(){setResult(r);setSelFlavor(null);}} style={{display:"block",width:"100%",textAlign:"left",padding:"12px 14px",borderRadius:12,border:"1px solid "+P.border,background:P.card,marginBottom:8,cursor:"pointer"}}>
                <div style={{fontSize:14,fontWeight:600,color:P.ink}}>{r.brand.label}</div>
              </button>
            );})}
          </div>
        )}
        {showData&&(
          <div>
            <div style={{background:P.card,borderRadius:16,border:"1px solid "+P.border,padding:16,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontSize:16,fontWeight:800,color:P.ink}}>{showData.brandName}</div>
                  <div style={{fontSize:13,color:P.muted}}>{showData.brandSub}</div>
                </div>
                {showData.overallScore&&<LampBadge cls={showData.overallClass} label={showData.overallScore}/>}
              </div>
              {showData.meatPercent&&<div style={{fontSize:13,color:P.muted,marginBottom:6}}>肉含量 <span style={{fontWeight:700,color:P.ink}}>{showData.meatPercent}</span>🥫</div>}
              {(showData.tags||[]).length>0&&<div style={{marginBottom:8}}>{(showData.tags||[]).map(function(t,i){return <StatusTag key={i} text={t.text} cls={t.cls}/>;})}</div>}
              {showData.verdict&&<div style={{fontSize:13,color:P.ink,lineHeight:1.6,padding:"8px 12px",background:P.block,borderRadius:10}}>{showData.verdict}</div>}
            </div>
            <TabBarResult data={showData}/>
          </div>
        )}
        <div style={{marginTop:16}}>
          <NutrientCalculator/>
        </div>
      </div>
    </div>
  );
}

// ─── APP SHELL ─────────────────────────────────

function AdminPage(){
  var [toast,setToast]=useState("");
  function showToast(msg){setToast(msg);setTimeout(function(){setToast("");},2500);}
  function handleExport(){var data={version:1,date:new Date().toISOString(),cats:lsGet("rr_cats",[]),weights:lsGet("rr_weights",[]),healths:lsGet("rr_healths",[]),records:lsGet("rr_records",[]),inventory:lsGet("rr_inventory",[])};var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download="ronronner-backup.json";a.click();}
  function handleImport(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(ev){try{var d=JSON.parse(ev.target.result);if(d.cats)lsSet("rr_cats",d.cats);if(d.weights)lsSet("rr_weights",d.weights);if(d.healths)lsSet("rr_healths",d.healths);if(d.records)lsSet("rr_records",d.records);if(d.inventory)lsSet("rr_inventory",d.inventory);showToast("匯入成功！");setTimeout(function(){window.location.reload();},1000);}catch(err){showToast("格式錯誤");}};reader.readAsText(file);}
  return(<div style={{background:P.bg,minHeight:"100vh",paddingBottom:80}}>{toast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"#3A3028",color:"#fff",padding:"10px 20px",borderRadius:99,fontSize:13,zIndex:999}}>{toast}</div>}<div style={{padding:"1.5rem 1.25rem"}}><div style={{fontSize:17,fontWeight:700,color:P.ink,marginBottom:20}}>管理員</div><div style={{background:P.card,borderRadius:16,border:"1px solid "+P.border,padding:"16px",marginBottom:8}}><div style={{fontSize:14,fontWeight:600,color:P.ink,marginBottom:8}}>資料備份</div><button type="button" onClick={handleExport} style={{display:"block",width:"100%",padding:"11px",borderRadius:12,border:"1px solid "+P.border,background:"transparent",color:P.ink,fontSize:14,cursor:"pointer",marginBottom:8,textAlign:"left"}}>📤 匯出備份</button><label style={{display:"block",width:"100%",padding:"11px",borderRadius:12,border:"1px solid "+P.border,background:"transparent",color:P.ink,fontSize:14,cursor:"pointer",textAlign:"left",boxSizing:"border-box"}}>📥 匯入備份<input type="file" accept=".json" onChange={handleImport} style={{display:"none"}}/></label>🥫</div></div>🥫</div>);}

function FAB(props){
  var onAddCat=props.onAddCat,onAddWeight=props.onAddWeight,onAddHealth=props.onAddHealth,onAddRecord=props.onAddRecord,onAddInventory=props.onAddInventory;
  var [open,setOpen]=useState(false);
  return(
    <div style={{position:"fixed",bottom:80,right:20,zIndex:100}}>
      {open&&(
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:8,alignItems:"flex-end"}}>
          {[["🐱","新增寵物",onAddCat],["📈","新增體重",onAddWeight],["🩺","新增健康紀錄",onAddHealth],["📅","新增日常紀錄",onAddRecord],["🧺","新增糧食",onAddInventory]].map(function(item,i){return(
            <button type="button" key={i} onClick={function(){setOpen(false);item[2]&&item[2]();}} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:99,border:"none",background:P.card,color:P.ink,fontSize:13,fontWeight:500,boxShadow:"0 2px 8px rgba(0,0,0,0.1)",cursor:"pointer",whiteSpace:"nowrap"}}>
              <span>{item[0]}</span><span>{item[1]}</span>
            </button>
          );})}
        </div>
      )}
      <button type="button" onClick={function(){setOpen(function(o){return !o;})}} style={{width:52,height:52,borderRadius:999,border:"none",background:P.btn,color:"#fff",fontSize:24,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {open?"✕":"+"}
      </button>
    </div>
  );
}

var TABS=[{id:"cats",label:"🐱 檔案"},{id:"cal",label:"📅 日曆"},{id:"inv",label:"🧺 糧倉"},{id:"ana",label:"🔍 分析"}];

export default function App(){
  var [page,setPage]=useState("cats");
  var [catsKey,setCatsKey]=useState(0);
  var [showNewCat,setShowNewCat]=useState(false);
  var [catPicker,setCatPicker]=useState(null);
  var [modalOpen,setModalOpen]=useState(false);
  var [fabTrigger,setFabTrigger]=useState(null);

  function fabAddCat(){setShowNewCat(true);}
  function fabAddWeight(){var cats=lsGet("rr_cats",[]);if(cats.length>1){setCatPicker("weight");}else{setPage("cats");setFabTrigger("weight");}}
  function fabAddHealth(){var cats=lsGet("rr_cats",[]);if(cats.length>1){setCatPicker("health");}else{setPage("cats");setFabTrigger("health");}}
  function fabAddRecord(){setPage("cal");setFabTrigger("record");}
  function fabInventoryCb(){setPage("inv");setFabTrigger("inventory");}

  return(
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",position:"relative"}}>
      {page==="cats"&&<CatsPage key={catsKey} fabCatCb={fabAddCat} fabTrigger={fabTrigger} onFabHandled={function(){setFabTrigger(null);}} onModalOpen={function(){setModalOpen(true);}} onModalClose={function(){setModalOpen(false);}}/>}
      {page==="cal"&&<CalendarPage fabTrigger={fabTrigger} onFabHandled={function(){setFabTrigger(null);}} onModalOpen={function(){setModalOpen(true);}} onModalClose={function(){setModalOpen(false);}}/>}
      {page==="inv"&&<InventoryPage fabInventoryCb={fabInventoryCb} fabTrigger={fabTrigger} onFabHandled={function(){setFabTrigger(null);}} onModalOpen={function(){setModalOpen(true);}} onModalClose={function(){setModalOpen(false);}}/>}
      {page==="ana"&&<AnalysisPage/>}
      {page==="admin"&&(<div><div style={{display:"flex",alignItems:"center",padding:"12px 16px",background:P.card,borderBottom:"1px solid "+P.border}}><button type="button" onClick={function(){setPage("cats");}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:P.muted,marginRight:8}}>‹</button><div style={{fontSize:16,fontWeight:700,color:P.ink}}>管理員</div>🥫</div><AdminPage/>🥫</div>)}
      {page!=="admin"&&!showNewCat&&!catPicker&&!modalOpen&&<FAB onAddCat={fabAddCat} onAddWeight={fabAddWeight} onAddHealth={fabAddHealth} onAddRecord={fabAddRecord} onAddInventory={fabInventoryCb}/>}
      {showNewCat&&<CatEditPage cat={null} onSave={function(newCat){var cats=lsGet("rr_cats",[]);newCat.id=Date.now().toString();cats.push(newCat);lsSet("rr_cats",cats);setShowNewCat(false);setPage("cats");setCatsKey(function(k){return k+1;})}} onBack={function(){setShowNewCat(false);}}/>}
      {catPicker&&catPicker!=="new"&&<CatPickerModal cats={lsGet("rr_cats",[])} title="選擇貓咪" onSelect={function(cat){var trigger=catPicker;setCatPicker(null);setPage("cats");setFabTrigger(trigger+":"+cat.id);}} onClose={function(){setCatPicker(null);}}/>}
      {page!=="admin"&&(<div style={{position:"fixed",bottom:"28px",
paddingBottom:"6px",left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:398,background:P.card,borderRadius:20,boxShadow:"0 4px 24px rgba(0,0,0,0.10)",display:"flex",zIndex:50,border:"1px solid "+P.border}}>
        {TABS.map(function(t){var active=page===t.id;return(
          <button type="button" key={t.id} onClick={function(){setPage(t.id);}} style={{flex:1,padding:"12px 4px 10px",background:"none",border:"none",cursor:"pointer",fontSize:11,color:active?P.btn:P.muted,fontWeight:active?700:400,borderBottom:"none",borderTop:"none",borderRadius:active?"0 0 0 0":"none",position:"relative"}}>{t.label}</button>
        );})}
      </div>)}
    </div>
  );
}
