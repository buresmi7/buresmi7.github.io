import React from 'react';
import Link from 'next/link';
import { PostData, formatDate } from '@/lib/posts';

interface BlogPostProps {
  post: PostData;
  htmlContent: string;
}

export default function BlogPost({ post, htmlContent }: BlogPostProps) {
  return (
    <>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{post.title}</h1>
        <div className="post-meta">
          <p className="center">
            Hermelínové peklo
          </p>
          <small>
            <span className="post-date">{formatDate(post.date)}</span>
            {post.categories.length > 0 && (
              <>
                {' • '}
                <span className="categories">
                  {post.categories.join(', ')}
                </span>
              </>
            )}
          </small>
        </div>
      </header>

      <main>
        <article>
          <section
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </article>
      </main>
    </>
  );
}