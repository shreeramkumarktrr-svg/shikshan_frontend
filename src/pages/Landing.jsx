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

  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import ContactModal from '../components/ContactModal';
import InteractiveParticles from '../components/InteractiveParticles';

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
      <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <AcademicCapIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Shikshan</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Home</a>
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Features</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">About</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Reviews</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <button
                onClick={() => setShowContactModal(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  School Management Truly
                  <span className="text-blue-600 block">Smart & Simplified</span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                  Designed for modern schools that value simplicity, efficiency, and progress.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold flex items-center justify-center transition-all transform hover:scale-105 shadow-lg"
                >
                  Request Demo →
                </button>
                <Link
                  to="/login"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Login to Your School →
                </Link>
              </div>

              <p className="text-sm text-gray-500 italic">
                Shape the future of learning with,<br />
                Smart management & Better education.
              </p>
            </div>

            {/* Interactive Particle System */}
            <div className="relative w-96 h-96 mx-auto">
              <InteractiveParticles />
            </div>
          </div>
        </div>


      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything Your School Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From student management to fee collection, Shikshan provides all the tools
              you need to run your school efficiently with modern design principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                    <feature.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Why Schools Choose Shikshan
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Join thousands of schools that have transformed their operations with our
                  comprehensive school management platform designed with purpose and precision.
                </p>
              </div>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  Start Your Journey →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <CloudIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">Cloud-Based</h3>
                  <p className="text-gray-600">Access from anywhere, anytime with enterprise-grade reliability</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">Secure</h3>
                  <p className="text-gray-600">Enterprise-grade security with data encryption</p>
                </div>
              </div>
              <div className="space-y-6 mt-8">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                    <DevicePhoneMobileIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">Mobile Ready</h3>
                  <p className="text-gray-600">Responsive design that works on all devices</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                    <PresentationChartLineIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">Analytics</h3>
                  <p className="text-gray-600">Data-driven insights for better decisions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Trusted by Educators Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our users have to say about their transformative experience with Shikshan's
              thoughtfully designed platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group relative bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="mb-6">
                    <div className="flex text-yellow-400 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed italic">"{testimonial.content}"</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                      <p className="text-blue-600 font-medium">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Transform Your School?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join thousands of schools already using Shikshan to streamline their operations
              and enhance educational outcomes with purposeful design.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => setShowContactModal(true)}
                className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-xl"
              >
                Get in Touch
              </button>
              <Link
                to="/login"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105"
              >
                Login to Your Account
              </Link>
            </div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-white opacity-10 rounded-full"></div>
        <div className="absolute top-1/2 right-20 w-8 h-8 bg-white opacity-10 rounded-full"></div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <AcademicCapIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold">Shikshan</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering schools with comprehensive management solutions designed with
                purpose and artistic touch for the digital age.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6 text-white">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Features</li>
                <li className="hover:text-white transition-colors cursor-pointer">Pricing</li>
                <li className="hover:text-white transition-colors cursor-pointer">Security</li>
                <li className="hover:text-white transition-colors cursor-pointer">Integrations</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6 text-white">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-white transition-colors cursor-pointer">Help Center</li>
                <li className="hover:text-white transition-colors cursor-pointer">Contact Us</li>
                <li className="hover:text-white transition-colors cursor-pointer">Training</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6 text-white">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">About Us</li>
                <li className="hover:text-white transition-colors cursor-pointer">Careers</li>
                <li className="hover:text-white transition-colors cursor-pointer">Blog</li>
                <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 Shikshan. All rights reserved. Crafted with purpose and passion.
            </p>
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