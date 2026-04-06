import type { Metadata } from "next";

import { ExpertisePage } from "@/components/pages/SitePages";

export const metadata: Metadata = {
  title: "A Nossa Especialização",
  description:
    "Explore os serviços da Syncana em TI gerida, cibersegurança, Microsoft 365 e backup e recuperação para organizações em Moçambique.",
};

export default function Page() {
  return <ExpertisePage locale="pt" />;
}
