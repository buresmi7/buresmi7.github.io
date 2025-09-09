import React from 'react';
import Link from 'next/link';
import { PostData, formatDate } from '@/lib/posts';

interface BlogPostListProps {
  posts: PostData[];
}

export default function BlogPostList({ posts }: BlogPostListProps) {
  return (
    <>
      <header>
        <h1>Hermelínové peklo</h1>
        <p className="author">Michal Bureš</p>
        <section className='abstract'>
          <h2>O mě</h2>
          <p>
            Toto je můj blog věnovaný hermelínům, programování a vyjímečně úvahám o životě.
            Miluji bláznivé čundry, svou ženu a zvykám si na nové zvíře v domácnosti, kterému se obvykle říká dítě.
          </p>
        </section>
      </header>
      
      <main>
        <section>
          <div className="post-list">
            {posts.map((post) => (
              <article key={post.slug} className="post-item">
                <h2 className="post-title">
                  {post.title}
                </h2>
                
                <div className="post-meta">
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
                
                <p className="post-excerpt">
                  {post.perex || post.excerpt}
                  {' '}
                  <Link href={`/posts/${post.slug}`} style={{ whiteSpace: 'nowrap' }}>
                    Pokračovat ve čtení
                  </Link>
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}