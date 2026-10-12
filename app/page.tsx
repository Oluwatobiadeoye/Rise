import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { ImpactStats } from "@/components/home/ImpactStats";
import { Programmes } from "@/components/home/Programmes";
import { MissionSnapshot } from "@/components/home/MissionSnapshot";
import { ProjectVision } from "@/components/projects/ProjectVision";
import { Testimonials } from "@/components/home/Testimonials";
import { FooterCtaBand } from "@/components/home/FooterCtaBand";
import { getProject } from "@/lib/projects";

const homeVision = getProject("the-oyo-project")?.vision;

export const metadata: Metadata = {
  description:
    "RISE Initiative empowers the next generation of leaders, connecting young people from secondary school through their early careers with leadership development, mentorship, and real opportunity.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />
      <ImpactStats />
      <Programmes />
      <MissionSnapshot />
      {homeVision ? <ProjectVision {...homeVision} /> : null}
      <Testimonials />
      <FooterCtaBand />
    </>
  );
}
