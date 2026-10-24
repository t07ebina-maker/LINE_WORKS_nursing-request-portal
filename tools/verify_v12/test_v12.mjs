// 統合版v12：全組み合わせの依頼文生成＋仕様の構造チェック＋画面操作での送信までの確認
import { openPage } from './cdp.mjs';
import { writeFileSync } from 'node:fs';

const html = process.argv[2], outJson = process.argv[3];
const pg = await openPage(html);

const GEN = `(() => {
  const out = []; let n = 0;
  const setv = (id, v) => { qs('#' + id).value = v; };
  for (const role of ['nurse', 'doctor']) {
    st.role = role;
    for (const e of data[role].entries) {
      const combos = [];
      if (e.type === 'edu') educationOptions[role].map(otherOpt).forEach(t => combos.push({ eduType: t }));
      else e.groups.forEach(g => g.actions.forEach(a => {
        const opts = ((requestOptions[role] && requestOptions[role][a]) || [OTHER_OPT]).map(otherOpt);
        opts.forEach(o => combos.push({ group: g.label, action: a, support: o }));
      }));
      for (const c of combos) {
        n++;
        const affs = affiliationOptions[role].flatMap(cat => cat.items.map(i => [cat.label, i]));
        const [affCat, aff] = affs[n % affs.length];
        st.entry = e; st.group = c.group || ''; st.action = c.action || '';
        syncInput();
        st.affCat = affCat; st.aff = aff; renderAffCats();
        setv('affOther', aff === AFF_OTHER ? '研修医' + n : '');
        st.support = c.support || ''; st.eduType = c.eduType || '';
        st.urgency = n % 2 ? '本日中' : '至急ではない';
        st.callback = n % 3 ? '要' : '不要（メッセージで十分）';
        st.ward = wardOptions[n % wardOptions.length];
        setv('name', 'テスト 花子' + n); setv('contact', '内線' + (1000 + n));
        setv('pid', role === 'doctor' && n % 4 === 0 ? '' : String(10000000 + n));
        setv('pname', 'テスト 太郎' + n);
        setv('status', n % 3 === 0 ? '' : '状況1行目' + n + (n % 5 === 0 ? '\\n\\n・状況2行目' : ''));
        setv('note', n % 4 === 1 ? 'その他' + n + '\\n補足行' : '');
        setv('supportOther', c.support === OTHER_OPT ? '入力した依頼内容' + n : '');
        setv('eduOther', c.eduType === OTHER_OPT ? '入力した希望' + n : '');
        setv('theme', c.eduType === THEME_OPT ? '褥瘡予防のポジショニング' + n : '');
        const dps = deptGroups(role).flatMap(g => g.items.map(i => [g.label, i]));
        const [deptCat, dept] = dps[(n * 7) % dps.length];
        st.deptCat = deptCat; st.dept = dept; renderDept();
        setv('deptOther', dept === AFF_OTHER ? '合同勉強会' + n : '');
        st.members = c.eduType ? ['', ...MEMBERS][n % 6] : '';
        st.timing  = c.eduType ? ['', ...TIMING][n % 5] : '';
        out.push({ n, role, roleLabel: data[role].label, entryNo: e.no, entryLabel: e.label, type: e.type,
          group: c.group || '', action: c.action || '', support: c.support || '', eduType: c.eduType || '',
          supportOther: val('supportOther'), eduOther: val('eduOther'), theme: val('theme'),
          supportValue: supportValue(), eduValue: eduValue(),
          affCat, aff, affOther: val('affOther'), affValue: affValue(), urgency: st.urgency, callback: st.callback, ward: st.ward,
          name: val('name'), contact: val('contact'), pid: val('pid'), pname: val('pname'), status: val('status'), note: val('note'),
          deptCat, dept, deptOther: val('deptOther'), deptValue: deptValue(), members: st.members, timing: st.timing,
          text: buildRequestText() });
      }
    }
  }
  return out;
})()`;

