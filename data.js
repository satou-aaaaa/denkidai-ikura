// 電気代いくら？の問題を作る（ブラウザと node の両方で使う）。
// 決まりは、下の SRC で確かめたことだけ（2026-11-17 に読んだ）。
//  - 電力料金の目安単価は 31円/kWh（税込。全国家庭電気製品公正取引協議会、令和4年7月22日改定）。資源エネルギー庁の省エネポータルも同じ単価を使う
//  - 使った電気の量（kWh）＝ 消費電力（W）× 使う時間（時間）÷ 1000。電気代 ＝ kWh × 31円
// 家電の W（消費電力）・使う時間は練習用の作り話（実物の数字ではない）。答えはコードで計算して決める。
// 1問は、家電の場面を見て答えを選ぶ。正解したら2段目「どう計算した？」を選ぶ。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ tag なら、どの端末でも同じ問題になる。
// KINDS・言い回しの並びは最後に足すだけにする（並べ替え・削除をすると過去の日の問題が変わる）。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出典（画面の「なぜ」に出す）
  const SRC = {
    eftc: ["全国家庭電気製品公正取引協議会「よくある質問（電力料金の目安単価）」", "https://www.eftc.or.jp/qa/"],
    enecho: ["資源エネルギー庁「省エネポータルサイト 無理のない省エネ節約」", "https://www.enecho.meti.go.jp/category/saving_and_new/saving/general/howto/"],
  };
  const PRICE = 31; // 1kWh の目安単価（円・税込）

  // 2段目「どう計算した？」
  const GROUPS = {
    ryo: { name: "W × 時間 ÷ 1000", sub: "使った電気の量（kWh）を出す" },
    dai: { name: "kWh × 31円", sub: "電気の量から電気代を出す" },
    sa: { name: "2つの差", sub: "2つの電気代（電気の量）を引き算する" },
    modoshi: { name: "わり算でもどる", sub: "電気代から、使った時間や W を出す" },
  };

  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  const pick = (R, a) => a[ri(R, 0, a.length - 1)];
  function shuffle(R, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = ri(R, 0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  function pickN(R, a, n) { return shuffle(R, a).slice(0, n); }
  const fmt = (n) => { const [i, d] = String(Math.round(n * 1000) / 1000).split("."); return i.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (d ? "." + d : ""); };
  const yen = (x) => `${fmt(x)}円`, kwh = (x) => `${fmt(x)}kWh`, about = (x) => `約${fmt(Math.round(x))}円`;
  function optsOf(R, ans, cands, n) { const out = [ans]; for (const c of cands) { if (out.length >= n) break; if (c && !/^約?0(\.0+)?円$|^0(\.0+)?kWh$/.test(c) && !out.includes(c) && !/\.\d{3}/.test(c)) out.push(c); } return shuffle(R, out); } // 0 や小数3けたの選び肢は出さない
  const MEDIA = ["家族で節約", "自由研究", "家庭科の授業", "ひとり暮らしの計画", "電気の明細を見て"];
  // 家電と、このゲームで使う W（練習用の作り話。100W ごと）。lo：一日じゅう使うことがあるもの
  const DEV = [
    { n: "テレビ", ws: [100, 200], lo: 1 }, { n: "ドライヤー", ws: [1000, 1200, 1500] }, { n: "電気ストーブ", ws: [400, 800, 1000] },
    { n: "こたつ", ws: [300, 500, 600] }, { n: "そうじ機", ws: [500, 800, 1000] }, { n: "アイロン", ws: [1000, 1200] },
    { n: "電気ケトル", ws: [1000, 1300] }, { n: "パソコン", ws: [100, 200, 300], lo: 1 }, { n: "扇風機", ws: [100], lo: 1 },
    { n: "エアコン", ws: [500, 700, 900], lo: 1 }, { n: "炊飯器", ws: [300, 700] }, { n: "電子レンジ", ws: [600, 1000, 1500] },
    { n: "ゲーム機", ws: [100, 200], lo: 1 }, { n: "ホットプレート", ws: [1200, 1300] },
  ];
  const LOW = DEV.filter((d) => d.lo);
  const devOf = (R, list = DEV) => { const d = pick(R, list); return [d.n, pick(R, d.ws)]; };

  const MK = {
    // W と時間から kWh
    kwh(R) {
      const [n, W] = devOf(R), h = ri(R, 1, 10), k = W * h / 1000, md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `${W}Wの${n}を${h}時間使った。使った電気の量は？`, opts: optsOf(R, kwh(k), [kwh(k * 10), kwh(k / 10), kwh(W * h), kwh(k * PRICE)], 3), ans: kwh(k), grp: "ryo", v: `${n}:${W}:${h}:${md}`,
        why: `${W}W × ${h}時間 ＝ ${fmt(W * h)}Wh。1000でわって ${kwh(k)}です（1000Wを1時間で1kWh）。` };
    },
    // kWh から電気代
    yen1(R) {
      const k = ri(R, 1, 40) / 2, a = k * PRICE, md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `電気を${kwh(k)}使った。1kWhが31円なら、電気代は？`, opts: optsOf(R, yen(a), [yen(a * 10), yen(a / 10), yen(k + PRICE), yen(a * 2)], 3), ans: yen(a), grp: "dai", v: `${k}:${md}`,
        why: `${fmt(k)} × 31 ＝ ${yen(a)}です。` };
    },
    // 1時間の電気代
    ichijikan(R) {
      const [n, W] = devOf(R), a = W / 1000 * PRICE, md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `${W}Wの${n}を1時間使う。電気代は？（1kWh＝31円）`, opts: optsOf(R, yen(a), [yen(W * PRICE), yen(a * 10), yen(W / 1000), yen(a / 10)], 3), ans: yen(a), grp: "dai", v: `${n}:${W}:${md}`,
        why: `${W}W × 1時間 ÷ 1000 ＝ ${kwh(W / 1000)}。× 31 ＝ ${yen(a)}です。` };
    },
    // W と時間から電気代
    denkidai(R) {
      const [n, W] = devOf(R), h = ri(R, 2, 8), k = W * h / 1000, a = k * PRICE, md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `${W}Wの${n}を${h}時間使う。電気代は？（1kWh＝31円）`, opts: optsOf(R, yen(a), [yen(a * 10), yen(a / 10), yen(k), yen(W / 1000 * PRICE), yen(a * 2)], 4), ans: yen(a), grp: "dai", v: `${n}:${W}:${h}:${md}`,
        why: `${W} × ${h} ÷ 1000 ＝ ${kwh(k)}。${fmt(k)} × 31 ＝ ${yen(a)}です。` };
    },
    // 1か月（30日）の電気代
    tsuki(R) {
      const [n, W] = devOf(R, LOW), h = ri(R, 1, 6), k = W * h * 30 / 1000, a = k * PRICE, md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `${W}Wの${n}を、1日${h}時間ずつ30日使う。1か月の電気代は？（1kWh＝31円）`, opts: optsOf(R, yen(a), [yen(a / 30), yen(a * 10), yen(a / 10), yen(k), yen(a * 2)], 4), ans: yen(a), grp: "dai", v: `${n}:${W}:${h}:${md}`,
        why: `1日は ${W} × ${h} ÷ 1000 ＝ ${kwh(W * h / 1000)}。30日で ${kwh(k)}。× 31 ＝ ${yen(a)}です。` };
    },
    // 2つの家電の電気代の差
    kurabe(R) {
      const a1 = devOf(R), b0 = devOf(R), h = ri(R, 1, 6), md = ri(R, 0, MEDIA.length - 1);
      const b1 = b0[1] === a1[1] ? [b0[0], a1[1] === 100 ? 300 : a1[1] - 100] : b0;
      const [hi, lo] = a1[1] > b1[1] ? [a1, b1] : [b1, a1], d = (hi[1] - lo[1]) * h / 1000 * PRICE;
      const q = `${hi[1]}Wの${hi[0]}と、${lo[1]}Wの${lo[0]}${hi[0] === lo[0] ? "（別の型）" : ""}。どちらも${h}時間使うと、電気代の差は？（1kWh＝31円）`;
      return { media: MEDIA[md], q, opts: optsOf(R, yen(d), [yen(d * 10), yen(d / 10), yen(hi[1] * h / 1000 * PRICE), yen(lo[1] * h / 1000 * PRICE), yen((hi[1] - lo[1]) * h / 1000)], 4), ans: yen(d), grp: "sa", v: `${hi.join(":")}:${lo.join(":")}:${h}:${md}`,
        why: `W の差は ${hi[1]} − ${lo[1]} ＝ ${hi[1] - lo[1]}W。× ${h}時間 ÷ 1000 ＝ ${kwh((hi[1] - lo[1]) * h / 1000)}。× 31 ＝ ${yen(d)}です。` };
    },
    // 電気代から時間
    nanjikan(R) {
      const [n, W] = devOf(R), h = ri(R, 1, 10), a = W * h / 1000 * PRICE, md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `${W}Wの${n}を使ったら、電気代は${yen(a)}だった。何時間使った？（1kWh＝31円）`, opts: optsOf(R, `${h}時間`, [`${h * 2}時間`, `${h + 1}時間`, h > 1 ? `${h - 1}時間` : "", `${h * 10}時間`, `${h + 2}時間`], 4), ans: `${h}時間`, grp: "modoshi", v: `${n}:${W}:${h}:${md}`,
        why: `${yen(a)} ÷ 31 ＝ ${kwh(W * h / 1000)}。1時間は ${kwh(W / 1000)} なので、${fmt(W * h / 1000)} ÷ ${fmt(W / 1000)} ＝ ${h}時間です。` };
    },
    // 電気代から W
    nanW(R) {
      const W = ri(R, 1, 20) * 100, h = ri(R, 1, 5), a = W * h / 1000 * PRICE, md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `ある家電を${h}時間使ったら、電気代は${yen(a)}だった。この家電は何W？（1kWh＝31円）`, opts: optsOf(R, `${W}W`, [`${W * 2}W`, W >= 200 ? `${W / 2}W` : "", `${W * 10}W`, `${W + 100}W`, `${W * h}W`, `${W + 200}W`, `${W * 3}W`], 4), ans: `${W}W`, grp: "modoshi", v: `${W}:${h}:${md}`,
        why: `${yen(a)} ÷ 31 ＝ ${kwh(W * h / 1000)}。${h}時間でわって ${kwh(W / 1000)}。× 1000 ＝ ${W}Wです。` };
    },
    // 待機電力の1年の電気代
    taiki(R) {
      const W = pick(R, [0.5, 1, 1.5, 2, 3, 4, 5]), k = W * 24 * 365 / 1000, a = k * PRICE, md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `使っていなくても${fmt(W)}Wの電気（待機電力）を使う機械。1年（365日）ずっとコンセントにさしておくと、電気代はおよそ？（1kWh＝31円）`, opts: optsOf(R, about(a), [about(a / 365), about(a / 12), about(a * 10), about(W * 24 * PRICE / 1000), about(a / 24)], 4), ans: about(a), grp: "dai", v: `${W}:${md}`,
        why: `${fmt(W)}W × 24時間 × 365日 ÷ 1000 ＝ ${kwh(k)}。× 31 ＝ ${yen(Math.round(a * 100) / 100)}で、およそ${fmt(Math.round(a))}円です。` };
    },
    // 買いかえで1年にいくら安くなる
    kaikae(R) {
      const o = ri(R, 35, 60) * 10, d = ri(R, 5, 30) * 10, nw = o - d, md = ri(R, 0, MEDIA.length - 1);
      const what = pick(R, ["冷蔵庫", "エアコン", "テレビ"]);
      return { media: MEDIA[md], q: `古い${what}は1年に${o}kWh、新しい${what}は1年に${nw}kWhの電気を使う。買いかえると、1年の電気代はいくら安くなる？（1kWh＝31円）`, opts: optsOf(R, yen(d * PRICE), [yen(nw * PRICE), yen(o * PRICE), yen(d * PRICE * 10), yen(d), yen(d * PRICE / 12)], 4), ans: yen(d * PRICE), grp: "sa", v: `${what}:${o}:${d}:${md}`,
        why: `電気の量の差は ${o} − ${nw} ＝ ${d}kWh。× 31 ＝ ${yen(d * PRICE)}です。` };
    },
  };

  const KINDS = [
    { id: "kwh", lv: 0, name: "電気の量（kWh）", src: ["eftc"], look: "W に時間をかけてから、1000でわります。", key: "1000W を1時間使うと 1kWh" },
    { id: "yen1", lv: 0, name: "kWh から電気代", src: ["eftc", "enecho"], look: "kWh に 31円をかけます。", key: "電気代 ＝ kWh × 31円（目安単価）" },
    { id: "ichijikan", lv: 0, name: "1時間の電気代", src: ["eftc"], look: "W を1000でわると、1時間の kWh です。", key: "1000W を1時間で31円・100W なら3.1円" },
    { id: "denkidai", lv: 1, name: "使う時間の電気代", src: ["eftc"], look: "まず kWh を出してから、31円をかけます。", key: "W × 時間 ÷ 1000 × 31" },
    { id: "tsuki", lv: 1, name: "1か月の電気代", src: ["eftc"], look: "1日の kWh を出して、30日分にします。", key: "1日の kWh × 30日 × 31円" },
    { id: "kurabe", lv: 1, name: "2つの家電の差", src: ["eftc"], look: "W の差を出してから計算すると早いです。", key: "（W の差）× 時間 ÷ 1000 × 31" },
    { id: "nanjikan", lv: 2, name: "何時間使った？", src: ["eftc"], look: "電気代を31でわると kWh にもどります。", key: "kWh ÷（1時間の kWh）＝ 時間" },
    { id: "nanW", lv: 2, name: "何Wの家電？", src: ["eftc"], look: "電気代 → kWh → 1時間の kWh → W の順にもどります。", key: "W ＝ 電気代 ÷ 31 ÷ 時間 × 1000" },
    { id: "taiki", lv: 2, name: "待機電力の1年", src: ["eftc", "enecho"], look: "1年は 24時間 × 365日 ＝ 8,760時間です。", key: "W × 8,760 ÷ 1000 × 31" },
    { id: "kaikae", lv: 2, name: "買いかえで安くなる", src: ["eftc", "enecho"], look: "1年の kWh の差に、31円をかけます。", key: "（古い kWh − 新しい kWh）× 31" },
  ];
  for (const k of KINDS) k.make = MK[k.id];
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);

  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // 1問を作る。tag は「種類|種」。同じ tag ならいつも同じ問題
  function make(tag) {
    const [kind] = String(tag).split("|"), k = Object.prototype.hasOwnProperty.call(BY, kind) ? BY[kind] : null;
    if (!k) return null;
    const p = k.make(rng(seedOf(tag)), k.lv);
    return { tag, kind, lv: k.lv, name: k.name, look: k.look, key: k.key, type: "act", rev: false, src: k.src.map((s) => SRC[s]), ...p };
  }
  const keyOf = (P) => `${P.kind}:${P.q}:${P.opts.slice().sort().join("/")}`;

  // 今日の5問（やさしい2・ふつう2・むずかしい1）。種類は重ねない
  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), n = pickN(R, kindsOf(1), 2), h = pickN(R, kindsOf(2), 1);
    return [...e, ...n, ...h].map((id, i) => `${id}|${date}:d${i}`);
  }
  // 上級の3問（むずかしいだけ・今日の5問のむずかしいとは別の種類）
  function hardTags(date) {
    const dh = dailyTags(date)[4].split("|")[0], R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return h.map((id, i) => `${id}|${date}:h${i}`);
  }

  const DKD = { KINDS, BY, GROUPS, LV, SRC, PRICE, DEV, kindsOf, seedOf, rng, make, keyOf, dailyTags, hardTags, pickN };
  if (typeof module !== "undefined" && module.exports) module.exports = DKD; else root.DKD = DKD;
})(typeof self !== "undefined" ? self : this);
