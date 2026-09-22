/* ============================================================
   main.js  –  特定看護師 相談・依頼窓口 UI Mock
   ============================================================ */

/* ---------- データ定義 ---------- */

const data = {
  doctor: {
    label: '医師',
    entries: [
      {
        label: '具体的な特定行為を相談・依頼したい',
        type: 'patient',
        details: [
          { label: '呼吸の管理',
            actions: ['気管チューブ位置調整','侵襲的陽圧換気設定変更','人工呼吸器離脱','気切チューブ交換'] },
          { label: '循環・薬剤調整',
            actions: ['カテコラミン投与量調整','降圧剤投与量調整','鎮静薬投与量調整','抗精神病薬臨時投与',
                      '一時的ペースメーカ操作・管理','一時的ペースメーカリード抜去','IABP離脱補助頻度調整'] },
          { label: '輸液・電解質調整',
            actions: ['脱水症状への輸液補正','Na・K・Cl投与量調整','高カロリー輸液投与量調整'] },
          { label: '血管路管理',
            actions: ['PICC挿入','ミッドライン挿入','CV抜去','直接動脈穿刺採血','橈骨動脈ライン確保'] },
          { label: '創傷・創部管理',
            actions: ['壊死組織除去（デブリドマン）','陰圧閉鎖療法（NPWT）',
                      '心嚢ドレーン抜去','胸腔ドレーン抜去','腹腔ドレーン抜去','創部ドレーン抜去'] },
          { label: '感染対応',
            actions: ['感染徴候への薬剤臨時投与','感染対応の相談'] }
        ]
      },
      { label: '患者・家族との意思決定を支援してほしい', type: 'patient',
        details: ['意思決定支援','個別カンファレンス'] },
      { label: '教育・その他を相談したい', type: 'edu',
        details: ['教育・その他'] }
    ]
  },
  nurse: {
    label: '看護師',
    entries: [
      {
        label: '患者のことを相談したい',
        type: 'patient',
        details: [
          '気管チューブ位置調整','侵襲的陽圧換気設定変更','鎮静薬投与量調整','人工呼吸器離脱',
          '一時的ペースメーカ操作・管理','一時的ペースメーカリード抜去','IABP離脱補助頻度調整',
          '心嚢ドレーン抜去','胸腔ドレーン抜去','腹腔ドレーン抜去',
          '脱水症状への輸液補正','高カロリー輸液投与量調整',
          '感染徴候への薬剤臨時投与','カテコラミン投与量調整','Na・K・Cl投与量調整',
          '降圧剤投与量調整','抗精神病薬臨時投与','意思決定支援',
          '褥瘡・創傷ケア全般','せん妄・BPSD'
        ]
      },
      {
        label: '処置・実践を依頼したい',
        type: 'patient',
        details: [
          'CV抜去','PICC挿入','壊死組織除去（デブリドマン）','陰圧閉鎖療法（NPWT）',
          '創部ドレーン抜去','直接動脈穿刺採血','橈骨動脈ライン確保'
        ]
      },
      { label: '勉強会・教育を相談したい', type: 'edu',
        details: ['勉強会・教育'] }
    ]
  }
};

