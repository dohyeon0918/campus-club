'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, sendSchoolEmailVerification } from '@/lib/firebase';
import { SignUpFormData } from '@/lib/types';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpFormData>({
    nickname: '',
    school: '',
    major: '',
    schoolEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // 로그인하지 않은 사용자는 메인으로 리다이렉트
    if (!auth.currentUser) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      // 학교 이메일 형식 검증 (ac.kr로 끝나야 함)
      if (!formData.schoolEmail.endsWith('.ac.kr')) {
        throw new Error('학교 이메일은 .ac.kr로 끝나야 합니다. (예: student@university.ac.kr)');
      }

      // 회원가입 정보를 로컬 스토리지에 임시 저장
      window.localStorage.setItem('signupData', JSON.stringify({
        ...formData,
        googleEmail: currentUser.email,
        photoURL: currentUser.photoURL,
      }));

      // 학교 이메일로 인증 링크 발송
      const result = await sendSchoolEmailVerification(formData.schoolEmail);

      if (!result.success) {
        throw new Error(result.error || '이메일 발송에 실패했습니다.');
      }

      setEmailSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 이메일 발송 완료 화면
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="text-6xl mb-4">✉️</div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              인증 이메일 발송 완료
            </h2>
            <p className="mt-4 text-gray-600">
              <strong>{formData.schoolEmail}</strong>로 인증 링크를 발송했습니다.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              이메일을 확인하고 인증 링크를 클릭하면 회원가입이 완료됩니다.
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 이메일이 오지 않았나요?
              </p>
              <p className="text-xs text-blue-600 mt-1">
                스팸 메일함을 확인해보세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            학교 이메일 인증 후 서비스를 이용할 수 있습니다
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            {/* 닉네임 */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                닉네임
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="사용할 닉네임"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              />
            </div>

            {/* 학교 */}
            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700">
                학교
              </label>
              <input
                id="school"
                name="school"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="OO대학교"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              />
            </div>

            {/* 전공 */}
            <div>
              <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                전공
              </label>
              <input
                id="major"
                name="major"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="컴퓨터공학과"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              />
            </div>

            {/* 학교 이메일 */}
            <div>
              <label htmlFor="schoolEmail" className="block text-sm font-medium text-gray-700">
                학교 이메일 <span className="text-red-500">*</span>
              </label>
              <input
                id="schoolEmail"
                name="schoolEmail"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="student@university.ac.kr"
                value={formData.schoolEmail}
                onChange={(e) => setFormData({ ...formData, schoolEmail: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">
                학교 웹메일 주소를 입력해주세요 (.ac.kr로 끝나야 합니다)
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? '발송 중...' : '인증 이메일 발송'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem('skipSignup', 'true');
                router.push('/');
              }}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              나중에 하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
