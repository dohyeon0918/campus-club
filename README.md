# 🎓 Campus Club (캠퍼스 클럽)

대학생 인증 기반 소모임/스터디/동아리 플랫폼

## 📋 프로젝트 소개

대학생들이 자유롭게 소모임(허브)을 만들고, 참여하며, 소통할 수 있는 플랫폼입니다.

## ✨ 주요 기능

- 🔐 **Google 소셜 로그인** - Firebase Authentication
- 🏫 **대학생 인증** - 학교 웹메일 인증 (예정)
- 👥 **허브(소모임) 관리** - 생성, 가입, 탈퇴
- 📝 **게시판 시스템** - 허브별 게시글 작성 및 댓글
- 💬 **실시간 업데이트** - Firestore 실시간 데이터베이스

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링

### Backend
- **Firebase**
  - Authentication - 사용자 인증
  - Firestore - NoSQL 데이터베이스
  - Security Rules - 보안 규칙

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/dohyeon0918/campus-club.git
cd campus-club
```

### 2. 패키지 설치

```bash
npm install
```

### 3. Firebase 설정

`.env.local` 파일 생성 후 Firebase 설정 추가:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 📂 프로젝트 구조

```
campus-club/
├── app/                  # Next.js App Router
│   ├── hubs/            # 허브 관련 페이지
│   ├── signup/          # 회원가입
│   └── page.tsx         # 메인 페이지
├── components/          # 재사용 컴포넌트
├── lib/                 # 유틸리티 및 타입
│   ├── firebase.ts      # Firebase 설정
│   └── types.ts         # TypeScript 타입
├── firestore.rules      # Firestore 보안 규칙
└── firestore.indexes.json  # Firestore 인덱스
```

## 🔐 보안 규칙

Firestore 보안 규칙이 적용되어 있어 인증된 사용자만 데이터에 접근할 수 있습니다.

## 📝 개발 계획

자세한 개발 계획은 [PLAN.md](./plan.md)를 참고하세요.

## 👨‍💻 개발자

- [@dohyeon0918](https://github.com/dohyeon0918)

## 📄 라이선스

MIT License