const requestOptions = {
  doctor: {
    '気管チューブ位置調整':         ['チューブ位置を確認・調整してほしい','固定位置の変更を依頼したい','その他（補足欄に記載）'],
    '侵襲的陽圧換気設定変更':       ['SpO2・換気が不安定で設定変更・実施を依頼したい','ウィーニングに向けた設定変更を依頼したい','その他（補足欄に記載）'],
    '人工呼吸器離脱':               ['離脱の実施を依頼したい','離脱のタイミングを相談したい','その他（補足欄に記載）'],
    '気切チューブ交換':             ['気切チューブの交換を依頼したい','交換のタイミングを相談したい','その他（補足欄に記載）'],
    'カテコラミン投与量調整':       ['バイタルが不安定でカテコラミンの増減を依頼したい','増量・減量の判断を相談したい','その他（補足欄に記載）'],
    '降圧剤投与量調整':             ['血圧が不安定で降圧剤の増減を依頼したい','目標血圧に達しておらず調整を依頼したい','その他（補足欄に記載）'],
    '鎮静薬投与量調整':             ['鎮静が深すぎるため減量を依頼したい','鎮静が浅くアジテーションがあり増量を依頼したい','鎮静レベルの評価・調整を相談したい','その他（補足欄に記載）'],
    '抗精神病薬臨時投与':           ['興奮・せん妄に対し抗精神病薬の投与を依頼したい','投与タイミング・量について相談したい','その他（補足欄に記載）'],
    '一時的ペースメーカ操作・管理': ['ペースメーカ設定の変更・確認を依頼したい','管理方針について相談したい','その他（補足欄に記載）'],
    '一時的ペースメーカリード抜去': ['リードが不要になったため抜去を依頼したい','抜去のタイミングを相談したい','その他（補足欄に記載）'],
    'IABP離脱補助頻度調整':         ['離脱に向けた補助頻度の変更を依頼したい','離脱のタイミングを相談したい','その他（補足欄に記載）'],
    '脱水症状への輸液補正':         ['脱水傾向があり輸液の開始・変更を依頼したい','補正方針について相談したい','その他（補足欄に記載）'],
    'Na・K・Cl投与量調整':          ['電解質補正が必要で投与量の調整を依頼したい','補正方針について相談したい','その他（補足欄に記載）'],
    '高カロリー輸液投与量調整':     ['高カロリー輸液の投与量変更を依頼したい','継続・中止の判断を相談したい','その他（補足欄に記載）'],
    'PICC挿入':                     ['長期輸液・抗菌薬投与のためPICC挿入を依頼したい','PICC適応について相談したい','その他（補足欄に記載）'],
    'ミッドライン挿入':             ['ミッドライン挿入を依頼したい','ミッドライン適応について相談したい','その他（補足欄に記載）'],
    'CV抜去':                       ['末梢確保ができたため抜去を依頼したい','退院・転棟前に抜去を依頼したい','抜去のタイミングを相談したい','その他（補足欄に記載）'],
    '直接動脈穿刺採血':             ['血液ガス・採血のため動脈穿刺採血を依頼したい','その他（補足欄に記載）'],
    '橈骨動脈ライン確保':           ['動脈圧モニタリングのためライン確保を依頼したい','頻回の動脈採血が必要なためライン確保を依頼したい','その他（補足欄に記載）'],
    '壊死組織除去（デブリドマン）': ['壊死組織がありデブリドマンの実施を依頼したい','デブリドマンの適応について相談したい','その他（補足欄に記載）'],
    '陰圧閉鎖療法（NPWT）':         ['NPWT適応について評価・判断を依頼したい','NPWT交換の実施を依頼したい','次回交換の時期・方法を相談したい','その他（補足欄に記載）'],
    '心嚢ドレーン抜去':             ['ドレーンが不要になったため抜去を依頼したい','抜去のタイミングを相談したい','その他（補足欄に記載）'],
    '胸腔ドレーン抜去':             ['ドレーンが不要になったため抜去を依頼したい','抜去のタイミングを相談したい','その他（補足欄に記載）'],
    '腹腔ドレーン抜去':             ['ドレーンが不要になったため抜去を依頼したい','抜去のタイミングを相談したい','その他（補足欄に記載）'],
    '創部ドレーン抜去':             ['ドレーンが不要になったため抜去を依頼したい','抜去のタイミングを相談したい','その他（補足欄に記載）'],
    '感染徴候への薬剤臨時投与':     ['感染徴候があり薬剤の臨時投与を依頼したい','抗菌薬の選択・調整を相談したい','その他（補足欄に記載）'],
    '感染対応の相談':               ['感染対応について相談したい','その他（補足欄に記載）'],
    '意思決定支援':                 ['患者・家族との意思決定支援を依頼したい','治療方針について一緒に整理したい','その他（補足欄に記載）'],
    '個別カンファレンス':           ['個別カンファレンスを依頼したい','多職種で方針整理をしたい','その他（補足欄に記載）']
  },
  nurse: {
    '気管チューブ位置調整':         ['チューブがずれている可能性があり確認・調整を依頼したい','固定がゆるく入れ直しを依頼したい','その他（補足欄に記載）'],
    '侵襲的陽圧換気設定変更':       ['SpO2・換気が不安定で設定変更が必要か相談したい','医師に報告する前に状態を相談したい','その他（補足欄に記載）'],
    '鎮静薬投与量調整':             ['鎮静が深すぎる・浅すぎると感じ調整を依頼したい','医師に報告する前に鎮静レベルを相談したい','その他（補足欄に記載）'],
    '人工呼吸器離脱':               ['離脱の実施を依頼したい','離脱後の観察・管理を相談したい','その他（補足欄に記載）'],
    '一時的ペースメーカ操作・管理': ['ペースメーカの動作・波形に変化があり相談したい','設定の確認・変更を依頼したい','その他（補足欄に記載）'],
    '一時的ペースメーカリード抜去': ['医師からリード抜去の話が出ており実施を依頼したい','抜去してよいか判断を相談したい','その他（補足欄に記載）'],
    'IABP離脱補助頻度調整':         ['IABP管理中に状態変化があり相談したい','補助頻度の変更を依頼したい','その他（補足欄に記載）'],
    '心嚢ドレーン抜去':             ['医師から抜去の話が出ており実施を依頼したい','排液の性状・量が変化しており評価・抜去の判断を相談したい','その他（補足欄に記載）'],
    '胸腔ドレーン抜去':             ['医師から抜去の話が出ており実施を依頼したい','エアリーク・排液量の変化について相談したい','その他（補足欄に記載）'],
    '腹腔ドレーン抜去':             ['医師から抜去の話が出ており実施を依頼したい','排液の性状・量が変化しており相談したい','その他（補足欄に記載）'],
    '脱水症状への輸液補正':         ['飲水・食事量が低下しており輸液継続の判断を相談したい','脱水・浮腫の兆候がありアセスメントを相談したい','輸液速度・内容の変更を依頼したい','その他（補足欄に記載）'],
    '高カロリー輸液投与量調整':     ['投与量の変更を依頼したい','輸液が終わりそうだが次の指示がなく相談したい','その他（補足欄に記載）'],
    '感染徴候への薬剤臨時投与':     ['感染徴候があり医師への報告前に相談したい','薬剤投与の指示が出ているが投与方法を確認したい','薬剤の臨時投与を依頼したい','その他（補足欄に記載）'],
    'カテコラミン投与量調整':       ['バイタルが不安定で医師への報告前にアセスメントを相談したい','カテコラミンの投与量調整を依頼したい','調整後の観察について相談したい','その他（補足欄に記載）'],
    'Na・K・Cl投与量調整':          ['電解質に異常値があり補正の判断を相談したい','投与量の変更を依頼したい','補正後の観察について相談したい','その他（補足欄に記載）'],
    '降圧剤投与量調整':             ['血圧が不安定で医師への報告前にアセスメントを相談したい','降圧剤の投与量調整を依頼したい','調整後の観察について相談したい','その他（補足欄に記載）'],
    '抗精神病薬臨時投与':           ['興奮・せん妄があり医師への報告前に対応を相談したい','抗精神病薬の投与を依頼したい','その他（補足欄に記載）'],
    '意思決定支援':                 ['患者対応について個別に相談したい','意思決定支援を依頼したい','その他（補足欄に記載）'],
    'CV抜去':                       ['医師から抜去の話が出ており実施を依頼したい','刺入部に発赤・滲出液があり抜去の判断を相談したい','退院前に抜去の実施を依頼したい','その他（補足欄に記載）'],
    'PICC挿入':                     ['末梢確保が困難でPICC挿入を相談したい','長期投与が必要でPICC適応について相談したい','その他（補足欄に記載）'],
    '壊死組織除去（デブリドマン）': ['壊死組織があるため評価・処置を依頼したい','デブリドマンの実施を依頼したい','創部の変化があり一緒に確認してほしい','その他（補足欄に記載）'],
    '陰圧閉鎖療法（NPWT）':         ['NPWT交換の実施を依頼したい（定期交換）','次回NPWT交換を依頼したい','キット・ドレッシングの交換方法を相談したい','その他（補足欄に記載）'],
    '創部ドレーン抜去':             ['医師から抜去の話が出ており実施を依頼したい','抜去してよいか判断を相談したい','その他（補足欄に記載）'],
    '直接動脈穿刺採血':             ['血液ガス採取のたびに医師を呼んでいるため採血を依頼したい','その他（補足欄に記載）'],
    '橈骨動脈ライン確保':           ['頻回の動脈採血があるためライン確保を依頼したい','既存ラインの固定が不安定で入れ直しを依頼したい','その他（補足欄に記載）'],
    '褥瘡・創傷ケア全般':           ['褥瘡の状態が変化しており評価・処置を相談したい','スキン-テアが発生しており処置・予防を相談したい','被覆材・外用薬の選択を相談したい','現在の処置が適切か評価してほしい','その他（補足欄に記載）'],
    'せん妄・BPSD':                 ['せん妄が疑われ対応を相談したい','BPSDへの対応について相談したい','療養環境の調整を相談したい','その他（補足欄に記載）']
  }
};

