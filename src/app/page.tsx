import { getAllPosts } from '@/lib/posts';
import Layout from '@/components/Layout';
import BlogPostList from '@/components/BlogPostList';

export default function Home() {
  const posts = getAllPosts();

  return (
    <Layout>           
      <BlogPostList posts={posts} />
    </Layout>
  );
}
