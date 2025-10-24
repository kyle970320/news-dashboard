import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type { NewsRow } from "../types/news";

type SortKey = "published_utc" | "created_at";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

export default function NewsTable() {
  const [rows, setRows] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);

  const [q, setQ] = useState("");
  const [ticker, setTicker] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("published_utc");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const tickersArray = useMemo(
    () =>
      ticker
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean),
    [ticker],
  );

  async function fetchRows() {
    setLoading(true);

    let query = supabase
      .from("news")
      .select("*", { count: "exact" })
      .order(sortKey, { ascending: sortDir === "asc" })
      .range(from, to);

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (tickersArray.length > 0) {
      const list = tickersArray.join(",");
      // 배열 교집합(ov: overlaps)
      query = query.filter("tickers", "ov", `{${list}}`);
    }

    const { data, count, error } = await query;
    if (error) console.error(error);

    setRows((data as NewsRow[]) ?? []);
    setTotal(count ?? null);
    setLoading(false);
  }

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, ticker, sortKey, sortDir]);

  const totalPages = total ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : 1;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">News Dashboard</h1>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-sm text-gray-500">검색(제목/설명)</label>
          <input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="e.g. FDA, acquisition..."
            className="px-3 py-2 rounded border border-gray-300 min-w-64"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-500">티커(콤마 구분)</label>
          <input
            value={ticker}
            onChange={(e) => {
              setPage(1);
              setTicker(e.target.value);
            }}
            placeholder="AAPL, TSLA"
            className="px-3 py-2 rounded border border-gray-300 min-w-56 uppercase"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-500">정렬 기준</label>
          <select
            value={sortKey}
            onChange={(e) => {
              setPage(1);
              setSortKey(e.target.value as SortKey);
            }}
            className="px-3 py-2 rounded border border-gray-300"
          >
            <option value="published_utc">published_utc</option>
            <option value="created_at">created_at</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-500">정렬 방향</label>
          <select
            value={sortDir}
            onChange={(e) => {
              setPage(1);
              setSortDir(e.target.value as SortDir);
            }}
            className="px-3 py-2 rounded border border-gray-300"
          >
            <option value="desc">desc</option>
            <option value="asc">asc</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="min-w-[960px] w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2 w-[28rem]">Title</th>
              <th className="px-3 py-2">Tickers</th>
              <th className="px-3 py-2">Keywords</th>
              <th className="px-3 py-2">Published (UTC)</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Insights</th>
              <th className="px-3 py-2">Link</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading && (
              <tr>
                <td className="px-3 py-4" colSpan={7}>
                  불러오는 중…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-gray-500" colSpan={7}>
                  데이터가 없습니다.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-3 py-2">
                    <div className="line-clamp-2 font-medium">
                      {r.title ?? "-"}
                    </div>
                    {r.description && (
                      <div className="text-gray-500 text-xs line-clamp-2">
                        {r.description}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {(r.tickers ?? []).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 text-xs rounded bg-indigo-50 text-indigo-700 border border-indigo-100"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {(r.keywords ?? []).map((k) => (
                        <span
                          key={k}
                          className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {r.published_utc
                      ? new Date(r.published_utc).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {r.created_at
                      ? new Date(r.created_at).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-3 py-2">
                    <pre className="text-xs text-gray-600 max-w-[22rem] whitespace-pre-wrap line-clamp-3">
                      {r.insights ? previewJSON(r.insights) : "-"}
                    </pre>
                  </td>
                  <td className="px-3 py-2">
                    {r.article_url ? (
                      <a
                        href={r.article_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        Open
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {total === null ? "—" : `${total} rows`}
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 rounded border disabled:opacity-50"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            이전
          </button>
          <span className="px-2 py-1.5 text-sm text-gray-700">
            {page} / {totalPages}
          </span>
          <button
            className="px-3 py-1.5 rounded border disabled:opacity-50"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}

function previewJSON(obj: Record<string, string | Array<string>>) {
  try {
    const s = JSON.stringify(obj, null, 2);
    return s.length > 600 ? s.slice(0, 600) + " …" : s;
  } catch {
    return String(obj);
  }
}
