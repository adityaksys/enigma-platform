
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiRequestError, apiRequest } from "@/lib/api";

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

type MembershipApplication = {
  id: number;
  motivation: string;
  interests: string;
  status: ApplicationStatus;
  review_note: string;
  submitted_at: string;
  reviewed_at: string | null;
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError && error.data) {
    if (typeof error.data === "string") {
      return error.data;
    }

    if (typeof error.data === "object") {
      const data = error.data as Record<string, unknown>;
      const relevantError = [
        data.detail,
        data.non_field_errors,
        data.motivation,
      ].find((value) => value !== undefined);

      if (typeof relevantError === "string") {
        return relevantError;
      }

      if (Array.isArray(relevantError) && typeof relevantError[0] === "string") {
        return relevantError[0];
      }
    }
  }

  return "Unable to submit your application. Please try again.";
}

export default function MembershipPage() {
  const router = useRouter();
  const [motivation, setMotivation] = useState("");
  const [interests, setInterests] = useState("");
  const [application, setApplication] =
    useState<MembershipApplication | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingApplication, setLoadingApplication] = useState(true);

  useEffect(() => {
    async function loadApplication() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const applications = await apiRequest<MembershipApplication[]>(
          "/api/membership/applications/",
          {},
          token,
        );
        setApplication(applications[0] ?? null);
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

        setError("Unable to load your membership application.");
      } finally {
        setLoadingApplication(false);
      }
    }

    loadApplication();
  }, [router]);

  async function submitApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);

    try {
      const createdApplication = await apiRequest<MembershipApplication>(
        "/api/membership/applications/",
        {
          method: "POST",
          body: JSON.stringify({ motivation, interests }),
        },
        token,
      );

      setApplication(createdApplication);
      setMotivation("");
      setInterests("");
      setMessage("Your membership application has been submitted.");
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

      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  const statusStyles: Record<ApplicationStatus, string> = {
    PENDING: "border-amber-200 bg-amber-50 text-amber-800",
    APPROVED: "border-green-200 bg-green-50 text-green-800",
    REJECTED: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <main data-enigma-page className="min-h-screen bg-[#f7f6f0] px-5 py-16 text-[#243c2c] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-sm font-medium text-[#657b60] transition hover:text-[#243c2c]"
        >
          ← Back to ENIGMA
        </Link>

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <section className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#657b60]">
              Membership · ENIGMA Coding Club
            </p>

            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Your next chapter starts with a question.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-[#687365]">
              Join a community of builders, problem-solvers, and curious minds.
              Tell us what excites you, what you want to learn, and how you hope
              to contribute.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[#dce1d6] bg-white/70 p-5">
                <span className="text-2xl">01</span>
                <p className="mt-3 text-sm font-semibold">Apply</p>
                <p className="mt-1 text-xs leading-5 text-[#687365]">
                  Share your interests and motivation.
                </p>
              </div>

              <div className="rounded-2xl border border-[#dce1d6] bg-white/70 p-5">
                <span className="text-2xl">02</span>
                <p className="mt-3 text-sm font-semibold">Get reviewed</p>
                <p className="mt-1 text-xs leading-5 text-[#687365]">
                  An authorized club admin reviews your application.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#dce1d6] bg-white p-6 shadow-sm sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#657b60]">
              Membership application
            </p>

            <h2 className="mt-3 text-2xl font-semibold">
              Tell us about yourself
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#687365]">
              Be genuine. You do not need to know everything to get started.
            </p>

            {application && (
              <div
                className={`mt-6 rounded-xl border p-4 ${statusStyles[application.status]}`}
                role="status"
              >
                <p className="font-semibold">
                  Application status: {application.status}
                </p>
                <p className="mt-1 text-sm">
                  {application.status === "PENDING" &&
                    "Your application is awaiting review."}
                  {application.status === "APPROVED" &&
                    "Your application has been approved."}
                  {application.status === "REJECTED" &&
                    "Your application was rejected. Check with a club admin for details."}
                </p>
                {application.review_note && (
                  <p className="mt-2 text-sm">{application.review_note}</p>
                )}
              </div>
            )}

            {loadingApplication && (
              <p className="mt-8 text-sm text-[#687365]">
                Loading your application status...
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                {error}
              </p>
            )}

            {application?.status === "APPROVED" ? (
              <Link
                href="/dashboard"
                className="mt-8 block w-full rounded-xl bg-[#304b36] px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-[#243c2c]"
              >
                Go to your member dashboard →
              </Link>
            ) : application?.status === "PENDING" ? (
              <p className="mt-8 rounded-xl bg-[#f1f3ec] p-4 text-sm leading-6 text-[#405540]">
                We will update this page after an authorized club administrator
                reviews your application.
              </p>
            ) : !loadingApplication ? (
            <form onSubmit={submitApplication} className="mt-8 space-y-6">
              <div>
                <label
                  htmlFor="motivation"
                  className="mb-2 block text-sm font-medium"
                >
                  Why do you want to join ENIGMA? *
                </label>
                <textarea
                  id="motivation"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={5}
                  value={motivation}
                  onChange={(event) => setMotivation(event.target.value)}
                  placeholder="Tell us what motivates you and what you hope to build..."
                  className="w-full resize-y rounded-xl border border-[#dce1d6] bg-[#fbfbf8] px-4 py-3 text-sm outline-none transition placeholder:text-[#9aa394] focus:border-[#657b60] focus:ring-2 focus:ring-[#657b60]/15"
                />
              </div>

              <div>
                <label
                  htmlFor="interests"
                  className="mb-2 block text-sm font-medium"
                >
                  Your interests
                </label>
                <textarea
                  id="interests"
                  rows={3}
                  maxLength={3000}
                  value={interests}
                  onChange={(event) => setInterests(event.target.value)}
                  placeholder="Python, web development, AI/ML, competitive programming..."
                  className="w-full resize-y rounded-xl border border-[#dce1d6] bg-[#fbfbf8] px-4 py-3 text-sm outline-none transition placeholder:text-[#9aa394] focus:border-[#657b60] focus:ring-2 focus:ring-[#657b60]/15"
                />
              </div>

              {message && (
                <p
                  role="status"
                  className="rounded-xl bg-[#f1f3ec] p-4 text-sm leading-6 text-[#405540]"
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#304b36] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#243c2c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Submitting..."
                  : application
                    ? "Submit a new application →"
                    : "Submit application →"}
              </button>

              <p className="text-center text-xs leading-5 text-[#849080]">
                Submission requires an authenticated ENIGMA account. Approval
                is handled by authorized club administrators.
              </p>
            </form>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
