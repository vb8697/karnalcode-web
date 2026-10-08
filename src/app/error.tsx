"use client";

import { Button, Main } from "@/components/ui";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <Main className="mx-auto flex w-full max-w-xl flex-col items-center px-5 py-24 text-center">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-muted">Please try again. If it keeps happening, reload the page.</p>
      <Button onClick={reset} className="mt-8">
        Try again
      </Button>
    </Main>
  );
}
