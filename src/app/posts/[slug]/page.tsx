import { getAllPostSlugs, getPostBySlug, markdownToHtml } from '@/lib/posts';
import Layout from '@/components/Layout';
import BlogPost from '@/components/BlogPost';
import { notFound } from 'next/navigation';

interface PostPageProps {
  params: {
    slug: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  
  try {
    const post = getPostBySlug(slug);
    const htmlContent = await markdownToHtml(post.content);

    return (
      <Layout>
        <BlogPost post={post} htmlContent={htmlContent} />
      </Layout>
    );
  } catch (error) {
    notFound();
  }
}

// Generate static paths for all posts
export function generateStaticParams() {
  const slugs = getAllPostSlugs();
  
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

// Generate metadata for each post
export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  
  try {
    const post = getPostBySlug(slug);
    
    return {
      title: `${post.title} - Hermelínové peklo`,
      description: post.excerpt,
    };
  } catch (error) {
    return {
      title: 'Příspěvek nenalezen - Hermelínové peklo',
    };
  }
}