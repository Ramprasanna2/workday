import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  BarChart3, 
  Shield,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Zap,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-purple-600 text-primary-foreground">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl animate-spin slow"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl lg:text-7xl mb-8 font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent leading-tight">
                Modern Workforce Management
              </h1>
            </div>
            <div className="animate-fade-in-up delay-200">
              <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto opacity-90 leading-relaxed">
                Streamline your HR operations with our comprehensive workforce management platform. 
                From employee scheduling to payroll, we've got you covered.
              </p>
            </div>
            <div className="animate-fade-in-up delay-400 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90 hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl">
                <Link to="/products/workforce-management">
                  Explore Products
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" asChild className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl">
                <Link to="/login">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl mb-8 font-bold leading-tight">
              Everything You Need to Manage Your Workforce
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our platform provides all the tools you need to efficiently manage employees, 
              track time, and streamline HR processes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:scale-105 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white animate-fade-in-up">
              <CardHeader className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">Employee Management</CardTitle>
                  <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                    Comprehensive employee profiles, onboarding, and organizational charts with advanced analytics
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="group hover:scale-105 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white animate-fade-in-up delay-100">
              <CardHeader className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">Shift Scheduling</CardTitle>
                  <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                    Advanced scheduling tools with shift swapping, conflict detection, and automated notifications
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="group hover:scale-105 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white animate-fade-in-up delay-200">
              <CardHeader className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">Time Tracking</CardTitle>
                  <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                    Accurate clock-in/out system with real-time attendance monitoring and GPS verification
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="group hover:scale-105 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white animate-fade-in-up delay-300">
              <CardHeader className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">Leave Management</CardTitle>
                  <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                    Streamlined leave requests, approvals, balance tracking with automated workflows
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="group hover:scale-105 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white animate-fade-in-up delay-400">
              <CardHeader className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">Payroll Integration</CardTitle>
                  <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                    Automated payroll processing with detailed payslip generation and tax compliance
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="group hover:scale-105 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white animate-fade-in-up delay-500">
              <CardHeader className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">Role-based Access</CardTitle>
                  <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">
                    Secure access controls with customizable permissions and audit trails for compliance
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-r from-primary to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Industry Leaders</h2>
            <p className="text-xl opacity-90">Join thousands of companies streamlining their workforce management</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in-up">
              <div className="text-4xl md:text-5xl font-bold mb-2">50,000+</div>
              <div className="text-lg opacity-80">Employees Managed</div>
            </div>
            <div className="animate-fade-in-up delay-100">
              <div className="text-4xl md:text-5xl font-bold mb-2">99.9%</div>
              <div className="text-lg opacity-80">Uptime Guarantee</div>
            </div>
            <div className="animate-fade-in-up delay-200">
              <div className="text-4xl md:text-5xl font-bold mb-2">1,200+</div>
              <div className="text-lg opacity-80">Companies Trust Us</div>
            </div>
            <div className="animate-fade-in-up delay-300">
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-lg opacity-80">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl lg:text-5xl mb-8 font-bold">
                Why Choose WorkForce Pro?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Increase Productivity</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Automate manual processes and reduce administrative overhead by up to 70%
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Ensure Compliance</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Stay compliant with labor laws and regulations automatically with built-in compliance checks
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Real-time Insights</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Make data-driven decisions with comprehensive analytics and customizable dashboards
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Mobile Access</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Access everything from anywhere with our responsive design and native mobile apps
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="animate-fade-in-up delay-200">
              <div className="relative bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/5 rounded-3xl p-8 border border-primary/20 hover:border-primary/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-br from-primary to-purple-600 rounded-full opacity-20"></div>
                <div className="absolute bottom-4 left-4 w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-30"></div>
                
                <div className="text-center relative">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300">
                      <Star className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
                  <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                    Join thousands of companies already using WorkForce Pro to transform their workforce management
                  </p>
                  <Button size="lg" asChild className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <Link to="/login">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">No credit card required • 30-day free trial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  WorkForce Pro
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                The modern workforce management platform trusted by thousands of companies worldwide.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Products</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/products/workforce-management" className="text-gray-400 hover:text-white transition-colors">
                    Workforce Management
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Time Tracking
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Payroll System
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    HR Analytics
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Mobile App
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Partners
                  </a>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    System Status
                  </a>
                </li>
              </ul>
              
              <div className="mt-6 space-y-2">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">support@workforcepro.com</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">San Francisco, CA</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                © 2024 WorkForce Pro. All rights reserved.
              </div>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};