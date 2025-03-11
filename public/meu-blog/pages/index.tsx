// pages/index.tsx
import { GetStaticProps, NextPage } from 'next';
import { sanityClient } from '../lib/sanity';

type Post = {
  title: string;
  content: string;
  slug: { current: string } | string;
  mainImage?: {
    asset?: {
      url: string;
    }
  }
};

type HomePageProps = {
  posts: Post[];
};

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const query = `*[_type == "post"]{
    title,
    content,
    slug,
    mainImage{
      asset->{
        url
      }
    }
  }`;
  const posts: Post[] = await sanityClient.fetch(query);
  return {
    props: { posts },
    revalidate: 60, // revalida a cada 60 segundos (opcional)
  };
};

const HomePage: NextPage<HomePageProps> = ({ posts }) => {
  return (
    <div>
      <h1>Meu Blog</h1>
      {posts.map((post, index) => {
        // Gera um resumo do conteúdo
        const resumo = post.content.length > 400
          ? post.content.slice(0, 400) + '...'
          : post.content;
        // Se slug for objeto, usa post.slug.current; se for string, usa direto
        const slug = typeof post.slug === 'string' ? post.slug : post.slug.current;
        return (
          <div key={index} className="blog-post">
            {post.mainImage && post.mainImage.asset && (
              <img src={post.mainImage.asset.url} alt={post.title} />
            )}
            <h2>{post.title}</h2>
            <p>{resumo}</p>
            <a href={`/post/${slug}`}>Continue Reading</a>
          </div>
        );
      })}
    </div>
  );
};

export default HomePage;