const cases = await pg.evaluate(GEN);
const fails = [];
const SECTIONS = ['【依頼者】', '【相談・依頼】', '【対象患者】', '【現在の状況】', '【その他】'];
for (const c of cases) {
  const L = c.text.split('\n');
  const bad = m => fails.push(`#${c.n} ${c.role} ${c.action || c.eduType}: ${m}`);
  if (L.some(x => !x.trim())) bad('空行がある');
  const edu = c.type === 'edu';
  const tag = edu ? (c.role === 'nurse' ? '勉強会・教育' : '教育・その他') : c.urgency;
  if (L[0] !== `［${tag}］`) bad('1行目: ' + L[0]);
  const second = edu ? `${c.eduValue}／${c.deptValue}` : `${c.action}／${c.ward}`;
  if (L.includes('その他（入力する）') || L.some(x => x.includes('自由記載に記載'))) bad('「その他」の選択肢の文字が残っている');
  if (c.support === 'その他（入力する）' && c.supportValue !== c.supportOther) bad('その他の依頼内容');
  if (c.eduType === 'その他（入力する）' && c.eduValue !== c.eduOther) bad('その他の希望');
  if (c.dept === 'その他' && c.deptValue !== c.deptOther) bad('対象部署その他');
  if (L[1] !== second) bad('2行目: ' + L[1]);
  if (!edu && (L.slice(0, 2).join('').includes(c.pname) || (c.pid && L.slice(0, 2).join('').includes(c.pid)))) bad('要約行に患者識別情報');
  const heads = L.filter(x => /^【.+】$/.test(x));
  const expHeads = edu
    ? ['【依頼者】', '【依頼内容】', '【対象・時期】'].concat(c.note ? ['【その他】'] : [])
    : ['【依頼者】', '【行為】', '【依頼内容】', '【対象患者】'].concat(c.status ? ['【現在の状況】'] : []).concat(c.note ? ['【その他】'] : []);
  if (JSON.stringify(heads) !== JSON.stringify(expHeads)) bad('見出し: ' + heads.join(''));
  const i = L.indexOf('【依頼者】');
  const expReq = [`${c.roleLabel}：${c.name}`, `所属：${c.affValue}`, `連絡先：${c.contact}`, `折り返し：${c.callback}`];
  if (JSON.stringify(L.slice(i + 1, i + 5)) !== JSON.stringify(expReq)) bad('依頼者: ' + L.slice(i + 1, i + 5).join('|'));
  if (c.aff === 'その他' && c.affValue !== c.affOther) bad('所属その他');
  if (L.includes(c.entryLabel)) bad('メニュー名の行が残っている');
  if (L.some(x => /^\d+_/.test(x) || x.includes('の具体的な特定行為') || /^(行為|内容)：/.test(x))) bad('旧形式・試作の名残');
  const nextOf = h => L[L.indexOf(h) + 1];
  if (!edu) {
    if (nextOf('【行為】') !== c.action || nextOf('【依頼内容】') !== c.supportValue) bad('行為・依頼内容');
    const k = L.indexOf('【対象患者】');
    const exp = [`ID：${c.pid || '未記載'}`, `氏名：${c.pname}`, `病棟・部署：${c.ward}`];
    if (JSON.stringify(L.slice(k + 1, k + 4)) !== JSON.stringify(exp)) bad('対象患者');
  } else {
    if (nextOf('【依頼内容】') !== c.eduValue || nextOf('【対象・時期】') !== `対象部署：${c.deptValue}`) bad('教育の内容');
    if (c.eduType === '部署の勉強会に来て講義してほしい' && L[L.indexOf('【依頼内容】') + 2] !== `テーマ：${c.theme}`) bad('テーマ');
    if (c.eduType !== '部署の勉強会に来て講義してほしい' && L.some(x => x.startsWith('テーマ：'))) bad('テーマが余計に出る');
    if (L.includes(`参加予定人数：${c.members}`) !== !!c.members || L.includes(`希望時期：${c.timing}`) !== !!c.timing) bad('人数・時期');
    if (!L.includes(`緊急度：${c.urgency}`)) bad('教育の緊急度');
    if (L[L.length - 1] !== '※受付一覧の登録対象外') bad('対象外の注記');
  }
}