const educationOptions = {
  doctor: [
    '症例について多職種でカンファレンスをしたい',
    '担当患者の臨床判断について一緒に整理したい',
    '研修医・学生への指導に同席・協力してほしい',
    'その他（補足欄に記載）'
  ],
  nurse: [
    '症例について多職種でカンファレンスをしたい',
    '担当患者の臨床判断について一緒に整理したい',
    '部署の勉強会に来て講義してほしい（テーマ：補足欄に記載）',
    '患者対応について個別に相談したい',
    '新人・研修生のOJTに同行・指導してほしい',
    'ラダー研修の内容について相談したい',
    'その他（補足欄に記載）'
  ]
};

/* ---------- アプリケーション状態 ---------- */

const st = {
  screen: 'top',
  role: '',
  entry: null,
  detail: '',
  urgency: '',
  callback: '',
  support: '',
  eduType: '',
  selectStage: 'entry',
  selectedGroup: ''
};

const order = ['top', 'select', 'input', 'confirm', 'done'];

/* ---------- ユーティリティ ---------- */

function qs(s)       { return document.querySelector(s); }
function qsa(s)      { return [...document.querySelectorAll(s)]; }
function toggle(id, on) { qs('#' + id).classList.toggle('on', on); }

function setMsg(text) {
  const el = qs('#msg');
  el.textContent = text;
  el.classList.toggle('hide', !text);
}

