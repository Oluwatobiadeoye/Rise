import { pageMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/shared/PageHeader";
import { Container } from "@/components/shared/Container";
import { ProjectIndexRow } from "@/components/projects/ProjectIndexRow";
import { projects } from "@/lib/projects";

export const metadata = pageMetadata({
  title: "Our projects",
  description:
    "The work of RISE Initiative, from The Oyo Project (TOP), our flagship leadership and mentorship programme, to the 2019 bootcamps that reached more than 600 students in Oyo.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our work"
        title="Projects."
        lede="From our flagship programme to the bootcamps that started it all, here is how RISE Initiative invests in young people across Oyo."
      />

      <section className="py-16 sm:py-20" aria-labelledby="projects-list-heading">
        <Container>
          <h2 id="projects-list-heading" className="sr-only">
            All projects
          </h2>
          <ul className="flex flex-col gap-12 sm:gap-16">
            {projects.map((project, index) => (
              <ProjectIndexRow
                key={project.slug}
                project={project}
                divider={index < projects.length - 1}
              />
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
