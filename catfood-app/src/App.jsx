import { useState } from "react";

// ───────────────────────────────────────────────────────── // ADMIN CONFIG // ───────────────────────────────────────────────────────── const ADMIN_PASSWORD = "Koimiao2025!";

// Auto-generate flavor analysis from raw data const INGREDIENT_MAP = [ {kw:["⽜肝","雞肝","鴨肝","肝"],effects:["護眼","維⽣素A","⼼臟健康"],cat:"器官⾁",cls:"g"}, {kw:["⽜磺酸"],effects:["護眼","⼼臟健康","腦部發展"],cat:"補充劑",cls:"g"}, {kw:["鮭⿂","鯖⿂","鱈⿂","沙丁⿂","⿂油"],effects:["⾼Omega-3","護眼護膚","⼼臟健康"],cat:"動物蛋⽩ {kw:["鮪⿂","旗⿂","鰹⿂"],effects:["⾼蛋⽩","適⼝性佳"],cat:"動物蛋⽩",cls:"g"}, {kw:["雞⾁","雞胸"],effects:["⾼蛋⽩","低敏"],cat:"動物蛋⽩",cls:"g"}, {kw:["⽜⾁","⽜腱"],effects:["⾼蛋⽩","⾼鐵"],cat:"動物蛋⽩",cls:"g"}, {kw:["⽺⾁"],effects:["稀有蛋⽩","低敏"],cat:"動物蛋⽩",cls:"g"}, {kw:["鹿⾁"],effects:["極低敏","稀有蛋⽩"],cat:"動物蛋⽩",cls:"g"}, {kw:["鴨⾁"],effects:["低敏蛋⽩"],cat:"動物蛋⽩",cls:"g"}, {kw:["雞⼼","⽜⼼"],effects:["⼼臟健康","輔酶Q10"],cat:"器官⾁",cls:"g"}, {kw:["南瓜"],effects:["腸道健康","膳食纖維"],cat:"蔬果",cls:"g"}, {kw:["蘋果"],effects:["抗氧化","膳食纖維"],cat:"蔬果",cls:"g"}, {kw:["菊苣","益⽣元"],effects:["腸道健康","益⽣元"],cat:"益⽣元",cls:"g"}, {kw:["益⽣菌"],effects:["腸道健康","益⽣菌"],cat:"益⽣元",cls:"g"}, {kw:["卡拉膠"],effects:[""],cat:"增稠劑",cls:"r"}, {kw:["瓜爾⾖膠"],effects:[""],cat:"增稠劑",cls:"a"}, {kw:["磷酸鹽"],effects:[""],cat:"添加劑",cls:"a"}, {kw:["⼈⼯⾊素"],effects:[""],cat:"添加劑",cls:"r"}, ];

