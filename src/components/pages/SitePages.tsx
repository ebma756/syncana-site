import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandVisual, ArticleArt } from "@/components/BrandVisual";
import { ContactForm } from "@/components/ContactForm";
import { ExpertiseWheel } from "@/components/ExpertiseWheel";
import {
  ArrowRightIcon,
  ChevronRightIcon,
  CloudIcon,
  HeadsetIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  RefreshIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/icons";
import { PartnerStrip } from "@/components/PartnerStrip";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { HashScroller } from "@/components/HashScroller";
import {
  blogPosts,
  contactDetails,
  differentiators,
  faqItems,
  getBlogPost,
  pickList,
  services,
  siteCopy,
  valueCards,
  withLocale,
  type BlogPost,
  type Locale,
  type ServiceKey,
} from "@/data/site";

const serviceMedia = {
  "managed-it": {
    src: "/images/services/managed-it.jpg",
    alt: {
      en: "Technology team collaborating around a laptop in a modern office.",
      pt: "Equipa de tecnologia a colaborar à volta de um portátil num escritório moderno.",
    },
    chips: {
      en: ["Helpdesk", "User admin", "Monitoring"],
      pt: ["Helpdesk", "Administração", "Monitorização"],
    },
  },
  cybersecurity: {
    src: "/images/services/cybersecurity.jpg",
    alt: {
      en: "Professional reviewing infrastructure in a server room.",
      pt: "Profissional a rever infraestrutura numa sala de servidores.",
    },
    chips: {
      en: ["Endpoint", "Email filtering", "Firewall"],
      pt: ["Endpoint", "Email", "Firewall"],
    },
  },
  "cloud-m365": {
    src: "/images/services/cloud-m365.jpg",
    alt: {
      en: "Clean workspace representing cloud productivity and Microsoft 365 operations.",
      pt: "Espaço de trabalho limpo a representar produtividade cloud e operações Microsoft 365.",
    },
    chips: {
      en: ["Microsoft 365", "Teams", "SharePoint", "OneDrive"],
      pt: ["Microsoft 365", "Teams", "SharePoint", "OneDrive"],
    },
  },
  "backup-recovery": {
    src: "/images/services/backup-recovery.jpg",
    alt: {
      en: "Close-up of storage hardware used to represent backup and recovery planning.",
      pt: "Close-up de hardware de armazenamento a representar planeamento de backup e recuperação.",
    },
    chips: {
      en: ["Backup", "Recovery", "Continuity"],
      pt: ["Backup", "Recuperação", "Continuidade"],
    },
  },
} as const;

type PageShellProps = {
  children: ReactNode;
  locale: Locale;
  pathname: string;
};

function PageShell({ children, locale, pathname }: PageShellProps) {
  return (
    <div className="page-shell">
      <SiteHeader locale={locale} pathname={pathname} />
      <main id="main-content">{children}</main>
      <SiteFooter locale={locale} />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

function ServiceIcon({ serviceKey }: { serviceKey: ServiceKey }) {
  const className = "info-icon";

  if (serviceKey === "managed-it") {
    return <HeadsetIcon className={className} />;
  }

  if (serviceKey === "cybersecurity") {
    return <ShieldIcon className={className} />;
  }

  if (serviceKey === "cloud-m365") {
    return <CloudIcon className={className} />;
  }

  return <RefreshIcon className={className} />;
}

function DifferentiatorIcon({ index }: { index: number }) {
  const icons = [
    <MapPinIcon key="map" className="info-icon" />,
    <SparkIcon key="spark" className="info-icon" />,
    <ShieldIcon key="shield" className="info-icon" />,
    <CloudIcon key="cloud" className="info-icon" />,
  ];

  return icons[index] ?? <SparkIcon className="info-icon" />;
}

function PrimaryLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link className={`button ${secondary ? "button--secondary" : "button--primary"}`} href={href}>
      <span>{children}</span>
      <ArrowRightIcon className="button__icon" />
    </Link>
  );
}

function ServiceCard({
  locale,
  service,
}: {
  locale: Locale;
  service: (typeof services)[number];
}) {
  const serviceHref = withLocale(locale, `/our-expertise#service-${service.key}`);

  return (
    <article className="service-card">
      <div className="service-card__icon-wrap">
        <ServiceIcon serviceKey={service.key} />
      </div>
      <h3>{service.title[locale]}</h3>
      <p>{service.summary[locale]}</p>
      <ul className="bullet-list">
        {pickList(locale, service.bullets)
          .slice(0, 3)
          .map((item) => (
            <li key={item}>{item}</li>
          ))}
      </ul>
      <Link className="text-link" href={serviceHref} scroll={false}>
        <span>{locale === "en" ? "Explore service" : "Explorar serviço"}</span>
        <ChevronRightIcon className="text-link__icon" />
      </Link>
    </article>
  );
}

function BlogCard({
  locale,
  post,
  featured = false,
}: {
  locale: Locale;
  post: BlogPost;
  featured?: boolean;
}) {
  const copy = siteCopy[locale];

  return (
    <article className={`blog-card ${featured ? "blog-card--featured" : ""}`}>
      <ArticleArt label={post.heroLabel[locale]} variant={post.accent} />
      <div className="blog-card__body">
        <div className="blog-card__meta">
          <span>{post.category[locale]}</span>
          <span>{post.date[locale]}</span>
          <span>{post.readingTime[locale]}</span>
        </div>
        <h3>{post.title[locale]}</h3>
        <p>{post.excerpt[locale]}</p>
        <Link className="text-link" href={withLocale(locale, `/tech-talk/${post.slug}`)}>
          <span>{copy.blogActions.readMore}</span>
          <ChevronRightIcon className="text-link__icon" />
        </Link>
      </div>
    </article>
  );
}

function ContactCards({ locale }: { locale: Locale }) {
  return (
    <div className="contact-cards">
      <article className="contact-card">
        <PhoneIcon className="info-icon" />
        <h3>{locale === "en" ? "Phone" : "Telefone"}</h3>
        <a href={`tel:${contactDetails.phone.replace(/\s+/g, "")}`}>{contactDetails.phone}</a>
      </article>
      <article className="contact-card">
        <MailIcon className="info-icon" />
        <h3>Email</h3>
        <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
      </article>
      <article className="contact-card">
        <MapPinIcon className="info-icon" />
        <h3>{locale === "en" ? "Location" : "Localização"}</h3>
        <p>{contactDetails.location}</p>
      </article>
    </div>
  );
}

function ServiceMediaCard({
  locale,
  service,
}: {
  locale: Locale;
  service: (typeof services)[number];
}) {
  const media = serviceMedia[service.key];

  return (
    <figure className={`service-media-card service-media-card--${service.key}`}>
      <div className="service-media-card__top">
        <strong>{service.title[locale]}</strong>
      </div>
      <div className="service-media-card__image-shell">
        <div className="service-media-card__frame" />
        <div className="service-media-card__image-wrap">
          <Image
            alt={media.alt[locale]}
            className="service-media-card__image"
            fill
            sizes="(max-width: 980px) 100vw, 40vw"
            src={media.src}
          />
        </div>
      </div>
      <figcaption className="service-media-card__chips">
        {media.chips[locale].map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
      </figcaption>
    </figure>
  );
}

export function HomePage({ locale }: { locale: Locale }) {
  const copy = siteCopy[locale];
  const featuredPosts = blogPosts.slice(0, 3);

  return (
    <PageShell locale={locale} pathname={withLocale(locale, "/")}>
      <section className="hero-section hero-section--home">
        <div className="container hero-grid hero-grid--with-visual">
          <div className="hero-copy">
            <span className="eyebrow">{copy.home.kicker}</span>
            <h1>{copy.home.title}</h1>
            <p className="hero-copy__lead">{copy.home.description}</p>
            <p className="hero-copy__supporting">{copy.home.secondaryDescription}</p>
            <div className="hero-actions">
              <PrimaryLink href={withLocale(locale, "/contact")}>{copy.primaryCta}</PrimaryLink>
              <PrimaryLink href={withLocale(locale, "/our-expertise")} secondary>
                {copy.secondaryCta}
              </PrimaryLink>
            </div>
          </div>
          <BrandVisual
            chips={services.map((service) => service.title[locale])}
            description={copy.home.trustBody}
            eyebrow={locale === "en" ? "Managed service view" : "Vista do serviço gerido"}
            title={copy.home.trustTitle}
            variant="hero"
          />
        </div>
      </section>

      <section className="logo-band">
        <div className="container">
          <PartnerStrip />
        </div>
      </section>

      <section className="content-section">
        <div className="container split-layout split-layout--about-home">
          <div className="about-home-copy">
            <SectionHeading
              body={copy.home.aboutBody}
              eyebrow={copy.home.aboutKicker}
              title={copy.home.aboutTitle}
            />
            <div className="feature-stack feature-stack--about-home">
              <article className="feature-card feature-card--about-home">
                <div className="feature-card__title-row">
                  <SparkIcon className="info-icon" />
                  <h3>{locale === "en" ? "One accountable provider" : "Um fornecedor responsável"}</h3>
                </div>
                <p>
                  {locale === "en"
                    ? "Support, Microsoft 365, cybersecurity, and continuity planning are coordinated as one operating model."
                    : "Suporte, Microsoft 365, cibersegurança e continuidade do negócio são coordenados como um só modelo operacional."}
                </p>
              </article>
              <article className="feature-card feature-card--about-home">
                <div className="feature-card__title-row">
                  <ShieldIcon className="info-icon" />
                  <h3>{locale === "en" ? "Security woven into support" : "Segurança integrada no suporte"}</h3>
                </div>
                <p>
                  {locale === "en"
                    ? "We protect the environment while keeping the daily user experience practical and supportable."
                    : "Protegemos o ambiente mantendo a experiência diária do utilizador prática e fácil de suportar."}
                </p>
              </article>
            </div>
          </div>
          <BrandVisual
            chips={[
              locale === "en" ? "Business-first support" : "Suporte orientado ao negócio",
              locale === "en" ? "Microsoft 365" : "Microsoft 365",
              locale === "en" ? "24/7 Monitoring" : "Monitorização 24/7",
            ]}
            className="brand-visual--about-home"
            description={copy.home.aboutBody}
            eyebrow={copy.home.aboutKicker}
            title={copy.home.aboutTitle}
            variant="about"
          />
        </div>
      </section>

      <section className="content-section content-section--muted">
        <div className="container">
          <SectionHeading
            align="center"
            body={copy.home.servicesBody}
            eyebrow={copy.home.servicesKicker}
            title={copy.home.servicesTitle}
          />
          <div className="card-grid card-grid--services">
            {services.map((service) => (
              <ServiceCard key={service.key} locale={locale} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="content-section content-section--why">
        <div className="container">
          <SectionHeading
            align="center"
            body={copy.home.differentiatorsBody}
            eyebrow={copy.home.differentiatorsKicker}
            title={copy.home.differentiatorsTitle}
          />
          <div className="card-grid card-grid--four">
            {differentiators.map((item, index) => (
              <article key={item.title[locale]} className="feature-card feature-card--elevated">
                <DifferentiatorIcon index={index} />
                <h3>{item.title[locale]}</h3>
                <p>{item.body[locale]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ExpertiseWheel locale={locale} />

      <section className="content-section">
        <div className="container cta-panel">
          <div>
            <span className="eyebrow">{locale === "en" ? "Start here" : "Comece aqui"}</span>
            <h2>{copy.home.ctaTitle}</h2>
            <p>{copy.home.ctaBody}</p>
          </div>
          <PrimaryLink href={withLocale(locale, "/contact")}>{copy.primaryCta}</PrimaryLink>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <div className="home-blog-intro">
            <SectionHeading
              align="center"
              body={copy.home.blogBody}
              eyebrow={copy.home.blogKicker}
              title={copy.home.blogTitle}
            />
            <Link className="text-link text-link--strong home-blog-intro__link" href={withLocale(locale, "/tech-talk")}>
              <span>{copy.blogActions.allArticles}</span>
              <ChevronRightIcon className="text-link__icon" />
            </Link>
          </div>
          <div className="card-grid card-grid--blog">
            {featuredPosts.map((post) => (
              <BlogCard key={post.slug} locale={locale} post={post} />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export function ExpertisePage({ locale }: { locale: Locale }) {
  const copy = siteCopy[locale];

  return (
    <PageShell locale={locale} pathname={withLocale(locale, "/our-expertise")}>
      <HashScroller />
      <section className="hero-section hero-section--page">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">{copy.expertise.kicker}</span>
            <h1>{copy.expertise.title}</h1>
            <p className="hero-copy__lead">{copy.expertise.description}</p>
            <div className="hero-actions">
              <PrimaryLink href={withLocale(locale, "/contact")}>{copy.primaryCta}</PrimaryLink>
              <PrimaryLink href={withLocale(locale, "/tech-talk")} secondary>
                {locale === "en" ? "Read Tech Talk" : "Ler Tech Talk"}
              </PrimaryLink>
            </div>
          </div>
          <BrandVisual
            chips={[
              locale === "en" ? "Support" : "Suporte",
              locale === "en" ? "Security" : "Segurança",
              locale === "en" ? "Cloud" : "Cloud",
              locale === "en" ? "Continuity" : "Continuidade",
            ]}
            description={copy.expertise.overviewBody}
            eyebrow={copy.expertise.kicker}
            title={copy.expertise.overviewTitle}
            variant="managed-it"
          />
        </div>
      </section>

      <section className="content-section content-section--muted">
        <div className="container">
          <SectionHeading
            align="center"
            body={copy.expertise.overviewBody}
            title={copy.expertise.overviewTitle}
          />
          <div className="outcome-grid">
            {services.map((service) => (
              <article key={service.key} className="outcome-card">
                <ServiceIcon serviceKey={service.key} />
                <h3>{service.title[locale]}</h3>
                <p>{service.summary[locale]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {services.map((service, index) => (
        <section
          id={`service-${service.key}`}
          key={service.key}
          className={`content-section expertise-section ${index % 2 === 1 ? "content-section--muted" : ""}`}
        >
          <div className={`container split-layout split-layout--service ${index % 2 === 1 ? "split-layout--reverse" : ""}`}>
            <div className="service-copy-column">
              <div className="service-detail-card">
                <div className="service-copy-stack service-copy-stack--detail">
                  <p className="section-copy service-copy-stack__summary">{service.summary[locale]}</p>
                </div>
                <div className="detail-columns detail-columns--value-grid">
                  <div className="detail-panel detail-panel--capabilities">
                    <div className="detail-panel__heading">
                      <span className="detail-panel__eyebrow">
                        {locale === "en" ? "Operational scope" : "Âmbito operacional"}
                      </span>
                    </div>
                    <div className="detail-item-list">
                      {pickList(locale, service.bullets).map((item) => (
                        <div key={item} className="detail-item detail-item--capability">
                          <span className="detail-item__marker" aria-hidden="true" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="detail-panel detail-panel--outcomes">
                    <div className="detail-panel__heading">
                      <span className="detail-panel__eyebrow">
                        {locale === "en" ? "Business value" : "Valor para o negócio"}
                      </span>
                    </div>
                    <div className="detail-item-list">
                      {pickList(locale, service.outcomes).map((item) => (
                        <div key={item} className="detail-item detail-item--outcome">
                          <span className="detail-item__marker" aria-hidden="true" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ServiceMediaCard locale={locale} service={service} />
          </div>
        </section>
      ))}

      <section className="content-section">
        <div className="container cta-panel">
          <div>
            <span className="eyebrow">{copy.expertise.kicker}</span>
            <h2>{copy.expertise.ctaTitle}</h2>
            <p>{copy.expertise.ctaBody}</p>
          </div>
          <PrimaryLink href={withLocale(locale, "/contact")}>{copy.primaryCta}</PrimaryLink>
        </div>
      </section>
    </PageShell>
  );
}

export function AboutPage({ locale }: { locale: Locale }) {
  const copy = siteCopy[locale];

  return (
    <PageShell locale={locale} pathname={withLocale(locale, "/about-us")}>
      <section className="hero-section hero-section--page">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">{copy.about.kicker}</span>
            <h1>{copy.about.title}</h1>
            <p className="hero-copy__lead">{copy.about.description}</p>
            <div className="hero-actions">
              <PrimaryLink href={withLocale(locale, "/contact")}>{copy.primaryCta}</PrimaryLink>
              <PrimaryLink href={withLocale(locale, "/our-expertise")} secondary>
                {copy.secondaryCta}
              </PrimaryLink>
            </div>
          </div>
          <BrandVisual
            chips={[
              locale === "en" ? "Managed IT" : "TI Gerida",
              locale === "en" ? "Cybersecurity" : "Cibersegurança",
              locale === "en" ? "Cloud Services" : "Serviços Cloud",
            ]}
            description={copy.about.storyBody}
            eyebrow={copy.about.kicker}
            title={copy.about.storyTitle}
            variant="about"
          />
        </div>
      </section>

      <section className="content-section content-section--muted">
        <div className="container card-grid card-grid--two">
          <article className="mission-card">
            <span className="eyebrow">{copy.about.missionTitle}</span>
            <h2>{copy.about.missionTitle}</h2>
            <p>{copy.about.missionBody}</p>
          </article>
          <article className="mission-card">
            <span className="eyebrow">{copy.about.visionTitle}</span>
            <h2>{copy.about.visionTitle}</h2>
            <p>{copy.about.visionBody}</p>
          </article>
        </div>
      </section>

      <section className="content-section">
        <div className="container split-layout">
          <div>
            <SectionHeading
              body={copy.about.storyBody}
              eyebrow={copy.about.storyKicker}
              title={copy.about.storyTitle}
            />
            <p className="section-copy">
              {locale === "en"
                ? "Our focus is to remove fragmentation from the way business technology is supported. Instead of separate conversations for support, cloud administration, and risk management, we give clients one joined-up path forward."
                : "O nosso foco é remover a fragmentação da forma como a tecnologia empresarial é suportada. Em vez de conversas separadas para suporte, administração cloud e gestão de risco, damos aos clientes um único caminho integrado."}
            </p>
          </div>
          <div className="card-grid card-grid--two">
            {valueCards.map((value) => (
              <article key={value.title[locale]} className="feature-card feature-card--compact">
                <SparkIcon className="info-icon" />
                <h3>{value.title[locale]}</h3>
                <p>{value.body[locale]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section content-section--muted">
        <div className="container">
          <SectionHeading
            align="center"
            body={copy.about.partnersBody}
            eyebrow={copy.about.partnersKicker}
            title={copy.about.partnersTitle}
          />
          <PartnerStrip />
        </div>
      </section>

      <section className="content-section">
        <div className="container cta-panel">
          <div>
            <span className="eyebrow">{copy.about.kicker}</span>
            <h2>{copy.about.ctaTitle}</h2>
            <p>{copy.about.ctaBody}</p>
          </div>
          <PrimaryLink href={withLocale(locale, "/contact")}>{copy.primaryCta}</PrimaryLink>
        </div>
      </section>
    </PageShell>
  );
}

export function BlogPage({ locale }: { locale: Locale }) {
  const copy = siteCopy[locale];
  const [featuredPost, ...otherPosts] = blogPosts;

  return (
    <PageShell locale={locale} pathname={withLocale(locale, "/tech-talk")}>
      <section className="hero-section hero-section--page">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">{copy.blog.kicker}</span>
            <h1>{copy.blog.title}</h1>
            <p className="hero-copy__lead">{copy.blog.description}</p>
            <div className="hero-actions">
              <PrimaryLink href={withLocale(locale, `/tech-talk/${featuredPost.slug}`)}>
                {copy.blog.featuredLabel}
              </PrimaryLink>
              <PrimaryLink href={withLocale(locale, "/contact")} secondary>
                {copy.primaryCta}
              </PrimaryLink>
            </div>
          </div>
          <BrandVisual
            chips={blogPosts.slice(0, 4).map((post) => post.category[locale])}
            description={copy.blog.latestBody}
            eyebrow={copy.blog.kicker}
            title={copy.blog.title}
            variant="growth"
          />
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <SectionHeading
            body={copy.blog.latestBody}
            eyebrow={copy.blog.featuredLabel}
            title={featuredPost.title[locale]}
          />
          <BlogCard featured locale={locale} post={featuredPost} />
        </div>
      </section>

      <section className="content-section content-section--muted">
        <div className="container">
          <SectionHeading
            body={copy.blog.latestBody}
            eyebrow={copy.blog.kicker}
            title={copy.blog.latestLabel}
          />
          <div className="card-grid card-grid--blog">
            {otherPosts.map((post) => (
              <BlogCard key={post.slug} locale={locale} post={post} />
            ))}
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="container cta-panel">
          <div>
            <span className="eyebrow">{copy.blog.kicker}</span>
            <h2>{copy.blog.ctaTitle}</h2>
            <p>{copy.blog.ctaBody}</p>
          </div>
          <PrimaryLink href={withLocale(locale, "/contact")}>{copy.secondaryCta}</PrimaryLink>
        </div>
      </section>
    </PageShell>
  );
}

export function BlogPostPage({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const copy = siteCopy[locale];
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <PageShell locale={locale} pathname={withLocale(locale, `/tech-talk/${slug}`)}>
      <section className="hero-section hero-section--article">
        <div className="container article-hero">
          <div>
            <Link className="text-link" href={withLocale(locale, "/tech-talk")}>
              <ChevronRightIcon className="text-link__icon text-link__icon--flip" />
              <span>{copy.blogActions.backToBlog}</span>
            </Link>
            <div className="blog-card__meta blog-card__meta--article">
              <span>{post.category[locale]}</span>
              <span>{post.date[locale]}</span>
              <span>{post.readingTime[locale]}</span>
            </div>
            <h1>{post.title[locale]}</h1>
            <p className="hero-copy__lead">{post.excerpt[locale]}</p>
          </div>
          <ArticleArt label={post.heroLabel[locale]} variant={post.accent} />
        </div>
      </section>

      <section className="content-section">
        <div className="container article-layout">
          <article className="article-content">
            {post.takeaways ? (
              <section className="article-summary-card">
                <span className="eyebrow">{locale === "en" ? "Key takeaways" : "Pontos principais"}</span>
                <ul className="bullet-list">
                  {post.takeaways[locale].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {post.sections.map((section, index) => (
              <section key={section.heading[locale]} className="article-content__section">
                <h2>{section.heading[locale]}</h2>
                {section.paragraphs[locale].map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}

                {index === 0 && post.image ? (
                  <figure className="article-figure">
                    <div className="article-figure__media">
                      <Image
                        alt={post.image.alt[locale]}
                        className="article-figure__image"
                        fill
                        sizes="(max-width: 980px) 100vw, 52rem"
                        src={post.image.src}
                      />
                    </div>
                    {post.image.caption ? <figcaption>{post.image.caption[locale]}</figcaption> : null}
                  </figure>
                ) : null}

                {index === 1 && post.useCase ? (
                  <aside className="article-example-card">
                    <span className="eyebrow">{locale === "en" ? "Real-world example" : "Exemplo prático"}</span>
                    <h3>{post.useCase.title[locale]}</h3>
                    <p>{post.useCase.body[locale]}</p>
                  </aside>
                ) : null}
              </section>
            ))}
          </article>
          <aside className="article-sidebar">
            <div className="sidebar-card">
              <span className="eyebrow">{locale === "en" ? "Need support?" : "Precisa de apoio?"}</span>
              <h2>{locale === "en" ? "Turn insight into action" : "Transforme conhecimento em ação"}</h2>
              <p>
                {locale === "en"
                  ? "If this topic maps to a real challenge in your environment, Syncana can help you assess it and define the next steps."
                  : "Se este tema corresponde a um desafio real no seu ambiente, a Syncana pode ajudar a avaliá-lo e a definir os próximos passos."}
              </p>
              <PrimaryLink href={withLocale(locale, "/contact")}>{copy.primaryCta}</PrimaryLink>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}

export function ContactPage({ locale }: { locale: Locale }) {
  const copy = siteCopy[locale];

  return (
    <PageShell locale={locale} pathname={withLocale(locale, "/contact")}>
      <section className="hero-section hero-section--page">
        <div className="container hero-grid hero-grid--with-visual">
          <div className="hero-copy">
            <span className="eyebrow">{copy.contact.kicker}</span>
            <h1>{copy.contact.title}</h1>
            <p className="hero-copy__lead">{copy.contact.description}</p>
          </div>
          <figure className="contact-hero-media" aria-label={copy.contact.cardsTitle}>
            <Image
              alt={
                locale === "en"
                  ? "IT professional reviewing systems as part of an audit request."
                  : "Profissional de TI a rever sistemas como parte de um pedido de auditoria."
              }
              className="contact-hero-media__image"
              fill
              priority
              sizes="(max-width: 980px) 100vw, 42vw"
              src="/images/contact-hero.jpg"
            />
          </figure>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <SectionHeading body={copy.contact.cardsBody} title={copy.contact.cardsTitle} />
          <ContactCards locale={locale} />
        </div>
      </section>

      <section className="content-section content-section--muted">
        <div className="container split-layout">
          <div className="form-panel">
            <SectionHeading body={copy.contact.formBody} title={copy.contact.formTitle} />
            <ContactForm locale={locale} />
          </div>
          <aside className="contact-audit-visual" aria-label={copy.contact.formTitle}>
            <div className="contact-audit-visual__mosaic">
              <div className="contact-audit-visual__tile contact-audit-visual__tile--primary">
                <Image
                  alt={
                    locale === "en"
                      ? "IT support specialist preparing for an audit engagement."
                      : "Especialista de suporte de TI a preparar uma auditoria."
                  }
                  className="contact-audit-visual__image"
                  fill
                  sizes="(max-width: 980px) 100vw, 38vw"
                  src="/images/services/managed-it-audit.jpg"
                />
              </div>
              <div className="contact-audit-visual__tile contact-audit-visual__tile--secondary">
                <Image
                  alt={
                    locale === "en"
                      ? "Security review representing risk assessment and controls."
                      : "Revisao de seguranca a representar avaliacao de risco e controlos."
                  }
                  className="contact-audit-visual__image"
                  fill
                  sizes="(max-width: 980px) 50vw, 18vw"
                  src="/images/services/cybersecurity.jpg"
                />
              </div>
              <div className="contact-audit-visual__tile contact-audit-visual__tile--tertiary">
                <Image
                  alt={
                    locale === "en"
                      ? "Workspace representing cloud operations and productivity tooling."
                      : "Espaco de trabalho a representar operacoes cloud e ferramentas de produtividade."
                  }
                  className="contact-audit-visual__image"
                  fill
                  sizes="(max-width: 980px) 50vw, 18vw"
                  src="/images/services/cloud-m365.jpg"
                />
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <SectionHeading body={copy.contact.faqBody} title={copy.contact.faqTitle} />
          <div className="faq-list">
            {faqItems.map((item, index) => (
              <details key={item.question[locale]} className="faq-item">
                <summary>
                  <span className="faq-item__index">{String(index + 1).padStart(2, "0")}.</span>
                  <span className="faq-item__question">{item.question[locale]}</span>
                  <span className="faq-item__icon" aria-hidden="true" />
                </summary>
                <p>{item.answer[locale]}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
