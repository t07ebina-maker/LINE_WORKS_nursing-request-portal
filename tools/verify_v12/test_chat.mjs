// チャット版v8：統合版v12と同じ入力で依頼文が一致するか＋画面操作（所属の2段階・前回と同じ・その他）
import { openPage } from './cdp.mjs';
import { readFileSync } from 'node:fs';

const html = process.argv[2];
const { cases } = JSON.parse(readFileSync(process.argv[3], 'utf8'));
const pg = await openPage(html, 9334);
const fails = [];

const res = await pg.evaluate(`(() => {
  const cases = ${JSON.stringify(cases)};
  return cases.map(c => {
    const e = data[c.role].entries.find(x => x.no === c.entryNo);
    const s = { role: c.role, entry: e, group: c.group, action: c.action, support: c.support, eduType: c.eduType,
      affCat: c.affCat, aff: c.aff, affOther: c.affOther, urgency: c.urgency, callback: c.callback, ward: c.ward,
      name: c.name, contact: c.contact, pid: c.pid, pname: c.pname, status: c.status, note: c.note,
      supportOther: c.supportOther, eduOther: c.eduOther, theme: c.theme,
      deptCat: c.deptCat, dept: c.dept, deptOther: c.deptOther, members: c.members, timing: c.timing };
    return buildRequestText(s);
  });
})()`);
cases.forEach((c, i) => { if (res[i] !== c.text) fails.push(`一致せず #${c.n} ${c.role} ${c.action || c.eduType}`); });

