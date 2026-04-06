import type { Metadata } from "next";

import { AboutPage } from "@/components/pages/SitePages";

export const metadata: Metadata = {
  title: "Sobre Nós",
  description:
    "Conheça a forma como a Syncana Technologies ajuda empresas em Moçambique a simplificar operações tecnológicas com suporte, cloud e segurança integrados.",
};

export default function Page() {
  return <AboutPage locale="pt" />;
}
