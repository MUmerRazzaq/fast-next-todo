"use client";

import { useState } from "react";
import {
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from "@/hooks/use-tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Tag } from "@/types/api";
import { ApiError } from "@/lib/api-client";

export default function TagsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tags</h2>
        <p className="text-muted-foreground">
          Organize your tasks by creating and managing tags.
        </p>
      </div>
      <CreateTagForm />
      <TagList />
    </div>
  );
}

function CreateTagForm() {
  const [name, setName] = useState("");
  const { toast } = useToast();
  const { createTag, isCreating } = useCreateTag({
    onSuccess: () => {
      toast({ title: "Tag created successfully!" });
      setName("");
    },
    onError: (error) => {
      const apiError = error as ApiError;
      const status = apiError?.status;
      if (status === 409 || apiError.message?.includes("409")) {
        toast({
          title: "Error",
          description: "Tag with this name already exists.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to create tag: ${
            apiError.message || "An unknown error occurred"
          }`,
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Tag name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    createTag({ name: name.trim() });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Tag</CardTitle>
        <CardDescription>Enter a name for your new tag.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Label htmlFor="new-tag-name" className="sr-only">
            New Tag Name
          </Label>
          <Input
            id="new-tag-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Work, Personal, Urgent"
            disabled={isCreating}
            className="flex-1"
          />
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Tag"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TagList() {
  const { tags, isLoading, error } = useTags();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-10 w-full rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            Failed to load tags. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (tags.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Tags Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            You haven&apos;t created any tags yet.
          </p>
          <p className="text-muted-foreground mt-2">
            Use the form above to create your first one!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tags.map((tag) => (
            <TagListItem key={tag.id} tag={tag} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TagListItem({ tag }: { tag: Tag }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between rounded-md border p-3">
        <span className="font-medium truncate pr-4" title={tag.name}>
          {tag.name}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>
      <EditTagDialog
        tag={tag}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
      <DeleteTagDialog
        tag={tag}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}

function EditTagDialog({
  tag,
  open,
  onOpenChange,
}: {
  tag: Tag;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(tag.name);
  const { toast } = useToast();
  const { updateTag, isUpdating } = useUpdateTag({
    onSuccess: () => {
      toast({ title: "Tag updated successfully!" });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ title: `Failed to update tag: ${error.message}`, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Tag name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    updateTag({ id: tag.id, data: { name: name.trim() } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
          <DialogDescription>
            Change the name of your tag. This will update it for all associated
            tasks.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tag-name">Tag Name</Label>
            <Input
              id="tag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isUpdating}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteTagDialog({
  tag,
  open,
  onOpenChange,
}: {
  tag: Tag;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const { deleteTag, isDeleting } = useDeleteTag({
    onSuccess: () => {
      toast({ title: "Tag deleted successfully!" });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ title: `Failed to delete tag: ${error.message}`, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will permanently delete the tag{" "}
            <span className="font-bold text-foreground">{tag.name}</span> and
            remove it from all tasks. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteTag(tag.id)}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

