import Image from "next/image";
import Link from "next/link";
import { Calendar, User } from "lucide-react";

interface BlogCardProps {
  post: {
    id: number;
    title: {
      rendered: string;
    };
    excerpt: {
      rendered: string;
    };
    slug: string;
    date: string;
    _embedded?: {
      author?: Array<{
        name: string;
        avatar_urls: {
          [key: string]: string;
        };
      }>;
      "wp:featuredmedia"?: Array<{
        source_url: string;
        alt_text: string;
      }>;
    };
  };
}

export function BlogCard({ post }: BlogCardProps) {
  const author = post._embedded?.author?.[0];
  const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0];

  // Clean excerpt and limit to 120 characters
  const cleanExcerpt = post.excerpt.rendered
    .replace(/<[^>]*>/g, "")
    .replace(/&[^;]+;/g, "")
    .substring(0, 120)
    .trim();

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
      {/* Featured Image */}
      <div className="relative h-48 overflow-hidden">
        {featuredImage ? (
          <Image
            src={featuredImage.source_url || "/placeholder.svg"}
            alt={featuredImage.alt_text || post.title.rendered}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-xl">S</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <h2 className="text-xl font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={`/blog/${post.slug}`}>{post.title.rendered}</Link>
        </h2>

        {/* Excerpt */}
        <p className="text-muted-foreground text-sm leading-relaxed">
          {cleanExcerpt}...
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-4">
            {author && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Read More Link */}
        <div className="pt-2">
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm transition-colors"
          >
            Read more →
          </Link>
        </div>
      </div>
    </article>
  );
}
