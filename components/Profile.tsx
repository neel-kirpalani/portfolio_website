import Image from "next/image";
import { about } from "@/content/projects";
import { brandIcons } from "./icons";

function BrandMark({ name }: { name: keyof typeof brandIcons }) {
  const icon = brandIcons[name];
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-[18px] shrink-0"
      fill={icon.color}
    >
      <path d={icon.path} />
    </svg>
  );
}

function MailMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-[18px] shrink-0"
      fill="none"
      stroke="var(--color-ink)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3.5 7.5 8.5 6 8.5-6" />
    </svg>
  );
}

function Chip({
  href,
  label,
  handle,
  icon,
}: {
  href: string;
  label: string;
  handle: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel="noreferrer noopener"
      aria-label={label}
      className="pill"
    >
      <span className="pill__inner">
        {icon}
        <span className="text-sm font-medium leading-none">{handle}</span>
      </span>
    </a>
  );
}

export function Profile() {
  return (
    // Indented on large screens so the name above it sits out on its own;
    // the name and the body copy deliberately do not share a left edge. Kept
    // shallow: every extra pixel of indent narrows the bio, which wraps to
    // more lines and pushes "Find me" out of the viewport.
    <div className="lg:pl-10">
      <div className="flex items-start gap-4">
        <Image
          src="/neel.jpg"
          alt="Neel Kirpalani"
          width={56}
          height={56}
          priority
          className="size-14 shrink-0 rounded-full object-cover"
        />
        {/* 15px with normal leading: this column has to fit the viewport,
            because on large screens it does not scroll. */}
        <div className="space-y-2.5 text-[0.9375rem] leading-normal text-ink/90">
          {about.bio.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Placed to line up with the bio text, clearing the avatar. */}
      <div className="mt-5 lg:pl-[72px]">
        <p className="mb-2 text-sm text-muted">Find me</p>
        <div className="flex flex-wrap items-center gap-2">
          {about.social.map((link) => (
            <Chip
              key={link.key}
              href={link.href}
              label={link.label}
              handle={link.handle}
              icon={<BrandMark name={link.key} />}
            />
          ))}
          <Chip
            href={`mailto:${about.links.email}`}
            label={`Email ${about.links.email}`}
            handle={about.links.email}
            icon={<MailMark />}
          />
        </div>
      </div>
    </div>
  );
}
