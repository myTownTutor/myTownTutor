import React from 'react';

const values = [
  { icon: '🔒', label: 'Trust', desc: 'We verify all mentors and maintain a safe, trusted platform.' },
  { icon: '⭐', label: 'Quality', desc: 'We connect you with experienced, verified professionals only.' },
  { icon: '🚀', label: 'Growth', desc: 'We believe in continuous learning and professional development.' },
  { icon: '🌍', label: 'Accessibility', desc: 'Mentorship should be affordable and available to everyone.' },
  { icon: '🤝', label: 'Community', desc: 'We foster a supportive community of mentors and students.' },
];

const steps = [
  { n: '1', title: 'Mentors Sign Up', desc: 'Experienced professionals join and create detailed profiles.' },
  { n: '2', title: 'Verification', desc: 'We review and approve mentors to ensure quality.' },
  { n: '3', title: 'Students Browse', desc: 'Students search and find mentors matching their needs.' },
  { n: '4', title: 'Connect', desc: 'Students reach out and connect directly with mentors.' },
];

const About = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">About</h1>
      <p className="text-gray-500">Connecting talented individuals with industry experts</p>
    </div>

    {/* Mission & Vision */}
    <div className="grid md:grid-cols-2 gap-4">
      {[
        { title: 'Our Mission', icon: '🎯', text: 'At MytownTutor, our mission is to democratize quality mentorship. We believe every person deserves access to guidance from experienced professionals to achieve their goals and full potential.' },
        { title: 'Our Vision', icon: '👁️', text: 'A world where meaningful mentorship relationships are accessible to everyone, enabling individuals to learn, grow, and succeed in their careers.' },
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
      <h2 className="text-lg font-bold text-gray-900 mb-3">Why We Started MytownTutor</h2>
      <p className="text-gray-600 text-sm leading-relaxed">
        Finding the right tutor can be difficult and time-consuming. Too many talented individuals struggle to find guidance, and many experienced professionals want to give back but don't have a structured way to do so. MytownTutor bridges this gap by creating a trusted platform where tutors and students can connect and grow together.
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">How It Works</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {steps.map(s => (
          <div key={s.n} className="text-center">
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">{s.n}</div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1">{s.title}</h3>
            <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default About;
