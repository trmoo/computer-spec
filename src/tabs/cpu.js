/*! 나에게 쏙 맞는 노트북 고르기 — © 2026 티쳐무 · 모든 권리 보유
 *  ④ CPU — 회사와 구조 · 모델명 해부기 · 코어와 스레드 · 접미사 · 클럭.
 */
import { h, md, 상자, 접이 } from '../lib/ui.js';
import { 문항목록 } from '../lib/quiz.js';
import { 자료, 자료적기 } from '../lib/store.js';
import { 회사들, 해부예시, 대표CPU, 요즘접미사, 옛접미사, 데스크톱접미사 } from '../data/cpu.js';
import { 해부, 접미사사전 } from '../engine/decode.js';
import { 코어스레드 } from '../engine/calc.js';

export const 하위들 = [
  { id: 'maker', label: 'CPU 회사' },
  { id: 'decode', label: '모델명 해부기' },
  { id: 'core', label: '코어와 스레드' },
  { id: 'suffix', label: '접미사' },
  { id: 'clock', label: '클럭·터보·NPU' },
];

export function 그리기(자리, 하위) {
  ({ maker: 회사화면, decode: 해부화면, core: 코어화면, suffix: 접미사화면, clock: 클럭화면 }[하위] || 회사화면)(자리);
}

// ── CPU 회사 ─────────────────────────────────────────────────
function 회사화면(자리) {
  자리.append(
    h('h2', {}, 'CPU — 컴퓨터의 두뇌'),
    h('p', { class: 'lead' }, 'CPU(중앙 처리 장치)는 프로그램의 명령을 읽고 계산하는 부품입니다. 노트북의 성능·배터리·발열을 가장 크게 좌우합니다. 누가 만들고 어떤 구조인지부터 알아봅시다.'),
    h('div', { class: 'maker-grid' }, 회사들.map((c) => h('div', { class: 'maker-card ' + (c.구조 === 'ARM' ? 'arm' : 'x86') },
      h('div', { class: 'maker-arch' }, c.구조),
      h('h3', {}, c.이름),
      h('div', { class: 'muted' }, c.대표),
      h('p', {}, c.설명)))),
    상자('info', '📌 x86 과 ARM — 두 갈래의 구조',
      h('p', { html: md('**x86**(인텔·AMD)은 오랫동안 윈도우 PC 에 쓰인 구조라 거의 모든 윈도우 프로그램과 게임이 그대로 돌아갑니다.') }),
      h('p', { html: md('**ARM**(애플 M·퀄컴 스냅드래곤)은 스마트폰에서 시작한 구조로 전기를 아주 적게 써서 배터리가 오래갑니다. 대신 x86 용으로 만든 프로그램 가운데 일부는 느리게 돌거나 아예 실행되지 않을 수 있습니다.') }),
      h('p', {}, '→ 노트북을 고르기 전에 「내가 꼭 써야 하는 프로그램이 이 구조에서 돌아가는가」를 먼저 확인하세요.')),
    상자('now', '📈 CPU 는 이렇게 발전해 왔다',
      h('ol', { class: 'flow' },
        h('li', {}, h('b', {}, '클럭 올리기'), ' — 한 코어의 박자를 빠르게. 그러나 전기와 열이 너무 늘어 5GHz 안팎에서 막혔다.'),
        h('li', {}, h('b', {}, '코어 늘리기'), ' — 두뇌를 여러 개 넣어 나눠 일하게. 그러나 모든 프로그램이 일을 잘게 나누지는 못한다.'),
        h('li', {}, h('b', {}, '똑똑하게 나눠 맡기기'), ' — 클럭당 성능을 높이고, 큰 코어(P)·작은 코어(E)·그래픽(GPU)·AI 장치(NPU)가 일을 나눠 맡는다. 지금의 CPU 가 여기에 있다.'))),
  );
}

