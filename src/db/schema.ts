import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/sqlite-core";

// ─── Auth.js Tables ──────────────────────────────────────────────────────────

export const users = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  hashedPassword: text("hashedPassword"),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ─── App Tables ──────────────────────────────────────────────────────────────

export const products = sqliteTable(
  "product",
  {
    id: text("id").notNull().primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    priceInCents: integer("priceInCents").notNull(),
    fileUrl: text("fileUrl").notNull(),
    previewImageUrl: text("previewImageUrl"),
    stripeProductId: text("stripeProductId"),
    stripePriceId: text("stripePriceId"),
    isActive: integer("isActive").notNull().default(1),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (product) => ({
    activeIdx: index("product_active_idx").on(product.isActive),
    stripeProductIdx: uniqueIndex("product_stripe_product_idx").on(
      product.stripeProductId
    ),
  })
);

export const orders = sqliteTable(
  "order",
  {
    id: text("id").notNull().primaryKey(),
    productId: text("productId")
      .notNull()
      .references(() => products.id),
    customerEmail: text("customerEmail").notNull(),
    stripeSessionId: text("stripeSessionId").notNull(),
    stripePaymentIntent: text("stripePaymentIntent"),
    status: text("status", { enum: ["pending", "completed", "failed"] })
      .notNull()
      .default("pending"),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (order) => ({
    stripeSessionIdx: uniqueIndex("order_stripe_session_idx").on(
      order.stripeSessionId
    ),
    customerEmailIdx: index("order_customer_email_idx").on(
      order.customerEmail
    ),
    statusIdx: index("order_status_idx").on(order.status),
  })
);

export const downloads = sqliteTable(
  "download",
  {
    id: text("id").notNull().primaryKey(),
    orderId: text("orderId")
      .notNull()
      .references(() => orders.id),
    token: text("token").notNull(),
    expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
    downloadCount: integer("downloadCount").notNull().default(0),
    maxDownloads: integer("maxDownloads").notNull().default(3),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (download) => ({
    tokenIdx: uniqueIndex("download_token_idx").on(download.token),
    orderIdx: index("download_order_idx").on(download.orderId),
  })
);
