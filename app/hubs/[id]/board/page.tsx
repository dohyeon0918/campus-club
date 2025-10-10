'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { Post } from '@/lib/types';
import { useRequireAuth } from '@/lib/useAuth';

export default function BoardPage() {
  useRequireAuth(); // 회원가입 확인

  const router = useRouter();
  const params = useParams();
  const hubId = params.id as string;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    checkMembership();
    fetchPosts();
  }, [hubId]);

  const checkMembership = async () => {
    if (!auth.currentUser) {
      alert('로그인이 필요합니다.');
      router.push(`/hubs/${hubId}`);
      return;
    }

    const membershipsQuery = query(
      collection(firestore, 'memberships'),
      where('hubId', '==', hubId),
      where('userId', '==', auth.currentUser.uid)
    );
    const snapshot = await getDocs(membershipsQuery);

    if (snapshot.empty) {
      alert('허브 멤버만 게시판에 접근할 수 있습니다.');
      router.push(`/hubs/${hubId}`);
    } else {
      setIsMember(true);
    }
  };

  const fetchPosts = async () => {
    try {
      const postsQuery = query(
        collection(firestore, 'posts'),
        where('hubId', '==', hubId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(postsQuery);
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Post[];

      setPosts(postsData);
    } catch (error) {
      console.error('게시글 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !isMember) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => router.push(`/hubs/${hubId}`)}
              className="text-blue-600 hover:text-blue-700 mb-2"
            >
              ← 허브로 돌아가기
            </button>
            <h1 className="text-3xl font-bold text-gray-900">게시판</h1>
          </div>
          <button
            onClick={() => router.push(`/hubs/${hubId}/board/create`)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            글쓰기
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">아직 게시글이 없습니다.</p>
            <button
              onClick={() => router.push(`/hubs/${hubId}/board/create`)}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              첫 게시글 작성하기
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md divide-y">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => router.push(`/hubs/${hubId}/board/${post.id}`)}
                className="p-6 hover:bg-gray-50 cursor-pointer transition"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {post.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>{post.authorName}</span>
                    <span>{post.createdAt.toLocaleDateString()}</span>
                  </div>
                  <span>댓글 {post.commentCount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
