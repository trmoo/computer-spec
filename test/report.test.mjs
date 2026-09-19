/*! 나에게 쏙 맞는 노트북 고르기 — © 2026 티쳐무 · 모든 권리 보유
 *  기록·활동지 시험 — 개인정보가 새지 않는가, 학생 글이 안전하게 찍히는가, 이어하기가 되는가.
 */
import { 묶음, 확인, 참 } from './harness.mjs';
import * as 기록소 from '../src/lib/store.js';
import { 활동지HTML, 파일이름 } from '../src/lib/report.js';
import { 활동들, 완료인가, 진행률, 전체점수, 활동찾기 } from '../src/data/activities.js';
import { 미션점검, 든기준찾기, 조건점검 } from '../src/engine/mission.js';
import { 노트북들 } from '../src/data/laptops.js';
import { 기준들 } from '../src/data/criteria.js';
import { 받침있나, 은는, 을를 } from '../src/lib/josa.js';

// 가짜 저장소 (node 에는 localStorage 가 없다)
function 가짜저장소() {
  const 칸 = new Map();
  return { getItem: (k) => (칸.has(k) ? 칸.get(k) : null), setItem: (k, v) => 칸.set(k, String(v)), removeItem: (k) => 칸.delete(k), 칸 };
}

묶음('기록 저장과 이어하기');
{
  const 저장소 = 가짜저장소();
  기록소.저장소바꾸기(저장소);
  기록소.불러오기();
  기록소.답적기('crit-match', 'm1', { a: 0, ok: true, n: 1, shown: false });
  기록소.자료적기('reflect', { 배운점: '타입-C 는 모양의 이름이라는 것을 배웠다.', 궁금: '' });
  참('저장소에 적혔다', 저장소.getItem('computer-spec-v1').includes('crit-match'));
  기록소.불러오기();
  확인('다시 불러와도 남아 있다', 기록소.답('crit-match', 'm1').ok, true);

  const 파일 = 기록소.내보내기();
  참('이어하기 파일에 학번·이름 칸이 없다', !/학번|이름"\s*:/.test(파일.replace(/"이름":"[^"]*"/g, '')) && !파일.includes('"학번"'));
  기록소.모두지우기();
  확인('지우면 비었다', 기록소.답('crit-match', 'm1'), null);
  확인('저장소에서도 지워졌다', 저장소.getItem('computer-spec-v1'), null);
  참('이어하기 파일을 들여온다', 기록소.들여오기(파일));
  확인('들여온 뒤 답이 돌아왔다', 기록소.답('crit-match', 'm1').ok, true);

  참('다른 앱의 파일은 거절한다', !기록소.들여오기(JSON.stringify({ app: 'class-seats', acts: {}, data: {} })));
  참('깨진 파일은 거절한다', !기록소.들여오기('{이건 json 이 아니다'));
  참('모양이 틀린 파일은 거절한다', !기록소.들여오기(JSON.stringify({ app: 'computer-spec', acts: [], data: {} })));
  const 손댄 = JSON.parse(파일);
  손댄.학번 = '30512';
  손댄.이름 = '홍길동';
  기록소.들여오기(JSON.stringify(손댄));
  const 다시 = 기록소.내보내기();
  참('파일에 누가 학번을 끼워 넣어도 옮겨 담지 않는다', !다시.includes('30512') && !다시.includes('홍길동'));
  기록소.모두지우기();
}

묶음('localStorage 가 막혀도 죽지 않는다');
{
  const 막힘 = { getItem() { throw new Error('막힘'); }, setItem() { throw new Error('막힘'); }, removeItem() { throw new Error('막힘'); } };
  기록소.저장소바꾸기(막힘);
  기록소.불러오기();
  기록소.답적기('crit-match', 'm2', { a: 1, ok: true, n: 1 });
  확인('메모리에는 남는다', 기록소.답('crit-match', 'm2').ok, true);
  기록소.모두지우기();
  기록소.저장소바꾸기(가짜저장소());
  기록소.불러오기();
}

