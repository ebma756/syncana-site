export type Locale = "en" | "pt";
export type VendorLogoKey =
  | "microsoft"
  | "acronis"
  | "dell"
  | "lenovo"
  | "vmware"
  | "cisco"
  | "sophos";

type LocalizedText = Record<Locale, string>;
type LocalizedList = Record<Locale, readonly string[]>;

export type ServiceKey =
  | "managed-it"
  | "cybersecurity"
  | "cloud-m365"
  | "backup-recovery";

export type Syncana360StepKey =
  | "discovery"
  | "planning"
  | "onboarding"
  | "support"
  | "review";

export type BlogPost = {
  slug: string;
  accent: "core" | "shield" | "cloud" | "backup" | "growth" | "resilience";
  category: LocalizedText;
  title: LocalizedText;
  excerpt: LocalizedText;
  date: LocalizedText;
  readingTime: LocalizedText;
  heroLabel: LocalizedText;
  takeaways?: LocalizedList;
  image?: {
    src: string;
    alt: LocalizedText;
    caption?: LocalizedText;
  };
  useCase?: {
    title: LocalizedText;
    body: LocalizedText;
  };
  sections: Array<{
    heading: LocalizedText;
    paragraphs: LocalizedList;
  }>;
};

export const locales: Locale[] = ["en", "pt"];

export const contactDetails = {
  phone: "+258 85 24 55 898",
  email: "info@syncanatech.com",
  location: "175 Rua da Resistência, Maputo, Mozambique",
  linkedIn: "https://www.linkedin.com/company/syncana-technologies/",
  website: "https://syncanatech.com",
};

export const navigation = [
  {
    key: "home",
    href: "/",
    label: {
      en: "Home",
      pt: "Início",
    },
  },
  {
    key: "our-expertise",
    href: "/our-expertise",
    label: {
      en: "Our Expertise",
      pt: "A Nossa Especialização",
    },
  },
  {
    key: "about-us",
    href: "/about-us",
    label: {
      en: "About us",
      pt: "Sobre Nós",
    },
  },
  {
    key: "tech-talk",
    href: "/tech-talk",
    label: {
      en: "Tech Talk",
      pt: "Tech Talk",
    },
  },
] as const;

export const partnerBadges = [
  "Microsoft",
  "Acronis",
  "Dell",
  "Lenovo",
  "VMware",
  "Cisco",
  "Sophos",
];

export const services = [
  {
    key: "managed-it",
    accent: "core",
    title: {
      en: "Managed IT Services",
      pt: "Serviços Geridos de TI",
    },
    summary: {
      en: "Reliable day-to-day support, administration, monitoring, and reporting for teams that need IT to stay predictable.",
      pt: "Suporte diário fiável, administração, monitorização e reporting para equipas que precisam de uma operação de TI previsível.",
    },
    detailIntro: {
      en: "A complete support layer for businesses that need responsive help, healthy endpoints, and clear monthly visibility.",
      pt: "Uma camada completa de suporte para empresas que precisam de ajuda rápida, endpoints saudáveis e visibilidade mensal clara.",
    },
    bullets: {
      en: [
        "Helpdesk and remote support",
        "User and device administration",
        "Monitoring and maintenance",
        "Endpoint protection",
        "Monthly technology management and reporting",
      ],
      pt: [
        "Helpdesk e suporte remoto",
        "Administração de utilizadores e dispositivos",
        "Monitorização e manutenção",
        "Proteção de endpoints",
        "Gestão tecnológica mensal e reporting",
      ],
    },
    outcomes: {
      en: [
        "Shorter downtime for staff",
        "Clear ownership of routine IT operations",
        "Consistent patching and preventive care",
      ],
      pt: [
        "Menos tempo de paragem para as equipas",
        "Responsabilidade clara pelas operações de TI do dia a dia",
        "Atualizações e manutenção preventiva consistentes",
      ],
    },
    wheelLabel: {
      en: "Managed IT",
      pt: "TI Gerida",
    },
    wheelTitle: {
      en: "Managed IT Services",
      pt: "Serviços Geridos de TI",
    },
    wheelSummary: {
      en: "A responsive support layer for users, devices, maintenance, and everyday operational visibility.",
      pt: "Uma camada de suporte responsiva para utilizadores, dispositivos, manutenção e visibilidade operacional diária.",
    },
    wheelCapabilities: {
      en: ["Helpdesk", "Device Admin", "Monitoring", "Endpoint Care"],
      pt: ["Helpdesk", "Administração", "Monitorização", "Proteção Endpoint"],
    },
    wheelTools: [
      {
        logo: "microsoft",
        label: {
          en: "Microsoft 365 admin",
          pt: "Administração Microsoft 365",
        },
      },
      {
        logo: "dell",
        label: {
          en: "Business device lifecycle",
          pt: "Ciclo de vida de dispositivos",
        },
      },
      {
        logo: "lenovo",
        label: {
          en: "Endpoint fleet readiness",
          pt: "Prontidão do parque de endpoints",
        },
      },
    ],
  },
  {
    key: "cybersecurity",
    accent: "shield",
    title: {
      en: "Cybersecurity",
      pt: "Cibersegurança",
    },
    summary: {
      en: "Practical, layered security controls that protect devices, users, email, and network edges without slowing the business down.",
      pt: "Controlos práticos e em camadas para proteger dispositivos, utilizadores, email e perímetro de rede sem travar o negócio.",
    },
    detailIntro: {
      en: "Security services designed for growing businesses that need strong basics, better visibility, and fewer avoidable incidents.",
      pt: "Serviços de segurança pensados para empresas em crescimento que precisam de bases sólidas, melhor visibilidade e menos incidentes evitáveis.",
    },
    bullets: {
      en: [
        "Endpoint and server protection",
        "Email filtering and anti-phishing",
        "Firewall and vulnerability management",
      ],
      pt: [
        "Proteção de endpoints e servidores",
        "Filtragem de email e anti-phishing",
        "Gestão de firewall e vulnerabilidades",
      ],
    },
    outcomes: {
      en: [
        "Reduced exposure to phishing and malware",
        "More resilient perimeter and endpoint posture",
        "Actionable security priorities instead of noise",
      ],
      pt: [
        "Menor exposição a phishing e malware",
        "Postura de segurança mais resiliente no perímetro e nos endpoints",
        "Prioridades de segurança acionáveis em vez de ruído",
      ],
    },
    wheelLabel: {
      en: "Cybersecurity",
      pt: "Cibersegurança",
    },
    wheelTitle: {
      en: "Cybersecurity",
      pt: "Cibersegurança",
    },
    wheelSummary: {
      en: "Layered protection for endpoints, email, firewalls, and vulnerability exposure across the environment.",
      pt: "Proteção em camadas para endpoints, email, firewalls e exposição a vulnerabilidades em todo o ambiente.",
    },
    wheelCapabilities: {
      en: ["Endpoint Security", "Anti-Phishing", "Firewall", "Vulnerability Review"],
      pt: ["Segurança Endpoint", "Anti-Phishing", "Firewall", "Vulnerabilidades"],
    },
    wheelTools: [
      {
        logo: "sophos",
        label: {
          en: "Threat protection",
          pt: "Proteção contra ameaças",
        },
      },
      {
        logo: "cisco",
        label: {
          en: "Network edge controls",
          pt: "Controlos no perímetro de rede",
        },
      },
      {
        logo: "microsoft",
        label: {
          en: "Identity-aware security",
          pt: "Segurança com foco em identidade",
        },
      },
    ],
  },
  {
    key: "cloud-m365",
    accent: "cloud",
    title: {
      en: "Cloud & Microsoft 365",
      pt: "Cloud e Microsoft 365",
    },
    summary: {
      en: "Hands-on Microsoft 365 administration and user lifecycle support for businesses that depend on cloud productivity.",
      pt: "Administração prática de Microsoft 365 e suporte ao ciclo de vida do utilizador para empresas que dependem da produtividade na cloud.",
    },
    detailIntro: {
      en: "From onboarding to collaboration tooling, we help teams use Microsoft 365 securely and with fewer support bottlenecks.",
      pt: "Desde o onboarding às ferramentas de colaboração, ajudamos as equipas a usar o Microsoft 365 com segurança e menos bloqueios de suporte.",
    },
    bullets: {
      en: [
        "Microsoft 365 administration",
        "User onboarding and offboarding",
        "Email setup and management",
        "Teams, SharePoint, and OneDrive support",
      ],
      pt: [
        "Administração de Microsoft 365",
        "Onboarding e offboarding de utilizadores",
        "Configuração e gestão de email",
        "Suporte a Teams, SharePoint e OneDrive",
      ],
    },
    outcomes: {
      en: [
        "Faster user setup and role changes",
        "Cleaner collaboration environments",
        "Better alignment between productivity and security",
      ],
      pt: [
        "Configuração de utilizadores e mudanças de função mais rápidas",
        "Ambientes de colaboração mais organizados",
        "Melhor alinhamento entre produtividade e segurança",
      ],
    },
    wheelLabel: {
      en: "Cloud & M365",
      pt: "Cloud & M365",
    },
    wheelTitle: {
      en: "Cloud & Microsoft 365",
      pt: "Cloud e Microsoft 365",
    },
    wheelSummary: {
      en: "Structured Microsoft 365 operations for collaboration, email, onboarding, and secure cloud productivity.",
      pt: "Operações estruturadas de Microsoft 365 para colaboração, email, onboarding e produtividade cloud segura.",
    },
    wheelCapabilities: {
      en: ["M365 Admin", "Onboarding", "Email Ops", "Teams & SharePoint"],
      pt: ["Admin M365", "Onboarding", "Email", "Teams & SharePoint"],
    },
    wheelTools: [
      {
        logo: "microsoft",
        label: {
          en: "Microsoft 365 services",
          pt: "Serviços Microsoft 365",
        },
      },
      {
        logo: "cisco",
        label: {
          en: "Connectivity and collaboration edge",
          pt: "Conectividade e colaboração",
        },
      },
      {
        logo: "vmware",
        label: {
          en: "Hybrid environment support",
          pt: "Suporte a ambiente híbrido",
        },
      },
    ],
  },
  {
    key: "backup-recovery",
    accent: "backup",
    title: {
      en: "Backup, Recovery & Business Continuity",
      pt: "Backup, Recuperação e Continuidade do Negócio",
    },
    summary: {
      en: "Backup and disaster recovery planning that keeps critical information protected and operations recoverable.",
      pt: "Planeamento de backup e recuperação de desastre para manter a informação crítica protegida e a operação recuperável.",
    },
    detailIntro: {
      en: "We help organisations protect business-critical data and define a practical path back to service when disruption happens.",
      pt: "Ajudamos as organizações a proteger dados críticos e a definir um caminho prático de regresso ao serviço quando houver interrupção.",
    },
    bullets: {
      en: ["Backup and disaster recovery"],
      pt: ["Backup e recuperação de desastre"],
    },
    outcomes: {
      en: [
        "Recoverable systems and core documents",
        "Reduced business risk during incidents",
        "Greater confidence in continuity planning",
      ],
      pt: [
        "Sistemas e documentos principais recuperáveis",
        "Menor risco de negócio durante incidentes",
        "Mais confiança no planeamento de continuidade",
      ],
    },
    wheelLabel: {
      en: "Backup & Recovery",
      pt: "Backup & Recuperação",
    },
    wheelTitle: {
      en: "Backup, Recovery & Business Continuity",
      pt: "Backup, Recuperação e Continuidade do Negócio",
    },
    wheelSummary: {
      en: "Recovery-focused planning to protect critical business data, restore service, and improve continuity readiness.",
      pt: "Planeamento orientado para recuperação para proteger dados críticos, restaurar serviço e melhorar a preparação para continuidade.",
    },
    wheelCapabilities: {
      en: ["Backup", "Disaster Recovery", "Restore Testing", "Continuity Planning"],
      pt: ["Backup", "Recuperação", "Testes de Restore", "Continuidade"],
    },
    wheelTools: [
      {
        logo: "acronis",
        label: {
          en: "Backup orchestration",
          pt: "Orquestração de backup",
        },
      },
      {
        logo: "vmware",
        label: {
          en: "Virtual recovery support",
          pt: "Suporte a recuperação virtual",
        },
      },
      {
        logo: "dell",
        label: {
          en: "Infrastructure continuity",
          pt: "Continuidade de infraestrutura",
        },
      },
    ],
  },
] as const;