function buildFlavorData(brand, f){

const ings = (f.ingredients_raw||"").split(/[,，、]/).map(s=>s.trim()).filter(Boolean); const N = {

water: f.water||75, protein: f.protein||12, fat: f.fat||5,

phos: f.phos||0.22, calcium: f.calcium||0.27, sodium: f.sodium||0.27,

magnesium: f.magnesium||0.02, ash: f.ash||2.2, };

// Auto-generate tags

const tags = [{text:f.meat_pct||"80%⾁量",cls:"g"}];

if(ings.some(i=>["卡拉膠","瓜爾⾖膠","刺槐⾖膠"].some(k=>i.includes(k)))){ tags.push({text:"含膠類",cls:"r"}); } else {

tags.push({text:"無膠",cls:"g"}); } if(N.protein>=13) tags.push({text:"⾼蛋⽩",cls:"g"});

// Auto-generate risks const hasCarrageenan = ings.some(i=>i.includes("卡拉膠")); const hasGuar = ings.some(i=>i.includes("瓜爾⾖膠")); const risks = [ hasCarrageenan ? {cat:"膠類",text:"含卡拉膠，不建議長期食⽤",cls:"r"} : hasGuar ? {cat:"膠類",text:"含瓜爾⾖膠，低爭議但部分貓咪敏感",cls:"a"} : {cat:"膠類",text:"無添加",cls:"g"}, {cat:"誘食劑",text:"無⼈⼯誘食劑",cls:"g"}, ];

// Auto-generate ingredients analysis

const ingObjs = ings.map(name=>{

const match = INGREDIENT_MAP.find(m=>m.kw.some(k=>name.includes(k))); return { name, category: match?.cat||"其他", status: match?.cls||"g", role: match?.effects?.filter(Boolean).join("，")||name, }; });

// Auto score based on nutrients and ingredients let score = 8.5; if(N.protein>=13) score += 0.2; if(N.fat<=6) score += 0.1; if(hasCarrageenan) score -= 0.8; if(hasGuar) score -= 0.2; if(N.phos>0.3) score -= 0.3; score = Math.min(9.8, Math.max(5.0, score));

const scoreCls = score>=8.5?"g":score>=7?"a":"r";

const verdictType = hasCarrageenan?"warn":score>=8?"pass":"warn"; const verdict = hasCarrageenan

? `含卡拉膠，不建議長期作為主食，偶爾食⽤尚可。` : `${brand.label}品牌，${ings.slice(0,3).join("、")}為主要原料，蛋⽩質${N.protein}%，整體成分${

return {

brandName: brand.label, brandSub: `${f.label}（${brand.label_en||brand.label}）`, overallScore: score.toFixed(1)+"/10", overallClass: scoreCls, meatPercent: f.meat_pct||"80%", allergenCount: f.allergen_count||0, allergenClass: f.allergen_cls||"g", tags, risks, nutrients: N, ingredients: ingObjs.length>0 ? ingObjs : [{name:"詳⾒包裝",category:"其他",status:"g",role verdictType, verdict, gradeReason: f.grade_reason||verdict, };

}

// ───────────────────────────────────────────────────────── // COLOR TOKENS // ───────────────────────────────────────────────────────── const P = { bg:"#F8F4EF", card:"#F1E9DF", block:"#E7DCCD", ink:"#4A3A30", muted:"#9C8C7C", border:"#E3D8CC", btnFrom:"#F6C7A3", btnTo:"#E8A87C", gBg:"#EAF5EE", gBorder:"#A8D5BA", gText:"#4A7C59", aBg:"#FFF1E6", aBorder:"#E8A87C", aText:"#A86A3D", rBg:"#FDECEA", rBorder:"#E8A0A0", rText:"#9B3A3A", }; const ST = { g:{bg:P.gBg,border:P.gBorder,text:P.gText}, a:{bg:P.aBg,border:P.aBorder,text:P.aText}, r:{bg:P.rBg,border:P.rBorder,text:P.rText}, ok:{bg:P.gBg,border:P.gBorder,text:P.gText}, warn:{bg:P.aBg,border:P.aBorder,text:P.aText}, fail:{bg:P.rBg,border:P.rBorder,text:P.rText}, }; const BAR_CLR = {g:"#A8D5BA", a:"#E8A87C", r:"#E8A0A0"}; const I_LABEL = {g:"安全", a:"注意", r:"警⽰"};

// ───────────────────────────────────────────────────────── // DB HELPERS // ───────────────────────────────────────────────────────── const mk = (brandName,brandSub,score,scoreCls,meat,allergen,allergenCls,tags,risks,nutrients, ({brandName,brandSub,overallScore:score,overallClass:scoreCls,meatPercent:meat,allergenCoun const tg = (t,c) => ({text:t,cls:c}); const rk = (cat,text,cls) => ({cat,text,cls}); const ig = (name,category,status,role) => ({name,category,status,role});

// ───────────────────────────────────────────────────────── // MULTI-FLAVOR BRAND DATABASE // Structure: BRANDS[brandKey] = { label, aliases, flavors: [{id, label, data}] } // ───────────────────────────────────────────────────────── const BRANDS = {

"ziwi_peak": { label: "Ziwi Peak 巔峰", aliases: ["ziwi peak","ziwi","巔峰","ziwipeak"], flavors: [

{id:"lamb", label:"⽺⾁", data:mk("Ziwi Peak 巔峰","⽺⾁主食罐","9.5/10","g","92%" {id:"beef", label:"⽜⾁", data:mk("Ziwi Peak 巔峰","⽜⾁主食罐","9.5/10","g","92%" {id:"venison", label:"鹿⾁", data:mk("Ziwi Peak 巔峰","鹿⾁主食罐","9.6/10","g","92%" {id:"mackerel_lamb",label:"鯖⿂⽺⾁",data:mk("Ziwi Peak 巔峰","鯖⿂⽺⾁主食罐","9.4/10","g", {id:"mackerel", label:"鯖⿂", data:mk("Ziwi Peak 巔峰","鯖⿂主食罐","9.4/10","g","92%" {id:"chicken", label:"雞⾁", data:mk("Ziwi Peak 巔峰","雞⾁主食罐","9.4/10","g","92%" {id:"rabbit", label:"兔⾁", data:mk("Ziwi Peak 巔峰","兔⾁主食罐","9.5/10","g","92%" {id:"dual_lamb", label:"雙⽺", data:mk("Ziwi Peak 巔峰","雙⽺主食罐","9.5/10","g","92%" {id:"white_meat", label:"⽩⾁", data:mk("Ziwi Peak 巔峰","⽩⾁主食罐","9.3/10","g","92%" {id:"beef_venison",label:"⽜鹿", data:mk("Ziwi Peak 巔峰","⽜鹿主食罐","9.5/10","g","92%" {id:"cod", label:"鱈⿂", data:mk("Ziwi Peak 巔峰","鱈⿂主食罐","9.4/10","g","92%"

] },

"k9_natural": {

label: "K9 Natural", aliases: ["k9 natural","k9natural","k9","k9 natual"], flavors: [ { id:"beef", label:"⽜⾁", data: mk( "K9 Natural","凍乾⽜⾁主食罐（紐⻄蘭）","9.2/10","g","90%",0,"g", [tg("凍乾⼯藝","g"),tg("無穀無膠","g"),tg("90%鮮⾁","g")], [rk("膠類","完全無添加任何膠類","g"),rk("誘食劑","無任何添加，天然原料","g")], {water:74,protein:14,fat:6.5,phos:0.25,calcium:0.31,sodium:0.27,magnesium:0.021,ash:2 [ig("⽜⾁","動物蛋⽩","g","優質蛋⽩質，⾼鐵質，⽀持肌⾁發育"),ig("⽜⼼","器官⾁","g","富含輔酶Q1 "pass","紐⻄蘭頂級凍乾罐，⽜⾁90%，原料透明乾淨","凍乾⼯藝保留最多營養") }, { id:"lamb", label:"⽺⾁", data: mk( "K9 Natural","凍乾⽺⾁主食罐（紐⻄蘭）","9.2/10","g","90%",0,"g", [tg("凍乾⼯藝","g"),tg("無穀無膠","g"),tg("紐⻄蘭⽺","g")], [rk("膠類","完全無添加","g"),rk("誘食劑","無任何添加","g")], {water:73,protein:14,fat:7,phos:0.24,calcium:0.30,sodium:0.26,magnesium:0.021,ash:2.5 [ig("⽺⾁","動物蛋⽩","g","主要蛋⽩質來源，⽀持肌⾁⽣長與修復"),ig("⽺⼼","器官⾁","g","富含輔酶 "pass","紐⻄蘭⽺⾁凍乾，保留最⾼營養密度，無添加","凍乾⽺⾁，營養完整") }, { id:"chicken", label:"雞⾁", data: mk( "K9 Natural","凍乾雞⾁主食罐（紐⻄蘭）","9.1/10","g","90%",1,"g", [tg("凍乾⼯藝","g"),tg("無穀無膠","g"),tg("⾼適⼝性","g")], [rk("膠類","完全無添加","g"),rk("誘食劑","無任何添加","g")], {water:74,protein:14,fat:6.5,phos:0.23,calcium:0.29,sodium:0.26,magnesium:0.021,ash:2 [ig("雞⾁","動物蛋⽩","g","主要蛋⽩質來源，⽀持肌⾁⽣長"),ig("雞⼼","器官⾁","g","含⽜磺酸，維護 "pass","凍乾雞⾁配⽅，適⼝性佳，適合挑嘴貓咪","凍乾雞⾁，⾼適⼝性") }, { id:"salmon", label:"鮭⿂", data: mk( "K9 Natural","凍乾鮭⿂主食罐（紐⻄蘭）","9.2/10","g","90%",1,"g", [tg("凍乾⼯藝","g"),tg("⾼Omega-3","g"),tg("無穀無膠","g")], [rk("膠類","完全無添加","g"),rk("誘食劑","無任何添加","g")], {water:73,protein:14,fat:7,phos:0.24,calcium:0.30,sodium:0.27,magnesium:0.021,ash:2.5 [ig("鮭⿂","動物蛋⽩","g","富含Omega-3，護眼護膚，促進腦部發育"),ig("鮭⿂油","脂肪","g","DHA/E "pass","凍乾鮭⿂⾼Omega-3，護眼護膚護⼼，強⼒推薦","凍乾鮭⿂，Omega-3最豐富") }, { id:"venison", label:"鹿⾁", data: mk( "K9 Natural","凍乾鹿⾁主食罐（紐⻄蘭）","9.3/10","g","90%",0,"g", [tg("野⽣鹿⾁","g"),tg("低敏配⽅","g"),tg("凍乾⼯藝","g")], [rk("膠類","完全無添加","g"),rk("誘食劑","無任何添加","g")], {water:73,protein:15,fat:6,phos:0.23,calcium:0.29,sodium:0.26,magnesium:0.020,ash:2.4 [ig("鹿⾁","動物蛋⽩","g","野⽣稀有低敏蛋⽩，適合嚴重食物過敏貓咪"),ig("鹿⼼","器官⾁","g","富含 "pass","野⽣鹿⾁凍乾，低敏稀有蛋⽩，適合嚴重過敏貓咪","野⽣鹿⾁低敏凍乾") },

] },

"farmina": {

label: "N&D Farmina 法米納", aliases: ["farmina","n&d","法米納","farmina n&d","n&d farmina"], flavors: [ { id:"salmon_pumpkin", label:"鮭⿂南瓜", data: mk( "N&D Farmina 法米納","有機無穀鮭⿂南瓜主食罐（義⼤利）","9.0/10","g","87%",1,"g", [tg("有機蔬果","g"),tg("無穀無膠","g"),tg("義⼤利製","g")], [rk("膠類","完全無添加膠類","g"),rk("誘食劑","無任何⼈⼯誘食劑","g")], {water:74,protein:14,fat:6.5,phos:0.24,calcium:0.3,sodium:0.26,magnesium:0.021,ash:2. [ig("鮭⿂","動物蛋⽩","g","富含Omega-3，護眼護膚，促進腦部發育"),ig("南瓜","蔬果","g","膳食纖維 "pass","義⼤利頂級，有機鮭⿂南瓜，⾼Omega-3，強烈推薦","義⼤利有機，Omega-3豐富") }, { id:"chicken_pumpkin", label:"雞⾁南瓜", data: mk( "N&D Farmina 法米納","有機無穀雞⾁南瓜主食罐（義⼤利）","8.9/10","g","87%",1,"g", [tg("有機雞⾁","g"),tg("南瓜有機","g"),tg("無穀無膠","g")], [rk("膠類","完全無添加膠類","g"),rk("誘食劑","無⼈⼯誘食劑","g")], {water:74,protein:13,fat:6,phos:0.23,calcium:0.29,sodium:0.26,magnesium:0.021,ash:2.3 [ig("有機雞⾁","動物蛋⽩","g","有機飼養雞⾁，主要蛋⽩質來源"),ig("有機南瓜","蔬果","g","有機種植 "pass","有機雞⾁南瓜，義⼤利製，無穀無膠，成分透明優質","有機雞⾁，成分極優") }, { id:"duck_pumpkin", label:"鴨⾁南瓜", data: mk( "N&D Farmina 法米納","有機無穀鴨⾁南瓜主食罐（義⼤利）","9.0/10","g","87%",0,"g", [tg("有機鴨⾁","g"),tg("低敏配⽅","g"),tg("無穀無膠","g")], [rk("膠類","完全無添加膠類","g"),rk("誘食劑","無⼈⼯誘食劑","g")], {water:74,protein:14,fat:6,phos:0.23,calcium:0.29,sodium:0.26,magnesium:0.020,ash:2.3 [ig("有機鴨⾁","動物蛋⽩","g","有機低敏蛋⽩，適合食物過敏貓咪"),ig("有機南瓜","蔬果","g","有機種 "pass","有機鴨⾁低敏配⽅，義⼤利製，適合食物過敏貓咪","有機低敏，過敏⾸選") }, { id:"lamb_pumpkin", label:"⽺⾁南瓜", data: mk( "N&D Farmina 法米納","有機無穀⽺⾁南瓜主食罐（義⼤利）","9.0/10","g","87%",0,"g", [tg("有機⽺⾁","g"),tg("稀有蛋⽩","g"),tg("無穀無膠","g")], [rk("膠類","完全無添加","g"),rk("誘食劑","無⼈⼯添加","g")], {water:74,protein:14,fat:7,phos:0.24,calcium:0.30,sodium:0.26,magnesium:0.021,ash:2.4 [ig("有機⽺⾁","動物蛋⽩","g","有機稀有低敏蛋⽩，成分透明優質"),ig("有機南瓜","蔬果","g","有機種 "pass","有機⽺⾁稀有蛋⽩，南瓜纖維豐富，義⼤利製，強烈推薦","有機⽺⾁，稀有低敏") }, { id:"venison_apple", label:"鹿⾁蘋果", data: mk( "N&D Farmina 法米納","有機無穀鹿⾁蘋果主食罐（義⼤利）","9.2/10","g","87%",0,"g", [tg("野⽣鹿⾁","g"),tg("有機蘋果","g"),tg("無穀無膠","g")], [rk("膠類","完全無添加","g"),rk("誘食劑","無⼈⼯添加","g")], {water:74,protein:15,fat:6.5,phos:0.24,calcium:0.30,sodium:0.26,magnesium:0.020,ash:2 [ig("有機鹿⾁","動物蛋⽩","g","有機野⽣極低敏蛋⽩，嚴重過敏貓⾸選"),ig("有機蘋果","蔬果","g","抗 "pass","野⽣鹿⾁極低敏，有機蘋果富含抗氧化，嚴重過敏貓⾸選","野⽣鹿⾁極低敏") },

] },

"fancy_feast": {

label: "Fancy Feast", aliases: ["fancy feast","ff","奇思妙想"], flavors: [ { id:"tuna", label:"鮪⿂", data: mk( "Fancy Feast 經典","鮪⿂主食罐","6.5/10","a","55%",2,"a", [tg("含⼈⼯⾊素","a"),tg("含2種過敏原","a"),tg("無防腐劑","g")], [rk("膠類","含瓜爾⾖膠，低爭議但部分貓咪敏感","a"),rk("誘食劑","含天然香料，低風險誘食","a")], {water:82,protein:10,fat:3,phos:0.2,calcium:0.18,sodium:0.32,magnesium:0.025,ash:1.8} [ig("鮪⿂","動物蛋⽩","g","⾼蛋⽩優質⿂⾁，適⼝性極佳"),ig("⿂湯","⽔分","g","天然⿂湯補充⽔分， "warn","平價選擇，含磷酸鹽與膠類，腎貓需謹慎，偶爾食⽤尚可","性價比尚可但成分普通") }, { id:"seafood", label:"海鮮拼盤", data: mk( "Fancy Feast 經典","海鮮拼盤主食罐","6.3/10","a","50%",2,"a", [tg("含⼈⼯⾊素","a"),tg("含多種膠類","a"),tg("含2種過敏原","a")], [rk("膠類","含瓜爾⾖膠及卡拉膠，不建議長期食⽤","r"),rk("誘食劑","含天然香料，低風險","a")], {water:83,protein:9,fat:2.5,phos:0.19,calcium:0.17,sodium:0.33,magnesium:0.026,ash:1. [ig("鮪⿂","動物蛋⽩","g","⾼蛋⽩優質⿂⾁，適⼝性極佳"),ig("蝦","動物蛋⽩","a","甲殼類過敏原，部 "warn","海鮮拼盤含卡拉膠，不建議作主食，偶爾食⽤","含卡拉膠，偶爾食⽤") },

] },

"terra_canis": {

label:"TERRA CANIS 醍菈鮮廚", aliases:["terra canis","醍菈鮮廚","terra"], flavors:[ {id:"turkey",label:"1號浪漫火雞",data:mk("TERRA CANIS 醍菈鮮廚","1號浪漫火雞（德國）","8.8/10 {id:"chicken",label:"2號嫩粉鮮雞",data:mk("TERRA CANIS 醍菈鮮廚","2號嫩粉鮮雞（德國）","8.8/1 {id:"salmon",label:"3號野⽣鮭⿂",data:mk("TERRA CANIS 醍菈鮮廚","3號野⽣鮭⿂（德國）","9.0/10 {id:"rabbit",label:"4號純真兔⾁",data:mk("TERRA CANIS 醍菈鮮廚","4號純真兔⾁（德國）","9.0/10 {id:"chicken_turkey",label:"5號鮮雞火雞",data:mk("TERRA CANIS 醍菈鮮廚","5號鮮雞火雞（德國）" {id:"salmon_chicken",label:"6號鮭⿂鮮雞",data:mk("TERRA CANIS 醍菈鮮廚","6號鮭⿂鮮雞（德國）" {id:"rabbit_turkey",label:"7號兔⾁火雞",data:mk("TERRA CANIS 醍菈鮮廚","7號兔⾁火雞（德國）", {id:"lamb_chicken",label:"8號⽺⾁鮮雞",data:mk("TERRA CANIS 醍菈鮮廚","8號⽺⾁鮮雞（德國）","

] },

"instinct_brand": {

label:"Instinct 原點", aliases:["instinct","原點"], flavors:[ {id:"chicken",label:"皇極鮮雞",data:mk("Instinct 原點","皇極鮮雞主食罐","8.7/10","g","85%",1 {id:"venison_gf",label:"無穀鹿⾁",data:mk("Instinct 原點","無穀鹿⾁主食罐","8.9/10","g","85% {id:"duck_gf",label:"無穀鴨⾁",data:mk("Instinct 原點","無穀鴨⾁主食罐","8.7/10","g","85%",0 {id:"salmon_gf",label:"無穀鮭⿂",data:mk("Instinct 原點","無穀鮭⿂主食罐","8.8/10","g","85%" {id:"chicken_gf",label:"無穀雞⾁",data:mk("Instinct 原點","無穀雞⾁主食罐","8.6/10","g","85% {id:"lamb_gf",label:"無穀⽺⾁",data:mk("Instinct 原點","無穀⽺⾁主食罐","8.7/10","g","85%",0 {id:"salmon_lp",label:"低敏鮭⿂",data:mk("Instinct 原點","低敏鮭⿂主食罐","8.9/10","g","85%" {id:"turkey_lp",label:"低敏火雞⾁",data:mk("Instinct 原點","低敏火雞⾁主食罐","8.7/10","g","

] },

// ── 台灣品牌擴充 ──────────────────────────────────────

"abao": { label:"Abao 阿寶", aliases:["abao","阿寶"], flavors:[ {id:"tuna_bass",label:"鮪⿂×鱸⿂",data:mk("Abao 阿寶","鮪⿂×鱸⿂主食罐（台灣）","8.4/10","g", {id:"chicken_quail",label:"雞⾁×鵪鶉",data:mk("Abao 阿寶","雞⾁×鵪鶉主食罐（台灣）","8.5/10", {id:"beef_tuna",label:"⽜⾁×鮪⿂",data:mk("Abao 阿寶","⽜⾁×鮪⿂主食罐（台灣）","8.4/10","g", {id:"marlin_bonito",label:"旗⿂×鰹⿂",data:mk("Abao 阿寶","旗⿂×鰹⿂主食罐（台灣）","8.4/10", ] },

"betty's": {

label:"Betty's 蓓蒂奶奶", aliases:["betty's","蓓蒂奶奶","bettys"], flavors:[ {id:"duck",label:"鴨⾁",data:mk("Betty's 蓓蒂奶奶","鴨⾁主食罐（德國）","8.8/10","g","85%",0 {id:"chicken_salmon",label:"雞⾁+鮭⿂+琉璃苣籽油",data:mk("Betty's 蓓蒂奶奶","雞⾁鮭⿂琉璃苣籽 {id:"chicken_pheasant",label:"雞⾁+野雞+琉璃苣籽油",data:mk("Betty's 蓓蒂奶奶","雞⾁野雞琉璃苣 {id:"chicken_turkey",label:"雞⾁+火雞⾁+琉璃苣籽油",data:mk("Betty's 蓓蒂奶奶","雞⾁火雞⾁琉璃 {id:"chicken_turkey_kitten",label:"雞⾁+火雞⾁（幼貓）",data:mk("Betty's 蓓蒂奶奶","雞⾁火雞⾁ {id:"kangaroo",label:"袋鼠⾁+⾺鈴薯",data:mk("Betty's 蓓蒂奶奶","袋鼠⾁⾺鈴薯主食罐（德國）","9 {id:"goatmilk_chick_tuna",label:"⽺奶幼貓-雞鮪戀乳",data:mk("Betty's 蓓蒂奶奶","⽺奶幼貓雞鮪戀 {id:"goatmilk_chicken",label:"⽺奶幼貓-嫩雞戀乳",data:mk("Betty's 蓓蒂奶奶","⽺奶幼貓嫩雞戀乳主 {id:"poultry",label:"家禽⾁",data:mk("Betty's 蓓蒂奶奶","家禽⾁主食罐（德國）","8.6/10","g","

] },

"carnivore raw": { label:"Carnivore Raw 卡尼", aliases:["carnivore raw","卡尼","carnivore"], flavors:[ {id:"chicken_venison",label:"雞⾁+鹿⾁",data:mk("Carnivore Raw 卡尼","雞⾁鹿⾁主食罐","8.9/1 {id:"chicken_duck",label:"雞⾁+鴨⾁",data:mk("Carnivore Raw 卡尼","雞⾁鴨⾁主食罐","8.8/10", {id:"chicken_beef",label:"雞⾁+⽜⾁",data:mk("Carnivore Raw 卡尼","雞⾁⽜⾁主食罐","8.8/10", {id:"chicken",label:"雞⾁",data:mk("Carnivore Raw 卡尼","雞⾁主食罐","8.7/10","g","90%",1, ] },

"catdives": { label:"catdives 貓爾地夫", aliases:["catdives","貓爾地夫"], flavors:[

{id:"filet_beef",label:"菲⼒⽜（頂級）",data:mk("catdives 貓爾地夫","頂級享受菲⼒⽜主食罐","9. {id:"venison",label:"嚴選鹿（頂級）",data:mk("catdives 貓爾地夫","頂級享受嚴選鹿主食罐","9.1/1 {id:"tuna_chicken",label:"鮪⿂雞胸⾁（經典）",data:mk("catdives 貓爾地夫","經典回味鮪⿂雞胸⾁主 {id:"chicken_breast",label:"雞胸⾁（經典）",data:mk("catdives 貓爾地夫","經典回味雞胸⾁主食罐" {id:"beef_chicken",label:"板腱⽜雞胸⾁（經典）",data:mk("catdives 貓爾地夫","經典回味板腱⽜雞胸 {id:"lamb_chicken",label:"嚴選⽺雞胸⾁（經典）",data:mk("catdives 貓爾地夫","經典回味嚴選⽺雞胸

] },

"furkid lab": {

label:"FURKID LAB ⽑研所", aliases:["furkid lab","⽑研所","furkidlab"], flavors:[ {id:"duck",label:"香舒嫩鴨",data:mk("FURKID LAB ⽑研所","香舒嫩鴨主食罐（台灣）","8.8/10","g" {id:"venison",label:"野味燉鹿",data:mk("FURKID LAB ⽑研所","野味燉鹿主食罐（台灣）","9.0/10", {id:"beef",label:"爆濃⽜排",data:mk("FURKID LAB ⽑研所","爆濃⽜排主食罐（台灣）","8.8/10","g" {id:"fish",label:"海味鮮⿂",data:mk("FURKID LAB ⽑研所","海味鮮⿂主食罐（台灣）","8.7/10","g" {id:"seafood",label:"活跳雙鮮",data:mk("FURKID LAB ⽑研所","活跳雙鮮主食罐（台灣）","8.7/10", {id:"chicken",label:"多汁雞腿",data:mk("FURKID LAB ⽑研所","多汁雞腿主食罐（台灣）","8.7/10",

] },

"gussto": {

label:"Gussto 惡魔喵", aliases:["gussto","惡魔喵"], flavors:[ {id:"chicken",label:"1號鮮嫩雞⾁",data:mk("Gussto 惡魔喵","1號鮮嫩雞⾁主食罐（波蘭）","8.5/10" {id:"salmon",label:"2號野⽣鮭⿂",data:mk("Gussto 惡魔喵","2號野⽣鮭⿂主食罐（波蘭）","8.8/10", {id:"pork",label:"3號野味豬⾁",data:mk("Gussto 惡魔喵","3號野味豬⾁主食罐（波蘭）","8.5/10","g {id:"lamb",label:"4號稚嫩⽺⾁",data:mk("Gussto 惡魔喵","4號稚嫩⽺⾁主食罐（波蘭）","8.7/10","g {id:"turkey_duck",label:"5號美味火雞+嫩鴨",data:mk("Gussto 惡魔喵","5號美味火雞嫩鴨主食罐（波蘭 {id:"turkey_tuna",label:"6號美味火雞+鮪⿂",data:mk("Gussto 惡魔喵","6號美味火雞鮪⿂主食罐（波蘭

] },

"instinct_tw": {

label:"Instinct 原點", aliases:["instinct 原點","原點","instinct原點"], flavors:[ {id:"chicken",label:"皇極鮮雞",data:mk("Instinct 原點","皇極鮮雞無穀主食罐","8.7/10","g","85 {id:"venison",label:"無穀鹿⾁",data:mk("Instinct 原點","無穀鹿⾁主食罐","8.9/10","g","85%",0 {id:"duck",label:"無穀鴨⾁",data:mk("Instinct 原點","無穀鴨⾁主食罐","8.8/10","g","85%",0,"g {id:"salmon",label:"無穀鮭⿂",data:mk("Instinct 原點","無穀鮭⿂主食罐","8.9/10","g","85%",1, {id:"chicken_grain_free",label:"無穀雞⾁",data:mk("Instinct 原點","無穀雞⾁主食罐","8.7/10", {id:"lamb",label:"無穀⽺⾁",data:mk("Instinct 原點","無穀⽺⾁主食罐","8.8/10","g","85%",0,"g {id:"low_allergen_salmon",label:"低敏鮭⿂",data:mk("Instinct 原點","低敏鮭⿂主食罐","9.0/10" {id:"low_allergen_turkey",label:"低敏火雞⾁",data:mk("Instinct 原點","低敏火雞⾁主食罐","9.0

] }, "catssay": {

label:"Catssay 貓有話說", aliases:["catssay","貓有話說"], flavors:[ {id:"mahi_seacucumber",label:"⿁頭⼑海參",data:mk("Catssay 貓有話說","尋寶罐⿁頭⼑海參","8.6/ {id:"pure_chicken",label:"純雞⾁",data:mk("Catssay 貓有話說","尋寶罐純雞⾁","8.4/10","g","88 {id:"beef_chicken",label:"⽜⾁嫩雞",data:mk("Catssay 貓有話說","尋寶罐⽜⾁嫩雞","8.5/10","g" {id:"seafood",label:"澎⿂宴",data:mk("Catssay 貓有話說","尋寶罐澎⿂宴","8.5/10","g","82%",2, {id:"sea_urchin_shrimp",label:"海膽⼤蝦",data:mk("Catssay 貓有話說","尋寶罐海膽⼤蝦","8.6/10 {id:"pigeon_chicken",label:"乳鴿嫩雞",data:mk("Catssay 貓有話說","尋寶罐乳鴿嫩雞","8.7/10"," {id:"cod_salmon_lactoferrin",label:"鱈⿂+鮭⿂（乳鐵蛋⽩）",data:mk("Catssay 貓有話說","乳鐵蛋 {id:"sea_urchin_scallop_lactoferrin",label:"海膽+⼲⾙（乳鐵蛋⽩）",data:mk("Catssay 貓有話說 {id:"duck_lactoferrin",label:"櫻桃鴨（乳鐵蛋⽩）",data:mk("Catssay 貓有話說","乳鐵蛋⽩櫻桃鴨", {id:"goat_chicken_lactoferrin",label:"⼭⽺奶+雞（乳鐵蛋⽩）",data:mk("Catssay 貓有話說","乳鐵 {id:"rabbit_quail_lactoferrin",label:"兔⾁+鵪鶉（乳鐵蛋⽩）",data:mk("Catssay 貓有話說","乳鐵

] },

"couch_potato": {

label:"Couch Potato 沙發⾺鈴薯", aliases:["couch potato","沙發⾺鈴薯","couchpotato"], flavors:[ {id:"pure_chicken",label:"溫體雞（PURE）",data:mk("Couch Potato 沙發⾺鈴薯","PURE純粹罐溫體雞 {id:"pure_pork",label:"溫體豬（PURE）",data:mk("Couch Potato 沙發⾺鈴薯","PURE純粹罐溫體豬"," {id:"pure_beef",label:"溫體⽜（PURE）",data:mk("Couch Potato 沙發⾺鈴薯","PURE純粹罐溫體⽜"," {id:"berry_chicken",label:"莓果佐雞（Power）",data:mk("Couch Potato 沙發⾺鈴薯","Power超能罐 {id:"rabbit",label:"綠野兔⾁（Power）",data:mk("Couch Potato 沙發⾺鈴薯","Power超能罐綠野兔⾁ {id:"pomegranate_chicken",label:"紅⽯榴雞（Power）",data:mk("Couch Potato 沙發⾺鈴薯","Powe {id:"pastoral_chicken",label:"⽥園嫩雞（Power）",data:mk("Couch Potato 沙發⾺鈴薯","Power超 {id:"salmon",label:"活⼒野鮭（Power）",data:mk("Couch Potato 沙發⾺鈴薯","Power超能罐活⼒野鮭 {id:"venison",label:"原野鮮鹿（Power）",data:mk("Couch Potato 沙發⾺鈴薯","Power超能罐原野鮮鹿 {id:"land_sea_chicken",label:"海陸雞⿂（Power）",data:mk("Couch Potato 沙發⾺鈴薯","Power超

] },

"firstmate": { label:"FirstMate 第⼀饗宴", aliases:["firstmate","第⼀饗宴"], flavors:[ {id:"chicken",label:"非籠養雞",data:mk("FirstMate 第⼀饗宴","非籠養雞主食罐（加拿⼤）","8.8/10 {id:"turkey",label:"非籠養火雞",data:mk("FirstMate 第⼀饗宴","非籠養火雞主食罐（加拿⼤）","8.9/ {id:"salmon",label:"野⽣鮭⿂",data:mk("FirstMate 第⼀饗宴","野⽣鮭⿂主食罐（加拿⼤）","9.0/10" ] },

"munchee": {

label:"Munchee 貪貪", aliases:["munchee","貪貪"], flavors:[ {id:"chicken_super",label:"經典嫩雞（超⾁泥）",data:mk("Munchee 貪貪","超⾁泥機能經典嫩雞","8. {id:"bass_chicken_super",label:"鱸⿂雞⾁（超⾁泥）",data:mk("Munchee 貪貪","超⾁泥機能鱸⿂雞⾁ {id:"chicken_duck_super",label:"雞⾁鴨⾁（超⾁泥）",data:mk("Munchee 貪貪","超⾁泥機能雞⾁鴨⾁ {id:"venison_bass_super",label:"鹿⾁鱸（超⾁泥）",data:mk("Munchee 貪貪","超⾁泥機能鹿⾁鱸"," {id:"island_chicken",label:"寶島鮮雞（⾁泥）",data:mk("Munchee 貪貪","⾁泥機能寶島鮮雞","8.6/ {id:"chicken_beef_strips",label:"鮮雞火雞（⾁絲）",data:mk("Munchee 貪貪","⾁絲機能鮮雞火雞",

] },

"paw_paw_nian": { label:"Paw Paw 年年", aliases:["paw paw 年年","年年","paw paw年年","pawpaw年年"], flavors:[ {id:"chicken_sunflower",label:"嫩煎雞腿佐葵花籽",data:mk("Paw Paw 年年","嫩煎雞腿佐葵花籽主食罐 {id:"salmon_scallop",label:"銀鮭⼲⾙雜炊",data:mk("Paw Paw 年年","銀鮭⼲⾙雜炊主食罐","9.0/10 {id:"filet_beef",label:"菲⼒⽜佐無花果紅藜",data:mk("Paw Paw 年年","菲⼒⽜佐無花果紅藜主食罐"," ] },

"tata_care": {

label:"tata.care 踏踏寵膳", aliases:["tata.care","踏踏寵膳","tata care","踏踏"], flavors:[ {id:"chicken_herb",label:"香草嫩雞（機能）",data:mk("tata.care 踏踏寵膳","機能香草嫩雞主食罐", {id:"salmon",label:"嫩煎鮭⿂（機能）",data:mk("tata.care 踏踏寵膳","機能嫩煎鮭⿂主食罐","8.9/1 {id:"duck",label:"鮮燉鴨胸（機能）",data:mk("tata.care 踏踏寵膳","機能鮮燉鴨胸主食罐","8.8/10" {id:"beef",label:"草飼燉⽜（機能）",data:mk("tata.care 踏踏寵膳","機能草飼燉⽜主食罐","8.9/10" {id:"earth_chicken_egg",label:"⼟雞滑蛋（⼟雞煲）",data:mk("tata.care 踏踏寵膳","⼟雞煲⼟雞滑蛋 {id:"turkey",label:"老甕熬火雞（⼟雞煲）",data:mk("tata.care 踏踏寵膳","⼟雞煲老甕熬火雞主食罐", {id:"milkfish",label:"嫩煲虱⽬⿂（⼟雞煲）",data:mk("tata.care 踏踏寵膳","⼟雞煲嫩煲虱⽬⿂主食罐 {id:"clam",label:"溫燉海瓜⼦（⼟雞煲）",data:mk("tata.care 踏踏寵膳","⼟雞煲溫燉海瓜⼦主食罐","8

] },

// ── 台灣品牌 ──────────────────────────────────────────

"cody_mao": { label:"Cody Mao Mao 可蒂⽑⽑", aliases:["cody mao mao","可蒂⽑⽑","cody"], flavors:[ {id:"bonito_berry",label:"鰹⿂鮮雞×雙莓",data:mk("Cody Mao Mao 可蒂⽑⽑","呼呼罐鰹⿂鮮雞×雙莓" {id:"tuna_edamame",label:"鮮嫩鮪⿂×⽑⾖",data:mk("Cody Mao Mao 可蒂⽑⽑","呼呼罐鮮嫩鮪⿂×⽑⾖" {id:"chicken_apple",label:"鮮嫩雞⾁×蘋果",data:mk("Cody Mao Mao 可蒂⽑⽑","呼呼罐鮮嫩雞⾁×蘋果 {id:"milkfish_black_fungus",label:"虱⽬⿂雞×⿊⽊耳",data:mk("Cody Mao Mao 可蒂⽑⽑","呼呼罐虱 ] },

"hoorooroo": { label:"Hoorooroo 厚⾁⾁", aliases:["hoorooroo","厚⾁⾁"], flavors:[

{id:"chicken_turkey",label:"鮮燉雞拼火雞⾁",data:mk("Hoorooroo 厚⾁⾁","鮮燉雞拼火雞⾁主食罐", {id:"chicken_beef",label:"鮮燉雞拼極上⽜",data:mk("Hoorooroo 厚⾁⾁","鮮燉雞拼極上⽜主食罐","8 {id:"chicken_salmon",label:"鮮燉雞拼嫩鮭⿂",data:mk("Hoorooroo 厚⾁⾁","鮮燉雞拼嫩鮭⿂主食罐", {id:"bonito_whitebait",label:"⾄尊鰹⿂拼魩仔⿂",data:mk("Hoorooroo 厚⾁⾁","⾄尊鰹⿂拼魩仔⿂主 {id:"tuna_salmon",label:"⼀品鮪⿂拼嫩鮭⿂",data:mk("Hoorooroo 厚⾁⾁","⼀品鮪⿂拼嫩鮭⿂主食罐", {id:"marlin_clam",label:"海味旗⿂拼海瓜⼦",data:mk("Hoorooroo 厚⾁⾁","海味旗⿂拼海瓜⼦主食罐",

] },

"maoup": { label:"MAOUP ⽑起來", aliases:["maoup","⽑起來"], flavors:[ {id:"chicken_fish",label:"鮮雞雙⿂宴",data:mk("MAOUP ⽑起來","鮮雞雙⿂宴主食罐（台灣）","8.6/1 {id:"chicken_marlin",label:"鮮雞與旗⿂",data:mk("MAOUP ⽑起來","鮮雞與旗⿂主食罐（台灣）","8.5 {id:"pastoral_chicken",label:"牧野⽥園雞",data:mk("MAOUP ⽑起來","牧野⽥園雞主食罐（台灣）","8 {id:"goat_chicken",label:"⼭⽺奶雞⾁",data:mk("MAOUP ⽑起來","⼭⽺奶雞⾁主食罐（台灣）","8.7/1 ] },

"xin_tou_rou": {

label:"XIN TOU ROU ⼼頭⾁", aliases:["xin tou rou","⼼頭⾁","xintouro"], flavors:[ {id:"lamb",label:"⽺⾁（洛神）",data:mk("XIN TOU ROU ⼼頭⾁","洛神⽺⾁主食罐（台灣）","8.8/10" {id:"duck",label:"鴨⾁（洛神）",data:mk("XIN TOU ROU ⼼頭⾁","洛神鴨⾁主食罐（台灣）","8.8/10" {id:"turkey",label:"火雞⾁（洛神）",data:mk("XIN TOU ROU ⼼頭⾁","洛神火雞⾁主食罐（台灣）","8. {id:"seafood",label:"海鮮（⼼絲罐）",data:mk("XIN TOU ROU ⼼頭⾁","⼼絲罐海鮮主食罐（台灣）","8 {id:"beef_silk",label:"⽜⾁（⼼絲罐）",data:mk("XIN TOU ROU ⼼頭⾁","⼼絲罐⽜⾁主食罐（台灣）", {id:"chicken_silk",label:"雞⾁（⼼絲罐）",data:mk("XIN TOU ROU ⼼頭⾁","⼼絲罐雞⾁主食罐（台灣 {id:"salmon_silk",label:"鮭⿂（⼼絲罐）",data:mk("XIN TOU ROU ⼼頭⾁","⼼絲罐鮭⿂主食罐（台灣）

] },

"jijie_wan": { label:"乖乖吃飯", aliases:["乖乖吃飯","乖乖"], flavors:[ {id:"pork_mackerel",label:"豬⾁鯖⿂",data:mk("乖乖吃飯","豬豬罐豬⾁鯖⿂主食罐（台灣）","8.5/10" {id:"duck_egg_yolk",label:"櫻桃鴨肝蛋黃（⾁泥）",data:mk("乖乖吃飯","⼩尾巴泥泥櫻桃鴨肝蛋黃","8. {id:"roast_chicken",label:"香煨嫩雞（獨享餐）",data:mk("乖乖吃飯","獨享餐香煨嫩雞主食罐","8.6/1 {id:"beef",label:"老甕珍⽜（獨享餐）",data:mk("乖乖吃飯","獨享餐老甕珍⽜主食罐","8.7/10","g","8 ] },

"vet_research": {

label:"獸研所", aliases:["獸研所","vet research"], flavors:[ {id:"kitten_chicken",label:"牧野雞（幼貓）",data:mk("獸研所","幼貓牧野雞主食罐（台灣）","8.8/10 {id:"kitten_fish",label:"鮮海⿂（幼貓）",data:mk("獸研所","幼貓鮮海⿂主食罐（台灣）","8.8/10"," {id:"immune_chicken",label:"牧野雞（免疫）",data:mk("獸研所","免疫牧野雞主食罐（台灣）","8.9/10 {id:"urinary_chicken",label:"牧野雞（泌尿）",data:mk("獸研所","泌尿舒壓牧野雞主食罐（台灣）","9 {id:"kidney_chicken",label:"牧野雞（腎臟）",data:mk("獸研所","腎臟牧野雞主食罐（台灣）","9.1/10

] },

"pinjitu": {

label:"拼圖貓廚房", aliases:["拼圖貓廚房","拼圖"], flavors:[ {id:"turkey",label:"Q彈多汁火雞⾁",data:mk("拼圖貓廚房","Q彈多汁火雞⾁主食罐（台灣）","8.6/10", {id:"bass",label:"養⽣補氣吃鱸⿂",data:mk("拼圖貓廚房","養⽣補氣鱸⿂主食罐（台灣）","8.7/10","g" {id:"quail",label:"鄉野奔放鵪鶉⾁",data:mk("拼圖貓廚房","鄉野奔放鵪鶉⾁主食罐（台灣）","8.8/10", {id:"duck",label:"法式軟嫩鮮鴨⾁",data:mk("拼圖貓廚房","法式軟嫩鮮鴨⾁主食罐（台灣）","8.7/10"," {id:"beef",label:"尊榮頂級燉⽜⾁",data:mk("拼圖貓廚房","尊榮頂級燉⽜⾁主食罐（台灣）","8.8/10","

] },

"hao_shi_yusu": { label:"好食寓所", aliases:["好食寓所"], flavors:[ {id:"chicken",label:"唐伯虎點嫩雞",data:mk("好食寓所","唐伯虎點嫩雞主食罐（台灣）","8.6/10","g" {id:"quail",label:"鵪鶉你好",data:mk("好食寓所","鵪鶉你好主食罐（台灣）","8.8/10","g","84%",0, {id:"tuna_salmon",label:"鮪鮭正傳",data:mk("好食寓所","鮪鮭正傳主食罐（台灣）","8.7/10","g","8 {id:"beef",label:"進擊的⽜⽜",data:mk("好食寓所","進擊的⽜⽜主食罐（台灣）","8.7/10","g","83%" ] },

"mao_yan_gong": { label:"⽑研⼯事", aliases:["⽑研⼯事","mao yan gong shi"], flavors:[ {id:"double_egg_tomato",label:"雙蛋茄汁雞",data:mk("⽑研⼯事","雙蛋茄汁雞主食罐（台灣）","8.7/ {id:"swordfish",label:"鮮蔬劍旗⿂",data:mk("⽑研⼯事","鮮蔬劍旗⿂主食罐（台灣）","8.7/10","g", {id:"duck_flaxseed",label:"亞⿇香草鴨",data:mk("⽑研⼯事","亞⿇香草鴨主食罐（台灣）","8.9/10", {id:"double_fish",label:"葉黃素雙⿂",data:mk("⽑研⼯事","葉黃素雙⿂主食罐（台灣）","8.9/10","g ] },

"wu_hang": {

label:"五⾏貓膳", aliases:["五⾏貓膳","五⾏"], flavors:[ {id:"red",label:"紅罐",data:mk("五⾏貓膳","五⾏紅罐主食罐（台灣）","8.6/10","g","83%",1,"g",[ {id:"white",label:"⽩罐",data:mk("五⾏貓膳","五⾏⽩罐主食罐（台灣）","8.6/10","g","83%",1,"g" {id:"yellow",label:"黃罐",data:mk("五⾏貓膳","五⾏黃罐主食罐（台灣）","8.6/10","g","83%",1,"g {id:"green",label:"綠罐",data:mk("五⾏貓膳","五⾏綠罐主食罐（台灣）","8.6/10","g","82%",1,"g" {id:"purple",label:"紫罐",data:mk("五⾏貓膳","五⾏紫罐主食罐（台灣）","8.7/10","g","82%",1,"g

] },

"heromama": {

label:"HeroMama", aliases:["heromama","hero mama"], flavors:[ {id:"chicken_breast_light",label:"雞胸⾁（輕盈低卡）",data:mk("HeroMama","輕盈低卡雞胸⾁主食罐 {id:"clam_chicken_light",label:"花蛤雞⾁（輕盈低卡）",data:mk("HeroMama","輕盈低卡花蛤雞⾁主食 {id:"beef_light",label:"⽜腿⾁（輕盈低卡）",data:mk("HeroMama","輕盈低卡⽜腿⾁主食罐（台灣）"," {id:"bass_light",label:"清蒸鱸⿂（輕盈低卡）",data:mk("HeroMama","輕盈低卡清蒸鱸⿂主食罐（台灣） {id:"native_chicken",label:"⿊⽻⼟雞（溯源鮮⾁）",data:mk("HeroMama","溯源鮮⾁⿊⽻⼟雞主食罐（台 {id:"bass_traceable",label:"⾦⽬鱸⿂（溯源鮮⾁）",data:mk("HeroMama","溯源鮮⾁⾦⽬鱸⿂主食罐（台 {id:"bass_chicken_party",label:"鱸⿂×嫩雞（海陸派對）",data:mk("HeroMama","海陸派對鱸⿂嫩雞主食

] },

"hururu": { label:"Hururu 防禦⼯事", aliases:["hururu","防禦⼯事"], flavors:[ {id:"tuna",label:"鮪⿂魔髮師",data:mk("Hururu 防禦⼯事","鮪⿂魔髮師主食罐（台灣）","8.6/10","g {id:"chicken",label:"雞⾁⼤⼒⼠",data:mk("Hururu 防禦⼯事","雞⾁⼤⼒⼠主食罐（台灣）","8.6/10" {id:"beef",label:"⽜⾁⼤胃王",data:mk("Hururu 防禦⼯事","⽜⾁⼤胃王主食罐（台灣）","8.7/10","g ] },

"meow_servant": {

label:"Meow Servant 喵皇奴", aliases:["meow servant","喵皇奴","meowservant"], flavors:[ {id:"quail_chicken",label:"鵪鶉+雞⾁（經典）",data:mk("Meow Servant 喵皇奴","經典鵪鶉雞⾁主食罐 {id:"salmon_chicken",label:"鮭⿂+雞⾁（經典）",data:mk("Meow Servant 喵皇奴","經典鮭⿂雞⾁主食 {id:"chicken_beef",label:"雞⾁+⽜⾁（經典）",data:mk("Meow Servant 喵皇奴","經典雞⾁⽜⾁主食罐 {id:"pure_chicken",label:"純雞⾁（經典）",data:mk("Meow Servant 喵皇奴","經典純雞⾁主食罐（台灣 {id:"chicken_bsf",label:"雞與⿊⽔虻（虻貓機能）",data:mk("Meow Servant 喵皇奴","虻貓機能雞與⿊ {id:"tuna_bsf",label:"鮪⿂與⿊⽔虻（虻貓機能）",data:mk("Meow Servant 喵皇奴","虻貓機能鮪⿂⿊⽔

] },

"missbebe": {

label:"missbebe 想比比", aliases:["missbebe","想比比"], flavors:[ {id:"chicken",label:"⼘蜂雞⾁",data:mk("missbebe 想比比","⼘蜂雞⾁主食罐（台灣）","8.6/10","g {id:"quail",label:"⼭林鵪鶉⿃",data:mk("missbebe 想比比","⼭林鵪鶉⿃主食罐（台灣）","8.9/10"," {id:"salmon_chicken",label:"鮭⿂雞⾁餐",data:mk("missbebe 想比比","鮭⿂雞⾁餐主食罐（台灣）"," {id:"tuna_chicken",label:"鮪⿂雞⾁",data:mk("missbebe 想比比","鮪⿂雞⾁主食罐（台灣）","8.6/1 {id:"krill_chicken",label:"磷蝦油嫩雞（機能）",data:mk("missbebe 想比比","機能磷蝦油嫩雞主食罐（

] },

"natural10": { label:"Natural10 ⾃然食", aliases:["natural10","⾃然食"], flavors:[ {id:"bass_chicken_soup",label:"鱸⿂濃湯雞⾁",data:mk("Natural10 ⾃然食","嚼世饗宴鱸⿂濃湯雞⾁" {id:"salmon_sauce_frog",label:"鮭⿂濃醬⽥雞",data:mk("Natural10 ⾃然食","嚼世饗宴鮭⿂濃醬⽥雞" {id:"bonito_chicken",label:"鰹⿂雞⾁燒（宵夜場）",data:mk("Natural10 ⾃然食","宵夜場鰹⿂雞⾁燒 {id:"beef_chicken_luna",label:"⽉⾒⽜⾁燒（宵夜場）",data:mk("Natural10 ⾃然食","宵夜場⽉⾒⽜⾁ ] },

"paw_paw_land": { label:"paw paw land ⾁球世界", aliases:["paw paw land","⾁球世界","pawpawland"], flavors:[ {id:"chicken_resveratrol",label:"純雞⾁×⽩藜蘆醇（歪嘴貓）",data:mk("paw paw land ⾁球世界"," {id:"tuna_fucoidan",label:"純鮪⿂×褐藻醣膠（歪嘴貓）",data:mk("paw paw land ⾁球世界","歪嘴貓純 {id:"krill_chicken_cranberry",label:"雞⾁×蔓越莓（南極磷蝦）",data:mk("paw paw land ⾁球世界 {id:"krill_tuna_prebiotics",label:"鮪⿂×益⽣元（南極磷蝦）",data:mk("paw paw land ⾁球世界", ] },

"petcook": { label:"Petcook 派庫廚房", aliases:["petcook","派庫廚房"], flavors:[ {id:"crocodile_chicken",label:"鱷⿂佐雞⾁",data:mk("Petcook 派庫廚房","鱷⿂佐雞⾁主食罐（台灣） {id:"turtle_marlin",label:"鱉⾁佐旗⿂",data:mk("Petcook 派庫廚房","鱉⾁佐旗⿂主食罐（台灣）"," {id:"eel_chicken",label:"鰻⿂佐雞⾁",data:mk("Petcook 派庫廚房","鰻⿂佐雞⾁主食罐（台灣）","9. {id:"shrimp_marlin",label:"蝦仁佐旗⿂",data:mk("Petcook 派庫廚房","蝦仁佐旗⿂主食罐（台灣）"," ] },

"petpaws": { label:"PETPAWS ⽑爪村", aliases:["petpaws","⽑爪村"], flavors:[ {id:"catnip_pumpkin_chicken",label:"南瓜雞（貓薄荷）",data:mk("PETPAWS ⽑爪村","貓薄荷南瓜雞主 {id:"catnip_tuna",label:"鮪⿂（貓薄荷）",data:mk("PETPAWS ⽑爪村","貓薄荷鮪⿂主食罐（台灣）","8 {id:"sturgeon_cranberry",label:"雪鱘龍×蔓越莓（機能慕斯）",data:mk("PETPAWS ⽑爪村","機能慕斯雪 {id:"chicken_green_lipped",label:"鮮嫩雞×綠貽⾙（機能）",data:mk("PETPAWS ⽑爪村","機能鮮嫩雞 ] },

"pet_tomodachi": {

label:"Pet Tomodachi 寵⼼出發", aliases:["pet tomodachi","寵⼼出發","pettomodachi"], flavors:[

{id:"milkfish_chicken",label:"虱⽬⿂雞⾁",data:mk("Pet Tomodachi 寵⼼出發","開這罐虱⽬⿂雞⾁主

{id:"pure_chicken",label:"香嫩鮮雞",data:mk("Pet Tomodachi 寵⼼出發","開這罐香嫩鮮雞主食罐"," {id:"mahi_chicken",label:"⿁頭⼑雞⾁",data:mk("Pet Tomodachi 寵⼼出發","開這罐⿁頭⼑雞⾁主食罐 {id:"salmon_beef",label:"鮭⿂⽜⾁",data:mk("Pet Tomodachi 寵⼼出發","開這罐鮭⿂⽜⾁主食罐","8

] },

"proudpet": { label:"Proudpet 嬌寵醫⽣", aliases:["proudpet","嬌寵醫⽣"], flavors:[ {id:"snail_chicken",label:"⽩⽟蝸⽜+雞⾁",data:mk("Proudpet 嬌寵醫⽣","⽩⽟蝸⽜雞⾁主食罐（台灣 {id:"snail_salmon",label:"⽩⽟蝸⽜+鮭⿂",data:mk("Proudpet 嬌寵醫⽣","⽩⽟蝸⽜鮭⿂主食罐（台灣） {id:"bee_chicken",label:"蜂⼦蛹+雞⾁",data:mk("Proudpet 嬌寵醫⽣","蜂⼦蛹雞⾁主食罐（台灣）"," {id:"bee_salmon",label:"蜂⼦蛹+鮭⿂",data:mk("Proudpet 嬌寵醫⽣","蜂⼦蛹鮭⿂主食罐（台灣）","9 ] },

"push": { label:"Push! 噗滋包", aliases:["push!","噗滋包","push"], flavors:[ {id:"happy_y",label:"貪吃⼩嘴Y（HAPPY機能）",data:mk("Push! 噗滋包","HAPPY機能貪吃⼩嘴Y主食罐" {id:"flagship_duck_cod",label:"鴨⾁鱈⿂（旗艦）",data:mk("Push! 噗滋包","旗艦鴨⾁鱈⿂主食罐"," {id:"flagship_salmon_tuna",label:"鮭⿂鮪⿂（旗艦）",data:mk("Push! 噗滋包","旗艦鮭⿂鮪⿂主食罐 {id:"flagship_chicken",label:"雞⾁（旗艦）",data:mk("Push! 噗滋包","旗艦雞⾁主食罐","8.7/10", ] },

"mao_zhou": { label:"⽑孩⾈⾈", aliases:["⽑孩⾈⾈","⾈⾈"], flavors:[ {id:"chicken_guava_seaweed",label:"雞⾁+芭樂+海藻",data:mk("⽑孩⾈⾈","開罐罐罐雞⾁芭樂海藻主食 {id:"chicken_marlin_oat",label:"雞⾁+旗⿂+燕麥+薑黃",data:mk("⽑孩⾈⾈","開罐罐罐雞⾁旗⿂燕麥薑 {id:"tuna_scallop_cucumber",label:"鮪⿂+⼲⾙+⼤黃瓜",data:mk("⽑孩⾈⾈","開罐罐罐鮪⿂⼲⾙⼤黃瓜 {id:"tuna_coix_pumpkin",label:"鮪⿂+薏仁+南瓜",data:mk("⽑孩⾈⾈","開罐罐罐鮪⿂薏仁南瓜主食罐（ ] },

"trilogy": {

label: "TRILOGY 奇境", aliases: ["trilogy","奇境","trilogy奇境"], flavors: [ {id:"tuna_chicken_soup", label:"野⽣鮪⿂燉雞湯", data:mk( "TRILOGY 奇境","野⽣鮪⿂燉雞湯主食罐（紐⻄蘭）","8.8/10","g","82%",1,"g", [tg("紐⻄蘭製","g"),tg("無穀無膠","g"),tg("⾼⾁量","g")], [rk("膠類","完全無添加膠類","g"),rk("誘食劑","無⼈⼯誘食劑","g")], {water:78,protein:12,fat:5,phos:0.21,calcium:0.26,sodium:0.27,magnesium:0.019,ash:2.1 [ig("鮪⿂","動物蛋⽩","g","優質⿂⾁蛋⽩，富含Omega-3，護眼護膚"),ig("雞⾁","動物蛋⽩","g","輔助 "pass","紐⻄蘭製無穀無膠，鮪⿂燉雞湯⼝感佳，成分乾淨","鮪⿂燉雞湯，無膠乾淨")}, {id:"mackerel_chicken_soup", label:"野⽣鯖⿂燉雞湯", data:mk( "TRILOGY 奇境","野⽣鯖⿂燉雞湯主食罐（紐⻄蘭）","8.9/10","g","82%",1,"g", [tg("紐⻄蘭製","g"),tg("⾼Omega-3","g"),tg("無穀無膠","g")], [rk("膠類","完全無添加膠類","g"),rk("誘食劑","無⼈⼯誘食劑","g")], {water:78,protein:12,fat:5.5,phos:0.22,calcium:0.27,sodium:0.27,magnesium:0.020,ash:2 [ig("鯖⿂","動物蛋⽩","g","富含Omega-3及DHA，護眼護⼼護膚⾸選"),ig("雞⾁","動物蛋⽩","g","補充 "pass","鯖⿂⾼Omega-3，護眼護⼼效果佳，紐⻄蘭製無膠","鯖⿂⾼Omega-3，護⼼⾸選")}, {id:"chicken_broth", label:"牧場純雞燉雞⾁", data:mk( "TRILOGY 奇境","牧場純雞燉雞⾁主食罐（紐⻄蘭）","8.7/10","g","85%",1,"g", [tg("紐⻄蘭製","g"),tg("純雞⾁","g"),tg("無穀無膠","g")], [rk("膠類","完全無添加膠類","g"),rk("誘食劑","無⼈⼯誘食劑","g")], {water:80,protein:11,fat:4.5,phos:0.20,calcium:0.25,sodium:0.26,magnesium:0.018,ash:2 [ig("雞⾁","動物蛋⽩","g","純雞⾁低過敏，適⼝性⾼"),ig("雞湯","⽔分","g","純雞湯基底，補充⽔分") "pass","純雞⾁無穀無膠，適合挑嘴貓及腸胃敏感貓咪","純雞燉⾁，清爽低敏")},

]

} };

// ───────────────────────────────────────────────────────── // SEARCH LOGIC // ───────────────────────────────────────────────────────── function searchBrands(query, brandsDb) {

const db = brandsDb || BRANDS; const q = query.toLowerCase().trim(); // check each brand for (const [key, brand] of Object.entries(db)) { for (const alias of brand.aliases) { if (q === alias || q.startsWith(alias) || alias.startsWith(q.split(" ")[0])) { // check if query also contains a flavor hint const flavorHint = q.replace(alias, "").trim(); if (flavorHint) { // try to match flavor const matchedFlavor = brand.flavors.find(f => flavorHint.includes(f.label.toLowerCase()) || f.label.toLowerCase().includes(flavorHint) || f.id.includes(flavorHint) ); if (matchedFlavor) return { type: "direct", data: matchedFlavor.data, brand };

} if (brand.flavors.length === 1) return { type: "direct", data: brand.flavors[0].data, return { type: "brand", brand, key };

}

}

} // fallback: fuzzy token search

const tokens = q.split(/\s+/);

for (const [key, brand] of Object.entries(db)) {

for (const alias of brand.aliases) { if (tokens.some(t => t.length > 1 && (alias.includes(t) || t.includes(alias)))) { if (brand.flavors.length === 1) return { type: "direct", data: brand.flavors[0].data, return { type: "brand", brand, key };

}

}

} return null;

}

// ───────────────────────────────────────────────────────── // NUTRITION LOGIC // ───────────────────────────────────────────────────────── const NUTR_DEF = [

{key:"water",name:"⽔分",unit:"%"},{key:"protein",name:"蛋⽩質",unit:"%"},

{key:"fat",name:"脂肪",unit:"%"},{key:"phos",name:"磷（P）",unit:"%"},

{key:"calcium",name:"鈣（Ca）",unit:"%"},{key:"sodium",name:"鈉（Na）",unit:"%"},

{key:"magnesium",name:"鎂（Mg）",unit:"%"},{key:"ash",name:"灰分（Ash）",unit:"%"}, ]; const REF = {water:"70–85%",protein:"10–16%",fat:"4–8%",phos:"0.12–0.25%",calcium:"0.15–0.35% const BAR_MAX = {water:100,protein:20,fat:12,phos:0.5,calcium:0.6,sodium:0.8,magnesium:0.07,a

function lamp(key, v) {

let c; if(key==="water") else if(key==="protein") else if(key==="fat") else if(key==="phos") else if(key==="calcium") else if(key==="sodium")

c=v>=70&&v<=85?

"

g"

:v>=65&&v<=88?

"

a"

:v>=8&&v<=18?

:"

r"

;

c=v>=10&&v<=16?

"

g"

g"

:v>=3&&v<=10?

:v<=0.35?

"

a"

:"

r"

"

"

a"

a"

:"

:"

r"

r"

;

r"

;

;

;

c=v>=4&&v<=8?

c=v<=0.25?

"

g"

c=v>=0.15&&v<=0.35?

c=v>=0.2&&v<=0.5?

"

g"

"

"

;

g"

:v<=0.5?

"

a"

a"

:"

:"

:v<=0.6?

"

r"

else if(key==="magnesium") c=v>=0.02&&v<=0.035?"g":v<=0.05?"a":"r";

else if(key==="ash")

else c="g";

c=v>=1.5&&v<=3.0?

"

g"

:v<=3.5?

"

a"

:"

r"

;

return {cls:c, label:{g:"正常",a:"注意",r:"偏⾼"}[c]};

} function bPct(key, v) { return Math.min(100, Math.round((v/(BAR_MAX[key]||1))*100)); } function spGroups(N) {

const ph=N.phos||0, na=N.sodium||0, mg=N.magnesium||0;

return [ ph>0.35?{name:"腎臟病貓",cls:"fail",icon:" na>0.6?{name:"⼼臟病貓",cls:"fail",icon:" mg>0.05?{name:"泌尿問題",cls:"fail",icon:" ];

} function calcGrade(lamps) {

",status:"不建議",reason:"磷 >0.35%"}:ph>0.25?{n ",status:"不建議",reason:"鈉 >0.6%"}:na>0.5?{name ",status:"不建議",reason:"鎂 >0.05%"}:mg>0.04?{n

const r=lamps.filter(x=>x==="r").length, a=lamps.filter(x=>x==="a").length;

if(r>=3)return{g:"C",cls:"r"}; if(r===2)return{g:"C+",cls:"r"}; if(r===1&&a>=2)return{g:"B",cls:"a"}; if(r===1)return{g:"B+",cls:"a"}; if(a>=3)return{g:"B+",cls:"a"}; if(a>=1)return{g:"A",cls:"g"}; return{g:"A+",cls:"g"};

}

// ───────────────────────────────────────────────────────── // ICONS // ───────────────────────────────────────────────────────── const IC = {

search:(sz=18,c="#fff")=>(<svg width={sz} height={sz} viewBox="0 0 20 20" fill="none" strok

chart:(sz=15,c=P.muted)=>(<svg width={sz} height={sz} viewBox="0 0 18 18" fill="none" strok shield:(sz=15,c=P.muted)=>(<svg width={sz} height={sz} viewBox="0 0 18 18" fill="none" stro

eye:(sz=15,c=P.muted)=>(<svg width={sz} height={sz} viewBox="0 0 20 14" fill="none" stroke=

star:(sz=14,c=P.aText)=>(<svg width={sz} height={sz} viewBox="0 0 16 16" fill="none" stroke brain:(sz=16,c=P.muted)=>(<svg width={sz} height={sz} viewBox="0 0 22 22" fill="none" strok

dna:(sz=15,c=P.muted)=>(<svg width={sz} height={sz} viewBox="0 0 18 18" fill="none" stroke=

bolt:(sz=12,c=P.aText)=>(<svg width={sz} height={sz} viewBox="0 0 14 16" fill="none" stroke check:(sz=12,c=P.gText)=>(<svg width={sz} height={sz} viewBox="0 0 14 14" fill="none" strok warnIc:(sz=12,c=P.aText)=>(<svg width={sz} height={sz} viewBox="0 0 14 14" fill="none" stro cross:(sz=12,c=P.rText)=>(<svg width={sz} height={sz} viewBox="0 0 14 14" fill="none" strok }; function SIcon({cls,sz=12}){ if(cls==="g"||cls==="ok") return IC.check(sz,P.gText); if(cls==="a"||cls==="warn") return IC.warnIc(sz,P.aText); return IC.cross(sz,P.rText); }

// ───────────────────────────────────────────────────────── // UI ATOMS // ───────────────────────────────────────────────────────── function StatusTag({text,cls}){const c=ST[cls];return( <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 13px",borderRadi

<SIcon cls={cls} sz={12}/> {text}

</span> );} function LampBadge({cls,label}){const c=ST[cls];return(

<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadi

<SIcon cls={cls} sz={11}/> {label}

</span> );} function SecLabel({icon,children}){return(

<div style={{display:"flex",alignItems:"center",gap:7,marginBottom:14}}>

{icon}<span style={{fontSize:10,fontWeight:700,letterSpacing:"0.13em",color:P.muted,textT </div> );} function Card({children,style={}}){return(

<div style={{background:P.card,borderRadius:20,border:`1px solid ${P.border}`,padding:"1.25 );} function HR(){return <div style={{height:1,background:P.block,margin:"12px 0"}}/>;} // ───────────────────────────────────────────────────────── // FLAVOR PICKER // ───────────────────────────────────────────────────────── function FlavorPicker({brand, selectedId, onSelect}){ return(

<Card style={{marginBottom:"0.875rem"}}>

<div style={{fontSize:11,color:P.muted,letterSpacing:"0.1em",marginBottom:10,fontWeight {brand.label} </div> <div style={{

display:"flex", gap:8, flexWrap:"nowrap",

overflowX:"auto", paddingBottom:4,

scrollbarWidth:"none", msOverflowStyle:"none", }}>

{brand.flavors.map(f => {

const sel = selectedId === f.id; return(

<button key={f.id} onClick={()=>onSelect(f)} style={{

flexShrink:0, padding:"8px 18px", borderRadius:99, border:"none", cursor:"pointer", fontSize:13, fontWeight:sel?600:400, background: sel ? P.btnTo : P.block, color: sel ? "#fff" : P.ink, transition:"all 0.15s", boxShadow: sel ? "0 3px 10px rgba(232,168,124,0.35)" : "none", }}>{f.label}</button>

);

})}

</div>

</Card> );

}

// ───────────────────────────────────────────────────────── // TABS // ───────────────────────────────────────────────────────── const TABS = [

{id:"ingredients",label:"成分",icon:" "},

{id:"nutrition",label:"營養",icon:" "},

{id:"benefits",label:"功效",icon:" "}, ]; function TabBar({active,onChange}){return(

<div style={{background:P.card,borderRadius:99,padding:4,display:"flex",gap:2,marginBottom:

{TABS.map(t=>{const on=active===t.id;return(

<button key={t.id} onClick={()=>onChange(t.id)} style={{

flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5, padding:"9px 8px",borderRadius:99,border:"none",cursor:"pointer", background:on?"#FFFFFF":"transparent",color:on?P.ink:P.muted, fontSize:13,fontWeight:on?600:400, boxShadow:on?"0 2px 8px rgba(74,58,48,0.10)":"none",transition:"all 0.18s", }}><span style={{fontSize:14}}>{t.icon}</span><span>{t.label}</span></button> );})} </div> );}

// Dot color per category const CAT_DOT = { "動物蛋⽩":"#C2574A", "器官⾁":"#C2574A", "內臟":"#C2574A", "脂肪":"#D4A84B", "蔬果":"#5A9A6A", "植物":"#5A9A6A", "益⽣元":"#5A9A6A", "補充劑":"#6B8FBA", "礦物質來源":"#6B8FBA", "添加劑":"#A8A09A", "增稠劑":"#A8A09A", "碳⽔":"#A8A09A", "⽔分":"#7BBFD4", "誘食劑":"#C28A4A", }; function catDot(cat){ return CAT_DOT[cat] || P.muted; }

function TabIngredients({data}){

return(<div> <Card> <SecLabel icon={IC.shield(15,P.muted)}>安全評估</SecLabel>

<div style={{display:"flex",flexDirection:"column",gap:8}}>

{data.risks.map((r,i)=>{const c=ST[r.cls];

// Simplify text: show "無添加" for clean items, keep detail for warnings/risks

const displayText = r.cls==="g" ? "無添加" : r.text;

return(

<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",

<span style={{flexShrink:0}}><SIcon cls={r.cls} sz={13}/></span>

<span style={{fontWeight:600}}>{r.cat}</span> <span style={{opacity:.75,fontSize:12}}>{displayText}</span> </div> );})} </div>

</Card> <Card> <SecLabel icon={IC.dna(15,P.muted)}>成分解析</SecLabel>

<div style={{display:"flex",flexDirection:"column",gap:0}}>

{data.ingredients.map((ing,i)=>{

const dot = catDot(ing.category); const isLast = i === data.ingredients.length - 1; return(

<div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px

<div style={{width:8,height:8,borderRadius:"50%",background:dot,flexShrink:0,ma <div style={{flex:1,minWidth:0}}> <div style={{display:"flex",alignItems:"center",justifyContent:"space-between <span style={{fontSize:14,fontWeight:700,color:P.ink}}>{ing.name}</span> <span style={{fontSize:10,padding:"3px 9px",borderRadius:99,background:P.bl </div> <div style={{fontSize:12,color:P.muted,lineHeight:1.5}}>{ing.role}</div> </div> </div>

);

})}

</div>

</Card> </div>);

}

function TabNutrition({data}){

const N=data.nutrients;

const lamps=NUTR_DEF.map(d=>lamp(d.key,N[d.key]||0).cls); const capr=N.calcium&&N.phos?(N.calcium/N.phos).toFixed(2):null; const caprCls=capr?(parseFloat(capr)>=1.1&&parseFloat(capr)<=1.3?"g":parseFloat(capr)>=0.9& const macros=[ {label:"動物蛋⽩",pct:parseInt(data.meatPercent)||0,color:"#A8D5BA"},

{label:"脂肪",pct:Math.round((N.fat||0)/12*100),color:"#E8A87C"},

{label:"⽔分",pct:N.water||0,color:"#7BBFD4"},

{label:"礦物質",pct:Math.round((N.ash||0)/5*100),color:"#C4A8D5"},

]; return(<div>

<Card> <SecLabel icon={IC.chart(15,P.muted)}>主要營養分佈</SecLabel> {macros.map((m,i)=>( <div key={i} style={{display:"grid",gridTemplateColumns:"60px 1fr 40px",alignItems:"c <span style={{fontSize:12,color:P.ink,fontWeight:600}}>{m.label}</span>

<div style={{background:P.block,borderRadius:99,height:7,overflow:"hidden"}}>

<div style={{width:`${Math.min(m.pct,100)}%`,height:"100%",background:m.color,bor </div>

<span style={{fontSize:12,color:P.muted,textAlign:"right"}}>{Math.min(m.pct,100)}%<

</div> ))} </Card> <Card> <SecLabel icon={IC.chart(15,P.muted)}>營養素分析（as-fed）</SecLabel> {NUTR_DEF.map((def,i)=>{

const v=N[def.key]||0;const lp=lamp(def.key,v);const pct=bPct(def.key,v);

const dv=v<0.1?v.toFixed(3):v<1?v.toFixed(2):v.toFixed(1);

return(

<div key={def.key} style={{display:"grid",gridTemplateColumns:"88px 52px 80px 1fr a <span style={{fontSize:12,fontWeight:600,color:P.ink}}>{def.name}</span> <span style={{fontSize:12,color:P.ink}}>{dv}{def.unit}</span> <span style={{fontSize:10,color:P.muted}}>{REF[def.key]}</span> <div style={{background:P.block,borderRadius:99,height:5,overflow:"hidden"}}>

<div style={{width:`${pct}%`,height:"100%",background:BAR_CLR[lp.cls],borderRad </div> <LampBadge {...lp}/> </div> ); })} {capr&&( <div style={{marginTop:10,padding:"8px 0 0 0",borderTop:`1px solid ${P.block}`,fontSi <span style={{color:P.muted}}>鈣磷比（Ca:P）=</span>

<span style={{color:caprCls==="r"?"#9B3A3A":P.muted}}>{capr}</span>

</div> )} </Card> <Card> <SecLabel icon={IC.eye(15,P.muted)}>特殊族群適⽤性</SecLabel>

<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>

{spGroups(N).map(sp=>{const c=ST[sp.cls];return(

<div key={sp.name} style={{borderRadius:16,padding:"14px 10px",textAlign:"center",b

<div style={{fontSize:20,marginBottom:6}}>{sp.icon}</div> <div style={{fontSize:11,fontWeight:700,color:c.text,marginBottom:3}}>{sp.name}</

<div style={{display:"flex",justifyContent:"center",gap:4,alignItems:"center",mar

<SIcon cls={sp.cls} sz={11}/>

<span style={{fontSize:11,color:c.text,fontWeight:500}}>{sp.status}</span> </div> <div style={{fontSize:10,color:c.text,opacity:.7}}>{sp.reason}</div>

</div>

);})}

</div>

</Card> </div>);

}

function TabBenefits({data}){

const N=data.nutrients;

const ings=data.ingredients.map(i=>i.name.toLowerCase()); const has=(kw)=>ings.some(n=>n.includes(kw)); // Conclusion chips - no numbers, only qualitative descriptions const capr = N.calcium&&N.phos ? N.calcium/N.phos : null; const items=[

{icon:" ",title:"護眼健康",chips:[ "⽜磺酸", has("肝")?"維⽣素A":"", has("⿂油")||has("鮭⿂")?"DHA / EPA":"", ].filter(Boolean)}, {icon:" ",title:"腸道健康",chips:[ has("益⽣")?"益⽣菌":"", has("南瓜")||has("菊苣")||has("蔬")?"膳食纖維":"", has("菊苣")?"益⽣元":"", ].filter(Boolean).length?[ has("益⽣")?"益⽣菌":"", has("南瓜")||has("菊苣")||has("蔬")?"膳食纖維":"", has("菊苣")?"益⽣元":"", ].filter(Boolean):["成分未特別標⽰"]}, {icon:" ",title:"免疫健康",chips:[ "維⽣素E", has("鋅")?"鋅":"", has("⿂油")||has("鮭⿂")?"Omega-3":"", ].filter(Boolean)}, {icon:" ",title:"⼼臟健康",chips:[ "⽜磺酸", has("⼼")?"輔酶Q10":"",

N.sodium<=0.5?"鈉含量適中":"鈉偏⾼注意",

].filter(Boolean)}, {icon:" ",title:"腦部發展",chips:[

has("⿂油")||has("鮭⿂")?"DHA / EPA":"建議補充⿂油", ].filter(Boolean)}, {icon:" ",title:"骨骼健康",chips:[

capr&&capr>=1.1&&capr<=1.3?"鈣磷比例均衡":capr&&capr<1.1?"鈣磷比偏低":capr?"鈣磷比偏⾼":"",

N.phos<=0.25?"磷含量適中":N.phos<=0.35?"磷偏⾼注意":"⾼磷需謹慎", ].filter(Boolean)}, {icon:" ",title:"⽪膚⽑髮",chips:[

has("⿂油")||has("鮭⿂")?"Omega-3":"",

"維⽣素E",

has("葵花")||has("椰⼦")?"Omega-6":"", ].filter(Boolean)}, {icon:" ",title:"泌尿道健康",chips:[

N.magnesium<=0.035?"礦物質適中":N.magnesium<=0.05?"鎂偏⾼注意":"⾼鎂需謹慎",

N.water>=78?"⽔分充⾜":N.water>=70?"⽔分適中":"⽔分偏低",

has("蛋胺")||has("methio")?"DL-蛋胺酸":"", ].filter(Boolean)}, {icon:" ",title:"體重控制",chips:[

N.fat<=6?"低脂":N.fat<=8?"脂肪適中":"脂肪偏⾼",

N.protein>=12?"⾼蛋⽩":N.protein>=10?"蛋⽩適中":"蛋⽩偏低", ].filter(Boolean)}, {icon:" ",title:"抗氧化",chips:[ "維⽣素E", has("蔬")||has("南瓜")||has("莓")||has("蘋果")?"天然蔬果植化素":"", ].filter(Boolean)}, ]; return( <Card> <SecLabel icon={IC.star(14,P.muted)}>功效總覽</SecLabel> {items.map((b,i)=>( <div key={i} style={{borderRadius:14,padding:"12px 14px",background:P.bg,border:`1px

<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>

<span style={{fontSize:17}}>{b.icon}</span> <span style={{fontSize:13,fontWeight:700,color:P.ink}}>{b.title}</span> </div>

<div style={{display:"flex",flexWrap:"wrap",gap:6}}>

{b.chips.map((chip,j)=>(

<span key={j} style={{

fontSize:12,padding:"4px 12px",borderRadius:99, background:P.card,border:`1px solid ${P.border}`,color:P.ink, }}>{chip}</span> ))}

</div>

</div>

))}

