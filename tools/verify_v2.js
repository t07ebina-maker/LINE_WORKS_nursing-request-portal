// 使い方：npm i -D playwright && npx playwright install chromium
//         node tools/verify_v2.js index_v2.html 出力フォルダ
// index_v2.html の全経路を自動操作し、出力文をExcel（M_Uketsuke）と同じ規則で読み取って照合する。
const { chromium } = require('playwright');
const nodePath=require('path');const path=require('url').pathToFileURL(nodePath.resolve(process.argv[2]||'index_v2.html')).href, out=nodePath.resolve(process.argv[3]||'.');
// VBA（M_Uketsuke）の抽出規則を移植
const items = [['依頼メニュー','メニュー',0],['の具体的な特定行為','行為',0],['依頼内容','複数',1],['対象患者ID','単一',1],
 ['対象患者氏名','単一',1],['対象患者入院病棟','単一',1],['対象患者の現在の状況・説明','複数',0],['緊急度','選択',0],['折り返し希望','選択',0],['その他・自由記載','複数',0]];
const skips=['メニュー','テンプレート','作成者','처음 설문','최근 설문'];
const B='*-・●○•–';
function norm(s){let t=s.replace(/　/g,' ').replace(/\t/g,' ').trim();while(t&&B.includes(t[0]))t=t.slice(1).trim();while(t&&':：'.includes(t.slice(-1)))t=t.slice(0,-1).trim();return t;}
function isBul(s){const t=s.replace(/　/g,' ').trim();return t.length>=2&&'*-・●○•'.includes(t[0]);}
function parse(text){
  const raw=text.split('\n');const vals={},flags={};let cur=-1,body=[];
  const store=()=>{if(cur<0||!body.length)return;const[l,k]=items[cur];
    if(k==='選択'||k==='行為'){const b=body.filter(x=>x.b);vals[l]=b.length===1?b[0].t:b.length>1?'要確認':body[0].t;if(b.length>1)flags[l]=1;}
    else if(k==='単一')vals[l]=body[0].t;else vals[l]=body.map(x=>x.t).join('\n');};
  for(const r of raw){const n=norm(r);if(!n||n[0]==='※'||skips.some(s=>n.startsWith(s)))continue;
    let k=items.findIndex(([l,kd])=>kd!=='メニュー'&&(kd==='行為'?(n.length>l.length&&n.endsWith(l)):n===l));
    if(k>=0){store();cur=k;body=[];}else if(cur>=0)body.push({t:n,b:isBul(r)});}
  store();
  for(const[l,k]of items)if(k==='選択'&&(!vals[l]||vals[l]==='要確認')){vals[l]='要確認';flags[l]=1;}
  for(const r of raw){const s=norm(r);const p=s.indexOf('_');if(s.length>2&&p>=1&&p<=3&&/^\d+$/.test(s.slice(0,p))){vals['依頼メニュー']=s.replace('(依頼)','').replace('（依頼）','').trim();break;}}
  return {vals,flags};
}
(async()=>{
  const br=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
  const pg=await br.newPage({viewport:{width:390,height:844}});
  await pg.goto(path);
  let n=0,fail=0;const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.screenshot({path:out+'/s1_top.png',fullPage:true});
  for(const role of ['nurse','doctor']){
    const entries=await pg.evaluate(r=>data[r].entries.map(e=>({no:e.no,label:e.label,type:e.type,acts:(e.groups||[]).flatMap(g=>g.actions.map(a=>[g.label,a]))})),role);
    for(const e of entries){
      const list=e.type==='edu'?[[null,null]]:e.acts;
      for(const[g,a]of list){
        await pg.evaluate(()=>reset());
        await pg.click(`.role[data-role=${role}]`);
        await pg.locator('#entryBox .btn',{hasText:e.label}).click();
        if(a) await pg.locator('#actionBox .btn').filter({has:pg.locator('strong',{hasText:new RegExp('^'+a.replace(/[()（）.*+?]/g,'\\$&')+'$')})}).first().click();
        await pg.fill('#name','試験 太郎／西６病棟');await pg.fill('#contact','PHS 1234');
        if(e.type==='edu'){await pg.locator('#eduType .btn').first().click();await pg.fill('#dept','西６');}
        else{await pg.fill('#pid',role==='nurse'?'1234567':'');await pg.fill('#pname','合成 花子');
          await pg.locator('#wardBox .btn').nth(1).click();await pg.locator('#support .btn').first().click();
          await pg.fill('#status','SpO2 92%\n経過観察中');}
        await pg.locator('#urgency .btn').nth(1).click();await pg.locator('#callback .btn').first().click();
        await pg.fill('#note','合成データ');
        for(const c of await pg.locator('.precheck').all()) await c.check();
        for(const c of await pg.locator('.prechoice[id$="_0"]').all()) await c.check();
        await pg.click('#next');
        const scr=await pg.evaluate(()=>st.screen);
        const text=await pg.inputValue('#copyPreview');
        n++;
        if(scr!=='confirm'){fail++;console.log('NG not confirm',role,e.label,a,await pg.textContent('#msg'));continue;}
        const {vals,flags}=parse(text);
        if(e.type==='edu'){ if(Object.keys(vals).some(k=>vals[k]&&vals[k]!=='要確認')){fail++;console.log('NG edu extracted',vals);} continue; }
        const sup=await pg.evaluate(()=>st.support);
        const exp={'依頼メニュー':e.no+'_'+e.label,'の具体的な特定行為':a,'依頼内容':sup,'対象患者ID':role==='nurse'?'1234567':'未記載','対象患者氏名':'合成 花子','対象患者入院病棟':'西６','対象患者の現在の状況・説明':'SpO2 92%\n経過観察中','緊急度':'本日中','折り返し希望':'要','その他・自由記載':'合成データ'};
        for(const k in exp) if(vals[k]!==exp[k]||flags[k]){fail++;console.log('NG',role,a,k,JSON.stringify(vals[k]),'exp',exp[k]);}
        if(n===3){await pg.screenshot({path:out+'/s3_confirm.png',fullPage:true});console.log(text);}
      }
    }
  }
  // 画面サンプル
  await pg.evaluate(()=>reset());await pg.click('.role[data-role=nurse]');
  await pg.screenshot({path:out+'/s2_entry.png',fullPage:true});
  await pg.locator('#entryBox .btn').first().click();await pg.screenshot({path:out+'/s2_actions.png',fullPage:true});
  await pg.locator('#actionBox .btn').first().click();await pg.click('#next');await pg.screenshot({path:out+'/s2_input.png',fullPage:true});
  console.log('cases',n,'fail',fail,'pageerrors',errs.length,errs.slice(0,3));
  await br.close();
})();
