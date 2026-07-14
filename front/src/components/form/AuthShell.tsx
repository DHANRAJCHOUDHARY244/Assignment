import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="page-shell flex max-w-md flex-1 flex-col justify-center">
      <div className="card-soft p-8 md:p-10">{children}</div>
    </main>
  );
}
