# 호외요 호외 - 주식 뉴스 AI 분석 대시보드

주식 뉴스 정보를 AI로 분석하여 호재/악재 여부를 실시간으로 보여주는 대시보드 애플리케이션입니다.

## 📋 프로젝트 개요

이 프로젝트는 주식 관련 뉴스를 수집하고, AI를 활용하여 각 뉴스의 감정(sentiment)을 분석하여 호재(긍정), 악재(부정), 중립으로 분류합니다. 사용자는 대시보드를 통해 최신 뉴스를 확인하고, 티커별로 상세한 AI 분석 결과를 확인할 수 있습니다.

## ✨ 주요 기능

### 1. 뉴스 목록 조회
- 최신 뉴스를 시간순으로 정렬하여 표시
- 무한 스크롤을 통한 효율적인 데이터 로딩
- 데스크톱: 테이블 뷰, 모바일/태블릿: 카드 뷰로 반응형 디자인

### 2. 뉴스 검색
- 제목 및 본문 내용 기반 실시간 검색
- 검색 결과 즉시 반영

### 3. 뉴스 상세 보기
- 뉴스 제목, 본문, 발행일, 원문 링크 확인
- 관련 티커 및 키워드 표시
- AI 감정 분석 상세 결과 확인

### 4. AI 감정 분석
- **감정 점수**: 0-100% 범위의 감정 점수
- **모델 신뢰도**: AI 모델의 분석 신뢰도
- **규칙 신뢰도**: 규칙 기반 분석의 신뢰도
- **분석 근거**: 감정 분석의 상세한 근거 설명
- **티커별 분석**: 각 주식 티커별 개별 감정 분석

### 5. 감정 분류
- **긍정 (Positive)**: 호재로 분류되는 뉴스
- **부정 (Negative)**: 악재로 분류되는 뉴스
- **중립 (Neutral)**: 중립적인 뉴스

## 🛠 기술 스택

### Frontend
- **React 19**: 최신 React 버전 사용
- **TypeScript**: 타입 안정성 보장
- **Vite**: 빠른 개발 서버 및 빌드 도구
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **TanStack Query**: 서버 상태 관리 및 캐싱
- **Zustand**: 클라이언트 상태 관리
- **Lucide React**: 아이콘 라이브러리

### Backend & Database
- **Supabase**: 백엔드 및 데이터베이스 서비스
  - 인증 시스템 (현재 비활성화)

### 기타
- **Axios**: HTTP 클라이언트
- **Day.js**: 날짜/시간 처리
- **Immer**: 불변성 관리

## 📁 프로젝트 구조

```
newsDashboard/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   └── NewsModal.tsx    # 뉴스 상세 모달 (미사용)
│   ├── config/              # 설정 파일
│   │   └── api.ts           # API 인스턴스 설정
│   ├── lib/                 # 라이브러리 설정
│   │   └── supabase.ts      # Supabase 클라이언트
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── NewsPage.tsx     # 메인 뉴스 목록 페이지
│   │   ├── NewsTable.tsx    # 뉴스 테이블 컴포넌트
│   │   ├── NewsDetail.tsx   # 뉴스 상세 페이지
│   │   └── LoginForm.tsx    # 로그인 폼 (현재 비활성화)
│   ├── types/               # TypeScript 타입 정의
│   │   └── news.ts          # 뉴스 관련 타입
│   ├── App.tsx              # 메인 앱 컴포넌트
│   ├── Router.tsx           # 라우팅 설정
│   └── main.tsx             # 앱 진입점
├── public/                  # 정적 파일
├── package.json             # 프로젝트 의존성
├── vite.config.ts           # Vite 설정
├── tailwind.config.js       # Tailwind CSS 설정
└── tsconfig.json            # TypeScript 설정
```

## 🚀 시작하기

### 필수 요구사항
- Node.js 18 이상
- pnpm (권장) 또는 npm/yarn


## 📊 데이터 구조

### NewsRow 타입
```typescript
{
  id: string;                    // 뉴스 고유 ID
  title: string;                 // 뉴스 제목
  description: string;           // 뉴스 본문
  keywords: string[];            // 키워드 배열
  published_utc: string;         // 발행일 (UTC)
  created_at: string;            // 생성일
  tickers: string[];             // 관련 주식 티커 배열
  article_url: string;           // 원문 링크
  insights: insight[];           // 티커별 감정 인사이트
  sentiment_insights: sentimentInsight[];  // AI 감정 분석 결과
  sentiment_score: number;      // 감정 점수
  sentiment_confidence_model: number;  // 모델 신뢰도
  sentiment_confidence_rule: number;    // 규칙 신뢰도
  sentiment_reasoning: string;   // 분석 근거
}
```

### SentimentInsight 타입
```typescript
{
  ticker: string;                // 주식 티커
  score: number;                 // 감정 점수 (0-1)
  base_sentiment: string;         // 기본 감정 (positive/negative/neutral)
  conf_model: number;            // 모델 신뢰도 (0-1)
  conf_rule: number;             // 규칙 신뢰도 (0-1)
  reasoning: string;             // 분석 이유
  sentiment_reasoning: string;    // 상세 분석 근거
}
```

## 🔧 설정

### TanStack Query 설정
- 자동 refetch 간격: 10분
- 재시도 횟수: 1회
- 브라우저 포커스 시 refetch 비활성화
- 네트워크 재연결 시 refetch 비활성화

### Supabase 설정
- 세션 지속성 활성화
- 실시간 구독 지원


**호외요 호외** - 주식 뉴스를 AI로 분석하여 더 스마트한 투자 결정을 돕습니다. 
