import { LogoMark } from "@/components/LogoMark";

const partnerItems = [
  { logo: "microsoft", name: "Microsoft" },
  { logo: "acronis", name: "Acronis" },
  { logo: "dell", name: "Dell" },
  { logo: "lenovo", name: "Lenovo" },
  { logo: "vmware", name: "VMware" },
  { logo: "cisco", name: "Cisco" },
  { logo: "sophos", name: "Sophos" },
] as const;

export function PartnerStrip() {
  return (
    <div className="partner-strip">
      {partnerItems.map((partner) => (
        <div key={partner.name} className="partner-strip__item" title={partner.name}>
          <LogoMark alt={partner.name} logo={partner.logo} />
        </div>
      ))}
    </div>
  );
}
