import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
}

class MySQLConnection {
  private pool: Pool | null = null;
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'agricultural_management',
      ssl: process.env.DB_SSL === 'true',
    };
  }

  async connect(): Promise<Pool> {
    if (!this.pool) {
      try {
        this.pool = mysql.createPool({
          host: this.config.host,
          port: this.config.port,
          user: this.config.user,
          password: this.config.password,
          database: this.config.database,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          connectTimeout: 60000,
          ssl: this.config.ssl ? { rejectUnauthorized: true } : undefined,
        });

        // Test connection
        const connection = await this.pool.getConnection();
        await connection.ping();
        connection.release();

        console.log('✅ MySQL connected successfully');
      } catch (error) {
        this.pool = null; // reset pool on failure
        console.error('❌ MySQL connection failed:', error);
        throw error;
      }
    }
    return this.pool;
  }

  async query<T extends RowDataPacket[] | ResultSetHeader>(
    sql: string,
    params?: any[]
  ): Promise<T> {
    try {
      const pool = await this.connect();
      const [results] = await pool.execute<T>(sql, params);
      return results;
    } catch (error) {
      console.error('❌ MySQL query error:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('🔌 MySQL connection closed');
    }
  }
}

export const db = new MySQLConnection();
export default db;
