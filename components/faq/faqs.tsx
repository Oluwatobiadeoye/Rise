import type { ReactNode } from "react";
import Link from "next/link";
import { routes, contactEmails } from "@/lib/site";

const linkClass =
  "font-semibold text-primary underline-offset-2 transition-colors hover:text-primary-press hover:underline";

export type Faq = {
  question: string;
  // Rendered answer; may contain inline links, so it is a ReactNode.
  answer: ReactNode;
  // Plain-text equivalent used for the FAQPage structured-data graph.
  plainText: string;
};

export const faqs: ReadonlyArray<Faq> = [
  {
    question: "Who is eligible for the mentorship programme?",
    answer: (
      <>
        Our structured mentorship runs under RISE Horizons, our tertiary
        programme for students in tertiary institutions affiliated with Oyo
        town. It pairs them with experienced professionals for career guidance
        and personal development.{" "}
        <Link href={routes.mentee} className={linkClass}>
          Apply to be a mentee
        </Link>
        .
      </>
    ),
    plainText:
      "Our structured mentorship runs under RISE Horizons, our tertiary programme for students in tertiary institutions affiliated with Oyo town. It pairs them with experienced professionals for career guidance and personal development.",
  },
  {
    question: "How do I join the Oyo professional community?",
    answer:
      "Early-career and established professionals affiliated with Oyo can join through the RISE Impact Network, our professional community for networking, mentorship, and knowledge sharing.",
    plainText:
      "Early-career and established professionals affiliated with Oyo can join through the RISE Impact Network, our professional community for networking, mentorship, and knowledge sharing.",
  },
  {
    question: "How can my school partner with RISE Initiative?",
    answer: (
      <>
        We welcome partnerships with secondary schools through RISE Foundations
        (leadership clubs, mentorship, and educational support). To explore
        working together, reach out to our{" "}
        <a href={`mailto:${contactEmails.partnerships}`} className={linkClass}>
          partnerships team
        </a>
        .
      </>
    ),
    plainText:
      "We welcome partnerships with secondary schools through RISE Foundations (leadership clubs, mentorship, and educational support). To explore working together, reach out to our partnerships team.",
  },
  {
    question:
      "Is RISE Initiative a registered non-governmental organisation (NGO)?",
    answer:
      "RISE Initiative is in the process of registering as a non-governmental organisation (NGO).",
    plainText:
      "RISE Initiative is in the process of registering as a non-governmental organisation (NGO).",
  },
];
