/*! 나에게 쏙 맞는 노트북 고르기 — © 2026 티쳐무 · 모든 권리 보유
 *  계산 모음. 화면(DOM)을 건드리지 않으므로 node 에서 그대로 시험한다.
 */

// 1인치 = 2.54cm (국제 약속으로 정해진 값)
export const 인치cm = 2.54;

export function 인치를cm(인치) {
  return 인치 * 인치cm;
}

// 화면 크기 「14인치」는 가로가 아니라 **대각선** 길이다.
// 가로:세로 비율이 a:b 이면 피타고라스 정리로 가로·세로를 구한다.
//   대각선² = 가로² + 세로²,  가로 = 대각선 × a / √(a²+b²)
export function 화면가로세로(인치, a, b) {
  const 대각 = 인치를cm(인치);
  const 빗변 = Math.hypot(a, b);
  return { 대각, 가로: (대각 * a) / 빗변, 세로: (대각 * b) / 빗변 };
}

// 화면 넓이(cm²)
export function 화면넓이(인치, a, b) {
  const { 가로, 세로 } = 화면가로세로(인치, a, b);
  return 가로 * 세로;
}

// PPI (Pixels Per Inch) — 1인치 안에 점(픽셀)이 몇 개 늘어서는가. 클수록 선명하다.
//   대각선에 놓인 픽셀 수 ÷ 대각선 인치
export function ppi(가로픽셀, 세로픽셀, 인치) {
  return Math.hypot(가로픽셀, 세로픽셀) / 인치;
}

// 이론상 전송 시간(초). 1바이트 = 8비트이므로 GB 에 8을 곱해 Gb 로 바꾼 뒤 속도(Gbps)로 나눈다.
//   ⚠ 이론상 최댓값 기준이다. 실제로는 저장장치 속도·케이블·파일 개수 때문에 더 오래 걸린다.
export function 전송초(용량GB, 속도Gbps) {
  return (용량GB * 8) / 속도Gbps;
}

// 초를 「1분 20초」처럼 읽기 쉽게
export function 시간말하기(초) {
  if (!isFinite(초)) return '-';
  if (초 < 1) return `${(Math.round(초 * 100) / 100).toString()}초`;
  if (초 < 60) return `${Math.round(초 * 10) / 10}초`;
  const 전체초 = Math.round(초);
  const 시 = Math.floor(전체초 / 3600);
  const 분 = Math.floor((전체초 % 3600) / 60);
  const 남초 = 전체초 % 60;
  if (시 > 0) return `${시}시간 ${분}분`;
  return 남초 ? `${분}분 ${남초}초` : `${분}분`;
}

// 코어·스레드 셈.
//   성능 코어(P)는 하이퍼스레딩(한 코어가 일을 두 갈래로 받는 기술)이 켜져 있으면 2스레드,
//   효율 코어(E)·저전력 효율 코어(LP-E)는 보통 1스레드.
//   ⚠ AMD 의 작은 코어(Zen 5c)는 예외로 2스레드다 → 작은코어2: true
export function 코어스레드({ P = 0, E = 0, LPE = 0, 하이퍼 = true, 작은코어2 = false }) {
  const 코어 = P + E + LPE;
  const 스레드 = P * (하이퍼 ? 2 : 1) + (E + LPE) * (작은코어2 ? 2 : 1);
  return { 코어, 스레드 };
}

// 기준 순위를 가중치로 바꾼다. 1위 = 9점, 9위 = 1점.
export function 순위가중치(순위배열) {
  const 가중 = {};
  순위배열.forEach((id, i) => { 가중[id] = 순위배열.length - i; });
  return 가중;
}

// 노트북 한 대의 「내 기준 점수」(0~100).
//   각 기준 평점(1~5)에 가중치를 곱해 더하고, 가능한 최고점으로 나눈다.
export function 내기준점수(평점, 순위배열) {
  const 가중 = 순위가중치(순위배열);
  let 합 = 0;
  let 최대 = 0;
  for (const id of 순위배열) {
    합 += (평점[id] ?? 0) * 가중[id];
    최대 += 5 * 가중[id];
  }
  return 최대 ? Math.round((합 / 최대) * 100) : 0;
}

// 소수 자리 맞추기 (0.1 → "0.1", 39.624 → "39.6")
export function 반올림(수, 자리 = 1) {
  const k = 10 ** 자리;
  return Math.round(수 * k) / k;
}

// 원 단위 금액을 「139만 원」처럼
export function 만원(원) {
  return `${Math.round(원 / 10000).toLocaleString('ko-KR')}만 원`;
}
