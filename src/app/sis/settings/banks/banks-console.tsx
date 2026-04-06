"use client";

import { ChangeEvent, useMemo, useState } from "react";
import {
  FeeInvoiceBankAccount,
  loadFeeInvoiceBankAccounts,
  persistFeeInvoiceBankAccounts,
} from "../settings-storage";

type BankFormState = {
  bankName: string;
  branchAddress: string;
  accountNumber: string;
  instructions: string;
  logoDataUrl: string;
};

const emptyForm: BankFormState = {
  bankName: "",
  branchAddress: "",
  accountNumber: "",
  instructions: "",
  logoDataUrl: "",
};

export default function SettingsBanksConsole() {
  const [accounts, setAccounts] = useState<FeeInvoiceBankAccount[]>(loadFeeInvoiceBankAccounts());
  const [form, setForm] = useState<BankFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return accounts;
    }

    return accounts.filter((account) =>
      [account.bankName, account.branchAddress, account.accountNumber].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [accounts, search]);

  function update<K extends keyof BankFormState>(key: K, value: BankFormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function saveAccounts(nextAccounts: FeeInvoiceBankAccount[]) {
    persistFeeInvoiceBankAccounts(nextAccounts);
    setAccounts(loadFeeInvoiceBankAccounts());
    window.dispatchEvent(new Event("sis:settings-updated"));
  }

  function submitBank() {
    if (!form.bankName.trim() || !form.accountNumber.trim()) {
      return;
    }

    const nextAccount: FeeInvoiceBankAccount = {
      id: editingId ?? `bank-${form.bankName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      bankName: form.bankName.trim(),
      branchAddress: form.branchAddress.trim(),
      accountNumber: form.accountNumber.trim(),
      instructions: form.instructions.trim(),
      logoDataUrl: form.logoDataUrl,
      isDefault: accounts.length === 0 || accounts.every((account) => account.id !== editingId && !account.isDefault),
    };

    const nextAccounts = editingId
      ? accounts.map((account) => (account.id === editingId ? { ...nextAccount, isDefault: account.isDefault } : account))
      : [nextAccount, ...accounts];

    saveAccounts(nextAccounts);
    setEditingId(null);
    setForm(emptyForm);
  }

  function editAccount(account: FeeInvoiceBankAccount) {
    setEditingId(account.id);
    setForm({
      bankName: account.bankName,
      branchAddress: account.branchAddress,
      accountNumber: account.accountNumber,
      instructions: account.instructions,
      logoDataUrl: account.logoDataUrl,
    });
  }

  function deleteAccount(id: string) {
    const nextAccounts = accounts.filter((account) => account.id !== id);
    saveAccounts(nextAccounts);
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
  }

  function setDefaultAccount(id: string) {
    saveAccounts(
      accounts.map((account) => ({
        ...account,
        isDefault: account.id === id,
      })),
    );
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
              <h2 className="sis-panel-title">{editingId ? "Edit bank account" : "Add new bank"}</h2>
              <p className="sis-panel-subtitle">These accounts will power bank-transfer instructions on school fee invoices.</p>
            </div>
          </div>

          <div className="sis-settings-form-grid">
            <label className="sis-field sis-field-span-2">
              <span className="sis-field-label">Bank logo</span>
              <div className="sis-upload-row">
                <div className="sis-logo-tile sis-logo-tile-small">
                  {form.logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="Bank logo" className="sis-logo-image" src={form.logoDataUrl} />
                  ) : (
                    <div className="sis-logo-placeholder">BK</div>
                  )}
                </div>
                <input className="sis-input" type="file" accept="image/*" onChange={handleLogoChange} />
              </div>
            </label>

            <label className="sis-field">
              <span className="sis-field-label">Bank name</span>
              <input className="sis-input" value={form.bankName} onChange={(event) => update("bankName", event.target.value)} />
            </label>

            <label className="sis-field">
              <span className="sis-field-label">Account number</span>
              <input className="sis-input" value={form.accountNumber} onChange={(event) => update("accountNumber", event.target.value)} />
            </label>

            <label className="sis-field sis-field-span-2">
              <span className="sis-field-label">Bank / branch address</span>
              <input className="sis-input" value={form.branchAddress} onChange={(event) => update("branchAddress", event.target.value)} />
            </label>

            <label className="sis-field sis-field-span-2">
              <span className="sis-field-label">Instructions</span>
              <textarea className="sis-input sis-textarea" value={form.instructions} onChange={(event) => update("instructions", event.target.value)} />
            </label>
          </div>

          <div className="sis-form-actions">
            <button
              className="sis-button sis-button-secondary"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Clear
            </button>
            <button className="sis-button sis-button-primary" type="button" onClick={submitBank}>
              {editingId ? "Update bank" : "Add bank"}
            </button>
          </div>
        </section>

        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Configured bank accounts</h2>
              <p className="sis-panel-subtitle">Choose one default account for invoice payment instructions.</p>
            </div>
            <div className="sis-row-actions sis-row-actions-wrap">
              <span className="sis-chip chip-syncing">{accounts.length} configured</span>
              <input
                className="sis-input sis-search-input"
                placeholder="Search bank or account"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {filteredAccounts.length > 0 ? (
            <div className="sis-table-wrap">
              <table className="sis-table sis-table-light">
                <thead>
                  <tr>
                    <th>Bank name</th>
                    <th>Account No.</th>
                    <th>Instructions</th>
                    <th>Default</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account) => (
                    <tr key={account.id}>
                      <td>
                        <div className="sis-table-primary">{account.bankName}</div>
                        <div className="sis-table-secondary">{account.branchAddress || "Branch not set"}</div>
                      </td>
                      <td>{account.accountNumber}</td>
                      <td>{account.instructions || "No instructions added yet"}</td>
                      <td>
                        <span className={`sis-chip ${account.isDefault ? "chip-up" : "chip-syncing"}`}>
                          {account.isDefault ? "Default" : "Secondary"}
                        </span>
                      </td>
                      <td>
                        <div className="sis-row-actions">
                          {!account.isDefault ? (
                            <button className="sis-table-action-button sis-table-action-button-muted" type="button" onClick={() => setDefaultAccount(account.id)}>
                              Set default
                            </button>
                          ) : null}
                          <button className="sis-table-action-button sis-table-action-button-muted" type="button" onClick={() => editAccount(account)}>
                            Edit
                          </button>
                          <button className="sis-table-action-button" type="button" onClick={() => deleteAccount(account.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="sis-empty-state">No bank accounts configured yet. Add one to support invoice payment instructions.</div>
          )}
        </section>
      </div>
    </section>
  );
}
