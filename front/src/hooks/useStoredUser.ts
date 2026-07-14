"use client";

import { useEffect, useState } from "react";

import { getStoredUser } from "@/lib/session";
import type { User } from "@/types";

type StoredUserState = {
  user: User | null;
  ready: boolean;
};

export function useStoredUser(): StoredUserState {
  const [state, setState] = useState<StoredUserState>({
    user: null,
    ready: false,
  });

  useEffect(() => {
    function readUser() {
      setState({ user: getStoredUser(), ready: true });
    }

    readUser();
    window.addEventListener("focus", readUser);
    window.addEventListener("storage", readUser);
    return () => {
      window.removeEventListener("focus", readUser);
      window.removeEventListener("storage", readUser);
    };
  }, []);

  return state;
}
