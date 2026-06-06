/**
 * Team roster — single source of truth for the Team page.
 *
 * Members without a `bio` render as "coming soon" cards. Members without a
 * `photo` fall back to a placeholder until a real photograph is supplied.
 */

import type { StaticImageData } from "next/image";
import daraPhoto from "@/public/team/dara.png";
import tobiPhoto from "@/public/team/tobi.jpeg";

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  /** Short professional descriptor, e.g. "Software Engineer". */
  profession?: string;
  /** City, country. */
  location?: string;
  /** Bio paragraphs. Absence drives the "coming soon" card variant. */
  bio?: string[];
  /** School affiliation, woven in as a low-emphasis line on the card. */
  school?: string;
  /** Headshot; falls back to a placeholder when absent. */
  photo?: StaticImageData;
};

export const team: ReadonlyArray<TeamMember> = [
  {
    slug: "fareedah-adedeji",
    name: "Eyitayo Fareedah Adedeji",
    role: "Director, Programmes and Operations",
    profession: "Banking Professional",
    location: "Lagos, Nigeria",
    bio: [
      "Fareedah is a financial services professional with over seven years of experience across operational leadership, financial governance, business strategy, and public policy research. She currently serves as an Operations Manager at Access Bank Plc, where she leads operational execution, strengthens risk and regulatory compliance frameworks, and optimises banking processes across critical functions.",
      "A former Global Schools Advocate with the United Nations Sustainable Development Solutions Network, Fareedah advances youth leadership and capacity-building initiatives across diverse communities. Her work through RISE Initiative is anchored in the conviction that sustainable societal progress depends on empowering young people with the confidence, skills, and support systems needed to lead and drive positive change.",
    ],
    school: "Federal Government Girls College Owinni, Oyo, class of 2013.",
  },
  {
    slug: "kunle-oguntoye",
    name: "Kunle Oguntoye",
    role: "General Secretary and Director, Partnerships and Collaborations",
  },
  {
    slug: "ayo-salaudeen",
    name: "Ayo Salaudeen",
    role: "Chief Human Resource Manager",
  },
  {
    slug: "oluwadara-adedeji",
    name: "Oluwadara Adedeji",
    role: "Director, Media and Strategy",
    profession: "AI Engineer",
    location: "Dublin, Ireland",
    photo: daraPhoto,
    bio: [
      "Dara is an AI researcher and engineer specialising in digital mental health and human-centered AI, with over five years of experience. He is currently a PhD candidate at University College Dublin under the Research Ireland Centre for Research Training in Machine Learning (ML-Labs) programme. Having previously served as the Public Relations Officer of the Society of Electrical and Electronic Engineering Students (SEEES UI), he brings substantial experience in media communications and strategic engagement.",
      "A recipient of multiple awards and scholarships, including the Mastercard Foundation Scholarship, he is committed to empowering young leaders to access opportunities and drive positive change in their communities. He is passionate about community development, STEM education, and mental health.",
    ],
    school: "SPED International Secondary School, Oyo, class of 2013.",
  },
  {
    slug: "tobi-adeoye",
    name: "Tobi Adeoye",
    role: "Director, Technology and Innovation",
    profession: "Software Engineer",
    location: "London, United Kingdom",
    photo: tobiPhoto,
    bio: [
      "Tobi is a Software Engineer with over six years of experience across financial services and Big Tech. He currently works as a Senior Software and AI Engineer at Meta, building large-scale AI systems for privacy risk identification and mitigation. Prior to Meta, he served as a Vice President (VP) of Software Engineering at Goldman Sachs, leading the development of portfolio management and master data management systems.",
      "Tobi believes deeply in technology as a driver of economic empowerment, particularly across African communities. This drives his passion for mentoring students and early-career professionals as they transition into and grow within the technology industry, empowering the next generation of technology leaders.",
    ],
    school: "Nesto College, Erelu, Oyo, class of 2013.",
  },
];

/** True when a member has a written bio (drives the card variant). */
export function hasBio(member: TeamMember): boolean {
  return !!member.bio?.length;
}
