import { getAllPosts } from '@/lib/posts';
import Layout from '@/components/Layout';
import BlogPostList from '@/components/BlogPostList';

export default function Home() {
  const posts = getAllPosts();

  return (
    <Layout>
      <section className='abstract'>
        <h2>O mě</h2>
        <p>
          Toto je můj blog věnovaný hermelínům, programování a vyjímečně úvahám o životě.
          Miluji bláznivé čundry, svou ženu a zvykám si na nové zvíře v domácnosti, kterému se obvykle říká dítě.
        </p>
      </section>
      
      <BlogPostList posts={posts} />
    </Layout>
  );
}
