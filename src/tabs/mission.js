/*! 나에게 쏙 맞는 노트북 고르기 — © 2026 티쳐무 · 모든 권리 보유
 *  ⑥ 종합 미션 — 연습(이 사람에게 맞는 노트북은?) · 나에게 쏙 맞는 노트북 고르기.
 */
import { h, md, 상자, 토스트 } from '../lib/ui.js';
import { 문항목록 } from '../lib/quiz.js';
import { 자료, 자료적기 } from '../lib/store.js';
import { 노트북들, 목적들 } from '../data/laptops.js';
import { 기준들 } from '../data/criteria.js';
import { 기본순서, 최소글자, 글자수 } from '../data/activities.js';
import { 내기준점수, 만원 } from '../engine/calc.js';
import { 조건점검, 미션점검 } from '../engine/mission.js';

export const 하위들 = [
  { id: 'practice', label: '연습: 이 사람에게는?' },
  { id: 'mine', label: '나에게 쏙 맞는 노트북' },
];

export function 그리기(자리, 하위, 이동) {
  if (하위 === 'mine') return 내미션(자리, 이동);
  return 연습(자리);
}

const 가상안내 = () => 상자('warn', '⚠ 수업용 가상 노트북',
  h('p', {}, '아래 노트북 여섯 대의 이름과 가격은 수업을 위해 지어낸 것입니다. CPU·그래픽카드 이름은 실제 제품이지만, 이 조합의 노트북이 실제로 이 값에 팔린다는 뜻은 아닙니다.'));

function 사양카드(n, { 열림 = false } = {}) {
  const 줄 = (k, v) => h('tr', {}, h('th', {}, k), h('td', {}, v));
  return h('details', { class: 'spec-card', open: 열림 },
    h('summary', {}, '📋 전체 사양 보기'),
    h('table', { class: 'spec' }, h('tbody', {},
      줄('CPU', n.CPU), 줄('램', n.램), 줄('저장장치', n.저장), 줄('화면', n.화면), 줄('그래픽', n.그래픽),
      줄('무게', `${n.무게}kg`), 줄('배터리', n.배터리), 줄('포트', n.포트), 줄('A/S', n.AS))));
}

function 한눈표() {
  return h('div', { class: 'table-scroll' }, h('table', { class: 'tbl compare' },
    h('thead', {}, h('tr', {}, ['', '종류', '가격', 'CPU', '램/저장', '화면', '그래픽', '무게', '배터리', '특이점'].map((x) => h('th', {}, x)))),
    h('tbody', {}, 노트북들.map((n) => h('tr', {},
      h('td', {}, h('b', {}, `${n.id}. ${n.이름}`)), h('td', {}, n.종류), h('td', {}, 만원(n.가격)), h('td', {}, n.CPU),
      h('td', {}, `${n.램} / ${n.저장}`), h('td', {}, n.화면), h('td', {}, n.그래픽), h('td', {}, `${n.무게}kg`), h('td', {}, n.배터리),
      h('td', {}, [n.펜 && '✏️ 펜·터치', n.구조 === 'ARM' && '⚙️ ARM 칩', n.외장 && '🎮 외장 그래픽'].filter(Boolean).join(' · ') || '-'))))));
}

function 연습(자리) {
  자리.append(
    h('h2', {}, '연습 — 이 사람에게 맞는 노트북은?'),
    h('p', { class: 'lead' }, '먼저 네 사람의 조건에 맞는 노트북을 골라 봅시다. 조건을 하나씩 따져 후보를 줄여 나가는 연습입니다.'),
    가상안내(),
    한눈표(),
    문항목록('mission-practice'),
  );
}

