export type NewsRow = {
  id: string;
  title: string | null;
  description: string | null;
  keywords: Array<string> | null; // _text
  published_utc: string | null; // timestamptz
  created_at: string | null; // timestamp
  tickers: Array<string> | null; // _text
  article_url: string | null;
  insights: Record<string, string | Array<string>> | null; // jsonb
};
