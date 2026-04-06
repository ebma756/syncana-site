import type { Metadata } from "next";

import { BlogPage } from "@/components/pages/SitePages";

export const metadata: Metadata = {
  title: "Tech Talk",
  description:
    "Leia os artigos práticos da Syncana sobre serviços geridos, Microsoft 365, cibersegurança e planeamento de recuperação para empresas em crescimento.",
};

export default function Page() {
  return <BlogPage locale="pt" />;
}
