import { is } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// 5chのような掲示板を作成する

// テーブル定義
const threads = sqliteTable("threads", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    ipAddr: text("ip_addr").notNull(),
    isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
});

const posts = sqliteTable("posts", {
    postId: integer("post_id").primaryKey({ autoIncrement: true }),
    threadId: integer("thread_id").notNull().references(() => threads.id),
    name: text("name").notNull(),
    content: text("content").notNull(),
    createdAt: text("created_at").notNull(),
    ipAddr: text("ip_addr").notNull(),
    isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false),
});

export { threads, posts };