### 1. Product Backlog (전체 할 일 목록)

---

### [US-001] 대학생 인증 및 사용자 가입

- **As a** 처음 방문한 사용자,
- **I want to** 학교 웹메일로 학생 인증을 하고 회원가입을 할 수 있다.
- **So that** 신뢰할 수 있는 커뮤니티의 일원이 될 수 있다.

**Sub-Tasks (개발 작업 목록):**

- [ ]  Firebase 프로젝트 생성 및 Authentication(인증) 설정
- [ ]  학교 웹메일로 인증 코드를 보내고 확인하는 로직 구현
- [ ]  Firestore에 `users` 컬렉션 구조 설계 (uid, nickname, school, major, verifiedAt 등)
- [ ]  Firestore 보안 규칙 설정 (인증된 사용자만 `users` 정보 생성 가능)
- [ ]  회원가입/로그인 UI 구현

---

### [US-002] 허브(그룹) 생성 및 탐색

- **As a** 로그인한 사용자,
- **I want to** 새로운 허브를 만들거나, 다른 허브들을 탐색할 수 있다.
- **So that** 내가 원하는 활동을 시작하거나 참여할 수 있다.

**Sub-Tasks (개발 작업 목록):**

- [ ]  Firestore에 `hubs` 컬렉션 구조 설계 (name, description, category, ownerId, memberCount 등)
- [ ]  Firestore 보안 규칙 설정 (허브 생성은 인증된 사용자만 가능, 읽기는 모두에게 허용)
- [ ]  '새 허브 만들기' 양식(Form) UI 및 기능 구현
- [ ]  전체 허브 목록을 보여주는 탐색 페이지 UI 및 기능 구현

---

### [US-003] 허브(그룹) 가입 및 멤버 관리

- **As a** 로그인한 사용자,
- **I want to** 원하는 허브에 가입 신청을 하고 멤버가 될 수 있다.
- **So that** 그룹 활동에 참여할 수 있다.

**Sub-Tasks (개발 작업 목록):**

- [ ]  Firestore에 `memberships` 컬렉션 구조 설계 (userId, hubId, role 등)
- [ ]  Firestore 보안 규칙 설정 (자신이 가입/탈퇴하는 것만 허용)
- [ ]  허브 상세 페이지에 '가입하기/탈퇴하기' 버튼 UI 및 기능 구현
- [ ]  허브 내 멤버 목록을 보여주는 기능 구현

---

### [US-004] 허브 전용 게시판 및 댓글

- **As a** 허브 멤버,
- **I want to** 소속된 허브의 게시판에 글과 댓글을 쓰고 다른 멤버의 글을 읽을 수 있다.
- **So that** 멤버들과 온라인으로 소통하고 정보를 공유할 수 있다.

**Sub-Tasks (개발 작업 목록):**

- [ ]  Firestore에 `posts`와 `comments` 서브컬렉션(Sub-collection) 구조 설계
- [ ]  Firestore 보안 규칙 설정 (읽기/쓰기는 해당 허브의 멤버에게만 허용)
- [ ]  게시글 목록 조회, 상세 조회, 작성 UI 및 기능 구현
- [ ]  댓글 조회, 작성 UI 및 기능 구현

### 3. 기술 스택 (Tech Stack)

- **Backend & DB**: **Firebase** (Firestore, Authentication)
- **Frontend**: Modern JS Framework (예: Next.js)
- **Deployment**: Firebase Hosting 또는 Vercel