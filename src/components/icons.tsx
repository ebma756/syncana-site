import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    />
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </BaseIcon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m9 6 6 6-6 6" />
    </BaseIcon>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
    </BaseIcon>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M22 16.92v2a2 2 0 0 1-2.18 2 19.78 19.78 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.78 19.78 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h2a2 2 0 0 1 2 1.72c.12.89.35 1.76.68 2.59a2 2 0 0 1-.45 2.11L7.1 9.91a16 16 0 0 0 6 6l1.49-1.19a2 2 0 0 1 2.11-.45c.83.33 1.7.56 2.59.68A2 2 0 0 1 22 16.92Z" />
    </BaseIcon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </BaseIcon>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.5" />
    </BaseIcon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3 5 6v6c0 4.97 3.05 8.86 7 10 3.95-1.14 7-5.03 7-10V6l-7-3Z" />
      <path d="m9.5 12.5 1.8 1.8 3.7-4.3" />
    </BaseIcon>
  );
}

export function CloudIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 18a4 4 0 1 1 .8-7.92A5.5 5.5 0 0 1 18 11a3.5 3.5 0 1 1-.5 7H7Z" />
    </BaseIcon>
  );
}

export function HeadsetIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <rect x="3" y="12" width="4" height="8" rx="2" />
      <rect x="17" y="12" width="4" height="8" rx="2" />
      <path d="M18 20a4 4 0 0 1-4 4h-2" />
    </BaseIcon>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M21 12a9 9 0 0 1-15.36 6.36" />
      <path d="M3 12A9 9 0 0 1 18.36 5.64" />
      <path d="M3 16v-4h4" />
      <path d="M21 8v4h-4" />
    </BaseIcon>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M6.94 8.5H3.56V20h3.38V8.5Zm.23-3.56c0-1.02-.77-1.84-1.92-1.84-1.14 0-1.9.82-1.9 1.84 0 1 .74 1.83 1.86 1.83h.02c1.17 0 1.94-.83 1.94-1.83ZM20.44 13.12c0-3.46-1.85-5.07-4.31-5.07-1.98 0-2.87 1.08-3.37 1.84V8.5H9.38c.05.92 0 11.5 0 11.5h3.38v-6.43c0-.34.02-.68.12-.92.27-.68.88-1.38 1.92-1.38 1.36 0 1.9 1.03 1.9 2.54V20H20v-6.88c0-.01 0-.01 0 0h.44Z" />
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3v6" />
      <path d="M12 15v6" />
      <path d="m5.64 5.64 4.24 4.24" />
      <path d="m14.12 14.12 4.24 4.24" />
      <path d="M3 12h6" />
      <path d="M15 12h6" />
      <path d="m5.64 18.36 4.24-4.24" />
      <path d="m14.12 9.88 4.24-4.24" />
    </BaseIcon>
  );
}
