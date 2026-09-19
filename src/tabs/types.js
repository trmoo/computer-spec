/*! 나에게 쏙 맞는 노트북 고르기 — © 2026 티쳐무 · 모든 권리 보유
 *  ② 노트북의 종류 — 네 가지 종류 · 문장 카드 나누기 · 이 사람에게는 어떤 노트북?
 */
import { h, md, 상자 } from '../lib/ui.js';
import { 문항목록 } from '../lib/quiz.js';
import { 종류들 } from '../data/types.js';

export const 하위들 = [
  { id: 'cards', label: '노트북 네 종류' },
  { id: 'sort', label: '문장 카드 나누기' },
  { id: 'who', label: '이 사람에게는?' },
];

export function 그리기(자리, 하위) {
  if (하위 === 'sort') {
    자리.append(
      h('h2', {}, '문장 카드 나누기'),
      h('p', { class: 'lead' }, '카드 12장에 적힌 문장은 어떤 노트북 이야기일까요? 알맞은 종류를 골라 보세요. 종류마다 3장씩입니다.'),
      문항목록('type-sort', { 모양: '카드' }),
    );
    return;
  }
  if (하위 === 'who') {
    자리.append(
      h('h2', {}, '이 사람에게는 어떤 노트북?'),
      h('p', { class: 'lead' }, '각 사람이 노트북으로 하는 일과 쓰는 곳을 읽고, 가장 알맞은 종류를 골라 보세요.'),
      문항목록('type-who'),
    );
    return;
  }

  // 종류 소개 — 하나를 골라 크게 본다
  let 고른 = 종류들[0].id;
  const 단추줄 = h('div', { class: 'type-tabs' });
  const 판 = h('div', { class: 'type-panel' });
  const 그림 = () => {
    단추줄.replaceChildren(...종류들.map((t) => h('button', {
      class: 'type-btn' + (t.id === 고른 ? ' on' : ''), onClick: () => { 고른 = t.id; 그림(); },
    }, h('span', { class: 'type-icon' }, t.아이콘), t.짧게)));
    const t = 종류들.find((x) => x.id === 고른);
    판.replaceChildren(
      h('h3', {}, `${t.아이콘} ${t.이름}`),
      h('div', { class: 'type-cols' },
        칸('특징', 'feat', t.특징),
        칸('장점', 'pro', t.장점),
        칸('단점', 'con', t.단점)),
    );
  };
  그림();

  자리.append(
    h('h2', {}, '노트북의 종류'),
    h('p', { class: 'lead' }, '노트북은 무엇을 앞세우느냐에 따라 크게 네 종류로 나눌 수 있습니다. 단추를 눌러 하나씩 살펴보세요.'),
    단추줄, 판,
    상자('now', '🔎 이 밖에도',
      h('p', { html: md('**크리에이터 노트북** — 게이밍 노트북과 비슷한 성능에 색이 정확한 화면과 차분한 디자인을 더한 것. 영상·디자인 작업용.') }),
      h('p', { html: md('**AI PC(Copilot+ PC)** — AI 계산 전용 장치(NPU)를 넣은 노트북. 사진 속 물체 지우기, 실시간 자막 같은 AI 기능을 인터넷 없이 빠르게 돌린다. 네 종류와 겹쳐서 붙는 이름이다.') })),
  );
}

function 칸(제목, 종류, 줄들) {
  return h('div', { class: `type-col ${종류}` },
    h('h4', {}, 제목),
    h('ul', {}, 줄들.map((줄) => h('li', { html: md(줄) }))));
}