export const syncana360Steps = [
  {
    key: "discovery",
    step: "01",
    wheelLabel: {
      en: "Discovery",
      pt: "Descoberta",
    },
    centerLabel: {
      en: "Discovery",
      pt: "Descoberta",
    },
    centerSummary: {
      en: "Audit the current environment, expose risk, and surface the most important operational gaps first.",
      pt: "Auditar o ambiente atual, expor riscos e revelar primeiro as lacunas operacionais mais importantes.",
    },
    panelTitle: {
      en: "Discovery and Analysis",
      pt: "Descoberta e Análise",
    },
    panelDescription: {
      en: "We run an IT Risk Assessment/IT Audit at your infrastructure to identify risks, vulnerabilities, and opportunities for improvement.",
      pt: "Realizamos uma avaliação de risco e auditoria de TI na sua infraestrutura para identificar riscos, vulnerabilidades e oportunidades de melhoria.",
    },
    orbitCaps: {
      en: ["IT Audit", "Risk Review", "Gap Analysis", "Priority Mapping"],
      pt: [
        "Auditoria de TI",
        "Revisão de Risco",
        "Análise de Lacunas",
        "Mapeamento de Prioridades",
      ],
    },
    panelBullets: {
      en: [
        "Reviews infrastructure, users, access, and current controls",
        "Highlights immediate vulnerabilities and operational friction",
        "Creates a clearer baseline for the next technology decisions",
      ],
      pt: [
        "Revê infraestrutura, utilizadores, acessos e controlos atuais",
        "Destaca vulnerabilidades imediatas e fricção operacional",
        "Cria uma base mais clara para as próximas decisões tecnológicas",
      ],
    },
  },
  {
    key: "planning",
    step: "02",
    wheelLabel: {
      en: "Planning",
      pt: "Planeamento",
    },
    centerLabel: {
      en: "Planning",
      pt: "Planeamento",
    },
    centerSummary: {
      en: "Turn findings into a practical roadmap shaped by business priorities, budget, and growth plans.",
      pt: "Transformar conclusões num roadmap prático alinhado com prioridades, orçamento e crescimento.",
    },
    panelTitle: {
      en: "Strategic Technology Planning",
      pt: "Planeamento Estratégico de Tecnologia",
    },
    panelDescription: {
      en: "A customised technology roadmap aligned with your business goals, budget, and growth plans.",
      pt: "Um roadmap tecnológico personalizado, alinhado com os seus objetivos de negócio, orçamento e planos de crescimento.",
    },
    orbitCaps: {
      en: ["Roadmap", "Budget Fit", "Business Goals", "Prioritisation"],
      pt: ["Roadmap", "Enquadramento Orçamental", "Objetivos", "Priorização"],
    },
    panelBullets: {
      en: [
        "Defines what should be fixed, modernised, or introduced first",
        "Balances business impact with realistic implementation pacing",
        "Connects technology decisions to measurable operational goals",
      ],
      pt: [
        "Define o que deve ser corrigido, modernizado ou introduzido primeiro",
        "Equilibra impacto no negócio com um ritmo de implementação realista",
        "Liga decisões tecnológicas a objetivos operacionais mensuráveis",
      ],
    },
  },
  {
    key: "onboarding",
    step: "03",
    wheelLabel: {
      en: "Onboarding",
      pt: "Onboarding",
    },
    centerLabel: {
      en: "Onboarding",
      pt: "Onboarding",
    },
    centerSummary: {
      en: "Set up systems, users, and workflows with a structured rollout that minimises disruption.",
      pt: "Configurar sistemas, utilizadores e fluxos com uma implementação estruturada e pouca disrupção.",
    },
    panelTitle: {
      en: "Onboarding & Implementation",
      pt: "Onboarding e Implementação",
    },
    panelDescription: {
      en: "We handle the full setup of your IT systems, ensuring a smooth transition with minimal disruption to your operations.",
      pt: "Tratamos da configuração completa dos seus sistemas de TI, garantindo uma transição fluida com mínima interrupção das operações.",
    },
    orbitCaps: {
      en: ["Rollout", "User Setup", "Migration", "Adoption"],
      pt: ["Implementação", "Configuração", "Migração", "Adoção"],
    },
    panelBullets: {
      en: [
        "Coordinates onboarding of users, devices, and key platforms",
        "Applies the agreed roadmap in a controlled implementation phase",
        "Reduces downtime with documented transitions and handover steps",
      ],
      pt: [
        "Coordena o onboarding de utilizadores, dispositivos e plataformas-chave",
        "Aplica o roadmap acordado numa fase de implementação controlada",
        "Reduz paragens com transições documentadas e passos de handover",
      ],
    },
  },
  {
    key: "support",
    step: "04",
    wheelLabel: {
      en: "Ongoing Support & Maintenance",
      pt: "Suporte e Manutenção Contínuos",
    },
    centerLabel: {
      en: "Ongoing Support",
      pt: "Suporte Contínuo",
    },
    centerSummary: {
      en: "Keep operations stable through monitoring, maintenance, and responsive day-to-day support.",
      pt: "Manter a operação estável com monitorização, manutenção e suporte diário responsivo.",
    },
    panelTitle: {
      en: "Ongoing Support & Maintenance",
      pt: "Suporte e Manutenção Contínuos",
    },
    panelDescription: {
      en: "Continuous monitoring, proactive maintenance, and rapid helpdesk support to keep your business running.",
      pt: "Monitorização contínua, manutenção proativa e suporte rápido de helpdesk para manter o seu negócio em funcionamento.",
    },
    orbitCaps: {
      en: ["Monitoring", "Maintenance", "Helpdesk", "Response"],
      pt: ["Monitorização", "Manutenção", "Helpdesk", "Resposta"],
    },
    panelBullets: {
      en: [
        "Provides ongoing visibility into the health of the IT environment",
        "Addresses incidents quickly while reducing repeat operational issues",
        "Keeps systems current through preventive maintenance routines",
      ],
      pt: [
        "Oferece visibilidade contínua sobre a saúde do ambiente de TI",
        "Resolve incidentes rapidamente enquanto reduz problemas recorrentes",
        "Mantém os sistemas atualizados com rotinas de manutenção preventiva",
      ],
    },
  },
  {
    key: "review",
    step: "05",
    wheelLabel: {
      en: "Continuous Review",
      pt: "Revisão Contínua",
    },
    centerLabel: {
      en: "Continuous Review",
      pt: "Revisão Contínua",
    },
    centerSummary: {
      en: "Measure, refine, and improve the environment so IT stays efficient, secure, and aligned.",
      pt: "Medir, ajustar e melhorar o ambiente para manter a TI eficiente, segura e alinhada.",
    },
    panelTitle: {
      en: "Continuous Review & Consultancy",
      pt: "Revisão Contínua e Consultoria",
    },
    panelDescription: {
      en: "We continuously assess your IT environment, refine what is in place, and introduce improvements that keep your technology efficient, secure, and aligned with your business needs.",
      pt: "Avaliamos continuamente o seu ambiente de TI, refinamos o que já está implementado e introduzimos melhorias que mantêm a tecnologia eficiente, segura e alinhada com as necessidades do seu negócio.",
    },
    orbitCaps: {
      en: ["Optimisation", "Innovation", "Review Cycle", "Continuous Gains"],
      pt: ["Otimização", "Inovação", "Ciclo de Revisão", "Melhoria Contínua"],
    },
    panelBullets: {
      en: [
        "Reviews performance, risk, and user experience over time",
        "Refines the environment as the business evolves and scales",
        "Introduces practical improvements instead of one-off project thinking",
      ],
      pt: [
        "Revê desempenho, risco e experiência do utilizador ao longo do tempo",
        "Refina o ambiente à medida que o negócio evolui e cresce",
        "Introduz melhorias práticas em vez de uma lógica de projeto isolado",
      ],
    },
  },
] as const;

