'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { firestore, auth } from '@/lib/firebase';
import { Hub } from '@/lib/types';
import Link from 'next/link';
import { useRequireAuth } from '@/lib/useAuth';

export default function HubsPage() {
  useRequireAuth(); // 회원가입 확인

  const router = useRouter();
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHubs();
  }, []);

  const fetchHubs = async () => {
    try {
      const hubsQuery = query(
        collection(firestore, 'hubs'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(hubsQuery);
      const hubsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Hub[];

      setHubs(hubsData);
    } catch (error) {
      console.error('허브 목록 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">허브 탐색</h1>
            <p className="mt-2 text-gray-600">관심있는 허브를 찾아보세요</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              홈으로
            </button>
            {auth.currentUser && (
              <button
                onClick={() => router.push('/hubs/create')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                + 새 허브 만들기
              </button>
            )}
          </div>
        </div>

        {/* 허브 목록 */}
        {hubs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">아직 생성된 허브가 없습니다.</p>
            {auth.currentUser && (
              <button
                onClick={() => router.push('/hubs/create')}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                첫 번째 허브 만들기
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hubs.map((hub) => (
              <div
                key={hub.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/hubs/${hub.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                    {hub.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    멤버 {hub.memberCount}명
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {hub.name}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {hub.description}
                </p>

                <div className="flex items-center text-sm text-gray-500">
                  <span>개설자: {hub.ownerName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
