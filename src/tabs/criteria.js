/*! 나에게 쏙 맞는 노트북 고르기 — © 2026 티쳐무 · 모든 권리 보유
 *  ① 선택 기준 — 기준 아홉 가지 · 이 걱정은 어떤 기준? · 나의 기준 순위.
 */
import { h, md, 상자, 토스트 } from '../lib/ui.js';
import { 을를만 } from '../lib/josa.js';
import { 문항목록 } from '../lib/quiz.js';
import { 자료, 자료적기 } from '../lib/store.js';
import { 기준들, 기준이름 } from '../data/criteria.js';
import { 기본순서, 최소글자, 글자수 } from '../data/activities.js';

export const 하위들 = [
  { id: 'list', label: '기준 아홉 가지' },
  { id: 'match', label: '이 걱정은 어떤 기준?' },
  { id: 'rank', label: '나의 기준 순위' },
];

export function 그리기(자리, 하위) {
  if (하위 === 'match') return 맞히기(자리);
  if (하위 === 'rank') return 순위(자리);
  return 목록(자리);
}

function 목록(자리) {
  const 열린 = new Set();
  const 격자 = h('div', { class: 'crit-grid' });
  const 그림 = () => 격자.replaceChildren(...기준들.map((c) => h('button', {
    class: 'crit-card' + (열린.has(c.id) ? ' open' : ''),
    'aria-expanded': 열린.has(c.id) ? 'true' : 'false',
    onClick: () => { 열린.has(c.id) ? 열린.delete(c.id) : 열린.add(c.id); 그림(); },
  },
  h('div', { class: 'crit-icon' }, c.아이콘),
  h('div', { class: 'crit-name' }, c.이름),
  h('div', { class: 'crit-text' }, c.내용),
  열린.has(c.id) ? h('div', { class: 'crit-more' }, '👉 ', c.더) : h('div', { class: 'crit-tap' }, '눌러서 더 보기'))));
  그림();

  자리.append(
    h('h2', {}, '나에게 적합한 컴퓨터를 고르는 아홉 가지 기준'),
    h('p', { class: 'lead' }, '노트북은 「가장 좋은 것」이 아니라 「나에게 맞는 것」을 고르는 물건입니다. 먼저 무엇을 따져야 하는지 알아봅시다. 카드를 누르면 더 자세한 설명이 나옵니다.'),
    격자,
    상자('tip', '💬 생각해 보기',
      h('p', {}, '아홉 가지를 모두 최고로 갖춘 노트북은 없습니다. 가벼우면 성능이 아쉽고, 성능이 높으면 무겁고 시끄럽고 비쌉니다.'),
      h('p', { html: md('그래서 **나에게 중요한 기준의 순서**를 정하는 것이 노트북 고르기의 첫걸음입니다. 「나의 기준 순위」 화면에서 직접 정해 봅시다.') })),
  );
}

function 맞히기(자리) {
  자리.append(
    h('h2', {}, '이 걱정은 어떤 기준일까?'),
    h('p', { class: 'lead' }, '노트북을 고르는 친구들의 걱정입니다. 어떤 기준과 관련된 걱정인지 골라 보세요.'),
    문항목록('crit-match'),
  );
}

function 순위(자리) {
  const 저장 = 자료('rank') || { 순서: [...기본순서], 이유1: '', 이유9: '', 확정: false };
  // 기준이 바뀌었을 때를 대비해 모르는 id 는 빼고 빠진 id 는 뒤에 붙인다.
  let 순서 = 저장.순서.filter((id) => 기준이름[id]);
  for (const id of 기본순서) if (!순서.includes(id)) 순서.push(id);
  let 확정 = !!저장.확정;

  const 적기 = (바꿈 = {}) => {
    Object.assign(저장, 바꿈, { 순서 });
    자료적기('rank', { ...저장, 확정 });
  };

  const 목록 = h('ol', { class: 'rank-list' });
  const 상태 = h('div', { class: 'rank-state' });

  const 옮기기 = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= 순서.length) return;
    [순서[i], 순서[j]] = [순서[j], 순서[i]];
    확정 = false;
    적기();
    그림();
  };

  const 그림 = () => {
    목록.replaceChildren(...순서.map((id, i) => {
      const c = 기준들.find((x) => x.id === id);
      return h('li', { class: 'rank-item' + (i < 3 ? ' top' : '') },
        h('span', { class: 'rank-no' }, `${i + 1}위`),
        h('span', { class: 'rank-name' }, `${c.아이콘} ${c.이름}`),
        h('span', { class: 'rank-desc' }, c.내용),
        h('span', { class: 'rank-btns' },
          h('button', { class: 'btn small', disabled: i === 0, 'aria-label': `${c.이름} 위로`, onClick: () => 옮기기(i, -1) }, '▲'),
          h('button', { class: 'btn small', disabled: i === 순서.length - 1, 'aria-label': `${c.이름} 아래로`, onClick: () => 옮기기(i, 1) }, '▼')));
    }));
    이유1이름.textContent = `1순위 「${기준이름[순서[0]]}」${을를만(기준이름[순서[0]])} 가장 중요하게 여긴 까닭`;
    이유9이름.textContent = `9순위 「${기준이름[순서[8]]}」${을를만(기준이름[순서[8]])} 가장 덜 중요하게 여긴 까닭 (선택)`;
    상태.replaceChildren(확정
      ? h('div', { class: 'fb good' }, '✅ 순위를 확정했습니다. 이 순위는 ⑥ 종합 미션에서 「내 기준 점수」를 셈하는 데 쓰입니다.')
      : h('div', { class: 'fb hint' }, '순위를 정하고 까닭을 쓴 뒤 [순위 확정] 을 누르세요.'));
  };

  const 이유1이름 = h('label', { class: 'field-label', for: 'rank-r1' });
  const 이유9이름 = h('label', { class: 'field-label', for: 'rank-r9' });
  const 이유1 = h('textarea', { id: 'rank-r1', rows: 3, placeholder: '예) 매일 버스로 통학해서 가방이 무거우면 힘들기 때문이다.', value: 저장.이유1 || '',
    onInput: (e) => 적기({ 이유1: e.target.value }) });
  const 이유9 = h('textarea', { id: 'rank-r9', rows: 2, placeholder: '예) 집 근처에 서비스센터가 있어서 크게 걱정되지 않는다.', value: 저장.이유9 || '',
    onInput: (e) => 적기({ 이유9: e.target.value }) });

  const 확정단추 = h('button', {
    class: 'btn primary big', onClick: () => {
      if (글자수(이유1.value) < 최소글자.순위이유) {
        토스트(`1순위의 까닭을 ${최소글자.순위이유}자 이상 써 주세요.`);
        이유1.focus();
        return;
      }
      확정 = true;
      적기({ 이유1: 이유1.value, 이유9: 이유9.value });
      그림();
      토스트('순위를 확정했습니다.');
    },
  }, '✔ 순위 확정');

  그림();
  자리.append(
    h('h2', {}, '나의 기준 순위 정하기'),
    h('p', { class: 'lead' }, '▲▼ 단추로 아홉 가지 기준을 나에게 중요한 차례대로 늘어놓으세요. 정답은 없습니다. 내가 노트북으로 무엇을 할지, 어떻게 들고 다닐지를 떠올려 보세요.'),
    목록,
    h('div', { class: 'field' }, 이유1이름, 이유1),
    h('div', { class: 'field' }, 이유9이름, 이유9),
    h('div', { class: 'row' }, 확정단추),
    상태,
  );
}