export const valueCards = [
  {
    title: {
      en: "Responsiveness",
      pt: "Capacidade de Resposta",
    },
    body: {
      en: "We act quickly, communicate clearly, and keep people informed while issues are being solved.",
      pt: "Agimos com rapidez, comunicamos com clareza e mantemos as pessoas informadas enquanto os problemas são resolvidos.",
    },
  },
  {
    title: {
      en: "Partnership",
      pt: "Parceria",
    },
    body: {
      en: "We work as an extension of your business, aligning technology decisions with operational priorities.",
      pt: "Trabalhamos como uma extensão do seu negócio, alinhando decisões tecnológicas com prioridades operacionais.",
    },
  },
  {
    title: {
      en: "Practical innovation",
      pt: "Inovação Prática",
    },
    body: {
      en: "We use proven tools and modern approaches where they add measurable value, not noise.",
      pt: "Usamos ferramentas comprovadas e abordagens modernas quando acrescentam valor mensurável, e não ruído.",
    },
  },
  {
    title: {
      en: "Trust",
      pt: "Confiança",
    },
    body: {
      en: "Security, reliability, and accountability shape the way we support every client environment.",
      pt: "Segurança, fiabilidade e responsabilidade moldam a forma como apoiamos cada ambiente dos nossos clientes.",
    },
  },
] as const;

export const differentiators = [
  {
    title: {
      en: "Maputo-based support with business context",
      pt: "Suporte baseado em Maputo com contexto de negócio",
    },
    body: {
      en: "We support growing organisations with a local understanding of pace, expectations, and operational realities in Mozambique.",
      pt: "Apoiamos organizações em crescimento com uma compreensão local do ritmo, das expectativas e da realidade operacional em Moçambique.",
    },
  },
  {
    title: {
      en: "Proactive care, not just ticket closure",
      pt: "Cuidado proativo, não apenas fecho de tickets",
    },
    body: {
      en: "Monitoring, maintenance, and reporting help us address risks early instead of waiting for recurring disruption.",
      pt: "A monitorização, manutenção e o reporting ajudam-nos a tratar riscos cedo, em vez de esperar por interrupções recorrentes.",
    },
  },
  {
    title: {
      en: "Security built into core operations",
      pt: "Segurança integrada nas operações principais",
    },
    body: {
      en: "Endpoint, email, firewall, and vulnerability controls are embedded into the way we manage your environment.",
      pt: "Os controlos de endpoint, email, firewall e vulnerabilidades são integrados na forma como gerimos o seu ambiente.",
    },
  },
  {
    title: {
      en: "One partner across support, cloud, and continuity",
      pt: "Um só parceiro para suporte, cloud e continuidade",
    },
    body: {
      en: "Instead of juggling disconnected vendors, you get coordinated support across devices, users, cloud platforms, and recovery planning.",
      pt: "Em vez de gerir fornecedores desconectados, tem apoio coordenado para dispositivos, utilizadores, plataformas cloud e planeamento de recuperação.",
    },
  },
] as const;

export const processSteps = [
  {
    step: "01",
    title: {
      en: "Assess the current environment",
      pt: "Avaliar o ambiente atual",
    },
    body: {
      en: "We review users, devices, Microsoft 365, security basics, and operational pain points to understand where support is needed first.",
      pt: "Revemos utilizadores, dispositivos, Microsoft 365, bases de segurança e pontos críticos operacionais para perceber onde o apoio é mais urgente.",
    },
  },
  {
    step: "02",
    title: {
      en: "Stabilise daily operations",
      pt: "Estabilizar as operações diárias",
    },
    body: {
      en: "We organise support workflows, device administration, maintenance, and user coverage to reduce friction for your team.",
      pt: "Organizamos fluxos de suporte, administração de dispositivos, manutenção e cobertura dos utilizadores para reduzir fricção na sua equipa.",
    },
  },
  {
    step: "03",
    title: {
      en: "Secure core systems",
      pt: "Proteger os sistemas principais",
    },
    body: {
      en: "We harden endpoints, improve email security, review firewalls, and prioritise vulnerabilities that materially affect risk.",
      pt: "Reforçamos endpoints, melhoramos a segurança de email, revemos firewalls e priorizamos vulnerabilidades que afetam materialmente o risco.",
    },
  },
  {
    step: "04",
    title: {
      en: "Support, report, and improve",
      pt: "Suportar, reportar e melhorar",
    },
    body: {
      en: "Ongoing support, reporting, and planning help your business keep improving without losing control of day-to-day IT.",
      pt: "Suporte contínuo, reporting e planeamento ajudam o seu negócio a evoluir sem perder controlo do TI do dia a dia.",
    },
  },
] as const;

export const faqItems = [
  {
    question: {
      en: "How quickly can Syncana respond to support issues?",
      pt: "Com que rapidez a Syncana pode responder a pedidos de suporte?",
    },
    answer: {
      en: "Response times depend on the support scope in place, but our model is built around fast acknowledgement, remote troubleshooting, and clear escalation for business-impacting issues.",
      pt: "Os tempos de resposta dependem do âmbito de suporte contratado, mas o nosso modelo assenta em reconhecimento rápido, resolução remota e escalonamento claro para incidentes com impacto no negócio.",
    },
  },
  {
    question: {
      en: "Do you support Microsoft 365 and hybrid environments?",
      pt: "Prestam suporte a Microsoft 365 e ambientes híbridos?",
    },
    answer: {
      en: "Yes. We support Microsoft 365 administration alongside user devices, endpoints, email, collaboration tools, and hybrid day-to-day operations.",
      pt: "Sim. Prestamos suporte à administração do Microsoft 365 em conjunto com dispositivos de utilizador, endpoints, email, ferramentas de colaboração e operações híbridas do dia a dia.",
    },
  },
  {
    question: {
      en: "Can you take over from our current IT provider?",
      pt: "Podem assumir a operação a partir do nosso atual fornecedor de TI?",
    },
    answer: {
      en: "Yes. We can assess the current setup, document access and responsibilities, and create a structured transition that reduces disruption.",
      pt: "Sim. Podemos avaliar o ambiente atual, documentar acessos e responsabilidades e criar uma transição estruturada que reduza a interrupção.",
    },
  },
  {
    question: {
      en: "Do you only work with businesses in Maputo?",
      pt: "Trabalham apenas com empresas em Maputo?",
    },
    answer: {
      en: "Maputo is our home base, but our services are designed to support businesses across Mozambique through a combination of remote support and planned onsite work where needed.",
      pt: "Maputo é a nossa base, mas os nossos serviços foram pensados para apoiar empresas em Moçambique através de suporte remoto e trabalho presencial planeado quando necessário.",
    },
  },
] as const;

