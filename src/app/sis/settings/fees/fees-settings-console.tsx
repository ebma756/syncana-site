"use client";

import { useMemo, useState } from "react";
import { gradeOptions } from "../../students/student-storage";
import {
  defaultDiscountRules,
  defaultExtracurricularActivities,
  defaultExtracurricularPackages,
  defaultGradeFeeStructures,
  DiscountRule,
  ExtracurricularActivity,
  ExtracurricularPackage,
  GradeFeeStructure,
  loadDiscountRules,
  loadExtracurricularActivities,
  loadExtracurricularPackages,
  loadGradeFeeStructures,
  packageActivities,
  persistDiscountRules,
  persistExtracurricularActivities,
  persistExtracurricularPackages,
  persistGradeFeeStructures,
} from "../settings-storage";

type FeeTab = "grades" | "discounts" | "activities" | "packages";

export default function FeeSettingsConsole() {
  const [activeTab, setActiveTab] = useState<FeeTab>("grades");
  const [gradeFees, setGradeFees] = useState<GradeFeeStructure[]>(loadGradeFeeStructures());
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>(loadDiscountRules());
  const [activities, setActivities] = useState<ExtracurricularActivity[]>(loadExtracurricularActivities());
  const [packages, setPackages] = useState<ExtracurricularPackage[]>(loadExtracurricularPackages());
  const [discountForm, setDiscountForm] = useState<Omit<DiscountRule, "id">>({
    name: "",
    type: "percentage",
    value: 0,
    description: "",
    isActive: true,
  });
  const [activityForm, setActivityForm] = useState<Omit<ExtracurricularActivity, "id">>({
    name: "",
    description: "",
    isActive: true,
    teacherName: "",
    dayLabel: "",
    timeLabel: "",
  });
  const [packageForm, setPackageForm] = useState<Omit<ExtracurricularPackage, "id">>({
    name: "",
    description: "",
    monthlyFee: 0,
    includedActivityIds: [],
    isActive: true,
  });

  const gradeFeeMap = useMemo(
    () =>
      gradeOptions().map((grade) => gradeFees.find((entry) => entry.grade === grade) ?? createGradeFee(grade)),
    [gradeFees],
  );

  function saveGradeFees(nextFees: GradeFeeStructure[]) {
    setGradeFees(nextFees);
    persistGradeFeeStructures(nextFees);
    window.dispatchEvent(new Event("sis:settings-updated"));
  }

  function saveDiscounts(nextRules: DiscountRule[]) {
    setDiscountRules(nextRules);
    persistDiscountRules(nextRules);
    window.dispatchEvent(new Event("sis:settings-updated"));
  }

  function saveActivities(nextActivities: ExtracurricularActivity[]) {
    setActivities(nextActivities);
    persistExtracurricularActivities(nextActivities);
    window.dispatchEvent(new Event("sis:settings-updated"));
  }

  function savePackages(nextPackages: ExtracurricularPackage[]) {
    setPackages(nextPackages);
    persistExtracurricularPackages(nextPackages);
    window.dispatchEvent(new Event("sis:settings-updated"));
  }

  function updateGradeFee(grade: string, key: keyof Pick<GradeFeeStructure, "tuition" | "registrationFee" | "examFee" | "transportFee">, value: string) {
    const next = gradeFeeMap.map((entry) =>
      entry.grade === grade ? { ...entry, [key]: Number(value) || 0 } : entry,
    );
    saveGradeFees(next);
  }

  function submitDiscount() {
    if (!discountForm.name.trim()) {
      return;
    }

    saveDiscounts([
      {
        id: `discount-${discountForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
        ...discountForm,
      },
      ...discountRules,
    ]);
    setDiscountForm({ name: "", type: "percentage", value: 0, description: "", isActive: true });
  }

  function submitActivity() {
    if (!activityForm.name.trim()) {
      return;
    }

    saveActivities([
      {
        id: `activity-${activityForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
        ...activityForm,
      },
      ...activities,
    ]);
    setActivityForm({ name: "", description: "", isActive: true, teacherName: "", dayLabel: "", timeLabel: "" });
  }

  function submitPackage() {
    if (!packageForm.name.trim()) {
      return;
    }

    savePackages([
      {
        id: `package-${packageForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
        ...packageForm,
      },
      ...packages,
    ]);
    setPackageForm({ name: "", description: "", monthlyFee: 0, includedActivityIds: [], isActive: true });
  }

  return (
    <section className="sis-workspace sis-fee-settings-page">
      <div className="sis-fee-settings-shell">
        <div className="sis-fee-settings-copy">
          <p className="sis-panel-subtitle">Use the tabs below to manage pricing, discount catalogs, and extracurricular billing components.</p>
        </div>

        <div className="sis-page-metrics sis-page-metrics-compact sis-fee-settings-metrics">
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Grades configured</span>
            <span className="sis-page-metric-value">{gradeFeeMap.filter((entry) => entry.isActive).length}</span>
            <span className="sis-page-metric-note">Base fee structures</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Discount types</span>
            <span className="sis-page-metric-value">{discountRules.filter((entry) => entry.isActive).length}</span>
            <span className="sis-page-metric-note">Catalog only</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Activities</span>
            <span className="sis-page-metric-value">{activities.filter((entry) => entry.isActive).length}</span>
            <span className="sis-page-metric-note">Operational offerings</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Packages</span>
            <span className="sis-page-metric-value">{packages.filter((entry) => entry.isActive).length}</span>
            <span className="sis-page-metric-note">Billed add-ons</span>
          </article>
        </div>

        <div className="sis-fee-settings-tabs-row">
          <div className="sis-settings-tabs sis-settings-tabs-compact">
            <button className={`sis-settings-tab${activeTab === "grades" ? " sis-settings-tab-active" : ""}`} type="button" onClick={() => setActiveTab("grades")}>
              Grade Fees
            </button>
            <button className={`sis-settings-tab${activeTab === "discounts" ? " sis-settings-tab-active" : ""}`} type="button" onClick={() => setActiveTab("discounts")}>
              Discount Types
            </button>
            <button className={`sis-settings-tab${activeTab === "activities" ? " sis-settings-tab-active" : ""}`} type="button" onClick={() => setActiveTab("activities")}>
              Activities
            </button>
            <button className={`sis-settings-tab${activeTab === "packages" ? " sis-settings-tab-active" : ""}`} type="button" onClick={() => setActiveTab("packages")}>
              Packages / Add-ons
            </button>
          </div>
        </div>

        {activeTab === "grades" ? (
          <section className="sis-panel sis-panel-light sis-fee-content-panel">
            <div className="sis-fee-tab-shell sis-fee-tab-shell-table">
              <div className="sis-table-wrap">
              <table className="sis-table sis-table-light sis-fee-grade-table">
                <colgroup>
                  <col />
                  <col />
                  <col />
                  <col />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th>Grade</th>
                    <th>Tuition</th>
                    <th>Registration</th>
                    <th>Exam</th>
                    <th>Transport</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeFeeMap.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.grade}</td>
                      <td>
                        <input
                          className="sis-input sis-compact-input sis-fee-amount-input"
                          type="number"
                          min="0"
                          value={entry.tuition}
                          onChange={(event) => updateGradeFee(entry.grade, "tuition", event.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="sis-input sis-compact-input sis-fee-amount-input"
                          type="number"
                          min="0"
                          value={entry.registrationFee}
                          onChange={(event) => updateGradeFee(entry.grade, "registrationFee", event.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="sis-input sis-compact-input sis-fee-amount-input"
                          type="number"
                          min="0"
                          value={entry.examFee}
                          onChange={(event) => updateGradeFee(entry.grade, "examFee", event.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="sis-input sis-compact-input sis-fee-amount-input"
                          type="number"
                          min="0"
                          value={entry.transportFee}
                          onChange={(event) => updateGradeFee(entry.grade, "transportFee", event.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "discounts" ? (
          <div className="sis-fee-settings-split">
            <section className="sis-panel sis-panel-light sis-fee-form-panel">
              <div className="sis-panel-header">
                <div>
                  <h2 className="sis-panel-title">Discount rule catalog</h2>
                  <p className="sis-panel-subtitle">Create reusable scholarship and discount types. Student-level application comes later.</p>
                </div>
              </div>
              <div className="sis-fee-form-grid">
                <label className="sis-field">
                  <span className="sis-field-label">Rule name</span>
                  <input className="sis-input" value={discountForm.name} onChange={(event) => setDiscountForm((current) => ({ ...current, name: event.target.value }))} />
                </label>
                <label className="sis-field">
                  <span className="sis-field-label">Type</span>
                  <select className="sis-input sis-select" value={discountForm.type} onChange={(event) => setDiscountForm((current) => ({ ...current, type: event.target.value as DiscountRule["type"] }))}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </label>
                <label className="sis-field">
                  <span className="sis-field-label">Default value</span>
                  <input className="sis-input" type="number" min="0" value={discountForm.value} onChange={(event) => setDiscountForm((current) => ({ ...current, value: Number(event.target.value) || 0 }))} />
                </label>
                <label className="sis-field sis-field-span-2">
                  <span className="sis-field-label">Description</span>
                  <textarea className="sis-input sis-textarea sis-fee-textarea" value={discountForm.description} onChange={(event) => setDiscountForm((current) => ({ ...current, description: event.target.value }))} />
                </label>
              </div>
              <div className="sis-form-actions">
                <button className="sis-button sis-button-secondary" type="button" onClick={() => setDiscountRules(defaultDiscountRules)}>
                  Reset to defaults
                </button>
                <button className="sis-button sis-button-primary" type="button" onClick={submitDiscount}>
                  Add discount type
                </button>
              </div>
            </section>

            <section className="sis-panel sis-panel-light sis-fee-list-panel">
              <div className="sis-panel-header">
                <div>
                  <h2 className="sis-panel-title">Existing rules</h2>
                  <p className="sis-panel-subtitle">Keep the catalog visible while you create or refine new types.</p>
                </div>
              </div>
              <div className="sis-data-list">
                {discountRules.map((rule) => (
                  <article className="sis-data-item" key={rule.id}>
                    <div>
                      <div className="sis-data-heading">{rule.name}</div>
                      <div className="sis-data-meta">{rule.description || "No description yet."}</div>
                    </div>
                    <div className="sis-row-actions sis-row-actions-wrap">
                      <span className="sis-data-side">
                        {rule.type === "percentage" ? `${rule.value}%` : `${rule.value.toLocaleString()} MT`}
                      </span>
                      <span className={`sis-chip ${rule.isActive ? "chip-up" : "chip-syncing"}`}>{rule.isActive ? "Active" : "Inactive"}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {activeTab === "activities" ? (
          <div className="sis-fee-settings-split">
            <section className="sis-panel sis-panel-light sis-fee-form-panel">
              <div className="sis-panel-header">
                <div>
                  <h2 className="sis-panel-title">Extracurricular activities</h2>
                  <p className="sis-panel-subtitle">Operational activities that later connect to timetable, rosters, and attendance.</p>
                </div>
              </div>
              <div className="sis-fee-form-grid">
                <label className="sis-field">
                  <span className="sis-field-label">Activity name</span>
                  <input className="sis-input" value={activityForm.name} onChange={(event) => setActivityForm((current) => ({ ...current, name: event.target.value }))} />
                </label>
                <label className="sis-field">
                  <span className="sis-field-label">Teacher</span>
                  <input className="sis-input" value={activityForm.teacherName ?? ""} onChange={(event) => setActivityForm((current) => ({ ...current, teacherName: event.target.value }))} />
                </label>
                <label className="sis-field">
                  <span className="sis-field-label">Day</span>
                  <input className="sis-input" value={activityForm.dayLabel ?? ""} onChange={(event) => setActivityForm((current) => ({ ...current, dayLabel: event.target.value }))} />
                </label>
                <label className="sis-field">
                  <span className="sis-field-label">Time</span>
                  <input className="sis-input" value={activityForm.timeLabel ?? ""} onChange={(event) => setActivityForm((current) => ({ ...current, timeLabel: event.target.value }))} />
                </label>
                <label className="sis-field sis-field-span-2">
                  <span className="sis-field-label">Description</span>
                  <textarea className="sis-input sis-textarea sis-fee-textarea" value={activityForm.description} onChange={(event) => setActivityForm((current) => ({ ...current, description: event.target.value }))} />
                </label>
              </div>
              <div className="sis-form-actions">
                <button className="sis-button sis-button-secondary" type="button" onClick={() => saveActivities(defaultExtracurricularActivities)}>
                  Reset to defaults
                </button>
                <button className="sis-button sis-button-primary" type="button" onClick={submitActivity}>
                  Add activity
                </button>
              </div>
            </section>

            <section className="sis-panel sis-panel-light sis-fee-list-panel">
              <div className="sis-panel-header">
                <div>
                  <h2 className="sis-panel-title">Configured activities</h2>
                  <p className="sis-panel-subtitle">Operational activities stay visible while you create the next one.</p>
                </div>
              </div>
              <div className="sis-data-list">
                {activities.map((activity) => (
                  <article className="sis-data-item" key={activity.id}>
                    <div>
                      <div className="sis-data-heading">{activity.name}</div>
                      <div className="sis-data-meta">{activity.description || "No description yet."}</div>
                    </div>
                    <div className="sis-data-side">
                      {[activity.teacherName, activity.dayLabel, activity.timeLabel].filter(Boolean).join(" · ") || "Schedule later"}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {activeTab === "packages" ? (
          <div className="sis-fee-package-shell">
            <section className="sis-panel sis-panel-light sis-fee-form-panel sis-fee-form-panel-centered">
              <div className="sis-panel-header">
                <div>
                  <h2 className="sis-panel-title">Extracurricular package / add-on</h2>
                  <p className="sis-panel-subtitle">This is the billed commercial package that parents buy. It can include multiple activities.</p>
                </div>
              </div>
              <div className="sis-fee-form-grid">
                <label className="sis-field">
                  <span className="sis-field-label">Package name</span>
                  <input className="sis-input" value={packageForm.name} onChange={(event) => setPackageForm((current) => ({ ...current, name: event.target.value }))} />
                </label>
                <label className="sis-field sis-field-compact">
                  <span className="sis-field-label">Monthly fee</span>
                  <input className="sis-input" type="number" min="0" value={packageForm.monthlyFee} onChange={(event) => setPackageForm((current) => ({ ...current, monthlyFee: Number(event.target.value) || 0 }))} />
                </label>
                <label className="sis-field sis-field-span-2">
                  <span className="sis-field-label">Description</span>
                  <textarea className="sis-input sis-textarea sis-fee-textarea" value={packageForm.description} onChange={(event) => setPackageForm((current) => ({ ...current, description: event.target.value }))} />
                </label>
                <div className="sis-field sis-field-span-2">
                  <span className="sis-field-label">Included activities</span>
                  <div className="sis-checkbox-grid sis-checkbox-grid-compact">
                    {activities.filter((entry) => entry.isActive).map((activity) => (
                      <label className="sis-checkbox-card sis-checkbox-card-compact" key={activity.id}>
                        <input
                          type="checkbox"
                          checked={packageForm.includedActivityIds.includes(activity.id)}
                          onChange={(event) =>
                            setPackageForm((current) => ({
                              ...current,
                              includedActivityIds: event.target.checked
                                ? [...current.includedActivityIds, activity.id]
                                : current.includedActivityIds.filter((id) => id !== activity.id),
                            }))
                          }
                        />
                        <span>{activity.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="sis-form-actions">
                <button className="sis-button sis-button-secondary" type="button" onClick={() => savePackages(defaultExtracurricularPackages)}>
                  Reset to defaults
                </button>
                <button className="sis-button sis-button-primary" type="button" onClick={submitPackage}>
                  Add package
                </button>
              </div>
            </section>

            <section className="sis-panel sis-panel-light sis-fee-form-panel sis-fee-form-panel-centered">
              <div className="sis-panel-header">
                <div>
                  <h2 className="sis-panel-title">Configured packages</h2>
                  <p className="sis-panel-subtitle">Review what parents can buy without leaving the package workflow.</p>
                </div>
              </div>
              <div className="sis-data-list">
                {packages.map((pkg) => (
                  <article className="sis-data-item" key={pkg.id}>
                    <div>
                      <div className="sis-data-heading">{pkg.name}</div>
                      <div className="sis-data-meta">
                        {pkg.description || "No description yet."} {packageActivities(pkg.id, packages, activities).length > 0 ? `Includes ${packageActivities(pkg.id, packages, activities).map((entry) => entry.name).join(", ")}.` : ""}
                      </div>
                    </div>
                    <div className="sis-data-side">{pkg.monthlyFee.toLocaleString()} MT / month</div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function createGradeFee(grade: string): GradeFeeStructure {
  const seed = defaultGradeFeeStructures.find((entry) => entry.grade === grade);
  return (
    seed ?? {
      id: `fee-${grade.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      grade,
      tuition: 0,
      registrationFee: 0,
      examFee: 0,
      transportFee: 0,
      isActive: true,
    }
  );
}
