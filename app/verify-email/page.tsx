'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, verifyEmailLink, firestore } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { User } from '@/lib/types';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        // URL에서 인증 링크 확인
        const url = window.location.href;
        const result = await verifyEmailLink(url);

        if (!result.success) {
          throw new Error(result.error || '인증에 실패했습니다.');
        }

        // 로컬 스토리지에서 회원가입 정보 가져오기
        const signupDataStr = window.localStorage.getItem('signupData');
        if (!signupDataStr) {
          throw new Error('회원가입 정보를 찾을 수 없습니다. 다시 시도해주세요.');
        }

        const signupData = JSON.parse(signupDataStr);
        const currentUser = auth.currentUser;

        if (!currentUser) {
          throw new Error('인증된 사용자를 찾을 수 없습니다.');
        }

        // Firestore에 사용자 데이터 저장 (회원가입 완료!)
        const userData: User = {
          uid: currentUser.uid,
          email: signupData.googleEmail || currentUser.email || '',
          schoolEmail: result.email || signupData.schoolEmail,
          nickname: signupData.nickname,
          school: signupData.school,
          major: signupData.major,
          photoURL: signupData.photoURL || currentUser.photoURL || undefined,
          createdAt: new Date(),
        };

        await setDoc(doc(firestore, 'users', currentUser.uid), userData);

        // 로컬 스토리지 정리
        window.localStorage.removeItem('signupData');

        setStatus('success');

        // 3초 후 메인 페이지로 이동
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } catch (err: any) {
        console.error('인증 오류:', err);
        setError(err.message);
        setStatus('error');
      }
    };

    verify();
  }, [router]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-900">이메일 인증 중...</h2>
          <p className="mt-2 text-gray-600">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900">인증 실패</h2>
          <p className="mt-4 text-red-600">{error}</p>
          <button
            onClick={() => router.push('/signup')}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            회원가입 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-900">회원가입 완료!</h2>
        <p className="mt-4 text-gray-600">
          학교 이메일 인증이 완료되었습니다.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          잠시 후 메인 페이지로 이동합니다...
        </p>
      </div>
    </div>
  );
}
