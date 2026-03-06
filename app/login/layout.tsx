import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your VetSITREP account to access job assessments, transition plans, and AI career guidance.",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
