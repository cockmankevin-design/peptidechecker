import { Container, PageHeader, Section } from "@/components/site/ui";
import Quiz from "@/components/site/quiz/Quiz";

/* "Find your match" - six questions that match a goal to FDA-approved
   medicines only (2026-09-23 pivot). No doses, no combinations; the result is
   a list to take to a licensed clinician. */

export const metadata = {
  title: "Find your match: FDA-approved medicines for your goal",
  description:
    "Answer six quick questions to see which FDA-approved peptide medicines match your goal, and which licensed providers prescribe them. Not medical advice.",
};

export default function QuizPage() {
  return (
    <>
      <PageHeader
        eyebrow="Find your match"
        title="Six questions. Only FDA-approved options."
        lede="Tell us your goal and preferences, and we'll show which approved medicines fit, with sources. Nothing you choose is sent or stored. A licensed clinician makes the final call."
      />
      <Section className="!pt-10 sm:!pt-14">
        <Container glass>
          <Quiz />
        </Container>
      </Section>
    </>
  );
}
