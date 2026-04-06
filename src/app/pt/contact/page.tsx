import type { Metadata } from "next";

import { ContactPage } from "@/components/pages/SitePages";

export const metadata: Metadata = {
  title: "Contacte-nos",
  description:
    "Contacte a Syncana Technologies para pedir uma auditoria de TI, falar sobre necessidades de suporte ou explorar serviços de cibersegurança e Microsoft 365.",
};

export default function Page() {
  return <ContactPage locale="pt" />;
}
