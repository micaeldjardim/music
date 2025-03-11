// pages/post/[slug].tsx
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { sanityClient } from '../../lib/sanity';

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

type PostPageProps = {
  post: Post;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const query = `*[_type == "post"]{
    slug
  }`;
  const posts: Post[] = await sanityClient.fetch(query);
  const paths = posts.map((post) => ({
    params: { slug: typeof post.slug === 'string' ? post.slug : post.slug.current },
  }));
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<PostPageProps> = async ({ params }) => {
  const slug = params?.slug;
  const query = `*[_type == "post" && slug.current == $slug][0]{
    title,
    content,
    slug,
    mainImage{
      asset->{
        url
      }
    }
  }`;
  const post: Post = await sanityClient.fetch(query, { slug });
  if (!post) {
    return { notFound: true };
  }
  return { props: { post }, revalidate: 60 };
};

const PostPage: NextPage<PostPageProps> = ({ post }) => {
  return (
    <div>
      <h1>{post.title}</h1>
      {post.mainImage && post.mainImage.asset && (
        <img src={post.mainImage.asset.url} alt={post.title} />
      )}
      <div>{post.content}</div>
    </div>
  );
};

export default PostPage;
