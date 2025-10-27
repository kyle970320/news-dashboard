export type NewsRow = {
  id: string;
  title: string | null;
  description: string | null;
  keywords: Array<string> | null; // _text
  published_utc: string | null; // timestamptz
  created_at: string | null; // timestamp
  tickers: Array<string> | null; // _text
  article_url: string | null;
  insights: Record<string, insight | Array<insight>> | null; // jsonb
  sentiment_insights: Record<
    string,
    sentimentInsight | Array<sentimentInsight>
  > | null;
  sentiment_score: number;
  sentiment_confidence_model: number;
  sentiment_confidence_rule: number;
  sentiment_reasoning: string;
};

export type insight = {
  sentiment: string;
  sentiment_reasoning: string;
  ticker: string;
};

export type sentimentInsight = {
  base_sentiment: string;
  conf_model: number;
  conf_rule: number;
  index: number;
  reasoning: string;
  score: number;
  text: string;
  ticker: string;
};
