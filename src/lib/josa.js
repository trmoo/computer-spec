/*! 나에게 쏙 맞는 노트북 고르기 — © 2026 티쳐무 · 모든 권리 보유
 *  한국어 조사 고르기. 이름이 입력·자료에서 와서 문장을 미리 정할 수 없을 때 쓴다.
 *  「은(는)」 처럼 늘어놓지 않고, 앞 글자의 받침을 보고 하나를 고른다.
 *
 *  숫자·알파벳은 읽는 소리로 판단한다.
 *    4100M → 「엠」(받침 ㅁ) → 「은」,  N100 → 「백」 이 아니라 끝 글자 0 「영」 → 「은」
 */

// 숫자 끝 글자를 읽었을 때 받침이 있는가 (0 영, 1 일, 3 삼, 6 육, 7 칠, 8 팔)
const 숫자받침 = { 0: true, 1: true, 2: false, 3: true, 4: false, 5: false, 6: true, 7: true, 8: true, 9: false };
// 알파벳을 읽었을 때 받침이 있는가 (L 엘, M 엠, N 엔, R 알)
const 영문받침 = new Set(['L', 'M', 'N', 'R']);

export function 받침있나(글) {
  const t = String(글 ?? '').replace(/[\s」』"')\]]+$/g, '');
  if (!t) return false;
  const c = t[t.length - 1];
  const code = c.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 !== 0;
  if (/[0-9]/.test(c)) return 숫자받침[c];
  if (/[a-z]/i.test(c)) return 영문받침.has(c.toUpperCase());
  return false;
}

export const 은는 = (글) => 글 + (받침있나(글) ? '은' : '는');
export const 이가 = (글) => 글 + (받침있나(글) ? '이' : '가');
export const 을를 = (글) => 글 + (받침있나(글) ? '을' : '를');
// 조사만 따로 (「…」 밖에 붙일 때)
export const 은는만 = (글) => (받침있나(글) ? '은' : '는');
export const 을를만 = (글) => (받침있나(글) ? '을' : '를');
export const 이가만 = (글) => (받침있나(글) ? '이' : '가');
