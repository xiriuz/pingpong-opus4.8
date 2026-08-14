# 핑퐁팡! 🏓

내 팔과 라켓이 보이는 귀여운 1인칭 모바일 탁구 게임입니다. 왼손 조이스틱으로 움직이고 오른손으로 스윙하며, 뾰족머리와 긴머리 중 캐릭터를 고를 수 있습니다. 혼자 AI와 놀거나 한 폰을 가로로 나눠 친구와 함께 플레이할 수 있습니다.

## 플레이

**[GitHub Pages에서 바로 하기](https://xiriuz.github.io/pingpong-opus4.8/)**

## 구현 모드

- 혼자 하기: 쉬움·보통·어려움 AI 대전
- 둘이 하기: 한 폰 가로 분할 로컬 대전
- 멀리서 둘이: 미구현(선택 기능). `js/net.js`에 확장 지점만 준비

## 로컬 실행

ES 모듈은 `file://`에서 제한되므로 저장소 폴더에서 로컬 서버를 실행합니다.

```sh
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000`을 여세요.

## 그림 넣는 법

PNG가 없어도 코드로 그린 도형으로 완전히 플레이할 수 있습니다. 아래 파일을 `assets/`에 넣으면 코드 수정 없이 자동 적용됩니다. 모든 PNG는 `background.png`를 제외하고 투명 배경을 사용합니다.

| 파일명 | 크기 | 내용 |
|---|---:|---|
| `assets/boy_arm.png`, `assets/girl_arm.png` | 500×600 | 내 팔과 라켓 기본 자세 |
| `assets/boy_arm_swing.png`, `assets/girl_arm_swing.png` | 500×600 | 휘두른 팔과 라켓 |
| `assets/boy_idle.png`, `assets/girl_idle.png` | 400×500 | 상대편 기본 자세 |
| `assets/boy_swing.png`, `assets/girl_swing.png` | 400×500 | 상대편 스윙 자세 |
| `assets/boy_win.png`, `assets/girl_win.png` | 400×500 | 승리 자세 |
| `assets/boy_face.png`, `assets/girl_face.png` | 200×200 | 선택 화면 얼굴 |
| `assets/table_top.png` | 512×920 | 위에서 본 탁구대 상판 |
| `assets/net.png` | 760×180 | 정면 네트 |
| `assets/ball.png` | 128×128 | 정면 원형 공 |
| `assets/background.png` | 1080×1000 | 체육관 또는 공원 배경 |
| `assets/logo.png` | 800×400 | 타이틀 로고 |
| `assets/effect_hit.png` | 300×300 | 타격 효과 |

효과음은 `assets/sounds/`에 `hit.mp3`, `bounce.mp3`, `net.mp3`, `score.mp3`, `miss.mp3`, `win.mp3` 이름으로 넣습니다. 파일이 없어도 조용히 계속 실행됩니다.

## 구현 메모

- Canvas 2D와 바닐라 ES 모듈만 사용하며 외부 의존성과 빌드 과정이 없습니다.
- 물리는 1/120초 고정 타임스텝이고, 두 화면에서도 하나의 월드만 계산합니다.
- 조작은 Pointer Events와 `pointerId`로 분리해 최대 4손가락 동시 입력을 지원합니다.
- 명세의 판단 기준에 따라 온라인 기능 수보다 로컬 2인용, 쉬운 타이밍 판정, 즐거운 피드백의 완성도를 우선했습니다.
