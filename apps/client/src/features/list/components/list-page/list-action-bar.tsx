"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, MoreHorizontal, Pencil, Share2, Trash2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { EditListDialog } from "../edit-list-dialog";
import { DeleteListDialog } from "../delete-list-dialog";

interface ListActionBarProps {
  list: {
    id: string;
    name: string;
    description?: string | null;
    isPublic: boolean;
    userId: string;
  };
}

export function ListActionBar({ list }: ListActionBarProps) {
  const user = useAuthStore((state) => state.user);
  const isOwner = user?.id === list.userId;

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-20 backdrop-blur-md bg-background/80 px-6 sm:px-8 py-5 flex items-center justify-between border-b border-border-subtle/5">
        <div className="flex items-center gap-5">
          {/* <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-full text-ink-muted hover:text-foreground transition"
          >
            <Heart className="w-6 h-6" />
          </Button> */}
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-full text-ink-muted hover:text-foreground transition"
          >
            <Share2 className="w-5 h-5" />
          </Button>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 rounded-full text-ink-muted hover:text-foreground transition"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem
                  onClick={() => setEditDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit List
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete List
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3 text-xs text-ink-muted font-bold uppercase tracking-widest">
          <span>Filter</span>
          <div className="h-3 w-px bg-border-subtle/30" />
          <span>Sort</span>
        </div>
      </div>

      {isOwner && (
        <>
          <EditListDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            list={list}
          />
          <DeleteListDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            list={list}
          />
        </>
      )}
    </>
  );
}
