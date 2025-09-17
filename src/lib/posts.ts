import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/';

// Load additional languages for server-side highlighting
loadLanguages(['bash', 'json', 'typescript', 'php', 'python', 'css', 'sql', 'yaml', 'docker']);

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
  // Process sidenotes before remark processing
  let sidenoteCounter = 0;
  const processedMarkdown = markdown.replace(/<sidenote(?:\s+class="([^"]*)")?>([^]*?)<\/sidenote>/gs, (match, className, content) => {
    sidenoteCounter++;
    const sidenoteId = `sn-${sidenoteCounter}`;
    const sidenoteCssClass = className ? `sidenote ${className}` : 'sidenote';
    return `<label for="${sidenoteId}" class="sidenote-toggle">⊕</label><input type="checkbox" id="${sidenoteId}" class="sidenote-toggle" /><span class="${sidenoteCssClass}">${content.trim()}</span>`;
  });

  const result = await remark()
    .use(gfm) // GitHub Flavored Markdown
    .use(html, { sanitize: false })
    .process(processedMarkdown);

  // Fix image paths to point to public/images (served as /images)
  let htmlContent = result.toString()
    .replace(/src="\/images\//g, 'src="/images/');

  // Server-side syntax highlighting with Prism.js
  htmlContent = htmlContent.replace(/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, (match, language, code) => {
    // Decode HTML entities in the code
    const decodedCode = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Check if the language is supported by Prism
    const prismLanguage = Prism.languages[language];
    if (prismLanguage) {
      const highlightedCode = Prism.highlight(decodedCode, prismLanguage, language);
      return `<pre class="language-${language}"><code class="language-${language}">${highlightedCode}</code></pre>`;
    }
    
    // Fallback for unsupported languages
    return `<pre class="language-${language}"><code class="language-${language}">${code}</code></pre>`;
  });

  // Handle code blocks without language specification - default to bash
  htmlContent = htmlContent.replace(/<pre><code(?!\s+class)>([\s\S]*?)<\/code><\/pre>/g, (match, code) => {
    // Decode HTML entities in the code
    const decodedCode = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Highlight as bash
    const highlightedCode = Prism.highlight(decodedCode, Prism.languages.bash, 'bash');
    return `<pre class="language-bash"><code class="language-bash">${highlightedCode}</code></pre>`;
  });

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