"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiRequestError, apiRequest } from "@/lib/api";

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

type Profile = {
  full_name: string;
  bio: string;
  college: string;
  course: string;
  branch: string;
  academic_year: number | null;
};

type MembershipApplication = {
  id: number;
  status: ApplicationStatus;
  review_note: string;
  submitted_at: string;
  reviewed_at: string | null;
};

type Membership = {
  membership_id: string;
  academic_year: string;
  joined_at: string;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED" | "LEFT";
};

type MembershipResponse = {
  membership: Membership | null;
};

const applicationLabels: Record<ApplicationStatus, string> = {
  PENDING: "Under review",
  APPROVED: "Approved",
  REJECTED: "Needs a new application",
};

const applicationStyles: Record<ApplicationStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-800",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [application, setApplication] =
    useState<MembershipApplication | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const [profileData, applications, membershipData] = await Promise.all([
          apiRequest<Profile>("/api/profiles/me/", {}, token),
          apiRequest<MembershipApplication[]>(
            "/api/membership/applications/",
            {},
            token,
          ),
          apiRequest<MembershipResponse>("/api/membership/me/", {}, token),
        ]);

        setProfile(profileData);
        setApplication(applications[0] ?? null);
        setMembership(membershipData.membership);
      } catch (requestError) {
        if (
          requestError instanceof ApiRequestError &&
          requestError.status === 401
        ) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          router.replace("/login");
          return;
        }

        setError("We could not load your dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  function signOut() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.replace("/login");
  }

  const name = profile?.full_name || "ENIGMA member";
  const profileComplete = Boolean(
    profile?.full_name &&
      (profile.college || profile.course || profile.branch || profile.bio),
  );

  return (
    <main data-enigma-page className="min-h-screen bg-[#f8f7f3] text-[#20251f]">
      <header className="border-b border-cyan-100/20 bg-[#06212a] px-6 py-5 text-cyan-50 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold tracking-[0.22em]">
            ENIGMA <span className="font-normal text-cyan-100/65">/ DASHBOARD</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-cyan-50/80">
            <Link href="/profile" className="transition hover:text-cyan-200">
              Profile
            </Link>
            <Link href="/membership" className="transition hover:text-cyan-200">
              Membership
            </Link>
            <Link href="/members" className="transition hover:text-cyan-200">
              Members
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="border border-cyan-100/35 px-3 py-2 text-xs transition hover:bg-cyan-100 hover:text-[#06212a]"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>

      <section className="border-b border-[#dfe2d8] bg-[#0a2c36] px-6 py-12 text-cyan-50 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-cyan-200/75">
            Member space
          </p>
          <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-6xl">
            Welcome back, {name}.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-cyan-50/75 md:text-base">
            Keep your profile current, follow your membership application, and
            stay connected to the ENIGMA community.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-12 lg:py-14">
        {loading && (
          <p className="text-sm text-[#696b62]">Loading your member space...</p>
        )}

        {error && (
          <div role="alert" className="border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-6 lg:grid-cols-3">
            <article className="border border-[#e7e5dd] bg-white p-6 lg:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-[#657b60]">
                Your profile
              </p>
              <div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                <div>
                  <h2 className="font-serif text-3xl">{name}</h2>
                  <p className="mt-3 max-w-xl whitespace-pre-wrap text-sm leading-7 text-[#696b62]">
                    {profile?.bio || "Add a short introduction so other members can get to know you."}
                  </p>
                </div>
                <span
                  className={`w-fit border px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] ${
                    profileComplete
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                >
                  {profileComplete ? "Profile ready" : "Profile in progress"}
                </span>
              </div>
              <div className="mt-7 grid gap-4 border-t border-[#e7e5dd] pt-6 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#77796f]">College</p>
                  <p className="mt-2">{profile?.college || "Not added"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#77796f]">Course</p>
                  <p className="mt-2">{profile?.course || "Not added"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#77796f]">Academic year</p>
                  <p className="mt-2">
                    {profile?.academic_year
                      ? `Year ${profile.academic_year}`
                      : "Not added"}
                  </p>
                </div>
              </div>
              <Link
                href="/profile"
                className="mt-7 inline-block border border-[#657b60] px-5 py-3 text-sm text-[#344c3c] transition hover:bg-[#344c3c] hover:text-white"
              >
                Edit profile →
              </Link>
            </article>

            <article className="border border-[#e7e5dd] bg-[#edf4e9] p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[#657b60]">
                Membership
              </p>
              {membership ? (
                <>
                  <h2 className="mt-5 font-serif text-3xl">{membership.status}</h2>
                  <p className="mt-3 text-sm leading-7 text-[#4f6253]">
                    Member since {formatDate(membership.joined_at)} · {membership.academic_year}
                  </p>
                  <p className="mt-6 border-t border-[#d4e0d0] pt-5 text-xs text-[#657b60]">
                    Membership ID: {membership.membership_id}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="mt-5 font-serif text-3xl">Not active yet</h2>
                  <p className="mt-3 text-sm leading-7 text-[#4f6253]">
                    {application?.status === "PENDING"
                      ? "Your application is with the club team for review."
                      : "Submit a membership application to begin your ENIGMA journey."}
                  </p>
                  <Link
                    href="/membership"
                    className="mt-7 inline-block text-sm text-[#344c3c] underline underline-offset-4"
                  >
                    {application ? "View application" : "Apply for membership"}
                  </Link>
                </>
              )}
            </article>

            <article className="border border-[#e7e5dd] bg-white p-6 lg:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-[#657b60]">
                Application status
              </p>
              {application ? (
                <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="font-serif text-3xl">
                      {applicationLabels[application.status]}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[#696b62]">
                      Submitted {formatDate(application.submitted_at)}.
                      {application.reviewed_at
                        ? ` Reviewed ${formatDate(application.reviewed_at)}.`
                        : ""}
                    </p>
                    {application.review_note && (
                      <p className="mt-4 border-l-2 border-[#a8b39f] pl-4 text-sm leading-6 text-[#4f6253]">
                        {application.review_note}
                      </p>
                    )}
                  </div>
                  <span
                    className={`w-fit border px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] ${applicationStyles[application.status]}`}
                  >
                    {application.status}
                  </span>
                </div>
              ) : (
                <>
                  <h2 className="mt-5 font-serif text-3xl">No application yet</h2>
                  <p className="mt-3 text-sm leading-7 text-[#696b62]">
                    When you are ready, tell us what you want to build and learn.
                  </p>
                </>
              )}
            </article>

            <article className="border border-[#e7e5dd] bg-white p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[#657b60]">
                Explore ENIGMA
              </p>
              <div className="mt-5 flex flex-col gap-4 text-sm">
                <Link href="/skills" className="text-[#344c3c] underline underline-offset-4">
                  Manage your skills
                </Link>
                <Link href="/members" className="text-[#344c3c] underline underline-offset-4">
                  Meet the members
                </Link>
                <Link href="/membership" className="text-[#344c3c] underline underline-offset-4">
                  Membership details
                </Link>
              </div>
            </article>
          </div>
        )}
      </section>
    </main>
  );
}
