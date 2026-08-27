import Link from "next/link";
import { getBlogPosts } from "@/lib/content";

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold mb-3">Blog</p>
          <h1 className="font-heading text-4xl font-bold text-brand-text-heading">From the Lab Notes</h1>
          <p className="mt-3 text-brand-text-secondary max-w-xl">
            Guides on reading COAs, understanding purity testing, and staying safe in the peptide research market.
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-brand-surface border border-brand-border rounded-xl p-6 hover:border-brand-accent/30 transition-colors block"
              >
                <p className="font-heading text-lg font-bold text-brand-text-heading">{post.title}</p>
                <p className="mt-2 text-sm text-brand-text-secondary leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-3 mt-4 text-xs text-brand-text-secondary">
                  <time dateTime={post.date}>{post.date}</time>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-brand-text-secondary">No posts published yet.</p>
        )}
      </div>
    </main>
  );
}
