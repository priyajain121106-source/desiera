import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useServerFn } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { deleteRedirect, saveRedirect } from "@/lib/seo-data.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/seo/redirects")({
  component: RedirectsPage,
});

interface RedirectRow {
  from_path: string;
  to_path: string;
  created_at: string | null;
}

function RedirectsPage() {
  const queryClient = useQueryClient();
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");

  const { data: rows, isLoading } = useQuery({
    queryKey: ["seo-redirects"],
    queryFn: async () => {
      const { data } = await supabase.from("seo_redirects").select("*").order("created_at", { ascending: false });
      return (data ?? []) as RedirectRow[];
    },
  });

  const createFn = useServerFn(saveRedirect);
  const deleteFn = useServerFn(deleteRedirect);

  const createMutation = useMutation({
    mutationFn: async () => {
      await createFn({ data: { from_path: fromPath, to_path: toPath } });
    },
    onSuccess: async () => {
      toast.success("Redirect saved");
      setFromPath("");
      setToPath("");
      await queryClient.invalidateQueries({ queryKey: ["seo-redirects"] });
    },
    onError: (error: Error) => toast.error(error.message || "Saving failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (from: string) => {
      await deleteFn({ data: { from_path: from } });
    },
    onSuccess: async () => {
      toast.success("Redirect removed");
      await queryClient.invalidateQueries({ queryKey: ["seo-redirects"] });
    },
    onError: (error: Error) => toast.error(error.message || "Deleting failed"),
  });

  return (
    <div className="max-w-3xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Redirects send visitors and search engines from an old address to the new
        one. Editing a product's slug in the SEO editor creates its redirect
        automatically. On the published desiera.shop static site, redirects are
        honoured the moment a visitor lands on the old address.
      </p>

      <form
        className="flex flex-wrap items-end gap-3 rounded-lg border p-5"
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
      >
        <div className="min-w-52 flex-1">
          <Label htmlFor="redirect-from">Old path</Label>
          <Input
            id="redirect-from"
            className="mt-2"
            placeholder="/product/old-slug"
            value={fromPath}
            onChange={(e) => setFromPath(e.target.value)}
            required
          />
        </div>
        <div className="min-w-52 flex-1">
          <Label htmlFor="redirect-to">New path</Label>
          <Input
            id="redirect-to"
            className="mt-2"
            placeholder="/product/new-slug"
            value={toPath}
            onChange={(e) => setToPath(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Saving…" : "Add redirect"}
        </Button>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Old path</TableHead>
              <TableHead>Redirects to</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : (rows ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  No redirects yet. When a product slug changes, one appears here automatically.
                </TableCell>
              </TableRow>
            ) : (
              rows?.map((row) => (
                <TableRow key={row.from_path}>
                  <TableCell className="font-medium">{row.from_path}</TableCell>
                  <TableCell>{row.to_path}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => deleteMutation.mutate(row.from_path)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
