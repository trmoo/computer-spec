/*! 나에게 쏙 맞는 노트북 고르기 — © 2026 티쳐무 · 모든 권리 보유
 *  ③ 화면 크기 · 해상도 · 포트 · 전송 속도.
 */
import { h, s, md, 상자, 접이, 화면애니, 창크기바뀔때 } from '../lib/ui.js';
import { 문항목록 } from '../lib/quiz.js';
import { 화면크기들, 크기무리, 해상도들, 포트들, 전송방식들, 파일보기 } from '../data/display.js';
import { 화면가로세로, 화면넓이, ppi, 전송초, 시간말하기, 반올림 } from '../engine/calc.js';

export const 하위들 = [
  { id: 'size', label: '화면 크기' },
  { id: 'res', label: '해상도·주사율' },
  { id: 'port', label: '포트(단자)' },
  { id: 'speed', label: '전송 속도' },
];

export function 그리기(자리, 하위) {
  if (하위 === 'res') return 해상도화면(자리);
  if (하위 === 'port') return 포트화면(자리);
  if (하위 === 'speed') return 속도화면(자리);
  return 크기화면(자리);
}

const 색들 = ['#e0552b', '#3b4fd8', '#1a8a53', '#a23bd8', '#c98a00', '#0f8aa0'];

// ── 화면 크기 ────────────────────────────────────────────────
function 크기화면(자리) {
  const 켬 = new Set(['s14', 's156']);
  const 그림자리 = h('div', { class: 'size-svg' });
  const 범례 = h('div', { class: 'size-legend' });

  const 그림 = () => {
    // 단위는 cm. 가장 큰 18인치 16:10(가로 약 39.5cm)이 들어가게 잡는다.
    const W = 43;
    const H = 27;
    const 속 = [];
    // 1cm 눈금
    for (let x = 0; x <= 40; x += 5) 속.push(s('line', { x1: x + 1, y1: 0.5, x2: x + 1, y2: H - 0.5, class: 'grid' }), s('text', { x: x + 1.2, y: 1.6, class: 'tick' }, `${x}`));
    화면크기들.forEach((크, i) => {
      if (!켬.has(크.id)) return;
      const { 가로, 세로 } = 화면가로세로(크.인치, ...크.비율);
      const x0 = 1;
      const y0 = H - 1 - 세로;
      속.push(
        s('rect', { x: x0, y: y0, width: 가로, height: 세로, fill: 색들[i], 'fill-opacity': 0.07, stroke: 색들[i], 'stroke-width': 0.18 }),
        s('line', { x1: x0, y1: y0 + 세로, x2: x0 + 가로, y2: y0, stroke: 색들[i], 'stroke-width': 0.1, 'stroke-dasharray': '0.5 0.3' }),
        s('text', { x: x0 + 가로 - 0.3, y: y0 + 1.3, 'text-anchor': 'end', fill: 색들[i], class: 'size-label' }, `${크.인치}″`),
      );
    });
    그림자리.replaceChildren(s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '화면 크기 비교 그림' }, 속));
    범례.replaceChildren(...화면크기들.map((크, i) => {
      const { 대각, 가로, 세로 } = 화면가로세로(크.인치, ...크.비율);
      return h('label', { class: 'legend-item' + (켬.has(크.id) ? ' on' : '') },
        h('input', { type: 'checkbox', checked: 켬.has(크.id), onChange: (e) => { e.target.checked ? 켬.add(크.id) : 켬.delete(크.id); 그림(); } }),
        h('span', { class: 'sw', style: { background: 색들[i] } }),
        h('b', {}, `${크.인치}인치 (${크.비율.join(':')})`),
        h('span', { class: 'muted' }, ` 대각선 ${반올림(대각)}cm · 가로 ${반올림(가로)} × 세로 ${반올림(세로)}cm — ${크.설명}`));
    }));
  };
  그림();

  // 인치 계산기
  let 인치 = 14;
  let 비율 = [16, 10];
  const 계산결과 = h('div', { class: 'calc-out' });
  const 인치값 = h('b', { class: 'big-num' });
  const 계산 = () => {
    const { 대각, 가로, 세로 } = 화면가로세로(인치, ...비율);
    인치값.textContent = `${인치}인치`;
    계산결과.replaceChildren(
      h('div', {}, `대각선 = ${인치} × 2.54 = `, h('b', {}, `${반올림(대각, 2)}cm`)),
      h('div', {}, `가로 = 대각선 × ${비율[0]} ÷ √(${비율[0]}² + ${비율[1]}²) = `, h('b', {}, `${반올림(가로)}cm`)),
      h('div', {}, `세로 = 대각선 × ${비율[1]} ÷ √(${비율[0]}² + ${비율[1]}²) = `, h('b', {}, `${반올림(세로)}cm`)),
      h('div', {}, '화면 넓이 = ', h('b', {}, `${Math.round(화면넓이(인치, ...비율))}cm²`)),
    );
  };
  const 비율단추 = h('div', { class: 'seg' });
  const 비율그림 = () => 비율단추.replaceChildren(...[[16, 9], [16, 10], [3, 2]].map((b) => h('button', {
    class: 'seg-btn' + (b.join() === 비율.join() ? ' on' : ''), onClick: () => { 비율 = b; 비율그림(); 계산(); },
  }, b.join(':'))));
  비율그림();
  계산();

  자리.append(
    h('h2', {}, '화면 크기 — 「인치」는 대각선 길이'),
    h('p', { class: 'lead', html: md('노트북 화면 크기는 인치(1인치 = 2.54cm)로 말하고, 화면의 **대각선** 길이를 잽니다. 아래 그림은 실제 크기 비율 그대로입니다. 여러 크기를 겹쳐 보세요.') }),
    h('div', { class: 'size-wrap' }, 그림자리, 범례),
    h('div', { class: 'card' },
      h('h3', {}, '📐 인치 계산기'),
      h('div', { class: 'row wrap' },
        h('input', { type: 'range', min: 10, max: 18, step: 0.1, value: 인치, 'aria-label': '인치', class: 'slider',
          onInput: (e) => { 인치 = Number(e.target.value); 계산(); } }),
        인치값, 비율단추),
      계산결과),
    h('div', { class: 'card' },
      h('h3', {}, '크기별 특징'),
      h('table', { class: 'tbl' },
        h('thead', {}, h('tr', {}, h('th', {}, '크기'), h('th', {}, '무게'), h('th', {}, '특징'))),
        h('tbody', {}, 크기무리.map((x) => h('tr', {}, h('td', {}, h('b', {}, x.이름)), h('td', {}, x.무게), h('td', {}, x.설명)))))),
    상자('tip', '💡 알아 두기',
      h('p', {}, '13인치보다 작은 화면은 주로 2in1·태블릿형입니다. 화면이 작으면 글자가 작아져 오래 작업하기 불편합니다.'),
      h('p', {}, '요즘은 가로:세로가 16:10 인 화면이 늘었습니다. 같은 인치라도 세로가 길어 문서·웹 페이지를 한 번에 더 많이 봅니다.')),
    문항목록('screen-size'),
  );
}

