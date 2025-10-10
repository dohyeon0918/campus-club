import { initializeApp } from 'firebase/app';
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase 설정 객체
// Firebase Console에서 프로젝트 설정 > 일반 > 내 앱에서 확인 가능
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Authentication 서비스
export const auth = getAuth(app);

// Firestore 데이터베이스
export const firestore = getFirestore(app);

// 이메일 인증 링크 발송
export async function sendSchoolEmailVerification(schoolEmail: string) {
  const actionCodeSettings = {
    // 인증 완료 후 리다이렉트될 URL
    url: `${window.location.origin}/verify-email`,
    handleCodeInApp: true,
  };

  try {
    await sendSignInLinkToEmail(auth, schoolEmail, actionCodeSettings);
    // 이메일을 로컬 스토리지에 저장 (나중에 확인용)
    window.localStorage.setItem('emailForSignIn', schoolEmail);
    return { success: true };
  } catch (error: any) {
    console.error('이메일 발송 오류:', error);
    return { success: false, error: error.message };
  }
}

// 이메일 링크로 인증 확인
export async function verifyEmailLink(url: string) {
  if (!isSignInWithEmailLink(auth, url)) {
    return { success: false, error: '유효하지 않은 인증 링크입니다.' };
  }

  // 로컬 스토리지에서 이메일 가져오기
  let email = window.localStorage.getItem('emailForSignIn');

  if (!email) {
    // 사용자에게 이메일 입력 요청
    email = window.prompt('확인을 위해 이메일 주소를 입력해주세요');
  }

  if (!email) {
    return { success: false, error: '이메일이 필요합니다.' };
  }

  try {
    await signInWithEmailLink(auth, email, url);
    window.localStorage.removeItem('emailForSignIn');
    return { success: true, email };
  } catch (error: any) {
    console.error('인증 오류:', error);
    return { success: false, error: error.message };
  }
}