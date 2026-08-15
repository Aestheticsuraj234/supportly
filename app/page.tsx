import { getCurrentUserWithRole, requireAuth } from "@/modules/auth/actions";
import { ChatApp } from "@/modules/chat/components/chat-app";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getCurrentUserWithRole();

  if(!user) {
    redirect("/sign-in");
  }

  return <ChatApp isAdmin={user.role === "ADMIN"} />;
}
