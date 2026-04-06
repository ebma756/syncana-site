"use client";

import { ChangeEvent, useState } from "react";
import {
  defaultInstituteProfileSettings,
  InstituteProfileSettings,
  loadInstituteProfileSettings,
  persistInstituteProfileSettings,
} from "../settings-storage";

export default function SettingsProfileConsole() {
  const [form, setForm] = useState<InstituteProfileSettings>(loadInstituteProfileSettings());
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function update<K extends keyof InstituteProfileSettings>(key: K, value: InstituteProfileSettings[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function saveProfile() {
    persistInstituteProfileSettings(form);
    setSavedAt(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
    window.dispatchEvent(new Event("sis:settings-updated"));
  }

  function resetProfile() {
    setForm(defaultInstituteProfileSettings);
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      update("logoDataUrl", typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="sis-workspace">
      <div className="sis-settings-page">
        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <p className="sis-panel-subtitle">Keep the school identity complete and consistent across the SIS shell and documents.</p>
            </div>
            {savedAt ? <div className="sis-chip chip-up">Saved at {savedAt}</div> : null}
          </div>

          <div className="sis-settings-form-grid">
            <label className="sis-field sis-field-span-2">
              <span className="sis-field-label">Institute logo</span>
              <div className="sis-upload-row">
                <div className="sis-logo-tile">
                  {form.logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt={`${form.instituteName} logo`} className="sis-logo-image" src={form.logoDataUrl} />
                  ) : (
                    <div className="sis-logo-placeholder">{form.instituteName.slice(0, 2).toUpperCase()}</div>
                  )}
                </div>
                <input className="sis-input" type="file" accept="image/*" onChange={handleLogoChange} />
              </div>
            </label>

            <label className="sis-field">
              <span className="sis-field-label">Institute name</span>
              <input className="sis-input" value={form.instituteName} onChange={(event) => update("instituteName", event.target.value)} />
            </label>

            <label className="sis-field">
              <span className="sis-field-label">Phone number</span>
              <input className="sis-input" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
            </label>

            <label className="sis-field">
              <span className="sis-field-label">Tagline</span>
              <input className="sis-input" value={form.tagline} onChange={(event) => update("tagline", event.target.value)} />
            </label>

            <label className="sis-field">
              <span className="sis-field-label">Website</span>
              <input className="sis-input" value={form.website} onChange={(event) => update("website", event.target.value)} />
            </label>

            <label className="sis-field sis-field-span-2">
              <span className="sis-field-label">Address</span>
              <input className="sis-input" value={form.address} onChange={(event) => update("address", event.target.value)} />
            </label>

            <label className="sis-field">
              <span className="sis-field-label">Country</span>
              <input className="sis-input" value={form.country} onChange={(event) => update("country", event.target.value)} />
            </label>
          </div>

          <div className="sis-form-actions">
            <button className="sis-button sis-button-secondary" type="button" onClick={resetProfile}>
              Reset
            </button>
            <button className="sis-button sis-button-primary" type="button" onClick={saveProfile}>
              Update profile
            </button>
          </div>
        </section>

        <aside className="sis-panel sis-panel-light sis-settings-preview">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Profile view</h2>
              <p className="sis-panel-subtitle">Preview how the institute identity reads across the SIS.</p>
            </div>
          </div>

          <div className="sis-profile-card">
            <div className="sis-profile-card-logo">
              {form.logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={`${form.instituteName} logo`} className="sis-logo-image" src={form.logoDataUrl} />
              ) : (
                <div className="sis-logo-placeholder">{form.instituteName.slice(0, 2).toUpperCase()}</div>
              )}
            </div>
            <div className="sis-profile-card-name">{form.instituteName}</div>
            <div className="sis-profile-card-tagline">{form.tagline}</div>
            <div className="sis-profile-card-divider" />
            <div className="sis-profile-card-list">
              <span>{form.phone || "Phone not set"}</span>
              <span>{form.website || "Website not set"}</span>
              <span>{form.address || "Address not set"}</span>
              <span>{form.country || "Country not set"}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
