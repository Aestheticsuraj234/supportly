import { requireAuth } from "@/modules/auth/actions";
import { ChatApp } from "@/modules/chat/components/chat-app";

export default async function HomePage() {
  await requireAuth();

  return <ChatApp />;
}
