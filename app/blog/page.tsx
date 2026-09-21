import Link from "next/link";

import { Container, PageHeader, Section } from "@/components/site/ui";
import { getBlogPosts } from "@/lib/content";

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <>
      <PageHeader
        eyebrow="Writing"
        title="Notes on reading the evidence."
        lede="Guides to certificates of analysis: what a real one contains, and how a fake or reused one gives itself away."
      />
      <Section className="!pt-10 sm:!pt-14">
        <Container>
          {posts.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block h-full rounded-lg border border-line bg-surface p-6 transition-colors hover:border-accent/40"
                  >
                    <p className="font-mono text-[11px] text-dim">
                      <time dateTime={post.date}>{post.date}</time> · {post.readingTime}
                    </p>
                    <p className="mt-3 text-[1.25rem] font-semibold leading-snug text-text group-hover:text-accent">
                      {post.title}
                    </p>
                    <p className="mt-2 line-clamp-3 text-[14.5px] leading-relaxed text-muted">{post.excerpt}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No posts published yet.</p>
          )}
        </Container>
      </Section>
    </>
  );
}
