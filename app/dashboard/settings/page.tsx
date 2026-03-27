import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getPublicAppSettings } from "@/lib/app-settings";
import { SettingsForm } from "@/components/settings-form";

export default async function DashboardSettingsPage() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const settings = await getPublicAppSettings();

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-6 md:px-8 md:py-8">
      <section className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-card backdrop-blur md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Customer page template</h1>
        <p className="mt-3 text-sm leading-7 text-black/60">
          This is the default template every customer sees. Update the advisor photo, maps link,
          entrance photos, review links, and featured reviews here so future appointments inherit
          the same polished arrival page automatically.
        </p>
        <SettingsForm settings={settings} />
      </section>
    </main>
  );
}