// ── 모델명 해부기 ─────────────────────────────────────────────
function 해부화면(자리) {
  const 결과칸 = h('div', { class: 'decode-out' });
  const 입력 = h('input', {
    type: 'text', class: 'decode-input', placeholder: '예) Core Ultra 7 155H', 'aria-label': 'CPU 이름',
    onInput: () => 풀기(),
  });
  const 풀기 = () => {
    const 글 = 입력.value.trim();
    if (!글) { 결과칸.replaceChildren(h('div', { class: 'muted' }, '위 칸에 CPU 이름을 넣거나 아래 예시를 눌러 보세요.')); return; }
    결과칸.replaceChildren(해부그림(해부(글)));
  };
  입력.value = 'Intel(R) Core(TM) i3-4100M CPU @ 2.50GHz';
  풀기();

  // 우리 교실 컴퓨터의 CPU (활동지에 남는다)
  const 내것 = 자료('cpuMine') || { 모델: '', 생각: '' };
  const 내결과 = h('div', {});
  const 내그림 = () => {
    const 글 = String(내것.모델 || '').trim();
    내결과.replaceChildren(글 ? 해부그림(해부(글)) : '');
  };
  const 내입력 = h('input', { type: 'text', class: 'decode-input', value: 내것.모델, placeholder: '설정 → 시스템 → 정보 → 「프로세서」 줄을 그대로 옮겨 쓰세요',
    'aria-label': '우리 교실 컴퓨터의 CPU 이름',
    onInput: (e) => { 내것.모델 = e.target.value; 자료적기('cpuMine', { ...내것 }); 내그림(); } });
  const 내생각 = h('textarea', { rows: 3, value: 내것.생각, placeholder: '예) 13세대 i5 U 모델이라 문서·코딩은 충분하지만, 외장 그래픽이 없어 3D 게임은 어렵다.',
    'aria-label': '이 CPU 로 할 수 있는 일·어려운 일',
    onInput: (e) => { 내것.생각 = e.target.value; 자료적기('cpuMine', { ...내것 }); } });
  내그림();

  자리.append(
    h('h2', {}, 'CPU 모델명 해부기'),
    h('p', { class: 'lead' }, 'CPU 이름에는 회사·등급·세대·접미사가 암호처럼 담겨 있습니다. 이름을 넣으면 조각조각 나눠 뜻을 알려 줍니다. 윈도우에 찍힌 모양 그대로 넣어도 됩니다.'),
    h('div', { class: 'card' },
      입력,
      h('div', { class: 'examples' }, 해부예시.map((예) => h('button', { class: 'btn small', onClick: () => { 입력.value = 예; 풀기(); } }, 예))),
      결과칸),
    상자('tip', '🔢 세대 읽는 법 (인텔 Core i)',
      h('ul', {},
        h('li', { html: md('숫자가 **다섯 자리**면 앞 두 자리가 세대 — i7-**13**700H → 13세대') }),
        h('li', { html: md('**네 자리이고 1로 시작**하면 앞 두 자리가 세대 — i5-**13**35U → 13세대') }),
        h('li', { html: md('그 밖의 **네 자리**는 첫 자리가 세대 — i3-**4**100M → 4세대, i5-**8**250U → 8세대') }))),
    h('div', { class: 'card' },
      h('h3', {}, '🏫 우리 교실 컴퓨터의 CPU 는?'),
      h('p', {}, '윈도우 「설정 → 시스템 → 정보」의 「프로세서」 줄이나, 작업 관리자(Ctrl+Shift+Esc) → 성능 → CPU 에서 이름을 찾아 옮겨 쓰세요. 쓴 내용은 활동지에 들어갑니다.'),
      내입력, 내결과,
      h('label', { class: 'field-label' }, '이 CPU 로 할 수 있는 일과 어려운 일은?'),
      내생각),
    문항목록('cpu-decode'),
  );
}

