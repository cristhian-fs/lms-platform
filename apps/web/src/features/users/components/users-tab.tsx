import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lms-platform/ui/components/table";
import { Input } from "@lms-platform/ui/components/input";
import { Button } from "@lms-platform/ui/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@lms-platform/ui/components/alert-dialog";
import { usersApi } from "../api";
import type { User } from "../types";
import { CreateUserDialog } from "./create-user-dialog";
import { Ban, ChevronUp, ChevronDown, ChevronsUpDown, Search, Trash2, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ChevronUp className="size-3" />;
  if (sorted === "desc") return <ChevronDown className="size-3" />;
  return <ChevronsUpDown className="size-3 text-muted-foreground/40" />;
}

export function UsersTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: usersApi.keys.all(debouncedSearch),
    queryFn: () => usersApi.findAll(debouncedSearch),
  });

  const banMutation = useMutation({
    mutationFn: (user: User) =>
      user.banned ? usersApi.unban(user.id) : usersApi.ban(user.id),
    onSuccess: (_, user) => {
      toast.success(user.banned ? "User unbanned" : "User banned");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      toast.success("User deleted");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => {
      toast.error(err.message);
      setDeleteTarget(null);
    },
  });

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="size-7 rounded-full object-cover"
                />
              ) : (
                <div className="size-7 rounded-full bg-muted flex items-center justify-center font-mono text-[10px] text-muted-foreground">
                  {user.name[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium">{user.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ getValue }) => {
          const role = getValue<string | null>();
          return (
            <span
              className={`font-mono text-[10px] uppercase tracking-widest ${
                role === "admin" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {role ?? "user"}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ getValue }) => (
          <span className="font-mono text-[10px] text-muted-foreground">
            {new Date(getValue<string>()).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "banned",
        header: "Status",
        cell: ({ getValue }) => {
          const banned = getValue<boolean | null>();
          return (
            <span
              className={`font-mono text-[10px] uppercase tracking-widest ${
                banned ? "text-destructive" : "text-emerald-400"
              }`}
            >
              {banned ? "banned" : "active"}
            </span>
          );
        },
      },
      {
        accessorKey: "enrollments",
        header: "Studying",
        enableSorting: false,
        cell: ({ getValue }) => {
          const enrollments = getValue<User["enrollments"]>();
          const active = enrollments.filter((e) => e.status === "active");
          if (active.length === 0)
            return (
              <span className="font-mono text-[10px] text-muted-foreground/40">
                —
              </span>
            );
          return (
            <div className="flex flex-col gap-1">
              {active.map((e) => (
                <div key={e.id} className="flex items-center gap-2">
                  <div className="h-1 w-16 bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${e.progressPct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[140px]">
                    {e.course.title}
                  </span>
                </div>
              ))}
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-1 justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                title={user.banned ? "Unban user" : "Ban user"}
                disabled={user.role === "admin" || banMutation.isPending}
                onClick={() => banMutation.mutate(user)}
              >
                {user.banned ? (
                  <ShieldCheck className="size-3.5 text-emerald-400" />
                ) : (
                  <Ban className="size-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-destructive hover:text-destructive"
                title="Delete user"
                disabled={user.role === "admin"}
                onClick={() => setDeleteTarget(user)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          );
        },
      },
    ],
    [banMutation.isPending],
  );

  const table = useReactTable({
    data: data?.data.users ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 font-mono text-xs h-8"
          />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {data?.data.total ?? 0} users
        </span>
        <Button size="sm" className="ml-auto h-8 gap-1.5" onClick={() => setCreateOpen(true)}>
          <UserPlus className="size-3.5" />
          New User
        </Button>
      </div>

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Table */}
      <div className="border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getCanSort() && (
                        <SortIcon sorted={header.column.getIsSorted()} />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>{" "}
              and all their data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
