import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  deleteBlogCategory,
  deleteBlogPost,
  getBlogDashboard,
  saveBlogCategory,
  setBlogPostStatus,
} from "@/lib/blog.functions";
import { fetchBlogCategories } from "@/lib/blog-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/admin/blog")({
  component: BlogDashboard,
});

type PostRow = Awaited<ReturnType<typeof getBlogDashboard>>["recent"][number];

function StatusBadge({ status }: { status: PostRow["status"] }) {
  return (
    <span
      className={
        status === "published"
          ? "inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-primary"
          : "inline-flex rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-foreground"
      }
    >
      {status}
    </span>
  );
}

function BlogDashboard() {
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState("");
  const [deletePost, setDeletePost] = useState<PostRow | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<{ id: string; name: string } | null>(null);

  const setStatusFn = useServerFn(setBlogPostStatus);
  const deletePostFn = useServerFn(deleteBlogPost);
  const saveCategoryFn = useServerFn(saveBlogCategory);
  const deleteCategoryFn = useServerFn(deleteBlogCategory);

  const { data, isLoading } = useQuery({
    queryKey: ["blog-dashboard"],
    queryFn: () => getBlogDashboard(),
  });
  const { data: categories } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: fetchBlogCategories,
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["blog-dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["blog-listing"] });
  }

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: "draft" | "published" }) => setStatusFn({ data: input }),
    onSuccess: (_res, vars) => {
      toast.success(vars.status === "published" ? "Post published" : "Post moved to drafts");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Action failed"),
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: string) => deletePostFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Post deleted");
      setDeletePost(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Delete failed"),
  });

  const saveCategoryMutation = useMutation({
    mutationFn: (name: string) => saveCategoryFn({ data: { name } }),
    onSuccess: () => {
      toast.success("Category added");
      setNewCategory("");
      void queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
    },
    onError: (error: Error) => toast.error(error.message || "Saving failed"),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteCategoryFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Category deleted");
      setDeleteCategory(null);
      void queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Delete failed"),
  });

  const counts = data?.counts ?? { all: 0, published: 0, drafts: 0 };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              ["All posts", counts.all],
              ["Published", counts.published],
              ["Drafts", counts.drafts],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-lg border px-4 py-3">
              <p className="text-2xl font-display">{value}</p>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <Button asChild>
          <Link to="/admin/blog/edit">New post</Link>
        </Button>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Loading posts…
                </TableCell>
              </TableRow>
            ) : (data?.recent.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No posts yet. Write your first one with “New post”.
                </TableCell>
              </TableRow>
            ) : (
              data!.recent.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    {post.title}
                    <span className="block text-[11px] text-muted-foreground">/blog/{post.slug}</span>
                  </TableCell>
                  <TableCell className="text-xs">{post.category_name ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={post.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(post.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to="/admin/blog/edit" search={{ slug: post.slug }}>
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={statusMutation.isPending}
                        onClick={() =>
                          statusMutation.mutate({
                            id: post.id,
                            status: post.status === "published" ? "draft" : "published",
                          })
                        }
                      >
                        {post.status === "published" ? "Unpublish" : "Publish"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeletePost(post)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Category manager */}
      <section className="mt-10 rounded-lg border p-5">
        <h2 className="font-display text-xl">Categories</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Deleting a category keeps its posts — they just lose the category.
        </p>
        <ul className="mt-4 divide-y">
          {(categories ?? []).map((cat) => (
            <li key={cat.id} className="flex items-center justify-between gap-4 py-2">
              <div>
                <p className="text-sm font-medium">{cat.name}</p>
                <p className="text-[11px] text-muted-foreground">/blog?category={cat.slug}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setDeleteCategory({ id: cat.id, name: cat.name })}>
                Delete
              </Button>
            </li>
          ))}
          {(categories ?? []).length === 0 ? (
            <li className="py-2 text-sm text-muted-foreground">No categories yet.</li>
          ) : null}
        </ul>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (newCategory.trim()) saveCategoryMutation.mutate(newCategory.trim());
          }}
        >
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name…"
            aria-label="New category name"
            className="max-w-xs"
          />
          <Button type="submit" variant="outline" disabled={saveCategoryMutation.isPending || !newCategory.trim()}>
            Add
          </Button>
        </form>
      </section>

      {/* Delete confirmations */}
      <AlertDialog open={!!deletePost} onOpenChange={(open) => !open && setDeletePost(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deletePost?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the post and its page. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePostMutation.isPending}
              onClick={() => deletePost && deletePostMutation.mutate(deletePost.id)}
            >
              Delete post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteCategory} onOpenChange={(open) => !open && setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category “{deleteCategory?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Its posts keep existing but will no longer have this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteCategoryMutation.isPending}
              onClick={() => deleteCategory && deleteCategoryMutation.mutate(deleteCategory.id)}
            >
              Delete category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
