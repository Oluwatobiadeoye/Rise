import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Project } from "@/lib/projects";

type ProjectIndexRowProps = {
  project: Project;
  /** Render the closing divider (omitted on the last row). */
  divider?: boolean;
};

const statusLabel: Record<Project["status"], string> = {
  active: "Active",
  past: "Past",
};

/** A full-width project row on the index: status pill, name, summary, "Read more". */
export function ProjectIndexRow({ project, divider = true }: ProjectIndexRowProps) {
  const href = `/projects/${project.slug}`;

  return (
    <li className="flex flex-col">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-pill px-3 py-1 font-body text-xs font-bold uppercase tracking-[0.12em]",
            project.status === "active"
              ? "bg-evergreen-50 text-primary"
              : "bg-cloud text-slate",
          )}
        >
          {project.status === "active" ? (
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-emerald"
            />
          ) : null}
          {statusLabel[project.status]} · {project.period}
        </span>
      </div>

      <h2 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
        <Link href={href} className="transition-colors hover:text-primary">
          {project.name}
        </Link>
      </h2>

      <p className="mt-3 line-clamp-5 max-w-2xl text-lg leading-relaxed text-slate">
        {project.intro[0]}
      </p>

      <Link
        href={href}
        className="group mt-5 inline-flex items-center gap-1.5 self-start font-semibold text-primary transition-colors hover:text-primary-press"
      >
        Read more
        <ArrowRight
          className="size-[15px] transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        />
        <span className="sr-only"> about {project.name}</span>
      </Link>

      {divider ? <hr className="mt-12 border-t border-line/70" /> : null}
    </li>
  );
}
