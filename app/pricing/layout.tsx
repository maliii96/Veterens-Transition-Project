import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing",
  description: "VetSITREP pricing plans. Free tier with 3 job assessments per month or Pro at $19/mo with 50 assessments, 500 AI messages, and priority support.",
  openGraph: {
    title: "VetSITREP Pricing",
    description: "Free tier or Pro at $19/mo. AI-powered job assessments, transition plans, and more for veterans.",
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
