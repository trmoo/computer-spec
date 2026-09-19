/*! 나에게 쏙 맞는 노트북 고르기 — © 2026 티쳐무 · 모든 권리 보유
 *  ⑦ 내 활동지 — 진행 상황 · 배움 정리 · 활동지 내려받기 · 이어하기 파일.
 *
 *  ⚠ 개인정보 원칙 — 학번·이름은 이 파일의 변수에만 잠깐 담는다.
 *    store(localStorage)에도, 이어하기(.json) 파일에도 넣지 않는다.
 *    새로고침하면 사라지는 것이 맞다(공용 컴퓨터에서 다음 학생에게 보이지 않게).
 */
import { h, md, 상자, 알림, 토스트, 내려받기 } from '../lib/ui.js';
import { 지금기록, 자료, 자료적기, 내보내기, 들여오기, 모두지우기 } from '../lib/store.js';
import { 활동들, 탭들, 완료인가, 활동점수, 진행률, 전체점수, 최소글자, 글자수 } from '../data/activities.js';
import { 활동지HTML, 파일이름 } from '../lib/report.js';

export const 하위들 = [{ id: 'main', label: '내 활동지' }];

// 화면을 옮겨도 남되, 새로고침하면 사라진다.
const 임시 = { 학번: '', 이름: '' };

