import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';

export interface PostData {
  slug: string;
  title: string;
  date: string;
  categories: string[];
  layout?: string;
  content: string;
  excerpt?: string;
  perex?: string;
}

const postsDirectory = path.join(process.cwd(), 'content/_posts');

export function getAllPostSlugs(): string[] {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => fileName.replace(/\.md$/, ''));
}

export function getPostBySlug(slug: string): PostData {
  const fileName = `${slug}.md`;
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // Extract date from filename (YYYY-MM-DD-title format)
  const dateMatch = slug.match(/^(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? dateMatch[1] : '';

  return {
    slug,
    title: data.title || '',
    date,
    categories: data.categories || [],
    layout: data.layout,
    content,
    excerpt: content.substring(0, 200) + '...',
    perex: data.perex
  };
}

export function getAllPosts(): PostData[] {
  const slugs = getAllPostSlugs();
  const posts = slugs
    .map(slug => getPostBySlug(slug))
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1)); // Sort by date descending

  return posts;
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(gfm) // GitHub Flavored Markdown
    .use(html, { sanitize: false })
    .process(markdown);

  // Fix image paths to point to public/images (served as /images)
  const htmlContent = result.toString()
    .replace(/src="\/images\//g, 'src="/images/');

  return htmlContent;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}