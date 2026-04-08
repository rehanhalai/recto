"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@/components/ui";
import { toast } from "@/lib/toast";
import { updateList } from "../api/update-list";

type EditListDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list: {
    id: string;
    name: string;
    description?: string | null;
    isPublic: boolean;
  };
};

export function EditListDialog({
  open,
  onOpenChange,
  list,
}: EditListDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState(list.name);
  const [description, setDescription] = useState(list.description || "");
  const [isPublic, setIsPublic] = useState(list.isPublic);

  const updateListMutation = useMutation({
    mutationFn: async () => {
      return updateList(list.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        is_public: isPublic,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list", list.id] });
      toast.success("List updated successfully");
      onOpenChange(false);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to update list";
      toast.error(message);
    },
  });

  const canSubmit = name.trim().length > 0 && !updateListMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] rounded-2xl border border-border-subtle bg-paper p-0 sm:w-full sm:max-w-lg">
        <DialogHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
          <DialogTitle className="text-xl text-ink">Edit List</DialogTitle>
          <DialogDescription className="text-ink-muted">
            Update the name, description, and visibility of your list.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
              List Name *
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My reading list"
              maxLength={100}
              className="h-11 rounded-lg border-border-subtle bg-card-surface text-ink"
            />
            <p className="text-right text-xs text-ink-muted">
              {name.length}/100
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
              Description
            </Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              placeholder="What's this list about?"
              className="min-h-28 w-full rounded-lg border border-border-subtle bg-card-surface px-3 py-2 text-sm text-ink outline-none ring-0 transition focus:border-accent"
            />
            <p className="text-right text-xs text-ink-muted">
              {description.length}/500
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
              Visibility
            </Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                  isPublic
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border-subtle bg-card-surface text-ink-muted hover:border-accent/50"
                }`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                  !isPublic
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border-subtle bg-card-surface text-ink-muted hover:border-accent/50"
                }`}
              >
                Private
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border-subtle px-5 py-4 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() => updateListMutation.mutate()}
          >
            {updateListMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
