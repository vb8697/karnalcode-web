import { HeroActions } from "@/components/HeroActions";
import { HomeFeed } from "@/components/HomeFeed";
import { SignedOutOnly } from "@/components/SignedOutOnly";
import { SiteHeader } from "@/components/SiteHeader";
import { ButtonLink, Main, Tag } from "@/components/ui";

const steps = [
  { n: "1", title: "Join with your college email", text: "Sign up in a minute and tell us your course, branch and semester." },
  { n: "2", title: "Ask, answer, share", text: "Post a doubt, share a solution or upload notes. Everything is public to Karnal students." },
  { n: "3", title: "Grow with seniors", text: "Learn from placed seniors and alumni, earn points and help the next batch." },
];

const features = [
  { title: "Previous year papers", text: "Find past papers by course, semester and year. Share the ones you have.", tone: "bg-peach" },
  { title: "Doubts solved by seniors", text: "Ask anything. Verified seniors and placed alumni answer, and the best solution is marked.", tone: "bg-teal-tint" },
  { title: "Project help", text: "Stuck on a final-year project? Post it with your stack and get unstuck.", tone: "bg-indigo-tint" },
  { title: "Built for Karnal", text: "Content and people from the colleges around you, in one place.", tone: "bg-sun-tint" },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <Main>
        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div>
            <span className="inline-block rounded-full bg-peach px-3.5 py-2 text-[13px] font-bold text-peach-text">Built for IT students in Karnal</span>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Learn together.
              <br />
              <span className="text-primary">Place together.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Notes, PYQs and doubts solved by verified seniors. Real placement guidance from alumni who sat where you sit.
            </p>
            <HeroActions />
          </div>

          <div aria-label="Example of a doubt and its solution" role="img" className="relative">
            <div className="absolute -right-4 -top-4 size-40 rounded-full bg-peach" aria-hidden />
            <div className="relative rounded-[26px] border border-line bg-white p-6 shadow-[0_20px_50px_-20px_rgba(31,42,92,0.25)]">
              <p className="text-xs font-bold tracking-wider text-muted">EXAMPLE DOUBT</p>
              <p className="mt-2 font-display text-xl font-extrabold leading-snug">Why does my code throw NullPointerException on line 12?</p>
              <div className="mt-3 flex gap-2">
                <Tag>Java</Tag>
                <Tag tone="indigo">Sem 4</Tag>
              </div>
              <div className="mt-5 rounded-2xl border-2 border-teal bg-teal-tint p-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="rounded-full bg-teal px-2.5 py-1 text-xs font-bold text-white">Accepted solution</span>
                  <span className="font-bold">A placed senior</span>
                </div>
                <p className="mt-2 text-[15px] leading-relaxed">You declared the list but never created it. Initialize it with new ArrayList and the error goes away.</p>
              </div>
            </div>
          </div>
        </section>

        <HomeFeed />

        <SignedOutOnly>
        <section className="border-y border-line bg-white" aria-labelledby="how-heading">
          <div className="mx-auto w-full max-w-6xl px-5 py-14">
            <h2 id="how-heading" className="font-display text-3xl font-extrabold tracking-tight">
              How it works
            </h2>
            <ol className="mt-8 grid gap-6 md:grid-cols-3">
              {steps.map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-extrabold text-white">{s.n}</span>
                  <div>
                    <h3 className="font-display text-lg font-extrabold">{s.title}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-14" aria-labelledby="features-heading">
          <h2 id="features-heading" className="font-display text-3xl font-extrabold tracking-tight">
            Everything an IT student needs
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <li key={f.title} className={`rounded-[22px] p-6 ${f.tone}`}>
                <h3 className="font-display text-xl font-extrabold">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-indigo/80">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[28px] bg-indigo p-8 text-white sm:flex-row sm:items-center sm:p-10">
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight">Got a doubt? Someone has the answer.</h2>
              <p className="mt-2 text-indigo-tint">Free for every student in Karnal.</p>
            </div>
            <ButtonLink href="/ask" className="!bg-sun !text-indigo shrink-0">
              Ask your first doubt
            </ButtonLink>
          </div>
        </section>
        </SignedOutOnly>
      </Main>
    </>
  );
}
