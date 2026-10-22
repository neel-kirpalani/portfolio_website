"use client";

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type RowLink = { label: string; href: string; external?: boolean };
export type RowFact = { label: string; value: string };
export type RowChapter = { label: string; body: string };

/**
 * One line of a list: logo, title, a short qualifier, the year, a chevron.
 * Expands in place; the whole write-up lives here rather than on a separate
 * page, so the site stays a single scroll.
 *
 * There are no static dividers. The rule under a row is a transparent 2px
 * border that only takes colour on hover, which is what keeps a long list from
 * reading as a table.
 *
 * Expansion uses the grid-rows 0fr/1fr trick so it animates without measuring
 * anything in JavaScript, and a transition rather than keyframes so toggling
 * quickly retargets mid-flight instead of restarting from zero.
 */
export function Row({
  title,
  subtitle,
  meta,
  logo,
  detail,
  facts,
  chapters,
  links,
}: {
  title: string;
  subtitle?: string;
  meta: string;
  logo?: string;
  detail?: string;
  facts?: RowFact[];
  chapters?: RowChapter[];
  links?: RowLink[];
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const hasPanel = Boolean(
    detail || facts?.length || chapters?.length || links?.length,
  );

  const heading = (
    <>
      {/* Reserved slot keeps every title aligned whether or not a mark exists. */}
      <span aria-hidden className="size-6 shrink-0">
        {logo && (
          <Image
            src={logo}
            alt=""
            width={24}
            height={24}
            className="size-6 rounded-lg object-contain"
          />
        )}
      </span>

      <span className="row-title min-w-0 flex-1 sm:truncate">
        {title}
        {/* On a phone the qualifier pushes rows to three lines, so it is
            revealed at sm and up. The detail is one tap away regardless. */}
        {subtitle && (
          <span className="hidden text-muted sm:inline"> · {subtitle}</span>
        )}
      </span>

      <span className="row-meta shrink-0">{meta}</span>

      {hasPanel && (
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`chevron size-4 shrink-0 text-faint ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      )}
    </>
  );

  const base =
    "flex w-full items-center gap-2 border-b-2 border-transparent px-1 py-2 text-left";

  return (
    <li>
      {hasPanel ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className={`${base} row-press cursor-pointer hover:border-hairline`}
        >
          {heading}
        </button>
      ) : (
        <div className={base}>{heading}</div>
      )}

      {hasPanel && (
        <div
          id={panelId}
          className={`disclosure grid ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            {/* Indented to line up with the title, clearing the logo slot. */}
            <div className="px-1 pt-1 pb-8 pl-9">
              {detail && (
                <p className="max-w-prose text-base leading-relaxed text-ink/80">
                  {detail}
                </p>
              )}

              {facts && facts.length > 0 && (
                <dl className="mt-6 grid gap-x-8 gap-y-2.5 sm:grid-cols-[7rem_1fr]">
                  {facts.map((fact) => (
                    <div key={fact.label} className="contents">
                      <dt className="row-meta">{fact.label}</dt>
                      <dd className="text-[0.9375rem] leading-relaxed text-ink/80">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {chapters && chapters.length > 0 && (
                <div className="mt-8 space-y-6">
                  {chapters.map((chapter) => (
                    <div key={chapter.label}>
                      <p className="text-sm font-medium text-ink">
                        {chapter.label}
                      </p>
                      <p className="mt-2 max-w-prose text-[0.9375rem] leading-relaxed text-ink/80">
                        {chapter.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {links && links.length > 0 && (
                <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
                  {links.map((link) =>
                    link.external ? (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="link-underline row-meta text-ink"
                        >
                          {link.label} ↗
                        </a>
                      </li>
                    ) : (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="link-underline row-meta text-ink"
                        >
                          {link.label} →
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
