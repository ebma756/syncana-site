import type { Metadata } from "next";

import { DataShieldPage } from "@/components/pages/DataShieldPage";

export const metadata: Metadata = {
  title: "DataShield - Proteção de Dados para Serviços Profissionais",
  description:
    "Para escritórios de advogados, clínicas e empresas de contabilidade que lidam com dados sensíveis - o DataShield da Syncana ajuda a proteger, documentar e demonstrar conformidade.",
};

export default function Page() {
  return <DataShieldPage locale="pt" />;
}
