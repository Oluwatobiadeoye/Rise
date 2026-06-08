/**
 * Projects roster — single source of truth for the Projects index and the
 * dynamic [slug] detail route.
 *
 * Array order is the display order; `generateStaticParams` derives the
 * prerendered routes from this list. Optional fields drive layout: `tiers`
 * renders the anchored programme sections, while `highlights` and `gallery`
 * render the past-project blocks.
 */

import type { StaticImageData } from "next/image";
import { routes } from "@/lib/site";

import aatan01 from "@/public/projects/foundations-2019/aatan/aatan-01.jpg";
import aatan02 from "@/public/projects/foundations-2019/aatan/aatan-02.jpg";
import aatan03 from "@/public/projects/foundations-2019/aatan/aatan-03.jpg";
import aatan04 from "@/public/projects/foundations-2019/aatan/aatan-04.jpg";
import aatan05 from "@/public/projects/foundations-2019/aatan/aatan-05.jpg";
import aatan06 from "@/public/projects/foundations-2019/aatan/aatan-06.jpg";
import aatan07 from "@/public/projects/foundations-2019/aatan/aatan-07.jpg";
import aatan08 from "@/public/projects/foundations-2019/aatan/aatan-08.jpg";
import aatan09 from "@/public/projects/foundations-2019/aatan/aatan-09.jpg";
import aatan10 from "@/public/projects/foundations-2019/aatan/aatan-10.jpg";
import aatan11 from "@/public/projects/foundations-2019/aatan/aatan-11.jpg";
import aatan12 from "@/public/projects/foundations-2019/aatan/aatan-12.jpg";

import bl01 from "@/public/projects/foundations-2019/best-legacy/best-legacy-01.jpg";
import bl02 from "@/public/projects/foundations-2019/best-legacy/best-legacy-02.jpg";
import bl03 from "@/public/projects/foundations-2019/best-legacy/best-legacy-03.jpg";
import bl04 from "@/public/projects/foundations-2019/best-legacy/best-legacy-04.jpg";
import bl05 from "@/public/projects/foundations-2019/best-legacy/best-legacy-05.jpg";
import bl06 from "@/public/projects/foundations-2019/best-legacy/best-legacy-06.jpg";
import bl07 from "@/public/projects/foundations-2019/best-legacy/best-legacy-07.jpg";
import bl08 from "@/public/projects/foundations-2019/best-legacy/best-legacy-08.jpg";
import bl09 from "@/public/projects/foundations-2019/best-legacy/best-legacy-09.jpg";
import bl10 from "@/public/projects/foundations-2019/best-legacy/best-legacy-10.jpg";
import bl11 from "@/public/projects/foundations-2019/best-legacy/best-legacy-11.jpg";
import bl12 from "@/public/projects/foundations-2019/best-legacy/best-legacy-12.jpg";

import sped01 from "@/public/projects/foundations-2019/sped/sped-01.jpg";
import sped02 from "@/public/projects/foundations-2019/sped/sped-02.jpg";
import sped03 from "@/public/projects/foundations-2019/sped/sped-03.jpg";
import sped04 from "@/public/projects/foundations-2019/sped/sped-04.jpg";
import sped05 from "@/public/projects/foundations-2019/sped/sped-05.jpg";
import sped06 from "@/public/projects/foundations-2019/sped/sped-06.jpg";
import sped07 from "@/public/projects/foundations-2019/sped/sped-07.jpg";
import sped08 from "@/public/projects/foundations-2019/sped/sped-08.jpg";
import sped09 from "@/public/projects/foundations-2019/sped/sped-09.jpg";
import sped10 from "@/public/projects/foundations-2019/sped/sped-10.jpg";
import sped11 from "@/public/projects/foundations-2019/sped/sped-11.jpg";
import sped12 from "@/public/projects/foundations-2019/sped/sped-12.jpg";

export type TierCta = {
  label: string;
  href: string;
};

export type Tier = {
  /** Anchor id on the detail page, e.g. "rise-foundations". */
  slug: string;
  name: string;
  subtitle: string;
  /** Who the tier serves. */
  audience: string;
  body: string[];
  focus: string[];
  cta?: TierCta[];
};

export type GallerySchool = {
  school: string;
  location?: string;
  photos: { src: StaticImageData; alt: string }[];
};

export type Project = {
  slug: string;
  name: string;
  /** Display period, e.g. "2026–" or "2019". */
  period: string;
  status: "active" | "past";
  /** One-line blurb for the index row. */
  summary: string;
  /** Lede under the detail-page header. */
  lede: string;
  /** Detail-page intro paragraphs. */
  intro: string[];
  tiers?: Tier[];
  highlights?: string[];
  gallery?: GallerySchool[];
};

