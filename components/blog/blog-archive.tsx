"use client";

import { useState, useEffect } from "react";
import { BlogCard } from "./blog-card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface WordPressPost {
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
}

export function BlogArchive() {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<WordPressPost[]>([]);

  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      const response = await fetch(
        `https://blog.ghatakbits.in/wp-json/wp/v2/posts?page=${pageNum}&per_page=12&_embed`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const newPosts = await response.json();

      if (append) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setHasMore(newPosts.length === 12);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = posts.filter(
        (post) =>
          post.title.rendered
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          post.excerpt.rendered.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [searchTerm, posts]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPosts(nextPage, true);
  };

  const displayPosts = searchTerm ? filteredPosts : posts;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full w-8 h-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-background/50 border-border focus:border-primary focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Posts Grid */}
      {displayPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          {/* Load More Button */}
          {!searchTerm && hasMore && (
            <div className="text-center pt-8">
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                variant="outline"
                className="bg-background/50 border-border hover:bg-accent/50"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full w-4 h-4 border-b-2 border-primary mr-2"></div>
                    Loading more...
                  </>
                ) : (
                  "Load more articles"
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            {searchTerm
              ? "No articles found matching your search."
              : "No articles available at the moment."}
          </p>
        </div>
      )}
    </div>
  );
}
