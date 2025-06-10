import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull(), // document/project/resume
  size: integer("size").notNull(),
  type: text("type").notNull(),

  // storage information
  fileUrl: text("file_url").notNull(), // url to accessfile
  thumbnailUrl: text("thumbnail url"),

  // ownership

  userId: text("user_id").notNull(),
  parentId: uuid("parent_id"),

  // files folders and flags
  isFolder: boolean("is_folder").default(false).notNull(),
  isStarred: boolean("is_starred").default(false).notNull(),
  isTrash: boolean("is_trashed").default(false).notNull(),

  // timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// parent means  each file / folder can have one parent folder
// children means that each folder can have many files, or folders as well
export const filesRelations = relations(files, ({one, many}) => ({
  parent: one(files, {
    fields: [files.parentId],
    references: [files.id],
  }),

  // relation to child file/folder
  children: many(files),
}));

// type definations

export const File = typeof files.$inferSelect;
export const NewFile = typeof files.$inferInsert; 
