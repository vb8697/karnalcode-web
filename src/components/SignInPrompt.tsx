import Link from "next/link";

export function SignInPrompt({ message }: { message: string }) {
  return (
    <div className="rounded-[22px] bg-indigo p-6 text-white">
      <p className="text-xs font-bold tracking-wider text-sun">JOIN TO HELP</p>
      <p className="mt-2 font-display text-xl font-bold leading-snug">{message}</p>
      <Link href="/login" className="mt-4 inline-block rounded-full bg-sun px-5 py-2.5 text-sm font-extrabold text-indigo">
        Sign in or join free
      </Link>
    </div>
  );
}
