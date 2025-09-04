# WorkForce Pro - Next.js Application

A comprehensive workforce management application built with Next.js, featuring role-based authentication, employee management, shift scheduling, attendance tracking, and payroll management.

## Features

### Core Functionality
- **Role-based Authentication** - Admin, Manager, and Employee roles with different permissions
- **Dashboard** - Role-specific dashboards with relevant metrics and quick actions
- **Employee Management** - Complete CRUD operations for employee data (Admin only)
- **Attendance Tracking** - Real-time clock-in/clock-out with GPS tracking
- **Shift Management** - Schedule management and shift assignments
- **Leave Requests** - Submit, approve, and track leave requests
- **Payroll Integration** - Automated payroll processing and payslip generation
- **Shift Swaps** - Employee-initiated shift swapping with approvals
- **Notifications** - Real-time alerts and notifications system

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components built with Radix UI primitives
- **Icons**: Lucide React
- **Authentication**: Custom auth context (can be replaced with NextAuth.js)

## Project Structure

```
/app
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, Input, etc.)
│   └── Navbar.tsx      # Navigation component
├── dashboard/          # Dashboard routes
│   ├── layout.tsx      # Dashboard layout with sidebar
│   ├── page.tsx        # Main dashboard
│   ├── attendance/     # Attendance tracking
│   ├── employees/      # Employee management (Admin)
│   ├── shifts/         # Shift scheduling
│   ├── leave-requests/ # Leave management
│   └── ...            # Other dashboard routes
├── providers/          # React contexts and providers
├── globals.css         # Global styles and CSS variables
├── layout.tsx          # Root layout
├── page.tsx           # Landing page
├── login/             # Authentication
├── about/             # Static pages
├── contact/
└── products/
/middleware.ts          # Route protection middleware
/next.config.js        # Next.js configuration
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd workforce-pro-nextjs
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Accounts

The application includes demo accounts for testing different roles:

- **Admin**: admin@company.com / password123
- **Manager**: manager@company.com / password123  
- **Employee**: employee@company.com / password123

## Key Features by Role

### Employee Access
- View personal dashboard with shift information
- Clock in/out with attendance tracking
- Submit leave requests
- View personal schedule and payslips
- Request shift swaps
- Receive notifications

### Manager Access
- All employee features
- Approve/reject leave requests
- Monitor team attendance
- View team reports
- Manage shift assignments for direct reports
- Process shift swap approvals

### Admin Access  
- All manager features
- Full employee management (CRUD operations)
- System-wide reporting and analytics
- Payroll processing
- Shift management across all departments
- System settings and configuration

## Routes

### Public Routes
- `/` - Landing page
- `/about` - About page  
- `/contact` - Contact page
- `/products/workforce-management` - Product showcase
- `/login` - Authentication

### Protected Routes (Dashboard)
- `/dashboard` - Role-specific dashboard
- `/dashboard/attendance` - Time tracking (Employee)
- `/dashboard/shifts` - Personal schedule (Employee)
- `/dashboard/leave-requests` - Leave management (Employee)
- `/dashboard/employees` - Employee management (Admin)
- `/dashboard/approvals` - Approval dashboard (Manager/Admin)
- `/dashboard/payroll` - Payroll processing (Manager/Admin)
- `/dashboard/reports` - Analytics and reports (Manager/Admin)
- And more...

## Customization

### Styling
- Modify `/app/globals.css` for global styles and CSS variables
- Components use Tailwind CSS classes
- Color scheme and themes can be customized via CSS variables

### Adding New Routes
1. Create new page in appropriate `/app` directory
2. Add route to dashboard layout navigation (if protected)
3. Update middleware for route protection if needed

### Authentication
The current implementation uses a simple context-based authentication system. For production, consider integrating:
- NextAuth.js for OAuth/social login
- Supabase Auth for backend authentication
- Auth0 for enterprise authentication

## Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Deployment Platforms
The application can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- Any platform supporting Node.js

## Environment Variables

Create a `.env.local` file for environment-specific configurations:

```env
NEXT_PUBLIC_API_URL=your-api-url
NEXT_PUBLIC_APP_URL=your-app-url
# Add other environment variables as needed
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.