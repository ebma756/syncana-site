import type { ReactNode } from "react";

import Link from "next/link";

import { BrandVisual } from "@/components/BrandVisual";
import {
  ArrowRightIcon,
  Building2Icon,
  CalculatorIcon,
  GlobeIcon,
  HeartPulseIcon,
  RefreshIcon,
  ScaleIcon,
  ShieldIcon,
  ShieldCheckIcon,
  SparkIcon,
} from "@/components/icons";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { withLocale, type Locale } from "@/data/site";

function PageShell({
  children,
  locale,
  pathname,
}: {
  children: ReactNode;
  locale: Locale;
  pathname: string;
}) {
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
    <Link
      className={`button ${secondary ? "button--secondary" : "button--primary"}`}
      href={href}
    >
      <span>{children}</span>
      <ArrowRightIcon className="button__icon" />
    </Link>
  );
}

export function DataShieldPage({ locale }: { locale: Locale }) {
  const copy =
    locale === "pt"
      ? {
          heroLead:
            "Para escritórios de advogados, clínicas e empresas de contabilidade que lidam com dados sensíveis de clientes - ajudamos a proteger, documentar e demonstrar.",
          heroTitle: "Proteção de Dados para Serviços Profissionais",
          heroButton: "Pedir Auditoria de TI",
          visualTitle: "Pronto para Proteção de Dados",
          visualDesc:
            "Documentação de conformidade e gestão de risco para serviços profissionais que lidam com dados sensíveis de clientes.",
          problemEyebrow: "Conformidade e Risco",
          problemTitle: "O Risco É Real",
          problemCards: [
            {
              title:
                "A Lei de Proteção de Dados Pessoais de Moçambique - inspirada no GDPR - está a caminho.",
              body:
                "O incumprimento poderá trazer sanções criminais e administrativas. Empresas sem práticas documentadas ficarão expostas.",
            },
            {
              title:
                "Escritórios de advogados e clínicas com clientes estrangeiros já estão sujeitos ao GDPR hoje.",
              body:
                "Mesmo que não saibam. Se lida com dados de cidadãos da UE, o GDPR aplica-se - independentemente de onde está sediado.",
            },
            {
              title:
                "Uma única violação de dados destrói a confiança e a reputação profissional.",
              body:
                "A maioria das empresas não tem um plano documentado. Sem ele, uma violação deixa-o legalmente exposto e operacionalmente paralisado.",
            },
          ],
          coversEyebrow: "Âmbito de Trabalho",
          coversTitle: "O Que o DataShield Cobre",
          coversBody:
            "Seis entregáveis estruturados para reduzir exposição, documentar controlos e tornar a sua organização defensável.",
          deliverables: [
            {
              title: "Auditoria de Fluxo de Dados",
              body:
                "Mapeamos onde os dados vivem, por onde circulam e onde são armazenados em sistemas, dispositivos e ferramentas de terceiros.",
            },
            {
              title: "Registo de Riscos",
              body:
                "Riscos de TI documentados com severidade e um plano de remediação claro e acionável.",
            },
            {
              title: "Política de Proteção de Dados",
              body:
                "Documento de conformidade com a sua marca para mostrar a clientes e reguladores com confiança.",
            },
            {
              title: "Plano de Resposta a Incidentes",
              body:
                "Procedimento de notificação em 72 horas alinhado à Lei 3/2017 - para saber exatamente o que fazer se algo correr mal.",
            },
            {
              title: "Revisão de Controlo de Acessos",
              body:
                "Quem tem acesso a quê, alinhado ao princípio do menor privilégio - para que dados sensíveis só sejam acedidos por quem precisa.",
            },
            {
              title: "Revisão Trimestral de Conformidade",
              body:
                "Garantia contínua, não um exercício único. Revemos trimestralmente para manter a postura atualizada.",
            },
          ],
          whoEyebrow: "Para Quem É",
          whoTitle: "Feito para Empresas com Risco de Dados",
          whoBody:
            "Se o seu trabalho envolve informação sensível de clientes, o DataShield foi feito para si.",
          whoCards: [
            {
              title: "Escritórios de Advogados",
              body:
                "A confidencialidade é uma obrigação profissional e legal. Uma violação expõe comunicações privilegiadas e encerra carreiras.",
              icon: "scale",
            },
            {
              title: "Clínicas Privadas e Grupos Médicos",
              body:
                "Dados de pacientes são a categoria mais sensível na proposta de lei. Conformidade não é opcional.",
              icon: "heart",
            },
            {
              title: "Contabilidade e Serviços Financeiros",
              body:
                "Gestão de registos financeiros para vários clientes exige controlos documentados, trilhas de auditoria e governação de acessos.",
              icon: "calculator",
            },
            {
              title: "ONGs com Doadores Internacionais",
              body:
                "Doadores da UE e EUA exigem cada vez mais evidências de governação de dados e controlos de cibersegurança.",
              icon: "globe",
            },
            {
              title: "Bancos e Instituições de Microfinança",
              body:
                "Regulados pelo Banco de Moçambique e expostos a padrões internacionais. Proteção de dados é uma obrigação ao nível de direção.",
              icon: "building",
            },
            {
              title: "Qualquer Empresa que Lida com Dados de Clientes",
              body:
                "Se armazena, processa ou transmite dados pessoais ou financeiros em nome de clientes, carrega risco legal e reputacional.",
              icon: "shieldcheck",
            },
          ],
          ctaTitle: "Descubra onde estão os seus riscos de dados",
          ctaBody: "Comece com uma Avaliação de Risco de TI gratuita. Sem compromisso.",
        }
      : {
          heroLead:
            "For law firms, clinics, and accounting firms handling sensitive client data - we help you protect it, document it, and prove it.",
          heroTitle: "Data Protection for Professional Services Firms",
          heroButton: "Get IT Audit",
          visualTitle: "Data Protection Ready",
          visualDesc:
            "Compliance documentation and risk management for professional services firms handling sensitive client data.",
          problemEyebrow: "Compliance & Risk",
          problemTitle: "The Risk Is Real",
          problemCards: [
            {
              title:
                "Mozambique's Personal Data Protection Law - modelled on GDPR is coming",
              body:
                "Non-compliance will carry criminal and administrative penalties. Firms that haven't documented their data practices will be exposed.",
            },
            {
              title:
                "Law firms and clinics working with foreign clients are already subject to GDPR today.",
              body:
                "Whether they know it or not. If you handle data from EU citizens, GDPR applies to you - regardless of where your offices are.",
            },
            {
              title:
                "A single data breach destroys client trust and professional reputation overnight.",
              body:
                "Most firms have no documented protection plan. Without one, a breach leaves you legally exposed and operationally paralysed.",
            },
          ],
          coversEyebrow: "Scope of Work",
          coversTitle: "What DataShield Covers",
          coversBody:
            "Six structured deliverables that move your firm from exposed to documented and defensible.",
          deliverables: [
            {
              title: "Data Flow Audit",
              body:
                "Map where client data lives, moves, and is stored across your firm's systems, devices, and third-party tools.",
            },
            {
              title: "Risk Register",
              body:
                "Documented IT risks with severity ratings and a clear remediation plan your team can act on.",
            },
            {
              title: "Data Protection Policy",
              body:
                "A branded compliance document your firm can show clients and regulators with confidence.",
            },
            {
              title: "Incident Response Plan",
              body:
                "72-hour breach notification procedure aligned to Lei 3/2017 - so you know exactly what to do if something goes wrong.",
            },
            {
              title: "Access Control Review",
              body:
                "Who has access to what, aligned to least privilege principles - so sensitive data is only reachable by those who need it.",
            },
            {
              title: "Quarterly Compliance Review",
              body:
                "Ongoing assurance, not a one-time engagement. We check in every quarter to keep your compliance posture current.",
            },
          ],
          whoEyebrow: "Who It's For",
          whoTitle: "Built for Businesses That Carry Data Risk",
          whoBody:
            "If your work involves sensitive client information, DataShield was built for you.",
          whoCards: [
            {
              title: "Law Firms",
              body:
                "Client confidentiality is a professional and legal obligation. One breach exposes privileged communications and ends careers.",
              icon: "scale",
            },
            {
              title: "Private Clinics & Medical Groups",
              body:
                "Patient data is the most sensitive category under Mozambique's draft data protection law. Compliance is not optional.",
              icon: "heart",
            },
            {
              title: "Accounting & Financial Services",
              body:
                "Firms managing financial records for multiple clients need documented controls, audit trails, and access governance.",
              icon: "calculator",
            },
            {
              title: "NGOs with International Donors",
              body:
                "EU and US donors increasingly require evidence of data governance and cybersecurity controls as a condition of funding.",
              icon: "globe",
            },
            {
              title: "Banks & Microfinance Institutions",
              body:
                "Regulated by Banco de Moçambique and exposed to international compliance standards. Data protection is a board-level obligation.",
              icon: "building",
            },
            {
              title: "Any Business Handling Client Data",
              body:
                "If you store, process, or transmit personal or financial data on behalf of clients, you carry legal and reputational risk.",
              icon: "shieldcheck",
            },
          ],
          ctaTitle: "Find out where your data risks are",
          ctaBody: "Start with a free IT Risk Assessment. No commitment.",
        };

  return (
    <PageShell locale={locale} pathname={withLocale(locale, "/solutions/datashield")}>
      {/* Hero */}
      <section className="hero-section hero-section--page">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">DataShield</span>
            <h1>{copy.heroTitle}</h1>
            <p className="hero-copy__lead">{copy.heroLead}</p>
            <div className="hero-actions">
              <PrimaryLink href={withLocale(locale, "/contact")}>{copy.heroButton}</PrimaryLink>
            </div>
          </div>
          <BrandVisual
            chips={["Data Flow Audit", "Risk Register", "Incident Response", "Access Control"]}
            description={copy.visualDesc}
            eyebrow="DataShield"
            title={copy.visualTitle}
            variant="shield"
          />
        </div>
      </section>

      {/* Problem */}
      <section className="content-section content-section--muted">
        <div className="container">
          <SectionHeading align="center" eyebrow={copy.problemEyebrow} title={copy.problemTitle} />
          <div className="card-grid card-grid--blog">
            <article className="feature-card feature-card--elevated">
              <ShieldIcon className="info-icon" />
              <h3>{copy.problemCards[0].title}</h3>
              <p>{copy.problemCards[0].body}</p>
            </article>
            <article className="feature-card feature-card--elevated">
              <ShieldIcon className="info-icon" />
              <h3>{copy.problemCards[1].title}</h3>
              <p>{copy.problemCards[1].body}</p>
            </article>
            <article className="feature-card feature-card--elevated">
              <ShieldIcon className="info-icon" />
              <h3>{copy.problemCards[2].title}</h3>
              <p>{copy.problemCards[2].body}</p>
            </article>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="content-section">
        <div className="container">
          <SectionHeading
            align="center"
            body={copy.coversBody}
            eyebrow={copy.coversEyebrow}
            title={copy.coversTitle}
          />
          <div className="card-grid card-grid--blog">
            <article className="feature-card">
              <SparkIcon className="info-icon" />
              <h3>{copy.deliverables[0].title}</h3>
              <p>{copy.deliverables[0].body}</p>
            </article>
            <article className="feature-card">
              <RefreshIcon className="info-icon" />
              <h3>{copy.deliverables[1].title}</h3>
              <p>{copy.deliverables[1].body}</p>
            </article>
            <article className="feature-card">
              <ShieldIcon className="info-icon" />
              <h3>{copy.deliverables[2].title}</h3>
              <p>{copy.deliverables[2].body}</p>
            </article>
            <article className="feature-card">
              <ShieldIcon className="info-icon" />
              <h3>{copy.deliverables[3].title}</h3>
              <p>{copy.deliverables[3].body}</p>
            </article>
            <article className="feature-card">
              <SparkIcon className="info-icon" />
              <h3>{copy.deliverables[4].title}</h3>
              <p>{copy.deliverables[4].body}</p>
            </article>
            <article className="feature-card">
              <RefreshIcon className="info-icon" />
              <h3>{copy.deliverables[5].title}</h3>
              <p>{copy.deliverables[5].body}</p>
            </article>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="content-section content-section--muted">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow={copy.whoEyebrow}
            title={copy.whoTitle}
            body={copy.whoBody}
          />
          <div className="card-grid card-grid--blog card-grid--datashield-who">
            <article className="feature-card feature-card--elevated">
              <ScaleIcon className="info-icon" />
              <h3>{copy.whoCards[0].title}</h3>
              <p>{copy.whoCards[0].body}</p>
            </article>
            <article className="feature-card feature-card--elevated">
              <HeartPulseIcon className="info-icon" />
              <h3>{copy.whoCards[1].title}</h3>
              <p>{copy.whoCards[1].body}</p>
            </article>
            <article className="feature-card feature-card--elevated">
              <CalculatorIcon className="info-icon" />
              <h3>{copy.whoCards[2].title}</h3>
              <p>{copy.whoCards[2].body}</p>
            </article>
            <article className="feature-card feature-card--elevated">
              <GlobeIcon className="info-icon" />
              <h3>{copy.whoCards[3].title}</h3>
              <p>{copy.whoCards[3].body}</p>
            </article>
            <article className="feature-card feature-card--elevated">
              <Building2Icon className="info-icon" />
              <h3>{copy.whoCards[4].title}</h3>
              <p>{copy.whoCards[4].body}</p>
            </article>
            <article className="feature-card feature-card--elevated">
              <ShieldCheckIcon className="info-icon" />
              <h3>{copy.whoCards[5].title}</h3>
              <p>{copy.whoCards[5].body}</p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="content-section">
        <div className="container cta-panel">
          <div>
            <span className="eyebrow">DataShield</span>
            <h2>{copy.ctaTitle}</h2>
            <p>{copy.ctaBody}</p>
          </div>
          <PrimaryLink href={withLocale(locale, "/contact")}>{copy.heroButton}</PrimaryLink>
        </div>
      </section>
    </PageShell>
  );
}
