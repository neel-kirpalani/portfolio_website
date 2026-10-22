export function Section({
  id,
  title,
  lowercase = true,
  children,
}: {
  id?: string;
  title: string;
  /** Education names institutions, so it keeps its own capitalisation. */
  lowercase?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-10 first:mt-0">
      <h2 className="section-title">{title}</h2>
      {/* No dividers. Row rules exist, but only while a row is hovered. */}
      <ul className={`mt-2 space-y-2 ${lowercase ? "casing-lower" : ""}`}>
        {children}
      </ul>
    </section>
  );
}