const 조각색 = { brand: '#3b4fd8', tier: '#e0552b', gen: '#1a8a53', sku: '#6b7280', suffix: '#a23bd8', clock: '#c98a00', arch: '#0f8aa0' };

function 해부그림(풀이) {
  if (!풀이.ok) return h('div', { class: 'fb bad' }, 풀이.알림.map((a) => h('div', {}, a)));
  return h('div', {},
    h('div', { class: 'decode-sum' }, h('span', { class: 'arch-tag ' + (풀이.구조 === 'ARM' ? 'arm' : 'x86') }, 풀이.구조), ` ${풀이.요약}`),
    h('div', { class: 'chips' }, 풀이.조각들.map((p) => h('div', { class: 'chip-part', style: { borderColor: 조각색[p.색], color: 조각색[p.색] } },
      h('div', { class: 'chip-text' }, p.글), h('div', { class: 'chip-name' }, p.이름)))),
    h('ul', { class: 'decode-list' }, 풀이.조각들.map((p) => h('li', {},
      h('b', { style: { color: 조각색[p.색] } }, `${p.글} — ${p.이름}`), ': ', p.설명))),
    풀이.알림.length ? h('div', { class: 'fb hint' }, 풀이.알림.map((a) => h('div', {}, '⚠ ', a))) : null);
}

