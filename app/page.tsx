import LoginButton from "@/components/LoginButton";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            캠퍼스 클럽
          </h1>
          <p className="text-lg text-gray-600">
            대학생 인증 기반 소모임/스터디/동아리 플랫폼
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              시작하기
            </h2>
            <LoginButton />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            무엇을 할 수 있나요?
          </h3>
          <div className="space-y-3">
            <Link href="/hubs">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                <h4 className="font-medium text-gray-900">📚 허브 탐색</h4>
                <p className="text-sm text-gray-600 mt-1">
                  다양한 스터디, 동아리, 프로젝트 그룹을 찾아보세요
                </p>
              </div>
            </Link>
            <Link href="/hubs/create">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                <h4 className="font-medium text-gray-900">➕ 허브 만들기</h4>
                <p className="text-sm text-gray-600 mt-1">
                  새로운 허브를 만들고 멤버를 모집하세요
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
