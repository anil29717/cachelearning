import React, { useState } from 'react';
import { ChevronDown, Brain, Cloud, Shield, BarChart3, Wifi } from 'lucide-react';

type FAQItem = {
  q: string;
  a: string;
  category: 'AI' | 'Cloud' | 'Cyber Security' | 'Data Analytics & Ai' | 'Networking';
};
const faqs: FAQItem[] = [
  // AI
  {
    q: 'What is Artificial Intelligence and why learn it?',
    a: 'AI enables systems to perceive, learn, reason, and make decisions. Learning AI opens opportunities across industries and helps you build adaptive, scalable products.',
    category: 'AI',
  },
  {
    q: 'Which AI roles are in demand?',
    a: 'Machine Learning Engineer, Data Scientist, Research Scientist, AI Product Manager, NLP/Computer Vision Specialist, and MLOps Engineer are highly sought after.',
    category: 'AI',
  },
  {
    q: 'What skills should I build before starting AI?',
    a: 'Python/TypeScript, probability and linear algebra, data handling (Pandas/SQL), and familiarity with scikit-learn, PyTorch, or TensorFlow.',
    category: 'AI',
  },
  {
    q: 'How is Generative AI used in industry?',
    a: 'Content creation, code assist, customer support, summarization, personalization, and drafting complex documents. Responsible use requires guardrails and evaluation.',
    category: 'AI',
  },

  // Cloud
  {
    q: 'Why move workloads to the cloud?',
    a: 'Cloud offers elastic scaling, managed services, global reach, and pay-as-you-go pricing, reducing operational overhead and speeding up delivery.',
    category: 'Cloud',
  },
  {
    q: 'What should I learn first for cloud?',
    a: 'Start with core compute, storage, networking, and IAM. Then explore containers, serverless, databases, observability, and cost optimization.',
    category: 'Cloud',
  },
  {
    q: 'What are common cloud providers?',
    a: 'AWS, Azure, and Google Cloud dominate. Each offers robust services for compute, data, AI/ML, security, and developer tooling.',
    category: 'Cloud',
  },

  // Cyber Security
  {
    q: 'How do I start with Cyber Security?',
    a: 'Learn networking basics, operating systems, threat models, identity, encryption, and incident response. Practice with labs and CTFs.',
    category: 'Cyber Security',
  },
  {
    q: 'What are essential security practices in the cloud?',
    a: 'Least privilege IAM, zero-trust networking, encryption at rest/in transit, secrets management, patching, and continuous monitoring.',
    category: 'Cyber Security',
  },
  {
    q: 'Which common attacks should I understand?',
    a: 'Phishing, credential stuffing, SQL injection, XSS, ransomware, supply chain attacks, and misconfiguration exploits.',
    category: 'Cyber Security',
  },

  // Data Analytics & Ai
  {
    q: 'What is Data Analytics & AI in practice?',
    a: 'Collecting, cleaning, modeling, and visualizing data to drive decisions. AI augments analytics with predictive and generative capabilities.',
    category: 'Data Analytics & Ai',
  },
  {
    q: 'Which tools should I learn for analytics?',
    a: 'SQL, Python, Pandas, spreadsheets, BI tools (Power BI/Tableau), and data warehousing concepts. For ML: scikit-learn and PyTorch.',
    category: 'Data Analytics & Ai',
  },
  {
    q: 'How do dashboards become truly useful?',
    a: 'Focus on clear KPIs, timely refreshes, consistent definitions, and actionable insights with drill-downs and alerts.',
    category: 'Data Analytics & Ai',
  },

  // Networking
  {
    q: 'What networking concepts are foundational?',
    a: 'IP addressing, subnets, routing, DNS, load balancing, TLS, firewalls, VPNs, and software-defined networking in cloud environments.',
    category: 'Networking',
  },
  {
    q: 'How does networking differ in the cloud?',
    a: 'Virtual networks, security groups, managed load balancers, private links, service meshes, and policy-as-code replace traditional hardware.',
    category: 'Networking',
  },
  {
    q: 'How do I secure network traffic end-to-end?',
    a: 'Use TLS everywhere, segment networks, apply least privilege, monitor flows, and enforce compliance with infrastructure-as-code.',
    category: 'Networking',
  },
];

export function FAQSection() {
  const categories = ['All', 'AI', 'Cloud', 'Cyber Security', 'Data Analytics & Ai', 'Networking'] as const;
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[number]>('All');

  const filteredFAQs = faqs.filter(f => selectedCategory === 'All' || f.category === selectedCategory);
  // Limit to 6 FAQs when viewing "All" to keep the section concise
  const visibleFAQs = selectedCategory === 'All' ? faqs.slice(0, 6) : filteredFAQs;

  const categoryStyles: Record<FAQItem['category'], { border: string; badge: string; icon: React.ReactElement }> = {
    AI: {
      border: 'border-pink-200 hover:border-pink-300',
      badge: 'bg-pink-100 text-pink-700',
      icon: <Brain className="h-5 w-5 text-pink-600" />,
    },
    Cloud: {
      border: 'border-blue-200 hover:border-blue-300',
      badge: 'bg-blue-100 text-blue-700',
      icon: <Cloud className="h-5 w-5 text-blue-600" />,
    },
    'Cyber Security': {
      border: 'border-emerald-200 hover:border-emerald-300',
      badge: 'bg-emerald-100 text-emerald-700',
      icon: <Shield className="h-5 w-5 text-emerald-600" />,
    },
    'Data Analytics & Ai': {
      border: 'border-purple-200 hover:border-purple-300',
      badge: 'bg-purple-100 text-purple-700',
      icon: <BarChart3 className="h-5 w-5 text-purple-600" />,
    },
    Networking: {
      border: 'border-cyan-200 hover:border-cyan-300',
      badge: 'bg-cyan-100 text-cyan-700',
      icon: <Wifi className="h-5 w-5 text-cyan-600" />,
    },
  };

  return (
    <section aria-labelledby="faq-heading" className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 id="faq-heading" className="text-4xl font-extrabold tracking-tight text-blue-900">FAQs</h2>
          <p className="text-sm text-gray-500">Your questions about AI, Cloud, Security, Data, and Networking</p>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((cat, i) => (
            <button
              key={cat}
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm transition-all shadow-sm animate-fade-in ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleFAQs.map((item, idx) => {
            const styles = categoryStyles[item.category];
            return (
              <details
                key={idx}
                className={`group rounded-xl bg-blue-50/40 border ${styles.border} shadow-sm hover:shadow-md transition-shadow`}
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5">
                  <span className="flex items-center gap-3">
                    {styles.icon}
                    <span className="text-lg sm:text-xl font-semibold text-blue-900">{item.q}</span>
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles.badge}`}>{item.category}</span>
                  <ChevronDown className="h-5 w-5 text-blue-600 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-gray-700">
                  {item.a}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
