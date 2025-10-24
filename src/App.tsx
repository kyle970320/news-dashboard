import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import NewsPage from "./pages/NewsPage";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";
import LoginForm from "./pages/LoginForm";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        //  네트워크 재연결 시 refetch 여부
        refetchOnReconnect: false,
        //  브라우저 창 포커스 시 refetch (여부 다른 탭에서 우리 앱 탭으로 돌아오면 자동 refetch)
        refetchOnWindowFocus: false,
        // 실패시 재시도 횟수
        retry: 1,
        // 10분마다 마지막 API 호출
        refetchInterval: 10 * 60 * 1000,
        // 이전 데이터와 새 데이터의 구조 비교 후 변경된 부분만 업데이트 (structuralSharing)
        // 컴포넌트 마운트 시 refetch 여부 (reRender 될 때 자동 refetch) (refetchOnMount)
      },
    },
  });

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 세션 불러오기
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // 세션 변경 감시
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="p-8">로딩 중...</div>;
  }

  // 로그인 안 됐으면 로그인 폼 표시
  if (!session) {
    return <LoginForm onLogin={(s) => setSession(s)} />;
  }
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <NewsPage />
      </QueryClientProvider>
    </>
  );
}

export default App;
