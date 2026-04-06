import Image from "next/image";
import Link from "next/link";

import { LinkedInIcon, MailIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import {
  contactDetails,
  navigation,
  services,
  siteCopy,
  withLocale,
  type Locale,
} from "@/data/site";

type SiteFooterProps = {
  locale: Locale;
};

export function SiteFooter({ locale }: SiteFooterProps) {
  const copy = siteCopy[locale];

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Image
            alt="Syncana Technologies"
            height={54}
            src="/logos/syncana-logo-light.svg"
            width={194}
          />
          <p>{copy.footerBlurb}</p>
          <a className="social-link" href={contactDetails.linkedIn} rel="noreferrer" target="_blank">
            <LinkedInIcon className="social-link__icon" />
            <span>LinkedIn</span>
          </a>
        </div>
        <div>
          <h3>{copy.footerLinksTitle}</h3>
          <div className="footer-links">
            {navigation.map((item) => (
              <Link key={item.key} href={withLocale(locale, item.href)}>
                {item.label[locale]}
              </Link>
            ))}
            <Link href={withLocale(locale, "/contact")}>{locale === "en" ? "Contact" : "Contacto"}</Link>
          </div>
        </div>
        <div>
          <h3>{copy.footerServicesTitle}</h3>
          <div className="footer-links">
            {services.map((service) => (
              <Link key={service.key} href={withLocale(locale, "/our-expertise")}>
                {service.title[locale]}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3>{copy.footerContactTitle}</h3>
          <div className="footer-contact-list">
            <a href={`tel:${contactDetails.phone.replace(/\s+/g, "")}`}>
              <PhoneIcon className="footer-contact-list__icon" />
              <span>{contactDetails.phone}</span>
            </a>
            <a href={`mailto:${contactDetails.email}`}>
              <MailIcon className="footer-contact-list__icon" />
              <span>{contactDetails.email}</span>
            </a>
            <p>
              <MapPinIcon className="footer-contact-list__icon" />
              <span>{contactDetails.location}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <p>
          © 2026 Syncana Technologies. {locale === "en" ? "All rights reserved." : "Todos os direitos reservados."}
        </p>
      </div>
    </footer>
  );
}
