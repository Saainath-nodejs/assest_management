require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const methodOverride = require('method-override');
const path = require('path');
const { Pool } = require('pg');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const db = require('./models');
const seedAdmin = require('./seeders/default-admin');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session
const pgPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

app.use(session({
  store: new pgSession({
    pool: pgPool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Make session user available in all views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KT Asset Management API',
      version: '1.0.0',
      description: 'API documentation for KT Asset Management System'
    },
    servers: [
      { url: `http://localhost:${PORT}` }
    ]
  },
  apis: ['./routes/api/*.js']
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const categoryRoutes = require('./routes/categories');
const assetRoutes = require('./routes/assets');
const assignmentRoutes = require('./routes/assignments');
const scrapRoutes = require('./routes/scraps');
const reportRoutes = require('./routes/reports');

const apiAuthRoutes = require('./routes/api/auth');
const apiEmployeeRoutes = require('./routes/api/employees');
const apiCategoryRoutes = require('./routes/api/categories');
const apiAssetRoutes = require('./routes/api/assets');
const apiAssignmentRoutes = require('./routes/api/assignments');
const apiScrapRoutes = require('./routes/api/scraps');
const apiReportRoutes = require('./routes/api/reports');

// Web routes
app.use('/', authRoutes);
app.use('/employees', employeeRoutes);
app.use('/categories', categoryRoutes);
app.use('/assets', assetRoutes);
app.use('/assignments', assignmentRoutes);
app.use('/scraps', scrapRoutes);
app.use('/reports', reportRoutes);

// API routes
app.use('/api/auth', apiAuthRoutes);
app.use('/api/employees', apiEmployeeRoutes);
app.use('/api/categories', apiCategoryRoutes);
app.use('/api/assets', apiAssetRoutes);
app.use('/api/assignments', apiAssignmentRoutes);
app.use('/api/scraps', apiScrapRoutes);
app.use('/api/reports', apiReportRoutes);

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/assets');
});

// Sync DB and start server
db.sequelize.sync({ alter: true }).then(async () => {
  console.log('Database synced');
  await seedAdmin();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
  });
}).catch(err => {
  console.error('Unable to sync database:', err);
});
