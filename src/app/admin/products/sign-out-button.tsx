"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm text-muted hover:text-foreground transition-colors duration-200"
    >
      Sign out
    </button>
  );
}
