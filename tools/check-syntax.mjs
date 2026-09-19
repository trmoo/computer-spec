/*! 나에게 쏙 맞는 노트북 고르기 — © 2026 티쳐무 · 모든 권리 보유
 *  소스 전수 검사.
 *
 *  ⚠ 이것이 왜 필요한가 —
 *    `npm test` 는 탭 파일(DOM 을 만지는 곳)을 부르지 않는다.
 *    그래서 탭 파일에 괄호 하나가 빠져도 시험은 멀쩡히 통과하고 빌드에서야 터진다.
 *    여기서 파일을 하나하나 열어 문법과 우리 규칙을 함께 본다.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative } from 'node:path';

const 뿌리 = process.cwd();
const 잘못 = [];

function 파일모으기(폴더, 모음 = []) {
  for (const 이름 of readdirSync(폴더)) {
    const 길 = join(폴더, 이름);
    if (statSync(길).isDirectory()) 파일모으기(길, 모음);
    else if (/\.(m?js|css)$/.test(이름)) 모음.push(길);
  }
  return 모음;
}

const 소스들 = [
  ...파일모으기(join(뿌리, 'src')),
  ...파일모으기(join(뿌리, 'test')),
  ...파일모으기(join(뿌리, 'tools')),
  join(뿌리, 'vite.config.js'),
];

console.log(`\n  소스 ${소스들.length}개를 검사합니다.\n`);

for (const 길 of 소스들) {
  const 이름 = relative(뿌리, 길).replace(/\\/g, '/');
  const 글 = readFileSync(길, 'utf-8');

  // ① 문법 (CSS 는 건너뛴다)
  if (!이름.endsWith('.css')) {
    try {
      // .js 는 ES 모듈이라 --check 가 CommonJS 로 읽지 않도록 모듈로 넘긴다
      execFileSync(process.execPath, ['--input-type=module', '--check'], { input: 글, stdio: 'pipe' });
    } catch (e) {
      잘못.push(`${이름} — 문법 오류\n      ${String(e.stderr || e).split('\n').slice(0, 5).join('\n      ')}`);
      continue;
    }
  }

  // ② 저작권 머리 주석. 화면·시험·도구 어디든 남긴다.
  if (!글.startsWith('/*!')) 잘못.push(`${이름} — 머리에 /*! 저작권 주석이 없다`);
  if (!글.slice(0, 300).includes('티쳐무')) 잘못.push(`${이름} — 저작권자(티쳐무) 표시가 없다`);
  if (이름.endsWith('.css')) continue;

  // ③ 자바스크립트 식별자로 쓸 수 없는 원문자를 이름에 쓰지 않았는가.
  const 원문자 = 글.match(/(?:function|const|let|var)\s+[^\s(=]*[①-⓿][^\s(=]*/);
  if (원문자) 잘못.push(`${이름} — 이름에 원문자를 썼다: ${원문자[0]}  (자바스크립트 식별자가 아니다)`);

  // ④ 화면 수명 규칙. 탭 파일은 ui.js 를 거쳐야 한다.
  if (이름.startsWith('src/tabs/')) {
    if (/window\.addEventListener\(\s*['"]resize/.test(글)) 잘못.push(`${이름} — resize 를 직접 걸었다. ui.js 의 창크기바뀔때() 를 쓸 것`);
    if (/setInterval\(/.test(글)) 잘못.push(`${이름} — setInterval 을 직접 썼다. ui.js 의 화면타이머() 를 쓸 것`);
    if (/requestAnimationFrame\(/.test(글)) 잘못.push(`${이름} — requestAnimationFrame 을 직접 썼다. ui.js 의 화면애니() 를 쓸 것`);
  }

  // ⑤ 브라우저 기본 대화상자 금지. 주소가 함께 떠서 교실 화면에 어울리지 않는다.
  const 기본창 = 글.match(/(?<![.\wㄱ-힣])(alert|confirm|prompt)\s*\(/);
  if (기본창 && !이름.startsWith('tools/') && !이름.startsWith('test/')) 잘못.push(`${이름} — ${기본창[1]}() 을 썼다. ui.js 의 알림() 을 쓸 것`);

  // ⑥ 「은(는)」 같은 조사 늘어놓기 금지 — lib/josa.js 로 고른다.
  if (이름.startsWith('src/') && 이름 !== 'src/lib/josa.js') {
    const 조사 = 글.match(/[은을이와과]\((?:는|를|가|과|와)\)/);
    if (조사) 잘못.push(`${이름} — 조사를 늘어놓았다: ${조사[0]}  (lib/josa.js 를 쓸 것)`);
  }

  // ⑦ 자료 파일에서 DOM 을 만들지 않는다 (node 로 불러다 시험하므로)
  if (이름.startsWith('src/data/') || 이름.startsWith('src/engine/') || 이름 === 'src/lib/report.js') {
    if (/\bdocument\.|\bwindow\./.test(글)) 잘못.push(`${이름} — 자료·계산 파일에서 DOM 을 건드렸다`);
  }

  // ⑦-2 replaceChildren·append 에 null 을 넘기면 화면에 「null」 글자가 찍힌다(두 번 겪었다).
  //   h() 는 null 을 걸러 주지만 DOM 의 replaceChildren·append 는 걸러 주지 않는다.
  if (이름.startsWith('src/')) {
    for (const 줄 of 글.split(/\r?\n/)) {
      if (/(replaceChildren|\.append)\(/.test(줄) && /:\s*null\b|,\s*null\s*[,)]/.test(줄) && !줄.includes('filter(Boolean)')) {
        잘못.push(`${이름} — replaceChildren/append 에 null 을 넘긴다: ${줄.trim().slice(0, 80)}  (.filter(Boolean) 로 걸러 낼 것)`);
      }
    }
  }

  // ⑧ 이 앱은 학번·이름을 저장하지 않는다 — 기록소에 넣는 코드가 생기면 막는다.
  if (이름.startsWith('src/') && /자료적기\(\s*['"](?:학번|이름|name|studentId)/.test(글)) {
    잘못.push(`${이름} — 학번·이름을 기록소에 저장하려 한다. 활동지 파일에만 넣을 것`);
  }
}

// ⑨ 화면 아래 푸터가 살아 있는가 (학생·교사가 실제로 보는 저작권 표시)
const 메인 = readFileSync(join(뿌리, 'src/main.js'), 'utf-8');
if (!메인.includes('© 2026 티쳐무 · 모든 권리 보유')) 잘못.push('src/main.js — 화면 푸터의 저작권 표시가 없다');
if (!메인.includes('학교 수업 목적으로만')) 잘못.push('src/main.js — 화면 푸터의 이용 범위 문구가 없다');

if (잘못.length) {
  console.log(`  ❌ ${잘못.length}가지 문제\n`);
  for (const m of 잘못) console.log('    ' + m);
  console.log('');
  process.exit(1);
}
console.log(`  ✅ 소스 ${소스들.length}개 모두 통과 (문법 · 저작권 · 화면 수명 · 기본 대화상자 · 조사 · 개인정보)\n`);
