import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your free VetSITREP account. Get AI-powered job assessments, personalized 90-day transition plans, and career guidance built for veterans.",
  openGraph: {
    title: "Sign Up for VetSITREP",
    description: "Free account. AI job assessments, 90-day plans, and transition guidance for veterans.",
  },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
