'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { CreateHubFormData, Hub, Membership } from '@/lib/types';
import { useRequireAuth } from '@/lib/useAuth';

export default function CreateHubPage() {
  useRequireAuth(); // 회원가입 확인

  const router = useRouter();
  const [formData, setFormData] = useState<CreateHubFormData>({
    name: '',
    description: '',
    category: '스터디',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 로그인하지 않은 사용자는 메인으로 리다이렉트
    if (!auth.currentUser) {
      alert('로그인이 필요합니다.');
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

      // Firestore에서 사용자 정보 가져오기
      const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      const userData = userDoc.data();

      // 새 허브 데이터 생성
      const newHub: Omit<Hub, 'id'> = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        ownerId: currentUser.uid,
        ownerName: userData.nickname,
        memberCount: 1, // 생성자가 첫 멤버
        createdAt: new Date(),
      };

      // Firestore에 허브 저장
      const hubDocRef = await addDoc(collection(firestore, 'hubs'), newHub);

      // 소유자의 멤버십 자동 생성
      const ownerMembership: Omit<Membership, 'id'> = {
        userId: currentUser.uid,
        hubId: hubDocRef.id,
        role: 'owner',
        joinedAt: new Date(),
      };
      await addDoc(collection(firestore, 'memberships'), ownerMembership);

      alert('허브가 생성되었습니다!');
      router.push(`/hubs/${hubDocRef.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            새 허브 만들기
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            새로운 스터디, 동아리, 프로젝트 그룹을 시작하세요
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            {/* 허브 이름 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                허브 이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="예: 알고리즘 스터디"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                카테고리
              </label>
              <select
                id="category"
                name="category"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="스터디">스터디</option>
                <option value="동아리">동아리</option>
                <option value="프로젝트">프로젝트</option>
                <option value="취미">취미</option>
                <option value="기타">기타</option>
              </select>
            </div>

            {/* 설명 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                설명
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="허브에 대한 설명을 입력하세요"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/hubs')}
              className="flex-1 py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? '생성 중...' : '허브 만들기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}