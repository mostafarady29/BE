export interface News {
  id: number;
  title: string;
  content: string;
  tag: string | null;
  image_url: string | null;
  created_at: string;
  is_published?: boolean; // used in dashboard
  is_featured?: boolean;
}

export interface NewsResponse {
  success: boolean;
  data: News[];
  page?: number;
  limit?: number;
  total?: number;
}

export interface SingleNewsResponse {
  success: boolean;
  data: News;
}
