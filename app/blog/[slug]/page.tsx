import { BlogPost } from "@/components/blog/blog-post";
import { Header } from "@/components/header";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getPost(slug: string) {
  try {
    const response = await fetch(
      `https://blog.ghatakbits.in/wp-json/wp/v2/posts?slug=${slug}&_embed`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch post");
    }

    const posts = await response.json();
    return posts[0] || null;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);

  if (!post) {
    return {
      title: "Post Not Found - WeezIQ AI Blog",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${post.title.rendered} - WeezIQ AI Blog`,
    description: post.excerpt.rendered
      .replace(/<[^>]*>/g, "")
      .substring(0, 160),
    openGraph: {
      title: post.title.rendered,
      description: post.excerpt.rendered
        .replace(/<[^>]*>/g, "")
        .substring(0, 160),
      images: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
        ? [post._embedded["wp:featuredmedia"][0].source_url]
        : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />

      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 pt-24 pb-16">
        <BlogPost post={post} />
      </div>
    </div>
  );
}
