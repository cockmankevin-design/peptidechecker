import Hero from "@/components/site/sections/Hero";
import Problem from "@/components/site/sections/Problem";
import VerificationScroll from "@/components/site/sections/VerificationScroll";
import WhatWeVerify from "@/components/site/sections/WhatWeVerify";
import RegistryPreview from "@/components/site/sections/RegistryPreview";
import SayNo from "@/components/site/sections/SayNo";
import Independence from "@/components/site/sections/Independence";
import VendorCTA from "@/components/site/sections/VendorCTA";
import Faq from "@/components/site/sections/Faq";
import { Hairline } from "@/components/site/ui";

/* Homepage.

   The order is an argument, not a menu:

     Hero          - what this is, in five seconds
     Problem       - why a certificate alone proves nothing
     Verification  - what we actually do about it (the scroll sequence)
     WhatWeVerify  - the seven gates, stated plainly
     Registry      - what the output looks like
     SayNo         - why removals are the product
     Independence  - the conflict, stated before anyone else states it
     VendorCTA     - the bar, addressed to sellers
     FAQ           - the remaining objections

   Problem before solution, and the conflict of interest disclosed before the
   pitch to vendors rather than after it. */

export default function Home() {
  return (
    <>
      <Hero />
      <Hairline />
      <Problem />
      <VerificationScroll />
      <WhatWeVerify />
      <Hairline />
      <RegistryPreview />
      <SayNo />
      <Independence />
      <VendorCTA />
      <Faq />
    </>
  );
}
