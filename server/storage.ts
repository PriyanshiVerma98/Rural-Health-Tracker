import {
  users,
  patients,
  vaccines,
  vaccinations,
  appointments,
  type User,
  type InsertUser,
  type Patient,
  type InsertPatient,
  type Vaccine,
  type InsertVaccine,
  type Vaccination,
  type InsertVaccination,
  type Appointment,
  type InsertAppointment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, desc, asc, count, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Patient operations
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByPatientId(patientId: string): Promise<Patient | undefined>;
  getPatientByQRCode(qrCode: string): Promise<Patient | undefined>;
  searchPatients(query: string): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, updates: Partial<InsertPatient>): Promise<Patient>;
  getAllPatients(limit?: number, offset?: number): Promise<Patient[]>;
  
  // Vaccine operations
  getAllVaccines(): Promise<Vaccine[]>;
  getVaccine(id: number): Promise<Vaccine | undefined>;
  createVaccine(vaccine: InsertVaccine): Promise<Vaccine>;
  
  // Vaccination operations
  getVaccinationsByPatient(patientId: number): Promise<Vaccination[]>;
  getAllVaccinations(): Promise<Vaccination[]>;
  getVaccination(id: number): Promise<Vaccination | undefined>;
  createVaccination(vaccination: InsertVaccination): Promise<Vaccination>;
  updateVaccination(id: number, updates: Partial<InsertVaccination>): Promise<Vaccination>;
  getVaccinationStats(): Promise<{
    completed: number;
    due: number;
    overdue: number;
  }>;
  
  // Appointment operations
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  getAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment>;
  getTodayAppointments(): Promise<Appointment[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const updateData = { ...updates };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.name));
  }

  // Patient operations
  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async getPatientByPatientId(patientId: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.patientId, patientId));
    return patient || undefined;
  }

  async getPatientByQRCode(qrCode: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.qrCode, qrCode));
    return patient || undefined;
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return await db
      .select()
      .from(patients)
      .where(
        or(
          ilike(patients.name, `%${query}%`),
          ilike(patients.phone, `%${query}%`),
          ilike(patients.patientId, `%${query}%`)
        )
      )
      .orderBy(asc(patients.name))
      .limit(20);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    // Generate unique patient ID
    const patientCount = await db.select({ count: count() }).from(patients);
    const patientId = `RH${String(patientCount[0].count + 1).padStart(6, '0')}`;
    
    // Generate QR code data
    const qrCode = `RH_${patientId}_${Date.now()}`;
    
    const [patient] = await db
      .insert(patients)
      .values({
        ...insertPatient,
        patientId,
        qrCode,
      })
      .returning();
    return patient;
  }

  async updatePatient(id: number, updates: Partial<InsertPatient>): Promise<Patient> {
    const [patient] = await db
      .update(patients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();
    return patient;
  }

  async getAllPatients(limit = 50, offset = 0): Promise<Patient[]> {
    return await db
      .select()
      .from(patients)
      .orderBy(desc(patients.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // Vaccine operations
  async getAllVaccines(): Promise<Vaccine[]> {
    return await db.select().from(vaccines).where(eq(vaccines.isActive, true));
  }

  async getVaccine(id: number): Promise<Vaccine | undefined> {
    const [vaccine] = await db.select().from(vaccines).where(eq(vaccines.id, id));
    return vaccine || undefined;
  }

  async createVaccine(insertVaccine: InsertVaccine): Promise<Vaccine> {
    const [vaccine] = await db.insert(vaccines).values(insertVaccine).returning();
    return vaccine;
  }

  // Vaccination operations
  async getVaccinationsByPatient(patientId: number): Promise<Vaccination[]> {
    return await db
      .select()
      .from(vaccinations)
      .where(eq(vaccinations.patientId, patientId))
      .orderBy(desc(vaccinations.scheduledDate));
  }

  async getAllVaccinations(): Promise<any[]> {
    return await db
      .select({
        id: vaccinations.id,
        patientId: vaccinations.patientId,
        vaccineId: vaccinations.vaccineId,
        doseNumber: vaccinations.doseNumber,
        scheduledDate: vaccinations.scheduledDate,
        administeredDate: vaccinations.administeredDate,
        status: vaccinations.status,
        notes: vaccinations.notes,
        administeredBy: vaccinations.administeredBy,
        createdAt: vaccinations.createdAt,
        patient: {
          id: patients.id,
          name: patients.name,
          patientId: patients.patientId,
          phone: patients.phone,
        },
        vaccine: {
          id: vaccines.id,
          name: vaccines.name,
          description: vaccines.description,
        },
      })
      .from(vaccinations)
      .leftJoin(patients, eq(vaccinations.patientId, patients.id))
      .leftJoin(vaccines, eq(vaccinations.vaccineId, vaccines.id))
      .orderBy(desc(vaccinations.createdAt));
  }

  async getVaccination(id: number): Promise<Vaccination | undefined> {
    const [vaccination] = await db.select().from(vaccinations).where(eq(vaccinations.id, id));
    return vaccination || undefined;
  }

  async createVaccination(insertVaccination: InsertVaccination): Promise<Vaccination> {
    const [vaccination] = await db.insert(vaccinations).values(insertVaccination).returning();
    return vaccination;
  }

  async updateVaccination(id: number, updates: Partial<InsertVaccination>): Promise<Vaccination> {
    const [vaccination] = await db
      .update(vaccinations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vaccinations.id, id))
      .returning();
    return vaccination;
  }

  async getVaccinationStats(): Promise<{
    completed: number;
    due: number;
    overdue: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const [completed] = await db
      .select({ count: count() })
      .from(vaccinations)
      .where(eq(vaccinations.status, 'completed'));
    
    const [due] = await db
      .select({ count: count() })
      .from(vaccinations)
      .where(
        and(
          eq(vaccinations.status, 'scheduled'),
          sql`${vaccinations.scheduledDate} >= ${today}`
        )
      );
    
    const [overdue] = await db
      .select({ count: count() })
      .from(vaccinations)
      .where(
        and(
          eq(vaccinations.status, 'scheduled'),
          sql`${vaccinations.scheduledDate} < ${today}`
        )
      );
    
    return {
      completed: completed.count,
      due: due.count,
      overdue: overdue.count,
    };
  }

  // Appointment operations
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(sql`DATE(${appointments.appointmentDate}) = ${date}`)
      .orderBy(asc(appointments.appointmentTime));
  }

  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(desc(appointments.appointmentDate));
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  async getTodayAppointments(): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db
      .select()
      .from(appointments)
      .where(sql`DATE(${appointments.appointmentDate}) = ${today}`)
      .orderBy(asc(appointments.appointmentTime));
  }
}

export const storage = new DatabaseStorage();
