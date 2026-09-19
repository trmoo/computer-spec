/*! 나에게 쏙 맞는 노트북 고르기 — © 2026 티쳐무 · 모든 권리 보유
 *  문항 부품 — 모든 확인 문제가 이 하나를 쓴다.
 *
 *  학습 피드백의 흐름
 *    ① 보기를 누르면(또는 수를 쓰고 [확인]) 바로 맞았는지 알려 준다.
 *    ② 틀리면 힌트가 열리고 다시 고를 수 있다. 몇 번 만에 맞혔는지 기록한다.
 *    ③ 두 번 틀리면 [정답 보기] 가 생긴다. 보고 넘어간 문항은 활동지에 「정답을 보고 넘어감」으로 남는다.
 *    ④ 맞히거나 정답을 보면 해설이 열린다.
 */
import { h, md, 알림 } from './ui.js';
import { 답, 답적기, 활동지우기 } from './store.js';
import { 정답인가, 정답글, 활동찾기, 활동점수 } from '../data/activities.js';
import { 지금기록 } from './store.js';

// 활동 하나의 문항들을 그린다.
//   모양: '문제'(한 줄에 하나) | '카드'(여러 칸으로 촘촘히)
//   그림: (문항) => 요소  — 문항 위에 그림을 붙이고 싶을 때
export function 문항목록(활동key, { 모양 = '문제', 그림 = null, 머리 = true } = {}) {
  const 활동 = 활동찾기(활동key);
  const 점수줄 = h('div', { class: 'quiz-score' });
  const 목록 = h('div', { class: 모양 === '카드' ? 'q-grid' : 'q-list' });

  const 점수새로 = () => {
    const 점 = 활동점수(지금기록(), 활동);
    점수줄.replaceChildren(
      h('span', {}, `✏️ ${활동.제목}`),
      h('span', { class: 'quiz-score-num' }, `맞힌 문항 ${점.맞음} / ${점.전체}`),
      h('button', {
        class: 'btn small ghost',
        onClick: async () => {
          if (await 알림('처음부터 다시 풀기', '이 활동의 답을 모두 지우고 처음부터 다시 풉니다.', { 확인: '다시 풀기', 취소: '그만두기' })) {
            활동지우기(활동key);
            그리기();
          }
        },
      }, '↺ 다시 풀기'),
    );
  };

  const 그리기 = () => {
    목록.replaceChildren(...활동.문항.map((문항, i) => 문항카드(활동key, 문항, i, { 모양, 그림, 바뀜: 점수새로 })));
    점수새로();
  };
  그리기();
  return h('div', { class: 'quiz' }, 머리 && 점수줄, 목록);
}

function 문항카드(활동key, 문항, 순번, { 모양, 그림, 바뀜 }) {
  const 카드 = h('div', { class: 'q-card' });
  let 힌트보임 = false;

  const 그리기 = () => {
    const r = 답(활동key, 문항.id);
    const 끝 = !!(r && (r.ok || r.shown));
    카드.className = 'q-card' + (모양 === '카드' ? ' compact' : '') + (r?.ok ? ' ok' : r?.shown ? ' shown' : r ? ' wrong' : '');

    const 머리 = h('div', { class: 'q-head' },
      h('span', { class: 'q-no' }, r?.ok ? '✓' : String(순번 + 1)),
      h('div', { class: 'q-text', html: md(문항.q) }));

    let 답칸;
    if (문항.종류 === 'num') {
      const 입력 = h('input', {
        type: 'text', inputmode: 'decimal', class: 'num-input', value: r?.a ?? '',
        disabled: 끝, 'aria-label': '답 쓰기',
        onKeydown: (e) => { if (e.key === 'Enter') 제출(입력.value); },
      });
      답칸 = h('div', { class: 'num-row' }, 입력, 문항.단위 && h('span', { class: 'unit' }, 문항.단위),
        !끝 && h('button', { class: 'btn primary', onClick: () => 제출(입력.value) }, '확인'));
    } else {
      답칸 = h('div', { class: 'choices' + (모양 === '카드' ? ' tight' : '') },
        문항.보기.map((보, i) => {
          let 표 = '';
          if (끝 && i === 문항.답) 표 = ' right';
          else if (r && !r.ok && Number(r.a) === i) 표 = ' picked-wrong';
          return h('button', { class: 'choice' + 표, disabled: 끝, onClick: () => 제출(i) }, 보);
        }));
    }

    const 되먹임 = [];
    if (r && !끝) {
      되먹임.push(h('div', { class: 'fb bad' }, `❌ 아쉬워요. 다시 생각해 보세요. (${r.n}번 시도)`));
      if (문항.힌트) 되먹임.push(h('div', { class: 'fb hint' }, `💡 힌트: ${문항.힌트}`));
      if (r.n >= 2) {
        되먹임.push(h('button', {
          class: 'btn small ghost', onClick: () => {
            답적기(활동key, 문항.id, { ...r, shown: true });
            그리기(); 바뀜();
          },
        }, '📖 정답 보기'));
      }
    } else if (!r && 문항.힌트) {
      되먹임.push(힌트보임
        ? h('div', { class: 'fb hint' }, `💡 힌트: ${문항.힌트}`)
        : h('button', { class: 'btn small ghost', onClick: () => { 힌트보임 = true; 그리기(); } }, '💡 힌트'));
    }
    if (r?.ok) {
      되먹임.push(h('div', { class: 'fb good' }, r.n > 1 ? `✅ 맞았어요! (${r.n}번 만에)` : '✅ 맞았어요!'));
    } else if (r?.shown) {
      되먹임.push(h('div', { class: 'fb shown' }, `📖 정답: ${정답글(문항)}`));
    }
    if (끝 && 문항.해설) 되먹임.push(h('div', { class: 'fb explain', html: md(문항.해설) }));

    카드.replaceChildren(머리, 그림 ? 그림(문항) : null, 답칸, h('div', { class: 'fb-area' }, 되먹임));
  };

  const 제출 = (값) => {
    const 앞 = 답(활동key, 문항.id);
    if (앞 && (앞.ok || 앞.shown)) return;
    if (문항.종류 === 'num' && String(값).trim() === '') return;
    const ok = 정답인가(문항, 값);
    답적기(활동key, 문항.id, { a: 값, ok, n: (앞?.n || 0) + 1, shown: false });
    그리기();
    바뀜();
  };

  그리기();
  return 카드;
}
