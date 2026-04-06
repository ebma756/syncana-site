import { mockComms, type MockAnnouncement, type MockThread } from "@/app/sis/mock-data";
import PermissionGate from "@/app/sis/components/PermissionGate";

async function getData(): Promise<typeof mockComms> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/sis/comms`, { cache: "no-store" });
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return mockComms;
  }
}

export default async function CommsPage() {
  const data = await getData();
  return (
    <PermissionGate
      required={[
        "communication.announcements.send_school",
        "communication.messages.parent_teacher",
        "communication.messages.admin_parent",
      ]}
    >
      <section className="sis-workspace">
      <div className="sis-workspace-intro">
        <div className="sis-workspace-copy">
          <h1 className="sis-workspace-title">Communications</h1>
          <p className="sis-workspace-text">
            Manage school announcements, parent-teacher threads, and channel-ready outreach from one place.
          </p>
        </div>
        <div className="sis-chip chip-syncing">WhatsApp ready</div>
      </div>

      <div className="sis-workspace-grid">
        <section className="sis-subpanel">
          <h2 className="sis-subpanel-title">Announcements</h2>
          <ul className="sis-plain-list">
            {data.announcements.map((a: MockAnnouncement) => (
              <li key={a.id}>
                {a.date}: {a.title} ({a.audience})
              </li>
            ))}
          </ul>
        </section>
        <section className="sis-subpanel">
          <h2 className="sis-subpanel-title">Messages</h2>
          <ul className="sis-plain-list">
            {data.threads.map((t: MockThread) => (
              <li key={t.id}>
                {t.with}: {t.last} ({t.date})
              </li>
            ))}
          </ul>
        </section>
      </div>
      </section>
    </PermissionGate>
  );
}
