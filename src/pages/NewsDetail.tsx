import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { insight, NewsRow, sentimentInsight } from "../types/news";
import { supabase } from "../lib/supabase";
// import dayjs from "dayjs";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Brain,
  Calendar,
  ExternalLink,
  Minus,
  Sparkles,
  Tag,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export default function NewsDetail() {
  const { id } = useParams();
  const [newsData, setNewsData] = useState<NewsRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .eq("id", id)
          .single(); // 한 행만 반환

        if (error) throw error;
        setNewsData(data);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchNews();
  }, [id]);
  console.log({ newsData });
  const getSentimentIcon = (score: number) => {
    if (score > 0.6) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (score < 0.4) return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-yellow-600" />;
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.6) return "bg-green-100 text-green-800 border-green-200";
    if (score < 0.4) return "bg-red-100 text-red-800 border-red-200";
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const getSentimentBadgeColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-300";
      case "negative":
        return "bg-red-100 text-red-800 border-red-300";
      case "neutral":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "긍정";
      case "negative":
        return "부정";
      case "neutral":
        return "중립";
      default:
        return sentiment;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderInsightValue = (
    value: sentimentInsight | Array<sentimentInsight>,
  ) => {
    if (Array.isArray(value)) {
      return (
        <ul className="space-y-2 mt-2">
          {value.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-700">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>{item.base_sentiment}</span>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p className="text-slate-700 mt-2">
        {<span>{value.base_sentiment}</span>}
      </p>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!newsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">뉴스를 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-700" />
            </button>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900">뉴스 상세</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 메인 컨텐츠 */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* 제목 섹션 */}
          <div className="p-6 sm:p-8 border-b border-slate-200">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 leading-tight">
              {newsData.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(newsData.published_utc)}</span>
              </div>
              {newsData.article_url && (
                <a
                  href={newsData.article_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  원문 보기
                </a>
              )}
            </div>
          </div>
          {/* 티커 및 키워드 */}
          <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50">
            <div className="grid sm:grid-cols-2 gap-6">
              {newsData.tickers && newsData.tickers.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    관련 티커
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {newsData.tickers.map((ticker, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white shadow-sm"
                      >
                        {ticker}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {newsData.keywords && newsData.keywords.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    키워드
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {newsData.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-slate-700 border border-slate-300"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* 본문 */}
          {newsData.description && (
            <div className="p-6 sm:p-8 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">본문</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {newsData.description}
              </p>
            </div>
          )}
          {/* 감정 분석 */}
          <div className="p-6 sm:p-8 border-b border-slate-200 bg-gradient-to-br from-purple-50 to-pink-50">
            {Array.isArray(newsData.sentiment_insights) &&
              newsData.sentiment_insights.length > 0 &&
              newsData.sentiment_insights.map((el) => {
                return (
                  <div className="mb-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI 감정 분석
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                        <div className="text-xs text-slate-600 mb-2 font-medium">
                          감정 점수
                        </div>
                        <div
                          className={`text-2xl font-bold flex items-center justify-center gap-2 ${
                            el.score > 0.6
                              ? "text-green-600"
                              : el.score < 0.4
                                ? "text-red-600"
                                : "text-yellow-600"
                          }`}
                        >
                          {getSentimentIcon(el.score)}
                          {el.score.toFixed(0)}%
                        </div>
                        <div
                          className={`mt-2 inline-block px-2 py-1 rounded-md text-xs font-medium ${getSentimentColor(el.score)}`}
                        >
                          {getSentimentLabel(el.base_sentiment)}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                        <div className="text-xs text-slate-600 mb-2 font-medium">
                          모델 신뢰도
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {(el.conf_model * 100).toFixed(0)}%
                        </div>
                        <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${el.conf_model * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                        <div className="text-xs text-slate-600 mb-2 font-medium">
                          규칙 신뢰도
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {(el.conf_rule * 100).toFixed(0)}%
                        </div>
                        <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${el.conf_rule * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                        <div className="text-xs text-slate-600 mb-2 font-medium">
                          분석 이유
                        </div>
                        <div
                          className={`mx-auto text-sm font-semibold ${getSentimentColor(el.score)}`}
                        >
                          {el.reasoning}
                        </div>
                      </div>
                    </div>
                    {el.sentiment_reasoning && (
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          분석 근거
                        </h4>
                        <p className="text-slate-700 leading-relaxed">
                          {el.sentiment_reasoning}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* 감정 인사이트 */}
          {newsData.insights && (
            <div className="p-6 sm:p-8 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                감정 인사이트
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {Array.isArray(newsData.insights) &&
                  newsData.insights.length > 0 &&
                  newsData.insights.map((el: insight, index) => {
                    return (
                      <div
                        key={index}
                        className={`rounded-xl p-5 border ${getSentimentBadgeColor(el.sentiment)}`}
                      >
                        <h4 className="text-sm font-bold mb-2">
                          {el.sentiment}
                        </h4>
                        <span className="mt-1 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm border-2">
                          {el.ticker}
                        </span>
                        <p className="mt-2">{el.sentiment_reasoning}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* 메타 정보 */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="text-xs text-slate-500 flex flex-wrap gap-4">
            <span>뉴스 ID: {newsData.id}</span>
            <span>•</span>
            <span>생성: {formatDate(newsData.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
