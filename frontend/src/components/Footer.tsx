import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Youtube, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white text-gray-700 border-t border-red-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-red-600 inline-flex items-center justify-center text-white font-bold">C</span>
              <span className="text-lg font-semibold text-gray-900">Cache Learning</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 max-w-md">
              Learn Modern Skills to level up your career. Courses by Expert , Build for Real-World Impact.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a aria-label="LinkedIn" href="#" className="h-8 w-8 rounded-full border border-red-200 bg-white hover:bg-red-600 flex items-center justify-center text-red-600 hover:text-white transition">
                <Linkedin className="h-4 w-4" />
              </a>
              <a aria-label="YouTube" href="#" className="h-8 w-8 rounded-full border border-red-200 bg-white hover:bg-red-600 flex items-center justify-center text-red-600 hover:text-white transition">
                <Youtube className="h-4 w-4" />
              </a>
              <a aria-label="Twitter" href="#" className="h-8 w-8 rounded-full border border-red-200 bg-white hover:bg-red-600 flex items-center justify-center text-red-600 hover:text-white transition">
                <Twitter className="h-4 w-4" />
              </a>
              <a aria-label="Instagram" href="#" className="h-8 w-8 rounded-full border border-red-200 bg-white hover:bg-red-600 flex items-center justify-center text-red-600 hover:text-white transition">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-600">Courses</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/courses" className="text-gray-600 hover:text-red-700 transition">All Courses</Link></li>
              <li><Link to="/courses/cloud" className="text-gray-600 hover:text-red-700 transition">Cloud</Link></li>
              <li><Link to="/courses/cyber-security" className="text-gray-600 hover:text-red-700 transition">Cyber Security</Link></li>
              <li><Link to="/courses/data-analytics-ai" className="text-gray-600 hover:text-red-700 transition">Data Analytics & AI</Link></li>
              <li><Link to="/courses/networking" className="text-gray-600 hover:text-red-700 transition">Networking</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-600">Company</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-600 hover:text-red-700 transition">About</Link></li>
              <li><Link to="/careers" className="text-gray-600 hover:text-red-700 transition">Careers</Link></li>
              <li><Link to="/blog" className="text-gray-600 hover:text-red-700 transition">Blog</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-red-700 transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-600">Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/help" className="text-gray-600 hover:text-red-700 transition">Help Center</Link></li>
              <li><Link to="/faq" className="text-gray-600 hover:text-red-700 transition">FAQs</Link></li>
              <li><Link to="/pricing" className="text-gray-600 hover:text-red-700 transition">Pricing</Link></li>
              <li><Link to="/refunds" className="text-gray-600 hover:text-red-700 transition">Refund Policy</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold text-red-600">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3 text-gray-600">
                <MapPin className="h-4 w-4 text-red-600" />
                <span>CRC2 Building, Ground Floor, Sultanpur, New Delhi, 110023</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <Phone className="h-4 w-4 text-red-600" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <Mail className="h-4 w-4 text-red-600" />
                <span>support@cachelearning.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-red-100 pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <p className="text-sm text-gray-600">© {year} Cache Learning. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-gray-600 hover:text-red-700 transition">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-600 hover:text-red-700 transition">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
