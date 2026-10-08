import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { SiteHeader } from "@/components/SiteHeader";
import { Main } from "@/components/ui";

export const metadata: Metadata = { title: "Sign in" };

const perks = ["Ask doubts and get answers from seniors", "Download notes and previous year papers", "Share what you know and earn points"];

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <Main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-5 py-10 lg:grid-cols-2 lg:py-16">
        <section aria-label="Why join" className="hidden flex-col justify-center rounded-[28px] bg-peach p-10 lg:flex">
          <h2 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight">
            Your seniors
            <br />
            are waiting.
          </h2>
          <ul className="mt-8 flex flex-col gap-4 text-lg">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-white" aria-hidden>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
                {p}
              </li>
            ))}
          </ul>
        </section>

        <div className="mx-auto w-full max-w-md">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Sign in or join</h1>
          <p className="mb-8 mt-2 text-muted">Use your college email so we can verify you.</p>
          <AuthForm />
        </div>
      </Main>
    </>
  );
}
