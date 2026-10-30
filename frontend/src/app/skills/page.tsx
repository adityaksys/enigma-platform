"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type Skill = {
  id: number;
  name: string;
  category: string;
  description: string;
};

export default function SkillsPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSkills() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        // These endpoints will be added to Django in the next step.
        const [available, profile] = await Promise.all([
          apiRequest<Skill[]>("/api/skills/", {}, token),
          apiRequest<{ skills: number[] }>(
            "/api/profiles/me/",
            {},
            token,
          ),
        ]);

        setSkills(available);
        setSelected(profile.skills ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load skills.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadSkills();
  }, [router]);

  function toggleSkill(id: number) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((skillId) => skillId !== id)
        : [...current, id],
    );
    setMessage("");
  }

  async function saveSkills() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiRequest("/api/profiles/me/", {
        method: "PATCH",
        body: JSON.stringify({ skills: selected }),
      }, token);

      setMessage("Your skills have been saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your skills.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main data-enigma-page className="min-h-screen bg-[#f8f7f3] text-[#20251f]">
      <header className="border-b border-[#e7e5dd] px-6 py-5 lg:px-12">
        <Link href="/" className="text-sm font-semibold tracking-[0.22em]">
          ENIGMA{" "}
          <span className="font-normal text-[#77796f]">
            / SKILLS
          </span>
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-14 lg:px-12">
        <p className="text-xs uppercase tracking-[0.22em] text-[#657b60]">
          What you bring to the community
        </p>

        <h1 className="mt-4 font-serif text-5xl tracking-tight md:text-6xl">
          Your skills.
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#696b62] md:text-base">
          Select the technologies and disciplines you know or are learning.
          Your skills will help ENIGMA members discover collaborators and
          build better teams.
        </p>

        {loading ? (
          <p className="mt-12 text-sm text-[#696b62]">
            Loading skills...
          </p>
        ) : (
          <>
            <div className="mt-10 flex items-center justify-between">
              <p className="text-sm text-[#696b62]">
                {selected.length} selected
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelected([]);
                  setMessage("");
                }}
                className="text-sm text-[#657b60] underline underline-offset-4"
              >
                Clear selection
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => {
                const active = selected.includes(skill.id);

                return (
                  <button
                    type="button"
                    key={skill.id}
                    aria-pressed={active}
                    onClick={() => toggleSkill(skill.id)}
                    className={`min-h-36 border p-5 text-left transition ${
                      active
                        ? "border-[#657b60] bg-[#edf2e9]"
                        : "border-[#e7e5dd] bg-white hover:border-[#a8b39f]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-serif text-2xl">
                        {skill.name}
                      </h2>
                      <span className="text-sm text-[#657b60]">
                        {active ? "✓" : "+"}
                      </span>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[#657b60]">
                      {skill.category}
                    </p>
                    {skill.description && (
                      <p className="mt-2 text-sm leading-6 text-[#696b62]">
                        {skill.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {skills.length === 0 && !error && (
              <p className="mt-6 border border-[#e7e5dd] bg-white p-6 text-sm text-[#696b62]">
                No skills are available yet. We&apos;ll add skills to the
                database next.
              </p>
            )}

            {error && (
              <p role="alert" className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </p>
            )}

            {message && (
              <p role="status" className="mt-6 border border-[#d8e4d4] bg-[#edf4e9] p-4 text-sm text-[#344c3c]">
                {message}
              </p>
            )}

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-6 text-[#77796f]">
                Choose the skills that best represent you.
              </p>
              <button
                type="button"
                onClick={saveSkills}
                disabled={saving || loading}
                className="bg-[#344c3c] px-8 py-4 text-sm text-white transition hover:bg-[#25382b] disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save skills"}{" "}
                <span className="ml-5">↗</span>
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
