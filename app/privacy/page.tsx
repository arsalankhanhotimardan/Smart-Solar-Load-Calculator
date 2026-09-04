import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy information for Green Engineering Tools Solar Calculator.",
  alternates: { canonical: "https://solarcalculator.greenengineeringtools.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-400">Last updated: September 4, 2026</p>
        <h1 className="mt-4 text-4xl font-black text-white">Privacy Policy</h1>
        <div className="mt-8 space-y-7 text-sm leading-7 text-slate-400">
          <Section title="Calculator data">
            The solar calculator does not require an account. Calculator inputs are saved in your browser's local storage so your unfinished workspace can survive a refresh. The current calculator does not send those saved load selections to a user-account database.
          </Section>
          <Section title="Catalog and server data">
            Appliance and panel reference catalogs are loaded from the site's server-side database. These catalog requests do not require you to provide a name, email address or account.
          </Section>
          <Section title="Voice input">
            Voice input uses the browser's Web Speech Recognition capability when available and only after you activate it. Speech-recognition processing can depend on your browser/device provider and may involve that provider's services. Do not use voice input if you do not want to use the browser's speech-recognition feature.
          </Section>
          <Section title="Advertising and cookies">
            The site may use Google AdSense after advertising is enabled. Google and its partners may use cookies, local storage or similar technologies to provide, measure and personalize advertising where permitted. Where required for users in the EEA, the UK and Switzerland, the site will use a Google-certified consent management platform before serving personalized advertising.
          </Section>
          <Section title="Analytics and logs">
            Hosting providers and security systems may process standard technical logs such as IP address, browser/device information, request time and requested page for security, reliability and diagnostics. If analytics are enabled, this policy should be updated to identify the analytics service and consent settings used.
          </Section>
          <Section title="Your choices">
            You can clear the calculator's locally saved workspace by using the reset control or clearing site data in your browser. Browser settings can also control cookies, local storage and microphone permissions.
          </Section>
          <Section title="Changes">
            This policy may be updated when site features, advertising, analytics or legal requirements change. Material changes should be reflected by updating the date shown on this page.
          </Section>
          <Section title="Contact">
            Use the Contact page on this site for privacy questions or requests.
          </Section>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="text-xl font-black text-white">{title}</h2><p className="mt-2">{children}</p></section>;
}
