'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, increment, orderBy } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { Post, Comment } from '@/lib/types';
import { useRequireAuth } from '@/lib/useAuth';

export default function PostDetailPage() {
  useRequireAuth(); // 회원가입 확인

  const router = useRouter();
  const params = useParams();
  const hubId = params.id as string;
  const postId = params.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPostAndComments();
  }, [postId]);

  const fetchPostAndComments = async () => {
    try {
      // 게시글 가져오기
      const postDoc = await getDoc(doc(firestore, 'posts', postId));
      if (!postDoc.exists()) {
        alert('게시글을 찾을 수 없습니다.');
        router.push(`/hubs/${hubId}/board`);
        return;
      }

      const postData = {
        id: postDoc.id,
        ...postDoc.data(),
        createdAt: postDoc.data().createdAt?.toDate() || new Date(),
      } as Post;
      setPost(postData);

      // 댓글 가져오기
      const commentsQuery = query(
        collection(firestore, 'comments'),
        where('postId', '==', postId),
        orderBy('createdAt', 'asc')
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsData = commentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Comment[];

      setComments(commentsData);
    } catch (error) {
      console.error('데이터 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!auth.currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    setSubmitting(true);

    try {
      const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
      if (!userDoc.exists()) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      const userData = userDoc.data();

      const newCommentData: Omit<Comment, 'id'> = {
        postId: postId,
        authorId: auth.currentUser.uid,
        authorName: userData.nickname,
        content: newComment,
        createdAt: new Date(),
      };

      await addDoc(collection(firestore, 'comments'), newCommentData);

      // 게시글의 댓글 수 증가
      await updateDoc(doc(firestore, 'posts', postId), {
        commentCount: increment(1),
      });

      setNewComment('');
      fetchPostAndComments(); // 새로고침
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">게시글을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/hubs/${hubId}/board`)}
            className="text-blue-600 hover:text-blue-700"
          >
            ← 게시판으로
          </button>
        </div>

        {/* 게시글 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b">
            <span>{post.authorName}</span>
            <span>{post.createdAt.toLocaleString()}</span>
            <span>댓글 {post.commentCount}</span>
          </div>

          <div className="text-gray-800 whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {/* 댓글 목록 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            댓글 {comments.length}
          </h2>

          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">첫 댓글을 작성해보세요!</p>
          ) : (
            <div className="space-y-4 mb-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">{comment.authorName}</span>
                    <span className="text-sm text-gray-500">
                      {comment.createdAt.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-800">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* 댓글 작성 */}
          {auth.currentUser && (
            <form onSubmit={handleSubmitComment} className="border-t pt-4">
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-2 text-gray-900"
                rows={3}
                placeholder="댓글을 입력하세요"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {submitting ? '작성 중...' : '댓글 작성'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
