/*! 나에게 쏙 맞는 노트북 고르기 — © 2026 티쳐무 · 모든 권리 보유
 *  자료 시험 — 화면에 적은 정답과 자료가 어긋나지 않는가.
 */
import { 묶음, 확인, 참 } from './harness.mjs';
import { 활동들, 탭들, 정답인가, 수읽기, 정답글 } from '../src/data/activities.js';
import { 기준들 } from '../src/data/criteria.js';
import { 종류들, 분류카드 } from '../src/data/types.js';
import { 크기문제, 속도문제, 포트이름문제, 포트들 } from '../src/data/display.js';
import { 스레드문제 } from '../src/data/cpu.js';
import { 노트북들, 인물문제, 목적들, 목적경고 } from '../src/data/laptops.js';
import { 인치를cm, 전송초, 코어스레드, 반올림 } from '../src/engine/calc.js';

묶음('활동 목록');
{
  const 열쇠들 = 활동들.map((a) => a.key);
  확인('활동 열쇠가 겹치지 않는다', new Set(열쇠들).size, 열쇠들.length);
  for (const a of 활동들) 참(`${a.key} 의 탭이 있다`, 탭들.some((t) => t.id === a.탭));
}

묶음('문항 모양');
for (const a of 활동들.filter((x) => x.종류 === 'quiz')) {
  const ids = a.문항.map((q) => q.id);
  확인(`${a.key} — 문항 id 가 겹치지 않는다`, new Set(ids).size, ids.length);
  참(`${a.key} — 문항이 있다`, a.문항.length > 0);
  for (const q of a.문항) {
    const 이름 = `${a.key}/${q.id}`;
    참(`${이름} 발문`, typeof q.q === 'string' && q.q.length > 5);
    참(`${이름} 해설`, typeof q.해설 === 'string' && q.해설.length > 5);
    참(`${이름} 힌트`, typeof q.힌트 === 'string' && q.힌트.length > 1);
    if (q.종류 === 'num') {
      참(`${이름} 정답이 수`, Number.isFinite(q.답));
      참(`${이름} 정답을 넣으면 맞는다`, 정답인가(q, String(q.답)));
    } else {
      참(`${이름} 보기가 2개 이상`, Array.isArray(q.보기) && q.보기.length >= 2);
      참(`${이름} 정답 번호가 보기 안에 있다`, Number.isInteger(q.답) && q.답 >= 0 && q.답 < q.보기.length);
      확인(`${이름} 보기가 겹치지 않는다`, new Set(q.보기).size, q.보기.length);
      참(`${이름} 정답을 고르면 맞는다`, 정답인가(q, q.답));
      참(`${이름} 다른 보기는 틀린다`, q.보기.every((_, i) => i === q.답 || !정답인가(q, i)));
    }
    참(`${이름} 정답 글`, 정답글(q).length > 0);
    // **굵게** 짝이 맞는가 (짝이 안 맞으면 화면에 별표가 그대로 보인다)
    for (const 글 of [q.q, q.해설]) 확인(`${이름} 별표 짝`, (글.match(/\*\*/g) || []).length % 2, 0);
  }
}

묶음('수 읽기');
확인('단위 붙여도 읽는다', 수읽기('39.6cm'), 39.6);
확인('쉼표 소수점', 수읽기('39,6'), 39.6);
참('빈칸은 수가 아니다', Number.isNaN(수읽기('')));
참('허용 범위 안이면 맞다', 정답인가(크기문제[1], '39.62'));
참('허용 범위 밖이면 틀리다', !정답인가(크기문제[1], '39.8'));

묶음('정답이 계산과 맞는가');
확인('15.6인치 cm 문제', 크기문제.find((q) => q.id === 'z2').답, 반올림(인치를cm(15.6), 1));
확인('10GB·10Gbps 문제', 속도문제.find((q) => q.id === 'v1').답, 전송초(10, 10));
{
  const 구성 = { t1: { P: 8, 하이퍼: true }, t2: { P: 2, E: 8, 하이퍼: true }, t3: { P: 6, E: 8, LPE: 2, 하이퍼: true }, t4: { P: 4, LPE: 4, 하이퍼: false } };
  for (const q of 스레드문제) 확인(`${q.id} 스레드 정답`, q.답, 코어스레드(구성[q.id]).스레드);
}

묶음('분류 카드는 종류마다 3장');
for (let i = 0; i < 종류들.length; i++) 확인(종류들[i].짧게, 분류카드.filter((c) => c.답 === i).length, 3);

묶음('단자 그림과 이름');
확인('단자마다 문제 하나', 포트이름문제.length, 포트들.length);
for (const q of 포트이름문제) 확인(`${q.id} 그림과 정답이 같은 단자`, 포트들[q.답].id, q.그림);

