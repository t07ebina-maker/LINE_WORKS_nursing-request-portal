$ErrorActionPreference = 'Stop'

$root = 'C:\Users\Owner\OneDrive\⑭Codex作業フォルダ'
$samplePath = Join-Path $root 'lineworks_tokuteikangoshi_samples_50.json'
$reportPath = Join-Path $root 'lineworks_tokuteikangoshi_sample_trial_report.txt'

$doctorDefs = @(
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='呼吸の管理 / 気管チューブ位置調整'; support='チューブ位置を確認・調整してほしい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='呼吸の管理 / 侵襲的陽圧換気設定変更'; support='SpO2・換気が不安定で設定変更・実施を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='呼吸の管理 / 人工呼吸器離脱'; support='離脱の実施を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='循環・薬剤調整 / カテコラミン投与量調整'; support='バイタルが不安定でカテコラミンの増減を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='循環・薬剤調整 / 降圧剤投与量調整'; support='血圧が不安定で降圧剤の増減を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='循環・薬剤調整 / 鎮静薬投与量調整'; support='鎮静が深すぎるため減量を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='循環・薬剤調整 / 抗精神病薬臨時投与'; support='興奮・せん妄に対し抗精神病薬の投与を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='循環・薬剤調整 / 一時的ペースメーカ操作・管理'; support='ペースメーカ設定の変更・確認を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='循環・薬剤調整 / 一時的ペースメーカリード抜去'; support='リードが不要になったため抜去を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='循環・薬剤調整 / IABP離脱補助頻度調整'; support='離脱に向けた補助頻度の変更を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='輸液・電解質調整 / 脱水症状への輸液補正'; support='脱水傾向があり輸液の開始・変更を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='輸液・電解質調整 / Na・K・Cl投与量調整'; support='電解質補正が必要で投与量の調整を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='輸液・電解質調整 / 高カロリー輸液投与量調整'; support='高カロリー輸液の投与量変更を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='血管路管理 / PICC挿入'; support='長期輸液・抗菌薬投与のためPICC挿入を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='血管路管理 / CV抜去'; support='末梢確保ができたため抜去を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='血管路管理 / 直接動脈穿刺採血'; support='血液ガス・採血のため動脈穿刺採血を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='血管路管理 / 橈骨動脈ライン確保'; support='動脈圧モニタリングのためライン確保を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='創傷・創部管理 / 壊死組織除去（デブリドマン）'; support='壊死組織がありデブリドマンの実施を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='創傷・創部管理 / 陰圧閉鎖療法（NPWT）'; support='NPWT適応について評価・判断を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='創傷・創部管理 / 心嚢ドレーン抜去'; support='ドレーンが不要になったため抜去を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='創傷・創部管理 / 胸腔ドレーン抜去'; support='ドレーンが不要になったため抜去を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='創傷・創部管理 / 腹腔ドレーン抜去'; support='ドレーンが不要になったため抜去を依頼したい'; kind='patient' },
  @{ entry='具体的な特定行為を相談・依頼したい'; detail='創傷・創部管理 / 創部ドレーン抜去'; support='ドレーンが不要になったため抜去を依頼したい'; kind='patient' },
  @{ entry='患者・家族との意思決定を支援してほしい'; detail='意思決定支援'; support='患者・家族との意思決定支援を依頼したい'; kind='patient' },
  @{ entry='教育・その他を相談したい'; detail='教育・その他'; eduType='症例について多職種でカンファレンスをしたい'; kind='edu' }
)

