import React from 'react';
import { PostData, formatDate } from '@/lib/posts';

interface BlogPostProps {
  post: PostData;
  htmlContent: string;
}

export default function BlogPost({ post, htmlContent }: BlogPostProps) {
  return (
    <article>
      <header>
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span className="post-date">{formatDate(post.date)}</span>
          {post.categories.length > 0 && (
            <div className="categories">
              {post.categories.map((category) => (
                <span key={category} className="category-tag">
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>
      
      <section 
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </article>
  );
}