export function 그리기(자리, 하위, 이동) {
  const 기록 = 지금기록();
  const 진 = 진행률(기록);
  const 점 = 전체점수(기록);

  // ── 진행 상황 ──
  const 목록 = h('div', { class: 'status-list' }, 탭들.filter((t) => t.id !== 'report').map((탭) => h('div', { class: 'status-group' },
    h('div', { class: 'status-tab' }, 탭.이름),
    활동들.filter((a) => a.탭 === 탭.id).map((a) => {
      const 끝 = 완료인가(기록, a);
      const 점수 = 활동점수(기록, a);
      return h('div', { class: 'status-row' + (끝 ? ' done' : '') },
        h('span', { class: 'status-mark' }, 끝 ? '✅' : '⬜'),
        h('span', { class: 'status-name' }, a.제목),
        h('span', { class: 'muted' }, 점수 ? `${점수.맞음}/${점수.전체}` : 끝 ? '완료' : '미완료'),
        !끝 && h('button', { class: 'btn small ghost', onClick: () => 이동(a.탭, a.화면) }, '하러 가기'));
    }))));

  // ── 배움 정리 ──
  const 정리 = { 배운점: '', 궁금: '', ...(자료('reflect') || {}) };
  const 셈 = h('span', { class: 'count' });
  const 셈글 = () => { const n = 글자수(정리.배운점); 셈.textContent = `${n}자 / ${최소글자.배운점}자 이상`; 셈.className = 'count' + (n >= 최소글자.배운점 ? ' ok' : ''); };
  셈글();
  const 배운 = h('textarea', { rows: 4, value: 정리.배운점, 'aria-label': '새로 알게 된 것',
    placeholder: '예) 타입-C 는 모양의 이름이라 속도가 제품마다 다르다는 것을 알았다. 앞으로 사양표에서 Gbps 숫자를 확인하겠다.',
    onInput: (e) => { 정리.배운점 = e.target.value; 셈글(); 자료적기('reflect', { ...정리 }); } });
  const 궁금 = h('textarea', { rows: 2, value: 정리.궁금, 'aria-label': '더 궁금한 것',
    placeholder: '예) 스마트폰 칩(ARM)이 노트북에서 어떻게 윈도우 프로그램을 돌리는지 궁금하다.',
    onInput: (e) => { 정리.궁금 = e.target.value; 자료적기('reflect', { ...정리 }); } });

  // ── 학번·이름 (저장하지 않음) ──
  const 학번 = h('input', { type: 'text', class: 'id-input', value: 임시.학번, placeholder: '예) 30512', 'aria-label': '학번', inputmode: 'numeric', autocomplete: 'off',
    onInput: (e) => { 임시.학번 = e.target.value; } });
  const 이름 = h('input', { type: 'text', class: 'id-input', value: 임시.이름, placeholder: '예) 홍길동', 'aria-label': '이름', autocomplete: 'off',
    onInput: (e) => { 임시.이름 = e.target.value; } });

  // ── 미리 보기 ──
  const 미리틀 = h('div', { class: 'preview-wrap' });
  let 미리열림 = false;
  const 미리보기 = () => {
    미리열림 = !미리열림;
    미리틀.replaceChildren(미리열림
      ? h('iframe', { class: 'preview', title: '활동지 미리 보기', srcdoc: 활동지HTML(지금기록(), { 학번: 임시.학번, 이름: 임시.이름 }) })
      : '');
  };

  const 활동지받기 = async () => {
    const 남은 = 활동들.filter((a) => !완료인가(지금기록(), a));
    if (!임시.학번.trim() || !임시.이름.trim()) {
      const 계속 = await 알림('학번·이름이 비어 있습니다', '선생님께 제출할 활동지라면 학번과 이름을 쓰는 것이 좋습니다. 그래도 내려받을까요?', { 확인: '그대로 내려받기', 취소: '돌아가서 쓰기' });
      if (!계속) { (임시.학번.trim() ? 이름 : 학번).focus(); return; }
    }
    if (남은.length) {
      const 계속 = await 알림(`아직 끝내지 않은 활동이 ${남은.length}개 있습니다`,
        h('div', {}, h('ul', {}, 남은.map((a) => h('li', {}, a.제목))), h('p', {}, '지금 상태 그대로 내려받을까요?')),
        { 확인: '그대로 내려받기', 취소: '더 하기' });
      if (!계속) return;
    }
    내려받기(파일이름(임시.학번, 임시.이름), 활동지HTML(지금기록(), { 학번: 임시.학번, 이름: 임시.이름 }), 'text/html');
    토스트('활동지를 내려받았습니다. 「다운로드」 폴더를 확인하세요.');
  };

  const 이어저장 = () => {
    const 날 = new Date();
    const 이름표 = `${날.getMonth() + 1}월${날.getDate()}일`;
    내려받기(`노트북선정_이어하기_${이름표}.json`, 내보내기(), 'application/json');
    토스트('이어하기 파일을 저장했습니다. 다음 시간에 [불러오기] 로 이어서 할 수 있습니다.');
  };

  const 파일고르기 = h('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' },
    onChange: async (e) => {
      const 파일 = e.target.files?.[0];
      e.target.value = '';
      if (!파일) return;
      const 글 = await 파일.text();
      const 계속 = await 알림('이어하기 파일 불러오기', `「${파일.name}」의 기록으로 지금 기록을 바꿉니다. 지금 이 컴퓨터에 있는 기록은 사라집니다.`, { 확인: '불러오기', 취소: '그만두기' });
      if (!계속) return;
      if (들여오기(글)) { 토스트('기록을 불러왔습니다.'); 이동('report'); }
      else await 알림('불러오지 못했습니다', '이 앱에서 저장한 이어하기 파일(.json)이 아니거나 파일이 손상되었습니다.');
    } });

  const 지우기 = async () => {
    const 계속 = await 알림('내 기록 지우기', '이 컴퓨터에 저장된 활동 기록을 모두 지웁니다. 되돌릴 수 없습니다. 공용 컴퓨터라면 수업이 끝날 때 지워 주세요. (먼저 활동지나 이어하기 파일을 내려받았는지 확인하세요.)', { 확인: '모두 지우기', 취소: '그만두기' });
    if (!계속) return;
    모두지우기();
    임시.학번 = '';
    임시.이름 = '';
    토스트('기록을 모두 지웠습니다.');
    이동('report');
  };

  자리.append(
    h('h2', {}, '내 활동지'),
    h('div', { class: 'sum-cards' },
      h('div', { class: 'sum-card' }, h('div', { class: 'muted' }, '끝낸 활동'), h('div', { class: 'big-num' }, `${진.끝} / ${진.전체}`)),
      h('div', { class: 'sum-card' }, h('div', { class: 'muted' }, '맞힌 확인 문제'), h('div', { class: 'big-num' }, `${점.맞음} / ${점.전체}`))),
    h('div', { class: 'card' }, h('h3', {}, '📋 활동 진행 상황'), 목록),
    h('div', { class: 'card' },
      h('h3', {}, '📝 오늘의 배움 정리'),
      h('div', { class: 'field' }, h('div', { class: 'field-head' }, h('label', { class: 'field-label' }, '오늘 새로 알게 된 것 / 앞으로 노트북을 고를 때 달라질 점'), 셈), 배운),
      h('div', { class: 'field' }, h('label', { class: 'field-label' }, '더 궁금한 것 (선택)'), 궁금)),
    h('div', { class: 'card download' },
      h('h3', {}, '📥 활동지 내려받기'),
      h('p', {}, '활동한 내용 전체(확인 문제 답·기준 순위·고른 노트북과 까닭·배움 정리)를 HTML 파일 하나로 내려받습니다. 더블클릭하면 브라우저에서 열리고, 인쇄하거나 PDF 로 저장할 수 있습니다.'),
      h('div', { class: 'id-row' },
        h('label', {}, '학번 ', 학번), h('label', {}, '이름 ', 이름)),
      h('p', { class: 'muted', html: md('🔒 학번·이름은 **내려받는 파일 안에만** 들어갑니다. 이 앱은 학번·이름을 브라우저에도, 서버에도 저장하지 않습니다. 새로고침하면 칸이 비워집니다.') }),
      h('div', { class: 'row wrap' },
        h('button', { class: 'btn primary big', onClick: 활동지받기 }, '📥 활동지 내려받기 (.html)'),
        h('button', { class: 'btn big', onClick: 미리보기 }, '👀 미리 보기')),
      미리틀),
    h('div', { class: 'card' },
      h('h3', {}, '💾 다음 시간에 이어서 하기'),
      h('p', {}, '활동 기록은 이 브라우저에 자동으로 저장됩니다. 다른 컴퓨터에서 이어서 하려면 이어하기 파일을 저장해 두었다가 불러오세요. (이어하기 파일에는 학번·이름이 들어가지 않습니다.)'),
      h('div', { class: 'row wrap' },
        h('button', { class: 'btn', onClick: 이어저장 }, '💾 이어하기 파일 저장 (.json)'),
        h('button', { class: 'btn', onClick: () => 파일고르기.click() }, '📂 이어하기 파일 불러오기'),
        파일고르기)),
    상자('warn', '🧹 공용 컴퓨터를 쓴다면',
      h('p', {}, '수업이 끝나면 다음 사람이 내 기록을 보지 않도록 기록을 지워 주세요.'),
      h('button', { class: 'btn danger', onClick: 지우기 }, '🗑 내 기록 지우기')),
  );
}