</Card> );

}

// ───────────────────────────────────────────────────────── // STORAGE HOOK // ───────────────────────────────────────────────────────── // ───────────────────────────────────────────────────────── // INDEXED DB STORAGE (iOS PWA safe, no 7-day expiry) // ───────────────────────────────────────────────────────── const DB_NAME = "koimiao_db"; const DB_VER = 1; const STORE = "kv";

function openDB(){

return new Promise((res,rej)=>{ const req = indexedDB.open(DB_NAME, DB_VER); req.onupgradeneeded = e => e.target.result.createObjectStore(STORE); req.onsuccess = e => res(e.target.result); req.onerror = e => rej(e.target.error); });

} async function idbGet(key){

const db = await openDB(); return new Promise((res,rej)=>{

const tx = db.transaction(STORE,"readonly");

const req = tx.objectStore(STORE).get(key); req.onsuccess = ()=>res(req.result);

req.onerror = e=>rej(e.target.error);

}); } async function idbSet(key,val){

const db = await openDB(); return new Promise((res,rej)=>{

const tx = db.transaction(STORE,"readwrite");

const req = tx.objectStore(STORE).put(val,key); req.onsuccess = ()=>res();

req.onerror = e=>rej(e.target.error);

});

} async function idbGetAll(){

const db = await openDB(); return new Promise((res,rej)=>{

const tx = db.transaction(STORE,"readonly");

const store = tx.objectStore(STORE); const keys = [], vals = []; store.openCursor().onsuccess = e=>{ const cur = e.target.result; if(cur){ keys.push(cur.key); vals.push(cur.value); cur.continue(); } else res({keys,vals}); }; });

}

