import { BadgeCheck, ChartLine, ShieldCheck, Timer } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { LogoMark } from "@/components/brand/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser, serverFetch } from "@/lib/api-server";
import { safeNext } from "@/lib/redirect";
import type { AuthConfig } from "@/lib/types";

export const metadata: Metadata = {
  title: "Injira",
  description: "Injira cyangwa wiyandikishe kuri Tsinda Neza ukoresheje konti yawe ya Gmail.",
};

const BENEFITS = [
  { icon: ChartLine, text: "Bika aho ugeze: amasomo, imyitozo n’ibizamini byose." },
  { icon: Timer, text: "Kora ibizamini by’igerageza bimeze nk’ibya Polisi." },
  { icon: BadgeCheck, text: "Menya igihe witeguye kujya gukora ikizamini." },
];

async function SignInPanel({ searchParams }: { searchParams: PageProps<"/injira">["searchParams"] }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  if (await getSessionUser()) redirect(safeNext(next));

  let config: AuthConfig | null = null;
  try {
    config = await serverFetch<AuthConfig>("/auth/config");
  } catch {
    config = null;
  }

  if (config?.google_client_id) return <GoogleSignIn clientId={config.google_client_id} next={next} />;

  return (
    <div role="status" className="rounded-2xl bg-surface-2 p-4 text-center text-sm leading-relaxed text-muted">
      <p>
        {config
          ? "Kwinjira ntibirashoboka muri aka kanya. Ongera ugerageze nyuma gato."
          : "Seriveri ntiboneka muri aka kanya. Ongera ugerageze mu kanya gato."}
      </p>
      {config && process.env.NODE_ENV === "development" && (
        <p className="mt-3 border-t border-line pt-3 text-xs">
          Ku wubaka urubuga: shyira <code className="font-semibold text-ink">GOOGLE_CLIENT_ID</code> muri{" "}
          <code className="font-semibold text-ink">gira-perimi-be/.env</code>, hanyuma wongere utangize API.
        </p>
      )}
    </div>
  );
}

export default function SignInPage({ searchParams }: PageProps<"/injira">) {
  return (
    <section className="container-page grid min-h-[calc(100dvh-4rem)] items-center gap-10 py-10 lg:grid-cols-2 lg:py-16">
      <div className="relative hidden overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-600 via-brand-700 to-ocean-700 p-12 text-white shadow-lift lg:block">
        <div aria-hidden className="bg-grid absolute inset-0 opacity-15" />
        <div aria-hidden className="absolute -bottom-20 -right-16 size-80 rounded-full bg-sun-300/30 blur-3xl" />
        <div className="relative">
          <LogoMark className="size-14" />
          <h2 className="mt-10 text-4xl font-extrabold leading-tight">Urugendo rwawe rugana kuri perimi rutangirira hano.</h2>
          <ul className="mt-10 space-y-5">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-4 text-lg text-white/90">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15">
                  <Icon className="size-5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <div className="mt-12 h-1.5 w-full rounded-full bg-[repeating-linear-gradient(90deg,#fad201_0_28px,transparent_28px_48px)] opacity-70" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="card p-7 sm:p-10">
          <LogoMark className="size-12 lg:hidden" />
          <h1 className="mt-6 text-3xl font-extrabold lg:mt-0">Murakaza neza!</h1>
          <p className="mt-3 leading-relaxed text-muted">
            Injira ukoresheje konti yawe ya <strong className="text-ink">Gmail</strong>. Niba ari ubwa mbere, konti
            yawe ihita ifungurwa.
          </p>
          <div className="mt-8">
            <Suspense fallback={<Skeleton className="h-11 w-full rounded-full" />}>
              <SignInPanel searchParams={searchParams} />
            </Suspense>
          </div>
          <p className="mt-8 flex items-start gap-2.5 text-xs leading-relaxed text-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-500" />
            Dukoresha izina, imeyili n’ifoto bya konti yawe ya Google gusa, kugira ngo tubike aho ugeze. Ntidushobora
            kubona ijambobanga ryawe.
          </p>
        </div>
      </div>
    </section>
  );
}
