import { PageHeader } from "@/components/site/ui";
import Faq from "@/components/site/sections/Faq";

/* The FAQ is the homepage's own section, so the answers can never drift apart
   between the two places they appear. */

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Frequently asked questions."
        lede={
          <>
            How the checks work, what we will not do, and where the money comes from. Anything missing?
            Write to{" "}
            <a href="mailto:info@peptidechecker.com" className="text-accent hover:underline">
              info@peptidechecker.com
            </a>
            .
          </>
        }
      />
      <Faq />
    </>
  );
}