const theOyoProject: Project = {
  slug: "the-oyo-project",
  name: "The Oyo Project (TOP)",
  period: "2026–",
  status: "active",
  summary:
    "Our flagship programme, Agboole, walking young people from secondary school into their professional lives through leadership, mentorship, educational support, and community.",
  lede: "Agboole: building community, expanding opportunity.",
  intro: [
    "The Oyo Project (TOP), known by its Yoruba name Agboole, meaning community, home, and collective progress, is the flagship programme of RISE Initiative.",
    "Agboole is designed to support individuals at critical stages of their personal, academic, and professional development. Through leadership development, mentorship, educational support, professional exposure, and community engagement, we create opportunities for growth while fostering a culture of excellence, service, and lifelong learning.",
    "By investing in people and connecting them to opportunities, guidance, and meaningful relationships, TOP seeks to develop leaders who are equipped to thrive personally and contribute positively to their communities.",
  ],
  tiers: [
    {
      slug: "rise-foundations",
      name: "RISE Foundations",
      subtitle: "Secondary school programme",
      audience: "Secondary school students in partner schools in Oyo",
      body: [
        "RISE Foundations is the entry point into The Oyo Project. The programme is designed to help young people build strong foundations for leadership, academic success, and personal development during their formative years.",
        "Through leadership clubs, mentorship opportunities, educational support initiatives, leadership summits, and recognition programmes, participants are exposed to positive role models, practical learning experiences, and opportunities that broaden their aspirations and strengthen their confidence.",
        "The programme encourages young people to develop the character, discipline, and leadership capacity required to succeed in school and beyond.",
      ],
      focus: [
        "Professional Mentorship",
        "Career Development",
        "Leadership Growth",
        "Scholarship and Opportunity Awareness",
        "Personal Development",  
      ],
    },
    {
      slug: "rise-horizons",
      name: "RISE Horizons",
      subtitle: "Tertiary programme",
      audience: "Students in tertiary institutions affiliated with Oyo",
      body: [
        "RISE Horizons supports students as they navigate higher education and prepare for future opportunities.",
        "Through mentorship, professional development sessions, career guidance, scholarship awareness initiatives, networking opportunities, and exposure to experienced professionals, participants gain valuable insights that support both personal growth and career readiness.",
        "The programme is designed to help students broaden their horizons, make informed decisions, and position themselves for success in an increasingly competitive world.",
      ],
      focus: [
        "Leadership Development",
        "Mentorship",
        "Academic Excellence",
        "Character Formation",
        "Community Engagement",
      ],
      cta: [
        { label: "Apply to be a mentor", href: routes.mentor },
        { label: "Apply to be a mentee", href: routes.mentee },
      ],
    },
    {
      slug: "rise-impact-network",
      name: "RISE Impact Network",
      subtitle: "Early-career and professional programme",
      audience: "Early-career and established professionals affiliated with Oyo",
      body: [
        "RISE Impact Network is a growing community of professionals committed to personal growth, professional excellence, and meaningful community impact.",
        "The programme provides opportunities for networking, mentorship, leadership engagement, knowledge sharing, and collaboration among professionals across diverse industries and locations.",
        "Members gain access to valuable relationships, industry insights, and opportunities for continued development while contributing their expertise, experience, and support to initiatives that strengthen communities and expand opportunities for others.",
      ],
      focus: [
        "Professional Networking",
        "Career Advancement",
        "Mentorship and Knowledge Sharing",
        "Leadership in Service",
        "Community Impact",
      ],
      // No route maps to this path, so it renders the 404 by design.
      cta: [{ label: "Join the community", href: routes.impactNetwork }],
    },
  ],
};