function 내미션(자리, 이동) {
  const m = { 목적: [], 목적글: '', 예산: 1500000, 최대무게: 0, 선택: '', 이유: '', 포기: '', 실제: {}, ...(자료('mission') || {}) };
  const 순위 = 자료('rank');
  const 순서 = 순위?.순서?.length ? 순위.순서 : 기본순서;
  const 저장 = () => 자료적기('mission', JSON.parse(JSON.stringify(m)));

  // ── 1. 목적 ──
  const 목적줄 = h('div', { class: 'purpose' });
  const 목적그림 = () => 목적줄.replaceChildren(...목적들.map((p) => h('button', {
    class: 'purpose-btn' + (m.목적.includes(p.id) ? ' on' : ''),
    'aria-pressed': m.목적.includes(p.id) ? 'true' : 'false',
    onClick: () => {
      m.목적 = m.목적.includes(p.id) ? m.목적.filter((x) => x !== p.id) : [...m.목적, p.id];
      저장(); 목적그림(); 비교그림();
    },
  }, p.이름)));
  목적그림();

  // ── 2. 조건 ──
  const 예산값 = h('b', { class: 'big-num' });
  const 예산글 = () => { 예산값.textContent = m.예산 ? 만원(m.예산) : '정하지 않음'; };
  예산글();
  const 예산 = h('input', { type: 'range', min: 0, max: 3000000, step: 100000, value: m.예산, class: 'slider', 'aria-label': '예산',
    onInput: (e) => { m.예산 = Number(e.target.value); 예산글(); 저장(); 비교그림(); } });
  const 무게 = h('select', { class: 'select', 'aria-label': '최대 무게',
    onChange: (e) => { m.최대무게 = Number(e.target.value); 저장(); 비교그림(); } },
  [[0, '상관없음'], [1.2, '1.2kg 이하'], [1.5, '1.5kg 이하'], [2, '2kg 이하'], [2.5, '2.5kg 이하']].map(([v, t]) => h('option', { value: v, selected: m.최대무게 === v }, t)));

  // ── 3. 비교표 ──
  const 비교 = h('div', { class: 'pick-list' });
  const 비교그림 = () => {
    비교.replaceChildren(...노트북들
      .map((n) => ({ n, 점: 내기준점수(n.평점, 순서), 걸림: 조건점검(n, m) }))
      .sort((a, b) => b.점 - a.점)
      .map(({ n, 점, 걸림 }, 등) => h('div', { class: 'pick-row' + (m.선택 === n.id ? ' on' : '') + (걸림.length ? ' blocked' : '') },
        h('label', { class: 'pick-main' },
          h('input', { type: 'radio', name: 'pick', checked: m.선택 === n.id, onChange: () => { m.선택 = n.id; 저장(); 비교그림(); 점검칸.replaceChildren(); } }),
          h('span', { class: 'pick-rank' }, `${등 + 1}위`),
          h('span', { class: 'pick-name' }, `${n.id}. ${n.이름}`),
          h('span', { class: 'muted' }, ` ${n.종류} · ${만원(n.가격)} · ${n.무게}kg`)),
        h('div', { class: 'score-bar' }, h('div', { class: 'score-fill', style: { width: `${점}%` } }), h('span', {}, `내 기준 점수 ${점}점`)),
        h('div', { class: 'pick-check' }, 걸림.length ? `⚠ ${걸림.join(' · ')}` : '✔ 내 조건을 모두 만족'),
        사양카드(n))));
  };
  비교그림();

  // ── 4. 까닭 ──
  const 글칸 = (열쇠, 이름, 최소, 예시, 줄수 = 4) => {
    const 셈 = h('span', { class: 'count' });
    const 셈글 = (v) => { const n = 글자수(v); 셈.textContent = `${n}자 / ${최소}자 이상`; 셈.className = 'count' + (n >= 최소 ? ' ok' : ''); };
    const 칸 = h('textarea', { rows: 줄수, value: m[열쇠] || '', placeholder: 예시, 'aria-label': 이름,
      onInput: (e) => { m[열쇠] = e.target.value; 셈글(e.target.value); 저장(); } });
    셈글(m[열쇠]);
    return h('div', { class: 'field' }, h('div', { class: 'field-head' }, h('label', { class: 'field-label' }, 이름), 셈), 칸);
  };

  const 점검칸 = h('div', { class: 'check-out' });
  const 점검 = () => {
    const 말 = 미션점검(m, 순서);
    점검칸.replaceChildren(...말.map((x) => h('div', { class: `fb ${x.종류 === 'good' ? 'good' : x.종류 === 'warn' ? 'bad' : 'hint'}` },
      x.종류 === 'good' ? '✅ ' : x.종류 === 'warn' ? '⚠ ' : '💡 ', x.글)));
    const 끝 = 노트북들.some((n) => n.id === m.선택) && 글자수(m.이유) >= 최소글자.선택이유 && 글자수(m.포기) >= 최소글자.포기;
    if (끝) 토스트('종합 미션을 마쳤습니다. ⑦ 내 활동지에서 파일로 내려받으세요.');
  };

  // ── 5. 실제 제품 조사(선택) ──
  const 실제칸 = (열쇠, 이름, 예시) => h('label', { class: 'mini-field' }, h('span', {}, 이름),
    h('input', { type: 'text', value: m.실제[열쇠] || '', placeholder: 예시, onInput: (e) => { m.실제[열쇠] = e.target.value; 저장(); } }));

  const 순위안내 = 순위?.확정
    ? 상자('info', '📊 내 기준 점수', h('p', {}, `① 에서 정한 순위(1위 ${기준들.find((c) => c.id === 순서[0]).이름} … 9위 ${기준들.find((c) => c.id === 순서[8]).이름})로 셈했습니다. 1위 기준은 9배, 9위 기준은 1배로 무게를 두어 각 노트북의 기준별 평점(1~5점)을 더한 뒤 100점 만점으로 바꾼 값입니다.`))
    : 상자('warn', '📊 아직 기준 순위를 확정하지 않았습니다',
      h('p', {}, '지금 점수는 기본 순서로 셈한 것입니다. 「① 선택 기준 → 나의 기준 순위」에서 순위를 확정하면 나에게 맞는 점수로 바뀝니다.'),
      h('button', { class: 'btn primary', onClick: () => 이동('criteria', 'rank') }, '순위 정하러 가기'));

  자리.append(
    h('h2', {}, '나에게 쏙 맞는 노트북 고르기'),
    h('p', { class: 'lead' }, '이제 여러분 차례입니다. 내가 노트북으로 무엇을 할지 정하고, 조건을 세우고, 여섯 대 가운데 하나를 골라 그 까닭을 설명하세요. 정답은 없습니다. 「왜 그것을 골랐는가」가 가장 중요합니다.'),
    가상안내(),
    h('div', { class: 'step' }, h('h3', {}, '1단계 — 노트북으로 무엇을 할까? (여러 개 고르기)'), 목적줄,
      h('input', { type: 'text', class: 'wide', value: m.목적글, placeholder: '더 적고 싶은 목적이 있으면 쓰세요 (예: 방송반 영상 편집, 대학 가서도 쓰기)',
        'aria-label': '더 적고 싶은 목적', onInput: (e) => { m.목적글 = e.target.value; 저장(); } })),
    h('div', { class: 'step' }, h('h3', {}, '2단계 — 조건 세우기'),
      h('div', { class: 'ctrl' }, h('span', { class: 'ctrl-label' }, '예산'), 예산, 예산값),
      h('div', { class: 'ctrl' }, h('span', { class: 'ctrl-label' }, '최대 무게'), 무게),
      h('p', { class: 'muted' }, '예산 막대를 맨 왼쪽(0)으로 두면 「정하지 않음」입니다.')),
    h('div', { class: 'step' }, h('h3', {}, '3단계 — 비교하고 하나 고르기'), 순위안내,
      h('p', { class: 'muted' }, '내 기준 점수가 높은 차례로 늘어놓았습니다. 줄을 펼치면 전체 사양이 보입니다. ⚠ 표시는 내 조건과 어긋나는 곳입니다.'),
      비교),
    h('div', { class: 'step' }, h('h3', {}, '4단계 — 까닭 쓰기'),
      글칸('이유', '이 노트북을 고른 까닭 (나의 기준과 사양의 숫자를 들어서)', 최소글자.선택이유,
        '예) 나는 매일 버스로 통학해서 무게가 1순위다. A 는 1.0kg 으로 가장 가볍고 배터리도 20시간이라 충전기 없이 하루를 버틸 수 있다. 램이 16GB 라서 3년 뒤에도 코딩 공부에 충분하다.', 5),
      글칸('포기', '이 노트북을 고르며 포기한 것', 최소글자.포기, '예) 가장 비싸서 예산을 거의 다 쓴다. 외장 그래픽이 없어 3D 게임은 어렵다.', 3),
      h('div', { class: 'row' }, h('button', { class: 'btn primary big', onClick: 점검 }, '🔍 점검하기')),
      점검칸),
    h('div', { class: 'step optional' }, h('h3', {}, '5단계 (선택) — 실제 제품도 찾아보기'),
      h('p', {}, '가격 비교 사이트에서 내 조건에 맞는 실제 노트북을 하나 찾아 사양을 옮겨 적어 보세요. 가상 노트북과 견주어 보면 사양표 읽기가 훨씬 익숙해집니다.'),
      h('div', { class: 'mini-grid' },
        실제칸('이름', '제품 이름', '제조사와 모델명'), 실제칸('가격', '가격', '예) 129만 원'), 실제칸('CPU', 'CPU', '예) Core Ultra 5 125H'),
        실제칸('램저장', '램 / 저장장치', '예) 16GB / 512GB'), 실제칸('화면', '화면', '예) 14인치 WUXGA'), 실제칸('무게', '무게', '예) 1.3kg'),
        실제칸('출처', '조사한 곳', '예) 가격 비교 사이트'))),
    상자('tip', '📥 다 했으면', h('p', { html: md('**⑦ 내 활동지** 에서 활동 전체를 HTML 파일로 내려받아 제출하세요.') }),
      h('button', { class: 'btn primary', onClick: () => 이동('report') }, '⑦ 내 활동지로 가기')),
  );
}
