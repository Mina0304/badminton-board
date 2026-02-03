const API_URL =
  "https://script.google.com/macros/s/AKfycbyg_h0KqcPVuojAXTJROQ8Zg6x-mXHsYceYGUbyDzYVhWnwtPWZ72L0jtuuhMXcG_2mcg/exec";

/* 內建賽程（比賽名稱）
   ✅ 這裡請貼你原本那一整段 SCHEDULES（完全不改）
*/
const SCHEDULES = {
    "2026-02-07": {
    court1:["男團1","男團7","男雙1","男雙7","女雙2","男單1","男單7","女單4","男雙17","男單10","女雙9","男團8","男團14","男雙23","男雙29","女雙16","男雙34","男團15"],
    court2:["男團2","女團1","男雙2","男雙8","女雙3","男單2","男單8","男雙12","男雙18","男單11","女雙10","男團9","女團6","男雙24","男雙30","女雙17","男雙35","男團16"],
    court3:["男團3","女團2","男雙3","男雙9","女雙4","男單3","男單9","男雙13","男雙19","男單12","女雙11","男團10","女團7","男雙25","男雙31","女雙18","男雙36","男團17"],
    court4:["男團4","女團3","男雙4","男雙10","女雙5","男單4","女單1","男雙14","男雙20","男單13","女雙12","男團11","女團8","男雙26","男雙32","女雙19","男雙37","男團18"],
    court5:["男團5","女團4","男雙5","男雙11","女雙6","男單5","女單2","男雙15","男雙21","男單14","女雙13","男團12","女團9","男雙27","男雙33","女雙20","男雙38","男團19"],
    court6:["男團6","女團5","男雙6","女雙1","女雙7","男單6","女單3","男雙16","男雙22","女雙8","女雙14","男團13","女團10","男雙28","女雙15","女雙21","男雙39","男團20"]
  },
  "2026-02-08": {
    court1:["男團21","男單15","男單21","男單23","女雙23","女單11","男單32","男團22","女雙30","男雙39","男雙45","男團26","男單39","男團30","男團32"],
    court2:["女團11","男單16","男單22","男單24","女雙24","女單12","男單33","男團23","女雙31","男雙40","男雙46","男團27","女單17","男團31","男雙54","男團33","男雙55","男單43"],
    court3:["女團12","男單17","女單5","男單25","女雙25","男單28","男單34","男團24","女單13","男雙41","男雙47","男團28","女單18","女團20"],
    court4:["女團13","男單18","女單6","男單26","女雙26","男單29","男單35","男團25","女單14","男雙42","男單36","男團29","男雙48","男雙51","男單40","女單19","男雙52"],
    court5:["女團14","男單19","女單7","男單27","女單9","男單30","女雙28","女團16","女單15","男雙43","男單37","女團18","男雙49","女雙32","男單41","男雙53","女雙34","女團21","女單20"],
    court6:["女團15","男單20","女單8","女雙22","女單10","男單31","女雙29","女團17","女單16","男雙44","男單38","女團19","男雙50","女雙33","女單19","男單42"]
  }
};

/* ✅ 畫面上顯示除錯/狀態（不需要 Console） */
function showOnPage(msg){
  let el = document.getElementById("debug");
  if(!el){
    el = document.createElement("div");
    el.id = "debug";
    el.style.cssText =
      "position:fixed;left:12px;bottom:12px;right:12px;z-index:9999;" +
      "background:#111;border:1px solid #444;border-radius:12px;padding:10px;" +
      "font:12px/1.4 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;" +
      "color:#fff;opacity:.9;white-space:pre-wrap";
    document.body.appendChild(el);
  }
  el.textContent = msg;
}

/* 日期正規化：把 2026-02-07T15:00:00.000Z 變成 2026-02-07 */
function normalizeDate(v){
  if(!v) return null;
  let s = String(v).trim();
  if(s.includes("T")) s = s.split("T")[0];
  s = s.replace(/\//g,"-");

  if(/^\d{1,2}-\d{1,2}$/.test(s)){
    const [m,d]=s.split("-").map(x=>x.padStart(2,"0"));
    return `2026-${m}-${d}`;
  }
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if(m) return `${m[1]}-${m[2].padStart(2,"0")}-${m[3].padStart(2,"0")}`;
  return null;
}

/* ✅ 超穩 JSONP：同時送 callback / cb / jsonp 三種參數名 */
function loadJSONP(){
  return new Promise((resolve,reject)=>{
    const cb = "cb_" + Date.now() + "_" + Math.random().toString(36).slice(2);
    window[cb] = (p) => { delete window[cb]; script.remove(); resolve(p); };

    const script = document.createElement("script");
    const u = `${API_URL}?type=get&callback=${cb}&cb=${cb}&jsonp=${cb}&_=${Date.now()}`;
    script.src = u;
    script.onerror = () => reject(new Error("JSONP 載入失敗（可能網路或 URL 錯）"));
    document.body.appendChild(script);
  });
}

function render(state){
  const host = document.getElementById("courts");
  if(!host){
    showOnPage("❌ 找不到 <div id=\"courts\">：請確認 index.html 有這行：<div id=\"courts\" class=\"courts\"></div>");
    return;
  }

  const rawDate = (state.date ?? state.day ?? state.Date ?? "").toString().trim();
  const dateIso = normalizeDate(rawDate) || "2026-02-07";

  const day = SCHEDULES[dateIso] || SCHEDULES["2026-02-07"];
  if(!day){
    showOnPage(`❌ SCHEDULES 沒有這天：${dateIso}\n請確認 SCHEDULES key 是 "2026-02-07" / "2026-02-08"`);
    return;
  }

  host.innerHTML = "";
  for(let c=1;c<=6;c++){
    const idx = Number(state[`court${c}`] ?? 0);
    const list = day[`court${c}`] || [];

    let now="—", next="—";
    if(state.status === "中場休息"){
      now = next = "中場休息";
    }else{
      now  = list[idx]   ?? "—";
      next = list[idx+1] ?? "—";
    }

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="name">Court ${c}</div>
      <div class="now">現在：${now}</div>
      <div class="next">下一場：${next}</div>
    `;
    host.appendChild(card);
  }

  // ✅ 在畫面上顯示「真的吃到哪一天/哪個 idx」，你一眼就知道有沒有切成功
  showOnPage(
    `✅ 已更新\n` +
    `date(raw) = ${rawDate}\n` +
    `dateIso   = ${dateIso}\n` +
    `status    = ${state.status}\n` +
    `court1..6 = ${[1,2,3,4,5,6].map(i=>state["court"+i]).join(", ")}\n` +
    `_updated  = ${state._updated || ""}`
  );
}

async function tick(){
  try{
    const p = await loadJSONP();
    if(!p || !p.ok){
      showOnPage(`❌ 後端回傳 ok=false\n${JSON.stringify(p)}`);
      return;
    }
    render(p.data || {});
  }catch(e){
    showOnPage("❌ " + (e && e.message ? e.message : String(e)));
  }
}

/* ✅ 等 DOM 好了再跑，避免 courts 還沒出現 */
window.addEventListener("DOMContentLoaded", ()=>{
  tick();
  setInterval(tick, 1000);
});
