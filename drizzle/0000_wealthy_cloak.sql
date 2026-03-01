CREATE TABLE `account` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `download` (
	`id` text PRIMARY KEY NOT NULL,
	`orderId` text NOT NULL,
	`token` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`downloadCount` integer DEFAULT 0 NOT NULL,
	`maxDownloads` integer DEFAULT 3 NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `download_token_idx` ON `download` (`token`);--> statement-breakpoint
CREATE INDEX `download_order_idx` ON `download` (`orderId`);--> statement-breakpoint
CREATE TABLE `order` (
	`id` text PRIMARY KEY NOT NULL,
	`productId` text NOT NULL,
	`customerEmail` text NOT NULL,
	`stripeSessionId` text NOT NULL,
	`stripePaymentIntent` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_stripe_session_idx` ON `order` (`stripeSessionId`);--> statement-breakpoint
CREATE INDEX `order_customer_email_idx` ON `order` (`customerEmail`);--> statement-breakpoint
CREATE INDEX `order_status_idx` ON `order` (`status`);--> statement-breakpoint
CREATE TABLE `product` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`priceInCents` integer NOT NULL,
	`fileUrl` text NOT NULL,
	`previewImageUrl` text,
	`stripeProductId` text,
	`stripePriceId` text,
	`isActive` integer DEFAULT 1 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `product_active_idx` ON `product` (`isActive`);--> statement-breakpoint
CREATE UNIQUE INDEX `product_stripe_product_idx` ON `product` (`stripeProductId`);--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`emailVerified` integer,
	`image` text
);
--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
