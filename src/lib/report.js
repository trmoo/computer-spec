/*! 나에게 쏙 맞는 노트북 고르기 — © 2026 티쳐무 · 모든 권리 보유
 *  「내 활동지」 HTML 파일 만들기.
 *
 *  학생의 기록을 받아 **HTML 글 한 덩어리**를 돌려준다. 이 글을 파일로 내려받으면
 *  더블클릭만으로 열리고, 인쇄하거나 PDF 로 저장할 수 있다.
 *
 *  ⚠ 학생이 적은 글은 모두 이스케이프한다. 이름 칸에 <script> 를 넣어도 글자로만 찍힌다.
 *  ⚠ DOM 을 쓰지 않는다(node 에서 시험한다). 바깥 자원(글꼴·그림·스크립트)도 부르지 않는다.
 */
import { 활동들, 탭들, 활동점수, 전체점수, 진행률, 완료인가, 정답글, 답글, 기본순서 } from '../data/activities.js';
import { 기준이름 } from '../data/criteria.js';
import { 노트북들, 목적들, 목적경고 } from '../data/laptops.js';
import { 해부 } from '../engine/decode.js';
import { 내기준점수, 만원 } from '../engine/calc.js';

export function 이스케이프(글) {
  return String(글 ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// **굵게** 는 활동지에서는 그냥 글자로 (별표만 걷어 낸다)
const 평문 = (글) => 이스케이프(String(글 ?? '').replace(/\*\*/g, ''));
// 여러 줄 서술은 줄바꿈을 살린다
const 서술 = (글) => (String(글 ?? '').trim() ? 이스케이프(글).replace(/\n/g, '<br>') : '<span class="empty">(쓰지 않음)</span>');

// 파일 이름에 쓸 수 없는 글자를 걷어 낸다
export function 파일이름(학번, 이름, 확장자 = 'html') {
  const 조각 = [학번, 이름].map((x) => String(x ?? '').trim().replace(/[\\/:*?"<>|\s]+/g, '')).filter(Boolean);
  return `노트북선정_활동지${조각.length ? '_' + 조각.join('_') : ''}.${확장자}`;
}

function 결과칸(문항, r) {
  if (!r) return '<td class="res none">— 아직 안 풂</td>';
  if (r.ok) return `<td class="res ok">✅ 맞음${r.n > 1 ? ` (${r.n}번째 시도)` : ''}</td>`;
  if (r.shown) return `<td class="res shown">📖 정답을 보고 넘어감<br><small>정답: ${평문(정답글(문항))}</small></td>`;
  return `<td class="res wrong">❌ 다시 풀어야 함 (${r.n}번 시도)</td>`;
}

function 퀴즈표(기록, 활동) {
  const 답들 = 기록.acts[활동.key] || {};
  const 점 = 활동점수(기록, 활동);
  const 줄들 = 활동.문항.map((문항, i) => {
    const r = 답들[문항.id];
    return `<tr><td class="no">${i + 1}</td><td>${평문(문항.q)}</td><td>${평문(답글(문항, r)) || '<span class="empty">-</span>'}</td>${결과칸(문항, r)}</tr>`;
  }).join('');
  return `<h3>${이스케이프(활동.제목)} <span class="score">${점.맞음} / ${점.전체}</span></h3>
<table class="q"><thead><tr><th>번호</th><th>문항</th><th>내 답</th><th>결과</th></tr></thead><tbody>${줄들}</tbody></table>`;
}

function 순위칸(기록) {
  const r = 기록.data.rank;
  if (!r || !Array.isArray(r.순서)) return '<h3>나의 기준 순위</h3><p class="empty">(아직 정하지 않음)</p>';
  const 항목 = r.순서.map((id, i) => `<li><b>${i + 1}위</b> ${이스케이프(기준이름[id] || id)}</li>`).join('');
  return `<h3>나의 기준 순위 ${r.확정 ? '' : '<span class="warn">(확정 전)</span>'}</h3>
<ol class="rank">${항목}</ol>
<p><b>1순위로 고른 까닭</b><br>${서술(r.이유1)}</p>
<p><b>가장 덜 중요하다고 본 까닭</b><br>${서술(r.이유9)}</p>`;
}

function 내CPU칸(기록) {
  const c = 기록.data.cpuMine;
  if (!c || !String(c.모델 || '').trim()) return '<h3>우리 교실 컴퓨터의 CPU</h3><p class="empty">(쓰지 않음)</p>';
  const 풀이 = 해부(c.모델);
  const 조각표 = 풀이.ok
    ? `<table class="q"><tbody>${풀이.조각들.map((p) => `<tr><td class="no">${이스케이프(p.글)}</td><td><b>${이스케이프(p.이름)}</b> — ${이스케이프(p.설명)}</td></tr>`).join('')}</tbody></table>`
    : '<p class="empty">(해부기가 모르는 형식)</p>';
  return `<h3>우리 교실 컴퓨터의 CPU</h3>
<p><b>CPU 이름</b>: ${이스케이프(c.모델)}${풀이.ok ? ` → ${이스케이프(풀이.요약)}` : ''}</p>${조각표}
<p><b>이 CPU 로 할 수 있는 일·어려운 일</b><br>${서술(c.생각)}</p>`;
}

function 미션칸(기록) {
  const m = 기록.data.mission || {};
  const 순서 = 기록.data.rank?.순서?.length ? 기록.data.rank.순서 : 기본순서;
  const 목적 = (m.목적 || []).map((id) => 목적들.find((x) => x.id === id)?.이름).filter(Boolean);
  const 줄들 = 노트북들.map((n) => {
    const 경고 = (m.목적 || []).map((id) => 목적경고(id, n)).filter(Boolean);
    const 예산넘음 = m.예산 && n.가격 > m.예산;
    const 무게넘음 = m.최대무게 && n.무게 > m.최대무게;
    const 표시 = [예산넘음 && '예산 초과', 무게넘음 && '무게 초과', ...경고].filter(Boolean);
    return `<tr class="${m.선택 === n.id ? 'pick' : ''}"><td class="no">${n.id}</td><td>${이스케이프(n.이름)}${m.선택 === n.id ? ' ⭐' : ''}</td><td>${만원(n.가격)}</td><td>${n.무게}kg</td><td>${내기준점수(n.평점, 순서)}점</td><td>${표시.length ? '⚠ ' + 이스케이프(표시.join(' · ')) : '✔'}</td></tr>`;
  }).join('');
  const 고른 = 노트북들.find((n) => n.id === m.선택);
  const 고른표 = 고른 ? `<table class="spec"><tbody>
<tr><th>이름</th><td>${고른.id}. ${이스케이프(고른.이름)} (${이스케이프(고른.종류)})</td></tr>
<tr><th>가격</th><td>${만원(고른.가격)}</td></tr><tr><th>CPU</th><td>${이스케이프(고른.CPU)}</td></tr>
<tr><th>램 / 저장</th><td>${이스케이프(고른.램)} / ${이스케이프(고른.저장)}</td></tr>
<tr><th>화면</th><td>${이스케이프(고른.화면)}</td></tr><tr><th>그래픽</th><td>${이스케이프(고른.그래픽)}</td></tr>
<tr><th>무게 / 배터리</th><td>${고른.무게}kg / ${이스케이프(고른.배터리)}</td></tr>
<tr><th>포트</th><td>${이스케이프(고른.포트)}</td></tr><tr><th>A/S</th><td>${이스케이프(고른.AS)}</td></tr>
</tbody></table>` : '<p class="empty">(아직 고르지 않음)</p>';
  const 실제 = m.실제 || {};
  const 실제있음 = Object.values(실제).some((v) => String(v || '').trim());
  const 실제표 = 실제있음 ? `<h4>실제 제품 조사 (선택 활동)</h4><table class="spec"><tbody>
${[['제품 이름', 실제.이름], ['가격', 실제.가격], ['CPU', 실제.CPU], ['램 / 저장장치', 실제.램저장], ['화면', 실제.화면], ['무게', 실제.무게], ['조사한 곳', 실제.출처]]
    .map(([k, v]) => `<tr><th>${k}</th><td>${서술(v)}</td></tr>`).join('')}
</tbody></table>` : '';
  return `<h3>나에게 쏙 맞는 노트북 고르기</h3>
<p><b>사용 목적</b>: ${목적.length ? 이스케이프(목적.join(', ')) : '<span class="empty">(고르지 않음)</span>'}${m.목적글 ? ` — ${이스케이프(m.목적글)}` : ''}</p>
<p><b>예산</b>: ${m.예산 ? 만원(m.예산) : '정하지 않음'} · <b>최대 무게</b>: ${m.최대무게 ? m.최대무게 + 'kg' : '상관없음'}</p>
<table class="q"><thead><tr><th></th><th>노트북</th><th>가격</th><th>무게</th><th>내 기준 점수</th><th>조건 점검</th></tr></thead><tbody>${줄들}</tbody></table>
<h4>내가 고른 노트북</h4>${고른표}
<p><b>고른 까닭 (나의 기준과 이어서)</b><br>${서술(m.이유)}</p>
<p><b>이 노트북을 고르며 포기한 것</b><br>${서술(m.포기)}</p>${실제표}`;
}

function 정리칸(기록) {
  const r = 기록.data.reflect || {};
  return `<h3>오늘의 배움 정리</h3>
<p><b>새로 알게 된 것</b><br>${서술(r.배운점)}</p>
<p><b>더 궁금한 것</b><br>${서술(r.궁금)}</p>`;
}

export function 활동지HTML(기록, { 학번 = '', 이름 = '', 날짜 = new Date() } = {}) {
  const 점 = 전체점수(기록);
  const 진 = 진행률(기록);
  const 날 = `${날짜.getFullYear()}년 ${날짜.getMonth() + 1}월 ${날짜.getDate()}일 ${String(날짜.getHours()).padStart(2, '0')}:${String(날짜.getMinutes()).padStart(2, '0')}`;
  const 목차 = 활동들.map((a) => `<li>${완료인가(기록, a) ? '✅' : '⬜'} ${이스케이프(a.제목)}</li>`).join('');

  const 칸들 = 탭들.map((탭) => {
    const 속 = 활동들.filter((a) => a.탭 === 탭.id).map((a) => {
      if (a.종류 === 'quiz') return 퀴즈표(기록, a);
      if (a.종류 === 'rank') return 순위칸(기록);
      if (a.종류 === 'free') return 내CPU칸(기록);
      if (a.종류 === 'mission') return 미션칸(기록);
      if (a.종류 === 'reflect') return 정리칸(기록);
      return '';
    }).join('\n');
    return 속 ? `<section><h2>${이스케이프(탭.이름)}</h2>${속}</section>` : '';
  }).join('\n');

  return `<!doctype html>
<!-- 나에게 쏙 맞는 노트북 고르기 — 활동지 · © 2026 티쳐무 · 모든 권리 보유 -->
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${이스케이프(파일이름(학번, 이름).replace(/\.html$/, ''))}</title>
<style>
:root{--ink:#1b2431;--ink2:#5a6779;--line:#d6dee8;--brand:#3b4fd8;--ok:#1a7a4a;--bad:#b42323;--warn:#9a5b00}
*{box-sizing:border-box}
body{margin:0;background:#f3f5fa;color:var(--ink);font-family:'Pretendard','Malgun Gothic','맑은 고딕',system-ui,sans-serif;font-size:15px;line-height:1.6}
.page{max-width:900px;margin:0 auto;padding:28px 24px 60px;background:#fff}
header{border-bottom:3px solid var(--brand);padding-bottom:12px;margin-bottom:18px}
h1{font-size:1.6rem;margin:0 0 4px}
.sub{color:var(--ink2);font-size:.9rem}
.who{display:flex;gap:18px;flex-wrap:wrap;margin-top:12px;font-size:1.05rem}
.who span b{display:inline-block;min-width:110px;border-bottom:1px solid var(--ink);padding:0 6px}
.sum{display:flex;gap:12px;flex-wrap:wrap;margin:14px 0}
.sum div{flex:1 1 180px;border:1px solid var(--line);border-radius:10px;padding:10px 14px}
.sum .big{font-size:1.5rem;font-weight:700;color:var(--brand)}
ul.toc{columns:2;list-style:none;padding-left:0;margin:6px 0 0}
section{margin-top:26px;page-break-inside:auto}
h2{font-size:1.25rem;background:#eef1fd;border-left:6px solid var(--brand);padding:6px 12px;margin:0 0 10px}
h3{font-size:1.05rem;margin:18px 0 6px}
h4{font-size:1rem;margin:14px 0 6px}
.score{float:right;color:var(--brand)}
table{border-collapse:collapse;width:100%;margin:4px 0 10px;font-size:.92rem}
th,td{border:1px solid var(--line);padding:6px 8px;vertical-align:top;text-align:left}
thead th{background:#f5f7fb}
td.no{width:48px;text-align:center;font-weight:700;white-space:nowrap}
td.res{width:170px}
.ok{color:var(--ok)}.wrong{color:var(--bad)}.shown{color:var(--warn)}.none{color:var(--ink2)}
.warn{color:var(--warn);font-size:.9rem}
table.spec th{width:130px;background:#f5f7fb}
tr.pick td{background:#fff8dc;font-weight:600}
ol.rank{columns:3;list-style:none;padding-left:0;margin:4px 0 8px}
.empty{color:#9aa4b2}
footer{margin-top:40px;border-top:1px solid var(--line);padding-top:10px;color:var(--ink2);font-size:.8rem}
@media print{body{background:#fff}.page{padding:0}section{break-inside:auto}h2,h3{break-after:avoid}tr{break-inside:avoid}}
</style></head><body><div class="page">
<header>
<h1>💻 나에게 쏙 맞는 노트북 고르기 — 활동지</h1>
<div class="sub">정보 · Ⅰ. 컴퓨팅 시스템 — 문제 해결에 적합한 하드웨어를 선택하여 컴퓨팅 장치를 구성한다</div>
<div class="who"><span>학번 <b>${이스케이프(학번) || '&nbsp;'}</b></span><span>이름 <b>${이스케이프(이름) || '&nbsp;'}</b></span><span>내려받은 때 <b>${날}</b></span></div>
</header>
<div class="sum">
<div>확인 문제 점수<div class="big">${점.맞음} / ${점.전체}</div></div>
<div>끝낸 활동<div class="big">${진.끝} / ${진.전체}</div></div>
</div>
<ul class="toc">${목차}</ul>
${칸들}
<footer>
이 활동지는 「나에게 쏙 맞는 노트북 고르기」 앱에서 만들었습니다. 종합 미션의 노트북 이름·가격은 수업용으로 지어낸 것입니다.<br>
© 2026 티쳐무 · 모든 권리 보유 · 학교 수업 목적으로만 이용해 주세요.
</footer>
</div></body></html>`;
}

