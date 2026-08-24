"use client";

export default function EmailSignup() {
  return (
    <section className="bg-gradient-to-r from-brand-surface to-brand-surface-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-xl">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-brand-text-heading">
            Get New Test Results First
          </h2>
          <p className="mt-3 text-brand-text-secondary">
            Subscribe for updates when we publish new independent lab results and vendor reviews.
          </p>
          <form className="mt-6 flex gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="*Email address"
              className="flex-1 bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm text-brand-text placeholder:text-brand-text-secondary focus:outline-none focus:border-brand-accent"
            />
            <button
              type="submit"
              className="bg-brand-accent text-brand-bg font-semibold px-6 py-3 rounded-lg hover:bg-brand-accent-hover transition-colors text-sm"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
