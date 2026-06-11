import { pageMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/shared/PageHeader";
import { RoleSection } from "@/components/get-involved/RoleSection";
import { VolunteerForm } from "@/components/get-involved/VolunteerForm";
import { routes, contactEmails } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Get involved",
  description:
    "Mentor a young person, apply for mentorship, volunteer, or support a student in Oyo. Find the role that fits you at RISE Initiative.",
  path: "/get-involved",
});

// Keep each section id in sync with its route constant so deep links and
// anchor targets cannot drift apart.
const anchorId = (route: string) => route.split("#")[1];

export default function GetInvolvedPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get involved"
        title="Find your role at RISE."
        lede="RISE Initiative runs on the energy, talent, and generosity of people who care about Oyo's young people. Whether you want to mentor, facilitate, coordinate, or contribute financially, there is a role for you here."
      />

      <RoleSection
        eyebrow="Become a mentor"
        title="Mentor a student or young professional"
        body={[
          "We are looking for passionate professionals ready to give their time to guide a student or young professional in Oyo. As a mentor you will: meet with your mentee virtually, at least once every two months; offer career direction, academic guidance, and personal development support; submit brief quarterly updates to the RISE team.",
          "Requirements: professional or academic experience in a relevant field, strong interpersonal skills, and willingness to commit to a one-year engagement.",
        ]}
        cta={{ label: "Apply to mentor", href: routes.mentor }}
      />

      <RoleSection
        tinted
        eyebrow="Apply as a mentee"
        title="Join our mentorship programme"
        body={[
          "Tertiary students affiliated with Oyo town can apply for a place in our structured mentorship programme. Applications open periodically. You will be asked to submit a short essay covering your background, goals, and motivation.",
          "Please note that, due to limited mentor availability and programme capacity, only successful applicants will be contacted.",
        ]}
        cta={{ label: "Apply for mentorship", href: routes.mentee }}
      />

      <RoleSection
        id={anchorId(routes.volunteer)}
        eyebrow="Volunteer roles"
        title="Lend your skills as a volunteer"
        body={[
          "Recruitment is currently conducted primarily through internal networks and referrals. Some volunteer roles are stipend-supported, and all volunteers receive training to equip them for their responsibilities.",
          "If you have relevant skills and are interested in contributing, we would be happy to hear from you.",
        ]}
      >
        <VolunteerForm />
      </RoleSection>

      <RoleSection
        id={anchorId(routes.supportAStudent)}
        tinted
        eyebrow="Support a student"
        title="Sponsor a student's exam fees"
        body={[
          "You can directly support a promising secondary school student by sponsoring their West African Examinations Council (WAEC) or Joint Admissions and Matriculation Board (JAMB) examination fees. Your contribution keeps a capable student on the path to university. Every amount helps.",
        ]}
        disabledCta
        disabledLabel="Donate"
        ctaNote="Online donations are coming soon."
        ctaHref={`mailto:${contactEmails.general}`}
        fallbackLabel="Email us to give"
      />
    </>
  );
}
