import { SiteHeader } from "@/components/SiteHeader";
import { ButtonLink, Main } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <Main className="mx-auto flex w-full max-w-xl flex-col items-center px-5 py-24 text-center">
        <p className="font-display text-7xl font-extrabold text-primary">404</p>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">We could not find that page</h1>
        <p className="mt-2 text-muted">The link may be old, or the page may have moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/doubts">Browse doubts</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Go home
          </ButtonLink>
        </div>
      </Main>
    </>
  );
}