묶음('빈 기록으로 활동지 만들기');
{
  const 빈 = 기록소.빈기록();
  const html = 활동지HTML(빈, { 날짜: new Date(2026, 8, 19, 14, 5) });
  참('HTML 문서다', html.startsWith('<!doctype html>'));
  참('날짜가 찍힌다', html.includes('2026년 9월 19일 14:05'));
  참('저작권 표시', html.includes('© 2026 티쳐무'));
  참('활동이 모두 목차에 있다', 활동들.every((a) => html.includes(a.제목)));
  참('바깥 자원을 부르지 않는다', !/(src|href)\s*=\s*["']?https?:/i.test(html));
  확인('빈 기록은 0점', 전체점수(빈).맞음, 0);
  확인('빈 기록은 끝낸 활동 0', 진행률(빈).끝, 0);
}

묶음('학생 글은 안전하게 찍힌다');
{
  const 기록 = 기록소.빈기록();
  기록.data.reflect = { 배운점: '<img src=x onerror=alert(1)> 줄바꿈\n둘째 줄', 궁금: '' };
  const html = 활동지HTML(기록, { 학번: '<script>alert(1)</script>', 이름: '"홍&길동"' });
  참('학번의 태그가 글자로 바뀐다', html.includes('&lt;script&gt;') && !html.includes('<script>alert'));
  참('서술의 태그가 글자로 바뀐다', html.includes('&lt;img') && !html.includes('<img'));
  참('이름의 따옴표·& 도 바뀐다', html.includes('&quot;홍&amp;길동&quot;'));
  참('줄바꿈은 살린다', html.includes('줄바꿈<br>둘째 줄'));
}

묶음('파일 이름');
확인('학번·이름이 들어간다', 파일이름('30512', '홍길동'), '노트북선정_활동지_30512_홍길동.html');
확인('비어 있으면 기본 이름', 파일이름('', ''), '노트북선정_활동지.html');
확인('쓸 수 없는 글자는 걷어 낸다', 파일이름('3/05:12', '홍 길*동'), '노트북선정_활동지_30512_홍길동.html');

묶음('모두 끝낸 기록');
{
  const 기록 = 기록소.빈기록();
  for (const a of 활동들.filter((x) => x.종류 === 'quiz')) {
    기록.acts[a.key] = Object.fromEntries(a.문항.map((q) => [q.id, { a: q.종류 === 'num' ? String(q.답) : q.답, ok: true, n: 1, shown: false }]));
  }
  // 하나는 정답을 보고 넘어간 것으로
  기록.acts['cpu-clock'].c1 = { a: 0, ok: false, n: 2, shown: true };
  기록.data.rank = { 순서: 기준들.map((c) => c.id).reverse(), 이유1: '매일 들고 다니기 때문이다.', 이유9: '', 확정: true };
  기록.data.cpuMine = { 모델: '13th Gen Intel(R) Core(TM) i5-1335U   1.30 GHz', 생각: '문서와 코딩은 충분하다.' };
  기록.data.mission = { 목적: ['doc', 'carry'], 예산: 1800000, 최대무게: 1.5, 선택: 'A', 이유: '무게가 1.0kg 으로 가장 가볍고 배터리가 20시간이라 충전 없이 하루를 버틴다.', 포기: '가격이 비싸 예산을 거의 다 쓴다.', 실제: { 이름: '어떤 노트북' } };
  기록.data.reflect = { 배운점: '타입-C 는 모양의 이름이고 속도는 제품마다 다르다는 것을 배웠다.', 궁금: '' };
  const 진 = 진행률(기록);
  확인('모든 활동을 끝냈다', 진.끝, 진.전체);
  const 점 = 전체점수(기록);
  확인('정답을 본 한 문항만 빠진다', 점.맞음, 점.전체 - 1);
  const html = 활동지HTML(기록, { 학번: '30512', 이름: '홍길동' });
  참('고른 노트북 이름', html.includes('에어라이트 14'));
  참('정답을 보고 넘어간 문항 표시', html.includes('정답을 보고 넘어감'));
  참('내 CPU 해부 결과', html.includes('Core i5 · 13세대'));
  참('실제 제품 조사', html.includes('어떤 노트북'));
  참('1순위 기준(뒤집은 순서의 첫째 = A/S)', html.includes('<b>1위</b> A/S'));
}

묶음('완료 조건');
{
  const 기록 = 기록소.빈기록();
  const 순위 = 활동찾기('crit-rank');
  기록.data.rank = { 순서: 기준들.map((c) => c.id), 이유1: '짧다', 확정: true };
  참('까닭이 짧으면 순위는 미완료', !완료인가(기록, 순위));
  기록.data.rank.이유1 = '매일 버스로 통학하기 때문이다.';
  참('까닭을 쓰면 완료', 완료인가(기록, 순위));
  기록.data.rank.확정 = false;
  참('확정하지 않으면 미완료', !완료인가(기록, 순위));
}

묶음('미션 점검 — 채점이 아니라 되먹임');
{
  const 순서 = 기준들.map((c) => c.id);
  확인('안 고르면 고르라고 한다', 미션점검({}, 순서)[0].종류, 'warn');
  const 비싼 = 미션점검({ 선택: 'D', 예산: 1000000, 이유: '성능이 가장 좋아서 최신 3D 게임을 하기에 좋다. RTX 5070 그래픽카드가 있고 화면도 240Hz 로 부드럽다.', 포기: '무게와 배터리를 포기했다.' }, 순서);
  참('예산 초과를 알린다', 비싼.some((x) => x.종류 === 'warn' && x.글.includes('예산 초과')));
  참('기준을 든 까닭을 알아본다', 비싼.some((x) => x.종류 === 'good' && x.글.includes('성능')));
  const 짧은 = 미션점검({ 선택: 'B', 이유: '그냥', 포기: '' }, 순서);
  참('까닭이 짧다고 알린다', 짧은.some((x) => x.글.includes('이상 써 주세요')));
  참('포기한 것을 쓰라고 한다', 짧은.some((x) => x.글.includes('포기한 것')));
  확인('든 기준 찾기', 든기준찾기('가벼워서 들고 다니기 좋고 배터리가 오래간다'), ['무게', '배터리']);
  확인('조건을 모두 만족하면 걸림 없음', 조건점검(노트북들.find((n) => n.id === 'A'), { 예산: 1800000, 최대무게: 1.5, 목적: ['carry'] }), []);
}

묶음('조사');
참('받침 있음: 무게? 아니오', !받침있나('무게'));
참('받침 있음: 가격', 받침있나('가격'));
참('숫자 1(일)', 받침있나('1'));
참('숫자 2(이)', !받침있나('2'));
참('영문 M(엠)', 받침있나('4100M'));
참('영문 U(유)', !받침있나('1335U'));
확인('은는', 은는('스튜던트 15'), '스튜던트 15는');
확인('을를 — A/S', 을를('A/S'), 'A/S를');
확인('을를 — 연결(포트) 는 괄호 안 끝 글자로', 을를('연결(포트)'), '연결(포트)를');
