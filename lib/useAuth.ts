import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, firestore } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

// 회원가입 완료 여부를 확인하는 커스텀 훅
export function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;

      // 로그인하지 않았으면 메인 페이지로
      if (!user) {
        alert('로그인이 필요합니다.');
        router.push('/');
        return;
      }

      // Firestore에 사용자 데이터가 있는지 확인
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));

      // 데이터가 없으면 = 회원가입 미완료 = 회원가입 페이지로
      if (!userDoc.exists()) {
        alert('회원가입을 완료해주세요.');
        router.push('/signup');
      }
    };

    // Firebase Auth가 초기화될 때까지 기다림
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkAuth();
      } else {
        alert('로그인이 필요합니다.');
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);
}
