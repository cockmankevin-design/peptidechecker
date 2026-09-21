import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Container, PageHeader, Section } from "@/components/site/ui";
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
    <h1 className="text-[1.9rem] font-semibold leading-tight text-text mt-10 mb-4" {...props} />
  ),
  h2: (props: React.ComponentPropsWithoutRef<"h2">) => (
    <h2 className="text-[1.6rem] font-semibold leading-tight text-text mt-10 mb-4" {...props} />
  ),
  h3: (props: React.ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-[1.2rem] font-semibold text-text mt-8 mb-3" {...props} />
  ),
  p: (props: React.ComponentPropsWithoutRef<"p">) => (
    <p className="text-[16.5px] text-muted leading-relaxed mb-5" {...props} />
  ),
  a: (props: React.ComponentPropsWithoutRef<"a">) => (
    <a className="text-accent hover:underline" {...props} />
  ),
  ul: (props: React.ComponentPropsWithoutRef<"ul">) => (
    <ul className="list-disc list-outside text-muted space-y-2 mb-5 pl-5" {...props} />
  ),
  ol: (props: React.ComponentPropsWithoutRef<"ol">) => (
    <ol className="list-decimal list-outside text-muted space-y-2 mb-5 pl-5" {...props} />
  ),
  li: (props: React.ComponentPropsWithoutRef<"li">) => <li className="leading-relaxed" {...props} />,
  strong: (props: React.ComponentPropsWithoutRef<"strong">) => (
    <strong className="text-text font-semibold" {...props} />
  ),
  blockquote: (props: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="border-l-2 border-accent/60 pl-4 text-muted my-6" {...props} />
  ),
  code: (props: React.ComponentPropsWithoutRef<"code">) => (
    <code className="bg-surface-2 font-mono text-accent px-1.5 py-0.5 rounded text-[0.85em]" {...props} />
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
    <>
      <PageHeader
        eyebrow="Writing"
        title={post.title}
        lede={
          <span className="font-mono text-[13px] text-dim">
            <time dateTime={post.date}>{post.date}</time> · {post.readingTime}
          </span>
        }
      />
      <Section className="!pt-10 sm:!pt-14">
        <Container>
          <article className="max-w-[68ch]">
            <MDXRemote source={entry.content} components={mdxComponents} />
          </article>
        </Container>
      </Section>
    </>
  );
}
