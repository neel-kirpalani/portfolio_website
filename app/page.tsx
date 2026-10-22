import { Profile } from "@/components/Profile";
import { ProfileHeader } from "@/components/ProfileHeader";
import {
  Row,
  type RowChapter,
  type RowFact,
  type RowLink,
} from "@/components/Row";
import { Section } from "@/components/Section";
import {
  activities,
  awards,
  education,
  experience,
  projects,
  type Project,
} from "@/content/projects";

function projectFacts(project: Project): RowFact[] {
  const facts: RowFact[] = [
    { label: "Role", value: project.role },
    { label: "Stack", value: project.stack.join(" · ") },
  ];
  if (project.recognition) {
    facts.push({ label: "Recognition", value: project.recognition });
  }
  return facts;
}

/** The full write-up, inline. There are no separate project pages. */
function projectChapters(project: Project): RowChapter[] {
  return [
    project.problem && { label: "The problem", body: project.problem },
    project.approach && { label: "The approach", body: project.approach },
    project.outcome && { label: "The outcome", body: project.outcome },
  ].filter(Boolean) as RowChapter[];
}

function projectLinks(project: Project): RowLink[] {
  const links: RowLink[] = [];
  if (project.href) {
    links.push({
      label: project.linkLabel ?? "Visit site",
      href: project.href,
      external: true,
    });
  }
  if (project.appStore) {
    links.push({ label: "App Store", href: project.appStore, external: true });
  }
  return links;
}

export default function Home() {
  return (
    // On large screens the page itself never scrolls: the name sits above both
    // columns, the profile column is fixed, and only the list column scrolls.
    <main className="mx-auto max-w-[78rem] px-6 py-10 sm:px-8 lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden lg:py-0">
      <ProfileHeader />

      <div className="mt-10 lg:mt-0 lg:flex lg:min-h-0 lg:flex-1 lg:gap-16 lg:pt-12">
        <div data-pane="profile" className="scroll-pane enter lg:w-[31.5rem] lg:shrink-0 lg:overflow-y-auto lg:pb-2">
          <Profile />
        </div>

        <div data-pane="list" className="stagger scroll-pane mt-14 min-w-0 flex-1 lg:mt-0 lg:overflow-y-auto lg:pb-10">
          <Section id="projects" title="Projects">
            {projects.map((project) => (
              <Row
                key={project.slug}
                title={project.title}
                subtitle={project.summary}
                meta={project.year}
                logo={project.logo}
                detail={project.premise}
                facts={projectFacts(project)}
                chapters={projectChapters(project)}
                links={projectLinks(project)}
              />
            ))}
          </Section>

          <Section id="awards" title="Awards">
            {awards.map((award) => (
              <Row
                key={`${award.title}-${award.meta}`}
                title={award.title}
                subtitle={award.org}
                meta={award.meta}
                logo={award.logo}
                detail={award.detail}
              />
            ))}
          </Section>

          <Section id="experience" title="Experience">
            {experience.map((entry) => (
              <Row
                key={entry.title}
                title={entry.title}
                subtitle={entry.org}
                meta={entry.meta}
                logo={entry.logo}
                detail={entry.detail}
              />
            ))}
          </Section>

          <Section id="activities" title="Activities">
            {activities.map((entry) => (
              <Row
                key={entry.title}
                title={entry.title}
                subtitle={entry.org}
                meta={entry.meta}
                logo={entry.logo}
                detail={entry.detail}
              />
            ))}
          </Section>

          <Section id="education" title="Education" lowercase={false}>
            <Row
              title={education.school}
              meta={education.meta}
              logo={education.logo}
            />
          </Section>

        </div>
      </div>
    </main>
  );
}
