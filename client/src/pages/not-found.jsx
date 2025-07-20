import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m6 5H3a2 2 0 01-2-2V5a2 2 0 012-2h18a2 2 0 012 2v14a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">페이지를 찾을 수 없어요</h1>
        <p className="text-gray-600 mb-8">요청하신 페이지가 존재하지 않습니다.</p>
        <Link href="/">
          <button className="btn btn-primary">홈으로 돌아가기</button>
        </Link>
      </div>
    </div>
  );
}