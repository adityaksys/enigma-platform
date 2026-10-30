"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type Member = {
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

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMembers() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await apiRequest<Member[]>(
          "/api/profiles/members/",
          {},
          token,
        );

        setMembers(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load members.";

        if (message.includes("(401)")) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          router.replace("/login");
          return;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, [router]);

  return (
    <main data-enigma-page className="min-h-screen bg-[#f8f7f3] text-[#20251f]">
      <header className="border-b border-[#e7e5dd] px-6 py-5 lg:px-12">
        <Link href="/" className="text-sm font-semibold tracking-[0.22em]">
          ENIGMA{" "}
          <span className="font-normal text-[#77796f]">/ MEMBERS</span>
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-14 lg:px-12">
        <p className="text-xs uppercase tracking-[0.22em] text-[#657b60]">
          The people behind the code
        </p>

        <h1 className="mt-4 font-serif text-5xl tracking-tight md:text-6xl">
          Meet the members.
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#696b62] md:text-base">
          Discover the people, interests, and technical strengths that make
          up the ENIGMA community.
        </p>

        <div className="mt-10 flex items-center justify-between border-y border-[#e7e5dd] py-4">
          <p className="text-sm text-[#696b62]">
            {loading ? "Loading members..." : `${members.length} members`}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            disabled={loading}
            className="text-sm text-[#657b60] underline underline-offset-4 disabled:opacity-50"
          >
            Refresh directory
          </button>
        </div>

        {loading && (
          <p className="mt-8 text-sm text-[#696b62]">
            Fetching saved profiles...
          </p>
        )}

        {error && (
          <p role="alert" className="mt-8 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && members.length === 0 && (
          <div className="mt-8 border border-[#e7e5dd] bg-white p-8">
            <h2 className="font-serif text-2xl">Your community starts here.</h2>
            <p className="mt-3 text-sm leading-6 text-[#696b62]">
              No profiles are available yet. Members can create their
              profiles to appear in this directory.
            </p>
          </div>
        )}

        {!loading && !error && members.length > 0 && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <article
                key={member.id}
                className="flex flex-col border border-[#e7e5dd] bg-white p-6 transition hover:border-[#a8b39f]"
              >
                <p className="text-xs uppercase tracking-[0.15em] text-[#657b60]">
                  {member.branch || member.course || "ENIGMA Member"}
                </p>

                <h2 className="mt-3 font-serif text-3xl">
                  {member.full_name || "Unnamed member"}
                </h2>

                {(member.college || member.academic_year) && (
                  <p className="mt-2 text-sm text-[#696b62]">
                    {[member.college, member.academic_year
                      ? `Year ${member.academic_year}`
                      : ""]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}

                {member.bio && (
                  <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#696b62]">
                    {member.bio}
                  </p>
                )}

                <div className="mt-auto flex flex-wrap gap-4 border-t border-[#e7e5dd] pt-5">
                  {member.github_url && (
                    <a
                      href={member.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-[#657b60] underline underline-offset-4"
                    >
                      GitHub
                    </a>
                  )}
                  {member.linkedin_url && (
                    <a
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-[#657b60] underline underline-offset-4"
                    >
                      LinkedIn
                    </a>
                  )}
                  {member.portfolio_url && (
                    <a
                      href={member.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-[#657b60] underline underline-offset-4"
                    >
                      Portfolio
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
