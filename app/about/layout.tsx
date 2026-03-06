import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description: "VetSITREP is built by a veteran, for veterans. Our mission is to give transitioning service members the data-driven tools they need to land the right job.",
  openGraph: {
    title: "About VetSITREP",
    description: "Built by a veteran, for veterans. Data-driven tools for military career transition.",
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
