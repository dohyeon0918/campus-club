'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { Hub, Membership, User } from '@/lib/types';

export default function HubDetailPage() {
  const router = useRouter();
  const params = useParams();
  const hubId = params.id as string;

  const [hub, setHub] = useState<Hub | null>(null);
  const [members, setMembers] = useState<(Membership & { user: User })[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [membershipId, setMembershipId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHubData();
  }, [hubId]);

  const fetchHubData = async () => {
    try {
      // 허브 정보 가져오기
      const hubDoc = await getDoc(doc(firestore, 'hubs', hubId));
      if (!hubDoc.exists()) {
        alert('허브를 찾을 수 없습니다.');
        router.push('/hubs');
        return;
      }

      const hubData = {
        id: hubDoc.id,
        ...hubDoc.data(),
        createdAt: hubDoc.data().createdAt?.toDate() || new Date(),
      } as Hub;
      setHub(hubData);

      // 멤버십 정보 가져오기
      const membershipsQuery = query(
        collection(firestore, 'memberships'),
        where('hubId', '==', hubId)
      );
      const membershipsSnapshot = await getDocs(membershipsQuery);

      // 각 멤버십의 사용자 정보 가져오기
      const membersData = await Promise.all(
        membershipsSnapshot.docs.map(async (membershipDoc) => {
          const membershipData = membershipDoc.data();
          const userDoc = await getDoc(doc(firestore, 'users', membershipData.userId));

          return {
            id: membershipDoc.id,
            ...membershipData,
            joinedAt: membershipData.joinedAt?.toDate() || new Date(),
            user: userDoc.exists() ? userDoc.data() as User : null,
          };
        })
      );

      setMembers(membersData.filter(m => m.user !== null) as (Membership & { user: User })[]);

      // 현재 사용자의 멤버십 확인
      if (auth.currentUser) {
        const userMembership = membershipsSnapshot.docs.find(
          doc => doc.data().userId === auth.currentUser?.uid
        );
        if (userMembership) {
          setIsMember(true);
          setMembershipId(userMembership.id);
          // 소유자인지 확인
          if (userMembership.data().role === 'owner') {
            setIsOwner(true);
          }
        }
      }
    } catch (error) {
      console.error('허브 정보 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!auth.currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 이미 가입되어 있는지 확인
    if (isMember) {
      alert('이미 가입된 허브입니다.');
      return;
    }

    try {
      // 중복 가입 방지: 한 번 더 확인
      const checkQuery = query(
        collection(firestore, 'memberships'),
        where('hubId', '==', hubId),
        where('userId', '==', auth.currentUser.uid)
      );
      const existingMembership = await getDocs(checkQuery);

      if (!existingMembership.empty) {
        alert('이미 가입된 허브입니다.');
        fetchHubData(); // 상태 재확인
        return;
      }

      // 멤버십 생성
      const newMembership: Omit<Membership, 'id'> = {
        userId: auth.currentUser.uid,
        hubId: hubId,
        role: 'member',
        joinedAt: new Date(),
      };

      await addDoc(collection(firestore, 'memberships'), newMembership);

      // 허브의 멤버 수 증가
      await updateDoc(doc(firestore, 'hubs', hubId), {
        memberCount: increment(1),
      });

      alert('허브에 가입했습니다!');
      fetchHubData(); // 데이터 새로고침
    } catch (error) {
      console.error('가입 실패:', error);
      alert('가입에 실패했습니다.');
    }
  };

  const handleLeave = async () => {
    if (!membershipId) return;

    // 소유자는 탈퇴 불가
    if (isOwner) {
      alert('허브 소유자는 탈퇴할 수 없습니다. 허브를 삭제해주세요.');
      return;
    }

    if (!confirm('정말 탈퇴하시겠습니까?')) return;

    try {
      // 멤버십 삭제
      await deleteDoc(doc(firestore, 'memberships', membershipId));

      // 허브의 멤버 수 감소
      await updateDoc(doc(firestore, 'hubs', hubId), {
        memberCount: increment(-1),
      });

      // 상태 초기화
      setIsMember(false);
      setMembershipId(null);

      alert('허브에서 탈퇴했습니다.');
      fetchHubData(); // 데이터 새로고침
    } catch (error) {
      console.error('탈퇴 실패:', error);
      alert('탈퇴에 실패했습니다.');
    }
  };

  const handleDeleteHub = async () => {
    if (!isOwner) {
      alert('허브 소유자만 삭제할 수 있습니다.');
      return;
    }

    if (!confirm('정말 이 허브를 삭제하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.')) {
      return;
    }

    try {
      // 1. 모든 멤버십 삭제
      const membershipsQuery = query(
        collection(firestore, 'memberships'),
        where('hubId', '==', hubId)
      );
      const membershipsSnapshot = await getDocs(membershipsQuery);
      const deletePromises = membershipsSnapshot.docs.map(doc =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      // 2. 허브 삭제
      await deleteDoc(doc(firestore, 'hubs', hubId));

      alert('허브가 삭제되었습니다.');
      router.push('/hubs');
    } catch (error) {
      console.error('허브 삭제 실패:', error);
      alert('허브 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">허브를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/hubs')}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← 목록으로
          </button>
        </div>

        {/* 허브 정보 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                {hub.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-4">
                {hub.name}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">멤버</p>
              <p className="text-2xl font-bold text-gray-900">{hub.memberCount}명</p>
            </div>
          </div>

          <p className="text-gray-600 mb-6 whitespace-pre-wrap">
            {hub.description}
          </p>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-gray-500">
              개설자: <span className="font-medium text-gray-900">{hub.ownerName}</span>
            </div>

            {auth.currentUser && (
              <div className="flex gap-2">
                {isOwner ? (
                  <button
                    onClick={handleDeleteHub}
                    className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    허브 삭제
                  </button>
                ) : isMember ? (
                  <button
                    onClick={handleLeave}
                    className="px-6 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                  >
                    탈퇴하기
                  </button>
                ) : (
                  <button
                    onClick={handleJoin}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    가입하기
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 게시판 링크 (멤버만 접근 가능) */}
        {isMember && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <button
              onClick={() => router.push(`/hubs/${hubId}/board`)}
              className="w-full p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition text-left"
            >
              <h3 className="text-lg font-semibold text-blue-600 mb-1">📝 게시판</h3>
              <p className="text-sm text-gray-600">멤버들과 소통하고 정보를 공유하세요</p>
            </button>
          </div>
        )}

        {/* 멤버 목록 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            멤버 목록 ({members.length}명)
          </h2>

          {members.length === 0 ? (
            <p className="text-gray-500 text-center py-8">아직 멤버가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {member.user.nickname.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.user.nickname}</p>
                      <p className="text-sm text-gray-500">
                        {member.user.school} · {member.user.major}
                      </p>
                    </div>
                  </div>
                  {member.role === 'owner' && (
                    <span className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full">
                      개설자
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
