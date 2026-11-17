# AGENTS.md

電気代いくら？：家電の W（消費電力）と使う時間から、使った電気の量（kWh）と電気代を計算する1日5問の学習ゲーム。正解したら「どう計算した？」も選ぶ。`index.html` と `data.js`（問題の種類）を GitHub Pages で公開する。

## 準備（最初に一度）

```bash
bash scripts/setup.sh   # Node.js（版は .nvmrc）を確かめ、検査の依存とブラウザを入れる。何度実行してもよい
```

Claude Code のクラウドセッションでは `.claude/settings.json` のフックが自動で実行する。

## push する前の確認

```bash
node qa/run.mjs   # 問題（10種類×3000問：選び肢・答えは1つ・答えと計算のしかたが別に書いた計算 resolve() どおり・出典）・今日の5問と上級（3年分）・とことん・通しで遊ぶ・続きから・2段目・復習・幅320px・PWA・引き継ぎ・見やすさ（CI の QA と同じ）
```

## このリポジトリの決まり

- 単価は全国家庭電気製品公正取引協議会の電力料金の目安単価 31円/kWh（税込・令和4年7月22日改定。資源エネルギー庁の省エネポータルも同じ。2026-11-17 に読んだ）。`data.js` の `PRICE` 1か所に置く。改定されたら `PRICE` と画面の文（遊び方・このゲームについて・TIPS・README）を一緒に直す。種類を足すときは `qa/run.mjs` の `resolve()`（別に書いた解き直し）にも足す。
- 家電の W・使う時間は練習用の作り話（`DEV`）。実物の商品名・メーカー名は出さない。公式の情報の代わりにしない：遊び方と「このゲームについて」と README に、目安の単価であること・本当の電気代は契約の料金で決まることを置く（QA が見る）。節電のコツ（setsuden-kotsu）・発電くらべ（hatsuden-kurabe）と重ねない。
- 問題は、やさしいが選び肢3つ、ふつう・むずかしいが4つ。2回目のヒントはまちがいを消して2つにしぼり、計算の要点（`key`）も見せる。2段目は「W × 時間 ÷ 1000・kWh × 31円・2つの差・わり算でもどる」の4つ（`grp`）。
- 今日の5問（やさしい2・ふつう2・むずかしい1、種類は重ねない）・上級（むずかしい3、今日のむずかしいと別）は日本時間の日付の種で決まり、だれでも同じ。`Math.random()` は練習・とことんの種だけ。乱数は `sort` の比較の中で引かない。`KINDS`・言い回し・数の一覧の並びは最後に足すだけ（QA の `PIN` が第1回の1問目を見る）。`data.js` を変える PR は自動ではマージされない（`hold_paths`）。
- ★はまちがい＋ヒントの数（0で★3・1で★2・2以上で★1）。上級はヒントなし。時間制限なし。
- 好きなだけ遊べる：チケット・ライフ・回数制限・🔒で開くモードを入れない（shared-workflows `routines/game-dev.md` F1〜F7。QA が見る）。とことん（`runs.e`）はまちがえても続き、「ここで降りる」で終わる。
- 1問を深くする：`depth.js` と `qa/depth-check.mjs` は shared-workflows `template/` の写しで、ここでは直さない。自信あり・2段目「どう計算した？」・復習（1→3→7日後）。記録 `dkd-v1`・文字 `dkd-fs`・復習 `dkd-depth`。
- 共有は遊ぶ人が押したときに開くリンクだけ。シェアの文に問題・答えを出さない。感想は Issue フォーム（`.github/ISSUE_TEMPLATE/feedback.yml`）を開くだけ。応援は Ko-fi へのただのリンクだけ。
- 外へ通信しない（CSP の `connect-src 'self'` を広げない）。見やすさ（`<!-- a11y:begin -->`〜`end`・`qa/a11y.mjs`）と引き継ぎ（`transfer.js`・`qa/transfer-check.mjs`）は shared-workflows `template/` の写しで、ここでは直さない。
- 画面の土台は縮尺よみ（shukushaku-yomi）から写した。写し元の言葉が残っていないかを QA が見る。
- PWA：画面のファイルを足したら `sw.js` の `SHELL` にも足し、中身を大きく変えたら `CACHE` の版を上げる。アイコンは `node tools/make-icons.cjs`、`og.png` は `node tools/make-og.cjs`。
- 公開リポジトリなので、個人情報・鍵を入れない。

## 公開

- GitHub Pages は `main` のルート（`/`）を公開する。PR の QA と Secret scan が ✅ になると `automerge.yml` が自動でマージする。止めたいときは下書きにするか、ラベル「自動マージしない」を付ける。
- `sw.js`・`manifest.webmanifest`・`data.js` を変える PR は自動ではマージされない（`hold_paths`）。CodeRabbit のレビューを読み、手でマージする直前に今の head へのレビューを読み直す。CodeRabbit は PR に `@coderabbitai review` とコメントして頼む。

## 共通のきまり

- PR の作り方・マージの仕方は satou-aaaaa/shared-workflows の `routines/pr.md`、全体のきまりは `routines/common.md` に従う。
- CI の部品は shared-workflows の共通部品を呼ぶ。リポジトリ側の .github/workflows には呼び出しと設定値だけを書く。
- Claude 以外の AI・人が作業するときは、shared-workflows の `routines/tool-map.md` と `routines/without-claude.md` を読む。
