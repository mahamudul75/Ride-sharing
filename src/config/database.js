import pg from 'pg';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const { Pool } = pg;
const IS_PRODUCTION = (process.env.VERCEL || process.env.ZEIT_ENV || process.env.NODE_ENV === 'production');
const DB_FILE_PATH = IS_PRODUCTION
  ? path.join('/tmp', 'campus_ride_sharing.sqlite')
  : path.join(process.cwd(), 'campus_ride_sharing.sqlite');

// In production/serverless, copy the local SQLite database from the repo if it exists and /tmp does not have it yet.
if (IS_PRODUCTION) {
  try {
    const srcPath = path.join(process.cwd(), 'campus_ride_sharing.sqlite');
    const destPath = DB_FILE_PATH;
    if (!fs.existsSync(destPath) && fs.existsSync(srcPath)) {
      console.log(`[Database] Copying pre-seeded database from repository ${srcPath} to ${destPath}`);
      fs.copyFileSync(srcPath, destPath);
    }
  } catch (err) {
    console.warn('[Database] Could not copy pre-seeded database to /tmp:', err.message);
  }
}

let pgPool = null;
let sqliteDb = null;

export function parsePgPoolConfig(dbUrl) {
  if (!dbUrl || typeof dbUrl !== 'string') return null;
  const cleanUrl = dbUrl.trim();

  // Handle connection strings with special characters (like '@' or '$') in the password
  const match = cleanUrl.match(/^(postgres(?:ql)?):\/\/(.*?):(.*)@([^:/]+)(?::(\d+))?\/(.+)$/);
  if (match) {
    const [, , user, password, host, port, database] = match;
    let decodedUser = user;
    let decodedPassword = password;
    try { decodedUser = decodeURIComponent(user); } catch (e) {}
    try { decodedPassword = decodeURIComponent(password); } catch (e) {}
    return {
      user: decodedUser,
      password: decodedPassword,
      host: host,
      port: port ? parseInt(port, 10) : 5432,
      database: database.split('?')[0],
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000
    };
  }

  return {
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  };
}

export async function convertDirectToPooled(dbUrl) {
  if (!dbUrl || typeof dbUrl !== 'string') return dbUrl;
  const cleanUrl = dbUrl.trim();

  // Match direct Supabase URL
  const match = cleanUrl.match(/^(postgres(?:ql)?):\/\/(.*?):(.*)@db\.([^.]+)\.supabase\.co(?::\d+)?\/(.+)$/);
  if (match) {
    const [scheme, user, password, projectRef, database] = match.slice(1);
    
    // If the username is already postgres.[projectRef], it's already a pooler configuration
    if (user.includes('.')) {
      return cleanUrl;
    }

    console.log(`[Database] Detected direct Supabase connection string. Converting project "${projectRef}" to IPv4 transaction pooler...`);

    const regions = [
      'ap-northeast-1', // Tokyo (known working region for this database)
      'ap-southeast-1', // Singapore
      'us-east-1',      // N. Virginia
      'us-west-2',      // Oregon
      'eu-central-1',   // Frankfurt
      'ap-south-1',     // Mumbai
      'eu-west-1'       // Ireland
    ];

    let decodedPassword = password;
    try { decodedPassword = decodeURIComponent(password); } catch (e) {}

    for (const region of regions) {
      const host = `aws-0-${region}.pooler.supabase.com`;
      const username = `postgres.${projectRef}`;
      const testConfig = {
        user: username,
        password: decodedPassword,
        host: host,
        port: 6543,
        database: database.split('?')[0],
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 3000
      };

      try {
        const pool = new Pool(testConfig);
        const client = await pool.connect();
        client.release();
        await pool.end();
        console.log(`[Database] Successfully converted to working pooled IPv4 URL in region: ${region}`);
        return `${scheme}://${username}:${password}@${host}:6543/${database}`;
      } catch (err) {
        console.log(`[Database] Pooler probe failed for region ${region}: ${err.message}`);
        if (err.message && err.message.includes('password authentication failed')) {
          throw new Error(`password authentication failed for user "postgres" in region ${region}. This means your Supabase project is indeed located in ${region}, but the password you provided in your connection URL is incorrect. Please double check or reset your database password in the Supabase Dashboard.`);
        }
      }
    }
  }
  return dbUrl;
}

