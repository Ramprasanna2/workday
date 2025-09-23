//src/model/model.ts
import mongoose , { Schema, Document } from "mongoose"

const EmployeeSchema = new mongoose.Schema({ 
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Enforces uniqueness
    lowercase: true,
    index: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Good practice for password length
  },
  role: {
    type: String,
    enum: ['Employee', 'Manager', 'Admin'], // Restricts values to this set
    default: 'Employee',
  },
  // Contact Details Schema
  contactDetails: {
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
    address: {
      street: {
        type: String,
         trim: true,
      },
      city: {
        type: String,
         trim: true,
      },
      state: {
        type: String,
        
        trim: true,
      },
      zipCode: {
        type: String,
        
        trim: true,
      },
      country: {
        type: String,
                trim: true,
      },
    },
    emergencyContact: {
      name: {
        type: String,
        
        trim: true,
      },
      relationship: {
        type: String,
        
        trim: true,
      },
      phone: {
        type: String,
       
        trim: true,
      },
      alternatePhone: {
        type: String,
        trim: true,
      },
    },
  },
  jobInfo: {
    positionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Position', // Reference to the Position collection
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department', // Reference to the Department collection
      index: true,
      required: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      ref: 'Employee', // Self-reference to the Employee collection
    },
    hireDate: {
      type: Date,
      default: Date.now,
    },
  },
  compensation: {
    wage: {
      type: Number,
      required: true,
    },
    payPeriod: {
      type: String,
      enum: ['Annual', 'Monthly'],
      // This field is only relevant for 'Salary' pay types
    },
  },
  leaveBalances: {
    annual: {
      type: Number,
      default: 12,
    },
    sick: {
      type: Number,
      default: 5,
    },
  },
  assignedLocationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location', // Reference to the Location collection
  },
  deductions: {
    tax: { type: Number, default: 0 },
    socialSecurity: { type: Number, default: 0 },
    medicare: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    retirement: { type: Number, default: 0 },
  },
}, { timestamps: true });

// 2. Location Schema
const LocationSchema = new mongoose.Schema({
  locationName: {
    type: String,
    required: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [Longitude, Latitude]
      required: true
    }
  },
  radiusMeters: {
    type: Number,
    required: true
  }
});
LocationSchema.index({ coordinates: '2dsphere' });

// 3. Department & Position Schemas
const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  employeeCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const PositionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['Employee', 'Manager', 'Admin', 'HR', 'Supervisor', 'Team Lead', 'Director', 'Executive'],
  },
  description: {
    type: String,
    trim: true,
  },
  employeeCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// 4. TimeEntry Schema
const TimeEntrySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  clockIn: {
    type: Date,
    required: true
  },
  clockOut: {
    type: Date
  },
  totalHours: Number,
  overtimeHours: Number
}, { timestamps: true });

TimeEntrySchema.index({managerId:1,employeeId:1,clockIn: -1 });

// 5. Shift Schema
const ShiftSchema = new mongoose.Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  managerId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, required: true ,set: (d: Date) => {
    const normalized = new Date(d);
    normalized.setHours(0, 0, 0, 0); // strip time
    return normalized;
  } },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  breakTimeInMinutes: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  isOpen: { type: Boolean, default: false },
  requestedBy: { type: Schema.Types.ObjectId, ref: "Employee", default: null },
  requestStatus: { type: String, enum: ["none", "pending", "approved"], default: "none" },

}, { timestamps: true });

// ✅ Compound index → Prevent same employee having duplicate shift window
ShiftSchema.index(
  { employeeId: 1, date: 1, startTime: 1, endTime: 1 },
  { unique: true }
);
const CandidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Applied', 'Review', 'Shortlisted', 'Rejected'],
    default: 'Applied',
  },
  atsScore: {
    type: Number,
    default: null,
  },
  experience: {
    type: String,
    trim: true,
  },
  resumeUrl: {
    type: String,
    trim: true,
  },
  matchedKeywords: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 6. Leave Request Schema
const LeaveRequestSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  days: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  expiresAt: {
    type: Date,
    set: function(this: any) {
      // Set expiresAt to endDate
      return this.endDate;
    }
  }
}, { timestamps: true });

// TTL index for automatic deletion
LeaveRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
LeaveRequestSchema.index({ managerId: 1, status: 1 });

// 7. Goal & Checkin Schemas
const GoalSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  modules: [
    {
      name: { type: String, required: true },
      status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' }
    }
  ],
  progress: { type: Number, default: 0 }, // percentage
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' }
}, { timestamps: true });

GoalSchema.index({  assignedBy: 1,employeeId: 1 });

GoalSchema.pre('save', function (next) {
  if (this.modules && this.modules.length > 0) {
    const completed = this.modules.filter(m => m.status === 'Completed').length;
    this.progress = Math.round((completed / this.modules.length) * 100);

    if (this.progress === 0) this.status = 'Pending';
    else if (this.progress === 100) this.status = 'Completed';
    else this.status = 'In Progress';
  } else {
    this.progress = 0;
    this.status = 'Pending';
  }
  next();
});

const CheckinSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  note: { type: String, required: true }
}, { timestamps: true });

// 8. Payslip Schema
const PayslipSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: false
  },
  payPeriodStart: {
    type: Date,
    required: true
  },
  payPeriodEnd: {
    type: Date,
    required: true
  },
  regularHours: {
    type: Number,
    required: true,
    default: 0
  },
  overtimeHours: {
    type: Number,
    required: true,
    default: 0
  },
  wage: {
    type: Number,
    required: true
  },
  overtimeRate: {
    type: Number,
    required: true,
    default: 1.5
  },
  grossPay: {
    type: Number,
    required: true
  },
  deductions: {
    tax: { type: Number, default: 0 },
    socialSecurity: { type: Number, default: 0 },
    medicare: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    retirement: { type: Number, default: 0 }
  },
  netPay: {
    type: Number,
    required: true
  },
  finalBill: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'paid'],
    default: 'draft'
  },
  notes: {
    type: String
  }
}, { timestamps: true });

// Index to prevent overlapping payslips for same employee and period
PayslipSchema.index(
  { employeeId: 1, payPeriodStart: 1, payPeriodEnd: 1 },
  { unique: true }
);

// 9. Notification Schema
export interface INotification extends Document {
  senderId: string;   // who sends it
  receiverId: string; // who receives it
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info" | "system";
  category: "leave" | "shift" | "payroll" | "system" | "announcement";
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["success", "error", "warning", "info", "system"], default: "info" },
    category: { type: String, enum: ["leave", "shift", "payroll", "system", "announcement"], default: "system" },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Add this ShiftGroup schema after the existing schemas
const ShiftGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

ShiftGroupSchema.index({ managerId: 1, name: 1 }, { unique: true });

const Employee = mongoose.model('Employee', EmployeeSchema);
const Location = mongoose.model('Location', LocationSchema);
const Department = mongoose.model('Department', DepartmentSchema);
const Position = mongoose.model('Position', PositionSchema);
const TimeEntry = mongoose.model('TimeEntry', TimeEntrySchema);
const Shift = mongoose.model('Shifter', ShiftSchema);
const Candidate = mongoose.model('Candidate', CandidateSchema);
const LeaveRequest = mongoose.model('LeaveRequest', LeaveRequestSchema);
const Goal = mongoose.model('Goal', GoalSchema);
const Checkin = mongoose.model('Checkin', CheckinSchema);
const Payslip = mongoose.model('Payslip', PayslipSchema);
const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
const ShiftGroup = mongoose.model('ShiftGroup', ShiftGroupSchema);

export {
  Employee,
  Location,
  Department,
  Position,
  TimeEntry,
  Shift,
  LeaveRequest,
  Goal,
  Checkin,
  Candidate,
  Payslip,
  Notification,
  ShiftGroup
  
};