function useStorage(key, initial) {

const [data, setData] = useState(initial); const [ready, setReady] = useState(false); useState(() => {

(async () => {

try {

const val = await idbGet(key);

if (val !== undefined) {

const parsed = JSON.parse(val); if (Array.isArray(parsed) || typeof parsed === 'object') setData(parsed);

} } catch(e) { // Fallback to localStorage try { const ls = localStorage.getItem(key); if(ls){ const parsed=JSON.parse(ls); setData(parsed); } } catch(_){}

} setReady(true); })(); }); const save = async (val) => { setData(val); try { await idbSet(key, JSON.stringify(val)); } catch(e) { try { localStorage.setItem(key, JSON.stringify(val)); } catch(_){} } }; return [data, save, ready];

}

// ───────────────────────────────────────────────────────── // SHARED UI // ─────────────────────────────────────────────────────────

function PageHeader({title,onAdd,addLabel="新增"}){return(

<div style={{background:P.card,padding:"1.25rem 1.25rem 1rem",borderBottom:`1px solid ${P.b <span style={{fontSize:17,fontWeight:700,color:P.ink}}>{title}</span> {onAdd&&<button onClick={onAdd} style={{display:"flex",alignItems:"center",gap:addLabel?5

<span style={{fontSize:addLabel?16:22,lineHeight:1}}>+</span> {addLabel}

</button>} </div> );}

function Field({label,children}){return( <div style={{marginBottom:14}}> <div style={{fontSize:11,color:P.muted,fontWeight:600,letterSpacing:"0.08em",marginBottom {children} </div> );}

function Input({value,onChange,placeholder,type="text"}){return(

<input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={pl style={{width:"100%",padding:"11px 14px",borderRadius:13,border:`1.5px solid ${P.border}` );}

function ImageUpload({value,onChange,placeholder="點擊上傳照片"}){

const ref = useState(null); const handle = (e) => {

const file = e.target.files[0];

if (!file) return; const reader = new FileReader(); reader.onload = ev => onChange(ev.target.result); reader.readAsDataURL(file); }; return( <div onClick={()=>document.getElementById('img-upload-'+placeholder).click()} style={{width:"100%",height:140,borderRadius:16,border:`2px dashed ${P.border}`,backgro {value

? <img src={value} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>

: <div style={{textAlign:"center",color:P.muted}}>

<div style={{fontSize:28,marginBottom:6}}> </div> <div style={{fontSize:12}}>{placeholder}</div> </div>

}

<input id={'img-upload-'+placeholder} type="file" accept="image/*" onChange={handle} st

</div> );

}

function Modal({title,onClose,onSave,saveLabel="儲存",children}){return(

<div style={{position:"fixed",inset:0,background:"rgba(74,58,48,0.45)",zIndex:200,display:"

<div style={{background:P.bg,borderRadius:"24px 24px 0 0",width:"100%",maxHeight:"90vh",o

<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBo

<span style={{fontSize:16,fontWeight:700,color:P.ink}}>{title}</span> <button onClick={onClose} style={{border:"none",background:P.block,borderRadius:99,wi </div> {children}

<div style={{display:"flex",gap:10,marginTop:20}}>

<button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:99,border:`1px s

<button onClick={onSave} style={{flex:1,padding:"12px",borderRadius:99,border:"none",

</div> </div> </div> );}

function EmptyState({icon,title,sub}){return(

<div style={{padding:"3rem 1.5rem",textAlign:"center"}}>

<div style={{fontSize:44,marginBottom:12}}>{icon}</div> <div style={{fontSize:16,fontWeight:700,color:P.ink,marginBottom:6}}>{title}</div> <div style={{fontSize:13,color:P.muted,lineHeight:1.6}}>{sub}</div> </div> );}

// ───────────────────────────────────────────────────────── // CATS PAGE // ───────────────────────────────────────────────────────── const CARE_CATS = [ {group:"醫療保健",items:["疫苗","驅蟲","體檢","洗澡"]}, {group:"清潔保養",items:["換貓砂","洗貓砂盆","洗玩具⽤品"]}, ]; function calcAge(birthday){ if(!birthday) return null; const birth = new Date(birthday); const now = new Date(); let years = now.getFullYear() - birth.getFullYear(); let months = now.getMonth() - birth.getMonth(); if(now.getDate() < birth.getDate()) months--; if(months < 0){ years--; months += 12; } if(years < 0) return null; if(years === 0) return months + " 個⽉"; if(months === 0) return years + " 歲"; return years + " 歲 " + months + " 個⽉";

} const BLANK_CAT = {id:"",name:"",weight:"",birthday:"",chip:"",photo:"",records:[]}; const BLANK_REC = {id:"",type:"",date:"",note:"",photos:[]};

// ───────────────────────────────────────────────────────── // SWIPE RECORD ROW (updated) // ───────────────────────────────────────────────────────── const REC_ICONS = {"疫苗":" ","驅蟲":" ","體檢":" ","洗澡":"

// Days-ago helper function daysAgo(dateStr){

","換貓砂":"

","洗貓砂盆":"

",

if(!dateStr) return ""; const d = Math.floor((new Date() - new Date(dateStr))/(1000*60*60*24)); if(d===0) return ""; if(d===1) return "昨天"; if(d<0) return ""; return d+"天前";

}

// Lightbox function Lightbox({photos,index,onClose}){

const [cur, setCur] = useState(index); return(

<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIn

<div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:480,padding:"0 16px

<img src={photos[cur]} style={{width:"100%",borderRadius:12,objectFit:"contain",maxHe

{photos.length>1&&(

<div style={{display:"flex",justifyContent:"center",gap:6,marginTop:12}}>

{photos.map((_,i)=>( <div key={i} onClick={()=>setCur(i)} style={{width:8,height:8,borderRadius:"50% ))} </div> )}

<button onClick={onClose} style={{position:"absolute",top:-40,right:16,border:"none",

</div> </div> );

}

// Record Detail Page function RecordDetailPage({rec,catName,onBack,onEdit,onDelete}){

const [lightbox,setLightbox] = useState(null);

const photos = rec.photos||[]; return(

<div style={{background:P.bg,minHeight:"100vh",paddingBottom:40}}>

{/* Nav */} <div style={{background:P.card,borderBottom:`1px solid ${P.border}`,padding:"0 16px",di

<button onClick={onBack} style={{border:"none",background:"none",fontSize:18,color:P.

<span style={{fontSize:16,fontWeight:700,color:P.ink}}>{rec.type}</span>

<div style={{display:"flex",gap:4}}>

<button onClick={onEdit} style={{border:"none",background:"none",fontSize:16,cursor <button onClick={()=>{if(window.confirm("確定刪除此紀錄？")){onDelete();}}} style={{bo </div> </div>

<div style={{padding:"20px 16px"}}>

{/* Header card */}

<div style={{background:P.card,borderRadius:20,padding:"18px",marginBottom:16}}>

<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>

<span style={{fontSize:32}}>{REC_ICONS[rec.type]||" "}</span>

<div> <div style={{fontSize:20,fontWeight:800,color:P.ink}}>{rec.type}</div> <div style={{fontSize:13,color:P.muted,marginTop:2}}>{rec.date}　{daysAgo(rec.da </div> </div> {catName&&( <div style={{fontSize:12,color:P.muted,paddingTop:10,borderTop:`1px solid ${P.blo )} </div> {/* Note */} {rec.note&&(

<div style={{background:P.card,borderRadius:20,padding:"16px 18px",marginBottom:16}

<div style={{fontSize:11,color:P.muted,marginBottom:8,fontWeight:600,letterSpacin <div style={{fontSize:14,color:P.ink,lineHeight:1.7}}>{rec.note}</div> </div> )} {/* Photos */} {photos.length>0&&(

<div style={{background:P.card,borderRadius:20,padding:"16px 18px"}}>

<div style={{fontSize:11,color:P.muted,marginBottom:12,fontWeight:600,letterSpaci

<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>

{photos.map((p,i)=>( <div key={i} onClick={()=>setLightbox(i)} style={{aspectRatio:"1",borderRadiu

<img src={p} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/

</div> ))} </div> </div> )} </div> {lightbox!==null&&<Lightbox photos={photos} index={lightbox} onClose={()=>setLightbox(n </div> );

}

function SwipeRecord({rec, onEdit, onDelete, catName=null, catPhoto=null, allCats=[]}){

const [offsetX, setOffsetX] = useState(0);

const [startX, setStartX] = useState(null);

const [moved, setMoved] = useState(false);

const [expanded, setExpanded] = useState(false);

const REVEAL = 100;

const onTouchStart = (e) => { setStartX(e.touches[0].clientX); setMoved(false); }; const onTouchMove = (e) => {

if(startX===null) return;

const dx = e.touches[0].clientX - startX;

if(Math.abs(dx)>4) setMoved(true);

if(dx < 0) setOffsetX(Math.max(-REVEAL, dx)); }; const onTouchEnd = () => {

setOffsetX(offsetX < -REVEAL/2 ? -REVEAL : 0);

setStartX(null); }; const handleTap = () => {}; // detail page removed per request const close = () => setOffsetX(0);

const photos = rec.photos||[];

return(

<div style={{position:"relative",marginBottom:8,borderRadius:16,overflow:"hidden"}}>

{/* Swipe actions */}

<div style={{position:"absolute",right:0,top:0,bottom:0,display:"flex",alignItems:"stre

<button onClick={()=>{close();onEdit();}} style={{flex:1,border:"none",background:P.a

<button onClick={()=>{close();onDelete();}} style={{flex:1,border:"none",background:P

</div> {/* Card */} <div

onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onClick={handleTap} style={{

background:P.card,border:`1px solid ${P.border}`,padding:"12px 14px",borderRadius:1

minHeight:80,

transform:`translateX(${offsetX}px)`,

transition:startX===null?"transform 0.22s ease":"none",

borderRadius:16,position:"relative",zIndex:1,cursor:"pointer", }}

> <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:photos.length

<span style={{fontSize:18,flexShrink:0,marginTop:1}}>{REC_ICONS[rec.type]||" "}</s

<div style={{flex:1,minWidth:0}}>

<div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>

<span style={{fontSize:13,fontWeight:600,color:P.ink}}>{rec.type}</span> {(rec.catIds||[]).length>0&&(

<div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}}>

{(rec.catIds||[]).map(cid=>{

const cat = allCats.find(c=>c.id===cid); return cat?(

<div key={cid} style={{width:22,height:22,borderRadius:"50%",overflow:"

{cat.photo?<img src={cat.photo} style={{width:"100%",height:"100%",ob

</div> ):null; })} </div> )} </div> <div style={{fontSize:11,color:P.muted,marginTop:2}}>{rec.date}</div> {rec.note&&( <div style={{marginTop:4,minHeight:18,minWidth:0}}> {expanded ? <div style={{fontSize:12,color:P.muted,lineHeight:1.6,whiteSpace:"pre-wra {rec.note}

<span onClick={e=>{e.stopPropagation();setExpanded(false);}} style={{co

</div> : (()=>{

const firstLine = rec.note.split('\n')[0];

const hasMore = rec.note.includes('\n') || firstLine.length > 15;

const preview = firstLine.length > 15 ? firstLine.slice(0,15) : firstLi return( <div style={{fontSize:12,color:P.muted,lineHeight:1.5}}> {preview}{hasMore&&<>…<span onClick={e=>{e.stopPropagation();setExp </div> ); })()

} </div> )} </div> {photos.length>0&&<span style={{fontSize:11,color:P.muted,flexShrink:0}}> </div> {catName&&( <div style={{display:"flex",alignItems:"center",gap:5,paddingLeft:28,marginBottom:4 <div style={{width:16,height:16,borderRadius:"50%",overflow:"hidden",background:P

{photos

{catPhoto?<img src={catPhoto} style={{width:"100%",height:"100%",objectFit:"cov

</div> <span style={{fontSize:10,color:P.muted}}>{catName}</span> </div> )} {/* Photo thumbnails — max 3 + overflow */} {photos.length>0&&(

<div style={{display:"flex",gap:6,paddingLeft:28}}>

{photos.slice(0,3).map((p,i)=>(

<div key={i} style={{width:52,height:52,borderRadius:8,overflow:"hidden",flexSh

<img src={p} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>

</div> ))} {photos.length>3&&(

<div style={{width:52,height:52,borderRadius:8,background:P.block,display:"flex

<span style={{fontSize:12,color:P.muted}}>+{photos.length-3}</span> </div> )}

</div>

)}

</div>

</div> );

}

function CatsPage(){

const [cats, saveCats, ready] = useStorage("cats_v1", []);

const [selected, setSelected] = useState(null);

const [editPage, setEditPage] = useState(null); // null | {mode:"add"|"edit", form:{...}}

const selCat = cats.find(c=>c.id===selected) || null;

// ── Record state ──

const [recModal, setRecModal] = useState(null);

const [recForm, setRecForm] = useState({id:"",type:"",date:"",note:"",photos:[]});

const [editRecId, setEditRecId] = useState(null);

const [detailRec, setDetailRec] = useState(null);

const openAddRec = () => { const defaultCatId = cats.length===1 ? cats[0].id : (selected||null); setRecForm({id:Date.now()+"",type:"",date:new Date().toISOString().slice(0,10),note:"",ph setEditRecId(null); setRecModal(true); }; const openEditRec = (rec) => { setRecForm({...rec,photos:rec.photos||[],catIds:rec.catIds|| const saveRec = () => {

const targetIds = recForm.catIds||[];

if(targetIds.length===0){ setRecModal(null); return; }

const rec = {...recForm,photos:recForm.photos||[]};

// Save one shared record to the first cat only (single record, multi-cat tag) const targetId = editRecId

? cats.find(c=>(c.records||[]).some(r=>r.id===editRecId))?.id || targetIds[0] : targetIds[0];

const next = cats.map(c=>{

if(c.id!==targetId) return c; const recs = editRecId ? c.records.map(r=>r.id===editRecId?rec:r) : [...(c.records||[]),rec]; return {...c,records:recs}; }); saveCats(next); setRecModal(null); }; const deleteRec = (rid) => saveCats(cats.map(c=>c.id!==selected?c:{...c,records:c.records.f

// ── Edit page handlers ── const openAdd = () => setEditPage({mode:"add", form:{id:Date.now()+"",name:"",species:"貓咪" const openEdit = () => setEditPage({mode:"edit", form:{...selCat}}); const saveEdit = (form) => {

const next = editPage.mode==="add" ? [...cats,form] : cats.map(c=>c.id===form.id?form:c);

saveCats(next);

if(editPage.mode==="add") setSelected(form.id);

setEditPage(null); }; const deleteCat = (id) => { saveCats(cats.filter(c=>c.id!==id)); setSelected(null); };

if(!ready) return <div style={{padding:"2rem",textAlign:"center",color:P.muted}}>載入中…</di

// ── EDIT PAGE ──

if(editPage) return <CatEditPage mode={editPage.mode} initialForm={editPage.form} onSave={s

// ── MAIN PAGE ── return(

<div style={{paddingBottom:80,minHeight:"100vh",background:P.bg}}>

{/* Swipe cards row — always visible */}

<div style={cats.length===0 ? {

display:"flex",gap:14, overflowX:"auto",scrollbarWidth:"none", padding:"16px 0", paddingLeft:"calc(50vw - 170px)", paddingRight:"calc(50vw - 170px)", } : { display:"flex",gap:14, overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch", scrollSnapType:"x mandatory", padding:"16px 0", paddingLeft:"calc(50vw - 170px)", paddingRight:"calc(50vw - 170px)", }}> {cats.map(cat=>( <div key={cat.id} onClick={()=>setSelected(cat.id===selected?null:cat.id)} style={{ flexShrink:0,width:"82vw",maxWidth:340,scrollSnapAlign:"center", background:selected===cat.id?P.card:P.bg, border:`1.5px solid ${selected===cat.id?P.btnTo:P.border}`, borderRadius:22,padding:"18px 18px 14px",cursor:"pointer",transition:"all 0.18s", }}> {/* Top: centered */}

<div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBott

<div style={{width:80,height:80,borderRadius:18,overflow:"hidden",background:P.

{cat.photo?<img src={cat.photo} style={{width:"100%",height:"100%",objectFit: </div>

<div style={{fontSize:20,fontWeight:800,color:P.ink,marginBottom:4,textAlign:"c

{(calcAge(cat.birthday)||cat.weight)&&(

<div style={{fontSize:13,color:P.muted,marginBottom:3,textAlign:"center"}}>

{[calcAge(cat.birthday),cat.weight?(cat.weight+" kg"):null].filter(Boolean) </div> )} {(cat.breed||cat.gender)&&(

<div style={{fontSize:12,color:P.muted,textAlign:"center"}}>

{[cat.breed,cat.gender].filter(Boolean).join(" · ")} </div> )} </div> {/* Divider */} <div style={{height:1,background:P.block,marginBottom:10}}/> {/* Info rows */}

<div style={{display:"flex",flexDirection:"column",gap:8}}>

{cat.birthday&&(

<div style={{display:"flex",alignItems:"center",gap:8}}>

<span style={{fontSize:12}}> </span>

<span style={{fontSize:12,color:P.muted}}>⽣⽇</span> <span style={{fontSize:12,color:P.ink,fontWeight:500,marginLeft:10}}>{cat.b </div> )} {cat.chip&&(

<div style={{display:"flex",alignItems:"center",gap:8}}>

<span style={{fontSize:12}}> </span>

<span style={{fontSize:12,color:P.muted}}>晶片號</span> <span style={{fontSize:12,color:P.ink,fontWeight:500,marginLeft:10}}>{cat.c </div> )} </div> {/* Enter profile */}

<div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}> <button onClick={e=>{e.stopPropagation();setSelected(cat.id);openEdit();}} styl

fontSize:12,color:P.muted,background:"none",border:"none",cursor:"pointer", display:"flex",alignItems:"center",gap:3,padding:4,

}}>進入檔案 <span style={{fontSize:14}}>→</span></button>

</div> </div> ))} {/* ＋ Add card */}

<div onClick={openAdd} style={{

flexShrink:0, width: cats.length===0 ? "82vw" : "82vw", maxWidth:320, scrollSnapAlign:"center", background:P.card,border:`2px dashed ${P.border}`, borderRadius:22,padding:"2rem 1.25rem",cursor:"pointer", display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center", gap:14,minHeight:200, pointerEvents:"auto", }}>

<div style={{width:60,height:60,borderRadius:"50%",background:P.btnTo,display:"flex

<span style={{color:"#fff",fontSize:28,lineHeight:1}}>＋</span>

</div> <span style={{fontSize:14,color:P.muted}}></span> </div> </div>

{/* ⽇常記錄 — always visible */}

<div style={{padding:"0 1.25rem 1rem"}}>

<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin

<span style={{fontSize:13,fontWeight:700,color:P.ink}}>⽇常記錄</span>

<button onClick={openAddRec} style={{width:32,height:32,borderRadius:"50%",border:"

</div>

{/* Records: all cats, show cat avatar badge on each */} {(()=>{ const allRecs = cats.flatMap(cat=>(cat.records||[]).map(r=>({...r,_catId:cat.id,_ca

const sorted = [...allRecs].sort((a,b)=>b.date>a.date?1:-1);

if(sorted.length===0) return(

<div style={{padding:"1.5rem",textAlign:"center"}}>

{cats.length===0?(

<> <div style={{fontSize:14,fontWeight:700,color:P.ink,marginBottom:5}}>還沒有任

<div style={{fontSize:12,color:P.muted}}>先新增⼀隻，再開始記錄吧</div>

</> ):(

<div style={{fontSize:13,color:P.muted}}>尚無紀錄</div> )} </div> ); return sorted.map(rec=>(

<SwipeRecord key={rec.id} rec={rec}

catName={null} catPhoto={null} allCats={cats}

onEdit={()=>{setSelected(rec._catId); openEditRec(rec);}}

onDelete={()=>{

const next = cats.map(cat=>

cat.id===rec._catId?{...cat,records:(cat.records||[]).filter(r=>r.id!==rec. ); saveCats(next);

}}

/>

));

})()} </div>

{/* Record Modal */} {recModal&&( <Modal title={editRecId?"編輯紀錄":"新增紀錄"} onClose={()=>setRecModal(null)} onSave={s

<Field label="類型">

<div style={{display:"flex",flexWrap:"wrap",gap:8}}>

{CARE_CATS.map(grp=>(

<div key={grp.group} style={{width:"100%"}}>

<div style={{fontSize:11,color:P.muted,marginBottom:6,marginTop:4}}>{grp.gr

<div style={{display:"flex",flexWrap:"wrap",gap:7}}>

{grp.items.map(item=>(

<button key={item} onClick={()=>setRecForm(p=>({...p,type:item}))} styl padding:"7px 14px",borderRadius:99, border:`1.5px solid ${recForm.type===item?P.btnTo:P.border}`, background:recForm.type===item?P.btnTo:P.card,

color:recForm.type===item?"#fff":P.ink,fontSize:13,cursor:"pointer",

}}>{item}</button> ))}

</div>

</div>

))}

</div> </Field> <Field label="⽇期"><Input value={recForm.date} onChange={v=>setRecForm(p=>({...p,da

<Field label="備註（選填）">

<textarea value={recForm.note||""} onChange={e=>setRecForm(p=>({...p,note:e.targe style={{width:"100%",padding:"11px 14px",borderRadius:13,border:`1.5px solid ${ </Field> <div style={{marginBottom:14}}> {/* 寵物 row — only when multiple cats */} {cats.length>1&&( <div style={{marginBottom:10}}>

<div style={{fontSize:11,color:P.muted,fontWeight:600,letterSpacing:"0.08em",

<div style={{display:"flex",gap:10,flexWrap:"wrap"}}>

{cats.map(cat=>(

<div key={cat.id} onClick={()=>setRecForm(f=>({...f,catIds:(f.catIds||[])

<div style={{ width:44,height:44,borderRadius:"50%",overflow:"hidden", border:`2.5px solid ${(recForm.catIds||[]).includes(cat.id)?P.btnTo:P background:P.block,display:"flex",alignItems:"center",justifyContent: transition:"all 0.15s", }}>

{cat.photo?<img src={cat.photo} style={{width:"100%",height:"100%",ob

</div> <span style={{fontSize:9,color:(recForm.catIds||[]).includes(cat.id)?P.

</div>

))}

</div>

</div> )} {/* 照片 */} <div>

<div style={{fontSize:11,color:P.muted,fontWeight:600,letterSpacing:"0.08em",ma

<div style={{display:"flex",flexWrap:"wrap",gap:8}}>

{(recForm.photos||[]).map((p,i)=>( <div key={i} style={{position:"relative",width:72,height:72,borderRadius:10

<img src={p} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="

<button onClick={()=>setRecForm(f=>({...f,photos:f.photos.filter((_,j)=>j </div> ))} <label style={{width:72,height:72,borderRadius:10,border:`2px dashed ${P.bord

<span style={{fontSize:22}}> </span>

<span style={{fontSize:10,color:P.muted}}>新增</span>

<input type="file" accept="image/*" multiple style={{display:"none"}} onCha

const files = Array.from(e.target.files); files.forEach(file=>{

const r=new FileReader();

r.onload=ev=>setRecForm(f=>({...f,photos:[...(f.photos||[]),ev.target.r

r.readAsDataURL(file); });

e.target.value=""; </div> );

}

// ───────────────────────────────────────────────────────── // CAT EDIT PAGE (full-screen, not modal) // ───────────────────────────────────────────────────────── const SPECIES_OPTS = ["貓咪"]; const GENDER_OPTS = ["弟弟（公）","妹妹（⺟）","未知"]; const NEUTER_OPTS = ["已絕育","未絕育","未知"]; const STATUS_OPTS = ["在地球玩耍中","已過彩虹橋","其他"];

function RowItem({label,value,placeholder,onClick,children}){return(

<div onClick={onClick} style={{display:"flex",alignItems:"center",justifyContent:"space-bet

<span style={{fontSize:14,color:P.ink,flex:1}}>{label}</span>

<div style={{display:"flex",alignItems:"center",gap:6}}>

{children||<span style={{fontSize:14,color:value?P.ink:P.muted,fontWeight:value?500:400 {onClick&&<span style={{color:P.muted,fontSize:16}}>›</span>} </div> </div> );}

function SectionCard({children}){return( <div style={{background:"#FFFFFF",borderRadius:20,padding:"0 16px",marginBottom:16,overflow {children} </div> );}

function CatEditPage({mode,initialForm,onSave,onBack}){

const [form, setForm] = useState({...initialForm});

const [picker, setPicker] = useState(null); // {field, opts} | {field:"text", label} | {fie

const [pickerInput, setPickerInput] = useState("");

const f = (k,v) => setForm(p=>({...p,[k]:v}));

const openPicker = (field,opts,label) => { if(opts) { setPicker({field,opts}); } else { setPickerInput(form[field]||""); setPicker({field,label,text:true}); } }; const openDatePicker = (field,label) => { setPickerInput(form[field]||""); setPicker({field

const confirmBack = () => { if(JSON.stringify(form)!==JSON.stringify(initialForm)){ if(!window.confirm("放棄未儲存的修改？")) return; } onBack(); }; const age = calcAge(form.birthday);

const handlePhoto = (e) => { const file = e.target.files[0]; if(!file) return; const r = new FileReader(); r.onload = ev => f("photo", ev.target.result); r.readAsDataURL(file); };

return(

<div style={{background:P.bg,minHeight:"100vh",paddingBottom:40}}>

{/* Nav bar */} <div style={{background:P.card,borderBottom:`1px solid ${P.border}`,padding:"0 16px",di

<button onClick={confirmBack} style={{border:"none",background:"none",fontSize:18,col

<span style={{fontSize:16,fontWeight:700,color:P.ink}}>{mode==="add"?"新增寵物":"編輯寵物

<button onClick={()=>onSave(form)} style={{border:"none",background:"none",fontSize:1

</div>

<div style={{padding:"20px 16px 0"}}>

{/* Photo */}

<div style={{display:"flex",justifyContent:"center",marginBottom:20}}>

<div onClick={()=>document.getElementById('cat-photo-upload').click()} style={{widt

{form.photo?<img src={form.photo} style={{width:"100%",height:"100%",objectFit:"c

<div style={{textAlign:"center"}}><div style={{fontSize:28}}> </div><div style

<input id="cat-photo-upload" type="file" accept="image/*" onChange={handlePhoto}

</div> </div>

{/* Section 1: 基本資料 */} <SectionCard>

<RowItem label="寵物名字" value={form.name} placeholder="點擊輸入" onClick={()=>openPi

<RowItem label="種類" value={form.species} onClick={()=>openPicker("species",SPECIES

<RowItem label="品種 / 花⾊" value={form.breed} onClick={()=>openPicker("breed",null,

<RowItem label="性別" value={form.gender} onClick={()=>openPicker("gender",GENDER_OP

<RowItem label="是否絕育" value={form.neutered} onClick={()=>openPicker("neutered",NE

</SectionCard>

{/* Section 2: 體重 */} <SectionCard> <RowItem label="⽬前體重" value={form.weight?(form.weight+" kg"):null} onClick={()=>o

<RowItem label="晶片號" value={form.chip} onClick={()=>openPicker("chip",null,"晶片號

</SectionCard>

{/* Section 3: 狀態 & ⽇期 */} <SectionCard> <RowItem label="寵物狀態" value={form.status} onClick={()=>openPicker("status",STATUS

<RowItem label="出⽣⽇期" onClick={()=>openDatePicker("birthday","出⽣⽇期")}>

<span style={{fontSize:14,color:form.birthday?P.ink:P.muted}}> {form.birthday?form.birthday.replace(/-/g,"."):"點擊輸入"} </span> {form.birthday&&age&&<span style={{fontSize:11,color:P.muted,marginLeft:6}}>({age </RowItem> <RowItem label="到家⽇期" onClick={()=>openDatePicker("homeday","到家⽇期")} value={fo </SectionCard>

</div>

{/* Picker / Input overlay */} {picker&&(

<div style={{position:"fixed",inset:0,background:"rgba(74,58,48,0.45)",zIndex:200,dis <div onClick={e=>e.stopPropagation()} style={{background:P.bg,borderRadius:"24px 24

{/* Title */}

<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",ma

<span style={{fontSize:15,fontWeight:700,color:P.ink}}>{picker.label||picker.fi <button onClick={()=>setPicker(null)} style={{border:"none",background:P.block, </div>

{/* Option list */} {picker.opts&&(

<div style={{display:"flex",flexDirection:"column",gap:0}}>

{picker.opts.map(opt=>(

<button key={opt} onClick={()=>{f(picker.field,opt);setPicker(null);}} styl

padding:"14px 0",borderBottom:`1px solid ${P.block}`,border:"none",backgr textAlign:"left",fontSize:15,cursor:"pointer", color:form[picker.field]===opt?P.btnTo:P.ink, fontWeight:form[picker.field]===opt?700:400,

}}>{opt}{form[picker.field]===opt?" ✓":""}</button>

))} </div> )}

{/* Text input */} {picker.text&&(

<div> <input autoFocus value={pickerInput} onChange={e=>setPickerInput(e.target.val onKeyDown={e=>{if(e.key==="Enter"){f(picker.field,pickerInput);setPicker(nu style={{width:"100%",padding:"14px 16px",borderRadius:14,border:`1.5px soli placeholder={picker.label}/>

<button onClick={()=>{f(picker.field,pickerInput);setPicker(null);}} style={{

</div> )}

{/* Date input */} {picker.date&&(

<div> <input autoFocus type="date" value={pickerInput} onChange={e=>setPickerInput( style={{width:"100%",padding:"14px 16px",borderRadius:14,border:`1.5px soli

<button onClick={()=>{f(picker.field,pickerInput);setPicker(null);}} style={{

</div> )}

</div> </div> )} </div> );

}

const BLANK_CAN = {id:"",brand:"",flavor:"",qty:1,expiry:"",photo:""};

function SwipeCanRow({can, isExpired, isSoon, onEdit, onDelete, onAdj}){

const [offsetX, setOffsetX] = useState(0);

const [startX, setStartX] = useState(null);

const REVEAL = 100; const onTouchStart = (e) => setStartX(e.touches[0].clientX); const onTouchMove = (e) => {

if(startX===null) return;

const dx = e.touches[0].clientX - startX;

if(dx < 0) setOffsetX(Math.max(-REVEAL, dx)); }; const onTouchEnd = () => { setOffsetX(offsetX < -REVEAL/2 ? -REVEAL : 0); setStartX(null); const close = () => setOffsetX(0); const bg = isExpired?P.rBg:isSoon?P.aBg:P.card; const bd = isExpired?P.rBorder:isSoon?P.aBorder:P.border; return(

<div style={{position:"relative",marginBottom:10,borderRadius:18,overflow:"hidden"}}>

<div style={{position:"absolute",right:0,top:0,bottom:0,display:"flex",alignItems:"stre

<button onClick={()=>{close();onEdit();}} style={{flex:1,border:"none",background:P.a

<button onClick={()=>{close();onDelete();}} style={{flex:1,border:"none",background:P

</div>

<div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}

style={{background:bg,border:`1px solid ${bd}`,borderRadius:18,padding:"12px 14px", display:"flex",gap:12,alignItems:"center", transform:`translateX(${offsetX}px)`, transition:startX===null?"transform 0.22s ease":"none", position:"relative",zIndex:1, }}> <div style={{width:56,height:56,borderRadius:12,overflow:"hidden",background:P.block,

{can.photo?<img src={can.photo} style={{width:"100%",height:"100%",objectFit:"cover

</div> <div style={{flex:1,minWidth:0}}>

<div style={{fontSize:13,fontWeight:700,color:P.ink,marginBottom:2}}>{can.brand||"未

<div style={{fontSize:12,color:P.muted,marginBottom:6}}>{can.flavor||"未知⼝味"}</div

{can.expiry&&<div style={{fontSize:11,color:isExpired?P.rText:isSoon?P.aText:P.mute </div>

<div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0,alignSelf:"center"

<button onClick={()=>onAdj(-1)} style={{width:28,height:28,borderRadius:99,border:`

<span style={{fontSize:16,fontWeight:800,color:P.ink,minWidth:22,textAlign:"center"

<button onClick={()=>onAdj(1)} style={{width:28,height:28,borderRadius:99,border:`1 </div> </div> </div> );

}

function InventoryPage(){

const [cans, saveCans, ready] = useStorage("inventory_v1", []);

const [modal, setModal] = useState(false); const [form, setForm] = useState(BLANK_CAN);

const [editId, setEditId] = useState(null);

const openAdd = () => { setForm({...BLANK_CAN,id:Date.now()+""}); setEditId(null); setModal const openEdit = (can) => { setForm({...can}); setEditId(can.id); setModal(true); }; const save = () => {

const next = editId ? cans.map(c=>c.id===editId?form:c) : [...cans,form];

saveCans(next); setModal(false); }; const del = (id) => { if(window.confirm("確定刪除此庫存？")) saveCans(cans.filter(c=>c.id!==id const adj = (id,delta) => saveCans(cans.map(c=>c.id===id?{...c,qty:Math.max(0,c.qty+delta)}

const f = (k,v) => setForm(p=>({...p,[k]:v}));

const today = new Date().toISOString().slice(0,10); const expirySoon = (exp) => { if(!exp) return false; const d=(new Date(exp)-new Date())/(10 const expired = (exp) => exp && exp < today;

const total = cans.reduce((s,c)=>s+(Number(c.qty)||0),0);

if(!ready) return <div style={{padding:"2rem",textAlign:"center",color:P.muted}}>載入中…</di

return(

<div style={{paddingBottom:80,minHeight:"100vh",background:P.bg}}>

<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:

<span style={{fontSize:15,fontWeight:600,color:P.ink,fontStyle:"italic",fontFamily:"G

<button onClick={openAdd} style={{width:32,height:32,borderRadius:"50%",border:"none"

</div> {cans.length>0&&(

<div style={{padding:"10px 1.25rem",display:"flex",gap:10}}>

{[

{label:"品項",val:cans.length}, {label:"總罐數",val:total}, {label:"已過期",val:cans.filter(c=>expired(c.expiry)).length,warn:cans.some(c=>exp ].map(s=>( <div key={s.label} style={{flex:1,background:s.warn?P.rBg:P.card,borderRadius:14, <div style={{fontSize:18,fontWeight:800,color:s.warn?P.rText:P.ink}}>{s.val}</d <div style={{fontSize:10,color:P.muted}}>{s.label}</div> </div> ))} </div> )} <div style={{fontSize:14,fontWeight:700,color:P.ink,marginBottom:5}}>罐頭還沒住進來 <div style={{fontSize:12,color:P.muted}}>點擊右上⾓「新增」帶牠們回家吧</div> </div>}

{cans.length===0&&<div

style={{padding:"

1.5rem

1.25rem"

,textAlign:"

center"

}}>

</

<div style={{padding:"0 1.25rem"}}>

{cans.map(can=>{

const isExpired = expired(can.expiry); const isSoon = !isExpired && expirySoon(can.expiry);

return <SwipeCanRow key={can.id} can={can} isExpired={isExpired} isSoon={isSoon}

onEdit={()=>openEdit(can)} onDelete={()=>del(can.id)} onAdj={(delta)=>adj(can.id,delta)}/>;

})} </div>

{modal&&( <Modal title={editId?"編輯庫存":"新增庫存"} onClose={()=>setModal(false)} onSave={save}>

<Field label="罐頭照片"><ImageUpload value={form.photo} onChange={v=>f("photo",v)} pl

<Field label="品牌"><Input value={form.brand} onChange={v=>f("brand",v)} placeholder

<Field label="⼝味"><Input value={form.flavor} onChange={v=>f("flavor",v)} placehold

<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>

<Field label="數量（罐）">

<div style={{display:"flex",alignItems:"center",gap:10}}>

<button onClick={()=>f("qty",Math.max(0,(form.qty||0)-1))} style={{width:36,h

<span style={{fontSize:18,fontWeight:700,color:P.ink,minWidth:28,textAlign:"c

<button onClick={()=>f("qty",(form.qty||0)+1)} style={{width:36,height:36,bor </div> </Field>

<Field label="有效⽇期"><Input value={form.expiry} onChange={v=>f("expiry",v)} type

</div> </Modal> )} </div> );

}

// ───────────────────────────────────────────────────────── // NUTRIENT CALCULATOR // ───────────────────────────────────────────────────────── function NutrientCalculator(){ const [open, setOpen] = useState(false);

const [vals, setVals] = useState({protein:"",fat:"",carb:"",water:"",fiber:"",ash:"",phos:"

const v = (k) => parseFloat(vals[k])||0;

const set = (k,val) => setVals(p=>({...p,[k]:val}));

const protein=v("protein"), fat=v("fat"), water=v("water"), fiber=v("fiber"), ash=v("ash"), phos=v("phos"), kcalInput=v("kcal");

// NFE: auto-calculate if not entered const carbInput = parseFloat(vals.carb); const carbAuto = Math.max(0, 100 - (protein + fat + water + ash + fiber)); const carb = (!isNaN(carbInput) && vals.carb !== "") ? carbInput : carbAuto; const carbIsAuto = isNaN(carbInput) || vals.carb === "";

// DM basis const dm = (n) => { if(water>=100||n===0) return null; return (n/(100-water)*100).toFixed(1 const dmProtein=dm(protein), dmFat=dm(fat), dmCarb=dm(carb), dmFiber=dm(fiber), dmAsh=dm(ash), dmPhos=dm(phos);

// ME calories

const pCal=protein*3.5, fCal=fat*8.5, cCal=carb*3.5;

const meCalc = pCal + fCal + cCal; const meDisplay = meCalc > 0 ? meCalc.toFixed(0) : null; const total = pCal + fCal + cCal; const pMePct = total>0 ? parseFloat((pCal/total*100).toFixed(0)) : 0; const fMePct = total>0 ? parseFloat((fCal/total*100).toFixed(0)) : 0; const cMePct = total>0 ? parseFloat((cCal/total*100).toFixed(0)) : 0;

// Looser ideal range check

const meCheck = (key, val) => {

if(key==="protein") return val>=45&&val<=60?"g":val>=35&&val<=70?"a":"r"; if(key==="fat") return val>=30&&val<=50?"g":val>=20&&val<=60?"a":"r"; if(key==="carb") return val<=10?"g":val<=20?"a":"r"; return "g"; };

const hasNutrients = protein>0 || fat>0;

const inputStyle = {width:"100%",padding:"9px 12px",borderRadius:10,border:`1.5px solid ${P const fields = [ {key:"protein",label:"蛋⽩質",unit:"%"}, {key:"fat",label:"脂肪",unit:"%"}, {key:"carb",label:"碳⽔（NFE）",unit:"%",optional:true}, {key:"water",label:"⽔分",unit:"%"}, {key:"fiber",label:"粗纖維",unit:"%"}, {key:"ash",label:"灰質（Ash）",unit:"%"}, {key:"phos",label:"磷（P）",unit:"%"}, {key:"kcal",label:"廠標熱量",unit:"kcal/100g"}, ];

return(

<div style={{marginBottom:16,borderRadius:16,border:`1px solid ${P.border}`,background:P.

<button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",justify

<div style={{display:"flex",alignItems:"center",gap:8}}>

<span style={{fontSize:18}}> </span>

<span style={{fontSize:13,fontWeight:700,color:P.ink}}>成分計算機</span> </div> <span style={{color:P.muted,fontSize:12,display:"inline-block",transform:open?"rotate </button>

{open&&(

<div style={{padding:"0 16px 16px"}}>

<div style={{height:1,background:P.block,marginBottom:14}}/>

<div style={{fontSize:11,color:P.muted,fontWeight:600,letterSpacing:"0.08em",margin

<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>

{fields.map(f=>( <div key={f.key}>

<div style={{fontSize:11,color:P.muted,marginBottom:4,display:"flex",alignIte

{f.label}

{f.key==="carb"&&carbIsAuto&&protein>0&&(

<span style={{fontSize:9,background:P.aBg,color:P.aText,borderRadius:4,pa )} </div>

<input type="number" min="0" max="100" step="0.1"

value={vals[f.key]} onChange={e=>set(f.key,e.target.value)} placeholder={f.key==="carb"&&carbIsAuto&&protein>0 ? carbAuto.toFixed(1) : style={{...inputStyle, borderColor: f.key==="carb"&&carbIsAuto&&protein>0?P </div> ))} </div>

{!hasNutrients&&<div style={{textAlign:"center",padding:"8px 0 4px",color:P.muted,f

{hasNutrients&&(<>

{/* 熱量顯⽰區 */} {meDisplay&&( <div style={{marginBottom:14}}>

{/* 廠標優先 or 估算 */} {kcalInput>0?(

<div style={{marginBottom:10}}> <div style={{background:P.block,borderRadius:12,padding:"12px 14px",margi <div style={{fontSize:11,color:P.muted,marginBottom:4}}>廠標熱量</div>

<div style={{fontSize:20,fontWeight:800,color:P.ink}}>{kcalInput} <span

</div> <div style={{background:P.bg,borderRadius:12,padding:"10px 14px",border:` <div style={{fontSize:11,color:P.muted,marginBottom:2}}>估算熱量（ME）</d

<div style={{fontSize:15,fontWeight:700,color:P.muted}}>{meDisplay} <sp

</div>

<div style={{fontSize:10,color:P.muted,marginTop:6,lineHeight:1.5}}>※ 估算

</div> ):( <div style={{background:P.block,borderRadius:12,padding:"12px 14px",marginB <div style={{fontSize:11,color:P.muted,marginBottom:4}}>估算熱量（ME）</div

<div style={{fontSize:20,fontWeight:800,color:P.ink}}>{meDisplay} <span s

<div style={{fontSize:10,color:P.muted,marginTop:4}}>※ 僅供分析熱量來源比例， </div> )}

{/* 熱量來源比例 ME% */}

<div style={{fontSize:11,color:P.muted,fontWeight:600,letterSpacing:"0.08em",

<div style={{fontSize:10,color:P.muted,marginBottom:10}}>參考蘇青青營養師：蛋⽩質

<div style={{display:"flex",flexDirection:"column",gap:10}}>

{[

{label:"蛋⽩質",pct:pMePct,color:"#A8D5BA",key:"protein",range:"45–60%"}, {label:"脂肪",pct:fMePct,color:"#E8A87C",key:"fat",range:"30–50%"}, {label:carbIsAuto?"估算碳⽔（NFE）":"碳⽔（NFE）",pct:cMePct,color:"#C4A8D5", ].filter(r=>r.pct>0).map(r=>{ const cls = meCheck(r.key, r.pct);

const barCol = cls==="g"?"#A8D5BA":cls==="a"?"#E8C87C":"#E8A0A0";

const textCol = cls==="g"?P.gText:cls==="a"?"#A86A3D":P.rText;

const tag = cls==="g"?"理想":cls==="a"?r.key==="carb"?"偏⾼":r.pct>60||r.pc return(

<div key={r.key}> <div style={{display:"flex",justifyContent:"space-between",alignItems <span style={{fontSize:12,color:P.ink}}>{r.label}</span>

<div style={{display:"flex",alignItems:"center",gap:6}}>

<span style={{fontSize:10,color:P.muted}}>{r.range}</span>

<span style={{fontSize:10,padding:"2px 7px",borderRadius:99,

background:cls==="g"?P.gBg:cls==="a"?P.aBg:P.rBg,

color:textCol,fontWeight:600}}>{tag}</span> <span style={{fontSize:13,fontWeight:700,color:textCol}}>{r.pct}% </div> </div>

<div style={{background:P.block,borderRadius:99,height:7,overflow:"hi

<div style={{width:`${Math.min(r.pct,100)}%`,height:"100%",backgrou

</div> </div> ); })} </div> </div> )}

{/* DM Basis */} {water>0&&( <div style={{marginBottom:14}}>

<div style={{fontSize:11,color:P.muted,fontWeight:600,letterSpacing:"0.08em",

<div style={{display:"flex",flexDirection:"column",gap:6}}>

{[

{label:"蛋⽩質",val:dmProtein,key:"protein"}, {label:"脂肪",val:dmFat,key:"fat"}, {label:carbIsAuto?"估算碳⽔（NFE）":"碳⽔（NFE）",val:dmCarb,key:"carb"}, {label:"粗纖維",val:dmFiber,key:"fiber"}, {label:"灰質",val:dmAsh,key:"ash"}, {label:"磷",val:dmPhos,key:"phos"}, ].filter(r=>r.val!==null&&parseFloat(r.val)>0).map(row=>{

let cls="g";

if(row.key==="protein") cls=parseFloat(row.val)>=30?"g":parseFloat(row.va if(row.key==="phos") cls=parseFloat(row.val)<=0.8?"g":parseFloat(row.val)

const col=cls==="g"?P.gText:cls==="a"?P.aText:P.rText;

const bg=cls==="g"?P.gBg:cls==="a"?P.aBg:P.rBg;

return(<div key={row.key} style={{display:"flex",alignItems:"center",just <span style={{fontSize:13,color:P.ink}}>{row.label}</span> <span style={{fontSize:14,fontWeight:700,color:col}}>{row.val}%</span> </div>); })} </div> </div> )} {water===0&&<div style={{fontSize:11,color:P.muted,textAlign:"center",padding:"4p

<div style={{fontSize:11,color:P.muted,lineHeight:1.7,padding:"10px 12px",backgro <div style={{fontWeight:600,marginBottom:4,color:P.ink}}> 計算說明</div>

<div>• 乾物比 = 成分 ÷ (100 – ⽔分) × 100</div>

<div>• ME = 蛋⽩質×3.5 + 脂肪×8.5 + 碳⽔×3.5</div>

<div>• 估算碳⽔（NFE）= 100 – 蛋⽩質 – 脂肪 – ⽔分 – 灰分 – 粗纖維</div>

</div> <button onClick={()=>setVals({protein:"",fat:"",carb:"",water:"",fiber:"",ash:"",

style={{width:"100%",padding:"10px",borderRadius:99,border:`1px solid ${P.borde </>)} </div> )} </div> );

}

// ───────────────────────────────────────────────────────── // ADMIN BACKEND // ───────────────────────────────────────────────────────── function AdminPage({onExit}){

const [authed, setAuthed] = useState(false);

const [pw, setPw] = useState("");

const [pwErr, setPwErr] = useState(false); const [tab, setTab] = useState("brands"); // brands | flavors

const [brands, setBrands] = useState([]);

const [flavors, setFlavors] = useState([]);

const [loading, setLoading] = useState(false);

const [msg, setMsg] = useState("");

const [editBrand, setEditBrand] = useState(null);

const [editFlavor, setEditFlavor] = useState(null);

const [showBrandForm, setShowBrandForm] = useState(false);

const [showFlavorForm, setShowFlavorForm] = useState(false);

const BLANK_BRAND = {key:"",label:"",label_en:"",aliases:"",is_featured:false};

const BLANK_FLAVOR = {brand_key:"",flavor_id:"",label:"",meat_pct:"80%",allergen_count:0,al

const [brandForm, setBrandForm] = useState(BLANK_BRAND);

const [flavorForm, setFlavorForm] = useState(BLANK_FLAVOR);

const notify = (m) => { setMsg(m); setTimeout(()=>setMsg(""),3000); };

const login = () => { if(pw === ADMIN_PASSWORD){ setAuthed(true); loadData(); } else { setPwErr(true); setTimeout(()=>setPwErr(false),2000); } };

const loadData = async () => { try { const b = JSON.parse((await idbGet("admin_brands")) || localStorage.getItem("admin_bran const f = JSON.parse((await idbGet("admin_flavors")) || localStorage.getItem("admin_fla setBrands(b); setFlavors(f); } catch(e){ notify("載入失敗："+e.message); } }; const saveBrand = () => { try { const entry = { id: editBrand?.id || Date.now()+"", key: brandForm.key.trim().toLowerCase().replace(/\s+/g,'_'), label: brandForm.label.trim(), label_en: brandForm.label_en.trim(), aliases: brandForm.aliases.split(',').map(s=>s.trim()).filter(Boolean), is_featured: brandForm.is_featured, }; const cur = JSON.parse(localStorage.getItem("admin_brands")||"[]"); const next = editBrand ? cur.map(b=>b.id===editBrand.id?entry:b) : [...cur,entry]; idbSet("admin_brands", JSON.stringify(next)); localStorage.setItem("admin_brands", JSON notify(editBrand?"✓ 品牌已更新":"✓ 品牌已新增"); setShowBrandForm(false); setEditBrand(null); setBrandForm(BLANK_BRAND); loadData(); } catch(e){ notify("錯誤："+e.message); } }; const deleteBrand = (id) => { if(!window.confirm("確定刪除？此品牌下所有⼝味也會刪除。")) return; const brands = JSON.parse(localStorage.getItem("admin_brands") || "[]"); const flavors = JSON.parse(localStorage.getItem("admin_flavors") || "[]"); const brand = brands.find(b=>b.id===id); const nb=brands.filter(b=>b.id!==id); idbSet("admin_brands",JSON.stringify(nb)); localSto const nf2=flavors.filter(f=>f.brand_key!==brand?.key); idbSet("admin_flavors",JSON.string notify("✓ 已刪除"); loadData(); };

const saveFlavor = () => { try { const entry = Object.fromEntries(Object.entries(flavorForm).map(([k,v])=>[k,v===""?null entry.id = editFlavor?.id || Date.now()+""; entry.flavor_id = (entry.flavor_id||"").trim().toLowerCase().replace(/\s+/g,'_') || Dat const cur = JSON.parse(localStorage.getItem("admin_flavors")||"[]"); const next = editFlavor ? cur.map(f=>f.id===editFlavor.id?entry:f) : [...cur,entry]; idbSet("admin_flavors", JSON.stringify(next)); localStorage.setItem("admin_flavors", JS notify(editFlavor?"✓ ⼝味已更新":"✓ ⼝味已新增"); setShowFlavorForm(false); setEditFlavor(null); setFlavorForm(BLANK_FLAVOR); loadData(); } catch(e){ notify("錯誤："+e.message); } }; const deleteFlavor = (id) => { if(!window.confirm("確定刪除此⼝味？")) return; const current = JSON.parse(localStorage.getItem("admin_flavors") || "[]"); const nf=current.filter(f=>f.id!==id); idbSet("admin_flavors",JSON.stringify(nf)); localS notify("✓ 已刪除"); loadData(); }; const inputCls = {width:"100%",padding:"9px 12px",borderRadius:10,border:`1.5px solid ${P.b

// Login screen if(!authed) return(

<div style={{position:"fixed",inset:0,background:P.bg,zIndex:500,display:"flex",alignItem

<div style={{background:P.card,borderRadius:20,padding:"2rem",width:"85vw",maxWidth:340

<div style={{fontSize:28,marginBottom:8}}> </div>

<div style={{fontSize:16,fontWeight:700,color:P.ink,marginBottom:4}}>後台管理</div> <div style={{fontSize:12,color:P.muted,marginBottom:20}}>請輸入管理員密碼</div>

<input type="password" value={pw} onChange={e=>setPw(e.target.value)}

onKeyDown={e=>e.key==="Enter"&&login()}

placeholder="密碼" style={{...inputCls,textAlign:"center",borderColor:pwErr?P.rBorde {pwErr&&<div style={{fontSize:12,color:P.rText,marginBottom:8}}>密碼錯誤</div>}

<div style={{display:"flex",gap:8,marginTop:4}}>

<button onClick={onExit} style={{flex:1,padding:"10px",borderRadius:99,border:`1px

<button onClick={login} style={{flex:1,padding:"10px",borderRadius:99,border:"none"

</div> </div> </div> );

return(

<div style={{position:"fixed",inset:0,background:P.bg,zIndex:500,overflowY:"auto"}}>

{/* Header */} <div style={{background:P.card,borderBottom:`1px solid ${P.border}`,padding:"0 16px",di

<span style={{fontSize:15,fontWeight:700,color:P.ink}}> 後台管理</span>

<button onClick={onExit} style={{border:"none",background:"none",color:P.muted,fontSi </div>

{msg&&<div style={{background:P.gBg,padding:"10px 16px",fontSize:13,color:P.gText,textA

{/* Backup / Restore */}

<div style={{padding:"12px 16px",background:P.block,display:"flex",gap:8}}>

<button onClick={async()=>{

try { const cats = JSON.parse((await idbGet("cats_v1"))||localStorage.getItem("cats_v1" const inv = JSON.parse((await idbGet("inventory_v1"))||localStorage.getItem("inve const ab = JSON.parse((await idbGet("admin_brands"))||localStorage.getItem("admin const af = JSON.parse((await idbGet("admin_flavors"))||localStorage.getItem("admi const backup = {version:1,date:new Date().toISOString(),cats,inventory:inv,admin_ const blob = new Blob([JSON.stringify(backup,null,2)],{type:"application/json"}); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download=`koimiao_backup_${new Date().toLocaleDateString("zh-TW").r a.click(); URL.revokeObjectURL(url); notify("✓ 備份已下載"); } catch(e){ notify("匯出失敗："+e.message); } }} style={{flex:1,padding:"10px",borderRadius:10,border:`1px solid ${P.border}`,backg

匯出備份 </button> <label style={{flex:1,padding:"10px",borderRadius:10,border:`1px solid ${P.border}`,b

匯入還原

<input type="file" accept=".json" style={{display:"none"}} onChange={e=>{

const file = e.target.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = async ev => { try { const data = JSON.parse(ev.target.result); if(!data.version) throw new Error("不是有效的備份檔案"); if(data.cats){ await idbSet("cats_v1",JSON.stringify(data.cats)); localStorag if(data.inventory){ await idbSet("inventory_v1",JSON.stringify(data.inventory if(data.admin_brands){ await idbSet("admin_brands",JSON.stringify(data.admin_ if(data.admin_flavors){ await idbSet("admin_flavors",JSON.stringify(data.admi notify("✓ 資料已還原，請重新整理⾴⾯"); loadData(); } catch(err){ notify("匯入失敗："+err.message); } }; reader.readAsText(file);

e.target.value="";

}}/> </label> </div>

{/* Tabs */} <div style={{display:"flex",gap:0,borderBottom:`1px solid ${P.border}`,background:P.car

{["brands","flavors"].map(t=>(

<button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"12px",border:"none" {t==="brands"?"品牌 ("+brands.length+")":"⼝味 ("+flavors.length+")"} </button> ))} </div>

<div style={{padding:"16px"}}>

{loading&&<div style={{textAlign:"center",color:P.muted,padding:"2rem"}}>載入中…</div>

{/* BRANDS TAB */}

{tab==="brands"&&!loading&&(

<div> <button onClick={()=>{setEditBrand(null);setBrandForm(BLANK_BRAND);setShowBrandFo

{showBrandForm&&(

<div style={{background:P.card,borderRadius:16,padding:"16px",marginBottom:14,b <div style={{fontSize:13,fontWeight:700,color:P.ink,marginBottom:12}}>{editBr <div style={{fontSize:11,color:P.muted,marginBottom:4}}>品牌 Key（英⽂⼩寫，底線）

<input style={inputCls} value={brandForm.key} onChange={e=>setBrandForm(p=>({

<div style={{fontSize:11,color:P.muted,marginBottom:4}}>品牌名稱（中⽂）</div>

<input style={inputCls} value={brandForm.label} onChange={e=>setBrandForm(p=>

<div style={{fontSize:11,color:P.muted,marginBottom:4}}>英⽂名稱</div>

<input style={inputCls} value={brandForm.label_en} onChange={e=>setBrandForm(

<div style={{fontSize:11,color:P.muted,marginBottom:4}}>搜尋別名（逗號分隔）</div

<input style={inputCls} value={brandForm.aliases} onChange={e=>setBrandForm(p

<label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:P.i

<input type="checkbox" checked={brandForm.is_featured} onChange={e=>setBran

顯⽰為熱⾨品牌

</label>

<div style={{display:"flex",gap:8}}>

<button onClick={()=>{setShowBrandForm(false);setEditBrand(null);}} style={

<button onClick={saveBrand} style={{flex:1,padding:"10px",borderRadius:99,b

</div> </div> )}

{brands.map(b=>(

<div key={b.id} style={{background:P.card,borderRadius:14,padding:"12px 14px",m

<div style={{display:"flex",alignItems:"center",justifyContent:"space-between

<div> <div style={{fontSize:14,fontWeight:700,color:P.ink}}>{b.label}</div> <div style={{fontSize:11,color:P.muted}}>key: {b.key} · {flavors.filter(f </div>

<div style={{display:"flex",gap:6}}>

<button onClick={()=>{setBrandForm({...b,aliases:(b.aliases||[]).join("," <button onClick={()=>deleteBrand(b.id)} style={{border:"none",background: </div>

</div>

</div>

))}

</div> )}

{/* FLAVORS TAB */}

{tab==="flavors"&&!loading&&(

<div> <button onClick={()=>{setEditFlavor(null);setFlavorForm(BLANK_FLAVOR);setShowFlav

{showFlavorForm&&(

<div style={{background:P.card,borderRadius:16,padding:"16px",marginBottom:14,b

<div style={{fontSize:13,fontWeight:700,color:P.ink,marginBottom:12}}>{editFl <div style={{fontSize:11,color:P.muted,marginBottom:4}}>所屬品牌</div>

<select style={{...inputCls}} value={flavorForm.brand_key} onChange={e=>setFl

<option value="">選擇品牌…</option> {brands.map(b=><option key={b.key} value={b.key}>{b.label}</option>)}

</select> <div style={{fontSize:11,color:P.muted,marginBottom:4}}>⼝味名稱</div> <input style={inputCls} value={flavorForm.label} onChange={e=>setFlavorForm(p <div style={{fontSize:11,color:P.muted,marginBottom:4}}>原料成分（逗號分隔）</div <textarea style={{...inputCls,height:80,resize:"none"}} value={flavorForm.ing <div style={{fontSize:11,color:P.muted,marginBottom:4}}>⾁量百分比</div> <input style={inputCls} value={flavorForm.meat_pct} onChange={e=>setFlavorFor <div style={{fontSize:11,color:P.muted,marginBottom:8,marginTop:4,fontWeight:

<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>

{[["water","⽔分"],["protein","蛋⽩質"],["fat","脂肪"],["phos","磷"],["calcium

<div key={k} style={{gridColumn:k==="kcal_label"?"1/-1":"auto"}}>

<div style={{fontSize:10,color:P.muted,marginBottom:3}}>{l}</div>

<input type="number" step="0.001" style={{...inputCls,marginBottom:0}}

</div> ))} </div>

<div style={{display:"flex",gap:8,marginTop:12}}>

<button onClick={()=>{setShowFlavorForm(false);setEditFlavor(null);}} style

<button onClick={saveFlavor} style={{flex:1,padding:"10px",borderRadius:99, </div> </div> )}

{flavors.map(f=>{

const b = brands.find(br=>br.key===f.brand_key); return(

<div key={f.id} style={{background:P.card,borderRadius:14,padding:"12px 14px"

<div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-b

<div style={{flex:1,minWidth:0}}> <div style={{fontSize:13,fontWeight:700,color:P.ink}}>{f.label}</div>

<div style={{fontSize:11,color:P.muted}}>{b?.label||f.brand_key}</div>

<div style={{fontSize:10,color:P.muted,marginTop:2}}>蛋⽩{f.protein||"–"

</div>

<div style={{display:"flex",gap:6,flexShrink:0}}>

<button onClick={()=>{setFlavorForm({...f,allergen_count:f.allergen_cou <button onClick={()=>deleteFlavor(f.id)} style={{border:"none",backgrou </div> </div> </div> ); })}

</div>

)}

</div>

</div> ); }

// ───────────────────────────────────────────────────────── // PRESETS // ───────────────────────────────────────────────────────── const PRESETS = ["Ziwi Peak","K9 Natural","Couch Potato"];

export default function CatFoodAnalysis(){

const [input, setInput] = useState("");

const [activePreset, setActivePreset] = useState(null);

const [result, setResult] = useState(null);

const [selectedFlavor, setSelectedFlavor] = useState(null);

const [notFound, setNotFound] = useState(false);

const [tab, setTab] = useState("ingredients");

const [showAllBrands, setShowAllBrands] = useState(false);

const [activePage, setActivePage] = useState("analysis");

const [showAdmin, setShowAdmin] = useState(false);

const [logoTaps, setLogoTaps] = useState(0);

// Load admin brands from localStorage and merge with built-in

const [adminBrands, setAdminBrands] = useState({});

useState(()=>{

const loadAdminBrands = async () => { try { const brands = JSON.parse((await idbGet("admin_brands")) || localStorage.getItem("adm const flavors = JSON.parse((await idbGet("admin_flavors")) || localStorage.getItem("a const result = {}; for(const b of brands){

result[b.key] = {

label: b.label, aliases: b.aliases||[b.key,b.label], flavors: flavors.filter(f=>f.brand_key===b.key).map(f=>({ id: f.flavor_id||f.id, label: f.label, data: buildFlavorData(b,f), })), };

} setAdminBrands(result); } catch(e){} }; loadAdminBrands(); // Re-sync after admin saves window.addEventListener('storage', loadAdminBrands); });

const ALL_BRANDS = {...BRANDS, ...adminBrands}; const handleLogoTap = () => { const next = logoTaps + 1; setLogoTaps(next); if(next >= 7){ setShowAdmin(true); setLogoTaps(0); } setTimeout(()=>setLogoTaps(0), 3000); };

function run(query){

const q = (query||input).trim(); if(!q) return; setInput(q); setActivePreset(query||null); setNotFound(false); setSelectedFlavor(null); setTab("ingredients"); setShowAllBrands(false); const found = searchBrands(q, ALL_BRANDS); if(found){ setResult(found); } else { setResult(null); setNotFound(true); }

}

function handleFlavorSelect(flavor){ setSelectedFlavor(flavor); setTab("ingredients"); }

const showData = result?.type === "direct" ? result.data : selectedFlavor?.data; const showBrandPicker = result?.type === "brand"; const currentBrand = result?.brand; const N = showData?.nutrients || {}; const vCls = showData?.verdictType === "pass" ? "g" : showData?.verdictType === "warn" ? "a

return(

<div style={{background:P.bg, minHeight:"100vh", fontFamily:"'Hiragino Sans','PingFang TC <style>{` *{box-sizing:border-box;} input:focus{outline:none;border-color:${P.btnTo}!important;} input::placeholder{color:#C4B8AD;} @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:tr .fade-up{animation:fadeUp 0.3s cubic-bezier(.22,1,.36,1) both;} .btn-run{transition:transform 0.18s,opacity 0.18s;cursor:pointer;} .btn-run:hover{opacity:0.9;transform:translateY(-1px);} .chip{transition:all 0.15s;cursor:pointer;} .chip:hover{background:${P.block}!important;} ::-webkit-scrollbar{display:none;} `}</style> {/* HEADER — always visible */}

<div style={{background:P.card,padding:"1.25rem 1.5rem 1rem",textAlign:"center",borderB

<div onClick={handleLogoTap} style={{fontSize:22,lineHeight:1,marginBottom:6,letterSp <div style={{fontFamily:"Georgia,'Times New Roman',serif",fontStyle:"italic",fontSize Born to be loved </div> </div>

{/* ANALYSIS PAGE */}

<div style={{display:activePage==="analysis"?"block":"none"}}>

{/* INPUT */}

<div style={{padding:"1.5rem 1.25rem 0"}}>

<div style={{fontSize:13,color:P.muted,marginBottom:10,display:"flex",alignItems:"c

<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={P.muted} stro

<rect x="2" y="3" width="12" height="10" rx="2"/><line x1="5" y1="7" x2="11" y2

</svg> 輸入品牌或⼝味 </div> <input value={input} onChange={e=>{ setInput(e.target.value); setActivePreset(null); if(!e.target.value.trim()){ setResult(null); setSelectedFlavor(null); setNotFou }}

onKeyDown={e=>e.key==="Enter"&&run()}

placeholder="輸入品牌或⼝味｜例如：Ziwi Peak ⽺⾁" style={{display:"block",width:"100%",padding:"16px 18px",borderRadius:16,border:` />

<button className="btn-run" onClick={()=>run()} style={{display:"flex",alignItems:"

{IC.search(18,"#fff")} 開始分析 </button>

<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>

{IC.bolt(12,P.aText)}

<span style={{fontSize:11,color:P.muted,letterSpacing:"0.1em",fontWeight:500}}>熱⾨

</div>

<div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>

{PRESETS.map(p=>(

<div key={p} className="chip" onClick={()=>run(p)} style={{padding:"7px 15px",b

))} </div>

<button onClick={()=>setShowAllBrands(b=>!b)} style={{display:"inline-flex",alignIt

<span> </button>

</span><span>全部品牌</span> {showAllBrands&&(

<div style={{background:P.card,borderRadius:20,border:`1px solid ${P.border}`,pad <div style={{fontSize:11,color:P.muted,letterSpacing:"0.1em",fontWeight:600,mar

<div style={{display:"flex",flexWrap:"wrap",gap:8}}>

{Object.entries(ALL_BRANDS).map(([key,brand])=>( <div key={key} className="chip" onClick={()=>{setShowAllBrands(false);const {brand.label} </div> ))} </div> </div> )}

{notFound&&( <div style={{background:P.aBg,border:`1px solid ${P.aBorder}`,borderRadius:16,pad <div style={{fontWeight:700,marginBottom:6}}> 尚未收錄「{input}」</div> <div style={{fontSize:11,opacity:.85}}>點擊「 全部品牌」查看已收錄品牌</div> </div> )} </div>

{/* RESULTS */}

<div style={{padding:"0 1.25rem 5rem"}}>

{showBrandPicker && currentBrand && (

<div className="fade-up">

<FlavorPicker brand={currentBrand} selectedId={selectedFlavor?.id} onSelect={ha </div> )}

{showData && (

<div className="fade-up">

<Card style={{padding:"1.375rem 1.5rem"}}>

<div style={{fontSize:11,color:P.muted,letterSpacing:"0.08em",marginBottom:4}

<div style={{fontSize:22,fontWeight:800,color:P.ink,lineHeight:1.25,marginBot {showData.brandSub.replace(/（[^）]*）/g,"").trim()} </div> {(()=>{ const countryMatch = showData.brandSub.match(/（([^）]+製[造]?|[^）]+產)）/); const country = countryMatch ? countryMatch[1] : null; const filteredTags = showData.tags.filter(t=>!["無穀無膠","無穀物","無膠類","無 return(

<div style={{display:"flex",flexWrap:"wrap",gap:8}}>

{country&&<StatusTag text={country} cls="g"/>}

{filteredTags.map((t,i)=><StatusTag key={i} {...t}/>)}

</div> ); })()} </Card>

<div style={{marginBottom:"0.875rem",padding:"12px 16px",borderRadius:18,border <span style={{fontSize:12,color:P.muted,lineHeight:1.65,fontWeight:400}}>{sho </div>

<TabBar active={tab} onChange={setTab}/>

{tab==="ingredients" && <TabIngredients data={showData}/>}

{tab==="nutrition" {tab==="benefits" </div> )}

<NutrientCalculator/> </div>

&& <TabNutrition && <TabBenefits

data={showData}/>} data={showData}/>}

</div>

{/* CATS PAGE */}

{activePage==="cats" && <CatsPage/>}

{/* INVENTORY PAGE */}

{activePage==="inventory" && <InventoryPage/>}

{/* ADMIN PAGE */} {showAdmin&&<AdminPage onExit={()=>setShowAdmin(false)}/>}

{/* BOTTOM TAB BAR */} <div style={{ position:"fixed",bottom:0,left:0,right:0, background:P.bg,borderTop:`1px solid ${P.border}`, display:"flex",alignItems:"stretch", paddingBottom:"env(safe-area-inset-bottom,0px)", zIndex:100, }}> {[ {id:"analysis",icon:" ",tip:"罐頭分析"}, {id:"cats",icon:" ",tip:"貓咪檔案"}, {id:"inventory",icon:" ",tip:"Oneseventh"}, ].map(tab=>{ const active = activePage===tab.id; return( <button key={tab.id} title={tab.tip} onClick={()=>setActivePage(tab.id)} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent padding:"12px 0",border:"none",background:"transparent",cursor:"pointer", fontSize:22,lineHeight:1, filter: active ? "brightness(1) saturate(1.2)" : "grayscale(1) opacity(0.55)", transform: active ? "scale(1.12)" : "scale(1)", transition:"all 0.18s", }}> {tab.icon} </button> ); })} </div>

</div> );