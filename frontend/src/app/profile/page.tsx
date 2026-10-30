"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type Profile = {
  id: number;
  full_name: string;
  bio: string;
  college: string;
  course: string;
  branch: string;
  academic_year: string | number | null;
  skills: number[];
  github_url: string;
  linkedin_url: string;
  portfolio_url: string;
};

type ProfileForm = Omit<Profile, "id" | "skills">;

const emptyProfile: ProfileForm = {
  full_name: "",
  bio: "",
  college: "",
  course: "",
  branch: "",
  academic_year: "",
  github_url: "",
  linkedin_url: "",
  portfolio_url: "",
};

const inputClass =
  "mt-2 w-full border border-[#deded5] bg-[#fdfcf9] px-4 py-3 outline-none focus:border-[#657b60]";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await apiRequest<Profile>(
          "/api/profiles/me/",
          {},
          token,
        );

        setProfile({
          full_name: data.full_name ?? "",
          bio: data.bio ?? "",
          college: data.college ?? "",
          course: data.course ?? "",
          branch: data.branch ?? "",
          academic_year: data.academic_year ?? "",
          github_url: data.github_url ?? "",
          linkedin_url: data.linkedin_url ?? "",
          portfolio_url: data.portfolio_url ?? "",
        });
      } catch (err) {
        const text = err instanceof Error ? err.message : "";

        if (text.includes("(401)")) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          router.replace("/login");
          return;
        }

        setError(text || "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  function updateField(
    field: keyof ProfileForm,
    value: string,
  ) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);

    try {
      const saved = await apiRequest<Profile>(
        "/api/profiles/me/",
        {
          method: "PATCH",
          body: JSON.stringify(profile),
        },
        token,
      );

      setProfile({
        full_name: saved.full_name ?? "",
        bio: saved.bio ?? "",
        college: saved.college ?? "",
        course: saved.course ?? "",
        branch: saved.branch ?? "",
        academic_year: saved.academic_year ?? "",
        github_url: saved.github_url ?? "",
        linkedin_url: saved.linkedin_url ?? "",
        portfolio_url: saved.portfolio_url ?? "",
      });

      setMessage("Your profile has been saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your profile.",
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
            / MEMBER PROFILE
          </span>
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-14 lg:px-12">
        <p className="text-xs uppercase tracking-[0.22em] text-[#657b60]">
          Your identity at ENIGMA
        </p>

        <h1 className="mt-4 font-serif text-5xl tracking-tight md:text-6xl">
          Build your profile.
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#696b62] md:text-base">
          Introduce yourself, share what you are learning, and help the
          ENIGMA community discover your interests and strengths.
        </p>

        {loading ? (
          <p className="mt-12 text-sm text-[#696b62]">
            Loading your profile...
          </p>
        ) : (
          <form className="mt-12 space-y-10" onSubmit={handleSubmit}>
            <section className="border border-[#e7e5dd] bg-white p-6 md:p-9">
              <p className="text-xs tracking-[0.18em] text-[#657b60]">
                01 / PERSONAL INFORMATION
              </p>

              <div className="mt-7 grid gap-6 md:grid-cols-2">
                <label className="text-sm">
                  Full name
                  <input
                    name="full_name"
                    required
                    value={profile.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                    placeholder="Your full name"
                    className={inputClass}
                  />
                </label>

                <label className="text-sm">
                  College
                  <input
                    name="college"
                    value={profile.college}
                    onChange={(e) => updateField("college", e.target.value)}
                    placeholder="Your institution"
                    className={inputClass}
                  />
                </label>

                <label className="text-sm">
                  Course
                  <input
                    name="course"
                    value={profile.course}
                    onChange={(e) => updateField("course", e.target.value)}
                    placeholder="e.g. B.Tech"
                    className={inputClass}
                  />
                </label>

                <label className="text-sm">
                  Branch
                  <input
                    name="branch"
                    value={profile.branch}
                    onChange={(e) => updateField("branch", e.target.value)}
                    placeholder="e.g. Computer Science"
                    className={inputClass}
                  />
                </label>

                <label className="text-sm md:col-span-2">
                  Academic year
                  <select
                    name="academic_year"
                    value={profile.academic_year ?? ""}
                    onChange={(e) =>
                      updateField("academic_year", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select your academic year</option>
                    <option value="1">First year</option>
                    <option value="2">Second year</option>
                    <option value="3">Third year</option>
                    <option value="4">Fourth year</option>
                  </select>
                </label>

                <label className="text-sm md:col-span-2">
                  Short introduction
                  <textarea
                    name="bio"
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    placeholder="What are you learning? What do you want to build?"
                    className={`${inputClass} resize-y`}
                  />
                </label>
              </div>
            </section>

            <section className="border border-[#e7e5dd] bg-white p-6 md:p-9">
              <p className="text-xs tracking-[0.18em] text-[#657b60]">
                02 / YOUR DIGITAL PRESENCE
              </p>

              <div className="mt-7 grid gap-6 md:grid-cols-2">
                <label className="text-sm">
                  GitHub URL
                  <input
                    name="github_url"
                    type="url"
                    value={profile.github_url}
                    onChange={(e) => updateField("github_url", e.target.value)}
                    placeholder="https://github.com/username"
                    className={inputClass}
                  />
                </label>

                <label className="text-sm">
                  LinkedIn URL
                  <input
                    name="linkedin_url"
                    type="url"
                    value={profile.linkedin_url}
                    onChange={(e) =>
                      updateField("linkedin_url", e.target.value)
                    }
                    placeholder="https://linkedin.com/in/username"
                    className={inputClass}
                  />
                </label>

                <label className="text-sm md:col-span-2">
                  Portfolio URL
                  <input
                    name="portfolio_url"
                    type="url"
                    value={profile.portfolio_url}
                    onChange={(e) =>
                      updateField("portfolio_url", e.target.value)
                    }
                    placeholder="https://yourportfolio.com"
                    className={inputClass}
                  />
                </label>
              </div>
            </section>

            {error && (
              <p role="alert" className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </p>
            )}

            {message && (
              <p role="status" className="border border-[#d8e4d4] bg-[#edf4e9] p-4 text-sm text-[#344c3c]">
                {message}
              </p>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-6 text-[#77796f]">
                Your profile is connected to your ENIGMA account.
              </p>

              <button
                type="submit"
                disabled={saving}
                className="bg-[#344c3c] px-8 py-4 text-sm text-white transition hover:bg-[#25382b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save profile"}
                <span className="ml-5">↗</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
