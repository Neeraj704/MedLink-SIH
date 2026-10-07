"use client";

import { FOOTER, LINKS } from "@/lib/landing-data";
import { useLanding } from "./landing-context";
import { Logo } from "./Logo";
import { Container } from "./primitives";

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <nav aria-label={title}>
      <h3 className="text-[13px] font-semibold text-ink">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="text-[14px] text-ink-2 hover:text-ink">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  const { openOnboarding, startTour, reduceMotion, setReduceMotion, smoothScroll, setSmoothScroll } = useLanding();
  const external = [
    { label: "Live prototype", href: LINKS.live },
    { label: "GitHub", href: LINKS.github },
  ];

  return (
    <footer className="border-t border-hairline bg-canvas-alt pb-10 pt-16">
      <Container wide>
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-[280px] text-[14px] text-ink-2">One diagnosis, four vocabularies, one FHIR record.</p>
          </div>
          <FooterColumn title="Explore" links={FOOTER.explore} />
          <FooterColumn title="Platform" links={FOOTER.platform} />
          <nav aria-label="Project">
            <h3 className="text-[13px] font-semibold text-ink">Project</h3>
            <ul className="mt-4 space-y-2.5">
              {external.map((l) => (
                <li key={l.label}>
                  <a href={l.href} {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="text-[14px] text-ink-2 hover:text-ink">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h3 className="text-[13px] font-semibold text-ink">Preferences</h3>
            <ul className="mt-4 space-y-2.5 text-[14px] text-ink-2">
              <li>
                <button type="button" onClick={() => startTour()} className="hover:text-ink">
                  Take the tour
                </button>
              </li>
              <li>
                <button type="button" onClick={() => openOnboarding(0)} className="hover:text-ink">
                  Replay welcome
                </button>
              </li>
              <li>
                <label className="flex cursor-pointer items-center gap-2 hover:text-ink">
                  <input type="checkbox" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} className="accent-[var(--blue)]" />
                  Reduce motion
                </label>
              </li>
              <li>
                <label className="flex cursor-pointer items-center gap-2 hover:text-ink">
                  <input type="checkbox" checked={smoothScroll} onChange={(e) => setSmoothScroll(e.target.checked)} className="accent-[var(--blue)]" />
                  Smooth scrolling
                </label>
              </li>
            </ul>
          </div>
        </div>

        <ul className="mt-12 flex flex-wrap gap-2" aria-label="Standards">
          {FOOTER.standards.map((s) => (
            <li key={s} className="rounded-full border border-hairline px-3 py-1 text-[12px] text-ink-2">
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-[12px] leading-relaxed text-ink-3">{FOOTER.notice}</p>
        <p className="mt-3 text-[12px] text-ink-3">{FOOTER.copyright}</p>
      </Container>
    </footer>
  );
}
