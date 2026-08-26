import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getBlogPosts, getContentBySlug } from "@/lib/content";
import type { BlogPost } from "@/lib/types";

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

// Component overrides so MDX body markup picks up the site's dark theme tokens instead of
// browser defaults — there's no @tailwindcss/typography plugin installed, so this is the
// static export's substitute for a "prose" class.
const mdxComponents = {
  h1: (props: React.ComponentPropsWithoutRef<"h1">) => (
    <h1 className="font-heading text-3xl font-bold text-brand-text-heading mt-10 mb-4" {...props} />
  ),
  h2: (props: React.ComponentPropsWithoutRef<"h2">) => (
    <h2 className="font-heading text-2xl font-bold text-brand-text-heading mt-10 mb-4" {...props} />
  ),
  h3: (props: React.ComponentPropsWithoutRef<"h3">) => (
    <h3 className="font-heading text-xl font-bold text-brand-text-heading mt-8 mb-3" {...props} />
  ),
  p: (props: React.ComponentPropsWithoutRef<"p">) => (
    <p className="text-brand-text-secondary leading-relaxed mb-5" {...props} />
  ),
  a: (props: React.ComponentPropsWithoutRef<"a">) => (
    <a className="text-brand-accent hover:underline" {...props} />
  ),
  ul: (props: React.ComponentPropsWithoutRef<"ul">) => (
    <ul className="list-disc list-inside text-brand-text-secondary space-y-2 mb-5 pl-2" {...props} />
  ),
  ol: (props: React.ComponentPropsWithoutRef<"ol">) => (
    <ol className="list-decimal list-inside text-brand-text-secondary space-y-2 mb-5 pl-2" {...props} />
  ),
  li: (props: React.ComponentPropsWithoutRef<"li">) => <li className="leading-relaxed" {...props} />,
  strong: (props: React.ComponentPropsWithoutRef<"strong">) => (
    <strong className="text-brand-text font-semibold" {...props} />
  ),
  blockquote: (props: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="border-l-2 border-brand-accent pl-4 italic text-brand-text-secondary my-6" {...props} />
  ),
  code: (props: React.ComponentPropsWithoutRef<"code">) => (
    <code className="bg-brand-surface-2 text-brand-accent px-1.5 py-0.5 rounded text-sm" {...props} />
  ),
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // No trust-score rule applies to blog posts (that's a vendor/product-only concept), so
  // getContentBySlug()'s lack of filtering is safe to use directly here — unlike a vendor
  // or product lookup, which must go through the filtered lib/content.ts helpers instead.
  const entry = getContentBySlug("blog", slug);
  if (!entry) notFound();

  const post = entry.frontmatter as unknown as BlogPost;

  return (
    <main className="pt-24 pb-16">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">Blog</p>
        <h1 className="font-heading text-4xl font-bold text-brand-text-heading">{post.title}</h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-brand-text-secondary">
          <time dateTime={post.date}>{post.date}</time>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>

        <div className="mt-10">
          <MDXRemote source={entry.content} components={mdxComponents} />
        </div>
      </article>
    </main>
  );
}
