import type { StaticImageData } from "next/image";

import adetoroMoses from "@/public/testimonials/adetoro-moses.jpg";
import maryamThabit from "@/public/testimonials/maryam-thabit.jpg";
import olabodeTofunmi from "@/public/testimonials/olabode-tofunmi.jpg";
import timilehinAyoola from "@/public/testimonials/timilehin-ayoola.jpg";
import ayosubomiOkeniyi from "@/public/testimonials/ayosubomi-okeniyi.jpg";
import paulAdedeji from "@/public/testimonials/paul-adedeji.jpg";
import hawauOjerinde from "@/public/testimonials/hawau-ojerinde.jpg";
import johnFavourOjo from "@/public/testimonials/john-favour-ojo.jpg";
import worshipAdebayo from "@/public/testimonials/worship-adebayo.jpg";

export type Testimonial = {
  slug: string;
  name: string;
  /** The one-line pull quote shown as the testimonial's headline. */
  headline: string;
  paragraphs: ReadonlyArray<string>;
  /** Which paragraph the home page slider shows; defaults to the first. */
  excerptParagraph?: number;
  /** Current roles, one per line. */
  roles: ReadonlyArray<string>;
  school: string;
  photo: StaticImageData;
};

export const testimonials: ReadonlyArray<Testimonial> = [
  {
    slug: "adetoro-moses",
    name: "Adetoro Moses",
    headline:
      "It didn't just introduce me to a goal; it showed me a problem worth dedicating my career to.",
    paragraphs: [
      "My journey into healthcare advocacy began when RISE visited my secondary school and introduced us to the Sustainable Development Goals (SDGs). SDG 3, Good Health and Well-Being, stood out to me and showed me that healthcare access was something we could build, not just wish for.",
      "The experience shaped my work today. I co-founded MOBIVISION Clinic to bring eye care to rural communities and built MedicPreneur, a healthcare entrepreneurship platform active across 13 African countries. Through the African Federation of Optometry Students, I support the next generation of eye care professionals.",
      "I'm grateful to RISE for that experience. It didn't just introduce me to a goal; it showed me a problem worth dedicating my career to.",
    ],
    roles: ["Founder, MedicPreneur"],
    school: "Best Legacy International Secondary School",
    photo: adetoroMoses,
  },
  {
    slug: "maryam-thabit",
    name: "Maryam Thabit",
    headline:
      "RISE helped build my confidence and shaped my approach to leadership.",
    paragraphs: [
      "Participating in the RISE Initiative Boot Camp was a major stepping stone to where I am today and where I am headed.",
      "One of my clearest memories is being introduced to the Sustainable Development Goals (SDGs) for the very first time. We were given printed copies of the SDGs, making the goals feel tangible and relevant to us as young students. I was inspired by the idea that young people have a role to play in creating positive change in their communities. I also remember the excitement when one participant was recognized for reciting all the SDGs from memory.",
      "Looking back, as the Vice President of the Nigeria Economics Students' Association, Obafemi Awolowo University, and having served in various leadership capacities, I can appreciate how experiences like RISE helped build my confidence and shaped my approach to leadership.",
      "I remain grateful to RISE Initiative for investing in young people and inspiring us to believe that our voices matter. It is inspiring to see RISE relaunching. I am optimistic that more young people would benefit from the experience.",
    ],
    excerptParagraph: 1,
    roles: [
      "Vice President, Nigeria Economics Students' Association, Obafemi Awolowo University",
    ],
    school: "SPED International Secondary School, Oyo",
    photo: maryamThabit,
  },
  {
    slug: "olabode-tofunmi",
    name: "Oluwatofunmi Olabode",
    headline:
      "Learning how science and innovation can improve health outcomes changed the way I saw my own path.",
    paragraphs: [
      "One of the experiences I will always be grateful for is RISE's visit to my secondary school in 2019. It was my first introduction to the Sustainable Development Goals (SDGs), and SDG 3 (Good Health and Well-Being) particularly resonated with me. Learning how science and innovation can improve health outcomes changed the way I saw my own path and inspired me to pursue Biochemistry with a newfound sense of purpose.",
    ],
    roles: ["Valedictorian, Ajayi Crowther University (Class of 2025)"],
    school: "Best Legacy International Secondary School",
    photo: olabodeTofunmi,
  },
  {
    slug: "timilehin-ayoola",
    name: "Timilehin Ayoola",
    headline:
      "I hope to continue giving back to students and communities just as they once invested in me.",
    paragraphs: [
      "My passion for community impact did not start today. It began when RISE visited my secondary school and taught us about leadership, the Sustainable Development Goals (SDGs), and what it takes to create a positive change in our communities.",
      "That experience sparked my interest and inspired the work I do today through community service and other social impact projects.",
      "I am grateful to RISE and everyone who has contributed to my growth. Being part of this initiative was a valuable experience, and I hope to continue giving back to students and communities just as they once invested in me.",
    ],
    roles: ["Co-Founder, Career Forge Africa"],
    school: "Aatan Baptist Comprehensive High School, Oyo",
    photo: timilehinAyoola,
  },
  {
    slug: "ayosubomi-okeniyi",
    name: "Ayosubomi Okeniyi",
    headline:
      "RISE was where I first learned about the SDGs and, more importantly, the value of community impact.",
    paragraphs: [
      "My major highlight from the RISE Boot Camp was the discussion on the Sustainable Development Goals (SDGs). Each time we discuss them in Community Medicine, I am reminded that RISE was where I first learned about the SDGs and, more importantly, the value of community impact.",
      "Since then, I have tried to contribute in my own way through the Pad a Girl Project, providing sanitary pads to girls in schools across underserved communities. It has been a fulfilling experience and a reminder that meaningful change often begins with small acts of service.",
    ],
    roles: [
      "Medical Student, Ladoke Akintola University of Technology",
      "Founder, Pad a Girl Project",
    ],
    school: "SPED International Secondary School, Oyo",
    photo: ayosubomiOkeniyi,
  },
  {
    slug: "paul-adedeji",
    name: "Paul Adedeji",
    headline:
      "The Boot Camp gave me the early confidence to serve others and lead with purpose.",
    paragraphs: [
      "Back in secondary school, the programme opened my eyes to the power of community impact and taught me what it means to take responsibility. Today, I realize how deeply important that early foundation was. The Boot Camp gave me the early confidence to serve others and lead with purpose, and the values that continue to drive my work as a youth leader today.",
    ],
    roles: ["Millennium Fellowship Scholar & SDG Advocate"],
    school: "Aatan Baptist Comprehensive High School, Oyo",
    photo: paulAdedeji,
  },
  {
    slug: "hawau-ojerinde",
    name: "Hawau A. Ojerinde",
    headline: "It was the boost I didn't know I needed.",
    paragraphs: [
      "I attended the Boot Camp in my first year of senior secondary school, inexperienced and unsure how to navigate life with my big dreams. Though it was years ago, I still remember how seen, supported, and at peace I felt. It was the boost I didn't know I needed.",
      "What stayed with me most was the power of community and the conviction that no dream is beyond reach. Today, I'm grateful to be living one of mine.",
    ],
    roles: ["Medical Student, University of Ibadan"],
    school: "SPED International Secondary School, Oyo",
    photo: hawauOjerinde,
  },
  {
    slug: "john-favour-ojo",
    name: "John Favour Ojo",
    headline: "It gave me a purpose beyond simply pursuing a profession.",
    paragraphs: [
      "I was privileged to be a participant in the boot camp in 2019. The programme offered me valuable insight into the Sustainable Development Goals (SDGs). Learning about the global goals, particularly SDG 3 (Good Health and Well-being), enlightened me about the gaps in access to healthcare and the importance of collective efforts in ensuring that everyone has the opportunity to live a healthy life.",
      "The exposure played a significant role in inspiring my pursuit of a career in Medicine and Surgery. It gave me a purpose beyond simply pursuing a profession and instilled in me the desire to contribute meaningfully to the goal of achieving health for all.",
    ],
    roles: [
      "Medicine and Surgery Student (400 level), Obafemi Awolowo University",
    ],
    school: "Aatan Baptist Comprehensive High School, Oyo",
    photo: johnFavourOjo,
  },
  {
    slug: "worship-adebayo",
    name: "Worship Adeife Adebayo",
    headline:
      "It planted a seed: the understanding that success is not accidental, and that a life of purpose is something you pursue deliberately.",
    paragraphs: [
      "I remember being part of a career boot camp by RISE Initiative that spoke to us about life, purpose, and intentional living. The details of that day may have faded, but the impression it left has not. It planted a seed: the understanding that success is not accidental, and that a life of purpose is something you pursue deliberately. Looking back, I can trace a straight line from that early nudge toward intentional living to the choices I have made since then.",
    ],
    roles: ["Education & History Student, Obafemi Awolowo University"],
    school: "Aatan Baptist Comprehensive High School, Oyo",
    photo: worshipAdebayo,
  },
];

/** The paragraph shown as the testimonial's excerpt on the home page. */
export function excerptOf(testimonial: Testimonial): string {
  return testimonial.paragraphs[testimonial.excerptParagraph ?? 0];
}

const featuredSlugs = [
  "olabode-tofunmi",
  "timilehin-ayoola",
  "maryam-thabit",
  "adetoro-moses",
  "hawau-ojerinde",
];

/** The testimonials shown on the home page, in display order. */
export const featuredTestimonials: ReadonlyArray<Testimonial> = featuredSlugs.map(
  (slug) => {
    const testimonial = testimonials.find((t) => t.slug === slug);
    if (!testimonial) throw new Error(`Unknown featured testimonial: ${slug}`);
    return testimonial;
  },
);
