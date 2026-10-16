import { pageMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/shared/PageHeader";
import { TeamGrid } from "@/components/team/TeamGrid";

export const metadata = pageMetadata({
  title: "Our team",
  description:
    "Meet the professionals, mentors, and community leaders behind RISE Initiative, committed to empowering young people and driving sustainable community development.",
  path: "/team",
});

export default function TeamPage() {
  return (
    <>
      <PageHeader
        eyebrow="Founding Executives"
        title="The people behind RISE."
        lede="RISE Initiative is led by its Founding Executives: the professionals, mentors, and community leaders setting the organisation's direction and driving its mission forward."
      />
      <TeamGrid />
    </>
  );
}
