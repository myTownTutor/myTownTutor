import React from 'react';

const Section = ({ number, title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-gray-900 mb-3">{number}. {title}</h2>
    <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const Bullet = ({ children }) => (
  <li className="flex items-start gap-2">
    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Effective Date: March 3rd, 2026</p>

        <Section number="1" title="Introduction">
          <p>
            This Privacy Policy explains how myTown Tutor ("Platform") collects, uses, stores, and
            protects personal information of users in India.
          </p>
          <p>
            By accessing or using the Platform, you agree to the collection and use of information
            in accordance with this Privacy Policy.
          </p>
        </Section>

        <Section number="2" title="Information We Collect">
          <p className="font-semibold text-gray-700">2.1 Information Provided by Users</p>
          <p>When creating a Tutor account, users are required to provide:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Email address</Bullet>
            <Bullet>Name</Bullet>
            <Bullet>Surname</Bullet>
            <Bullet>Gender</Bullet>
            <Bullet>Age</Bullet>
          </ul>
          <p className="mt-3">Optional information that users may provide includes:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Profile picture</Bullet>
            <Bullet>City</Bullet>
            <Bullet>Subject(s) of interest</Bullet>
            <Bullet>Qualifications</Bullet>
            <Bullet>Expertise</Bullet>
            <Bullet>Experience</Bullet>
            <Bullet>Phone number</Bullet>
            <Bullet>Social media handles (e.g., Instagram, Facebook)</Bullet>
          </ul>
          <p className="mt-3">
            Tutors are required to pay a subscription fee before their account becomes publicly visible.
            Students must create an account (email, name, surname required) before contacting tutors.
          </p>

          <p className="font-semibold text-gray-700 mt-5">2.2 Payment Information</p>
          <p>Subscription payments are made via UPI or QR-based transfers.</p>
          <p>The Platform:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Does not collect or store bank account details.</Bullet>
            <Bullet>Does not collect debit/credit card numbers.</Bullet>
            <Bullet>Does not collect UPI PINs.</Bullet>
          </ul>
          <p className="mt-3">Payments are processed through the user's respective bank or UPI provider.</p>
          <p>The Platform may record limited transaction details such as:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Transaction ID</Bullet>
            <Bullet>Payment status</Bullet>
            <Bullet>Date and time of transaction</Bullet>
            <Bullet>Amount paid</Bullet>
          </ul>
          <p className="mt-3">
            The Platform is not responsible for payment failures, banking errors, or issues arising
            from the user's bank or UPI provider.
          </p>

          <p className="font-semibold text-gray-700 mt-5">2.3 Automatically Collected Information</p>
          <p>
            When users access the Platform, certain technical information may be collected
            automatically, including:
          </p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>IP address</Bullet>
            <Bullet>Browser type</Bullet>
            <Bullet>Device type</Bullet>
            <Bullet>Operating system</Bullet>
            <Bullet>Usage behaviour</Bullet>
            <Bullet>Cookies and analytics data</Bullet>
          </ul>
        </Section>

        <Section number="3" title="Use of Information">
          <p>The Platform uses collected information to:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Create and manage user accounts</Bullet>
            <Bullet>Enable communication between tutors and students</Bullet>
            <Bullet>Process subscription payments</Bullet>
            <Bullet>Improve Platform performance and functionality</Bullet>
            <Bullet>Monitor and prevent misuse or fraud</Bullet>
            <Bullet>Comply with legal obligations</Bullet>
          </ul>
        </Section>

        <Section number="4" title="Public Profile Information">
          <p>
            Tutors acknowledge that information they choose to publish on their profile may be
            visible to registered users of the Platform.
          </p>
          <p>Users are responsible for the content they choose to make publicly available.</p>
        </Section>

        <Section number="5" title="Communications Between Users">
          <p>
            The Platform may allow users to communicate through the Platform or independently through
            email, phone numbers, or social media accounts.
          </p>
          <p>
            The Platform is not responsible for privacy practices, content, or conduct once users
            choose to communicate outside the Platform.
          </p>
          <p>Users share personal contact information at their own discretion.</p>
        </Section>

        <Section number="6" title="Third-Party Services">
          <p>
            The Platform uses third-party service providers for hosting, domain services, analytics,
            and related infrastructure, including:
          </p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Hosting services (e.g., DigitalOcean)</Bullet>
            <Bullet>Domain services (e.g., GoDaddy)</Bullet>
            <Bullet>Analytics services (e.g., Google Analytics)</Bullet>
          </ul>
          <p className="mt-3">
            These third parties may collect technical data in accordance with their own privacy policies.
            The Platform does not control third-party data practices.
          </p>
        </Section>

        <Section number="7" title="Cookies and Analytics">
          <p>The Platform uses cookies and analytics tools to:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Analyse traffic and usage patterns</Bullet>
            <Bullet>Improve user experience</Bullet>
            <Bullet>Maintain platform functionality</Bullet>
          </ul>
          <p className="mt-3">
            Users may disable cookies through browser settings, though certain features may not
            function properly.
          </p>
        </Section>

        <Section number="8" title="Minor Users">
          <p>The Platform allows use by individuals under the age of 18.</p>
          <p>For minors:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Personal information must be submitted under the supervision of a parent or legal guardian.</Bullet>
            <Bullet>Parents or guardians are responsible for monitoring use of the Platform.</Bullet>
            <Bullet>Parents or guardians may contact the Platform to request access, correction, or deletion of a minor's data.</Bullet>
          </ul>
          <p className="mt-3">
            The Platform does not knowingly collect excessive personal information from minors.
          </p>
        </Section>

        <Section number="9" title="Data Retention">
          <p>Personal information is retained for as long as the user account remains active.</p>
          <p>
            Upon account deletion, personal data will be deleted within 90 days, except where
            retention is required for:
          </p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Legal compliance</Bullet>
            <Bullet>Accounting purposes</Bullet>
            <Bullet>Fraud prevention</Bullet>
            <Bullet>Dispute resolution</Bullet>
          </ul>
          <p className="mt-3">Limited transaction records may be retained where necessary.</p>
        </Section>

        <Section number="10" title="Data Security">
          <p>
            The Platform implements reasonable technical and administrative measures to protect user
            information.
          </p>
          <p>
            However, no online system can guarantee complete security. Users transmit information at
            their own risk.
          </p>
        </Section>

        <Section number="11" title="International or External Data Processing">
          <p>
            User data may be processed or stored on servers operated by third-party service providers.
            These servers may be located outside the user's state or country.
          </p>
          <p>
            By using the Platform, users consent to such data processing arrangements.
          </p>
        </Section>

        <Section number="12" title="User Rights">
          <p>Users may:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Request access to their personal data</Bullet>
            <Bullet>Request correction of inaccurate information</Bullet>
            <Bullet>Request deletion of their account and personal data</Bullet>
            <Bullet>Withdraw consent where applicable</Bullet>
          </ul>
          <p className="mt-3">Requests may be made via the contact details provided below.</p>
        </Section>

        <Section number="13" title="No Sale of Personal Information">
          <p>The Platform does not sell, rent, or trade user personal information.</p>
        </Section>

        <Section number="14" title="Changes to This Privacy Policy">
          <p>
            The Platform reserves the right to update this Privacy Policy at any time.
          </p>
          <p>
            Continued use of the Platform after updates constitutes acceptance of the revised policy.
          </p>
        </Section>

        <Section number="15" title="Contact Information">
          <p>For privacy-related inquiries or requests, contact:</p>
          <p className="mt-2">
            Email:{' '}
            <a href="mailto:mytowntutor@gmail.com" className="text-primary hover:underline font-medium">
              mytowntutor@gmail.com
            </a>
          </p>
        </Section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
