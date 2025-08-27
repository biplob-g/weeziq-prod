import { BlogArchive } from "@/components/blog/blog-archive";
import { Header } from "@/components/header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - WeezIQ AI",
  description:
    "Latest insights, tips, and updates from the WeezIQ AI team on sales automation, AI technology, and business growth.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />

      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6">
              Sales AI Insights
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the latest trends in AI-powered sales automation, expert
              tips for converting leads, and insights to help you scale your
              business with intelligent sales technology.
            </p>
          </div>

          {/* Blog Archive */}
          <BlogArchive />
        </div>
      </div>
    </div>
  );
}
