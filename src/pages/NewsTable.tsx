import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { NewsRow } from "../types/news";
import { Loader2, Search, Sparkles, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NewsTable() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState<number | null>(null);

  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const observerTarget = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 10;

  const fetchRows = useCallback(
    async (pageNum: number, reset = false) => {
      if (loading) return;

      setLoading(true);
      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("news")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (q) {
        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      }

      // 필터 적용 (AI 분석 여부)
      // 실제로는 .filter("ai_analyzed", "eq", true/false) 사용

      const { data, count, error } = await query;
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const newRows = (data as NewsRow[]) ?? [];

      // 필터링 (실제로는 DB에서 처리하는게 좋지만, 데모용으로 클라이언트에서 처리)
      const filteredRows = newRows.filter(() => {
        return true;
      });

      if (reset) {
        setRows(filteredRows);
      } else {
        setRows((prev) => [...prev, ...filteredRows]);
      }

      setTotal(count ?? null);
      setHasMore(filteredRows.length === PAGE_SIZE && (count ?? 0) > to + 1);
      setLoading(false);
    },
    [q, loading, PAGE_SIZE],
  );

  // 초기 로드 및 필터/검색 변경 시
  useEffect(() => {
    setRows([]);
    setPage(0);
    setHasMore(true);
    fetchRows(0, true);
  }, [q]);

  // 무한 스크롤
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading]);

  // 페이지 변경 시 데이터 로드
  useEffect(() => {
    if (page > 0) {
      fetchRows(page, false);
    }
  }, [page]);

  const handleSearch = () => {
    setQ(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  const getTimeAgo = (dateString: string) => {
    // 1) 마이크로초(.dddddd) → 밀리초(.ddd)로 정규화 (Safari 호환)
    let s = dateString.replace(/(\.\d{3})\d+$/, "$1");

    // 2) 타임존 표기가 없으면(끝에 Z나 +09:00 같은 오프셋이 없으면) UTC로 가정해 Z 추가
    if (!/[zZ]$/.test(s) && !/[+-]\d{2}:\d{2}$/.test(s)) {
      s += "Z";
    }

    const date = new Date(s); // UTC 표기면 자동으로 로컬(KST)로 변환됨
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "방금 전";
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString("ko-KR");
  };
  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">
                주식 뉴스 대시보드
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              {total !== null && `전체 ${total}건`}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 검색 및 필터 */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="뉴스 제목, 내용 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-20 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 데스크톱 테이블 뷰 */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    티커
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    분석
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    AI 분석
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors"
                    onClick={() => navigate(`/${item.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900 mb-1 ellipsis-2-line">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {getTimeAgo(item.created_at || "")}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {item.tickers?.map((ticker, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {ticker}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(item.insights) &&
                        item.insights.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.insights.map(
                              (
                                ins: {
                                  ticker: string;
                                  sentiment: string;
                                  sentiment_reasoning: string;
                                },
                                idx: number,
                              ) => (
                                <span
                                  key={idx}
                                  className={`
            px-2 py-0.5 text-xs rounded border
            ${
              ins.sentiment === "positive"
                ? "bg-green-50 text-green-700 border-green-100"
                : ins.sentiment === "negative"
                  ? "bg-red-50 text-red-700 border-red-100"
                  : "bg-gray-100 text-gray-700 border-gray-200"
            }
          `}
                                  title={ins.sentiment_reasoning} // 마우스오버 시 이유 표시
                                >
                                  {ins.ticker} – {ins.sentiment}
                                </span>
                              ),
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.sentiment_insights ? (
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-200">
                          <span className="text-slate-400 text-xs">-</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 모바일/태블릿 카드 뷰 */}
        <div className="lg:hidden space-y-4">
          {rows.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow"
              onClick={() => navigate(`/${item.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 flex-1 pr-3 ellipsis-2-line">
                  {item.title}
                </h3>
                {item?.sentiment_insights && (
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 mb-3">
                {getTimeAgo(item?.created_at || "")}
              </p>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1.5">
                    티커
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item?.tickers?.map((ticker, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {ticker}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1.5">
                    분석
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(item.insights) &&
                    item.insights.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.insights.map(
                          (
                            ins: {
                              ticker: string;
                              sentiment: string;
                              sentiment_reasoning: string;
                            },
                            idx: number,
                          ) => (
                            <span
                              key={idx}
                              className={`
           inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium
            ${
              ins.sentiment === "positive"
                ? "bg-green-50 text-green-700 border-green-100"
                : ins.sentiment === "negative"
                  ? "bg-red-50 text-red-700 border-red-100"
                  : "bg-gray-100 text-gray-700 border-gray-200"
            }
          `}
                              title={ins.sentiment_reasoning} // 마우스오버 시 이유 표시
                            >
                              {ins.ticker} – {ins.sentiment}
                            </span>
                          ),
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 로딩 인디케이터 */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {/* 무한 스크롤 트리거 */}
        <div ref={observerTarget} className="h-4" />

        {/* 더 이상 데이터 없음 */}
        {!hasMore && rows.length > 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">모든 뉴스를 불러왔습니다</p>
          </div>
        )}

        {/* 결과 없음 */}
        {!loading && rows.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Search className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">검색 결과가 없습니다</p>
            <p className="text-slate-500 text-sm mt-1">
              다른 검색어나 필터를 시도해보세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
