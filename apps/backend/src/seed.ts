/**
 * DocuDex — Seed script
 *
 * Populates the database with a demo user and ~100 realistic sample documents.
 * The documents cover all supported Indian document types with varied statuses,
 * dates, and AI-generated summaries so the UI looks fully functional on launch.
 *
 * Usage:
 *   npx ts-node --transpile-only src/seed.ts
 *   # or after build:
 *   node dist/seed.js
 */
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'docudex',
  user: process.env.DB_USER || 'docudex',
  password: process.env.DB_PASSWORD || 'docudex_pass',
});

// ── Helpers ──────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(startYear: number, endYear: number): string {
  const year = randomBetween(startYear, endYear);
  const month = String(randomBetween(1, 12)).padStart(2, '0');
  const day = String(randomBetween(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function futureDate(minDays: number, maxDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + randomBetween(minDays, maxDays));
  return d.toISOString().split('T')[0];
}

function pastDate(minDays: number, maxDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() - randomBetween(minDays, maxDays));
  return d.toISOString().split('T')[0];
}

// ── Document templates ───────────────────────────────────

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan',
  'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Myra', 'Sara', 'Aadhya', 'Isha',
  'Kavya', 'Riya', 'Nisha', 'Priya', 'Rohan', 'Karan', 'Rajesh', 'Suresh',
  'Meera', 'Neha', 'Pooja', 'Anjali', 'Divya', 'Sneha',
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Joshi', 'Rao',
  'Reddy', 'Nair', 'Iyer', 'Mehta', 'Shah', 'Das', 'Mukherjee', 'Bhat',
  'Agarwal', 'Choudhury', 'Kamat', 'Desai',
];

const AUTHORITIES = [
  'Government of India', 'UIDAI', 'Income Tax Department', 'RTO Mumbai',
  'RTO Delhi', 'Passport Office Mumbai', 'Passport Office Delhi',
  'Election Commission of India', 'State Bank of India', 'HDFC Bank',
  'ICICI Bank', 'Mumbai University', 'Delhi University', 'IIT Bombay',
  'Sub-Registrar Office', 'Municipal Corporation',
];

interface DocTemplate {
  type: string;
  category: string;
  mimeType: string;
  extension: string;
  hasExpiry: boolean;
  nameTemplate: (holder: string, year: number) => string;
  summaryTemplate: (holder: string, num: string, conf: number) => string;
  numberGen: () => string;
  sizeRange: [number, number];
}

