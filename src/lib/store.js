/*! 나에게 쏙 맞는 노트북 고르기 — © 2026 티쳐무 · 모든 권리 보유
 *  학생의 활동 기록을 담는 곳.
 *
 *  ⚠ 개인정보 원칙 — 학번·이름은 여기에 절대 넣지 않는다.
 *    학번·이름은 「내 활동지」 화면의 입력 칸에만 잠깐 있다가 내려받는 HTML 파일 안에만 들어간다.
 *    브라우저(localStorage)에도, 이어하기(.json) 파일에도 남지 않는다.
 *
 *  기록의 모양
 *    acts[활동열쇠][문항id] = { a: 고른 답, ok: 맞았나, n: 시도 횟수, shown: 정답을 봤나 }
 *    data[열쇠] = 순위·서술·미션 선택 같은 자유 기록
 */

export const 앱이름 = 'computer-spec';
export const 판 = 1;
const 저장열쇠 = 'computer-spec-v1';

export function 빈기록() {
  return { app: 앱이름, v: 판, acts: {}, data: {} };
}

let 기록 = 빈기록();
let 저장소 = 안전한저장소();
const 구독자들 = new Set();

// 사생활 보호 창·차단된 저장소에서는 localStorage 접근이 예외를 던진다. 그래도 앱은 돌아야 한다.
function 안전한저장소() {
  try {
    const t = globalThis.localStorage;
    if (!t) return null;
    t.setItem('__t', '1');
    t.removeItem('__t');
    return t;
  } catch {
    return null;
  }
}

// 시험에서 가짜 저장소를 끼워 넣을 때 쓴다.
export function 저장소바꾸기(가짜) {
  저장소 = 가짜;
}

export function 불러오기() {
  기록 = 빈기록();
  if (!저장소) return 기록;
  try {
    const 글 = 저장소.getItem(저장열쇠);
    if (글) {
      const 읽음 = 검사(JSON.parse(글));
      if (읽음) 기록 = 읽음;
    }
  } catch {
    /* 깨진 기록은 버리고 새로 시작한다 */
  }
  return 기록;
}

function 저장() {
  기록.saved = new Date().toISOString();
  if (저장소) {
    try { 저장소.setItem(저장열쇠, JSON.stringify(기록)); } catch { /* 가득 찼거나 막혔으면 조용히 넘어간다 */ }
  }
  구독자들.forEach((f) => f(기록));
}

export function 구독(f) {
  구독자들.add(f);
  return () => 구독자들.delete(f);
}

export function 지금기록() {
  return 기록;
}

// ── 문항 기록 ────────────────────────────────────────────────
export function 답(활동, 문항id) {
  return 기록.acts[활동]?.[문항id] || null;
}

export function 답적기(활동, 문항id, 값) {
  if (!기록.acts[활동]) 기록.acts[활동] = {};
  기록.acts[활동][문항id] = 값;
  저장();
}

export function 활동지우기(활동) {
  delete 기록.acts[활동];
  저장();
}

// ── 자유 기록 ────────────────────────────────────────────────
export function 자료(열쇠, 기본값 = null) {
  return 기록.data[열쇠] ?? 기본값;
}

export function 자료적기(열쇠, 값) {
  기록.data[열쇠] = 값;
  저장();
}

export function 모두지우기() {
  기록 = 빈기록();
  if (저장소) {
    try { 저장소.removeItem(저장열쇠); } catch { /* 무시 */ }
  }
  구독자들.forEach((f) => f(기록));
}

// ── 이어하기 파일 ─────────────────────────────────────────────
// 다음 시간에 다른 컴퓨터에서 이어서 할 수 있게 기록을 파일로 내보낸다.
export function 내보내기() {
  return JSON.stringify({ ...기록, exported: new Date().toISOString() }, null, 2);
}

// 파일에서 읽은 글을 받아 검사한 뒤 지금 기록을 갈아 끼운다. 성공하면 true.
export function 들여오기(글) {
  let 읽음;
  try { 읽음 = 검사(JSON.parse(글)); } catch { 읽음 = null; }
  if (!읽음) return false;
  기록 = 읽음;
  저장();
  return true;
}

// 모양이 맞는 기록인지 본다. 다른 앱의 파일이나 손으로 고친 파일을 걸러 낸다.
// 학번·이름 같은 알 수 없는 칸은 옮겨 담지 않는다(혹시 들어 있어도 버려진다).
export function 검사(o) {
  if (!o || typeof o !== 'object') return null;
  if (o.app !== 앱이름) return null;
  if (typeof o.acts !== 'object' || o.acts === null || Array.isArray(o.acts)) return null;
  if (typeof o.data !== 'object' || o.data === null || Array.isArray(o.data)) return null;
  const 깨끗 = 빈기록();
  for (const [활동, 문항들] of Object.entries(o.acts)) {
    if (!문항들 || typeof 문항들 !== 'object') continue;
    깨끗.acts[활동] = {};
    for (const [id, r] of Object.entries(문항들)) {
      if (!r || typeof r !== 'object') continue;
      깨끗.acts[활동][id] = { a: r.a ?? null, ok: !!r.ok, n: Number(r.n) || 0, shown: !!r.shown };
    }
  }
  for (const [k, v] of Object.entries(o.data)) 깨끗.data[k] = v;
  if (o.saved) 깨끗.saved = String(o.saved);
  return 깨끗;
}
