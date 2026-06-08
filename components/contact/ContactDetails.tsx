import { Eyebrow } from "@/components/shared/Eyebrow";
import { socialIcons } from "@/components/shared/icons";
import { contactEmails, socials } from "@/lib/site";

const methods: ReadonlyArray<{ label: string; email: string }> = [
  { label: "General enquiries", email: contactEmails.general },
  { label: "Partnerships and sponsorship", email: contactEmails.partnerships },
  { label: "Mentorship programme", email: contactEmails.mentorship },
  { label: "Media and press", email: contactEmails.media },
];

/** Static contact directory: email methods and social channels. */
export function ContactDetails() {
  return (
    <section aria-labelledby="contact-details-heading">
      <Eyebrow>Reach us</Eyebrow>
      <h2
        id="contact-details-heading"
        className="text-section-title mt-3 text-ink"
      >
        Contact details.
      </h2>

      <dl className="mt-8 flex flex-col gap-5">
        {methods.map((method) => (
          <div
            key={method.label}
            className="rounded-lg border border-line/60 bg-surface p-5 shadow-md"
          >
            <dt className="font-display text-sm font-semibold text-ink">
              {method.label}
            </dt>
            <dd className="mt-1">
              <a
                href={`mailto:${method.email}`}
                className="text-slate transition-colors hover:text-primary focus-visible:text-primary"
              >
                {method.email}
              </a>
            </dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-10 font-display text-sm font-semibold text-ink">
        Follow us
      </h3>
      <ul className="mt-4 flex flex-col gap-3">
        {socials.map((social) => {
          const Icon = socialIcons[social.key];
          return (
            <li key={social.key}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="group inline-flex items-center gap-3 text-slate transition-colors hover:text-primary focus-visible:text-primary"
              >
                <span className="grid size-10 place-items-center rounded-full bg-evergreen-50 text-primary">
                  <Icon className="size-[18px]" />
                </span>
                <span>
                  <span className="block font-medium text-ink">
                    {social.label}
                  </span>
                  <span className="block text-sm text-mist">
                    {social.handle}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
