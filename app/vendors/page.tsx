import { PageHeader } from "@/components/site/ui";
import RegistryPreview from "@/components/site/sections/RegistryPreview";

/* The full registry. The homepage shows the same records as a preview; this
   page is the record itself, with each vendor linking to its audit. */

export default function VendorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Public registry"
        title="Every listing, including the ones we took down."
        lede="A vendor is listed when a published certificate can be tied to the lot actually on sale. When that link breaks, the record is marked and kept, with the reason. Open any vendor to see the seven checks behind its status."
      />
      <RegistryPreview page />
    </>
  );
}