/* ---------- スクリーン制御 ---------- */

function show(name) {
  st.screen = name;
  setMsg('');
  qsa('.screen').forEach(x => x.classList.toggle('on', x.dataset.screen === name));
  qsa('.step').forEach(x => x.classList.toggle('on', x.dataset.s === name));

  const titles = {
    top:     ['職種を選択してください',     '最短3クリックで入力画面へ進む構成です。'],
    select:  ['相談入口を選択してください', '職種別に第2階層を最適化しています。'],
    input:   ['必要事項を入力してください', '選択式中心で自由記載は補足に絞っています。'],
    confirm: ['入力内容を確認してください', '院内説明用のため送信処理はありません。'],
    done:    ['受付イメージを表示しています', '自動受付確認メッセージの見本です。']
  };
  qs('#title').textContent = titles[name][0];
  qs('#sub').textContent   = titles[name][1];

  qs('#back').style.visibility = name === 'top' ? 'hidden' : 'visible';
  qs('#next').textContent =
    name === 'done'    ? '最初に戻る' :
    name === 'confirm' ? '受付確認を表示' : '次へ進む';
}

/* ---------- 選択ステージのレンダリング ---------- */

function renderEntries() {
  st.selectStage  = 'entry';
  st.selectedGroup = '';
  const conf = data[st.role];
  qs('#menuTitle').textContent = conf.label + '向けメニュー';
  qs('#menuSub').textContent   = 'まず入口を1つ選んでください。';

  const box = qs('#entryBox');
  box.innerHTML = '';
  box.classList.remove('hide');
  qs('#detailCard').classList.add('hide');
  qs('#detailBox').classList.add('hide');
  qs('#actionCard').classList.add('hide');
  qs('#actionBox').classList.add('hide');

  conf.entries.forEach(e => {
    const b = document.createElement('button');
    b.className = 'btn entry';
    b.innerHTML = '<strong>' + e.label + '</strong>'
                + '<span>' + (e.type === 'edu' ? 'このまま次の候補へ' : '押すと次の選択画面へ') + '</span>';
    b.onclick = () => {
      setMsg('');
      st.entry  = e;
      st.detail = '';
      renderDetailStage();
    };
    box.appendChild(b);
  });
}

