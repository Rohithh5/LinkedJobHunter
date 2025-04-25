import { pgTable, text, serial, integer, boolean, timestamp, json, foreignKey, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const applicationStatusEnum = pgEnum('application_status', [
  'applied', 
  'in_review', 
  'viewed', 
  'interview_scheduled', 
  'rejected', 
  'no_response', 
  'hired'
]);

export const jobTypeEnum = pgEnum('job_type', [
  'full_time',
  'part_time',
  'contract',
  'internship',
  'temporary'
]);

export const experienceLevelEnum = pgEnum('experience_level', [
  'entry',
  'mid',
  'senior',
  'executive'
]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  linkedinId: text("linkedin_id").unique(),
  linkedinAccessToken: text("linkedin_access_token"),
  linkedinTokenExpiry: timestamp("linkedin_token_expiry"),
  linkedinConnected: boolean("linkedin_connected").default(false),
  profilePicture: text("profile_picture"),
  lastSynced: timestamp("last_synced"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// User Profile details table
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  headline: text("headline"),
  summary: text("summary"),
  location: text("location"),
  phoneNumber: text("phone_number"),
  website: text("website"),
  skills: text("skills").array(),
  education: json("education"),
  experience: json("experience"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Resumes table
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isDefault: boolean("is_default").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  website: text("website"),
  linkedinId: text("linkedin_id").unique(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  linkedinJobId: text("linkedin_job_id").unique(),
  title: text("title").notNull(),
  companyId: integer("company_id").references(() => companies.id),
  description: text("description"),
  location: text("location"),
  salary: text("salary"),
  jobType: jobTypeEnum("job_type"),
  experienceLevel: experienceLevelEnum("experience_level"),
  skills: text("skills").array(),
  isEasyApply: boolean("is_easy_apply").default(false),
  postedDate: timestamp("posted_date"),
  url: text("url").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Job Applications table
export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: integer("job_id").notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  resumeId: integer("resume_id").references(() => resumes.id),
  applicationDate: timestamp("application_date").defaultNow().notNull(),
  status: applicationStatusEnum("status").default('applied'),
  lastStatusUpdate: timestamp("last_status_update").defaultNow().notNull(),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Search Criteria table
export const searchCriteria = pgTable("search_criteria", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  keywords: text("keywords").array(),
  location: text("location"),
  experienceLevel: experienceLevelEnum("experience_level"),
  jobType: jobTypeEnum("job_type"),
  datePosted: text("date_posted"),
  autoApply: boolean("auto_apply").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  profiles: many(profiles),
  resumes: many(resumes),
  jobApplications: many(jobApplications),
  searchCriteria: many(searchCriteria),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const resumesRelations = relations(resumes, ({ one, many }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id],
  }),
  jobApplications: many(jobApplications),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  jobApplications: many(jobApplications),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
  user: one(users, {
    fields: [jobApplications.userId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [jobApplications.jobId],
    references: [jobs.id],
  }),
  resume: one(resumes, {
    fields: [jobApplications.resumeId],
    references: [resumes.id],
  }),
}));

export const searchCriteriaRelations = relations(searchCriteria, ({ one }) => ({
  user: one(users, {
    fields: [searchCriteria.userId],
    references: [users.id],
  }),
}));

// Validation schemas
export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email("Must provide a valid email"),
  fullName: (schema) => schema.min(2, "Full name must be at least 2 characters"),
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(8, "Password must be at least 8 characters"),
}).omit({ created_at: true, updated_at: true });

export const updateUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email("Must provide a valid email"),
  fullName: (schema) => schema.min(2, "Full name must be at least 2 characters"),
}).omit({ id: true, username: true, password: true, created_at: true, updated_at: true }).partial();

export const insertProfileSchema = createInsertSchema(profiles).omit({ created_at: true, updated_at: true });
export const updateProfileSchema = createInsertSchema(profiles).omit({ id: true, userId: true, created_at: true, updated_at: true }).partial();

export const insertResumeSchema = createInsertSchema(resumes, {
  title: (schema) => schema.min(2, "Title must be at least 2 characters"),
}).omit({ created_at: true, updated_at: true });

export const insertCompanySchema = createInsertSchema(companies, {
  name: (schema) => schema.min(2, "Company name must be at least 2 characters"),
}).omit({ created_at: true });

export const insertJobSchema = createInsertSchema(jobs, {
  title: (schema) => schema.min(2, "Job title must be at least 2 characters"),
  url: (schema) => schema.url("Must provide a valid URL"),
}).omit({ created_at: true });

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({ created_at: true, updated_at: true });
export const updateJobApplicationSchema = createInsertSchema(jobApplications).omit({ id: true, userId: true, jobId: true, created_at: true, updated_at: true }).partial();

export const insertSearchCriteriaSchema = createInsertSchema(searchCriteria, {
  title: (schema) => schema.min(2, "Title must be at least 2 characters"),
}).omit({ created_at: true, updated_at: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type UpdateJobApplication = z.infer<typeof updateJobApplicationSchema>;

export type SearchCriteria = typeof searchCriteria.$inferSelect;
export type InsertSearchCriteria = z.infer<typeof insertSearchCriteriaSchema>;