$nurseDefs = @(
  @{ entry='患者のことを相談したい'; detail='気管チューブ位置調整'; support='チューブがずれている可能性があり確認・調整を依頼したい'; kind='patient' },
  @{ entry='患者のことを相談したい'; detail='侵襲的陽圧換気設定変更'; support='SpO2・換気が不安定で設定変更が必要か相談したい'; kind='patient' },
  @{ entry='患者のことを相談したい'; detail='鎮静薬投与量調整'; support='鎮静が深すぎる・浅すぎると感じ調整を依頼したい'; kind='patient' },
  @{ entry='患者のことを相談したい'; detail='人工呼吸器離脱'; support='離脱の実施を依頼したい'; kind='patient' },
  @{ entry='患者のことを相談したい'; detail='一時的ペースメーカ操作・管理'; support='ペースメーカの動作・波形に変化があり相談したい'; kind='patient' },
  @{ entry='患者のことを相談したい'; detail='一時的ペースメーカリード抜去'; support='医師からリード抜去の話が出ており実施を依頼したい'; kind='patient' },
  @{ entry='患者のことを相談したい'; detail='IABP離脱補助頻度調整'; support='IABP管理中に状態変化があり相談したい'; kind='patient' },
  @{ entry='患者のことを相談したい'; detail='心嚢ドレーン抜去'; support='医師から抜去の話が出ており実施を依頼したい'; kind='patient' },
  @{ entry='患者のことを相談したい'; detail='胸腔ドレーン抜去'; support='医師から抜去の話が出ており実施を依頼したい'; kind='patient' },
  @{ entry='患者のことを相談したい'; detail='腹腔ドレーン抜去'; support='医師から抜去の話が出ており実施を依頼したい'; kind='patient' },
  @{ entry='患者のことを相談したい'; detail='脱水症状への輸液補正'; support='飲水・食事量が低下しており輸液継続の判断を相談したい'; kind='patient' },
  @{ entry='患者のことを相談したい'; detail='高カロリー輸液投与量調整'; support='投与量の変更を依頼したい'; kind='patient' },
  @{ entry='患者のことを相談したい'; detail='感染徴候への薬剤臨時投与'; support='感染徴候があり医師への報告前に相談したい'; kind='patient' },
  @{ entry='患者のことを相談したい'; detail='カテコラミン投与量調整'; support='バイタルが不安定で医師への報告前にアセスメントを相談したい'; kind='patient' },
  @{ entry='患者のことを相談したい'; detail='Na・K・Cl投与量調整'; support='電解質に異常値があり補正の判断を相談したい'; kind='patient' },
  @{ entry='患者のことを相談したい'; detail='降圧剤投与量調整'; support='血圧が不安定で医師への報告前にアセスメントを相談したい'; kind='patient' },
  @{ entry='患者のことを相談したい'; detail='抗精神病薬臨時投与'; support='興奮・せん妄があり医師への報告前に対応を相談したい'; kind='patient' },
  @{ entry='患者のことを相談したい'; detail='意思決定支援'; support='患者対応について個別に相談したい'; kind='patient' },
  @{ entry='処置・実践を依頼したい'; detail='CV抜去'; support='医師から抜去の話が出ており実施を依頼したい'; kind='patient' },
  @{ entry='処置・実践を依頼したい'; detail='PICC挿入'; support='末梢確保が困難でPICC挿入を相談したい'; kind='patient' },
  @{ entry='処置・実践を依頼したい'; detail='壊死組織除去（デブリドマン）'; support='壊死組織があるため評価・処置を依頼したい'; kind='patient' },
  @{ entry='処置・実践を依頼したい'; detail='陰圧閉鎖療法（NPWT）'; support='NPWT交換の実施を依頼したい（定期交換）'; kind='patient' },
  @{ entry='処置・実践を依頼したい'; detail='創部ドレーン抜去'; support='医師から抜去の話が出ており実施を依頼したい'; kind='patient' },
  @{ entry='処置・実践を依頼したい'; detail='直接動脈穿刺採血'; support='血液ガス採取のたびに医師を呼んでいるため採血を依頼したい'; kind='patient' },
  @{ entry='勉強会・教育を相談したい'; detail='勉強会・教育'; eduType='部署の勉強会に来て講義してほしい（テーマ：補足欄に記載）'; kind='edu' }
)

$doctorNames = @('山田 太郎','佐藤 直樹','高橋 健一','田中 恒一','伊藤 直人','渡辺 大輔','中村 恒一','小林 拓也','加藤 亮','吉田 学')
$nurseNames = @('山田 花子','佐藤 美咲','高橋 彩','田中 亜美','伊藤 結衣','渡辺 由佳','中村 真理','小林 未来','加藤 彩香','吉田 友美')
$doctorAffils = @('循環器内科','救急科','外科','集中治療部','呼吸器内科')
$nurseAffils = @('3階東病棟','4階西病棟','ICU','救急外来','HCU')
$wards = @('3階東病棟','3階西病棟','4階東病棟','4階西病棟','ICU')
$urgencies = @('本日中','至急ではない')
$callbacks = @('要','不要（メッセージで十分）')

$cases = [System.Collections.Generic.List[object]]::new()
$index = 1

foreach($def in $doctorDefs){
  $name = $doctorNames[($index - 1) % $doctorNames.Count]
  $affil = $doctorAffils[($index - 1) % $doctorAffils.Count]
  $ward = $wards[($index - 1) % $wards.Count]
  $case = [ordered]@{
    id = ('D{0:D2}' -f $index)
    role = 'doctor'
    entry = $def.entry
    detail = $def.detail
    kind = $def.kind
    name = "$name / $affil"
    contact = ('PHS-{0:D4}' -f (1100 + $index))
    urgency = $urgencies[($index - 1) % $urgencies.Count]
    callback = $callbacks[($index - 1) % $callbacks.Count]
    pid = ('DPT{0:D4}' -f (7000 + $index))
    ward = if($def.kind -eq 'patient'){$ward}else{''}
    pname = if($def.kind -eq 'patient'){"患者$index"}else{''}
    status = if($def.kind -eq 'patient'){"症状変化あり。$($def.detail) について相談したい。"}else{''}
    support = if($def.kind -eq 'patient'){$def.support}else{''}
    point = if($def.kind -eq 'patient'){'夜間帯のため早めの確認を希望'}else{''}
    dept = if($def.kind -eq 'edu'){$affil}else{''}
    eduType = if($def.kind -eq 'edu'){$def.eduType}else{''}
    members = if($def.kind -eq 'edu'){'10名'}else{''}
    timing = if($def.kind -eq 'edu'){'来週中'}else{''}
    note = 'サンプルデータ'
  }
  $cases.Add([pscustomobject]$case)
  $index++
}

