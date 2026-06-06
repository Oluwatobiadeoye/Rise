import Image from "next/image";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { hasBio, type TeamMember } from "@/lib/team";

type TeamMemberCardProps = {
  member: TeamMember;
  /** Render the closing divider under the content (omitted on the last row). */
  divider?: boolean;
};

/** A full-width member row: photo on the left, content on the right. */
export function TeamMemberCard({ member, divider = true }: TeamMemberCardProps) {
  const meta = [member.profession, member.location].filter(Boolean).join(" · ");

  return (
    <li className="grid items-start gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-12">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl shadow-md">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={`Portrait of ${member.name}`}
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            placeholder="blur"
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder
            label={`Photo of ${member.name}`}
            rounded="rounded-xl"
            className="size-full"
          />
        )}
      </div>

      {/* The divider lives in the content column, so it never reaches the photo. */}
      <div className="flex flex-col">
        <h3 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          {member.name}
        </h3>
        <p className="mt-2 font-semibold text-primary">{member.role}</p>
        {meta ? <p className="mt-1 text-slate">{meta}</p> : null}

        {hasBio(member) ? (
          <>
            <div className="mt-5 flex flex-col gap-4">
              {member.bio?.map((paragraph) => (
                <p key={paragraph} className="leading-relaxed text-slate">
                  {paragraph}
                </p>
              ))}
            </div>
            {member.school ? (
              <p className="mt-5 text-sm italic text-slate/80">{member.school}</p>
            ) : null}
          </>
        ) : (
          <p className="mt-5 font-medium text-slate/70">Full bio coming soon.</p>
        )}

        {divider ? <hr className="mt-10 border-t border-line/70" /> : null}
      </div>
    </li>
  );
}
