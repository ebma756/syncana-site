import { notFound } from "next/navigation";

import { BlogPostPage } from "@/components/pages/SitePages";
import { blogPosts, getBlogPost } from "@/data/site";

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!getBlogPost(slug)) {
    notFound();
  }

  return <BlogPostPage locale="en" slug={slug} />;
}
