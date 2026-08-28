# 충북형 도시농부 🌱

> 충북형 도시농부 프론트엔드 — 병합 및 배포 완료

충북형 도시농부는 교육을 이수한 도시농부와 농가를 연결해 농촌 일자리와 농작업 참여 기회를 제공하는 웹 서비스입니다.

도시농부는 구인 공고를 확인하고, 농가는 농가 프로필과 작업 정보를 관리하며, 중개센터 담당자는 신청·공고 처리 현황을 확인할 수 있도록 사용자 유형에 따라 맞춤 화면을 제공합니다.

## 주요 기능

### 공통

- 회원가입 및 사용자 유형 선택
- 로그인, 자동 로그인, 로그아웃
- 내 정보 조회 및 회원 탈퇴
- 공지사항 목록 및 상세 조회
- 모바일 환경에 맞춘 하단 네비게이션

### 교육이수자(도시농부)

- 서비스 홈 및 농작업 관련 정보 확인
- 구인 공고 조회
- 지역·작물·작업 유형·모집 상태·날짜 기반 공고 검색
- 공고 상세 정보 확인
- 마이페이지 및 활동 타임라인 확인

### 농가

- 농가 전용 홈
- 농가 프로필 등록 및 수정
- 농가명, 대표자, 연락처, 주소, 재배 작물, 주요 활동 정보 관리
- 내 공고 목록 및 상태별 조회
- 농작업 정보 입력을 통한 AI 공고문 생성
- 공고 임시저장, 수정, 제출 및 결과 확인

### 중개센터

- 중개센터 전용 업무 현황 대시보드
- 신규 신청, 공고 검토, 매칭 대기 현황 요약
- 신청 관리, 공고 검토, 운영 통계, 데이터 메뉴 진입
- 우선 처리 항목 확인
- 농가 공고 승인·반려 처리
- 공고별 도시농부 후보 조회 및 매칭 관리
- 지역별 운영 통계와 데이터 현황 확인

## 사용자 흐름

```text
회원가입 → 사용자 유형 선택
             ├─ 교육이수자 → 도시농부 홈 → 공고/공지/마이페이지
             └─ 농가       → 농가 홈     → 농가 프로필 관리

발급 계정 로그인 → 중개센터 담당자 → 중개센터 홈 → 신청/공고/통계/데이터
```

## 화면 라우트

| 경로 | 설명 |
| --- | --- |
| `/login` | 로그인 |
| `/register` | 회원가입 정보 입력 |
| `/register/detail` | 사용자 유형 선택 |
| `/home` | 교육이수자 홈 |
| `/farmer-home` | 농가 홈 |
| `/center-home` | 중개센터 업무 현황 홈 |
| `/farmer-mypage` | 농가 프로필 등록·수정 |
| `/farmer-announcements` | 농가 내 공고 목록 |
| `/farmer-announcements/new` | 농가 공고 작성 및 AI 공고문 생성 |
| `/farmer-announcements/[id]/result` | 생성된 공고 결과 확인 및 제출 |
| `/announcement` | 공지사항 목록 |
| `/announcement/[id]` | 공지사항 상세 |
| `/mypage` | 마이페이지 |
| `/mypage/timeline` | 활동 타임라인 |
| `/mypage/timeline/[id]` | 활동 상세 |
| `/work-condition` | 작업 준비 체크리스트 |
| `/center-applications` | 중개센터 신청 관리 |
| `/center-postings` | 중개센터 농가 공고 검토 |
| `/center-matching` | 중개센터 매칭 관리 |
| `/center-statistics` | 중개센터 운영 통계 |
| `/center-data` | 중개센터 데이터 현황 |

## 기술 스택

- **Framework**: Next.js 15, React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Data/API**: Axios
- **State Management**: Zustand
- **Icons**: React Icons

## 프로젝트 구조

```text
src/
├─ app/                 # Next.js App Router 페이지 및 라우트
├─ components/          # 화면 및 공통 UI 컴포넌트
├─ services/            # 백엔드 API 및 인증 관련 로직
├─ stores/              # 전역 상태 관리
└─ assets/              # 이미지 및 아이콘 리소스
```

## 실행 방법

### 요구 사항

- Node.js 18 이상
- npm
- 실행 중인 백엔드 서버

```bash
git clone <frontend-repository-url>
cd chungbuk-farmer
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)에 접속합니다.

### 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성합니다.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

환경 변수를 생략하면 기본값으로 `http://localhost:8080`을 사용합니다.

## 백엔드 연동

프론트엔드는 Axios를 통해 백엔드 API와 통신하며, 로그인 후 발급된 Bearer 토큰을 요청 헤더에 자동으로 포함합니다.

- 인증: `/api/auth/*`
- 농가 프로필: `/api/farm-profiles/*`
- 구인 공고: `/api/job-postings/*`

백엔드 저장소: [CityFarmerPlus_BE](https://github.com/ParkChanWoo0321/CityFarmerPlus_BE)

## 사용 가능한 스크립트

```bash
npm run dev       # 개발 서버 실행
npm run build     # 프로덕션 빌드
npm run start     # 프로덕션 서버 실행
npm run mock-auth # 인증 목업 서버 실행
```

## 개발 참고

- 로그인 토큰은 브라우저의 `localStorage` 또는 `sessionStorage`에 저장됩니다.
- 로그인한 사용자 유형에 따라 교육이수자와 농가의 시작 화면이 달라집니다.
- AI가 생성한 농가 공고문은 참고용이며, 중개센터 검토 및 승인 후 운영됩니다.
- 일부 센터 통계는 백엔드 API가 제공하는 범위에 따라 실제 값 또는 안내 문구로 표시됩니다.
- 매칭 화면의 후보 조회·매칭 확정 API가 연결되지 않은 환경에서는 확인 결과만 표시되고 실제 저장은 수행되지 않습니다.
- 백엔드가 실행 중이지 않으면 로그인·회원가입·농가 프로필·구인 공고 기능이 정상적으로 동작하지 않을 수 있습니다.

## 라이선스

이 프로젝트는 충북형 도시농부 서비스 구현을 위한 프로젝트입니다.
