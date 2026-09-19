/*! 나에게 쏙 맞는 노트북 고르기 — © 2026 티쳐무 · 모든 권리 보유
 *  활동 목록과 채점.
 *
 *  채점 활동(quiz) 은 모두 같은 모양의 문항을 쓴다.
 *    { id, q, 보기:[...], 답: 번호 }            — 고르기
 *    { id, 종류:'num', q, 답: 수, 허용, 단위 }   — 수 쓰기
 *  서술·선택 활동(rank·mission·free·reflect) 은 점수 없이 「했는가」만 본다.
 *
 *  ⚠ 활동을 늘릴 때는 여기와 탭 화면의 문항목록('열쇠', …) 을 함께 고친다.
 *    test/activities.test.mjs 가 어긋남(열쇠 중복·문항 id 중복·정답 번호 범위)을 잡는다.
 *  ⚠ DOM 을 만들지 말 것. node 에서 그대로 불러다 시험한다.
 */
import { 기준맞히기, 기준들 } from './criteria.js';
import { 분류카드, 누구에게 } from './types.js';
import { 크기문제, 해상도문제, 포트이름문제, 속도문제 } from './display.js';
import { 해부문제, 스레드문제, 접미사문제, 클럭문제 } from './cpu.js';
import { 부품문제 } from './parts.js';
import { 인물문제, 노트북들 } from './laptops.js';

export const 탭들 = [
  { id: 'criteria', 이름: '① 선택 기준' },
  { id: 'types', 이름: '② 노트북 종류' },
  { id: 'screen', 이름: '③ 화면·포트' },
  { id: 'cpu', 이름: '④ CPU' },
  { id: 'parts', 이름: '⑤ 그 밖의 부품' },
  { id: 'mission', 이름: '⑥ 종합 미션' },
  { id: 'report', 이름: '⑦ 내 활동지' },
];

export const 활동들 = [
  { key: 'crit-match', 탭: 'criteria', 화면: 'match', 제목: '이 걱정은 어떤 기준일까?', 종류: 'quiz', 문항: 기준맞히기 },
  { key: 'crit-rank', 탭: 'criteria', 화면: 'rank', 제목: '나의 기준 순위 정하기', 종류: 'rank' },
  { key: 'type-sort', 탭: 'types', 화면: 'sort', 제목: '문장 카드 나누기', 종류: 'quiz', 문항: 분류카드 },
  { key: 'type-who', 탭: 'types', 화면: 'who', 제목: '이 사람에게는 어떤 노트북?', 종류: 'quiz', 문항: 누구에게 },
  { key: 'screen-size', 탭: 'screen', 화면: 'size', 제목: '화면 크기 확인 문제', 종류: 'quiz', 문항: 크기문제 },
  { key: 'screen-res', 탭: 'screen', 화면: 'res', 제목: '해상도·주사율 확인 문제', 종류: 'quiz', 문항: 해상도문제 },
  { key: 'port-name', 탭: 'screen', 화면: 'port', 제목: '단자 이름 맞히기', 종류: 'quiz', 문항: 포트이름문제 },
  { key: 'port-speed', 탭: 'screen', 화면: 'speed', 제목: '전송 속도 확인 문제', 종류: 'quiz', 문항: 속도문제 },
  { key: 'cpu-decode', 탭: 'cpu', 화면: 'decode', 제목: 'CPU 모델명 읽기', 종류: 'quiz', 문항: 해부문제 },
  { key: 'cpu-mine', 탭: 'cpu', 화면: 'decode', 제목: '우리 교실 컴퓨터의 CPU', 종류: 'free' },
  { key: 'cpu-thread', 탭: 'cpu', 화면: 'core', 제목: '코어와 스레드 계산', 종류: 'quiz', 문항: 스레드문제 },
  { key: 'cpu-suffix', 탭: 'cpu', 화면: 'suffix', 제목: '접미사 확인 문제', 종류: 'quiz', 문항: 접미사문제 },
  { key: 'cpu-clock', 탭: 'cpu', 화면: 'clock', 제목: '클럭·터보·NPU 확인 문제', 종류: 'quiz', 문항: 클럭문제 },
  { key: 'parts-quiz', 탭: 'parts', 화면: 'quiz', 제목: '그 밖의 부품 확인 문제', 종류: 'quiz', 문항: 부품문제 },
  { key: 'mission-practice', 탭: 'mission', 화면: 'practice', 제목: '이 사람에게 맞는 노트북은?', 종류: 'quiz', 문항: 인물문제 },
  { key: 'mission-mine', 탭: 'mission', 화면: 'mine', 제목: '나에게 쏙 맞는 노트북 고르기', 종류: 'mission' },
  { key: 'reflect', 탭: 'report', 화면: 'main', 제목: '오늘의 배움 정리', 종류: 'reflect' },
];