const templates: DocTemplate[] = [
  {
    type: 'AADHAAR', category: 'IDENTITY', mimeType: 'image/jpeg', extension: 'jpg',
    hasExpiry: false,
    nameTemplate: (h, y) => `Aadhaar_Card_${h.replace(/\s/g, '_')}_${y}.jpg`,
    summaryTemplate: (h, n, c) =>
      `This document has been identified as an **Aadhaar Card** (confidence ${c}%). Key details: the holder name is **${h}**, document number **${n}**.`,
    numberGen: () => `${randomBetween(1000, 9999)} ${randomBetween(1000, 9999)} ${randomBetween(1000, 9999)}`,
    sizeRange: [200_000, 2_000_000],
  },
  {
    type: 'PAN', category: 'IDENTITY', mimeType: 'image/png', extension: 'png',
    hasExpiry: false,
    nameTemplate: (h, y) => `PAN_Card_${h.replace(/\s/g, '_')}_${y}.png`,
    summaryTemplate: (h, n, c) =>
      `This document has been identified as a **PAN Card** (confidence ${c}%). Key details: the holder name is **${h}**, document number **${n}**.`,
    numberGen: () => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return `${letters[randomBetween(0, 25)]}${letters[randomBetween(0, 25)]}${letters[randomBetween(0, 25)]}${letters[randomBetween(0, 25)]}${letters[randomBetween(0, 25)]}${randomBetween(1000, 9999)}${letters[randomBetween(0, 25)]}`;
    },
    sizeRange: [150_000, 1_500_000],
  },
  {
    type: 'PASSPORT', category: 'IDENTITY', mimeType: 'image/jpeg', extension: 'jpg',
    hasExpiry: true,
    nameTemplate: (h, y) => `Passport_${h.replace(/\s/g, '_')}_${y}.jpg`,
    summaryTemplate: (h, n, c) =>
      `This document has been identified as a **Passport** (confidence ${c}%). Key details: the holder name is **${h}**, passport number **${n}**.`,
    numberGen: () => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return `${letters[randomBetween(0, 25)]}${randomBetween(1000000, 9999999)}`;
    },
    sizeRange: [300_000, 3_000_000],
  },
  {
    type: 'DRIVING_LICENSE', category: 'IDENTITY', mimeType: 'application/pdf', extension: 'pdf',
    hasExpiry: true,
    nameTemplate: (h, y) => `Driving_License_${h.replace(/\s/g, '_')}_${y}.pdf`,
    summaryTemplate: (h, n, c) =>
      `This document has been identified as a **Driving License** (confidence ${c}%). Key details: the holder name is **${h}**, DL number **${n}**.`,
    numberGen: () => {
      const states = ['MH', 'DL', 'KA', 'TN', 'UP', 'GJ', 'RJ'];
      return `${randomFrom(states)}${randomBetween(10, 99)}${randomBetween(10000000000, 99999999999)}`;
    },
    sizeRange: [100_000, 1_000_000],
  },
  {
    type: 'VOTER_ID', category: 'IDENTITY', mimeType: 'image/jpeg', extension: 'jpg',
    hasExpiry: false,
    nameTemplate: (h, y) => `Voter_ID_${h.replace(/\s/g, '_')}_${y}.jpg`,
    summaryTemplate: (h, n, c) =>
      `This document has been identified as a **Voter ID Card** (confidence ${c}%). Key details: the holder name is **${h}**, EPIC number **${n}**.`,
    numberGen: () => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return `${letters[randomBetween(0, 25)]}${letters[randomBetween(0, 25)]}${letters[randomBetween(0, 25)]}${randomBetween(1000000, 9999999)}`;
    },
    sizeRange: [180_000, 1_800_000],
  },
  {
    type: 'BANK_STATEMENT', category: 'FINANCIAL', mimeType: 'application/pdf', extension: 'pdf',
    hasExpiry: false,
    nameTemplate: (h, y) => `Bank_Statement_${h.replace(/\s/g, '_')}_${randomFrom(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])}_${y}.pdf`,
    summaryTemplate: (h, n, c) =>
      `This document has been identified as a **Bank Statement** (confidence ${c}%). Key details: account number **${n}**, account holder **${h}**.`,
    numberGen: () => `${randomBetween(10000000, 99999999)}${randomBetween(1000, 9999)}`,
    sizeRange: [50_000, 500_000],
  },
  {
    type: 'SALARY_SLIP', category: 'FINANCIAL', mimeType: 'application/pdf', extension: 'pdf',
    hasExpiry: false,
    nameTemplate: (h, y) => `Salary_Slip_${h.replace(/\s/g, '_')}_${randomFrom(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])}_${y}.pdf`,
    summaryTemplate: (h, _n, c) =>
      `This document has been identified as a **Salary Slip** (confidence ${c}%). Employee: **${h}**. Net salary: ₹${randomBetween(30000, 250000).toLocaleString()}.`,
    numberGen: () => `EMP${randomBetween(10000, 99999)}`,
    sizeRange: [40_000, 300_000],
  },
  {
    type: 'ITR', category: 'FINANCIAL', mimeType: 'application/pdf', extension: 'pdf',
    hasExpiry: false,
    nameTemplate: (h, y) => `ITR_${h.replace(/\s/g, '_')}_AY${y}-${(y + 1).toString().slice(2)}.pdf`,
    summaryTemplate: (h, n, c) =>
      `This document has been identified as an **Income Tax Return** (confidence ${c}%). PAN: **${n}**, assessment year 20${randomBetween(22, 25)}-${randomBetween(23, 26)}.`,
    numberGen: () => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return `${letters[randomBetween(0, 25)]}${letters[randomBetween(0, 25)]}${letters[randomBetween(0, 25)]}${letters[randomBetween(0, 25)]}${letters[randomBetween(0, 25)]}${randomBetween(1000, 9999)}${letters[randomBetween(0, 25)]}`;
    },
    sizeRange: [80_000, 600_000],
  },
  {
    type: 'DEGREE_CERTIFICATE', category: 'EDUCATIONAL', mimeType: 'application/pdf', extension: 'pdf',
    hasExpiry: false,
    nameTemplate: (h, y) => `Degree_Certificate_${h.replace(/\s/g, '_')}_${y}.pdf`,
    summaryTemplate: (h, _n, c) =>
      `This document has been identified as a **Degree Certificate** (confidence ${c}%). Graduate: **${h}**, from ${randomFrom(['Mumbai University', 'Delhi University', 'IIT Bombay', 'Pune University', 'Anna University'])}.`,
    numberGen: () => `DEG/${randomBetween(2018, 2025)}/${randomBetween(10000, 99999)}`,
    sizeRange: [100_000, 800_000],
  },
  {
    type: 'PROPERTY_DEED', category: 'PROPERTY', mimeType: 'application/pdf', extension: 'pdf',
    hasExpiry: false,
    nameTemplate: (h, y) => `Sale_Deed_${h.replace(/\s/g, '_')}_${y}.pdf`,
    summaryTemplate: (h, n, c) =>
      `This document has been identified as a **Property Deed / Sale Deed** (confidence ${c}%). Registration: **${n}**, owner: **${h}**.`,
    numberGen: () => `REG/${randomBetween(2015, 2025)}/${randomBetween(1000, 9999)}`,
    sizeRange: [200_000, 2_000_000],
  },
  {
    type: 'GST_REGISTRATION', category: 'BUSINESS', mimeType: 'application/pdf', extension: 'pdf',
    hasExpiry: false,
    nameTemplate: (h, y) => `GST_Registration_${h.replace(/\s/g, '_')}_${y}.pdf`,
    summaryTemplate: (h, n, c) =>
      `This document has been identified as a **GST Registration Certificate** (confidence ${c}%). GSTIN: **${n}**, registered to **${h}**.`,
    numberGen: () => {
      const states = ['27', '07', '29', '33', '09', '24', '08'];
      return `${randomFrom(states)}${randomBetween(10000, 99999)}${randomBetween(10000, 99999)}${randomBetween(100, 999)}`;
    },
    sizeRange: [60_000, 400_000],
  },
  {
    type: 'ELECTRICITY_BILL', category: 'UTILITY', mimeType: 'application/pdf', extension: 'pdf',
    hasExpiry: false,
    nameTemplate: (h, y) => `Electricity_Bill_${h.replace(/\s/g, '_')}_${randomFrom(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])}_${y}.pdf`,
    summaryTemplate: (h, n, c) =>
      `This document has been identified as an **Electricity Bill** (confidence ${c}%). Consumer: **${h}**, account **${n}**. Amount: ₹${randomBetween(500, 5000)}.`,
    numberGen: () => `${randomBetween(100000000, 999999999)}`,
    sizeRange: [30_000, 200_000],
  },
];

