# MyRealPet Frontend

반려동물 종합 관리 플랫폼 MyRealPet의 프론트엔드 애플리케이션입니다.

## 프로젝트 소개

MyRealPet은 반려동물 보호자들이 반려동물의 건강, 산책, 일상을 효과적으로 관리하고 다른 보호자들과 소통할 수 있는 종합 플랫폼입니다.

## 기술 스택

### Core
- **React** 18.3.1
- **TypeScript** 5.8.3
- **Vite** 7.0.4

### Styling
- **TailwindCSS** 4.1.14
- **Framer Motion** 12.23.12 - 애니메이션

### Routing & State
- **React Router DOM** 7.9.4 - 라우팅 관리
- **Axios** 1.12.2 - HTTP 클라이언트

### UI 라이브러리
- **Heroicons/React** 2.2.0 - 아이콘
- **Lucide React** 0.545.0 - 아이콘
- **React Icons** 5.5.0 - 아이콘
- **React Calendar** 6.0.0 - 캘린더 UI
- **Recharts** 3.2.0 - 차트 및 데이터 시각화
- **Swiper** 11.2.10 - 슬라이더

### 외부 API
- **Kakao Maps API** - 산책 경로 지도 표시

## 주요 기능

### 1. 인증 및 사용자 관리
- 일반 로그인/회원가입
- 소셜 로그인 (카카오)
- 마이페이지
- 사용자 정보 관리

### 2. 반려동물 프로필 관리 (`/my-pet`)
- 반려동물 프로필 등록 및 수정
- 다중 반려동물 관리
- 반려동물 정보 카드 뷰

### 3. 건강 관리
- **건강 리포트** (`/health-report/:petId`)
  - 건강 설문조사
  - 레이더 차트를 통한 건강 상태 시각화
  - AI 기반 건강 리포트
- **의료 기록** (`/medical-record/:petId`)
  - 진료 기록 등록 및 조회
  - 예방접종 이력 관리
  - 체중 기록 추적
  - 생리 주기 트래커 (암컷)
- **인바디 결과** - 반려동물 체성분 분석 결과

### 4. 일일 미션 (`/my-pet/:petId/missions`)
- 일일 미션 관리
- 미션 캘린더
- 미션 완료 추적

### 5. AI 챗봇
- 반려동물 관련 질문 응답
- 실시간 대화형 인터페이스

### 6. 산책 관리 (`/pet-walk`)
- 카카오맵 기반 산책 경로 기록
- 산책 경로 저장 및 조회
- 산책 경로 패널 및 모달

### 7. 펫 SNS (`/sns`)
- 게시물 작성 및 공유
- 이미지 업로드
- 내 게시물 관리 (`/sns/my-posts`)
- 타임라인 피드

### 8. Q&A 게시판 (`/qna`)
- 질문 작성 및 조회
- 카테고리별 분류
- 페이지네이션
- 질문 상세 모달

### 9. 추억 페이지 (`/memories/:petId`)
- 반려동물과의 추억 기록
- 사진 및 메모 저장

## 프로젝트 구조

```
src/
├── account/              # 계정 관련 (로그인, 회원가입, 마이페이지)
│   ├── components/       # 로그인/회원가입 폼
│   ├── hooks/            # 인증 관련 훅
│   ├── pages/            # 계정 페이지
│   ├── services/         # 인증 서비스
│   └── types/            # 인증 타입 정의
├── my-pet/               # 반려동물 관리
│   ├── components/       # 각종 탭 및 모달 컴포넌트
│   ├── constants/        # 건강 설문 질문 등 상수
│   ├── pages/            # 건강 리포트, 의료 기록, 추억, 미션 페이지
│   ├── types/            # 타입 정의
│   └── utils/            # API 및 유틸리티 함수
├── pet-walk/             # 산책 관리
│   ├── components/       # 경로 패널, 모달
│   ├── hooks/            # 카카오맵 훅
│   ├── pages/            # 산책 페이지
│   ├── types/            # 카카오맵 타입 정의
│   └── utils/            # 카카오맵 로더, API
├── sns/                  # SNS 기능
│   ├── api/              # SNS API
│   ├── components/       # 게시물 작성 모달
│   ├── pages/            # SNS 피드, 내 게시물
│   └── types/            # 게시물 타입 정의
├── qna/                  # Q&A 게시판
│   ├── components/       # 질문 카드, 폼, 페이지네이션, 카테고리 탭
│   ├── pages/            # Q&A 메인 페이지
│   ├── types/            # Q&A 타입 정의
│   └── utils/            # Q&A API
├── landing/              # 랜딩 페이지
│   └── pages/            # 홈 페이지
├── shared/               # 공유 컴포넌트 및 유틸리티
│   ├── components/       # 레이아웃, 헤더, 푸터, 알림
│   ├── constants/        # 네비게이션 상수
│   ├── hooks/            # 공통 훅
│   └── utils/            # Axios 인터셉터, 에러 핸들러
├── routers/              # 라우팅 설정
├── assets/               # 이미지 및 정적 파일
├── App.tsx               # 앱 진입점
└── main.tsx              # React 진입점
```

## 시작하기

### 필수 요구사항
- Node.js 16+
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
VITE_PETWALK_KAKAO_JAVASCRIPT_KEY=your_kakao_maps_api_key
VITE_API_BASE_URL=your_backend_api_url
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 시작되면 브라우저에서 `http://localhost:5173`으로 접속할 수 있습니다.

### 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 프리뷰

```bash
npm run preview
```

빌드된 프로덕션 버전을 로컬에서 미리 볼 수 있습니다.

### 린트

```bash
npm run lint
```

## 주요 라우트

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 페이지 |
| `/login` | 로그인 |
| `/register` | 회원가입 |
| `/my-page` | 마이페이지 |
| `/my-pet` | 내 반려동물 메인 |
| `/health-report/:petId` | 건강 리포트 |
| `/medical-record/:petId` | 의료 기록 |
| `/memories/:petId` | 추억 페이지 |
| `/my-pet/:petId/missions` | 일일 미션 |
| `/pet-walk` | 산책 관리 |
| `/sns` | 펫 SNS 피드 |
| `/sns/my-posts` | 내 게시물 |
| `/qna` | Q&A 게시판 |

## API 통신

프로젝트는 Axios를 사용하여 백엔드 API와 통신합니다.

- **인터셉터**: 자동 토큰 갱신 및 에러 처리
- **에러 핸들링**: 통합 에러 핸들러 (`src/shared/utils/errorHandler.ts`)

## 주요 컴포넌트

### 레이아웃
- **Layout** - 전체 레이아웃 래퍼
- **Header** - 상단 네비게이션
- **Footer** - 하단 푸터

### 모달
- **PetModal** - 반려동물 등록/수정
- **CreatePostModal** - 게시물 작성
- **RouteModal** - 산책 경로 상세
- **QuestionDetailModal** - Q&A 상세
- **MedicalRecordRegisterModal** - 의료 기록 등록
- **ConfirmModal** - 확인 모달

### 차트
- **RadarChart** - 건강 상태 레이더 차트
- **Recharts 통합** - 다양한 데이터 시각화

## 코드 스타일

- ESLint와 TypeScript 엄격 모드 사용
- React 함수형 컴포넌트 및 Hooks 패턴
- 모듈별 관심사 분리 (features 기반 구조)