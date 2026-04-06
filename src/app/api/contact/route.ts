import { NextResponse } from "next/server";

import { services, type ServiceKey } from "@/data/site";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  province?: string;
  service?: string;
  budgetRange?: string;
  urgency?: string;
  languagePreference?: string;
  message?: string;
};

type LanguagePreference = "en" | "pt";
type BudgetRange = "not_sure_yet" | "small" | "medium" | "large";
type Urgency = "low" | "medium" | "high" | "urgent";
type ProvinceKey =
  | "maputo"
  | "gaza"
  | "inhambane"
  | "sofala"
  | "manica"
  | "tete"
  | "zambezia"
  | "nampula"
  | "cabo_delgado"
  | "niassa";

const PROVINCE_LABELS: Record<ProvinceKey, string> = {
  maputo: "Maputo",
  gaza: "Gaza",
  inhambane: "Inhambane",
  sofala: "Sofala",
  manica: "Manica",
  tete: "Tete",
  zambezia: "Zambezia",
  nampula: "Nampula",
  cabo_delgado: "C. Delgado",
  niassa: "Niassa",
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normalizeText(value?: string) {
  return (value || "").trim();
}

function isServiceKey(value: string): value is ServiceKey {
  return services.some((service) => service.key === value);
}

function isBudgetRange(value: string): value is BudgetRange {
  return ["not_sure_yet", "small", "medium", "large"].includes(value);
}

function isUrgency(value: string): value is Urgency {
  return ["low", "medium", "high", "urgent"].includes(value);
}

function isLanguagePreference(value: string): value is LanguagePreference {
  return value === "en" || value === "pt";
}

function isProvinceKey(value: string): value is ProvinceKey {
  return value in PROVINCE_LABELS;
}

function splitName(fullName: string) {
  const parts = fullName.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || fullName;
  const lastName = parts.slice(1).join(" ");

  return {
    firstName,
    lastName,
  };
}

function mapBudgetRange(value: BudgetRange) {
  switch (value) {
    case "large":
      return "Large";
    case "medium":
      return "Medium";
    case "small":
      return "Small";
    default:
      return "Not sure yet";
  }
}

function mapUrgency(value: Urgency) {
  switch (value) {
    case "urgent":
      return "Urgent";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    default:
      return "Low";
  }
}

function mapLanguagePreference(value: LanguagePreference) {
  return value === "pt" ? "Portuguese" : "English";
}

function getQualificationStatus(phone: string, message: string) {
  const wordCount = message.trim().split(/\s+/).filter(Boolean).length;
  const isWeakMessage = message.trim().length < 24 || wordCount < 5;

  if (!phone || isWeakMessage) {
    return "Needs review";
  }

  return "Qualified";
}

function getLeadPriority(budgetRange: BudgetRange, urgency: Urgency) {
  if (budgetRange === "large" && (urgency === "high" || urgency === "urgent")) {
    return "High";
  }

  if (budgetRange === "medium" && (urgency === "high" || urgency === "urgent")) {
    return "Medium";
  }

  return "Standard";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getClientSuccessMessage(locale: LanguagePreference) {
  if (locale === "pt") {
    return "Obrigado. Recebemos o seu pedido e enviámos um email de confirmação. A nossa equipa entrará em contacto consigo assim que possível.";
  }

  return "Thanks. We received your request and sent a confirmation email. Our team will reach out as soon as possible.";
}

function getClientAutoReply(locale: LanguagePreference, name: string) {
  if (locale === "pt") {
    return {
      subject: "Recebemos o seu pedido",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;">
          <p>Olá ${escapeHtml(name)},</p>
          <p>Obrigado por contactar a Syncana Technologies.</p>
          <p>Recebemos o seu pedido e a nossa equipa irá analisá-lo em breve. Entraremos em contacto consigo assim que possível para compreender melhor as suas necessidades e recomendar os próximos passos.</p>
          <p>Se o seu pedido for urgente, pode responder diretamente a este email ou contactar-nos através do +258 85 24 55 898.</p>
          <p>
            Com os melhores cumprimentos,<br />
            Syncana Technologies<br />
            info@syncanatech.com
          </p>
        </div>
      `,
    };
  }

  return {
    subject: "We received your request",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;">
        <p>Hello ${escapeHtml(name)},</p>
        <p>Thank you for contacting Syncana Technologies.</p>
        <p>We have received your request and our team will review it shortly. We will get back to you as soon as possible to understand your needs and advise on the best next steps.</p>
        <p>If your request is urgent, you can also reply directly to this email or contact us on +258 85 24 55 898.</p>
        <p>
          Kind regards,<br />
          Syncana Technologies<br />
          info@syncanatech.com
        </p>
      </div>
    `,
  };
}

function getInternalEmailHtml(input: {
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  province: string;
  service: string;
  budgetRange: string;
  urgency: string;
  languagePreference: string;
  qualificationStatus: string;
  leadPriority: string;
  message: string;
}) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;">
      <h2 style="margin:0 0 16px;">New website enquiry</h2>
      <p style="margin:0 0 16px;">A new lead has been submitted via the Syncana website.</p>
      <table style="border-collapse:collapse;width:100%;max-width:720px;">
        <tbody>
          ${[
            ["Name", escapeHtml(input.name)],
            ["Email", escapeHtml(input.email)],
            ["Phone", escapeHtml(input.phone || "Not provided")],
            ["Company", escapeHtml(input.company)],
            ["Location", escapeHtml(input.location)],
            ["Province", escapeHtml(input.province)],
            ["Service", escapeHtml(input.service)],
            ["Budget range", escapeHtml(input.budgetRange)],
            ["Urgency", escapeHtml(input.urgency)],
            ["Preferred language", escapeHtml(input.languagePreference)],
            ["Qualification status", escapeHtml(input.qualificationStatus)],
            ["Lead priority", escapeHtml(input.leadPriority)],
          ]
            .map(
              ([label, value]) => `
                <tr>
                  <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:700;background:#f8fafc;">${label}</td>
                  <td style="padding:8px 12px;border:1px solid #e5e7eb;">${value}</td>
                </tr>`,
            )
            .join("")}
        </tbody>
      </table>
      <div style="margin-top:20px;">
        <p style="margin:0 0 8px;font-weight:700;">Message</p>
        <div style="padding:12px 14px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc;">${escapeHtml(input.message)}</div>
      </div>
    </div>
  `;
}

async function sendResendEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const apiKey = getRequiredEnv("RESEND_API_KEY");
  const from = getRequiredEnv("RESEND_FROM_EMAIL");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      reply_to: input.replyTo,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend request failed: ${errorText}`);
  }
}