$nurseIndex = 1
foreach($def in $nurseDefs){
  $name = $nurseNames[($nurseIndex - 1) % $nurseNames.Count]
  $affil = $nurseAffils[($nurseIndex - 1) % $nurseAffils.Count]
  $case = [ordered]@{
    id = ('N{0:D2}' -f $nurseIndex)
    role = 'nurse'
    entry = $def.entry
    detail = $def.detail
    kind = $def.kind
    name = "$name / $affil"
    contact = ('PHS-{0:D4}' -f (2100 + $nurseIndex))
    urgency = $urgencies[$nurseIndex % $urgencies.Count]
    callback = $callbacks[$nurseIndex % $callbacks.Count]
    pid = if($def.kind -eq 'patient'){('NPT{0:D4}' -f (8000 + $nurseIndex))}else{''}
    ward = ''
    pname = if($def.kind -eq 'patient'){"患者N$nurseIndex"}else{''}
    status = if($def.kind -eq 'patient'){"ベッドサイドで変化あり。$($def.detail) について確認したい。"}else{''}
    support = if($def.kind -eq 'patient'){$def.support}else{''}
    point = if($def.kind -eq 'patient'){'申し送り済み'}else{''}
    dept = if($def.kind -eq 'edu'){$affil}else{''}
    eduType = if($def.kind -eq 'edu'){$def.eduType}else{''}
    members = if($def.kind -eq 'edu'){'15名'}else{''}
    timing = if($def.kind -eq 'edu'){'今月中'}else{''}
    note = 'サンプルデータ'
  }
  $cases.Add([pscustomobject]$case)
  $nurseIndex++
}

if($cases.Count -ne 50){
  throw "Sample count mismatch: $($cases.Count)"
}

$cases | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 $samplePath

$results = foreach($c in $cases){
  $errors = [System.Collections.Generic.List[string]]::new()
  if($c.role -notin @('doctor','nurse')){$errors.Add('role invalid')}
  if([string]::IsNullOrWhiteSpace($c.name)){$errors.Add('name required')}
  if([string]::IsNullOrWhiteSpace($c.contact)){$errors.Add('contact required')}
  if($c.urgency -notin @('本日中','至急ではない')){$errors.Add('urgency invalid or blocked')}
  if($c.callback -notin @('要','不要（メッセージで十分）')){$errors.Add('callback invalid')}
  if($c.kind -eq 'edu'){
    if([string]::IsNullOrWhiteSpace($c.dept)){$errors.Add('dept required')}
    if([string]::IsNullOrWhiteSpace($c.eduType)){$errors.Add('eduType required')}
  } else {
    if([string]::IsNullOrWhiteSpace($c.status)){$errors.Add('status required')}
    if([string]::IsNullOrWhiteSpace($c.support)){$errors.Add('support required')}
    if($c.role -eq 'doctor'){
      if([string]::IsNullOrWhiteSpace($c.ward)){$errors.Add('ward required')}
      if([string]::IsNullOrWhiteSpace($c.pname)){$errors.Add('patient name required')}
    } else {
      if([string]::IsNullOrWhiteSpace($c.pid)){$errors.Add('patient id required')}
    }
  }

  [pscustomobject]@{
    id = $c.id
    role = $c.role
    entry = $c.entry
    detail = $c.detail
    result = if($errors.Count -eq 0){'PASS'}else{'FAIL'}
    error = ($errors -join '; ')
  }
}

$passCount = ($results | Where-Object result -eq 'PASS').Count
$failCount = ($results | Where-Object result -eq 'FAIL').Count
$doctorCount = ($cases | Where-Object role -eq 'doctor').Count
$nurseCount = ($cases | Where-Object role -eq 'nurse').Count
$eduCount = ($cases | Where-Object kind -eq 'edu').Count
$patientCount = ($cases | Where-Object kind -eq 'patient').Count

$lines = @()
$lines += 'LINEWORKS UI Mock Sample Trial'
$lines += "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$lines += "HTML: $root\lineworks_tokuteikangoshi_ui_mock.html"
$lines += "Samples: $samplePath"
$lines += ''
$lines += "Total cases: $($cases.Count)"
$lines += "PASS: $passCount"
$lines += "FAIL: $failCount"
$lines += "Doctor cases: $doctorCount"
$lines += "Nurse cases: $nurseCount"
$lines += "Patient flow cases: $patientCount"
$lines += "Education flow cases: $eduCount"
$lines += ''
$lines += 'Case results:'
$lines += ($results | ForEach-Object { "{0}`t{1}`t{2}`t{3}" -f $_.id,$_.role,$_.result,$_.detail })

$lines | Set-Content -Encoding UTF8 $reportPath

Write-Output "Created: $samplePath"
Write-Output "Created: $reportPath"
Write-Output "PASS=$passCount FAIL=$failCount TOTAL=$($cases.Count)"
