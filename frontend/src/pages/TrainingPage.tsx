import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { GraduationCap, Briefcase, Building, Laptop, Users } from 'lucide-react';

export default function TrainingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const id = location.hash?.replace('#', '');
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  const go = (anchor: string) => {
    navigate(`/training#${anchor}`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100">
      <header className="bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Training</h1>
          <p className="mt-4 text-slate-600 leading-7 max-w-3xl">
            Outcome-focused programs for Students, Professionals, and Corporate teams. Learn with live sessions, practical labs, and expert mentorship.
          </p>
          <div className="mt-8 flex gap-3 flex-wrap">
            <Button variant="outline" onClick={() => go('students')}>Students</Button>
            <Button variant="outline" onClick={() => go('professionals')}>Professionals</Button>
            <Button variant="outline" onClick={() => go('corporate')}>Corporate</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 space-y-20">
        <section id="students" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="h-7 w-7 text-red-600" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Students Training</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-red-800 p-8  shadow-md hover:shadow-lg transition-shadow">
              <ul className="space-y-3 text-slate-700 leading-relaxed">
                <li>College & freshers ke liye job-oriented programs</li>
                <li>Strong theory + hands-on practical training</li>
                <li>Industry-ready skills development</li>
                <li>Career guidance & mentorship support</li>
              </ul>
              <div className="mt-8 flex gap-3">
                <Button onClick={() => navigate('/register')}>Enroll Now</Button>
                <Button variant="outline" onClick={() => navigate('/contact')}>Contact Us</Button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-red-800 p-8 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-slate-900 mb-4">Why choose us</h3>
              <p className="text-slate-700 leading-relaxed">
                Structured curriculum, real-world assignments, mock interviews, and placement support to launch your career with confidence.
              </p>
            </div>
          </div>
        </section>

        <section id="professionals" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <Briefcase className="h-7 w-7 text-red-600" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Professionals Training</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-red-800 p-8 shadow-md hover:shadow-lg transition-shadow">
              <ul className="space-y-3 text-slate-700 leading-relaxed">
                <li>Working professionals ke liye skill upgradation</li>
                <li>Latest tools & real-world use cases</li>
                <li>Weekend / flexible batch options</li>
                <li>Certification-oriented learning</li>
              </ul>
              <div className="mt-8 flex gap-3">
                <Button onClick={() => navigate('/register')}>Enroll Now</Button>
                <Button variant="outline" onClick={() => navigate('/contact')}>Contact Us</Button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-red-800 p-8 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-slate-900 mb-4">Advance your career</h3>
              <p className="text-slate-700 leading-relaxed">
                Role-based upskilling with projects, code reviews, and mentorship designed to accelerate growth and certifications.
              </p>
            </div>
          </div>
        </section>

        <section id="corporate" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <Building className="h-7 w-7 text-red-600" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Corporate Training</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-red-800 p-8 shadow-md hover:shadow-lg transition-shadow">
              <ul className="space-y-3 text-slate-700 leading-relaxed">
                <li>Companies ke liye customized corporate training</li>
                <li>Team productivity & technical expertise enhancement</li>
                <li>On-site / online corporate workshops</li>
                <li>Industry-standard curriculum & expert trainers</li>
              </ul>
              <div className="mt-8 flex gap-3">
                <Button onClick={() => navigate('/contact?type=corporate')}>Request Corporate Training</Button>
                <Button variant="outline" onClick={() => navigate('/contact')}>Contact Us</Button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-red-800 p-8 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-slate-900 mb-4">Business impact</h3>
              <p className="text-slate-700 leading-relaxed">
                Measurable outcomes through customized programs, assessments, and enablement plans aligned to your organization’s goals.
              </p>
            </div>
          </div>
        </section>

        <section id="modes" className="scroll-mt-24">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">Training Modes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div id="online" className="bg-white rounded-2xl border border-red-800 p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <Laptop className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-slate-900">Online Training</h3>
              </div>
              <ul className="space-y-2 text-slate-700 leading-relaxed">
                <li>Live instructor-led sessions</li>
                <li>Recorded sessions for revision</li>
                <li>Real-time doubt solving</li>
                <li>Accessible from anywhere</li>
              </ul>
            </div>
            <div id="offline" className="bg-white rounded-2xl border border-red-800 p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-slate-900">Offline Training</h3>
              </div>
              <ul className="space-y-2 text-slate-700 leading-relaxed">
                <li>Classroom-based practical learning</li>
                <li>Lab access & live projects</li>
                <li>Face-to-face interaction with trainers</li>
                <li>Better hands-on exposure</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="scroll-mt-24">
          <div className="bg-white rounded-2xl border border-red-800 p-8 shadow-md flex flex-wrap gap-4">
            <Button onClick={() => navigate('/register')}>Enroll Now</Button>
            <Button variant="outline" onClick={() => navigate('/contact?type=corporate')}>Request Corporate Training</Button>
            <Button variant="outline" onClick={() => navigate('/contact')}>Contact Us</Button>
          </div>
        </section>
      </main>
    </div>
  );
}