function renderDetailStage() {
  st.selectStage = 'detail';
  const e = st.entry;
  const dbox = qs('#detailBox');

  qs('#entryBox').classList.add('hide');
  qs('#actionCard').classList.add('hide');
  qs('#actionBox').classList.add('hide');
  qs('#detailTitle').textContent = e.label + ' の候補';
  qs('#detailSub').textContent   = e.type === 'edu'
    ? 'ここから該当する内容を1つ選んでください。'
    : 'ここから近い項目を1つ選んでください。';
  qs('#detailCard').classList.remove('hide');
  dbox.classList.remove('hide');
  dbox.innerHTML = '';

  e.details.forEach(v => {
    const label = typeof v === 'string' ? v : v.label;
    const bd = document.createElement('button');
    bd.className = 'btn detail';
    bd.innerHTML = '<strong>' + label + '</strong>'
                 + '<span>' + (typeof v === 'string' ? 'この内容で入力画面へ進む' : '押すと次の選択画面へ') + '</span>';
    bd.onclick = () => {
      setMsg('');
      if (typeof v === 'string') {
        st.detail = v;
        dbox.querySelectorAll('.btn').forEach(x => x.classList.remove('sel'));
        bd.classList.add('sel');
        proceedToInput();
        return;
      }
      st.selectedGroup = label;
      renderActionStage(v);
    };
    dbox.appendChild(bd);
  });
}

function renderActionStage(v) {
  st.selectStage = 'action';
  st.detail = '';
  const abox = qs('#actionBox');

  qs('#detailCard').classList.add('hide');
  qs('#detailBox').classList.add('hide');
  qs('#actionTitle').textContent = st.selectedGroup + ' の具体的な特定行為';
  qs('#actionSub').textContent   = 'ここで選んだ行為で入力画面へ進みます。';
  qs('#actionCard').classList.remove('hide');
  abox.classList.remove('hide');
  abox.innerHTML = '';

  v.actions.forEach(a => {
    const ba = document.createElement('button');
    ba.className = 'btn action';
    ba.innerHTML = '<strong>' + a + '</strong><span>この行為で入力画面へ進む</span>';
    ba.onclick = () => {
      setMsg('');
      st.detail = st.selectedGroup + ' / ' + a;
      abox.querySelectorAll('.btn').forEach(x => x.classList.remove('sel'));
      ba.classList.add('sel');
      proceedToInput();
    };
    abox.appendChild(ba);
  });
}

/* ---------- 入力スクリーン初期化 ---------- */