export const 활동찾기 = (key) => 활동들.find((a) => a.key === key);

// ── 문항 채점 ────────────────────────────────────────────────
// 수 쓰기 문항은 쉼표·단위·빈칸을 걷어 내고 읽는다. "39.6cm" "39,6" 도 받는다.
export function 수읽기(값) {
  if (typeof 값 === 'number') return 값;
  const t = String(값 ?? '').trim().replace(/,/g, '.').replace(/[^0-9.\-]/g, '');
  if (t === '' || t === '.' || t === '-') return NaN;
  return Number(t);
}

export function 정답인가(문항, 값) {
  if (문항.종류 === 'num') {
    const n = 수읽기(값);
    if (!isFinite(n)) return false;
    return Math.abs(n - 문항.답) <= (문항.허용 ?? 0) + 1e-9;
  }
  return Number(값) === 문항.답;
}

// 문항의 정답을 글로 (활동지·정답 보기에 쓴다)
export function 정답글(문항) {
  if (문항.종류 === 'num') return `${문항.답}${문항.단위 ? ' ' + 문항.단위 : ''}`;
  return 문항.보기[문항.답];
}

// 학생이 적은 답을 글로
export function 답글(문항, 기록) {
  if (!기록 || 기록.a == null || 기록.a === '') return '';
  if (문항.종류 === 'num') return `${기록.a}${문항.단위 && !/[^0-9.,\-\s]/.test(String(기록.a)) ? ' ' + 문항.단위 : ''}`;
  return 문항.보기[Number(기록.a)] ?? '';
}

// 한 활동의 점수 — 기록(state) 을 받아 { 맞음, 전체, 푼 } 을 돌려준다
export function 활동점수(기록, 활동) {
  if (활동.종류 !== 'quiz') return null;
  const 답들 = 기록.acts[활동.key] || {};
  let 맞음 = 0;
  let 푼 = 0;
  for (const 문항 of 활동.문항) {
    const r = 답들[문항.id];
    if (!r) continue;
    if (r.ok) { 맞음++; 푼++; } else if (r.shown) 푼++;
  }
  return { 맞음, 전체: 활동.문항.length, 푼 };
}

export function 전체점수(기록) {
  let 맞음 = 0;
  let 전체 = 0;
  for (const 활동 of 활동들) {
    const 점 = 활동점수(기록, 활동);
    if (!점) continue;
    맞음 += 점.맞음;
    전체 += 점.전체;
  }
  return { 맞음, 전체 };
}

// 서술·선택 활동이 끝났는지
export const 최소글자 = { 순위이유: 10, 선택이유: 30, 포기: 10, 배운점: 20 };

export function 완료인가(기록, 활동) {
  const d = 기록.data || {};
  switch (활동.종류) {
    case 'quiz': {
      const 점 = 활동점수(기록, 활동);
      return 점.푼 === 점.전체;
    }
    case 'rank': {
      const r = d.rank;
      return !!(r && r.확정 && Array.isArray(r.순서) && r.순서.length === 기준들.length
        && 글자수(r.이유1) >= 최소글자.순위이유);
    }
    case 'mission': {
      const m = d.mission;
      return !!(m && 노트북들.some((n) => n.id === m.선택)
        && 글자수(m.이유) >= 최소글자.선택이유 && 글자수(m.포기) >= 최소글자.포기);
    }
    case 'free': return 글자수(d.cpuMine?.모델) > 0;
    case 'reflect': return 글자수(d.reflect?.배운점) >= 최소글자.배운점;
    default: return false;
  }
}

export function 글자수(글) {
  return String(글 ?? '').replace(/\s/g, '').length;
}

export function 진행률(기록) {
  const 끝 = 활동들.filter((a) => 완료인가(기록, a)).length;
  return { 끝, 전체: 활동들.length };
}

// 순위가 없을 때 쓰는 기본 순서 (기준 목록 순서)
export const 기본순서 = 기준들.map((c) => c.id);
