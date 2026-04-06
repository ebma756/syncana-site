import type { Metadata } from "next";

import { HomePage } from "@/components/pages/SitePages";

export const metadata: Metadata = {
  title: "Serviços Geridos de TI em Maputo",
  description:
    "A Syncana Technologies presta serviços geridos de TI, cibersegurança, suporte Microsoft 365 e continuidade do negócio para empresas em crescimento em Moçambique.",
};

export default function Page() {
  return <HomePage locale="pt" />;
}