// 画面操作：看護師・医師それぞれ、ボタンを押して確認画面まで進み、記憶した所属が次回に入るか
const FLOW = role => `(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const click = el => { if (!el) throw new Error('要素なし'); el.click(); };
  const chip = (box, text) => click([...qs(box).querySelectorAll('.btn')].find(b => b.textContent === text));
  localStorage.clear(); reset();
  click(qs('.role[data-role=${role}]'));
  click(qs('#entryBox .btn'));
  click(qs('#actionBox .action'));
  qs('#name').value = '画面 太郎';
  chip('#affCat', affiliationOptions['${role}'][1].label);
  chip('#affBox', affiliationOptions['${role}'][1].items[0]);
  qs('#contact').value = '内線9999';
  qs('#remember').checked = true;
  qs('#pid').value = '12345678'; qs('#pname').value = '画面 花子';
  const sameShown = !qs('#wardSame').classList.contains('hide');
  const sameText = sameShown ? qs('#wardSame').textContent : '';
  let sameOk = null;
  if (sameShown) { click(qs('#wardSame .btn')); sameOk = st.ward === st.aff && st.wardCat === '重症' && qs('#wardBox .sel')?.textContent === st.aff; }
  chip('#wardCat', '病棟'); const clearedOnCat = st.ward === '';
  chip('#wardCat', '重症'); chip('#wardBox', '東8HCU');
  click(qs('#support .btn'));
  chip('#urgency', '本日中'); chip('#callback', '要');
  qsa('.prechoice').forEach(c => { if (c.id.endsWith('_0')) c.checked = true; });
  qsa('.precheck').forEach(c => c.checked = true);
  click(qs('#next'));
  const text = qs('#copyPreview').value, screen = st.screen, msg = qs('#msg').textContent;
  // 記憶の確認：新しい依頼で同じ職種を選ぶと所属が入っている
  reset();
  click(qs('.role[data-role=${role}]')); click(qs('#entryBox .btn')); click(qs('#actionBox .action'));
  const restored = { name: qs('#name').value, aff: st.aff, sel: [...qs('#affBox').querySelectorAll('.sel')].map(b => b.textContent) };
  // 職種を変えると所属は空
  reset();
  click(qs('.role[data-role=${role === 'nurse' ? 'doctor' : 'nurse'}]')); click(qs('#entryBox .btn')); click(qs('#actionBox .action'));
  const other = st.aff;
  // 旧形式の記憶（氏名／所属）は氏名だけ入る
  localStorage.setItem(STORE_KEY, JSON.stringify({ name: '旧 太郎／西６病棟', contact: '内線1' })); reset();
  const legacy = qs('#name').value;
  // その他を選ぶと入力欄、空なら所属が未入力扱い
  click(qs('.role[data-role=${role}]')); click(qs('#entryBox .btn')); click(qs('#actionBox .action'));
  const cats = affiliationOptions['${role}']; const oc = cats.find(c => c.items.includes(AFF_OTHER));
  chip('#affCat', oc.label); chip('#affBox', AFF_OTHER);
  const otherShown = !qs('#affOtherField').classList.contains('hide');
  qs('#affOther').value = '';
  click(qs('#next'));
  const lackMsg = qs('#msg').textContent;
  return { text, screen, msg, restored, other, legacy, otherShown, lackMsg, sameShown, sameText, sameOk, clearedOnCat };
})()`;
const flows = {};
for (const r of ['nurse', 'doctor']) flows[r] = await pg.evaluate(FLOW(r));
for (const [r, f] of Object.entries(flows)) {
  if (f.screen !== 'confirm') fails.push(`flow ${r}: 確認画面へ進まない ${f.msg}`);
  if (!f.text.startsWith('［本日中］\n')) fails.push(`flow ${r}: 依頼文 ${f.text.slice(0, 30)}`);
  if (!f.text.includes('病棟・部署：東8HCU')) fails.push(`flow ${r}: 病棟・部署`);
  if (r === 'nurse' && !(f.sameShown && f.sameText === '所属と同じ：東5ICU' && f.sameOk)) fails.push(`flow nurse: 所属と同じ ${f.sameText} ${f.sameOk}`);
  if (r === 'doctor' && f.sameShown) fails.push('flow doctor: 医師に所属と同じが出た');
  if (r === 'nurse' && !f.clearedOnCat) fails.push('flow nurse: 区分を変えても病棟・部署が残る');
  if (f.restored.name !== '画面 太郎' || !f.restored.aff || f.restored.sel[0] !== f.restored.aff) fails.push(`flow ${r}: 記憶の復元 ${JSON.stringify(f.restored)}`);
  if (f.other !== '') fails.push(`flow ${r}: 職種を変えても所属が残る`);
  if (f.legacy !== '旧 太郎') fails.push(`flow ${r}: 旧形式の記憶 ${f.legacy}`);
  if (!f.otherShown) fails.push(`flow ${r}: その他の入力欄が出ない`);
  if (!f.lackMsg.includes('所属')) fails.push(`flow ${r}: その他空欄で止まらない ${f.lackMsg}`);
}