function syncInput() {
  qs('#path').textContent = data[st.role].label + ' / ' + st.entry.label + ' / ' + st.detail;
  st.support  = '';
  st.eduType  = '';

  const edu = st.entry.type === 'edu';
  qs('#eduArea').classList.toggle('hide', !edu);
  qs('#patientArea').classList.toggle('hide', edu);

  if (st.role === 'doctor') {
    qs('#name').placeholder      = '例）山田 太郎 / 循環器内科';
    qs('#pidLabel').textContent   = '患者ID（任意）';
    qs('#pid').placeholder        = '任意';
    qs('#wardWrap').classList.remove('hide');
    qs('#wardLabel').textContent  = '患者の病棟';
    qs('#ward').placeholder       = '例）3階東病棟（必須）';
    qs('#pnameLabel').textContent = '患者氏名';
    qs('#pname').placeholder      = '例）山田 ○○（必須）';
    qs('#patientHint').textContent = '医師向けは患者ID任意、患者の病棟と患者氏名を必須とします。';
  } else {
    qs('#name').placeholder      = '例）山田 花子 / 3階病棟';
    qs('#pidLabel').textContent   = '患者ID';
    qs('#pid').placeholder        = '必須';
    qs('#wardWrap').classList.add('hide');
    qs('#ward').value             = '';
    qs('#pnameLabel').textContent = '患者氏名（任意）';
    qs('#pname').placeholder      = '';
    qs('#patientHint').textContent = '看護師向けは患者ID必須、患者氏名は任意入力です。';
  }

  if (edu) { renderEducationOptions(); } else { renderPatientOptions(); }
}

function currentAction() {
  return st.detail.includes(' / ')
    ? st.detail.split(' / ').slice(-1)[0]
    : st.detail;
}

function renderPatientOptions() {
  const action = currentAction();
  const opts   = (requestOptions[st.role] && requestOptions[st.role][action]) || ['その他（補足欄に記載）'];
  chipBox('support', opts, 'support');
}

function renderEducationOptions() {
  chipBox('eduType', educationOptions[st.role] || ['その他（補足欄に記載）'], 'eduType');
}

/* ---------- チップボタン生成 ---------- */

function chipBox(id, arr, key) {
  const box = qs('#' + id);
  box.innerHTML = '';
  arr.forEach(v => {
    const b = document.createElement('button');
    b.className = 'btn choice';
    b.innerHTML = '<strong>' + v + '</strong>';
    b.onclick = () => {
      setMsg('');
      st[key] = v;
      box.querySelectorAll('.btn').forEach(x => x.classList.remove('sel'));
      b.classList.add('sel');
      if (key === 'urgency' && v === '緊急') toggle('urgentModal', true);
    };
    box.appendChild(b);
  });
}

/* ---------- バリデーション ---------- */

function okSelect() {
  if (st.role && st.entry && st.detail) return true;
  setMsg('選択が足りません。入口と、入力に進む最終項目を選んでください。');
  return false;
}

function okInput() {
  if (!qs('#name').value.trim() || !qs('#contact').value.trim() || !st.urgency || !st.callback) {
    setMsg('依頼者情報、緊急度、折り返し希望を入力してください。');
    return false;
  }
  if (st.urgency === '緊急') {
    toggle('urgentModal', true);
    setMsg('緊急はこのフォームでは進めません。直接連絡してください。');
    return false;
  }
  if (st.entry.type === 'edu') {
    if (qs('#dept').value.trim() && st.eduType) return true;
    setMsg('対象部署と希望する内容を選んでください。');
    return false;
  }
  if (st.role === 'doctor') {
    if (qs('#ward').value.trim() && qs('#pname').value.trim() && qs('#status').value.trim() && st.support) return true;
    setMsg('医師向けは、患者の病棟・患者氏名・状況・依頼内容の選択が必要です。');
    return false;
  }
  if (qs('#pid').value.trim() && qs('#status').value.trim() && st.support) return true;
  setMsg('看護師向けは、患者ID・状況・依頼内容の選択が必要です。');
  return false;
}

