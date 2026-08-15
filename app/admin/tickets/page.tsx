import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/modules/auth/actions";
import { getAdminTickets } from "@/modules/admin/actions";
import { AdminTicketTable } from "@/modules/admin/components/admin-ticket-table";

export default async function AdminTicketsPage() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  const tickets = await getAdminTickets();

  return (
    <main className="min-h-svh bg-background px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Pending support tickets</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Reply to customers or resolve their tickets to re-enable AI chat.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to chat
          </Link>
        </div>
        <AdminTicketTable tickets={tickets} />
      </div>
    </main>
  );
}