// ── Status distribution logic ────────────────────────────

function pickStatus(hasExpiry: boolean): { status: string; issueDate: string | null; expiryDate: string | null } {
  if (!hasExpiry) {
    return {
      status: 'CURRENT',
      issueDate: randomDate(2018, 2025),
      expiryDate: null,
    };
  }

  const roll = Math.random();
  if (roll < 0.15) {
    // Expired
    return {
      status: 'EXPIRED',
      issueDate: randomDate(2015, 2020),
      expiryDate: pastDate(10, 365),
    };
  } else if (roll < 0.35) {
    // Expiring soon
    return {
      status: 'EXPIRING_SOON',
      issueDate: randomDate(2018, 2023),
      expiryDate: futureDate(1, 89),
    };
  } else {
    // Current
    return {
      status: 'CURRENT',
      issueDate: randomDate(2020, 2025),
      expiryDate: futureDate(91, 3650),
    };
  }
}

// ── Main ─────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starting DocuDex seed…');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if demo user exists
    const existing = await client.query("SELECT id FROM users WHERE email = 'demo@docudex.com'");
    let userId: string;

    if (existing.rows.length > 0) {
      userId = existing.rows[0].id;
      console.log(`  ✅ Demo user already exists (${userId})`);
      // Delete existing docs for clean re-seed
      await client.query('DELETE FROM documents WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM folders WHERE user_id = $1', [userId]);
      console.log('  🗑️  Cleared existing demo data');
    } else {
      userId = uuidv4();
      const hash = await bcrypt.hash('Demo@12345', 10);
      await client.query(
        `INSERT INTO users (id, email, full_name, password_hash, role, is_email_verified)
         VALUES ($1, $2, $3, $4, $5, true)`,
        [userId, 'demo@docudex.com', 'Demo User', hash, 'user']
      );
      console.log(`  ✅ Created demo user: demo@docudex.com / Demo@12345`);
    }

    // Create folders
    const folders = ['Identity Documents', 'Financial Records', 'Education', 'Property', 'Business', 'Utility Bills'];
    const folderIds: Record<string, string> = {};
    for (const name of folders) {
      const fid = uuidv4();
      await client.query(
        'INSERT INTO folders (id, user_id, name) VALUES ($1, $2, $3)',
        [fid, userId, name]
      );
      folderIds[name] = fid;
    }
    console.log(`  📁 Created ${folders.length} folders`);

    const categoryToFolder: Record<string, string> = {
      IDENTITY: folderIds['Identity Documents'],
      FINANCIAL: folderIds['Financial Records'],
      EDUCATIONAL: folderIds['Education'],
      PROPERTY: folderIds['Property'],
      BUSINESS: folderIds['Business'],
      UTILITY: folderIds['Utility Bills'],
    };

    // Generate 100 documents
    const TOTAL_DOCS = 100;
    let inserted = 0;
    const starredIndices = new Set<number>();
    while (starredIndices.size < 8) starredIndices.add(randomBetween(0, TOTAL_DOCS - 1));

    for (let i = 0; i < TOTAL_DOCS; i++) {
      const tpl = templates[i % templates.length];
      const firstName = randomFrom(FIRST_NAMES);
      const lastName = randomFrom(LAST_NAMES);
      const holder = `${firstName} ${lastName}`;
      const year = randomBetween(2020, 2025);
      const confidence = parseFloat((0.65 + Math.random() * 0.30).toFixed(2));
      const docNumber = tpl.numberGen();
      const { status, issueDate, expiryDate } = pickStatus(tpl.hasExpiry);

      const id = uuidv4();
      const fileName = `${id}.${tpl.extension}`;
      const originalName = tpl.nameTemplate(holder, year);
      const fileSize = randomBetween(...tpl.sizeRange);
      const summary = tpl.summaryTemplate(holder, docNumber, Math.round(confidence * 100));

      const extractedFields: Record<string, string> = {
        name: holder,
        documentNumber: docNumber,
      };
      if (issueDate) extractedFields.issueDate = issueDate;
      if (expiryDate) extractedFields.expiryDate = expiryDate;

      const isStarred = starredIndices.has(i);
      const folderId = categoryToFolder[tpl.category] || null;
      const authority = randomFrom(AUTHORITIES);
      const tags = [tpl.type.toLowerCase(), tpl.category.toLowerCase()];

      // Offset createdAt so recent docs are spread over last 60 days
      const daysAgo = randomBetween(0, 60);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      await client.query(
        `INSERT INTO documents
           (id, user_id, folder_id, file_name, original_name, mime_type, file_size, storage_key,
            status, document_type, category, issue_date, expiry_date, issuing_authority,
            document_number, holder_name, tags, extracted_fields, classification_confidence,
            summary, is_starred, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$22)`,
        [
          id, userId, folderId, fileName, originalName, tpl.mimeType, fileSize, fileName,
          status, tpl.type, tpl.category, issueDate, expiryDate, authority,
          docNumber, holder, tags, JSON.stringify(extractedFields), confidence,
          summary, isStarred, createdAt,
        ]
      );
      inserted++;
    }
    console.log(`  📄 Inserted ${inserted} documents`);

    // Create some notifications
    const notifTemplates = [
      { type: 'DOCUMENT_EXPIRING', title: 'Passport expiring soon', message: 'Your passport will expire in 30 days. Please plan for renewal.' },
      { type: 'DOCUMENT_EXPIRING', title: 'Driving license due for renewal', message: 'Your driving license expires in 15 days.' },
      { type: 'DOCUMENT_PROCESSED', title: 'Document processed', message: 'Your Aadhaar Card has been successfully classified and indexed.' },
      { type: 'DOCUMENT_PROCESSED', title: 'PAN Card ready', message: 'AI processing complete — PAN Card classified with 85% confidence.' },
      { type: 'SYSTEM', title: 'Welcome to DocuDex!', message: 'Start by uploading your first document. Our AI will classify and organize it for you.' },
      { type: 'DOCUMENT_EXPIRED', title: 'Voter ID expired', message: 'Your Voter ID has expired. Please check and update.' },
      { type: 'WORKFLOW_STATUS_CHANGE', title: 'Home Loan workflow started', message: 'You have started the Home Loan Application workflow. 7 documents required.' },
      { type: 'SYSTEM', title: 'Tip: Use workflows', message: 'Try our guided workflows to collect all documents needed for common processes like home loans or passport renewal.' },
    ];

    for (const n of notifTemplates) {
      await client.query(
        `INSERT INTO notifications (id, user_id, type, title, message, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW() - interval '${randomBetween(0, 14)} days')`,
        [uuidv4(), userId, n.type, n.title, n.message, Math.random() < 0.3]
      );
    }
    console.log(`  🔔 Created ${notifTemplates.length} notifications`);

    await client.query('COMMIT');

    console.log('\n✅ Seed complete!');
    console.log('   Login with: demo@docudex.com / Demo@12345\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
