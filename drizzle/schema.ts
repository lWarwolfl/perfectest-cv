import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import type {
  Customization,
  EntryData,
  PersonalDetails,
  SectionType,
} from '@/features/resume/types'
import type { LetterDesign } from '@/features/letter/types'

export const User = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
})

export const Session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => User.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
})

export const Account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => User.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  issuer: text('issuer'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
})

export const Verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
})

export const Resume = pgTable(
  'resume',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    userId: text('user_id')
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
    title: text('title').notNull().default('Resume'),
    order: integer('order').notNull().default(0),
    lng: text('lng').notNull().default('en'),
    tags: jsonb('tags').$type<{ id: string; name: string }[]>().notNull().default([]),
    personalDetails: jsonb('personal_details')
      .$type<PersonalDetails>()
      .notNull()
      .default({} as PersonalDetails),
    customization: jsonb('customization').$type<Customization>().notNull().default({} as Customization),
    webResumeLive: boolean('web_resume_live').notNull().default(false),
    webToken: text('web_token'),
    feedbackEnabled: boolean('feedback_enabled').notNull().default(true),
    lastChangeAt: timestamp('last_change_at').defaultNow().notNull(),
  },
  (t) => [index('resume_user_idx').on(t.userId)]
)

export const ResumeSection = pgTable(
  'resume_section',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    resumeId: uuid('resume_id')
      .notNull()
      .references(() => Resume.id, { onDelete: 'cascade' }),
    order: integer('order').notNull().default(0),
    sectionType: text('section_type').$type<SectionType>().notNull(),
    displayName: text('display_name').notNull().default(''),
    iconKey: text('icon_key').notNull().default(''),
    hidden: boolean('hidden').notNull().default(false),
  },
  (t) => [index('resume_section_resume_idx').on(t.resumeId)]
)

export const ResumeEntry = pgTable(
  'resume_entry',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    sectionId: uuid('section_id')
      .notNull()
      .references(() => ResumeSection.id, { onDelete: 'cascade' }),
    order: integer('order').notNull().default(0),
    hidden: boolean('hidden').notNull().default(false),
    data: jsonb('data').$type<EntryData>().notNull(),
  },
  (t) => [index('resume_entry_section_idx').on(t.sectionId)]
)

export const Letter = pgTable(
  'letter',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    userId: text('user_id')
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
    title: text('title').notNull().default('Cover Letter'),
    order: integer('order').notNull().default(0),
    lng: text('lng').notNull().default('en'),
    tags: jsonb('tags').$type<{ id: string; name: string }[]>().notNull().default([]),
    body: text('body').notNull().default(''),
    subject: text('subject').notNull().default(''),
    dateMode: text('date_mode').$type<'current' | 'custom'>().notNull().default('current'),
    dateCustom: text('date_custom').notNull().default(''),
    senderName: text('sender_name').notNull().default(''),
    senderJobTitle: text('sender_job_title').notNull().default(''),
    senderEmail: text('sender_email').notNull().default(''),
    senderPhone: text('sender_phone').notNull().default(''),
    senderAddress: text('sender_address').notNull().default(''),
    senderWebsite: text('sender_website').notNull().default(''),
    senderLinkedIn: text('sender_linked_in').notNull().default(''),
    senderGitHub: text('sender_git_hub').notNull().default(''),
    recipientName: text('recipient_name').notNull().default(''),
    recipientPosition: text('recipient_position').notNull().default(''),
    recipientCompany: text('recipient_company').notNull().default(''),
    recipientAddress: text('recipient_address').notNull().default(''),
    signatureName: text('signature_name').notNull().default(''),
    signaturePlace: text('signature_place').notNull().default(''),
    signatureDate: text('signature_date').notNull().default(''),
    signatureImageId: text('signature_image_id').notNull().default(''),
    design: jsonb('design').$type<LetterDesign>().notNull().default({} as LetterDesign),
    syncWithResumeId: uuid('sync_with_resume_id').references(() => Resume.id, {
      onDelete: 'set null',
    }),
    lastChangeAt: timestamp('last_change_at').defaultNow().notNull(),
  },
  (t) => [index('letter_user_idx').on(t.userId)]
)

