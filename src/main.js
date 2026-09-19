/*! 나에게 쏙 맞는 노트북 고르기 — © 2026 티쳐무 · 모든 권리 보유
 *  학교 수업 목적으로만 이용해 주세요. 무단 배포·상업적 이용을 금합니다.
 *
 *  정보 · Ⅰ. 컴퓨팅 시스템 — 문제 해결에 적합한 하드웨어를 선택하여 컴퓨팅 장치를 구성한다.
 *  (2022 개정 교육과정 [12정01-03] 의 「적합한 장치를 선택하기」와 이어진다)
 *
 *  탭 일곱 개 — 학습지 흐름을 따른다.
 *    ① 선택 기준 → ② 노트북 종류 → ③ 화면·포트 → ④ CPU → ⑤ 그 밖의 부품 → ⑥ 종합 미션 → ⑦ 내 활동지
 *
 *  주소 해시로 화면을 가리킬 수 있다 (#cpu/decode · #mission/mine).
 *  수업에서 「지금 이 화면을 열어 보세요」라고 주소를 불러 주기 위함이다.
 */
import './style.css';
import { h, 화면시작 } from './lib/ui.js';
import { 불러오기, 구독, 지금기록 } from './lib/store.js';
import { 탭들, 진행률, 전체점수 } from './data/activities.js';
import * as 기준탭 from './tabs/criteria.js';
import * as 종류탭 from './tabs/types.js';
import * as 화면탭 from './tabs/screen.js';
import * as CPU탭 from './tabs/cpu.js';
import * as 부품탭 from './tabs/parts.js';
import * as 미션탭 from './tabs/mission.js';
import * as 활동지탭 from './tabs/report.js';

const 탭모듈 = {
  criteria: 기준탭, types: 종류탭, screen: 화면탭, cpu: CPU탭,
  parts: 부품탭, mission: 미션탭, report: 활동지탭,
};

불러오기();

const 탭줄 = h('nav', { class: 'tabs', 'aria-label': '큰 갈래' });
const 진행 = h('div', { class: 'progress' });
const 본문 = h('main', { class: 'main' });

document.getElementById('app').append(
  h('header', { class: 'topbar' },
    h('div', { class: 'brand' },
      h('h1', {}, '💻 나에게 쏙 맞는 노트북 고르기'),
      h('span', { class: 'std' }, '정보 Ⅰ. 컴퓨팅 시스템 — 문제 해결에 적합한 하드웨어 선택하기'),
      진행),
    탭줄),
  본문,
  h('footer', { class: 'footer' },
    h('div', { class: 'cr' }, '© 2026 티쳐무 · 모든 권리 보유'),
    h('div', {}, '학교 수업 목적으로만 이용해 주세요. 무단 배포와 상업적 이용을 금합니다.'),
    h('div', {}, '종합 미션의 노트북 이름·가격은 수업용으로 지어낸 것입니다. CPU·그래픽카드 사양은 제조사 공개 자료를 따랐습니다.'),
    h('div', {}, '개인정보를 수집하지 않습니다. 활동 기록은 이 브라우저에만 저장되며, 학번·이름은 내려받는 활동지 파일에만 들어갑니다.')),
);

// ── 주소 읽기 ────────────────────────────────────────────────
function 주소() {
  const [탭, 하위] = (location.hash || '').replace(/^#/, '').split('/');
  const 모듈 = 탭모듈[탭] ? 탭 : 'criteria';
  const 하위들 = 탭모듈[모듈].하위들;
  const 고른하위 = 하위들.find((x) => x.id === 하위) ? 하위 : 하위들[0].id;
  return { 탭: 모듈, 하위: 고른하위 };
}

export function 이동(탭, 하위) {
  const 다음 = '#' + 탭 + (하위 ? '/' + 하위 : '');
  if (location.hash === 다음) 그리기();
  else location.hash = 다음;
}

// 지금 화면 다음 차례(같은 탭의 다음 하위, 없으면 다음 탭의 첫 하위)
function 다음자리(탭, 하위) {
  const 하위들 = 탭모듈[탭].하위들;
  const i = 하위들.findIndex((x) => x.id === 하위);
  if (i < 하위들.length - 1) return { 탭, 하위: 하위들[i + 1].id, 이름: 하위들[i + 1].label };
  const j = 탭들.findIndex((t) => t.id === 탭);
  if (j < 탭들.length - 1) {
    const 다음탭 = 탭들[j + 1];
    return { 탭: 다음탭.id, 하위: 탭모듈[다음탭.id].하위들[0].id, 이름: 다음탭.이름 };
  }
  return null;
}

function 진행그리기() {
  const 진 = 진행률(지금기록());
  const 점 = 전체점수(지금기록());
  진행.replaceChildren(
    h('span', { class: 'chip' }, `끝낸 활동 ${진.끝}/${진.전체}`),
    h('span', { class: 'chip' }, `맞힌 문항 ${점.맞음}/${점.전체}`),
  );
}

function 그리기() {
  화면시작();
  const { 탭, 하위 } = 주소();
  탭줄.replaceChildren(...탭들.map((t) => h('button', {
    class: 'tab' + (t.id === 탭 ? ' on' : ''),
    'aria-current': t.id === 탭 ? 'page' : null,
    onClick: () => 이동(t.id),
  }, t.이름)));

  const 모듈 = 탭모듈[탭];
  const 하위줄 = 모듈.하위들.length > 1
    ? h('div', { class: 'pills' }, 모듈.하위들.map((x) => h('button', {
      class: 'pill' + (x.id === 하위 ? ' on' : ''), onClick: () => 이동(탭, x.id),
    }, x.label)))
    : null;

  const 자리 = h('div', { class: 'screen' });
  const 다음 = 다음자리(탭, 하위);
  // ⚠ replaceChildren 은 null 을 「null」 글자로 넣는다. 빈 자리는 걸러 낸다.
  본문.replaceChildren(...[
    하위줄,
    자리,
    다음 && h('div', { class: 'next-row' },
      h('button', { class: 'btn primary big', onClick: () => { 이동(다음.탭, 다음.하위); window.scrollTo(0, 0); } }, `다음: ${다음.이름} →`)),
  ].filter(Boolean));
  모듈.그리기(자리, 하위, 이동);
}

구독(진행그리기);
window.addEventListener('hashchange', () => { 그리기(); window.scrollTo(0, 0); });
진행그리기();
그리기();
