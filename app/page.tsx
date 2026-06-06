import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { ImpactStats } from "@/components/home/ImpactStats";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { MissionSnapshot } from "@/components/home/MissionSnapshot";
import { Testimonials } from "@/components/home/Testimonials";
import { FooterCtaBand } from "@/components/home/FooterCtaBand";

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
      <WhatWeDo />
      <MissionSnapshot />
      <Testimonials />
      <FooterCtaBand />
    </>
  );
}
