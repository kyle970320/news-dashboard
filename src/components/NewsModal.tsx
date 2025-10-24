import type { NewsRow } from "../types/news";
import dayjs from "dayjs";

interface Props {
  closeModal: () => void;
  data: NewsRow;
}

export default function NewsModal(props: Props) {
  const { closeModal, data } = props;
  return (
    <div
      className="fixed top-0 left-0 z-100 flex items-center justify-center w-screen h-screen bg-[rgba(0,0,0,0.4)]"
      onClick={closeModal}
    >
      <div
        className="w-[80vw] h-[80vh] overflow-auto bg-white"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="mx-auto p-6 bg-white rounded-lg shadow-sm space-y-6">
          <h1 className="text-lg font-semibold border-b pb-3">
            뉴스 상세 보기
          </h1>

          <DetailItem label="제목" value={data.title} />
          <DetailItem label="설명" value={data.description} />

          <DetailItem
            label="등록일"
            value={
              data.created_at
                ? dayjs(data.created_at)
                    .add(9, "hour")
                    .format("YYYY.MM.DD HH:mm")
                : "-"
            }
          />

          <DetailItem
            label="발행일 (UTC)"
            value={
              data.published_utc
                ? dayjs(data.published_utc)
                    .add(9, "hour")
                    .format("YYYY.MM.DD HH:mm")
                : "-"
            }
          />

          <DetailItem
            label="티커"
            value={
              data.tickers?.length ? (
                <div className="flex flex-wrap gap-1">
                  {(data.tickers ?? []).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-xs rounded bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : (
                "-"
              )
            }
          />

          <DetailItem
            label="키워드"
            value={
              data.keywords?.length ? (
                <div className="flex flex-wrap gap-1">
                  {(data.keywords ?? []).map((k) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              ) : (
                "-"
              )
            }
          />

          <DetailItem
            label="링크"
            value={
              data.article_url ? (
                <a
                  href={data.article_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  {data.article_url}
                </a>
              ) : (
                "-"
              )
            }
          />

          <div className="flex">
            <label className="w-1/6 text-sm font-medium text-gray-500 mb-1">
              인사이트
            </label>
            {Array.isArray(data.insights) && data.insights.length > 0 ? (
              <div className="w-5/6 flex flex-wrap gap-1">
                {data.insights.map(
                  (
                    ins: {
                      ticker: string;
                      sentiment: string;
                      sentiment_reasoning: string;
                    },
                    idx: number,
                  ) => (
                    <div
                      key={idx}
                      className={`
                        w-full
                  px-2 py-2 text-xs rounded border
                  ${
                    ins.sentiment === "positive"
                      ? "bg-green-50 text-green-700 border-green-100"
                      : ins.sentiment === "negative"
                        ? "bg-red-50 text-red-700 border-red-100"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                  }
                `}
                    >
                      <div className="flex gap-2">
                        <p className="w-[50px]">티커</p>
                        <p className="text-left">{ins.ticker}</p>
                      </div>
                      <div className="flex gap-2">
                        <p className="w-[50px]">분석</p>
                        <p className="text-left">{ins.sentiment}</p>
                      </div>
                      <div className="flex gap-2">
                        <p className="min-w-[50px]">이유</p>
                        <p className="text-left">{ins.sentiment_reasoning}</p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">-</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-row items-center">
      <label className="w-1/6 text-sm font-medium text-gray-500 mb-1">
        {label}
      </label>
      <div className="w-5/6 text-left text-gray-800 text-sm rounded-md px-3 py-2 border-b-gray-300 border-b bg-gray-50">
        {value || "-"}
      </div>
    </div>
  );
}