const foundationsOfImpact: Project = {
  slug: "foundations-of-impact",
  name: "Foundations of Impact",
  period: "2019",
  status: "past",
  summary:
    "Our 2019 Leadership and Career Development Bootcamps, reaching more than 600 secondary school students across schools in Oyo town.",
  lede: "Leadership and Career Development Bootcamps, 2019.",
  intro: [
    "One of RISE Initiative's early community engagement efforts was a series of Leadership and Career Development Bootcamps organised for secondary school students in Oyo town.",
    "Designed to broaden perspectives and inspire ambition, the bootcamps brought together leadership experts, accomplished professionals, and experienced facilitators who engaged students on leadership, career development, self-development, sustainable development, and community building.",
    "Through these sessions, participants were encouraged to think beyond their immediate circumstances, develop a stronger sense of purpose, and recognise their potential to contribute meaningfully to their communities and society.",
    "Reaching more than 600 students, the initiative created valuable opportunities for learning, mentorship, and personal growth while reinforcing a belief that continues to guide our work today: when young people are connected to the right knowledge, role models, and opportunities, they are better equipped to lead, succeed, and create positive impact.",
  ],
  highlights: [
    "More than 600 students reached",
    "Leadership experts and career professionals engaged as facilitators",
    "Multiple secondary schools participated across Oyo",
    "Focus areas included leadership development, career awareness, self-development, sustainable development, and community building",
  ],
  gallery: [
    {
      school: "Aatan Baptist Comprehensive High School",
      photos: [
        { src: aatan01, alt: "Students seated as a facilitator leads a session at Aatan Baptist Comprehensive High School, 2019." },
        { src: aatan02, alt: "A facilitator addressing the room at the 2019 bootcamp, Aatan Baptist Comprehensive High School." },
        { src: aatan03, alt: "A facilitator presenting at the front of the class, Aatan Baptist Comprehensive High School, 2019." },
        { src: aatan04, alt: "Students listening during a session at Aatan Baptist Comprehensive High School, 2019." },
        { src: aatan05, alt: "A facilitator standing among seated students at the 2019 bootcamp, Aatan Baptist Comprehensive High School." },
        { src: aatan06, alt: "Students engaged during the 2019 bootcamp at Aatan Baptist Comprehensive High School." },
        { src: aatan07, alt: "Students seated during a session at Aatan Baptist Comprehensive High School, 2019." },
        { src: aatan08, alt: "A facilitator speaking with a student at the front of the hall, Aatan Baptist Comprehensive High School, 2019." },
        { src: aatan09, alt: "A facilitator working with a student at Aatan Baptist Comprehensive High School, 2019." },
        { src: aatan10, alt: "A group photo of students and facilitators at Aatan Baptist Comprehensive High School, 2019." },
        { src: aatan11, alt: "A student listening during a session at Aatan Baptist Comprehensive High School, 2019." },
        { src: aatan12, alt: "Facilitators presenting Sustainable Development Goals cards at Aatan Baptist Comprehensive High School, 2019." },
      ],
    },
    {
      school: "Best Legacy International Secondary School",
      photos: [
        { src: bl01, alt: "Students filling the hall during the 2019 bootcamp at Best Legacy International Secondary School." },
        { src: bl02, alt: "A facilitator with a microphone at the front of the hall, Best Legacy International Secondary School, 2019." },
        { src: bl03, alt: "A student holding up a Sustainable Development Goals card at Best Legacy International Secondary School, 2019." },
        { src: bl04, alt: "A student speaking into a microphone at the 2019 bootcamp, Best Legacy International Secondary School." },
        { src: bl05, alt: "A student speaking into a microphone among their classmates at Best Legacy International Secondary School, 2019." },
        { src: bl06, alt: "A student holding a Sustainable Development Goals card at Best Legacy International Secondary School, 2019." },
        { src: bl07, alt: "A student holding a Sustainable Development Goals card and smiling, Best Legacy International Secondary School, 2019." },
        { src: bl08, alt: "A facilitator leading a session at Best Legacy International Secondary School, 2019." },
        { src: bl09, alt: "A student during the 2019 bootcamp at Best Legacy International Secondary School." },
        { src: bl10, alt: "A student speaking into a microphone at Best Legacy International Secondary School, 2019." },
        { src: bl11, alt: "Students and facilitators gathered outside the school for a group photo, Best Legacy International Secondary School, 2019." },
        { src: bl12, alt: "Two students smiling during the 2019 bootcamp at Best Legacy International Secondary School." },
      ],
    },
    {
      school: "SPED International Secondary School",
      photos: [
        { src: sped01, alt: "Students seated together during a session at SPED International Secondary School, 2019." },
        { src: sped02, alt: "A facilitator holding a microphone at the 2019 bootcamp, SPED International Secondary School." },
        { src: sped03, alt: "A facilitator speaking during a session at SPED International Secondary School, 2019." },
        { src: sped04, alt: "A facilitator addressing students at SPED International Secondary School, 2019." },
        { src: sped05, alt: "A facilitator leading a session at the front of the hall, SPED International Secondary School, 2019." },
        { src: sped06, alt: "A facilitator speaking to students at the 2019 bootcamp, SPED International Secondary School." },
        { src: sped07, alt: "A facilitator holding a Sustainable Development Goals card at SPED International Secondary School, 2019." },
        { src: sped08, alt: "Students seated across the hall during the 2019 bootcamp, SPED International Secondary School." },
        { src: sped09, alt: "A large group of students at the 2019 bootcamp, SPED International Secondary School." },
        { src: sped10, alt: "Students and facilitators gathered for a group photo at SPED International Secondary School, 2019." },
        { src: sped11, alt: "Students smiling with a RISE Initiative sign at SPED International Secondary School, 2019." },
        { src: sped12, alt: "Two students at the RISE Initiative photo frame during the 2019 bootcamp at SPED International Secondary School." },
      ],
    },
  ],
};

export const projects: ReadonlyArray<Project> = [
  theOyoProject,
  foundationsOfImpact,
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
