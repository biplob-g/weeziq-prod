"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, User, ArrowLeft, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface BlogPostProps {
  post: {
    id: number
    title: {
      rendered: string
    }
    content: {
      rendered: string
    }
    excerpt: {
      rendered: string
    }
    date: string
    slug: string
    _embedded?: {
      author?: Array<{
        name: string
        description: string
        avatar_urls: {
          [key: string]: string
        }
      }>
      "wp:featuredmedia"?: Array<{
        source_url: string
        alt_text: string
      }>
    }
  }
}

export function BlogPost({ post }: BlogPostProps) {
  const router = useRouter()
  const author = post._embedded?.author?.[0]
  const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title.rendered,
          text: post.excerpt.rendered.replace(/<[^>]*>/g, "").substring(0, 100),
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      // You could show a toast notification here
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to blog
        </Button>
      </div>

      {/* Article Header */}
      <header className="mb-8 text-center">
        <h1
          className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 leading-tight"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />

        {/* Meta Information */}
        <div className="flex items-center justify-center gap-6 text-muted-foreground mb-8">
          {author && (
            <div className="flex items-center gap-2">
              {author.avatar_urls?.["48"] && (
                <Image
                  src={author.avatar_urls["48"] || "/placeholder.svg"}
                  alt={author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span className="font-medium">{author.name}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-muted-foreground hover:text-foreground"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </header>

      {/* Featured Image */}
      {featuredImage && (
        <div className="relative h-64 md:h-96 mb-12 rounded-2xl overflow-hidden">
          <Image
            src={featuredImage.source_url || "/placeholder.svg"}
            alt={featuredImage.alt_text || post.title.rendered}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Article Content */}
      <article className="prose prose-lg max-w-none">
        <div
          className="blog-content text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
      </article>

      {/* Author Bio */}
      {author && author.description && (
        <div className="mt-16 p-8 bg-card/50 backdrop-blur-sm border border-border rounded-2xl">
          <div className="flex items-start gap-4">
            {author.avatar_urls?.["96"] && (
              <Image
                src={author.avatar_urls["96"] || "/placeholder.svg"}
                alt={author.name}
                width={64}
                height={64}
                className="rounded-full flex-shrink-0"
              />
            )}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">About {author.name}</h3>
              <div
                className="text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: author.description }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-16 pt-8 border-t border-border text-center">
        <Link href="/blog">
          <Button className="btn-primary-gradient px-8 py-3 font-medium">View All Articles</Button>
        </Link>
      </div>
    </div>
  )
}