export async function initDatabase() {
  const isValidPgUrl = (url) => url && (url.startsWith('postgres://') || url.startsWith('postgresql://'));

  let dbUrl = null;
  if (isValidPgUrl(process.env.SUPABASE_DB_URL)) {
    dbUrl = process.env.SUPABASE_DB_URL;
  } else if (isValidPgUrl(process.env.DATABASE_URL)) {
    dbUrl = process.env.DATABASE_URL;
  } else {
    // If neither is a valid pg connection string, we check if there's any fallback
    dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  }

  // Convert direct Supabase connection string to pooled IPv4-compatible string
  if (dbUrl && dbUrl.includes('.supabase.co')) {
    try {
      dbUrl = await convertDirectToPooled(dbUrl);
    } catch (err) {
      console.log("[Database] Direct to pooled URL conversion failed:", err.message);
    }
  }

  const isPlaceholderUrl = !dbUrl ||
    dbUrl.includes('[YOUR-') ||
    dbUrl.includes('YOUR-PROJECT-REF') ||
    dbUrl.includes('your-project') ||
    dbUrl.includes('[PASSWORD]') ||
    !isValidPgUrl(dbUrl);

  if (dbUrl && !isPlaceholderUrl) {
    console.log("Connecting to Supabase PostgreSQL Database...");
    try {
      const poolConfig = parsePgPoolConfig(dbUrl);
      pgPool = new Pool(poolConfig);

      // Verify database connection
      const client = await pgPool.connect();
      console.log("Successfully connected to Supabase PostgreSQL!");
      client.release();

      await initPostgresTables();
      await seedPostgresData();
      return pgPool;
    } catch (err) {
      console.log("Supabase PostgreSQL connection failed, falling back to local SQLite database:", err.message);
      if (pgPool) {
        try { await pgPool.end(); } catch (e) {}
      }
      pgPool = null;
    }
  } else {
    if (dbUrl && (dbUrl.startsWith('http://') || dbUrl.startsWith('https://'))) {
      console.warn("\n========================================================================\n" +
                   "[DATABASE CONFIG ERROR] Your DATABASE_URL starts with http/https:\n" +
                   `  "${dbUrl}"\n` +
                   "This is a Supabase Web API/REST URL, NOT a database connection string!\n" +
                   "Please use a PostgreSQL Connection String starting with 'postgresql://' or 'postgres://'.\n" +
                   "The app is falling back to local SQLite database mode to remain functional.\n" +
                   "========================================================================\n");
    } else {
      console.log("No custom Supabase DATABASE_URL provided or URL is placeholder. Operating with local SQLite database.");
    }
  }

  // Fallback to SQLite
  console.log("Initializing local SQLite database...");
  
  let initConfig = {};
  try {
    // First try relative to process.cwd() (standard and serverless environment)
    const wasmPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
    if (fs.existsSync(wasmPath)) {
      initConfig.wasmBinary = fs.readFileSync(wasmPath);
      console.log("[Database] Loaded sql-wasm.wasm binary successfully.");
    }
  } catch (err) {
    console.warn("[Database] Could not pre-load sql-wasm.wasm binary:", err.message);
  }

  const SQL = await initSqlJs({
    ...initConfig,
    locateFile: (file) => {
      return path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file);
    }
  });

  if (fs.existsSync(DB_FILE_PATH)) {
    const filebuffer = fs.readFileSync(DB_FILE_PATH);
    sqliteDb = new SQL.Database(filebuffer);
  } else {
    sqliteDb = new SQL.Database();
  }

  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      department TEXT,
      role TEXT NOT NULL DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      profile_image TEXT,
      vehicle_name TEXT,
      vehicle_number TEXT,
      vehicle_type TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL,
      pickup_location TEXT NOT NULL,
      destination TEXT NOT NULL,
      ride_date TEXT NOT NULL,
      ride_time TEXT NOT NULL,
      available_seats INTEGER NOT NULL,
      fare REAL NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ride_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ride_id INTEGER NOT NULL,
      passenger_id INTEGER NOT NULL,
      request_status TEXT NOT NULL DEFAULT 'Pending',
      request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
      FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  saveSqliteDatabase();
  await seedSqliteData();
  return sqliteDb;
}

function saveSqliteDatabase() {
  if (sqliteDb) {
    const data = sqliteDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE_PATH, buffer);
  }
}

async function syncPostgresSequences() {
  if (!pgPool) return;
  const tables = ['users', 'profiles', 'rides', 'ride_requests'];
  for (const table of tables) {
    try {
      await pgPool.query(`
        SELECT setval(
          pg_get_serial_sequence('${table}', 'id'),
          COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1,
          false
        );
      `);
    } catch (err) {
      try {
        await pgPool.query(`SELECT setval('${table}_id_seq', COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1, false);`);
      } catch (e) {
        console.log(`Notice syncing sequence for ${table}:`, e.message);
      }
    }
  }
}

