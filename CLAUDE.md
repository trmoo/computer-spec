# computer-spec — 나에게 쏙 맞는 노트북 고르기

© 2026 티쳐무 · 모든 권리 보유 (저작권 표시 일곱 곳 전부. 루트 CLAUDE.md 「저작권 표시」 방침)

## ① 목적과 대상 단원
- 고등학교 「정보」 Ⅰ. 컴퓨팅 시스템 — 「문제 해결에 적합한 하드웨어를 선택하여 컴퓨팅 장치를 구성한다」.
  (학습지 문구는 옛 교육과정 표현이다. 2022 개정에서는 **[12정01-03]** 의 「적합한 장치를 선택」과 이어진다.)
- 원본: 학습지 「[정보] 나에게 쏙 맞는 노트북 선정하기」 2쪽(향남고). 원본은 저장소에 넣지 않는다(`.gitignore` 에 `*.pdf *.png` 등).
- **사용자 결정(2026-09-19)**: 학습지의 옛 내용은 **최신 내용으로 바꿈** · 활동지는 **HTML 파일 + 이어하기 .json** ·
  학번·이름은 **파일에만 넣고 저장하지 않음** · 범위는 **7탭 전부**.

## ② 기능 (탭 7 · 화면 22 · 채점 활동 13가지 · 확인 문제 74 · 활동 17)
| 탭 | 화면 |
|---|---|
| ① 선택 기준 `criteria` | list(9기준 카드) · match(걱정→기준 9문항) · rank(▲▼ 순위 + 까닭 → 확정) |
| ② 노트북 종류 `types` | cards · sort(문장 카드 12장, 종류마다 3장) · who(인물 5명) |
| ③ 화면·포트 `screen` | size(SVG 실제 비율 비교 + 인치 계산기) · res(**캔버스에 실제 픽셀 수로 그려 pixelated 확대** + PPI + 배율 + 주사율 공 굴리기) · port(SVG 단자 그림 6 + 이름 맞히기) · speed(전송 방식표 + 전송 시간 계산기) |
| ④ CPU `cpu` | maker(x86/ARM) · decode(**모델명 해부기** + 우리 교실 CPU 적기) · core(P/E/LP-E 조립기 + 대표 CPU 12종) · suffix · clock |
| ⑤ 그 밖의 부품 `parts` | gpu · memory · body · quiz |
| ⑥ 종합 미션 `mission` | practice(인물 4명 — 조건을 따지면 정답이 하나로 정해지게 짰다) · mine(목적·예산·무게 → 내 기준 점수 순 비교 → 고르기 → 까닭·포기 → 점검) |
| ⑦ 내 활동지 `report` | 진행 상황 · 배움 정리 · **활동지 .html 내려받기** · 미리 보기(iframe srcdoc) · 이어하기 .json · 기록 지우기 |

### 구조
- `src/data/*.js` 자료·문항 (DOM 금지 — node 시험) / `src/engine/` 계산·해부기·미션 점검 (DOM 금지)
- `src/lib/store.js` 기록(localStorage, 이름 없음) · `report.js` 활동지 HTML 문자열 · `quiz.js` 문항 부품 · `ui.js` · `josa.js`
- `src/data/activities.js` 가 **활동 목록의 단일 출처** — 문항·완료 조건·점수·진행률이 모두 여기서 나온다.
- 문항 흐름: 누르면 즉시 채점 → 틀리면 힌트 → 2번 틀리면 [정답 보기] → 해설. 기록 `{a, ok, n, shown}`.
- 내 기준 점수 = Σ(기준 평점 1~5 × 순위 가중치 9~1) ÷ 최대 × 100 (`calc.js` 내기준점수).

### ⚠ 지켜야 할 것
- **학번·이름은 `report.js` 탭 모듈 변수에만** 둔다. store·이어하기 파일에 넣지 말 것 (`check:syntax` ⑧, 시험이 막는다).
  `store.검사()` 는 파일에 끼워 넣은 알 수 없는 칸을 버린다.
- 활동지에 학생 글을 넣을 때는 반드시 `이스케이프` (시험이 `<script>` 로 확인).
- 조사를 `은(는)` 처럼 늘어놓지 말 것 → `lib/josa.js` (`check:syntax` ⑥). 숫자·영문은 읽는 소리로(4100M→엠→은).
- 탭 파일에서 setInterval·resize·requestAnimationFrame 직접 금지 → `ui.js` 의 화면타이머·창크기바뀔때·화면애니.
- `replaceChildren(null)`·`append(null)` 은 「null」 글자를 넣는다 — 빈 자리는 `.filter(Boolean)`.
  **두 번 겪었다**(내 활동지 맨 위, 그리고 2026-09-19 모든 확인 문제 카드 — `quiz.js` 의 그림 자리). `check:syntax` ⑦-2 가 이제 막는다.
- 가상 노트북 사양을 고치면 **평점도 함께** — `test/data.test.mjs` 가 가격·무게 평점 순서, 인물 문제의 정답 유일성을 검사한다.
  p4(도현)는 「배터리만 보면 ARM(E)이 낫지만 x86 전용 프로그램 때문에 A」라는 함정이 살아 있어야 한다.
- CPU 코어·스레드는 `대표CPU` 표와 `코어스레드()` 셈이 일치해야 한다(AMD Zen 5c 는 작은 코어도 2스레드 → `작은코어2`).
- 해부기는 모르는 형식을 억지로 풀지 않는다(시험: 'Core i7', 'GeForce RTX 4060' 등은 ok:false).

### 점검
- `npm test` **1,168가지** · `npm run check:syntax` (소스 32개) · `npm run build` → `dist/index.html` 약 156KB, 바깥 자원 0개.
- `grep -o 티쳐무 dist/index.html | wc -l` 이 **5** (HTML 주석·배너·푸터 등). 워크플로는 3 이상을 요구.
- 화면 확인은 브라우저 창이 숨겨져 있으면 캡처가 안 된다 → 크롬 헤드리스로 찍는다
  (`chrome --headless=new --window-size=1366,1400 --screenshot=... file:///.../dist/index.html#cpu/core`).
  ⚠ 헤드리스 크롬은 창 너비 약 500px 아래로 줄지 않아 휴대폰 너비 캡처가 잘려 보인다 — 휴대폰 너비는 브라우저 패널의 mobile 프리셋으로 `scrollWidth` 를 잰다.

## ③ 개발 상태
- 2026-09-19 첫 완성. 22화면 전부 오류 없이 그려지고, 문항·순위·미션·활동지 내려받기·이어하기를 브라우저에서 확인했다.
- 저장소: https://github.com/trmoo/computer-spec (Pages: https://trmoo.github.io/computer-spec/)
  Pages 는 `.github/workflows/deploy.yml` 이 푸시마다 `npm ci → npm test → check:syntax → build → 빌드 결과 점검` 뒤 올린다.
- 포털 `comedu_portal/` 에 올렸다.

### 다음 할 일(후보)
- 데스크톱 조립(부품 호환) 편 · 스마트폰 고르기 편
- 교사용 정답표·지도안 · 학습지(.docx)
- 가상 노트북을 교사가 바꿔 넣는 기능
