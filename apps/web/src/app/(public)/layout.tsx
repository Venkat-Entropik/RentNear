// apps/web/src/app/(public)/layout.tsx
// Public route group — no auth guard. Accessible to everyone.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