export const Tracker = pgTable(
  'tracker',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    userId: text('user_id')
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
    name: text('name').notNull().default('Job Tracker'),
    columns: jsonb('columns')
      .$type<{ id: string; name: string; cardIds: string[] }[]>()
      .notNull()
      .default([]),
  },
  (t) => [index('tracker_user_idx').on(t.userId)]
)

export const TrackerCard = pgTable(
  'tracker_card',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    trackerId: uuid('tracker_id')
      .notNull()
      .references(() => Tracker.id, { onDelete: 'cascade' }),
    company: text('company').notNull().default(''),
    jobTitle: text('job_title').notNull().default(''),
    location: text('location').notNull().default(''),
    salary: text('salary').notNull().default(''),
    link: text('link').notNull().default(''),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    dateApplied: text('date_applied').notNull().default(''),
    statusUpdates: jsonb('status_updates')
      .$type<
        {
          id: string
          fromColumnId: string | null
          fromColumnName: string | null
          toColumnId: string
          toColumnName: string
          changedAt: string
        }[]
      >()
      .notNull()
      .default([]),
    jobDescription: text('job_description').notNull().default(''),
    notes: text('notes').notNull().default(''),
    todos: jsonb('todos')
      .$type<{ id: string; todo: string; done: boolean }[]>()
      .notNull()
      .default([]),
    files: jsonb('files')
      .$type<{ id: string; name: string; url: string; size: number; type: string }[]>()
      .notNull()
      .default([]),
    resumeVersionId: uuid('resume_version_id').references(() => Resume.id, {
      onDelete: 'set null',
    }),
    coverLetterVersionId: uuid('cover_letter_version_id').references(() => Letter.id, {
      onDelete: 'set null',
    }),
    hidden: boolean('hidden').notNull().default(false),
    isNew: boolean('is_new').notNull().default(true),
  },
  (t) => [index('tracker_card_tracker_idx').on(t.trackerId)]
)

export const Image = pgTable(
  'image',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    userId: text('user_id')
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    url: text('url').notNull(),
    fileId: text('file_id').notNull(),
    size: text('size').notNull(),
    type: text('type').notNull(),
  },
  (t) => [index('image_user_idx').on(t.userId)]
)

export const UserRelations = relations(User, ({ many }) => ({
  resumes: many(Resume),
  letters: many(Letter),
  trackers: many(Tracker),
}))

export const ResumeRelations = relations(Resume, ({ one, many }) => ({
  user: one(User, { fields: [Resume.userId], references: [User.id] }),
  sections: many(ResumeSection),
  trackerCards: many(TrackerCard),
}))

export const ResumeSectionRelations = relations(ResumeSection, ({ one, many }) => ({
  resume: one(Resume, { fields: [ResumeSection.resumeId], references: [Resume.id] }),
  entries: many(ResumeEntry),
}))

export const ResumeEntryRelations = relations(ResumeEntry, ({ one }) => ({
  section: one(ResumeSection, { fields: [ResumeEntry.sectionId], references: [ResumeSection.id] }),
}))

export const LetterRelations = relations(Letter, ({ one, many }) => ({
  user: one(User, { fields: [Letter.userId], references: [User.id] }),
  trackerCards: many(TrackerCard),
}))

export const TrackerRelations = relations(Tracker, ({ one, many }) => ({
  user: one(User, { fields: [Tracker.userId], references: [User.id] }),
  cards: many(TrackerCard),
}))

export const TrackerCardRelations = relations(TrackerCard, ({ one }) => ({
  tracker: one(Tracker, { fields: [TrackerCard.trackerId], references: [Tracker.id] }),
  resume: one(Resume, { fields: [TrackerCard.resumeVersionId], references: [Resume.id] }),
  letter: one(Letter, { fields: [TrackerCard.coverLetterVersionId], references: [Letter.id] }),
}))

export type TUser = typeof User.$inferSelect
export type TResume = typeof Resume.$inferSelect
export type TResumeSection = typeof ResumeSection.$inferSelect
export type TResumeEntry = typeof ResumeEntry.$inferSelect
export type TLetter = typeof Letter.$inferSelect
export type TTracker = typeof Tracker.$inferSelect
export type TTrackerCard = typeof TrackerCard.$inferSelect
export type TImage = typeof Image.$inferSelect
