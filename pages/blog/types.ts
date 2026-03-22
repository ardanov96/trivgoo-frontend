export interface BlogPost {
  id:          number;
  title:       string;
  excerpt:     string;
  content:     string;
  author:      { name: string; avatar: string; role: string };
  category:    string;
  tags:        string[];
  readTime:    string;
  publishDate: string;
  image:       string;
  views:       number;
  likes:       number;
  comments:    number;
  isFeatured?: boolean;
  isTrending?: boolean;
}
