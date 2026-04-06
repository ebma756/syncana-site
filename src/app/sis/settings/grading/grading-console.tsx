"use client";

import { useState } from "react";
import {
  defaultGradingSettings,
  GradingSettings,
  loadGradingSettings,
  persistGradingSettings,
} from "../settings-storage";

type TabKey = "bands" | "fail";

export default function SettingsGradingConsole() {
  const [activeTab, setActiveTab] = useState<TabKey>("bands");
  const [settings, setSettings] = useState<GradingSettings>(loadGradingSettings());
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function updateBand(index: number, field: "label" | "min" | "max", value: string) {
    setSettings((current) => ({
      ...current,
      bands: current.bands.map((band, bandIndex) =>
        bandIndex === index
          ? {
              ...band,
              [field]: field === "label" ? value : Number(value),
            }
          : band,
      ),
    }));
  }

  function saveSettings() {
    persistGradingSettings(settings);
    setSavedAt(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
    window.dispatchEvent(new Event("sis:settings-updated"));
  }

  function resetSettings() {
    setSettings(defaultGradingSettings);
  }

  return (
    <section className="sis-workspace">
      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <p className="sis-panel-subtitle">These settings define the grading logic used in grade entry, report preview, and fail evaluation.</p>
          </div>
          {savedAt ? <div className="sis-chip chip-up">Saved at {savedAt}</div> : null}
        </div>

        <div className="sis-settings-tabs">
          <button
            className={`sis-settings-tab${activeTab === "bands" ? " sis-settings-tab-active" : ""}`}
            type="button"
            onClick={() => setActiveTab("bands")}
          >
            Marks Grading
          </button>
          <button
            className={`sis-settings-tab${activeTab === "fail" ? " sis-settings-tab-active" : ""}`}
            type="button"
            onClick={() => setActiveTab("fail")}
          >
            Fail Criteria
          </button>
        </div>

        {activeTab === "bands" ? (
          <div className="sis-settings-stack">
            <div className="sis-settings-form-grid">
              <label className="sis-field">
                <span className="sis-field-label">Scale minimum</span>
                <input
                  className="sis-input"
                  type="number"
                  value={settings.scaleMin}
                  onChange={(event) => setSettings((current) => ({ ...current, scaleMin: Number(event.target.value) }))}
                />
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Scale maximum</span>
                <input
                  className="sis-input"
                  type="number"
                  value={settings.scaleMax}
                  onChange={(event) => setSettings((current) => ({ ...current, scaleMax: Number(event.target.value) }))}
                />
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Pass mark</span>
                <input
                  className="sis-input"
                  type="number"
                  value={settings.passMark}
                  onChange={(event) => setSettings((current) => ({ ...current, passMark: Number(event.target.value) }))}
                />
              </label>
            </div>

            <div className="sis-table-wrap">
              <table className="sis-table sis-table-light">
                <thead>
                  <tr>
                    <th>Band label</th>
                    <th>Min score</th>
                    <th>Max score</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.bands.map((band, index) => (
                    <tr key={band.id}>
                      <td>
                        <input className="sis-input sis-compact-input" value={band.label} onChange={(event) => updateBand(index, "label", event.target.value)} />
                      </td>
                      <td>
                        <input className="sis-input sis-compact-input" type="number" value={band.min} onChange={(event) => updateBand(index, "min", event.target.value)} />
                      </td>
                      <td>
                        <input className="sis-input sis-compact-input" type="number" value={band.max} onChange={(event) => updateBand(index, "max", event.target.value)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="sis-settings-stack">
            <p className="sis-panel-subtitle">
              A learner fails if the overall percentage is at or below the overall threshold, or if the subject threshold is breached in the configured number of subjects.
            </p>
            <div className="sis-settings-form-grid">
              <label className="sis-field">
                <span className="sis-field-label">Overall %</span>
                <input
                  className="sis-input"
                  type="number"
                  value={settings.failCriteria.overallThreshold}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      failCriteria: { ...current.failCriteria, overallThreshold: Number(event.target.value) },
                    }))
                  }
                />
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Subject %</span>
                <input
                  className="sis-input"
                  type="number"
                  value={settings.failCriteria.subjectThreshold}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      failCriteria: { ...current.failCriteria, subjectThreshold: Number(event.target.value) },
                    }))
                  }
                />
              </label>
              <label className="sis-field">
                <span className="sis-field-label">No. of subjects</span>
                <input
                  className="sis-input"
                  type="number"
                  value={settings.failCriteria.minimumSubjects}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      failCriteria: { ...current.failCriteria, minimumSubjects: Number(event.target.value) },
                    }))
                  }
                />
              </label>
            </div>
          </div>
        )}

        <div className="sis-form-actions">
          <button className="sis-button sis-button-secondary" type="button" onClick={resetSettings}>
            Reset
          </button>
          <button className="sis-button sis-button-primary" type="button" onClick={saveSettings}>
            Update
          </button>
        </div>
      </section>
    </section>
  );
}
