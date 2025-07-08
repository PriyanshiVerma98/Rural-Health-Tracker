import { pgTable, text, serial, integer, boolean, timestamp, date, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for health workers and admins
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("health_worker"), // 'admin' or 'health_worker'
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Patients table
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().unique(), // e.g., RH001234
  name: text("name").notNull(),
  phone: text("phone"),
  dateOfBirth: date("date_of_birth"),
  gender: text("gender"), // 'male', 'female', 'other'
  address: text("address"),
  guardianName: text("guardian_name"),
  guardianPhone: text("guardian_phone"),
  ageGroup: text("age_group").notNull(), // 'infant', 'child', 'pregnant', 'elderly', 'adult'
  qrCode: text("qr_code").unique(),
  medicalHistory: text("medical_history"),
  allergies: text("allergies"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

// Vaccines table
export const vaccines = pgTable("vaccines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ageGroup: text("age_group").notNull(),
  dosesRequired: integer("doses_required").default(1),
  intervalDays: integer("interval_days"), // days between doses
  isActive: boolean("is_active").default(true),
});

// Vaccination records table
export const vaccinations = pgTable("vaccinations", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  vaccineId: integer("vaccine_id").notNull().references(() => vaccines.id),
  doseNumber: integer("dose_number").notNull(),
  scheduledDate: date("scheduled_date"),
  administeredDate: date("administered_date"),
  status: text("status").notNull().default("scheduled"), // 'scheduled', 'completed', 'missed', 'overdue'
  notes: text("notes"),
  administeredBy: integer("administered_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  vaccinationId: integer("vaccination_id").references(() => vaccinations.id),
  appointmentDate: timestamp("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  status: text("status").notNull().default("scheduled"), // 'scheduled', 'completed', 'cancelled', 'rescheduled'
  type: text("type").notNull(), // 'routine', 'followup', 'new'
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  patientsCreated: many(patients),
  vaccinationsAdministered: many(vaccinations),
  appointmentsCreated: many(appointments),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [patients.createdBy],
    references: [users.id],
  }),
  vaccinations: many(vaccinations),
  appointments: many(appointments),
}));

export const vaccinesRelations = relations(vaccines, ({ many }) => ({
  vaccinations: many(vaccinations),
}));

export const vaccinationsRelations = relations(vaccinations, ({ one, many }) => ({
  patient: one(patients, {
    fields: [vaccinations.patientId],
    references: [patients.id],
  }),
  vaccine: one(vaccines, {
    fields: [vaccinations.vaccineId],
    references: [vaccines.id],
  }),
  administeredBy: one(users, {
    fields: [vaccinations.administeredBy],
    references: [users.id],
  }),
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  vaccination: one(vaccinations, {
    fields: [appointments.vaccinationId],
    references: [vaccinations.id],
  }),
  createdBy: one(users, {
    fields: [appointments.createdBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  patientId: true,
  qrCode: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVaccineSchema = createInsertSchema(vaccines).omit({
  id: true,
});

export const insertVaccinationSchema = createInsertSchema(vaccinations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Vaccine = typeof vaccines.$inferSelect;
export type InsertVaccine = z.infer<typeof insertVaccineSchema>;

export type Vaccination = typeof vaccinations.$inferSelect;
export type InsertVaccination = z.infer<typeof insertVaccinationSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
