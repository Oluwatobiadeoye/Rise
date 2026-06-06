import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { TeamGrid } from "@/components/team/TeamGrid";

export const metadata: Metadata = {
  title: "Our team",
  description:
    "Meet the professionals, mentors, and community leaders behind RISE Initiative, committed to empowering young people and driving sustainable community development.",
  alternates: { canonical: "/team" },
};

export default function TeamPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our team"
        title="The people behind RISE."
        lede="RISE Initiative is led by a diverse team of professionals, mentors, and community leaders committed to empowering young people, expanding opportunities, and driving sustainable community development through service, expertise, and collaboration."
      />
      <TeamGrid />
    </>
  );
}
