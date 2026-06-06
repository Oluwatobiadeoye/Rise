import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { OurStory } from "@/components/about/OurStory";
import { Vision } from "@/components/about/Vision";
import { Objectives } from "@/components/about/Objectives";
import { Values } from "@/components/about/Values";
import { NameIdentity } from "@/components/about/NameIdentity";

export const metadata: Metadata = {
  title: "About",
  description:
    "RISE Initiative empowers young people in Oyo through leadership development, mentorship, and opportunity. Our story, vision, objectives, and values.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About RISE Initiative"
        title="Empowering young people to lead."
        lede="We identify, develop, and connect young people from secondary school through their early careers, building leaders, creating opportunity, and strengthening our community."
      />
      <OurStory />
      <Vision />
      <Objectives />
      <Values />
      <NameIdentity />
    </>
  );
}