// 画面操作：ボタン・入力欄を実際に押して確認画面まで進める
const FLOW = `(async () => {
  const find = text => [...qsa('#answer .choice')].find(x => x.textContent === text || x.textContent.startsWith(text));
  // v9以降：はじめの確認（緊急でないこと）が出ていれば「緊急ではない」を押してから探す
  const btn = text => { let b = find(text); if (!b && find('緊急ではない')) { find('緊急ではない').click(); b = find(text); } if (!b) throw new Error('ボタンなし: ' + text + ' / ' + [...qsa('#answer .choice')].map(x => x.textContent).join('|')); b.click(); };
  const type = v => { qs('#reply').value = v; qs('#answer .sendq').click(); };
  const skip = () => { const b = qs('#answer .skip .choice'); b.click(); };
  const run = (role, affSteps, useSame) => {
    hist = []; render();
    btn(role === 'nurse' ? '看護師' : '医師');
    btn(role === 'nurse' ? '患者のことを相談・依頼したい' : '具体的な特定行為を相談・依頼したい');
    btn('創傷・創部管理'); btn('陰圧閉鎖療法（NPWT）');
    qsa('#answer .choice')[0].click();          // 依頼内容
    type('12345678'); type('画面 花子');
    const wardFirst = qsa('#answer .choice')[0].textContent;
    if (useSame) btn('所属と同じ：'); else { btn('重症'); btn('東5ICU'); }
    type('状況です'); btn('至急ではない'); btn('不要（メッセージで十分）'); skip();
    if (qs('#answer .choice.primary')) btn('前回と同じ：'); else type('画面 太郎');   // 氏名
    affSteps();
    if (qs('#answer .choice.primary')) btn('前回と同じ：'); else type('PHS 1111');   // 連絡先
    btn('記憶する（個人の端末のみ）');
    if (role === 'nurse') { qsa('#answer .choice')[0].click(); btn('伝える（確認しました）'); }
    return { key: nextKey(stateOf(hist)), wardFirst, text: qs('#copyPreview') ? qs('#copyPreview').value : '' };
  };
  localStorage.clear();
  const out = {};
  out.nurse1 = run('nurse', () => { btn('外来'); btn('化学療法室'); });
  out.nurse2 = run('nurse', () => { out.prevLabel = qsa('#answer .choice')[0].textContent; btn('前回と同じ：'); });
  out.nurse3 = run('nurse', () => { btn('前回と同じ：'); }, true);
  out.doctor1 = run('doctor', () => { out.doctorPrevShown = qsa('#answer .choice')[0].textContent.startsWith('前回'); btn('専門診療科・その他'); btn('その他'); type('研修医'); });
  out.doctor2 = run('doctor', () => { btn('前回と同じ：'); });
  // 患者：依頼内容「その他」→ 入力の質問、空欄では進まない
  hist = []; render();
  btn('看護師'); btn('患者のことを相談・依頼したい'); btn('せん妄・BPSD');
  if (qsa('#answer .choice').some(b => b.textContent === 'せん妄・BPSD')) btn('せん妄・BPSD');
  btn('その他（入力する）');
  out.otherQ = qs('#answer .qhead').textContent;
  qs('#reply').value = ''; qs('#answer .sendq').click(); out.otherEmptyMsg = qs('#msg').textContent;
  type('入力した依頼');
  out.afterOther = nextKey(stateOf(hist));
  // 勉強会：講義 → テーマ、対象部署は所属と同じ（記憶した 化学療法室 は看護師の所属にある）、人数は選ばずに進む
  localStorage.setItem(STORE_KEY, JSON.stringify({ name: '画面 太郎', contact: '内線1', role: 'nurse', affCat: '外来', aff: '化学療法室', affOther: '' }));
  hist = []; render();
  btn('看護師'); btn('勉強会・教育を相談したい'); btn('部署の勉強会に来て講義してほしい');
  out.themeQ = qs('#answer .qhead').textContent; type('褥瘡予防');
  out.deptFirst = qsa('#answer .choice')[0].textContent; btn('所属と同じ：');
  btn('選ばずに進む'); btn('来月');
  btn('本日中'); btn('要'); skip();
  btn('前回と同じ：'); btn('前回と同じ：'); btn('前回と同じ：'); btn('記憶する（個人の端末のみ）');
  out.edu = { key: nextKey(stateOf(hist)), text: qs('#copyPreview') ? qs('#copyPreview').value : '' };
  // 医師：教育 → 対象部署の区分6つ、その他 → 入力
  hist = []; render();
  btn('医師'); btn('教育・その他を相談したい'); btn('症例について');
  out.docCats = qsa('#answer .choice').map(b => b.textContent);
  btn('専門診療科・その他'); btn('その他'); out.deptOtherQ = qs('#answer .qhead').textContent;
  localStorage.setItem(STORE_KEY, JSON.stringify({ name: '旧 太郎／西６病棟', contact: '内線1' }));
  out.legacyName = stored().name;
  return out;
})()`;
const f = await pg.evaluate(FLOW);
for (const k of ['nurse1', 'nurse2', 'nurse3', 'doctor1', 'doctor2']) if (f[k].key !== 'confirm') fails.push(`flow ${k}: 確認画面へ進まない (${f[k].key})`);
if (f.nurse1.wardFirst !== '病棟') fails.push('flow nurse1: 記憶なしで所属と同じが出た ' + f.nurse1.wardFirst);
if (f.nurse2.wardFirst !== '所属と同じ：化学療法室') fails.push('flow nurse2: 所属と同じが出ない ' + f.nurse2.wardFirst);
if (!f.nurse3.text.includes('病棟・部署：化学療法室')) fails.push('flow nurse3: 所属と同じで選べない');
if (!f.nurse3.text.split('\n')[1].endsWith('／化学療法室')) fails.push('flow nurse3: 2行目');
if (f.doctor2.wardFirst !== '病棟') fails.push('flow doctor2: 医師に所属と同じが出た ' + f.doctor2.wardFirst);
if (!f.nurse1.text.includes('所属：化学療法室')) fails.push('flow nurse1: 所属');
if (f.prevLabel !== '前回と同じ：化学療法室' || !f.nurse2.text.includes('所属：化学療法室')) fails.push('flow nurse2: 前回と同じ ' + f.prevLabel);
if (f.doctorPrevShown) fails.push('flow doctor1: 看護師の所属が医師に出た');
if (!f.doctor1.text.includes('所属：研修医') || !f.doctor2.text.includes('所属：研修医')) fails.push('flow doctor: その他の入力・記憶');
if (!f.nurse1.text.startsWith('［至急ではない］\n陰圧閉鎖療法（NPWT）／東5ICU\n') || !f.nurse1.text.includes('病棟・部署：東5ICU')) fails.push('flow nurse1: 1・2行目／病棟・部署');
if (f.legacyName !== '旧 太郎') fails.push('flow: 旧形式の記憶 ' + f.legacyName);
if (f.otherQ !== '依頼内容を入力してください。' || !f.otherEmptyMsg.includes('入力してから') || f.afterOther !== 'pid') fails.push(`flow: 依頼内容その他 ${f.otherQ} / ${f.otherEmptyMsg} / ${f.afterOther}`);
if (f.themeQ !== '勉強会のテーマを入力してください。') fails.push('flow: テーマの質問 ' + f.themeQ);
if (f.deptFirst !== '所属と同じ：化学療法室') fails.push('flow: 対象部署の所属と同じ ' + f.deptFirst);
if (f.edu.key !== 'confirm' || !f.edu.text.includes('【依頼内容】\n部署の勉強会に来て講義してほしい\nテーマ：褥瘡予防\n【対象・時期】\n対象部署：化学療法室\n希望時期：来月\n緊急度：本日中') || f.edu.text.includes('参加予定人数')) fails.push('flow: 勉強会の依頼文\n' + f.edu.text + ' ' + f.edu.key);
if (JSON.stringify(f.docCats) !== JSON.stringify(['内科系の診療科', '外科系の診療科', '専門診療科・その他', '病棟', '重症', '外来'])) fails.push('flow: 医師の対象部署の区分 ' + f.docCats);
if (f.deptOtherQ !== '対象部署を入力してください。') fails.push('flow: 対象部署その他の質問 ' + f.deptOtherQ);

console.log(`chat cases ${cases.length} fail ${fails.length} pageerrors ${pg.errors.length}`);
fails.slice(0, 30).forEach(x => console.log('FAIL', x));
pg.errors.forEach(e => console.log('PAGEERR', e));
console.log('--- 例：医師（所属その他） ---\n' + f.doctor1.text);
pg.close();
process.exit(0);
