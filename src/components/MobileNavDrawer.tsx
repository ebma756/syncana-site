import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { navigation, siteCopy, withLocale, type Locale } from "@/data/site";

type MobileNavDrawerProps = {
  locale: Locale;
  pathname: string;
};

export function MobileNavDrawer({ locale, pathname }: MobileNavDrawerProps) {
  const copy = siteCopy[locale];
  const toggleId = "mobile-menu-toggle";

  return (
    <div className="mobile-menu">
      <input className="mobile-menu__checkbox" id={toggleId} type="checkbox" />

      <label
        aria-label="Open menu"
        className="mobile-menu__toggle"
        htmlFor={toggleId}
      >
        <span className="mobile-menu__bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </label>

      <div className="mobile-menu__overlay" role="dialog" aria-modal="true">
        <label aria-label="Close menu" className="mobile-menu__backdrop" htmlFor={toggleId} />
        <div className="mobile-menu__panel">
          <label aria-label="Close menu" className="mobile-menu__close" htmlFor={toggleId}>
            ×
          </label>

          <nav aria-label="Mobile" className="mobile-menu__nav">
            {navigation.map((item) => {
              const href = withLocale(locale, item.href);
              const isActive =
                pathname === href ||
                (href !== withLocale(locale, "/") && pathname.startsWith(`${href}/`));

              return (
                <label key={item.key} className="mobile-menu__nav-item" htmlFor={toggleId}>
                  <Link className={`mobile-menu__link ${isActive ? "is-active" : ""}`} href={href}>
                    {item.label[locale]}
                  </Link>
                </label>
              );
            })}
          </nav>

          <div className="mobile-menu__actions">
            <label className="mobile-menu__action" htmlFor={toggleId}>
              <LanguageSwitcher label={copy.languageLabel} locale={locale} pathname={pathname} />
            </label>
            <label className="mobile-menu__action" htmlFor={toggleId}>
              <Link className="button button--primary" href={withLocale(locale, "/contact")}>
                <span>{copy.primaryCta}</span>
                <ArrowRightIcon className="button__icon" />
              </Link>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
