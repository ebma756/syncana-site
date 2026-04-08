"use client";

import { FormEvent, useState } from "react";

import { services, type Locale, siteCopy } from "@/data/site";

type ContactFormProps = {
  locale: Locale;
};

type SubmissionState =
  | { type: "idle"; message: "" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function ContactForm({ locale }: ContactFormProps) {
  const copy = siteCopy[locale];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, setState] = useState<SubmissionState>({
    type: "idle",
    message: "",
  });

  const budgetOptions = [
    { value: "not_sure_yet", label: locale === "en" ? "Not sure yet" : "Ainda não sei" },
    { value: "small", label: locale === "en" ? "Small" : "Pequeno" },
    { value: "medium", label: locale === "en" ? "Medium" : "Médio" },
    { value: "large", label: locale === "en" ? "Large" : "Grande" },
  ] as const;

  const urgencyOptions = [
    { value: "low", label: locale === "en" ? "Low" : "Baixa" },
    { value: "medium", label: locale === "en" ? "Medium" : "Média" },
    { value: "high", label: locale === "en" ? "High" : "Alta" },
    { value: "urgent", label: locale === "en" ? "Urgent" : "Urgente" },
  ] as const;

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "pt", label: "Português" },
  ] as const;

  const provinceOptions = [
    { value: "maputo", label: "Maputo" },
    { value: "gaza", label: "Gaza" },
    { value: "inhambane", label: "Inhambane" },
    { value: "sofala", label: "Sofala" },
    { value: "manica", label: "Manica" },
    { value: "tete", label: "Tete" },
    { value: "zambezia", label: locale === "en" ? "Zambezia" : "Zambézia" },
    { value: "nampula", label: "Nampula" },
    { value: "cabo_delgado", label: locale === "en" ? "Cabo Delgado" : "Cabo Delgado" },
    { value: "niassa", label: "Niassa" },
  ] as const;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      location: String(formData.get("location") || "").trim(),
      province: String(formData.get("province") || "").trim(),
      service: String(formData.get("service") || "").trim(),
      budgetRange: String(formData.get("budgetRange") || "").trim(),
      urgency: String(formData.get("urgency") || "").trim(),
      languagePreference: String(formData.get("languagePreference") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    if (
      !payload.name ||
      !payload.email ||
      !payload.company ||
      !payload.location ||
      !payload.province ||
      !payload.service ||
      !payload.budgetRange ||
      !payload.urgency ||
      !payload.languagePreference ||
      !payload.message
    ) {
      setState({
        type: "error",
        message: copy.contact.formError,
      });
      return;
    }

    setIsSubmitting(true);
    setState({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message || copy.contact.formError);
      }

      setState({
        type: "success",
        message: data.message || copy.contact.formSuccess,
      });
      form.reset();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : copy.contact.formError;

      setState({
        type: "error",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form__grid">
        <label className="field">
          <span>{copy.form.name}</span>
          <input name="name" required type="text" />
        </label>
        <label className="field">
          <span>{copy.form.email}</span>
          <input name="email" required type="email" />
        </label>
        <label className="field">
          <span>{copy.form.phone}</span>
          <input name="phone" type="tel" />
        </label>
        <label className="field">
          <span>{copy.form.company}</span>
          <input name="company" required type="text" />
        </label>
        <label className="field">
          <span>{copy.form.province}</span>
          <select defaultValue="" name="province" required>
            <option value="" disabled>
              {locale === "en" ? "Select province" : "Selecione a província"}
            </option>
            {provinceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{copy.form.location}</span>
          <input name="location" required type="text" />
        </label>
        <label className="field field--full">
          <span>{copy.form.service}</span>
          <select defaultValue="" name="service" required>
            <option value="" disabled>
              {locale === "en" ? "Select a service" : "Selecione um serviço"}
            </option>
            {services.map((service) => (
              <option key={service.key} value={service.key}>
                {service.title[locale]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{copy.form.budgetRange}</span>
          <select defaultValue="" name="budgetRange" required>
            <option value="" disabled>
              {locale === "en" ? "Select budget range" : "Selecione o orçamento"}
            </option>
            {budgetOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{copy.form.urgency}</span>
          <select defaultValue="" name="urgency" required>
            <option value="" disabled>
              {locale === "en" ? "Select urgency" : "Selecione a urgência"}
            </option>
            {urgencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--full">
          <span>{copy.form.languagePreference}</span>
          <select defaultValue={locale} name="languagePreference" required>
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--full">
          <span>{copy.form.message}</span>
          <textarea
            name="message"
            placeholder={copy.form.placeholderMessage}
            required
            rows={6}
          />
        </label>
      </div>
      <button className="button button--primary" disabled={isSubmitting} type="submit">
        <span>{isSubmitting ? (locale === "en" ? "Sending..." : "A enviar...") : copy.form.submit}</span>
      </button>
      {state.type !== "idle" ? (
        <p className={`form-message form-message--${state.type}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
