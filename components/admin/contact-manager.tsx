"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { Button } from "@/components/ui/button";
import { LoadingOverlay, Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { fetchContactsApi, updateContactStatusApi } from "@/lib/contacts-api";
import { cn } from "@/lib/cn";
import type { Contact } from "@/lib/types";

export function ContactManager() {
  const { accessToken } = useAuthModal();
  const { showToast } = useToast();
  const [contacts, setContacts] = useState<readonly Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const loadContacts = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    setIsLoading(true);
    const result = await fetchContactsApi(accessToken);
    if (result.ok) {
      setContacts(result.contacts);
    } else {
      showToast(result.message, "error");
    }
    setIsLoading(false);
  }, [accessToken, showToast]);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  const sortedContacts = useMemo(
    () =>
      [...contacts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [contacts],
  );

  const unreadCount = useMemo(
    () => contacts.filter((contact) => contact.status === "unread").length,
    [contacts],
  );

  async function handleMarkAsRead(id: string) {
    if (!accessToken) {
      return;
    }
    setPendingId(id);
    const result = await updateContactStatusApi(accessToken, id, "read");
    if (result.ok) {
      setContacts((current) =>
        current.map((entry) => (entry.id === id ? result.contact : entry)),
      );
      showToast("Đã đánh dấu đã đọc.", "success");
    } else {
      showToast(result.message, "error");
    }
    setPendingId(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Liên hệ</h1>
          <p className="mt-2 text-sm text-muted">
            {unreadCount > 0
              ? `${unreadCount} tin nhắn chưa đọc.`
              : "Tất cả tin nhắn đã được đọc."}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadContacts()}>
          Tải lại
        </Button>
      </div>

      {isLoading ? (
        <LoadingOverlay label="Đang tải danh sách liên hệ…" />
      ) : sortedContacts.length === 0 ? (
        <div className="rounded-card border border-dashed border-border py-20 text-center">
          <p className="font-display text-2xl text-foreground">Chưa có liên hệ</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedContacts.map((contact) => {
            const isUnread = contact.status === "unread";
            const isPending = pendingId === contact.id;
            return (
              <article
                key={contact.id}
                className={cn(
                  "rounded-card border p-6",
                  isUnread ? "border-foreground bg-surface" : "border-border",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      {isUnread ? (
                        <span
                          aria-hidden
                          className="size-2 rounded-full bg-accent"
                        />
                      ) : null}
                      <h2 className="font-display text-xl text-foreground">
                        {contact.name}
                      </h2>
                      <span className="text-xs font-medium uppercase tracking-label text-muted">
                        {isUnread ? "Chưa đọc" : "Đã đọc"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {contact.email}
                      {contact.phone ? ` · ${contact.phone}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className="text-xs text-muted">
                      {new Date(contact.createdAt).toLocaleString("vi-VN")}
                    </span>
                    {isUnread ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => void handleMarkAsRead(contact.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-label text-foreground underline-offset-4 hover:cursor-pointer hover:underline disabled:opacity-50"
                      >
                        {isPending ? <Spinner className="size-3" /> : null}
                        Đánh dấu đã đọc
                      </button>
                    ) : null}
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-wrap border-t border-border pt-4 text-sm text-foreground">
                  {contact.message}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
