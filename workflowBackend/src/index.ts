import express from 'express';
import dotenv from 'dotenv';
import connectDB from './connect/connect';
import createEmployee from './route/createemployees';
import leaveRequestRouter from './route/LeaveRequest';
import shiftRouter from './route/shift'; // <-- Added Shift route
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import initPassport from "./config/passport"
import auth from "./route/auth"
import  timeEntry from "./route/timeEntry";
import  notificationRoutes from "./route/notificationRoutes"
import goalRouter from './route/goalRoute';
import payslipRouter from './route/payslipRoute';
import cors from "cors";
import adminRouter from './route/adminRoute';
import shiftGroupRouter from './route/shiftGroupRoute';
import RecruitmentOnboardingPage from './route/RecruitmentOnboardingPage';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL || "mongodb://localhost:27017/employees" }),
    cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
  })
);

// Passport init
initPassport(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use("/auth",auth)



// Employee routes
app.use('/workDay/employees', createEmployee);
// Leave Request routes
app.use('/workDay/leaves', leaveRequestRouter);
// Shift routes
app.use('/workDay/shifts', shiftRouter);
//goals
app.use('/workDay/goals', goalRouter);
//paylsips
app.use('/workDay/payslips', payslipRouter);
// Time Entry routes
app.use('/workDay/timeEntries', timeEntry);
//notification Routes
app.use("/workDay/notifications", notificationRoutes);
// admin Routes
app.use('/workDay/admin', adminRouter);
// Shift Group routes

// Recruitment Routes
app.use('/workDay/candidates', RecruitmentOnboardingPage);
app.use('/workDay/shiftGroups', shiftGroupRouter);
// Basic health check
app.get('/', (req, res) => {
  res.send('Workday backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