/* ---------- 確認サマリー構築 ---------- */

function addSummaryItem(label, val) {
  const d = document.createElement('div');
  d.className = 'item';
  d.innerHTML = '<b>' + label + '</b><div>' + (val || '未入力') + '</div>';
  qs('#summary').appendChild(d);
}

function buildSummary() {
  qs('#summary').innerHTML = '';
  addSummaryItem('職種',           data[st.role].label);
  addSummaryItem('依頼者氏名・所属', qs('#name').value.trim());
  addSummaryItem('連絡先',           qs('#contact').value.trim());
  addSummaryItem('相談入口',         st.entry.label + ' / ' + st.detail);
  addSummaryItem('緊急度',           st.urgency);
  addSummaryItem('折り返し希望',     st.callback);

  if (st.entry.type === 'edu') {
    addSummaryItem('対象部署',         qs('#dept').value.trim());
    addSummaryItem('希望する内容',     st.eduType);
    addSummaryItem('対象者・参加予定人数', qs('#members').value.trim());
    addSummaryItem('希望時期',         qs('#timing').value.trim());
  } else {
    addSummaryItem('患者ID',           qs('#pid').value.trim() || '未入力');
    if (st.role === 'doctor') addSummaryItem('患者の病棟', qs('#ward').value.trim());
    addSummaryItem('患者氏名',         qs('#pname').value.trim());
    addSummaryItem('状況・説明',       qs('#status').value.trim());
    addSummaryItem('状況・依頼内容',   st.support);
    addSummaryItem('補足説明',         qs('#point').value.trim());
  }
  addSummaryItem('補足・自由記載', qs('#note').value.trim());
}

/* ---------- リセット ---------- */

function reset() {
  st.screen       = 'top';
  st.role         = '';
  st.entry        = null;
  st.detail       = '';
  st.urgency      = '';
  st.callback     = '';
  st.support      = '';
  st.eduType      = '';
  st.selectStage  = 'entry';
  st.selectedGroup = '';
  qsa('.btn.sel').forEach(x => x.classList.remove('sel'));
  qsa('input, textarea').forEach(x => x.value = '');
  show('top');
}

/* ---------- 画面遷移ハンドラ ---------- */

function proceedToInput() {
  if (!okSelect()) return;
  syncInput();
  show('input');
}

/* ---------- イベントバインド ---------- */

// 職種ボタン
qsa('.role').forEach(b => {
  b.onclick = () => {
    st.role = b.dataset.role;
    qsa('.role').forEach(x => x.classList.remove('sel'));
    b.classList.add('sel');
  };
});

// 戻るボタン
qs('#back').onclick = () => {
  if (st.screen === 'select' && st.selectStage === 'action') { renderDetailStage(); return; }
  if (st.screen === 'select' && st.selectStage === 'detail') { renderEntries();     return; }
  const i = order.indexOf(st.screen);
  if (i > 0) show(order[i - 1]);
};

// 次へボタン
qs('#next').onclick = () => {
  if (st.screen === 'top') {
    if (!st.role) { setMsg('職種を選択してください。'); return; }
    renderEntries();
    show('select');
    return;
  }
  if (st.screen === 'select') {
    if (!okSelect()) return;
    syncInput();
    show('input');
    return;
  }
  if (st.screen === 'input') {
    if (!okInput()) return;
    buildSummary();
    show('confirm');
    return;
  }
  if (st.screen === 'confirm') {
    qs('#doneAt').textContent = '受付日時：' + new Date().toLocaleString('ja-JP');
    show('done');
    return;
  }
  reset();
};

// ヘルプボタン
qs('#help').onclick = () => toggle('helpModal', true);

/* ---------- 初期チップ生成 ---------- */

chipBox('urgency',  ['緊急', '本日中', '至急ではない'], 'urgency');
chipBox('callback', ['要', '不要（メッセージで十分）'], 'callback');

/* ---------- 初期表示 ---------- */

show('top');