묶음('기준');
확인('기준은 아홉 가지', 기준들.length, 9);
for (const n of 노트북들) {
  for (const c of 기준들) {
    const v = n.평점[c.id];
    참(`${n.id} ${c.이름} 평점이 1~5`, Number.isInteger(v) && v >= 1 && v <= 5);
  }
}

묶음('가상 노트북 사양과 평점이 앞뒤가 맞는가');
{
  const 가장 = (열쇠, 방향) => [...노트북들].sort((a, b) => 방향 * (a[열쇠] - b[열쇠]))[0];
  확인('가장 싼 노트북이 가격 평점 5', 가장('가격', 1).평점.price, 5);
  확인('가장 비싼 노트북이 가격 평점 1', 가장('가격', -1).평점.price, 1);
  확인('가장 가벼운 노트북이 무게 평점 5', 가장('무게', 1).평점.weight, 5);
  확인('가장 무거운 노트북이 무게 평점 1', 가장('무게', -1).평점.weight, 1);
  for (const n of 노트북들) {
    if (n.외장) 참(`${n.id} 외장 그래픽이면 그래픽 칸에 「외장」`, n.그래픽.includes('외장'));
    else 참(`${n.id} 내장 그래픽이면 그래픽 칸에 「내장」`, n.그래픽.includes('내장'));
    if (n.구조 === 'ARM') 참(`${n.id} ARM 이면 CPU 칸에 ARM`, n.CPU.includes('ARM'));
    if (n.펜) 참(`${n.id} 펜이면 화면 칸에 펜`, n.화면.includes('펜'));
  }
  // 무게 평점은 무게가 무거울수록 같거나 낮아야 한다
  const 무게순 = [...노트북들].sort((a, b) => a.무게 - b.무게);
  for (let i = 1; i < 무게순.length; i++) 참(`무게 평점 순서 ${무게순[i].id}`, 무게순[i].평점.weight <= 무게순[i - 1].평점.weight);
  const 가격순 = [...노트북들].sort((a, b) => a.가격 - b.가격);
  for (let i = 1; i < 가격순.length; i++) 참(`가격 평점 순서 ${가격순[i].id}`, 가격순[i].평점.price <= 가격순[i - 1].평점.price);
}

묶음('인물 문제 — 조건을 따지면 정답이 하나로 정해지는가');
{
  const 예산안 = (q) => 노트북들.filter((n) => n.가격 <= q.예산);
  const p = Object.fromEntries(인물문제.map((q) => [q.id, q]));
  const 정답 = (q) => 노트북들[q.답];
  for (const q of 인물문제) 참(`${q.id} 정답이 예산 안`, 정답(q).가격 <= q.예산);
  확인('p1 — 70만 원 안은 한 대뿐', 예산안(p.p1).map((n) => n.id), [정답(p.p1).id]);
  확인('p2 — 150만 원 안에서 펜이 되는 것은 한 대뿐', 예산안(p.p2).filter((n) => n.펜).map((n) => n.id), [정답(p.p2).id]);
  참('p3 — 정답은 외장 그래픽', 정답(p.p3).외장);
  참('p3 — 정답이 외장 그래픽 가운데 성능 평점 1위', 예산안(p.p3).filter((n) => n.외장).every((n) => n.평점.perf <= 정답(p.p3).평점.perf));
  {
    const 후보 = 예산안(p.p4).filter((n) => n.구조 === 'x86');
    const 최고배터리 = Math.max(...후보.map((n) => n.평점.battery));
    확인('p4 — x86 이고 예산 안에서 배터리 최고는 한 대뿐', 후보.filter((n) => n.평점.battery === 최고배터리).map((n) => n.id), [정답(p.p4).id]);
    참('p4 — 배터리만 보면 ARM(E)이 더 좋다(함정이 살아 있는가)', 노트북들.find((n) => n.id === 'E').평점.battery >= 정답(p.p4).평점.battery);
  }
}

묶음('목적 경고');
{
  const 게이밍 = 노트북들.find((n) => n.id === 'D');
  const 가벼운 = 노트북들.find((n) => n.id === 'A');
  확인('게이밍 노트북은 게임 경고 없음', 목적경고('game', 게이밍), null);
  참('초경량은 게임 경고', !!목적경고('game', 가벼운));
  참('게이밍은 들고 다니기 경고', !!목적경고('carry', 게이밍));
  확인('초경량은 들고 다니기 경고 없음', 목적경고('carry', 가벼운), null);
  참('ARM 은 코딩 확인 경고', !!목적경고('code', 노트북들.find((n) => n.구조 === 'ARM')));
  for (const 목 of 목적들) for (const n of 노트북들) {
    const w = 목적경고(목.id, n);
    참(`${목.id}/${n.id} 경고는 없거나 글`, w === null || (typeof w === 'string' && w.length > 0));
  }
}
