// Firestore users 컬렉션의 사용자 정보 타입
export interface User {
  uid: string;           // Firebase Authentication UID (고유 ID)
  email: string;         // 이메일
  nickname: string;      // 닉네임
  school: string;        // 학교
  major: string;         // 전공
  photoURL?: string;     // 프로필 사진 (optional)
  createdAt: Date;       // 가입일
}

// 회원가입 폼 데이터 타입
export interface SignUpFormData {
  nickname: string;
  school: string;
  major: string;
}

// Firestore hubs 컬렉션의 허브(그룹) 정보 타입
export interface Hub {
  id: string;              // 허브 고유 ID (Firestore 문서 ID)
  name: string;            // 허브 이름
  description: string;     // 허브 설명
  category: string;        // 카테고리 (예: 스터디, 동아리, 프로젝트 등)
  ownerId: string;         // 허브 소유자 UID
  ownerName: string;       // 허브 소유자 닉네임
  memberCount: number;     // 멤버 수
  createdAt: Date;         // 생성일
}

// 허브 생성 폼 데이터 타입
export interface CreateHubFormData {
  name: string;
  description: string;
  category: string;
}

// Firestore memberships 컬렉션의 멤버십 정보 타입
export interface Membership {
  id: string;           // 멤버십 고유 ID (Firestore 문서 ID)
  userId: string;       // 사용자 UID
  hubId: string;        // 허브 ID
  role: 'member' | 'owner';  // 역할 (멤버 또는 소유자)
  joinedAt: Date;       // 가입일
}

// Firestore posts 컬렉션의 게시글 정보 타입
export interface Post {
  id: string;           // 게시글 고유 ID (Firestore 문서 ID)
  hubId: string;        // 허브 ID
  authorId: string;     // 작성자 UID
  authorName: string;   // 작성자 닉네임
  title: string;        // 제목
  content: string;      // 내용
  commentCount: number; // 댓글 수
  createdAt: Date;      // 작성일
}

// Firestore comments 컬렉션의 댓글 정보 타입
export interface Comment {
  id: string;           // 댓글 고유 ID (Firestore 문서 ID)
  postId: string;       // 게시글 ID
  authorId: string;     // 작성자 UID
  authorName: string;   // 작성자 닉네임
  content: string;      // 내용
  createdAt: Date;      // 작성일
}

// 게시글 작성 폼 데이터 타입
export interface CreatePostFormData {
  title: string;
  content: string;
}
