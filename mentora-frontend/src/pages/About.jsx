import React from 'react';

const values = [
  
  { icon: '⭐', label: 'Quality', desc: 'We connect you with experienced, verified professionals only.' },
  
  { icon: '🌍', label: 'Accessibility', desc: 'Mentorship should be affordable and available to everyone.' },
  { icon: '🤝', label: 'Community', desc: 'We foster a supportive community of tutors and students.' },
];

const steps = [
  { n: '1', title: 'Tutors Sign Up', desc: 'Experienced tutors join and create detailed profiles.' },
  { n: '2', title: 'Verification', desc: 'We review and approve tutors to ensure quality.' },
  { n: '3', title: 'Students Browse', desc: 'Students search and find tutors matching their needs.' },
  { n: '4', title: 'Connect', desc: 'Students reach out and connect directly with tutors.' },
];

const About = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">About us</h1>
      <p className="text-gray-500">myTown Tutor is a platform connecting students with independent tutors.</p>
    </div>

    {/* Mission & Vision */}
    <div className="grid md:grid-cols-2 gap-4">
      {[
        { title: 'Our Mission', icon: '', text: 'To make finding the right tutor simple, transparent, and accessible for every student, while giving educators a platform to showcase their skills and connect directly with learners. We aim to remove barriers in the learning process by creating a space where quality guidance is easy to discover and meaningful educational connections can grow.' },
        { title: 'What we are NOT', icon: '', text: 'MyTown Tutor is not a tutoring provider. We do not conduct classes, employ tutors, or guarantee academic outcomes. Our role is limited to providing a platform that connects students and tutors. We do not supervise, control, or take responsibility for the quality, safety, legality, or effectiveness of tutoring services offered by users. Any agreement, communication, scheduling, payment for tutoring sessions, or arrangement for online or in-person classes is made directly between the student and the tutor. Users are responsible for conducting their own due diligence before entering into any engagement.' },
      ].map(s => (
        <div key={s.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-2xl mb-3">{s.icon}</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{s.text}</p>
        </div>
      ))}
    </div>

    {/* Why we started */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-3">Why we Started myTown Tutor</h2>
      <p className="text-gray-600 text-sm leading-relaxed">
        We started MyTown Tutor to bridge that gap. Our goal is to create a centralised space with no middlemen, where students and tutors can connect directly, explore opportunities, and find the right fit without unnecessary complications. By simplifying the process, we aim to make quality learning more accessible and meaningful for everyone involved.
        </p>
    </div>

    {/* Values */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Our Values</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {values.map(v => (
          <div key={v.label} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
            <span className="text-2xl">{v.icon}</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{v.label}</p>
              <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* How it works */}
    
  </div>
);

export default About;
