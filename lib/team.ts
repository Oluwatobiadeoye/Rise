/**
 * Team roster — single source of truth for the Team page.
 *
 * Members without a `bio` render as "coming soon" cards. Members without a
 * `photo` fall back to a placeholder until a real photograph is supplied.
 */

import type { StaticImageData } from "next/image";
import daraPhoto from "@/public/team/dara.png";
import tobiPhoto from "@/public/team/tobi.jpeg";
import quadriPhoto from "@/public/team/quadri.jpeg";
import ayoPhoto from "@/public/team/ayo.png";
import kunlePhoto from "@/public/team/kunle.png";

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
    profession: "Researcher, Data Scientist",
    location: "Iowa, United States of America",
    photo: kunlePhoto,
    bio: [
      "Kunle is a data scientist and researcher with over six years of experience spanning academic research, engineering, technology transfer, and asset infrastructure management. He is currently a PhD candidate at Iowa State University, working within the Program for Sustainable Pavement Engineering Research. His work focuses on applying data-driven approaches to infrastructure systems, with particular interest in pavement performance, infrastructure sustainability, and long-term asset optimization.",
      "Kunle is passionate about data science, politics, and community development.",
    ],
    school: "EACOED Model High School, Isokun, Oyo, class of 2013.",
  },
  {
    slug: "ayo-salaudeen",
    name: "Ayo Salaudeen",
    role: "Chief Human Resource Manager",
    profession: "Researcher",
    location: "Helsinki, Finland",
    photo: ayoPhoto,
    bio: [
      "Ayo is a doctoral researcher in animal breeding and genetics with over three years of experience in research, data analysis, and scientific problem-solving. She currently works as a Research Scientist at the Natural Resources Institute Finland (Luke) while pursuing her PhD in Animal Breeding and Genomics at the University of Helsinki, Finland.",
      "Through her academic and mentoring experiences as a student tutor at the University of Helsinki, she has developed a strong passion for youth development and is committed to helping young people maximize their potential and make meaningful contributions to their communities.",
    ],
    school: "SPED International Secondary School, Oyo, class of 2013.",
  },
  {
    slug: "quadri-oseni",
    name: "Abdul-Quadri Olayinka Oseni",
    role: "Director, Community Engagement & Field Operations",
    profession: "Surveyor",
    location: "Lagos, Nigeria",
    photo: quadriPhoto,
    bio: [
      "Abdul-Quadri is a Surveyor and Geospatial Professional with over six years of experience in field operations, mapping, and community-focused projects. He has contributed to major projects, including the construction of Marina Interchange Hub developed in partnership with the Agence Française de Développement (AFD), and has actively supported youth development through the Young Surveyors Network (YSN) Lagos state by organizing training, mentorship, and capacity-building programs.",
      "Having held several leadership positions, including Chairman of the O3 Spell Quest Competition and Convention Chairman at the Junior Chamber International Federal School of Surveying , Oyo,  he has developed strong skills in team coordination, stakeholder engagement, and project execution. He believes in using knowledge, leadership, and service to inspire others to pursue excellence, embrace continuous learning, and contribute meaningfully to society. Through his work and volunteer engagements, he hopes to empower young people with the skills, confidence, and opportunities needed to create positive change in their communities and beyond.",
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
  {
    slug: "oluwadara-adedeji",
    name: "Oluwadara Adedeji",
    role: "Director, Media and Strategy",
    profession: "AI Engineer",
    location: "Dublin, Ireland",
    photo: daraPhoto,
    bio: [
      "Dara is an AI researcher and engineer specialising in digital mental health and human-centered AI, with over five years of experience. He is currently a PhD candidate at University College Dublin under the Research Ireland Centre for Research Training in Machine Learning (ML-Labs) programme. Having previously served as the Public Relations Officer of the Society of Electrical and Electronic Engineering Students (SEEES UI), he brings substantial experience in media communications and strategic engagement.",
      "A recipient of multiple awards and scholarships, including the Mastercard Foundation Scholarship, he is committed to empowering young leaders to access global opportunities and drive positive change in their communities. He is passionate about community development, STEM education, and mental health.",
    ],
    school: "SPED International Secondary School, Oyo, class of 2013.",
  },
];

/** True when a member has a written bio (drives the card variant). */
export function hasBio(member: TeamMember): boolean {
  return !!member.bio?.length;
}