export const blogPosts: BlogPost[] = [
  {
    slug: "managed-it-growth-playbook",
    accent: "growth",
    category: {
      en: "Managed IT",
      pt: "TI Gerida",
    },
    title: {
      en: "A managed IT playbook for growing businesses",
      pt: "Um playbook de TI gerida para empresas em crescimento",
    },
    excerpt: {
      en: "What support maturity actually looks like when your team is scaling faster than your internal IT capacity.",
      pt: "Como é a maturidade de suporte quando a sua equipa cresce mais depressa do que a capacidade interna de TI.",
    },
    date: {
      en: "March 12, 2026",
      pt: "12 de março de 2026",
    },
    readingTime: {
      en: "6 min read",
      pt: "6 min de leitura",
    },
    heroLabel: {
      en: "Managed IT for scale",
      pt: "TI gerida para escalar",
    },
    takeaways: {
      en: [
        "Growing teams need clearer ownership for daily IT tasks.",
        "Standardisation makes support faster and less disruptive.",
        "Regular reporting turns IT into a management decision, not just a ticket queue.",
      ],
      pt: [
        "Equipas em crescimento precisam de responsabilidade mais clara nas tarefas diárias de TI.",
        "A normalização torna o suporte mais rápido e menos disruptivo.",
        "O reporting regular transforma TI numa decisão de gestão, não apenas numa fila de tickets.",
      ],
    },
    image: {
      src: "/images/services/managed-it.jpg",
      alt: {
        en: "Technology professionals working together around a laptop in an office.",
        pt: "Profissionais de tecnologia a trabalhar em conjunto à volta de um portátil num escritório.",
      },
      caption: {
        en: "Managed IT works best when support, device health, and user administration are handled as one operating rhythm.",
        pt: "A TI gerida funciona melhor quando suporte, saúde dos dispositivos e administração de utilizadores são tratados como um só ritmo operacional.",
      },
    },
    useCase: {
      title: {
        en: "A growing finance team with no clear support owner",
        pt: "Uma equipa financeira em crescimento sem responsável claro pelo suporte",
      },
      body: {
        en: "A 25-person business often starts with ad hoc fixes from whichever staff member is “good with computers.” As new hires arrive, that model breaks down quickly. A managed IT playbook gives the business a helpdesk path, clearer device standards, and a better view of recurring operational issues.",
        pt: "Uma empresa com 25 pessoas começa muitas vezes com correções ad hoc feitas por quem “percebe de computadores”. À medida que entram novos colaboradores, esse modelo degrada-se rapidamente. Um playbook de TI gerida dá à empresa um caminho claro de helpdesk, melhores padrões para dispositivos e mais visibilidade sobre problemas operacionais recorrentes.",
      },
    },
    sections: [
      {
        heading: {
          en: "Support should become more visible as the business grows",
          pt: "O suporte deve tornar-se mais visível à medida que a empresa cresce",
        },
        paragraphs: {
          en: [
            "Many businesses reach a point where IT issues stop being occasional annoyances and start interrupting work across departments. New users need onboarding, devices need maintenance, access rights become more complex, and recurring requests begin to pile up.",
            "A managed IT model creates consistency around support, ownership, and reporting. Instead of reacting to problems one by one, the business gains a clear operating rhythm for users, devices, and routine administration.",
          ],
          pt: [
            "Muitas empresas chegam a um ponto em que os problemas de TI deixam de ser incómodos ocasionais e passam a interromper o trabalho em vários departamentos. Novos utilizadores precisam de onboarding, os dispositivos exigem manutenção, os acessos tornam-se mais complexos e os pedidos recorrentes acumulam-se.",
            "Um modelo de TI gerida cria consistência no suporte, na responsabilidade e no reporting. Em vez de reagir problema a problema, a empresa ganha um ritmo operacional claro para utilizadores, dispositivos e administração de rotina.",
          ],
        },
      },
      {
        heading: {
          en: "Standardisation reduces avoidable friction",
          pt: "A normalização reduz fricção evitável",
        },
        paragraphs: {
          en: [
            "When setups differ widely from one user to the next, support becomes slower and more expensive. Standard device configurations, user administration practices, and maintenance routines make troubleshooting faster and help security controls work properly.",
            "This is especially important for growing teams that depend on Microsoft 365, remote work, and shared collaboration tools. Small inconsistencies often become bigger support issues later.",
          ],
          pt: [
            "Quando as configurações variam muito de um utilizador para outro, o suporte torna-se mais lento e mais caro. Configurações normalizadas de dispositivos, práticas consistentes de administração de utilizadores e rotinas de manutenção tornam a resolução mais rápida e ajudam os controlos de segurança a funcionar corretamente.",
            "Isto é especialmente importante para equipas em crescimento que dependem de Microsoft 365, trabalho remoto e ferramentas de colaboração partilhadas. Pequenas inconsistências tornam-se, mais tarde, problemas maiores de suporte.",
          ],
        },
      },
      {
        heading: {
          en: "Reporting turns IT into a management function",
          pt: "O reporting transforma TI numa função de gestão",
        },
        paragraphs: {
          en: [
            "One of the biggest differences between ad hoc support and managed services is visibility. With regular reporting, leadership can see recurring issues, major risks, pending actions, and the health of the broader environment.",
            "That visibility helps businesses make better decisions about upgrades, staffing, budgeting, and security priorities instead of guessing from the latest urgent ticket.",
          ],
          pt: [
            "Uma das maiores diferenças entre suporte ad hoc e serviços geridos é a visibilidade. Com reporting regular, a liderança consegue ver problemas recorrentes, riscos principais, ações pendentes e o estado geral do ambiente.",
            "Essa visibilidade ajuda as empresas a tomar melhores decisões sobre upgrades, equipa, orçamento e prioridades de segurança, em vez de decidir com base no ticket mais urgente do momento.",
          ],
        },
      },
    ],
  },
  {
    slug: "microsoft-365-clean-operating-model",
    accent: "cloud",
    category: {
      en: "Microsoft 365",
      pt: "Microsoft 365",
    },
    title: {
      en: "Building a cleaner Microsoft 365 operating model",
      pt: "Como construir um modelo operacional mais limpo no Microsoft 365",
    },
    excerpt: {
      en: "A practical way to organise users, email, access, and collaboration before sprawl becomes a business risk.",
      pt: "Uma forma prática de organizar utilizadores, email, acessos e colaboração antes que a desorganização se torne risco para o negócio.",
    },
    date: {
      en: "March 15, 2026",
      pt: "15 de março de 2026",
    },
    readingTime: {
      en: "5 min read",
      pt: "5 min de leitura",
    },
    heroLabel: {
      en: "Cloud productivity",
      pt: "Produtividade cloud",
    },
    takeaways: {
      en: [
        "User onboarding and offboarding have direct security impact.",
        "Clear structure in Teams, SharePoint, and OneDrive reduces confusion.",
        "Microsoft 365 works best when productivity and security decisions stay connected.",
      ],
      pt: [
        "O onboarding e offboarding de utilizadores têm impacto direto na segurança.",
        "Uma estrutura clara em Teams, SharePoint e OneDrive reduz confusão.",
        "O Microsoft 365 funciona melhor quando produtividade e segurança permanecem ligadas.",
      ],
    },
    image: {
      src: "/images/services/cloud-m365.jpg",
      alt: {
        en: "Modern workspace representing Microsoft 365 collaboration and cloud operations.",
        pt: "Espaço de trabalho moderno que representa colaboração no Microsoft 365 e operações cloud.",
      },
      caption: {
        en: "A cleaner Microsoft 365 operating model starts with simple rules for users, access, and shared workspaces.",
        pt: "Um modelo operacional mais limpo no Microsoft 365 começa com regras simples para utilizadores, acessos e espaços de trabalho partilhados.",
      },
    },
    useCase: {
      title: {
        en: "A new employee joins but access is still improvised",
        pt: "Um novo colaborador entra, mas os acessos continuam improvisados",
      },
      body: {
        en: "If every new user setup depends on memory instead of a repeatable process, errors follow: wrong licences, missing folders, too much access, or delayed email. A cleaner Microsoft 365 model removes that friction and lowers risk at the same time.",
        pt: "Se cada configuração de novo utilizador depender da memória em vez de um processo repetível, os erros aparecem: licenças erradas, pastas em falta, acessos excessivos ou atraso no email. Um modelo mais limpo de Microsoft 365 remove essa fricção e reduz o risco ao mesmo tempo.",
      },
    },
    sections: [
      {
        heading: {
          en: "User lifecycle management matters more than most teams expect",
          pt: "A gestão do ciclo de vida do utilizador é mais importante do que muitas equipas pensam",
        },
        paragraphs: {
          en: [
            "Onboarding and offboarding are often treated as quick administrative tasks, but they have direct implications for productivity, compliance, and security. Missing mailboxes, incorrect permissions, and unclosed accounts create avoidable risk.",
            "A clean Microsoft 365 model defines who creates users, how licences are assigned, what collaboration spaces are provisioned, and how departing staff are removed without losing business data.",
          ],
          pt: [
            "O onboarding e o offboarding são muitas vezes tratados como tarefas administrativas rápidas, mas têm impacto direto na produtividade, conformidade e segurança. Mailboxes em falta, permissões incorretas e contas não encerradas criam riscos evitáveis.",
            "Um modelo limpo de Microsoft 365 define quem cria utilizadores, como as licenças são atribuídas, que espaços de colaboração são provisionados e como os colaboradores que saem são removidos sem perda de dados do negócio.",
          ],
        },
      },
      {
        heading: {
          en: "Structure improves collaboration",
          pt: "A estrutura melhora a colaboração",
        },
        paragraphs: {
          en: [
            "Teams, SharePoint, and OneDrive become far more useful when there are simple rules for ownership, naming, permissions, and document storage. Without that structure, finding information becomes harder and duplicate work increases.",
            "The best operating model is not complicated. It is documented, easy to follow, and aligned to the way the business actually works.",
          ],
          pt: [
            "Teams, SharePoint e OneDrive tornam-se muito mais úteis quando existem regras simples para responsabilidade, nomenclatura, permissões e armazenamento documental. Sem essa estrutura, encontrar informação torna-se mais difícil e o trabalho duplicado aumenta.",
            "O melhor modelo operacional não é complicado. É documentado, fácil de seguir e alinhado com a forma como a empresa realmente trabalha.",
          ],
        },
      },
      {
        heading: {
          en: "Security and productivity should not be separate conversations",
          pt: "Segurança e produtividade não devem ser conversas separadas",
        },
        paragraphs: {
          en: [
            "Microsoft 365 administration is strongest when productivity and security decisions are made together. The way licences, devices, groups, and mailboxes are configured has a direct impact on exposure, support workload, and user experience.",
            "A good operating model helps teams move faster because the environment is predictable, supportable, and easier to secure.",
          ],
          pt: [
            "A administração do Microsoft 365 é mais forte quando produtividade e segurança são decididas em conjunto. A forma como licenças, dispositivos, grupos e mailboxes são configurados tem impacto direto na exposição, na carga de suporte e na experiência do utilizador.",
            "Um bom modelo operacional ajuda as equipas a avançar mais depressa porque o ambiente é previsível, suportável e mais fácil de proteger.",
          ],
        },
      },
    ],
  },
  {
    slug: "backup-is-not-a-business-continuity-plan",
    accent: "backup",
    category: {
      en: "Business Continuity",
      pt: "Continuidade do Negócio",
    },
    title: {
      en: "Backup is not the same as business continuity",
      pt: "Backup não é o mesmo que continuidade do negócio",
    },
    excerpt: {
      en: "Why organisations need a recovery plan, not only backup jobs, if they want to keep operating through disruption.",
      pt: "Porque as organizações precisam de um plano de recuperação, e não apenas de backups, para continuarem a operar durante uma interrupção.",
    },
    date: {
      en: "March 18, 2026",
      pt: "18 de março de 2026",
    },
    readingTime: {
      en: "5 min read",
      pt: "5 min de leitura",
    },
    heroLabel: {
      en: "Recovery readiness",
      pt: "Preparação para recuperação",
    },
    takeaways: {
      en: [
        "Backups alone do not define recovery order or responsibility.",
        "Recovery targets should reflect actual business priorities.",
        "Tested recovery is far more valuable than assumed recovery.",
      ],
      pt: [
        "Os backups, por si só, não definem ordem de recuperação nem responsabilidades.",
        "Os objetivos de recuperação devem refletir prioridades reais do negócio.",
        "Uma recuperação testada vale muito mais do que uma recuperação assumida.",
      ],
    },
    image: {
      src: "/images/services/backup-recovery.jpg",
      alt: {
        en: "Storage and backup hardware representing recovery planning and business continuity.",
        pt: "Hardware de armazenamento e backup a representar planeamento de recuperação e continuidade do negócio.",
      },
      caption: {
        en: "Business continuity planning connects backup, restore order, communication, and decision-making before disruption happens.",
        pt: "O planeamento de continuidade liga backup, ordem de reposição, comunicação e tomada de decisão antes de existir interrupção.",
      },
    },
    useCase: {
      title: {
        en: "The server can be restored, but what comes back first?",
        pt: "O servidor pode ser reposto, mas o que volta primeiro?",
      },
      body: {
        en: "A business may discover too late that restoring files is not the same as restoring operations. Finance may need ERP access first, customer teams may need email first, and leadership may need a communication path immediately. Continuity planning defines that order before an incident decides it for you.",
        pt: "Uma empresa pode descobrir tarde demais que repor ficheiros não é o mesmo que repor operações. A área financeira pode precisar primeiro do ERP, a equipa comercial pode precisar primeiro do email e a liderança pode precisar imediatamente de um canal de comunicação. O planeamento de continuidade define essa ordem antes que um incidente a imponha.",
      },
    },
    sections: [
      {
        heading: {
          en: "A backup file does not answer business questions",
          pt: "Um ficheiro de backup não responde às questões do negócio",
        },
        paragraphs: {
          en: [
            "Backups are essential, but they only answer one part of the resilience problem: whether data exists somewhere else. They do not explain who restores systems, how long recovery should take, or which services the business needs first.",
            "Business continuity begins when recovery priorities are defined. Critical systems, core documents, communication channels, and recovery responsibilities all need to be clear before an incident happens.",
          ],
          pt: [
            "Os backups são essenciais, mas resolvem apenas uma parte do problema da resiliência: saber se os dados existem noutro local. Não explicam quem restaura os sistemas, quanto tempo a recuperação deve demorar ou que serviços o negócio precisa primeiro.",
            "A continuidade do negócio começa quando as prioridades de recuperação são definidas. Sistemas críticos, documentos essenciais, canais de comunicação e responsabilidades de recuperação devem estar claros antes de ocorrer um incidente.",
          ],
        },
      },
      {
        heading: {
          en: "Recovery objectives should be practical",
          pt: "Os objetivos de recuperação devem ser práticos",
        },
        paragraphs: {
          en: [
            "A realistic recovery plan accounts for business constraints. Some systems may need near-immediate recovery, while others can tolerate a longer delay. The key is to define those thresholds intentionally rather than assume all systems are equal.",
            "Testing matters too. A backup that has never been restored under pressure is still an assumption, not proof.",
          ],
          pt: [
            "Um plano de recuperação realista tem em conta as restrições do negócio. Alguns sistemas podem exigir recuperação quase imediata, enquanto outros suportam um atraso maior. O importante é definir esses limites de forma intencional, em vez de assumir que todos os sistemas são iguais.",
            "Os testes também importam. Um backup que nunca foi restaurado sob pressão continua a ser uma suposição, e não uma prova.",
          ],
        },
      },
      {
        heading: {
          en: "Continuity planning improves confidence before a crisis",
          pt: "O planeamento de continuidade aumenta a confiança antes da crise",
        },
        paragraphs: {
          en: [
            "When organisations know where data lives, how it is protected, and what the restoration path looks like, leadership can respond to disruption more calmly. That confidence is a competitive advantage when others are improvising.",
            "A good continuity approach is not built around fear. It is built around preparation, documentation, and realistic recovery choices.",
          ],
          pt: [
            "Quando as organizações sabem onde vivem os dados, como estão protegidos e qual é o caminho de reposição, a liderança consegue responder a interrupções com mais calma. Essa confiança é uma vantagem competitiva quando outros estão a improvisar.",
            "Uma boa abordagem de continuidade não é construída à volta do medo. É construída à volta de preparação, documentação e escolhas de recuperação realistas.",
          ],
        },
      },
    ],
  },
  {
    slug: "email-security-basics-that-still-prevent-incidents",
    accent: "shield",
    category: {
      en: "Cybersecurity",
      pt: "Cibersegurança",
    },
    title: {
      en: "Email security basics that still prevent major incidents",
      pt: "Bases de segurança de email que continuam a evitar incidentes graves",
    },
    excerpt: {
      en: "Phishing remains effective because many organisations leave the fundamentals inconsistent or unmanaged.",
      pt: "O phishing continua eficaz porque muitas organizações deixam os fundamentos inconsistentes ou sem gestão.",
    },
    date: {
      en: "March 21, 2026",
      pt: "21 de março de 2026",
    },
    readingTime: {
      en: "4 min read",
      pt: "4 min de leitura",
    },
    heroLabel: {
      en: "Email protection",
      pt: "Proteção de email",
    },
    takeaways: {
      en: [
        "Email remains one of the easiest ways to disrupt a business.",
        "Good filtering and good user habits need to reinforce each other.",
        "Consistency matters more than occasional awareness campaigns.",
      ],
      pt: [
        "O email continua a ser uma das formas mais fáceis de perturbar uma empresa.",
        "Boa filtragem e bons hábitos dos utilizadores precisam de se reforçar mutuamente.",
        "A consistência importa mais do que campanhas ocasionais de sensibilização.",
      ],
    },
    image: {
      src: "/images/services/cybersecurity.jpg",
      alt: {
        en: "IT professional reviewing security controls in a technical environment.",
        pt: "Profissional de TI a rever controlos de segurança num ambiente técnico.",
      },
      caption: {
        en: "Email security is strongest when filtering, identity controls, and user escalation habits work together.",
        pt: "A segurança de email é mais forte quando filtragem, controlos de identidade e hábitos de escalonamento dos utilizadores funcionam em conjunto.",
      },
    },
    useCase: {
      title: {
        en: "A fake supplier invoice reaches finance",
        pt: "Uma fatura falsa de fornecedor chega à área financeira",
      },
      body: {
        en: "A finance user may receive a convincing invoice from what looks like a known supplier. Stronger filtering helps stop it, but a practical escalation path matters just as much. Teams need to know exactly what to do when a message feels wrong.",
        pt: "Um colaborador da área financeira pode receber uma fatura convincente de um suposto fornecedor conhecido. Uma filtragem mais forte ajuda a travá-la, mas um caminho prático de escalonamento é igualmente importante. As equipas precisam de saber exatamente o que fazer quando uma mensagem parece suspeita.",
      },
    },
    sections: [
      {
        heading: {
          en: "The inbox is still one of the easiest ways into a business",
          pt: "A caixa de entrada continua a ser uma das formas mais fáceis de entrar numa empresa",
        },
        paragraphs: {
          en: [
            "Most businesses do not need a dramatic cyber event to experience real damage. A convincing phishing email, a compromised mailbox, or a malicious attachment can be enough to trigger financial loss or operational disruption.",
            "That is why filtering, anti-phishing controls, and consistent user practices remain critical even in environments with modern cloud tooling.",
          ],
          pt: [
            "A maioria das empresas não precisa de um evento dramático de ciberataque para sofrer danos reais. Um email de phishing convincente, uma mailbox comprometida ou um anexo malicioso podem bastar para provocar perda financeira ou interrupção operacional.",
            "É por isso que a filtragem, os controlos anti-phishing e práticas consistentes dos utilizadores continuam a ser críticos, mesmo em ambientes com ferramentas cloud modernas.",
          ],
        },
      },
      {
        heading: {
          en: "Technology and user behaviour need to reinforce each other",
          pt: "A tecnologia e o comportamento do utilizador precisam de se reforçar mutuamente",
        },
        paragraphs: {
          en: [
            "Email security is not just a product decision. It depends on how identities are managed, how quickly suspicious messages are escalated, and whether the business has a repeatable response process when something goes wrong.",
            "Security controls work best when staff know what normal looks like and when support teams can intervene early.",
          ],
          pt: [
            "A segurança de email não é apenas uma decisão de produto. Depende de como as identidades são geridas, da rapidez com que mensagens suspeitas são escaladas e de a empresa ter um processo repetível para responder quando algo corre mal.",
            "Os controlos de segurança funcionam melhor quando as equipas sabem reconhecer o normal e quando o suporte consegue intervir cedo.",
          ],
        },
      },
      {
        heading: {
          en: "Consistency beats one-off awareness campaigns",
          pt: "A consistência vale mais do que campanhas pontuais de sensibilização",
        },
        paragraphs: {
          en: [
            "A secure email posture is built through routine. That includes cleaner mailbox administration, sensible filtering rules, better escalation paths, and periodic review of where users are still vulnerable.",
            "Businesses that treat email as a managed operational surface, not just a communication channel, are usually better prepared for the incidents that do happen.",
          ],
          pt: [
            "Uma postura segura de email constrói-se com rotina. Isso inclui administração mais limpa das mailboxes, regras de filtragem adequadas, melhores caminhos de escalonamento e revisão periódica dos pontos onde os utilizadores continuam vulneráveis.",
            "As empresas que tratam o email como uma superfície operacional gerida, e não apenas como um canal de comunicação, costumam estar mais preparadas para os incidentes que acontecem.",
          ],
        },
      },
    ],
  },
  {
    slug: "endpoint-protection-for-hybrid-teams",
    accent: "core",
    category: {
      en: "Endpoint Security",
      pt: "Segurança de Endpoints",
    },
    title: {
      en: "What endpoint protection should look like for hybrid teams",
      pt: "Como deve ser a proteção de endpoints para equipas híbridas",
    },
    excerpt: {
      en: "Modern support models need endpoint security that fits remote work, role changes, and real user behaviour.",
      pt: "Os modelos modernos de suporte exigem segurança de endpoints ajustada ao trabalho remoto, às mudanças de função e ao comportamento real dos utilizadores.",
    },
    date: {
      en: "March 24, 2026",
      pt: "24 de março de 2026",
    },
    readingTime: {
      en: "5 min read",
      pt: "5 min de leitura",
    },
    heroLabel: {
      en: "Endpoint resilience",
      pt: "Resiliência de endpoints",
    },
    takeaways: {
      en: [
        "Endpoint security sits where support and risk management meet.",
        "Healthy, well-managed devices are easier to secure and easier to support.",
        "Protection should reduce risk without creating unsafe workarounds.",
      ],
      pt: [
        "A segurança de endpoints está onde suporte e gestão de risco se encontram.",
        "Dispositivos saudáveis e bem geridos são mais fáceis de proteger e suportar.",
        "A proteção deve reduzir risco sem criar atalhos inseguros.",
      ],
    },
    image: {
      src: "/images/services/managed-it.jpg",
      alt: {
        en: "Technology team discussing device support and operational workflows.",
        pt: "Equipa de tecnologia a discutir suporte a dispositivos e fluxos operacionais.",
      },
      caption: {
        en: "Endpoint protection becomes more effective when support visibility and security controls are managed together.",
        pt: "A proteção de endpoints torna-se mais eficaz quando a visibilidade de suporte e os controlos de segurança são geridos em conjunto.",
      },
    },
    useCase: {
      title: {
        en: "A sales laptop moves between office, home, and public Wi-Fi",
        pt: "Um portátil comercial alterna entre escritório, casa e Wi-Fi público",
      },
      body: {
        en: "A hybrid user may connect through several networks in the same week. If patching, endpoint tooling, and remote support visibility are weak, the business loses both control and response speed. A stronger endpoint model keeps that device manageable wherever it is used.",
        pt: "Um utilizador híbrido pode ligar-se a várias redes na mesma semana. Se o patching, as ferramentas de endpoint e a visibilidade do suporte remoto forem fracos, a empresa perde controlo e velocidade de resposta. Um modelo de endpoint mais forte mantém esse dispositivo gerível onde quer que seja utilizado.",
      },
    },
    sections: [
      {
        heading: {
          en: "The endpoint is where support and security meet",
          pt: "O endpoint é onde o suporte e a segurança se encontram",
        },
        paragraphs: {
          en: [
            "Laptops and desktops sit at the centre of everyday operations. They are also where patching gaps, weak controls, unmanaged software, and user workarounds tend to create risk.",
            "That makes endpoint protection a shared operational responsibility. Security tooling, device administration, and helpdesk visibility need to work together rather than in isolation.",
          ],
          pt: [
            "Portáteis e desktops estão no centro das operações do dia a dia. São também onde lacunas de patching, controlos fracos, software não gerido e atalhos criados pelos utilizadores tendem a gerar risco.",
            "Isso torna a proteção de endpoints uma responsabilidade operacional partilhada. Ferramentas de segurança, administração de dispositivos e visibilidade de helpdesk precisam de trabalhar em conjunto e não isoladamente.",
          ],
        },
      },
      {
        heading: {
          en: "Healthy devices are easier to support",
          pt: "Dispositivos saudáveis são mais fáceis de suportar",
        },
        paragraphs: {
          en: [
            "When devices are monitored, patched, and configured consistently, support becomes faster and the attack surface becomes smaller. The basics of good operations still matter enormously.",
            "This is particularly true for hybrid teams where devices move across networks and where visibility can disappear if management is weak.",
          ],
          pt: [
            "Quando os dispositivos são monitorizados, atualizados e configurados de forma consistente, o suporte torna-se mais rápido e a superfície de ataque diminui. As bases de uma boa operação continuam a ter enorme importância.",
            "Isto é particularmente verdade para equipas híbridas, em que os dispositivos circulam entre redes e a visibilidade pode desaparecer se a gestão for fraca.",
          ],
        },
      },
      {
        heading: {
          en: "Protection should support productivity, not fight it",
          pt: "A proteção deve apoiar a produtividade, e não combatê-la",
        },
        paragraphs: {
          en: [
            "The strongest endpoint strategy is one that users can live with. Controls should reduce risk without making normal work frustrating or pushing staff toward unsafe workarounds.",
            "That balance is where managed services create value: combining support knowledge, user context, and security priorities in one operating model.",
          ],
          pt: [
            "A melhor estratégia de endpoint é aquela com que os utilizadores conseguem trabalhar. Os controlos devem reduzir risco sem tornar o trabalho normal frustrante nem empurrar as equipas para atalhos inseguros.",
            "Esse equilíbrio é onde os serviços geridos criam valor: combinando conhecimento de suporte, contexto do utilizador e prioridades de segurança num único modelo operacional.",
          ],
        },
      },
    ],
  },
  {
    slug: "practical-business-continuity-for-smes",
    accent: "resilience",
    category: {
      en: "Resilience",
      pt: "Resiliência",
    },
    title: {
      en: "Practical business continuity for small and mid-sized organisations",
      pt: "Continuidade do negócio prática para pequenas e médias organizações",
    },
    excerpt: {
      en: "Continuity planning does not need to be enterprise theatre. It needs to be usable when pressure is real.",
      pt: "O planeamento de continuidade não precisa de ser teatro empresarial. Precisa de ser utilizável quando a pressão é real.",
    },
    date: {
      en: "March 26, 2026",
      pt: "26 de março de 2026",
    },
    readingTime: {
      en: "6 min read",
      pt: "6 min de leitura",
    },
    heroLabel: {
      en: "Continuity planning",
      pt: "Planeamento de continuidade",
    },
    takeaways: {
      en: [
        "Continuity planning should answer practical questions, not create paperwork for its own sake.",
        "Clear ownership improves response speed during disruption.",
        "Good day-to-day IT management makes continuity more realistic.",
      ],
      pt: [
        "O planeamento de continuidade deve responder a perguntas práticas, não criar burocracia sem utilidade.",
        "Responsabilidades claras melhoram a velocidade de resposta durante uma interrupção.",
        "Uma boa gestão diária de TI torna a continuidade mais realista.",
      ],
    },
    image: {
      src: "/images/services/backup-recovery.jpg",
      alt: {
        en: "Backup and storage hardware used to represent continuity planning for smaller organisations.",
        pt: "Hardware de backup e armazenamento a representar planeamento de continuidade para organizações de menor dimensão.",
      },
      caption: {
        en: "Smaller organisations do not need enterprise theatre. They need continuity plans that people can actually use under pressure.",
        pt: "Organizações mais pequenas não precisam de teatro empresarial. Precisam de planos de continuidade que as pessoas consigam usar sob pressão.",
      },
    },
    useCase: {
      title: {
        en: "A small business loses access to email and shared files",
        pt: "Uma pequena empresa perde acesso ao email e aos ficheiros partilhados",
      },
      body: {
        en: "Without documented ownership, the first hour is often spent asking who should call the provider, who can authorise changes, and where the latest files live. Even a lightweight continuity plan dramatically improves that first response window.",
        pt: "Sem responsabilidades documentadas, a primeira hora é muitas vezes gasta a perguntar quem deve ligar ao fornecedor, quem pode autorizar alterações e onde estão os ficheiros mais recentes. Mesmo um plano de continuidade leve melhora drasticamente essa primeira janela de resposta.",
      },
    },
    sections: [
      {
        heading: {
          en: "The goal is continuity, not perfection",
          pt: "O objetivo é continuidade, não perfeição",
        },
        paragraphs: {
          en: [
            "Smaller organisations often delay continuity planning because it feels too formal or too expensive. In reality, the first version only needs to answer a few practical questions about people, systems, data, and recovery order.",
            "What matters most is whether the business can keep serving clients, communicating internally, and restoring critical operations under stress.",
          ],
          pt: [
            "As organizações mais pequenas adiam muitas vezes o planeamento de continuidade porque parece demasiado formal ou demasiado caro. Na realidade, a primeira versão só precisa de responder a algumas perguntas práticas sobre pessoas, sistemas, dados e ordem de recuperação.",
            "O que mais importa é se a empresa consegue continuar a servir clientes, comunicar internamente e restaurar operações críticas sob pressão.",
          ],
        },
      },
      {
        heading: {
          en: "Documented ownership is a major advantage",
          pt: "Responsabilidades documentadas são uma grande vantagem",
        },
        paragraphs: {
          en: [
            "Incidents become harder when no one is sure who decides, who communicates, or who has access to core systems. Continuity planning improves resilience by assigning ownership before disruption happens.",
            "That documentation also helps outside support partners respond faster because they understand the environment and the recovery expectations.",
          ],
          pt: [
            "Os incidentes tornam-se mais difíceis quando ninguém sabe quem decide, quem comunica ou quem tem acesso aos sistemas principais. O planeamento de continuidade melhora a resiliência ao atribuir responsabilidades antes de existir interrupção.",
            "Essa documentação também ajuda parceiros externos de suporte a responder mais depressa porque compreendem o ambiente e as expectativas de recuperação.",
          ],
        },
      },
      {
        heading: {
          en: "Continuity becomes easier when IT is already well managed",
          pt: "A continuidade torna-se mais fácil quando o TI já está bem gerido",
        },
        paragraphs: {
          en: [
            "Backup, endpoint management, Microsoft 365 administration, documentation, and reporting are not separate from continuity. They are the foundations that make continuity realistic.",
            "That is why businesses usually get the best results when support, cloud, security, and recovery planning are treated as one coordinated system.",
          ],
          pt: [
            "Backup, gestão de endpoints, administração de Microsoft 365, documentação e reporting não são elementos separados da continuidade. São as bases que tornam a continuidade realista.",
            "É por isso que as empresas costumam obter melhores resultados quando suporte, cloud, segurança e planeamento de recuperação são tratados como um sistema coordenado.",
          ],
        },
      },
    ],
  },
];