// ── 코어와 스레드 ─────────────────────────────────────────────
function 코어화면(자리) {
  const 값 = { P: 6, E: 8, LPE: 2, 하이퍼: true, 작은코어2: false };
  const 칩 = h('div', { class: 'die' });
  const 셈 = h('div', { class: 'core-sum' });
  const 조절 = h('div', { class: 'core-ctrl' });

  const 그림 = () => {
    const { 코어, 스레드 } = 코어스레드(값);
    const 블록 = (종류, n, 실) => Array.from({ length: n }, () => h('div', { class: `core ${종류}` },
      h('span', {}, 종류 === 'p' ? 'P' : 종류 === 'e' ? 'E' : 'LP'),
      h('div', { class: 'threads' }, Array.from({ length: 실 }, () => h('i', {})))));
    칩.replaceChildren(
      h('div', { class: 'die-row' }, 블록('p', 값.P, 값.하이퍼 ? 2 : 1), 블록('e', 값.E, 값.작은코어2 ? 2 : 1), 블록('lp', 값.LPE, 값.작은코어2 ? 2 : 1)),
      h('div', { class: 'l3' }, 'L3 캐시 — 모든 코어가 함께 쓰는 임시 저장 공간'));
    셈.replaceChildren(
      h('div', {}, '코어 = ', `${값.P} + ${값.E} + ${값.LPE} = `, h('b', {}, `${코어}개`)),
      h('div', {}, '스레드 = ', `${값.P} × ${값.하이퍼 ? 2 : 1} + (${값.E} + ${값.LPE}) × ${값.작은코어2 ? 2 : 1} = `, h('b', {}, `${스레드}개`)));
  };

  const 슬라이더 = (열쇠, 이름, 최대) => {
    const 수 = h('b', {}, String(값[열쇠]));
    return h('label', { class: 'ctrl' }, h('span', { class: 'ctrl-label' }, 이름),
      h('input', { type: 'range', min: 0, max: 최대, value: 값[열쇠], class: 'slider', 'aria-label': 이름,
        onInput: (e) => { 값[열쇠] = Number(e.target.value); 수.textContent = e.target.value; 그림(); } }), 수);
  };
  const 스위치 = (열쇠, 이름) => h('label', { class: 'switch' },
    h('input', { type: 'checkbox', checked: 값[열쇠], onChange: (e) => { 값[열쇠] = e.target.checked; 그림(); } }), ' ', 이름);

  const 조절그림 = () => 조절.replaceChildren(
    슬라이더('P', '성능 코어(P)', 12), 슬라이더('E', '효율 코어(E)', 16), 슬라이더('LPE', '저전력 코어(LP-E)', 4),
    스위치('하이퍼', 'P 코어 하이퍼스레딩(2스레드)'), 스위치('작은코어2', '작은 코어도 2스레드(AMD Zen 5c)'));
  조절그림();
  그림();

  자리.append(
    h('h2', {}, '코어와 스레드'),
    h('div', { class: 'two' },
      상자('info', '🧠 코어(core)', h('p', {}, 'CPU 안에서 실제로 계산하는 두뇌 하나. 코어가 여러 개면 여러 일을 동시에 할 수 있다. 예전에는 「코어 4개 = 쿼드코어」처럼 불렀다.')),
      상자('info', '🧵 스레드(thread)', h('p', {}, '운영체제(윈도우)가 CPU 에 일을 맡기는 기본 단위. 하이퍼스레딩을 쓰면 코어 하나가 일을 두 갈래(2스레드)로 받는다.'))),
    상자('now', '🆕 요즘 CPU — 큰 코어와 작은 코어를 섞는다',
      h('p', { html: md('인텔 12세대부터는 힘센 **성능 코어(P)** 와 전기를 적게 먹는 **효율 코어(E)** 를 섞어 넣습니다. 무거운 일은 P 코어가, 가벼운 일은 E 코어가 맡아 배터리를 아낍니다.') }),
      h('p', { html: md('그래서 「i5 는 4코어, i7 은 8코어」 같은 예전 공식은 이제 맞지 않습니다. **코어 수 = 스레드 수 ÷ 2** 도 더 이상 성립하지 않습니다.') })),
    h('div', { class: 'card' },
      h('h3', {}, '🔧 코어·스레드 조립기'),
      조절, 칩, 셈),
    h('div', { class: 'card' },
      h('h3', {}, '대표 노트북 CPU 비교'),
      h('p', { class: 'muted' }, '줄을 누르면 위 조립기에 그 CPU 의 구성이 들어갑니다.'),
      h('table', { class: 'tbl click' },
        h('thead', {}, h('tr', {}, h('th', {}, 'CPU'), h('th', {}, 'P'), h('th', {}, 'E'), h('th', {}, 'LP-E'), h('th', {}, '코어'), h('th', {}, '스레드'), h('th', {}, '쓰임'))),
        h('tbody', {}, 대표CPU.map((c) => h('tr', {
          tabindex: 0,
          onClick: () => { Object.assign(값, { P: c.P, E: c.E, LPE: c.LPE, 하이퍼: c.하이퍼, 작은코어2: !!c.작은코어2 }); 조절그림(); 그림(); 칩.scrollIntoView({ behavior: 'smooth', block: 'center' }); },
        }, h('td', {}, h('b', {}, c.이름)), h('td', {}, c.P), h('td', {}, c.E), h('td', {}, c.LPE), h('td', {}, c.코어), h('td', {}, c.스레드), h('td', {}, c.쓰임))))),
      h('p', { class: 'muted' }, '같은 「7」 등급이라도 Core Ultra 7 258V(8스레드)와 155H(22스레드)는 구성이 크게 다릅니다. 258V 는 배터리를, 155H 는 성능을 앞세운 칩입니다.')),
    접이('🔬 더 깊이 — 캐시(cache)',
      h('p', {}, '캐시는 CPU 안에 있는 아주 빠르고 작은 임시 저장 공간입니다. 자주 쓰는 자료를 가까이 두어 램까지 가지 않게 해 줍니다.'),
      h('ul', {},
        h('li', {}, 'L1·L2 캐시 — 코어마다 따로 가진다. 가장 빠르지만 작다.'),
        h('li', {}, 'L3 캐시 — 모든 코어가 함께 쓴다(Shared by all cores). 조금 느리지만 크다.'))),
    문항목록('cpu-thread'),
  );
}