async function upsertHubSpotContact(input: {
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  province: string;
  serviceInterest: string;
  budgetRange: string;
  urgency: string;
  languagePreference: string;
  inquiryMessage: string;
  qualificationStatus: string;
  leadPriority: string;
}) {
  const token = getRequiredEnv("HUBSPOT_PRIVATE_APP_TOKEN");
  const { firstName, lastName } = splitName(input.name);

  const properties = {
    firstname: firstName,
    lastname: lastName,
    email: input.email,
    phone: input.phone,
    company: input.company,
    lifecyclestage: "lead",
    service_interest: input.serviceInterest,
    budget_range: input.budgetRange,
    urgency: input.urgency,
    language_preference: input.languagePreference,
    location: input.location,
    province: input.province,
    qualification_status: input.qualificationStatus,
    lead_priority: input.leadPriority,
    lead_source: "Website",
    inquiry_message: input.inquiryMessage,
  };

  const searchResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: input.email,
            },
          ],
        },
      ],
      limit: 1,
      properties: ["email"],
    }),
  });

  if (!searchResponse.ok) {
    const errorText = await searchResponse.text();
    throw new Error(`HubSpot search failed: ${errorText}`);
  }

  const searchResult = (await searchResponse.json()) as {
    results?: Array<{ id: string }>;
  };

  const existingId = searchResult.results?.[0]?.id;

  const response = await fetch(
    existingId
      ? `https://api.hubapi.com/crm/v3/objects/contacts/${existingId}`
      : "https://api.hubapi.com/crm/v3/objects/contacts",
    {
      method: existingId ? "PATCH" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HubSpot upsert failed: ${errorText}`);
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ContactPayload;

    const name = normalizeText(payload.name);
    const email = normalizeText(payload.email).toLowerCase();
    const phone = normalizeText(payload.phone);
    const company = normalizeText(payload.company);
    const location = normalizeText(payload.location);
    const province = normalizeText(payload.province);
    const service = normalizeText(payload.service);
    const budgetRange = normalizeText(payload.budgetRange);
    const urgency = normalizeText(payload.urgency);
    const languagePreference = normalizeText(payload.languagePreference);
    const message = normalizeText(payload.message);

    if (
      !name ||
      !email ||
      !company ||
      !location ||
      !province ||
      !service ||
      !budgetRange ||
      !urgency ||
      !languagePreference ||
      !message
    ) {
      return NextResponse.json(
        {
          message:
            languagePreference === "pt"
              ? "Por favor, reveja os campos obrigatórios e tente novamente."
              : "Please review the required fields and try again.",
        },
        { status: 400 },
      );
    }

    if (
      !isServiceKey(service) ||
      !isBudgetRange(budgetRange) ||
      !isUrgency(urgency) ||
      !isLanguagePreference(languagePreference) ||
      !isProvinceKey(province)
    ) {
      return NextResponse.json(
        {
          message:
            languagePreference === "pt"
              ? "Foram recebidos valores inválidos no formulário."
              : "Invalid form values were received.",
        },
        { status: 400 },
      );
    }

    const serviceLabel = services.find((item) => item.key === service)?.title.en ?? service;
    const provinceLabel = PROVINCE_LABELS[province];
    const locale = languagePreference as LanguagePreference;
    const qualificationStatus = getQualificationStatus(phone, message);
    const leadPriority = getLeadPriority(budgetRange, urgency);

    await upsertHubSpotContact({
      name,
      email,
      phone,
      company,
      location,
      province: provinceLabel,
      serviceInterest: serviceLabel,
      budgetRange: mapBudgetRange(budgetRange),
      urgency: mapUrgency(urgency),
      languagePreference: mapLanguagePreference(locale),
      inquiryMessage: message,
      qualificationStatus,
      leadPriority,
    });

    const replyTo = getRequiredEnv("CONTACT_REPLY_TO_EMAIL");
    const notificationEmail = getRequiredEnv("CONTACT_NOTIFICATION_EMAIL");
    const autoReply = getClientAutoReply(locale, name);

    const emailResults = await Promise.allSettled([
      sendResendEmail({
        to: notificationEmail,
        subject: `New Syncana lead: ${serviceLabel}`,
        html: getInternalEmailHtml({
          name,
          email,
          phone,
          company,
          location,
          province: provinceLabel,
          service: serviceLabel,
          budgetRange: mapBudgetRange(budgetRange),
          urgency: mapUrgency(urgency),
          languagePreference: mapLanguagePreference(locale),
          qualificationStatus,
          leadPriority,
          message,
        }),
        replyTo,
      }),
      sendResendEmail({
        to: email,
        subject: autoReply.subject,
        html: autoReply.html,
        replyTo,
      }),
    ]);

    emailResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(index === 0 ? "Internal email failed" : "Client auto-reply failed", result.reason);
      }
    });

    return NextResponse.json(
      {
        message: getClientSuccessMessage(locale),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Contact form submission failed", error);

    const fallbackMessage =
      error instanceof Error && error.message.includes("environment variable")
        ? "The contact workflow is not fully configured yet. Please add the required environment variables."
        : "We could not submit your request right now. Please try again shortly.";

    return NextResponse.json(
      {
        message: fallbackMessage,
      },
      { status: 500 },
    );
  }
}