export const siteCopy = {
  en: {
    languageLabel: "PT",
    skipToContent: "Skip to content",
    primaryCta: "Get IT Audit",
    secondaryCta: "Talk to us",
    footerBlurb:
      "Syncana Technologies is a Maputo-based MSP helping businesses stay secure, supported, and ready to scale.",
    footerLinksTitle: "Explore",
    footerServicesTitle: "Our Expertise",
    footerContactTitle: "Contact Information",
    home: {
      kicker: "Managed IT, cloud and cybersecurity",
      title: "Innovative, Scalable IT Solutions Built for Growing Businesses",
      description:
        "Empowering businesses in Mozambique as a trusted IT partner, from Microsoft-certified services to fully managed IT support.",
      secondaryDescription:
        "We combine responsive support, practical security, and business-ready cloud operations in one coordinated service model.",
      highlight: "Your local MSP partner",
      trustTitle: "Technology support with operational accountability",
      trustBody:
        "Built for organisations that need one dependable partner across support, cybersecurity, Microsoft 365, and continuity planning.",
      aboutKicker: "About Syncana",
      aboutTitle: "A full-service MSP built around the realities of growing teams",
      aboutBody:
        "We help businesses simplify technology operations, reduce support friction, and strengthen resilience with services that stay practical and aligned to day-to-day business priorities.",
      servicesKicker: "Our services",
      servicesTitle: "Four connected service areas, one accountable partner",
      servicesBody:
        "Each capability is designed to work together so support, cloud, security, and recovery planning reinforce one another.",
      differentiatorsKicker: "Why Syncana",
      differentiatorsTitle: "Built for businesses that want IT to simply work",
      differentiatorsBody:
        "Our approach balances premium service, local responsiveness, and a disciplined operational model.",
      processKicker: "Our process",
      processTitle: "A measured rollout from assessment to ongoing support",
      processBody:
        "We focus on stabilising the environment first, then securing and improving it over time.",
      ctaTitle: "Ready for a clearer, more resilient IT environment?",
      ctaBody:
        "Start with an IT audit and we will map the areas where support, security, and continuity can improve first.",
      blogKicker: "Tech Talk",
      blogTitle: "Practical guidance for modern business technology",
      blogBody:
        "Short reads on managed services, Microsoft 365, cybersecurity, and recovery planning for growing teams.",
    },
    expertise: {
      kicker: "Our Expertise",
      title: "Integrated IT services designed to keep your business moving",
      description:
        "From support operations to cybersecurity, Microsoft 365, and resilience planning, we help businesses build a healthier technology foundation.",
      overviewTitle: "What you can expect from the Syncana model",
      overviewBody:
        "We bring together day-to-day support, security controls, user lifecycle management, and recovery readiness so your environment stays easier to operate.",
      outcomesTitle: "Outcomes we design for",
      outcomesBody:
        "Clarity, continuity, and fewer recurring issues for internal teams that need technology to enable the business rather than interrupt it.",
      ctaTitle: "Need a support model that feels joined up?",
      ctaBody:
        "Are you struggling to maintain your IT enviroment? Let us review and showcase how our IT Managed service covers everything from helpdesk, security, and cloud administration.",
    },
    about: {
      kicker: "About us",
      title: "Enjoy Full-Service IT Management Expertise",
      description:
        "Simplify your operations with a single provider for integrated IT and cloud solutions. We offer comprehensive services ranging from IT support, security, and digital transformation to artificial intelligence, cloud services, and network infrastructure. With our company as your trusted partner, you will be amazed by the results you can achieve.",
      missionTitle: "Our mission",
      missionBody:
        "To be a provider of innovative, customer-focused technology solutions. We are dedicated to delivering high-quality, reliable, and scalable technology services that drive growth, improve efficiency, and create lasting value for our clients. By staying at the forefront of technological advancements, we strive to solve complex challenges and help our clients achieve their goals.",
      visionTitle: "Our vision",
      visionBody:
        "Our vision is to be a national leader in technological innovation, recognized for our ability to transform businesses and industries. Through our commitment to excellence, creativity, and continuous improvement, we aim to set new standards in the technology industry and inspire others to go beyond the limits of what is possible.",
      storyKicker: "How we work",
      storyTitle: "Technology partnership without fragmented ownership",
      storyBody:
        "Syncana brings together support, cloud, security, and business continuity under one service philosophy: clear accountability, practical execution, and solutions that fit the pace of growing organisations in Mozambique.",
      valuesKicker: "Our values",
      valuesTitle: "What clients can expect from the way we operate",
      valuesBody:
        "Our culture is shaped by responsiveness, trust, and a practical bias toward solutions that genuinely help teams work better.",
      partnersKicker: "Technology ecosystem",
      partnersTitle: "Partners and platforms we align with",
      partnersBody:
        "We work across trusted technologies that support secure, productive, and resilient business environments.",
      ctaTitle: "Looking for one partner to own the bigger picture?",
      ctaBody:
        "We can help you consolidate support, cloud operations, and security into a simpler operating model.",
    },
    blog: {
      kicker: "Tech Talk",
      title: "Business technology insights for leaders and teams",
      description:
        "A growing library of practical articles on managed services, Microsoft 365, cybersecurity, and continuity planning.",
      featuredLabel: "Featured article",
      latestLabel: "Latest articles",
      latestBody:
        "Use the blog to explore the operating habits and security fundamentals that help businesses scale with less friction.",
      ctaTitle: "Need help applying any of these ideas?",
      ctaBody:
        "We can review your current setup and translate the right recommendations into a practical support plan.",
    },
    contact: {
      kicker: "Contact us",
      title: "Start with a conversation about the IT pressures your business is facing",
      description:
        "Tell us about your current environment, support pain points, or security concerns and we will guide the next step.",
      cardsTitle: "Reach Syncana directly",
      cardsBody:
        "Use the contact form to send your request directly into our CRM and receive a confirmation email from the website flow.",
      formTitle: "Request your IT audit",
      formBody:
        "Share the basics and we will use them as the foundation for the next conversation.",
      formSuccess:
        "Thanks. We received your request, stored it in our follow-up system, and sent a confirmation email. Our team will reach out as soon as possible.",
      formError:
        "Please review the required fields and try again.",
      faqTitle: "Questions we often hear",
      faqBody:
        "These are common starting points for businesses exploring managed services or a switch in IT support.",
    },
    form: {
      name: "Full name",
      email: "Work email",
      phone: "Phone number",
      company: "Company",
      location: "Location",
      province: "Province",
      service: "Service of interest",
      budgetRange: "Budget range",
      urgency: "Urgency",
      languagePreference: "Preferred language",
      message: "How can we help?",
      submit: "Send enquiry",
      placeholderMessage:
        "Tell us what is happening in your environment, what you want to improve, or what kind of support you need.",
    },
    blogActions: {
      readMore: "Read article",
      backToBlog: "Back to Tech Talk",
      allArticles: "View all articles",
    },
  },
  pt: {
    languageLabel: "EN",
    skipToContent: "Saltar para o conteúdo",
    primaryCta: "Pedir Auditoria de TI",
    secondaryCta: "Pedir Suporte de TI",
    footerBlurb:
      "A Syncana Technologies é uma MSP baseada em Maputo que ajuda empresas a manterem-se seguras, suportadas e prontas para crescer.",
    footerLinksTitle: "Explorar",
    footerServicesTitle: "A Nossa Especialização",
    footerContactTitle: "Informação de Contacto",
    home: {
      kicker: "TI gerida, cloud e cibersegurança",
      title: "Soluções de TI Inovadoras e Escaláveis para Empresas em Crescimento",
      description:
        "Capacitamos empresas em Moçambique como parceiro de TI de confiança, desde serviços certificados pela Microsoft até suporte de TI totalmente gerido.",
      secondaryDescription:
        "Combinamos suporte responsivo, segurança prática e operações cloud preparadas para o negócio num único modelo de serviço coordenado.",
      highlight: "O seu parceiro MSP local",
      trustTitle: "Suporte tecnológico com responsabilidade operacional",
      trustBody:
        "Desenhado para organizações que precisam de um parceiro fiável para suporte, cibersegurança, Microsoft 365 e planeamento de continuidade.",
      aboutKicker: "Sobre a Syncana",
      aboutTitle: "Uma MSP full-service construída para a realidade de equipas em crescimento",
      aboutBody:
        "Ajudamos empresas a simplificar operações tecnológicas, reduzir fricção no suporte e reforçar a resiliência com serviços práticos e alinhados às prioridades do negócio.",
      servicesKicker: "Os nossos serviços",
      servicesTitle: "Quatro áreas de serviço ligadas entre si, um parceiro responsável",
      servicesBody:
        "Cada capacidade foi pensada para funcionar em conjunto, para que suporte, cloud, segurança e recuperação se reforcem mutuamente.",
      differentiatorsKicker: "Porquê a Syncana",
      differentiatorsTitle: "Pensado para empresas que querem que o TI simplesmente funcione",
      differentiatorsBody:
        "A nossa abordagem equilibra serviço premium, capacidade de resposta local e um modelo operacional disciplinado.",
      processKicker: "O nosso processo",
      processTitle: "Uma implementação faseada, da avaliação ao suporte contínuo",
      processBody:
        "Começamos por estabilizar o ambiente e, em seguida, protegemo-lo e melhoramo-lo ao longo do tempo.",
      ctaTitle: "Pronto para um ambiente de TI mais claro e resiliente?",
      ctaBody:
        "Comece com uma auditoria de TI e identificaremos onde suporte, segurança e continuidade podem evoluir primeiro.",
      blogKicker: "Tech Talk",
      blogTitle: "Orientação prática para tecnologia empresarial moderna",
      blogBody:
        "Leituras curtas sobre serviços geridos, Microsoft 365, cibersegurança e planeamento de recuperação para equipas em crescimento.",
    },
    expertise: {
      kicker: "A Nossa Especialização",
      title: "Serviços integrados de TI pensados para manter o seu negócio em movimento",
      description:
        "Do suporte operacional à cibersegurança, Microsoft 365 e planeamento de resiliência, ajudamos empresas a construir uma base tecnológica mais saudável.",
      overviewTitle: "O que pode esperar do modelo Syncana",
      overviewBody:
        "Reunimos suporte diário, controlos de segurança, gestão do ciclo de vida do utilizador e preparação para recuperação para que o seu ambiente seja mais fácil de operar.",
      outcomesTitle: "Resultados que procuramos entregar",
      outcomesBody:
        "Clareza, continuidade e menos problemas recorrentes para equipas internas que precisam que a tecnologia apoie o negócio em vez de o interromper.",
      ctaTitle: "Precisa de um modelo de suporte mais integrado?",
      ctaBody:
        "Está com dificuldades em manter o seu ambiente de TI? Deixe-nos avaliá-lo e mostrar como o nosso serviço de TI gerida cobre tudo, desde helpdesk, segurança e administração cloud.",
    },
    about: {
      kicker: "Sobre nós",
      title: "Desfrute de Especialização Completa em Gestão de TI",
      description:
        "Simplifique as suas operações com um único fornecedor para soluções integradas de TI e cloud. Oferecemos serviços completos desde suporte de TI, segurança e transformação digital até inteligência artificial, serviços cloud e infraestruturas de rede. Com a nossa empresa como parceiro de confiança, ficará surpreendido com os resultados que pode alcançar.",
      missionTitle: "A nossa missão",
      missionBody:
        "Ser um fornecedor de soluções tecnológicas inovadoras e centradas no cliente. Dedicamo-nos a entregar serviços tecnológicos de elevada qualidade, fiáveis e escaláveis que impulsionam o crescimento, melhoram a eficiência e criam valor duradouro para os nossos clientes. Ao mantermo-nos na vanguarda dos avanços tecnológicos, procuramos resolver desafios complexos e ajudar os nossos clientes a alcançar os seus objetivos.",
      visionTitle: "A nossa visão",
      visionBody:
        "A nossa visão é ser uma referência nacional em inovação tecnológica, reconhecida pela capacidade de transformar empresas e indústrias. Através do nosso compromisso com a excelência, criatividade e melhoria contínua, pretendemos definir novos padrões na indústria tecnológica e inspirar outros a irem além dos limites do que é possível.",
      storyKicker: "Como trabalhamos",
      storyTitle: "Parceria tecnológica sem responsabilidade fragmentada",
      storyBody:
        "A Syncana reúne suporte, cloud, segurança e continuidade do negócio numa só filosofia de serviço: responsabilidade clara, execução prática e soluções ajustadas ao ritmo das organizações em crescimento em Moçambique.",
      valuesKicker: "Os nossos valores",
      valuesTitle: "O que os clientes podem esperar da forma como trabalhamos",
      valuesBody:
        "A nossa cultura é moldada pela capacidade de resposta, confiança e uma visão prática sobre soluções que realmente ajudam as equipas a trabalhar melhor.",
      partnersKicker: "Ecossistema tecnológico",
      partnersTitle: "Parceiros e plataformas com que trabalhamos",
      partnersBody:
        "Trabalhamos com tecnologias de confiança que suportam ambientes de negócio seguros, produtivos e resilientes.",
      ctaTitle: "Procura um parceiro que assuma a visão completa?",
      ctaBody:
        "Podemos ajudar a consolidar suporte, operações cloud e segurança num modelo operacional mais simples.",
    },
    blog: {
      kicker: "Tech Talk",
      title: "Insights de tecnologia empresarial para líderes e equipas",
      description:
        "Uma biblioteca crescente de artigos práticos sobre serviços geridos, Microsoft 365, cibersegurança e planeamento de continuidade.",
      featuredLabel: "Artigo em destaque",
      latestLabel: "Artigos mais recentes",
      latestBody:
        "Use o blog para explorar hábitos operacionais e fundamentos de segurança que ajudam as empresas a crescer com menos fricção.",
      ctaTitle: "Precisa de ajuda para aplicar alguma destas ideias?",
      ctaBody:
        "Podemos rever a sua operação atual e transformar as recomendações certas num plano prático de suporte.",
    },
    contact: {
      kicker: "Contacte-nos",
      title: "Comece com uma conversa sobre as pressões de TI que a sua empresa está a enfrentar",
      description:
        "Fale-nos do seu ambiente atual, dos pontos críticos de suporte ou das preocupações de segurança e orientaremos o próximo passo.",
      cardsTitle: "Contacte a Syncana diretamente",
      cardsBody:
        "Use o formulário de contacto para enviar o seu pedido diretamente para o nosso CRM e receber um email de confirmação a partir do fluxo do site.",
      formTitle: "Peça a sua auditoria de TI",
      formBody:
        "Partilhe os elementos essenciais e usaremos essa base para a próxima conversa.",
      formSuccess:
        "Obrigado. Recebemos o seu pedido, registámo-lo no nosso sistema de seguimento e enviámos um email de confirmação. A nossa equipa entrará em contacto consigo assim que possível.",
      formError:
        "Por favor, reveja os campos obrigatórios e tente novamente.",
      faqTitle: "Perguntas frequentes",
      faqBody:
        "Estes são pontos de partida comuns para empresas a explorar serviços geridos ou uma mudança no suporte de TI.",
    },
    form: {
      name: "Nome completo",
      email: "Email profissional",
      phone: "Telefone",
      company: "Empresa",
      location: "Localização",
      province: "Província",
      service: "Serviço de interesse",
      budgetRange: "Intervalo de orçamento",
      urgency: "Urgência",
      languagePreference: "Idioma preferido",
      message: "Como o podemos ajudar?",
      submit: "Enviar pedido",
      placeholderMessage:
        "Descreva o que está a acontecer no seu ambiente, o que pretende melhorar ou que tipo de suporte precisa.",
    },
    blogActions: {
      readMore: "Ler artigo",
      backToBlog: "Voltar ao Tech Talk",
      allArticles: "Ver todos os artigos",
    },
  },
} as const;

export function withLocale(locale: Locale, href: string) {
  if (locale === "pt") {
    return href === "/" ? "/pt" : `/pt${href}`;
  }

  return href;
}

export function pickText(locale: Locale, value: LocalizedText) {
  return value[locale];
}

export function pickList(locale: Locale, value: LocalizedList) {
  return value[locale];
}

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
