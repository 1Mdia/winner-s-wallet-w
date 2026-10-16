import { useState, useEffect, useCallback } from "react";
import {
  login as dbLogin,
  getProgress,
  submitDocs as dbSubmitDocs,
  submitBank as dbSubmitBank,
  getToken,
  getSessionEmail,
  type PublicProgress,
} from "@/lib/localDb";

export interface UserProgress {
  email: string;
  userName: string;
  docsSubmitted: boolean;
  bankSubmitted: boolean;
  loginTs: number;
}

export function useUserProgress() {
  const [progress, setProgress] = useState<PublicProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = getSessionEmail();
    const token = getToken();
    if (!email || !token) {
      setLoading(false);
      return;
    }
    const p = getProgress(email);
    if (p) setProgress(p);
    setLoading(false);
  }, []);

  const login = useCallback((email: string) => {
    const result = dbLogin(email);
    if (result) setProgress(result.progress);
    return result?.progress ?? null;
  }, []);

  const submitDocs = useCallback(() => {
    if (!progress) return;
    const p = dbSubmitDocs(progress.email);
    if (p) setProgress(p);
  }, [progress]);

  const submitBank = useCallback(
    (method: string, details: Record<string, string>) => {
      if (!progress) return;
      const p = dbSubmitBank(progress.email, method, details);
      if (p) setProgress(p);
    },
    [progress],
  );

  return { progress, loading, login, submitDocs, submitBank };
}