// ── 접미사 ───────────────────────────────────────────────────
function 접미사화면(자리) {
  const 표 = (목록, 제목) => h('div', { class: 'card' },
    h('h3', {}, 제목),
    h('table', { class: 'tbl' },
      h('thead', {}, h('tr', {}, h('th', {}, '글자'), h('th', {}, '뜻'), h('th', {}, '설명'))),
      h('tbody', {}, 목록.map((k) => h('tr', {}, h('td', { class: 'suffix-cell' }, k), h('td', {}, h('b', {}, 접미사사전[k].뜻)), h('td', {}, 접미사사전[k].설명))))));
  자리.append(
    h('h2', {}, '접미사 — 이름 맨 끝의 알파벳'),
    h('p', { class: 'lead' }, 'CPU 이름 맨 끝의 알파벳(접미사)은 그 칩이 전기를 얼마나 쓰고 어디에 들어가는지 알려 줍니다. 같은 i7 이라도 U 와 HX 는 전혀 다른 노트북에 들어갑니다.'),
    h('div', { class: 'watt' },
      ...[['U', 15], ['P', 28], ['HS', 35], ['H', 45], ['HX', 55]].map(([k, w]) => h('div', { class: 'watt-bar', style: { height: `${w * 2.2}px` } }, h('b', {}, k), h('span', {}, `${w}W${k === 'HX' ? '+' : ''}`)))),
    h('p', { class: 'muted center' }, '전력(W)이 클수록 성능이 높지만 열·소음이 늘고 배터리가 빨리 닳습니다.'),
    표(요즘접미사, '지금 노트북에서 보는 접미사'),
    접이('📜 옛 노트북에서 보던 접미사 (학습지에 나온 것)', 표(옛접미사, '옛 접미사 (4~11세대 무렵)')),
    접이('🖥️ 데스크톱에만 있는 접미사', 표(데스크톱접미사, '데스크톱 접미사')),
    문항목록('cpu-suffix'),
  );
}

// ── 클럭 · 터보 · NPU ──────────────────────────────────────────
function 클럭화면(자리) {
  자리.append(
    h('h2', {}, '클럭 — CPU 가 일하는 박자'),
    h('p', { class: 'lead', html: md('클럭(Hz)은 CPU 가 1초에 몇 번 박자를 맞춰 일하는지를 말합니다. **3.0GHz** 는 1초에 30억 번입니다. 성능을 나타내는 지표 가운데 하나이지만, 이것만으로 성능을 판단할 수는 없습니다.') }),
    h('div', { class: 'two' },
      상자('info', '⚡ 기본 클럭과 부스트 클럭',
        h('p', {}, '사양표에는 보통 두 값이 적힙니다. 평소에 달리는 기본 클럭과, 힘이 필요할 때 잠깐 끌어올리는 최대(부스트·터보) 클럭입니다.'),
        h('p', {}, '요즘 노트북 CPU 의 최대 클럭은 대략 4~5GHz 대입니다.')),
      상자('info', '🤖 NPU — AI 전용 장치',
        h('p', {}, '요즘 CPU 에는 AI 계산만 전문으로 하는 NPU 가 들어갑니다. 성능은 TOPS(1초에 몇 조 번 계산)로 적습니다.'),
        h('p', {}, '윈도우의 「Copilot+ PC」는 NPU 40 TOPS 이상, 램 16GB 이상을 요구합니다.'))),
    상자('tip', '🔍 성능을 제대로 비교하려면',
      h('p', {}, '클럭·코어 수·세대를 따로따로 보지 말고, 여러 프로그램을 실제로 돌려 점수를 매긴 벤치마크(성능 시험) 결과를 비교하세요. 「PassMark CPU 벤치마크」 같은 사이트에서 CPU 이름으로 점수를 찾아볼 수 있습니다.'),
      h('p', {}, '같은 CPU 라도 노트북마다 냉각 성능과 전력 설정이 달라 실제 성능이 다를 수 있습니다. 제품 리뷰도 함께 보세요.')),
    문항목록('cpu-clock'),
  );
}
