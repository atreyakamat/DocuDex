import { Pool } from 'pg';
import { config } from './env';
import { logger } from '../utils/logger';

export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  logger.info('Database pool connected');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle database client', err);
});

export async function connectDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    logger.info('✅ Database connected successfully');
    client.release();
  } catch (error) {
    logger.error('❌ Failed to connect to database:', error);
    throw error;
  }
}

export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        full_name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        is_email_verified BOOLEAN NOT NULL DEFAULT false,
        is_phone_verified BOOLEAN NOT NULL DEFAULT false,
        mfa_enabled BOOLEAN NOT NULL DEFAULT false,
        mfa_secret VARCHAR(255),
        refresh_token_hash VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Folders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS folders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
        file_name VARCHAR(500) NOT NULL,
        original_name VARCHAR(500) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_size BIGINT NOT NULL,
        storage_key VARCHAR(1000) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'PROCESSING',
        document_type VARCHAR(50),
        category VARCHAR(30),
        issue_date DATE,
        expiry_date DATE,
        issuing_authority VARCHAR(255),
        document_number VARCHAR(100),
        holder_name VARCHAR(255),
        tags TEXT[],
        extracted_fields JSONB DEFAULT '{}',
        classification_confidence FLOAT,
        is_starred BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT false,
        document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
        workflow_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Workflow instances table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workflow_instances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        template_id VARCHAR(50) NOT NULL,
        template_name VARCHAR(255) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
        current_step INTEGER NOT NULL DEFAULT 0,
        total_steps INTEGER NOT NULL DEFAULT 0,
        reference_number VARCHAR(100),
        document_ids TEXT[],
        submitted_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Audit log table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id VARCHAR(255),
        ip_address VARCHAR(50),
        user_agent TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Indexes for performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_documents_expiry ON documents(expiry_date);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);`);

    await client.query('COMMIT');
    logger.info('✅ Database schema initialized');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Failed to initialize database schema:', error);
    throw error;
  } finally {
    client.release();
  }
}
