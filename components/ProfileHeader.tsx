import { about } from "@/content/projects";

/**
 * The name spans the full width on its own, above both columns, so the list
 * column starts level with the bio rather than level with the name.
 */
export function ProfileHeader() {
  return (
    <header className="enter lg:shrink-0 lg:pt-10">
      <h1 className="display text-[clamp(2.25rem,6vw,3rem)]">{about.name}</h1>

      <p className="row-meta mt-3 flex items-center gap-1.5">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5 text-faint"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {about.location}
      </p>
    </header>
  );
}
