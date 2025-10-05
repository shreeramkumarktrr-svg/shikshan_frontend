import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  SpeakerWaveIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  CloudIcon,
  DevicePhoneMobileIcon,
  CheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import ContactModal from '../components/ContactModal';

const Landing = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const features = [
    {
      icon: UserGroupIcon,
      title: 'User Management',
      description: 'Comprehensive management of students, teachers, parents, and staff with role-based access control.'
    },
    {
      icon: AcademicCapIcon,
      title: 'Academic Management',
      description: 'Manage classes, subjects, timetables, and academic calendar with ease.'
    },
    {
      icon: ClipboardDocumentListIcon,
      title: 'Attendance Tracking',
      description: 'Digital attendance system with real-time tracking and automated notifications.'
    },
    {
      icon: CalendarIcon,
      title: 'Homework Management',
      description: 'Assign, track, and grade homework with digital submission and feedback system.'
    },
    {
      icon: SpeakerWaveIcon,
      title: 'Communication Hub',
      description: 'Seamless communication between teachers, students, and parents through events and announcements.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Fee Management',
      description: 'Automated fee collection, payment tracking, and financial reporting.'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Reports',
      description: 'Comprehensive reporting and analytics for data-driven decision making.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Security & Privacy',
      description: 'Enterprise-grade security with data encryption and privacy compliance.'
    }
  ];

  const benefits = [
    'Reduce administrative workload by 70%',
    'Improve parent-teacher communication',
    'Real-time student progress tracking',
    'Automated fee collection and reminders',
    'Digital attendance and homework management',
    'Comprehensive reporting and analytics'
  ];

  const testimonials = [
    {
      name: 'Dr. Priya Sharma',
      role: 'Principal, Greenwood International School',
      content: 'Shikshan has transformed our school operations. The digital transformation has made everything more efficient and transparent.',
      avatar: '👩‍🏫'
    },
    {
      name: 'Rajesh Kumar',
      role: 'Parent',
      content: 'I love how I can track my child\'s progress, homework, and communicate with teachers all in one place.',
      avatar: '👨‍💼'
    },
    {
      name: 'Sarah Johnson',
      role: 'Mathematics Teacher',
      content: 'The homework management system has made my life so much easier. Students submit work digitally and I can provide instant feedback.',
      avatar: '👩‍🏫'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container-responsive">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <AcademicCapIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span className="ml-2 text-lg sm:text-2xl font-bold text-gray-900">Shikshan</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-2 py-2 sm:px-3 rounded-md text-sm font-medium touch-target"
              >
                Login
              </Link>
              <button
                onClick={() => setShowContactModal(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 sm:px-4 rounded-md text-sm font-medium touch-target"
              >
                Get in Touch
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 sm:py-20">
        <div className="container-responsive">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Transform Your School with
              <span className="text-blue-600 block mt-2">Digital Excellence</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 sm:px-0">
              Shikshan is a comprehensive school management platform that streamlines operations, 
              enhances communication, and empowers educational excellence through technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <button
                onClick={() => setShowContactModal(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold flex items-center justify-center touch-target transition-colors"
              >
                Get in Touch
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </button>
              <Link
                to="/login"
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold touch-target transition-colors"
              >
                Login to Your School
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="container-responsive">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything Your School Needs
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              From student management to fee collection, Shikshan provides all the tools 
              you need to run your school efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-4 sm:p-6 rounded-lg hover:shadow-lg transition-shadow bg-gray-50 sm:bg-white">
                <feature.icon className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Schools Choose Shikshan
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of schools that have transformed their operations with our 
                comprehensive school management platform.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckIcon className="h-6 w-6 text-green-500 mr-3" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <CloudIcon className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Cloud-Based</h3>
                <p className="text-sm text-gray-600">Access from anywhere, anytime</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <DevicePhoneMobileIcon className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Mobile Ready</h3>
                <p className="text-sm text-gray-600">Works on all devices</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <ShieldCheckIcon className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
                <p className="text-sm text-gray-600">Enterprise-grade security</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <ChartBarIcon className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                <p className="text-sm text-gray-600">Data-driven insights</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Educators Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say about their experience with Shikshan
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{testimonial.avatar}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of schools already using Shikshan to streamline their operations 
            and enhance educational outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowContactModal(true)}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold"
            >
              Get in Touch
            </button>
            <Link
              to="/login"
              className="border border-white text-white hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-semibold"
            >
              Login to Your Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <AcademicCapIcon className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">Shikshan</span>
              </div>
              <p className="text-gray-400">
                Empowering schools with comprehensive management solutions for the digital age.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>Integrations</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Training</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Shikshan. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)} 
      />
    </div>
  );
};

export default Landing;