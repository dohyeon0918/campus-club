'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { collection, addDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { CreatePostFormData, Post } from '@/lib/types';

export default function CreatePostPage() {
  const router = useRouter();
  const params = useParams();
  const hubId = params.id as string;

  const [formData, setFormData] = useState<CreatePostFormData>({
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkMembership();
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
      alert('허브 멤버만 게시글을 작성할 수 있습니다.');
      router.push(`/hubs/${hubId}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
      }

      const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      const userData = userDoc.data();

      const newPost: Omit<Post, 'id'> = {
        hubId: hubId,
        authorId: currentUser.uid,
        authorName: userData.nickname,
        title: formData.title,
        content: formData.content,
        commentCount: 0,
        createdAt: new Date(),
      };

      const postDocRef = await addDoc(collection(firestore, 'posts'), newPost);

      alert('게시글이 작성되었습니다!');
      router.push(`/hubs/${hubId}/board/${postDocRef.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/hubs/${hubId}/board`)}
            className="text-blue-600 hover:text-blue-700 mb-2"
          >
            ← 게시판으로
          </button>
          <h1 className="text-3xl font-bold text-gray-900">글쓰기</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목
              </label>
              <input
                id="title"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="제목을 입력하세요"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                내용
              </label>
              <textarea
                id="content"
                required
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="내용을 입력하세요"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => router.push(`/hubs/${hubId}/board`)}
              className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? '작성 중...' : '작성하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