// 画面操作2：「その他」の入力必須、勉強会のテーマ・対象部署・人数・時期
const FLOW2 = `(async () => {
  const click = el => { if (!el) throw new Error('要素なし'); el.click(); };
  const chip = (box, text) => click([...qs(box).querySelectorAll('.btn')].find(b => b.textContent === text || b.textContent.startsWith(text)));
  const r = {};
  const common = () => { qs('#name').value = '画面 太郎'; qs('#contact').value = '内線1'; chip('#urgency', '本日中'); chip('#callback', '要'); };
  // 看護師・患者：その他を選んで空欄 → 止まる、入力 → 進む
  localStorage.clear(); reset();
  click(qs('.role[data-role=nurse]')); click(qs('#entryBox .btn')); click(qs('#actionBox .action'));
  common(); chip('#affCat', '病棟'); chip('#affBox', '西6');
  qs('#pid').value = '1'; qs('#pname').value = '画面 花子'; chip('#wardSame', '所属と同じ');
  chip('#support', 'その他（入力する）');
  r.otherShown = !qs('#supportOtherField').classList.contains('hide');
  qsa('.prechoice').forEach(c => { if (c.id.endsWith('_0')) c.checked = true; }); qsa('.precheck').forEach(c => c.checked = true);
  click(qs('#next')); r.otherMsg = qs('#msg').textContent; r.otherScreen = st.screen;
  qs('#supportOther').value = '入力した依頼'; click(qs('#next'));
  r.otherText = qs('#copyPreview').value; r.otherScreen2 = st.screen;
  // 看護師・勉強会：講義 → テーマ必須、対象部署は所属と同じ、人数はもう一度押すと外れる
  reset();
  click(qs('.role[data-role=nurse]')); click([...qsa('#entryBox .btn')].find(b => b.textContent.includes('勉強会')));
  common(); chip('#affCat', '病棟'); chip('#affBox', '西6');
  chip('#eduType', '部署の勉強会に来て講義してほしい');
  r.themeShown = !qs('#themeField').classList.contains('hide');
  r.deptSame = qs('#deptSame').textContent;
  chip('#deptSame', '所属と同じ');
  chip('#membersBox', '6〜10名'); chip('#membersBox', '6〜10名'); r.membersCleared = st.members === '';
  chip('#timingBox', '来月');
  click(qs('#next')); r.themeMsg = qs('#msg').textContent;
  qs('#theme').value = '褥瘡予防'; click(qs('#next'));
  r.eduText = qs('#copyPreview').value; r.eduScreen = st.screen;
  // 医師・教育：対象部署の区分は6つ、その他は入力必須
  reset();
  click(qs('.role[data-role=doctor]')); click([...qsa('#entryBox .btn')].find(b => b.textContent.includes('教育')));
  common(); chip('#affCat', '内科系の診療科'); chip('#affBox', '循環器内科');
  chip('#eduType', '症例について');
  r.docCats = [...qsa('#deptCat .btn')].map(b => b.textContent);
  r.docSame = qs('#deptSame').textContent;
  chip('#deptCat', '専門診療科・その他'); chip('#deptBox', 'その他');
  r.deptOtherShown = !qs('#deptOtherField').classList.contains('hide');
  click(qs('#next')); r.deptMsg = qs('#msg').textContent;
  qs('#deptOther').value = '研修医室'; click(qs('#next'));
  r.docText = qs('#copyPreview').value; r.docScreen = st.screen;
  return r;
})()`;
const g = await pg.evaluate(FLOW2);
const chk = (ok, m) => { if (!ok) fails.push('flow2: ' + m); };
chk(g.otherShown, 'その他の入力欄が出ない');
chk(g.otherScreen === 'input' && g.otherMsg.includes('依頼内容（その他）'), 'その他空欄で止まらない ' + g.otherMsg);
chk(g.otherScreen2 === 'confirm' && g.otherText.includes('【依頼内容】\n入力した依頼\n'), 'その他の入力が依頼文に出ない');
chk(g.otherText.includes('病棟・部署：西6'), '病棟・部署の所属と同じ');
chk(g.themeShown, 'テーマ欄が出ない');
chk(g.deptSame === '所属と同じ：西6', '対象部署の所属と同じ ' + g.deptSame);
chk(g.membersCleared, '人数をもう一度押しても外れない');
chk(g.themeMsg.includes('勉強会のテーマ'), 'テーマ空欄で止まらない ' + g.themeMsg);
chk(g.eduScreen === 'confirm' && g.eduText.startsWith('［勉強会・教育］\n部署の勉強会に来て講義してほしい／西6\n')
    && g.eduText.includes('【依頼内容】\n部署の勉強会に来て講義してほしい\nテーマ：褥瘡予防\n【対象・時期】\n対象部署：西6\n希望時期：来月\n緊急度：本日中'), '勉強会の依頼文\n' + g.eduText);
chk(!g.eduText.includes('参加予定人数'), '人数を外したのに出る');
chk(JSON.stringify(g.docCats) === JSON.stringify(['内科系の診療科', '外科系の診療科', '専門診療科・その他', '病棟', '重症', '外来']), '医師の対象部署の区分 ' + g.docCats);
chk(g.docSame === '所属と同じ：循環器内科', '医師の所属と同じ ' + g.docSame);
chk(g.deptOtherShown && g.deptMsg.includes('対象部署'), '対象部署その他の入力必須 ' + g.deptMsg);
chk(g.docScreen === 'confirm' && g.docText.includes('対象部署：研修医室'), '医師の対象部署その他');

writeFileSync(outJson, JSON.stringify({ cases, flows, flow2: g }, null, 1), 'utf8');
console.log(`cases ${cases.length} fail ${fails.length} pageerrors ${pg.errors.length}`);
fails.slice(0, 30).forEach(f => console.log('FAIL', f));
pg.errors.forEach(e => console.log('PAGEERR', e));
console.log('--- 例：看護師 ---\n' + flows.nurse.text + '\n--- 例：医師 ---\n' + flows.doctor.text);
pg.close();
process.exit(0);
