export type Invoice = {
    id: string;
    amount: number;
    status: "paid" | "pending" | "overdue";
    dueDate: string;
    description: string;
  };
  
  export type Order = {
    id: string;
    trackingNumber: string;
    status: "processing" | "shipped" | "delivered";
    eta: string;
    items: string[];
  };
  
  export type SupportTicket = {
    id: string;
    subject: string;
    status: "open" | "in_progress" | "resolved";
    category: string;
  };
  
  export type KnowledgeArticle = {
    id: string;
    title: string;
    content: string;
    tags: string[];
  };
  
  type UserSupportData = {
    invoices: Invoice[];
    orders: Order[];
    tickets: SupportTicket[];
  };
  
  const knowledgeBase: KnowledgeArticle[] = [
    {
      id: "KB-001",
      title: "Reset your password",
      content:
        "Go to Settings > Security > Reset Password. You will receive an email with a reset link within 5 minutes.",
      tags: ["account", "password", "login"],
    },
    {
      id: "KB-002",
      title: "App keeps crashing on startup",
      content:
        "Clear the app cache, ensure you are on the latest version, and restart your device. If the issue persists, contact support.",
      tags: ["crash", "bug", "technical", "app"],
    },
    {
      id: "KB-003",
      title: "Request a refund",
      content:
        "Refunds can be requested within 30 days of purchase. Go to Billing > Invoices and select Request Refund on the eligible invoice.",
      tags: ["refund", "billing", "payment"],
    },
  ];
  
  const defaultUserData: UserSupportData = {
    invoices: [
      {
        id: "INV-1001",
        amount: 49.99,
        status: "paid",
        dueDate: "2026-07-01",
        description: "Supportly Pro — July 2026",
      },
      {
        id: "INV-1002",
        amount: 49.99,
        status: "pending",
        dueDate: "2026-08-01",
        description: "Supportly Pro — August 2026",
      },
    ],
    orders: [
      {
        id: "ORD-1001",
        trackingNumber: "TRK-7829104",
        status: "shipped",
        eta: "2026-08-16",
        items: ["Wireless Keyboard", "USB-C Hub"],
      },
      {
        id: "ORD-1002",
        trackingNumber: "TRK-3344556",
        status: "processing",
        eta: "2026-08-20",
        items: ["Monitor Stand"],
      },
    ],
    tickets: [
      {
        id: "TKT-501",
        subject: "Login issue on mobile app",
        status: "open",
        category: "technical",
      },
    ],
  };
  
  const userData = new Map<string, UserSupportData>();
  
  function getUserData(userId: string): UserSupportData {
    if (!userData.has(userId)) {
      userData.set(userId, structuredClone(defaultUserData));
    }
  
    return userData.get(userId)!;
  }
  
  export function getInvoicesForUser(userId: string) {
    return getUserData(userId).invoices;
  }
  
  export function getInvoiceForUser(userId: string, invoiceId: string) {
    return getUserData(userId).invoices.find(
      (invoice) => invoice.id.toLowerCase() === invoiceId.toLowerCase(),
    );
  }
  
  export function requestRefundForUser(
    userId: string,
    invoiceId: string,
    reason: string,
  ) {
    const invoice = getInvoiceForUser(userId, invoiceId);
  
    if (!invoice) {
      return { success: false, message: `Invoice ${invoiceId} not found.` };
    }
  
    return {
      success: true,
      message: `Refund request submitted for ${invoiceId}. Reason: ${reason}. You will hear back within 2 business days.`,
    };
  }
  
  export function getOrdersForUser(userId: string) {
    return getUserData(userId).orders;
  }
  
  export function trackOrderForUser(userId: string, query: string) {
    const normalizedQuery = query.toLowerCase();
    const order = getUserData(userId).orders.find(
      (item) =>
        item.id.toLowerCase() === normalizedQuery ||
        item.trackingNumber.toLowerCase() === normalizedQuery,
    );
  
    return order ?? null;
  }
  
  export function getTicketsForUser(userId: string) {
    return getUserData(userId).tickets;
  }
  
  export function getTicketForUser(userId: string, ticketId: string) {
    return getUserData(userId).tickets.find(
      (ticket) => ticket.id.toLowerCase() === ticketId.toLowerCase(),
    );
  }
  
  export function createTicketForUser(
    userId: string,
    subject: string,
    description: string,
  ) {
    const ticket: SupportTicket = {
      id: `TKT-${Date.now().toString().slice(-4)}`,
      subject,
      status: "open",
      category: "technical",
    };
  
    getUserData(userId).tickets.push(ticket);
  
    return {
      ticket,
      message: `Ticket created. Reference: ${ticket.id}. Description: ${description}`,
    };
  }
  
  export function searchKnowledgeBase(query: string) {
    const normalizedQuery = query.toLowerCase();
  
    return knowledgeBase.filter(
      (article) =>
        article.title.toLowerCase().includes(normalizedQuery) ||
        article.content.toLowerCase().includes(normalizedQuery) ||
        article.tags.some((tag) => tag.includes(normalizedQuery)),
    );
  }
  