async function initPostgresTables() {
  if (!pgPool) return;

  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      department VARCHAR(100),
      role VARCHAR(20) NOT NULL DEFAULT 'student',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      profile_image TEXT,
      vehicle_name VARCHAR(100),
      vehicle_number VARCHAR(100),
      vehicle_type VARCHAR(50)
    );

    CREATE TABLE IF NOT EXISTS rides (
      id SERIAL PRIMARY KEY,
      driver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      pickup_location VARCHAR(255) NOT NULL,
      destination VARCHAR(255) NOT NULL,
      ride_date VARCHAR(20) NOT NULL,
      ride_time VARCHAR(20) NOT NULL,
      available_seats INT NOT NULL,
      fare NUMERIC(10, 2) NOT NULL,
      description TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'available',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ride_requests (
      id SERIAL PRIMARY KEY,
      ride_id INT NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
      passenger_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      request_status VARCHAR(20) NOT NULL DEFAULT 'Pending',
      request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await syncPostgresSequences();
}

async function seedPostgresData() {
  if (!pgPool) return;
  try {
    const res = await pgPool.query("SELECT COUNT(*) as count FROM users");
    const count = parseInt(res.rows[0].count, 10);

    if (count === 0) {
      console.log("Seeding Supabase PostgreSQL database...");
      const hashedPassword = await bcrypt.hash("password123", 10);

      // Admin
      const adminRes = await pgPool.query(
        `INSERT INTO users (name, email, password, phone, department, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        ["System Admin", "admin@campus.edu", hashedPassword, "+8801700000000", "Computer Science", "admin"]
      );
      const adminId = adminRes.rows[0].id;
      await pgPool.query(
        `INSERT INTO profiles (user_id, profile_image, vehicle_name, vehicle_number, vehicle_type) VALUES ($1, $2, $3, $4, $5)`,
        [adminId, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250", "", "", ""]
      );

      // Drivers
      const driver1Res = await pgPool.query(
        `INSERT INTO users (name, email, password, phone, department, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        ["Rahim Ahmed", "rahim.driver@campus.edu", hashedPassword, "+8801811111111", "Electrical Engineering", "driver"]
      );
      const driver1Id = driver1Res.rows[0].id;
      await pgPool.query(
        `INSERT INTO profiles (user_id, profile_image, vehicle_name, vehicle_number, vehicle_type) VALUES ($1, $2, $3, $4, $5)`,
        [driver1Id, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250", "Toyota Corolla", "DHAKA-METRO-GA-1234", "Car"]
      );

      const driver2Res = await pgPool.query(
        `INSERT INTO users (name, email, password, phone, department, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        ["Tanvir Hasan", "tanvir.driver@campus.edu", hashedPassword, "+8801922222222", "Software Engineering", "driver"]
      );
      const driver2Id = driver2Res.rows[0].id;
      await pgPool.query(
        `INSERT INTO profiles (user_id, profile_image, vehicle_name, vehicle_number, vehicle_type) VALUES ($1, $2, $3, $4, $5)`,
        [driver2Id, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250", "Yamaha FZ-S", "DHAKA-METRO-HA-5678", "Bike"]
      );

      // Students
      const student1Res = await pgPool.query(
        `INSERT INTO users (name, email, password, phone, department, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        ["Anika Rahman", "anika.student@campus.edu", hashedPassword, "+8801733333333", "Software Engineering", "student"]
      );
      const student1Id = student1Res.rows[0].id;
      await pgPool.query(
        `INSERT INTO profiles (user_id, profile_image, vehicle_name, vehicle_number, vehicle_type) VALUES ($1, $2, $3, $4, $5)`,
        [student1Id, "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250", "", "", ""]
      );

      const student2Res = await pgPool.query(
        `INSERT INTO users (name, email, password, phone, department, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        ["Sabbir Hossain", "sabbir.student@campus.edu", hashedPassword, "+8801644444444", "Business Administration", "student"]
      );
      const student2Id = student2Res.rows[0].id;
      await pgPool.query(
        `INSERT INTO profiles (user_id, profile_image, vehicle_name, vehicle_number, vehicle_type) VALUES ($1, $2, $3, $4, $5)`,
        [student2Id, "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250", "", "", ""]
      );

      // Rides
      const ride1Res = await pgPool.query(
        `INSERT INTO rides (driver_id, pickup_location, destination, ride_date, ride_time, available_seats, fare, description, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [driver1Id, "Dhanmondi 27", "Daffodil International University", "2026-08-01", "08:30", 3, 120, "AC Sedan car, comfortable ride directly to Main Campus.", "available"]
      );
      const ride1Id = ride1Res.rows[0].id;

      const ride2Res = await pgPool.query(
        `INSERT INTO rides (driver_id, pickup_location, destination, ride_date, ride_time, available_seats, fare, description, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [driver2Id, "Uttara Sector 10", "Campus Gate 2", "2026-08-01", "09:00", 1, 80, "Quick bike ride to campus. Helmet provided.", "available"]
      );
      const ride2Id = ride2Res.rows[0].id;

      await pgPool.query(
        `INSERT INTO rides (driver_id, pickup_location, destination, ride_date, ride_time, available_seats, fare, description, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [driver1Id, "Mirpur 10", "University City Campus", "2026-08-02", "10:15", 4, 100, "Leaving early to beat traffic. Non-smoking ride.", "available"]
      );

      // Requests
      await pgPool.query(
        `INSERT INTO ride_requests (ride_id, passenger_id, request_status) VALUES ($1, $2, $3)`,
        [ride1Id, student1Id, "Pending"]
      );

      await pgPool.query(
        `INSERT INTO ride_requests (ride_id, passenger_id, request_status) VALUES ($1, $2, $3)`,
        [ride2Id, student2Id, "Accepted"]
      );

      console.log("Supabase PostgreSQL seeded successfully!");
    }
  } catch (err) {
    console.error("Error seeding Supabase Postgres data:", err);
  }
}

async function seedSqliteData() {
  const res = sqliteDb.exec("SELECT COUNT(*) as count FROM users");
  const userCount = res[0]?.values[0][0] || 0;

  if (userCount === 0) {
    console.log("Seeding local SQLite database...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    sqliteDb.run(
      `INSERT INTO users (name, email, password, phone, department, role) VALUES (?, ?, ?, ?, ?, ?)`,
      ["System Admin", "admin@campus.edu", hashedPassword, "+8801700000000", "Computer Science", "admin"]
    );
    const adminId = getSqliteInsertedId();
    sqliteDb.run(
      `INSERT INTO profiles (user_id, profile_image, vehicle_name, vehicle_number, vehicle_type) VALUES (?, ?, ?, ?, ?)`,
      [adminId, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250", "", "", ""]
    );

    sqliteDb.run(
      `INSERT INTO users (name, email, password, phone, department, role) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Rahim Ahmed", "rahim.driver@campus.edu", hashedPassword, "+8801811111111", "Electrical Engineering", "driver"]
    );
    const driver1Id = getSqliteInsertedId();
    sqliteDb.run(
      `INSERT INTO profiles (user_id, profile_image, vehicle_name, vehicle_number, vehicle_type) VALUES (?, ?, ?, ?, ?)`,
      [driver1Id, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250", "Toyota Corolla", "DHAKA-METRO-GA-1234", "Car"]
    );

    sqliteDb.run(
      `INSERT INTO users (name, email, password, phone, department, role) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Tanvir Hasan", "tanvir.driver@campus.edu", hashedPassword, "+8801922222222", "Software Engineering", "driver"]
    );
    const driver2Id = getSqliteInsertedId();
    sqliteDb.run(
      `INSERT INTO profiles (user_id, profile_image, vehicle_name, vehicle_number, vehicle_type) VALUES (?, ?, ?, ?, ?)`,
      [driver2Id, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250", "Yamaha FZ-S", "DHAKA-METRO-HA-5678", "Bike"]
    );

    sqliteDb.run(
      `INSERT INTO users (name, email, password, phone, department, role) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Anika Rahman", "anika.student@campus.edu", hashedPassword, "+8801733333333", "Software Engineering", "student"]
    );
    const student1Id = getSqliteInsertedId();
    sqliteDb.run(
      `INSERT INTO profiles (user_id, profile_image, vehicle_name, vehicle_number, vehicle_type) VALUES (?, ?, ?, ?, ?)`,
      [student1Id, "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250", "", "", ""]
    );

    sqliteDb.run(
      `INSERT INTO users (name, email, password, phone, department, role) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Sabbir Hossain", "sabbir.student@campus.edu", hashedPassword, "+8801644444444", "Business Administration", "student"]
    );
    const student2Id = getSqliteInsertedId();
    sqliteDb.run(
      `INSERT INTO profiles (user_id, profile_image, vehicle_name, vehicle_number, vehicle_type) VALUES (?, ?, ?, ?, ?)`,
      [student2Id, "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250", "", "", ""]
    );

    sqliteDb.run(
      `INSERT INTO rides (driver_id, pickup_location, destination, ride_date, ride_time, available_seats, fare, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [driver1Id, "Dhanmondi 27", "Daffodil International University", "2026-08-01", "08:30", 3, 120, "AC Sedan car, comfortable ride directly to Main Campus.", "available"]
    );
    const ride1Id = getSqliteInsertedId();

    sqliteDb.run(
      `INSERT INTO rides (driver_id, pickup_location, destination, ride_date, ride_time, available_seats, fare, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [driver2Id, "Uttara Sector 10", "Campus Gate 2", "2026-08-01", "09:00", 1, 80, "Quick bike ride to campus. Helmet provided.", "available"]
    );
    const ride2Id = getSqliteInsertedId();

    sqliteDb.run(
      `INSERT INTO rides (driver_id, pickup_location, destination, ride_date, ride_time, available_seats, fare, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [driver1Id, "Mirpur 10", "University City Campus", "2026-08-02", "10:15", 4, 100, "Leaving early to beat traffic. Non-smoking ride.", "available"]
    );

    sqliteDb.run(
      `INSERT INTO ride_requests (ride_id, passenger_id, request_status) VALUES (?, ?, ?)`,
      [ride1Id, student1Id, "Pending"]
    );

    sqliteDb.run(
      `INSERT INTO ride_requests (ride_id, passenger_id, request_status) VALUES (?, ?, ?)`,
      [ride2Id, student2Id, "Accepted"]
    );

    saveSqliteDatabase();
  }
}

function getSqliteInsertedId() {
  const res = sqliteDb.exec("SELECT last_insert_rowid()");
  return res[0].values[0][0];
}

function sanitizeParams(params = []) {
  return params.map(p => (p === undefined ? null : p));
}

function preparePgQuery(sql, params = []) {
  let paramIndex = 1;
  let pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

  // Auto append RETURNING * for INSERT queries if RETURNING is not present
  const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);
  if (isInsert && !/RETURNING/i.test(pgSql)) {
    pgSql += ' RETURNING *';
  }

  return { pgSql, params };
}

export async function queryAll(sql, params = []) {
  const cleanParams = sanitizeParams(params);
  try {
    if (pgPool) {
      const { pgSql } = preparePgQuery(sql, cleanParams);
      const res = await pgPool.query(pgSql, cleanParams);
      return res.rows;
    } else if (sqliteDb) {
      const stmt = sqliteDb.prepare(sql);
      stmt.bind(cleanParams);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    }
    return [];
  } catch (err) {
    console.error("SQL queryAll Error:", err, "Query:", sql, "Params:", params);
    throw err;
  }
}

export async function queryOne(sql, params = []) {
  const results = await queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

export async function executeRun(sql, params = []) {
  const cleanParams = sanitizeParams(params);
  try {
    if (pgPool) {
      const { pgSql } = preparePgQuery(sql, cleanParams);
      const res = await pgPool.query(pgSql, cleanParams);
      let lastId = 0;
      if (res.rows && res.rows.length > 0) {
        const row = res.rows[0];
        lastId = row.id ?? row.user_id ?? row.ride_id ?? 0;
      }
      await syncPostgresSequences();
      return { lastInsertRowid: Number(lastId), changes: res.rowCount || 1 };
    } else if (sqliteDb) {
      sqliteDb.run(sql, cleanParams);
      saveSqliteDatabase();
      const lastId = getSqliteInsertedId();
      return { lastInsertRowid: Number(lastId), changes: 1 };
    }
    return { lastInsertRowid: 0, changes: 0 };
  } catch (err) {
    console.error("SQL executeRun Error:", err, "Query:", sql, "Params:", params);
    throw err;
  }
}

export function getDatabaseStatus() {
  const envUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '';
  const hasInvalidEnvUrl = envUrl && (envUrl.startsWith('http://') || envUrl.startsWith('https://') || !envUrl.includes('://'));

  if (pgPool) {
    return {
      type: 'Supabase PostgreSQL',
      connected: true,
      mode: 'cloud',
      details: 'Connected to external Supabase PostgreSQL cloud database.',
      envUrl: envUrl ? envUrl.replace(/:[^:@\s]+@/g, ':REDACTED@') : '',
      hasInvalidEnvUrl: false
    };
  }
  return {
    type: 'Local SQLite Engine',
    connected: true,
    mode: 'local',
    details: 'Operating on persistent local file database (campus_ride_sharing.sqlite).',
    envUrl: envUrl ? envUrl.replace(/:[^:@\s]+@/g, ':REDACTED@') : '',
    hasInvalidEnvUrl: Boolean(hasInvalidEnvUrl)
  };
}

export async function setDatabaseUrl(newDbUrl) {
  if (!newDbUrl || typeof newDbUrl !== 'string' || !newDbUrl.trim()) {
    throw new Error('Database URL is required.');
  }

  let cleanUrl = newDbUrl.trim();

  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    throw new Error('You pasted an HTTP/HTTPS Web URL. Supabase databases require a PostgreSQL connection URI starting with "postgresql://" or "postgres://". Please go to your Supabase Dashboard > Project Settings > Database > Connection string > URI, copy it, and paste it here.');
  }

  if (cleanUrl.includes('[YOUR-PASSWORD]') || cleanUrl.includes('[PASSWORD]') || cleanUrl.includes('[YOUR-')) {
    throw new Error('Please replace [YOUR-PASSWORD] in the connection string with your actual Supabase database password before connecting.');
  }

  // Auto convert direct URL to pooled IPv4 URL
  if (cleanUrl.includes('.supabase.co')) {
    try {
      cleanUrl = await convertDirectToPooled(cleanUrl);
    } catch (err) {
      console.log("Failed to convert direct URL to pooled URL:", err.message);
      // If it's a specific password error, we want to bubble it up directly to the user!
      if (err.message && err.message.includes('password authentication failed')) {
        throw err;
      }
    }
  }

  console.log("Testing Supabase PostgreSQL connection...");

  const poolConfig = parsePgPoolConfig(cleanUrl);
  const testPool = new Pool(poolConfig);

  let client;
  try {
    client = await testPool.connect();
    client.release();
  } catch (err) {
    try { await testPool.end(); } catch (e) {}
    const errMsg = err.message || '';
    if (errMsg.includes('password authentication failed')) {
      throw new Error('ভুল পাসওয়ার্ড (Incorrect Password)! আপনার Supabase প্রোজেক্টের সঠিক ডেটাবেজ পাসওয়ার্ড দিয়ে চেষ্টা করুন। টিপ: যদি পাসওয়ার্ডে "@" বা "$" বা অন্য কোনো স্পেশাল ক্যারেক্টার থাকে, তবে Supabase Dashboard থেকে একটি সহজ পাসওয়ার্ড সেট করুন এবং তারপর আবার চেষ্টা করুন।');
    } else if (errMsg.includes('ENOTFOUND') || errMsg.includes('getaddrinfo') || errMsg.includes('tenant/user')) {
      throw new Error('Supabase প্রোজেক্ট রেফারেন্স বা Host সঠিক নয় (Invalid Host/Project Reference)! সঠিক কানেকশন URI দিন।');
    } else if (errMsg.includes('ECONNREFUSED')) {
      throw new Error('সরাসরি ৫৪৩২ পোর্টে কানেকশন রিফিউজড (Direct port 5432 blocked/IPv6 issue)! এই হোস্টে পোর্ট ৫৪৩২ কানেকশন সম্ভব নয়। দয়া করে নিশ্চিত করুন আপনার সঠিক ডেটাবেজ পাসওয়ার্ডটি দিয়েছেন, যাতে আমরা স্বয়ংক্রিয়ভাবে পোর্ট ৬৫৪৩ ট্রানজেকশন পুলারে কনভার্ট করতে পারি।');
    } else {
      throw new Error(`কানেকশন ফেইলড: ${errMsg}`);
    }
  }

  if (pgPool) {
    try { await pgPool.end(); } catch (e) {}
  }

  pgPool = testPool;
  process.env.DATABASE_URL = cleanUrl;
  process.env.SUPABASE_DB_URL = cleanUrl;

  // Save to .env
  try {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL=${cleanUrl}`);
    } else {
      envContent += `\nDATABASE_URL=${cleanUrl}\n`;
    }
    fs.writeFileSync(envPath, envContent);
  } catch (err) {
    console.error("Failed to update .env file:", err);
  }

  await initPostgresTables();
  await seedPostgresData();

  return getDatabaseStatus();
}

