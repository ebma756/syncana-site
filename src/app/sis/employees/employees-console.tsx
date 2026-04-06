"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { roleDefinitions } from "@/lib/rbac";
import {
  loadStaffMembers,
  ManagedStaffMember,
  persistStaffMembers,
  permissionsSummary,
  seedStaff,
} from "./employee-storage";

export default function EmployeesConsole() {
  const [staffMembers, setStaffMembers] = useState<ManagedStaffMember[]>(seedStaff);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setStaffMembers(loadStaffMembers());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const filteredStaff = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return staffMembers;
    }

    return staffMembers.filter((member) => {
      const roleLabel = roleDefinitions[member.role].label.toLowerCase();
      return (
        member.name.toLowerCase().includes(term) ||
        member.employeeCode.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term) ||
        member.phone.toLowerCase().includes(term) ||
        member.department.toLowerCase().includes(term) ||
        roleLabel.includes(term)
      );
    });
  }, [query, staffMembers]);

  function toggleActive(memberId: string) {
    startTransition(() => {
      setStaffMembers((current) => {
        const next = current.map((member) =>
          member.id === memberId
            ? { ...member, status: member.status === "Inactive" ? "Active" : "Inactive" }
            : member,
        );
        persistStaffMembers(next);
        return next;
      });
    });
  }

  return (
    <section className="sis-workspace sis-employees-page">
      <section className="sis-panel sis-panel-light sis-filter-panel">
        <div className="sis-employees-toolbar">
          <input
            className="sis-input sis-employee-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search employee"
          />
          <Link href="/sis/employees/new" className="sis-button sis-button-primary">
            Add New
          </Link>
        </div>
      </section>

      <section className="sis-employees-grid sis-employees-surface-grid">
        {filteredStaff.map((member) => (
          <article className="sis-employee-card" key={member.id}>
            <div className="sis-employee-avatar">{initialsFor(member.name)}</div>
            <h3 className="sis-employee-name">{member.name}</h3>
            <p className="sis-employee-role">{roleDefinitions[member.role].label}</p>
            <p className="sis-employee-meta">{member.employeeCode}</p>
            <p className="sis-employee-meta">{member.email}</p>
            <p className="sis-employee-meta">{member.phone}</p>
            <p className="sis-employee-meta">{member.department}</p>
            <p className="sis-employee-meta">{permissionsSummary(member.role)}</p>
            <div className="sis-employee-status-row">
              <span className={`sis-chip ${member.status === "Inactive" ? "chip-pending" : "chip-up"}`}>
                {member.status}
              </span>
            </div>
            <div className="sis-employee-actions">
              <Link href={`/sis/employees/new?edit=${member.id}`} className="sis-card-icon-button">
                Edit
              </Link>
              <button
                type="button"
                className="sis-card-icon-button sis-card-icon-button-warning"
                onClick={() => toggleActive(member.id)}
              >
                {member.status === "Inactive" ? "Reactivate" : "Deactivate"}
              </button>
            </div>
          </article>
        ))}

        <Link href="/sis/employees/new" className="sis-employee-card sis-employee-card-add">
          <div className="sis-employee-add-icon">+</div>
          <h3 className="sis-employee-name">Add New</h3>
          <p className="sis-employee-role">Create staff member</p>
        </Link>
      </section>
    </section>
  );
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