// ── 해상도 · 주사율 ─────────────────────────────────────────
const 예시글 = [
  '수행평가 보고서 — 나에게 맞는 노트북',
  '1. 사용 목적: 문서 작성, 온라인 강의, 코딩 공부',
  '2. 가장 중요한 기준: 무게와 배터리',
  '3. 후보 노트북 세 대를 비교한 결과,',
  '   14인치 초경량 노트북이 알맞다고 판단했다.',
  '4. 해상도가 높으면 글자가 작아지지만',
  '   배율을 올리면 같은 크기로 더 선명하게 보인다.',
  '5. 화면이 크면 보기 좋지만 무거워진다.',
  '6. 결론: 기준에 따라 알맞은 노트북은 다르다.',
];

function 해상도화면(자리) {
  let 해 = 해상도들[1];
  let 인치 = 14;
  let 배율 = 100;
  const 캔버스 = h('canvas', { class: 'res-canvas', 'aria-label': '노트북 화면 일부를 확대한 모습' });
  const 정보 = h('div', { class: 'res-info' });
  const 해단추 = h('div', { class: 'seg wrap' });
  const 인치단추 = h('div', { class: 'seg' });
  const 배율단추 = h('div', { class: 'seg' });

  // 노트북 화면의 왼쪽 위 일부(가로 30%)를 떼어 캔버스에 **실제 픽셀 수 그대로** 그린 뒤,
  // CSS 로 크게 늘려 보여 준다(image-rendering: pixelated). 그래서 해상도가 낮으면 글자가 계단처럼 보인다.
  const 그림 = () => {
    const 비 = 0.3;
    const cw = Math.round(해.가로 * 비);
    const ch = Math.round(cw * 0.5);
    캔버스.width = cw;
    캔버스.height = ch;
    // 실제 화면 크기에 비례해 보이게 한다 — 16인치가 가득, 13.3인치는 83%.
    // 그래서 같은 인치에서 해상도만 바꾸면 그림 크기는 그대로이고 점 크기만 달라진다.
    캔버스.style.width = `${(인치 / 16) * 100}%`;
    const ctx = 캔버스.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cw, ch);
    const 글크기 = 12 * (배율 / 100);          // 윈도우 기본 글자 약 12픽셀 × 배율
    const 줄 = 글크기 * 1.6;
    // 창 제목 막대
    ctx.fillStyle = '#e8ecf5';
    ctx.fillRect(0, 0, cw, 줄 * 1.3);
    ctx.fillStyle = '#1b2431';
    ctx.font = `${글크기}px "Malgun Gothic", "맑은 고딕", sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText('📄 보고서.hwp', 글크기 * 0.6, 줄 * 0.65);
    ctx.textBaseline = 'alphabetic';
    let y = 줄 * 1.3 + 줄;
    let i = 0;
    while (y < ch + 줄) {
      ctx.fillText(예시글[i % 예시글.length], 글크기 * 0.6, y);
      y += 줄;
      i++;
    }
    const 보이는줄 = Math.floor((해.세로 / (배율 / 100)) / (12 * 1.6));
    정보.replaceChildren(
      h('div', {}, h('b', {}, `${해.이름} ${해.가로}×${해.세로}`), ` — ${해.설명}`),
      h('div', {}, `${인치}인치에서 PPI(1인치 안의 점 수) = √(${해.가로}² + ${해.세로}²) ÷ ${인치} ≈ `, h('b', {}, `${Math.round(ppi(해.가로, 해.세로, 인치))}`)),
      h('div', {}, `배율 ${배율}% 일 때 실제 작업 공간 ≈ `, h('b', {}, `${Math.round(해.가로 / (배율 / 100))} × ${Math.round(해.세로 / (배율 / 100))}`),
        ` · 화면 전체에 글 약 `, h('b', {}, `${보이는줄}줄`)),
    );
    해단추.replaceChildren(...해상도들.map((x) => h('button', { class: 'seg-btn' + (x.id === 해.id ? ' on' : ''), onClick: () => { 해 = x; 그림(); } }, x.이름)));
    인치단추.replaceChildren(...[13.3, 14, 16].map((x) => h('button', { class: 'seg-btn' + (x === 인치 ? ' on' : ''), onClick: () => { 인치 = x; 그림(); } }, `${x}인치`)));
    배율단추.replaceChildren(...[100, 125, 150, 200, 250].map((x) => h('button', { class: 'seg-btn' + (x === 배율 ? ' on' : ''), onClick: () => { 배율 = x; 그림(); } }, `${x}%`)));
  };
  그림();

  자리.append(
    h('h2', {}, '해상도 — 화면을 이루는 점의 개수'),
    h('p', { class: 'lead', html: md('해상도는 화면을 이루는 점(**픽셀**)이 가로·세로로 몇 개인지를 말합니다. 같은 크기 화면에 점이 많을수록 선명하지만, 배율이 그대로면 글자가 작아집니다. 아래는 노트북 화면 **왼쪽 위 일부를 확대**한 모습입니다.') }),
    h('div', { class: 'card' },
      h('div', { class: 'ctrl' }, h('span', { class: 'ctrl-label' }, '해상도'), 해단추),
      h('div', { class: 'ctrl' }, h('span', { class: 'ctrl-label' }, '화면 크기'), 인치단추),
      h('div', { class: 'ctrl' }, h('span', { class: 'ctrl-label' }, '윈도우 배율'), 배율단추),
      h('div', { class: 'res-frame' }, 캔버스),
      정보),
    상자('tip', '🧪 실험해 보기',
      h('ol', {},
        h('li', {}, 'HD → FHD → 4K 로 바꿔 보세요. 글자가 어떻게 변하나요?'),
        h('li', {}, '4K 에서 배율을 200% 로 올려 보세요. FHD·100% 와 견주면 크기와 선명함이 어떤가요?'),
        h('li', {}, 'HD 를 고르고 배율을 올려 보세요. 글자가 커지지만 선명해지지는 않습니다. 왜 그럴까요?'))),
    상자('info', '📌 알아 두기',
      h('p', {}, '예전에는 HD(1366×768)가 흔했지만, 지금은 화면 크기와 관계없이 FHD(1920×1080)나 16:10 의 WUXGA(1920×1200) 이상이 기본입니다.'),
      h('p', {}, '해상도가 높을수록 화면이 선명하고 작업 공간이 넓지만, 전기를 더 쓰고 값이 오릅니다. 화면 크기에 비해 해상도가 너무 높으면 글자가 작아져 배율을 올려야 합니다.')),
    주사율실험(),
    문항목록('screen-res'),
  );
}

function 주사율실험() {
  const 줄들 = [10, 30, 60].map((hz) => ({ hz, 공: h('div', { class: 'ball' }), 마지막: -1, 위치: 0 }));
  const 판 = h('div', { class: 'hz-lanes' }, 줄들.map((l) => h('div', { class: 'hz-lane' },
    h('span', { class: 'hz-label' }, `${l.hz}Hz`), h('div', { class: 'hz-track' }, l.공))));
  let 너비 = 0;
  const 재기 = () => { 너비 = 판.querySelector('.hz-track')?.clientWidth || 300; };
  창크기바뀔때(재기);
  화면애니((t) => {
    if (!너비) 재기();
    // 2초에 한 번 왕복한다
    const 진행 = (t % 2000) / 2000;
    const 자리 = 진행 < 0.5 ? 진행 * 2 : 2 - 진행 * 2;
    for (const l of 줄들) {
      // 1초에 hz 번만 새 위치로 그린다 — 주사율이 낮으면 뚝뚝 끊긴다
      if (l.마지막 < 0 || t - l.마지막 >= 1000 / l.hz - 1) {
        l.마지막 = t;
        l.공.style.transform = `translateX(${Math.round(자리 * Math.max(0, 너비 - 28))}px)`;
      }
    }
  });
  return h('div', { class: 'card' },
    h('h3', {}, '🎞️ 주사율 — 1초에 화면을 몇 번 새로 그릴까?'),
    h('p', {}, '주사율(Hz)이 높을수록 움직임이 부드럽습니다. 보통 노트북은 60Hz, 게이밍 노트북은 144~240Hz 입니다.'),
    판,
    h('p', { class: 'muted' }, '⚠ 지금 보고 있는 화면(교실 TV 등)이 60Hz 라면 60Hz 보다 부드러운 움직임은 보여 줄 수 없습니다. 그래서 여기서는 60Hz 까지만 견줍니다.'));
}

// ── 포트 ─────────────────────────────────────────────────────
export function 포트그림(id, 크기 = 120) {
  const 틀 = [s('rect', { x: 2, y: 2, width: 116, height: 56, rx: 8, class: 'port-body' })];
  const 모양 = {
    usba: [s('rect', { x: 22, y: 18, width: 76, height: 24, rx: 2, class: 'port-hole' }), s('rect', { x: 28, y: 24, width: 64, height: 8, rx: 1, class: 'port-tongue blue' })],
    usbc: [s('rect', { x: 32, y: 21, width: 56, height: 18, rx: 9, class: 'port-hole' }), s('rect', { x: 42, y: 28, width: 36, height: 4, rx: 2, class: 'port-tongue' })],
    hdmi: [s('path', { d: 'M20 18 H100 V32 L92 42 H28 L20 32 Z', class: 'port-hole' }), s('rect', { x: 30, y: 24, width: 60, height: 6, rx: 1, class: 'port-tongue' })],
    audio: [s('circle', { cx: 60, cy: 30, r: 11, class: 'port-hole' }), s('circle', { cx: 60, cy: 30, r: 4.5, class: 'port-pin' })],
    rj45: [s('path', { d: 'M40 10 H80 V44 H70 V50 H50 V44 H40 Z', class: 'port-hole' }), ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => s('rect', { x: 45 + k * 4, y: 13, width: 2, height: 7, class: 'port-tongue' }))],
    sd: [s('rect', { x: 18, y: 26, width: 84, height: 8, rx: 1.5, class: 'port-hole' })],
  }[id] || [];
  return s('svg', { viewBox: '0 0 120 60', width: 크기, height: 크기 / 2, class: 'port-svg', role: 'img', 'aria-label': '단자 그림' }, 틀, 모양);
}

function 포트화면(자리) {
  자리.append(
    h('h2', {}, '포트(단자) — 무엇을 어디에 꽂을까?'),
    h('p', { class: 'lead' }, '노트북 옆면의 구멍을 포트(단자)라고 합니다. 모양을 보고 이름과 쓰임을 알아 두면, 사양표에서 「내 장치를 꽂을 수 있는지」 확인할 수 있습니다.'),
    h('div', { class: 'port-grid' }, 포트들.map((p) => h('div', { class: 'port-card' },
      포트그림(p.id, 150),
      h('h4', {}, p.이름),
      h('div', { class: 'muted' }, p.모양),
      h('p', { html: md(p.설명) })))),
    상자('warn', '⚠ 가장 헷갈리는 것 — 「타입-C」는 모양의 이름이다',
      h('p', { html: md('USB-C(타입-C)는 단자의 **모양**을 가리키는 이름입니다. 같은 모양의 구멍이라도 제품에 따라') }),
      h('ul', {},
        h('li', {}, '속도가 0.48Gbps(USB 2.0)부터 80Gbps(썬더볼트 5)까지 다르고,'),
        h('li', {}, '충전이 되는 것과 안 되는 것이 있고,'),
        h('li', {}, '모니터로 화면을 보낼 수 있는 것과 없는 것이 있습니다.')),
      h('p', {}, '그래서 사양표에서 「USB-C」라는 글자만 보지 말고 「10Gbps」·「썬더볼트 4」·「충전 지원」·「DisplayPort 출력」 같은 말을 함께 확인해야 합니다. 단자 옆의 ⚡(썬더볼트) 표시나 속도 숫자도 도움이 됩니다.')),
    문항목록('port-name', { 모양: '카드', 그림: (문항) => h('div', { class: 'q-pic' }, 포트그림(문항.그림, 180)) }),
  );
}

// ── 전송 속도 ───────────────────────────────────────────────
function 속도화면(자리) {
  let GB = 4;
  const 막대들 = h('div', { class: 'bars' });
  const 입력 = h('input', { type: 'number', min: 0.01, step: 0.1, value: GB, class: 'num-input', 'aria-label': '파일 크기(GB)',
    onInput: (e) => { const v = Number(e.target.value); if (v > 0) { GB = v; 그림(); } } });
  const 그림 = () => {
    const 최대 = 전송초(GB, 전송방식들[0].속도);
    막대들.replaceChildren(...전송방식들.map((m) => {
      const 초 = 전송초(GB, m.속도);
      return h('div', { class: 'bar-row' },
        h('span', { class: 'bar-name' }, m.이름),
        h('div', { class: 'bar-track' }, h('div', { class: 'bar-fill', style: { width: `${Math.max(0.6, (초 / 최대) * 100)}%` } })),
        h('span', { class: 'bar-val' }, 시간말하기(초)));
    }));
  };
  그림();

  자리.append(
    h('h2', {}, '전송 속도 — 이름보다 숫자를 보자'),
    h('p', { class: 'lead', html: md('USB 는 이름이 여러 번 바뀌어서 이름만으로는 속도를 알기 어렵습니다. 그래서 요즘은 **「USB 10Gbps」처럼 속도를 직접 적도록** 권합니다. Gbps 는 1초에 10억 비트를 보낸다는 뜻입니다.') }),
    h('table', { class: 'tbl' },
      h('thead', {}, h('tr', {}, h('th', {}, '지금 이름'), h('th', {}, '최고 속도'), h('th', {}, '예전 이름'), h('th', {}, '단자 모양'))),
      h('tbody', {}, 전송방식들.map((m) => h('tr', {},
        h('td', {}, h('b', {}, m.이름)), h('td', {}, `${m.속도}Gbps`), h('td', {}, m.옛이름 || '-'), h('td', {}, m.단자))))),
    h('div', { class: 'card' },
      h('h3', {}, '⏱️ 파일 옮기는 시간 계산기'),
      h('div', { class: 'row wrap' },
        파일보기.map((f) => h('button', { class: 'btn small', onClick: () => { GB = f.GB; 입력.value = f.GB; 그림(); } }, `${f.이름} (${f.GB}GB)`)),
        h('span', { class: 'row' }, 입력, h('span', { class: 'unit' }, 'GB'))),
      h('p', { class: 'muted' }, '시간 = 파일 크기(GB) × 8 ÷ 속도(Gbps). 1바이트는 8비트이기 때문입니다.'),
      막대들,
      h('p', { class: 'muted' }, '⚠ 이론상 최고 속도로 셈한 값입니다. 실제로는 USB 메모리·SSD 자체의 속도, 케이블, 파일 개수 때문에 이보다 오래 걸립니다.')),
    접이('🔬 더 깊이 — 선 하나로 충전·화면·자료를 한꺼번에',
      h('p', {}, '타입-C 단자는 USB PD(Power Delivery)로 노트북을 충전하고, DisplayPort 신호로 모니터에 화면을 보내고, 자료도 주고받을 수 있습니다. 그래서 모니터에 선 하나만 꽂으면 충전·화면·키보드·마우스가 한꺼번에 연결되는 「도킹」이 가능합니다.'),
      h('p', {}, '다만 이 기능이 모두 되는지는 노트북 단자마다 다릅니다. 사양표의 「충전 지원」·「DP Alt Mode」·「썬더볼트」 표시를 확인하세요.')),
    문항목록('port-speed'),
  );
}
