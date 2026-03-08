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

const TermsAndConditions = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Terms and Conditions</h1>
        <p className="text-sm text-gray-400 mb-8">Last Updated: March 3rd, 2026</p>

        <Section number="1" title="Acceptance of Terms">
          <p>
            By accessing or using the myTown Tutor platform ("Platform"), you agree to be bound by
            these Terms and Conditions ("Terms"). If you do not agree, you must not use the Platform.
          </p>
        </Section>

        <Section number="2" title="About the Platform">
          <p>
            myTown Tutor is an independent online marketplace platform operating in India that
            connects students and tutors.
          </p>
          <p>The Platform:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Provides a listing service for tutors.</Bullet>
            <Bullet>Allows students and tutors to connect directly.</Bullet>
            <Bullet>Does not provide tutoring services.</Bullet>
            <Bullet>Does not employ tutors.</Bullet>
            <Bullet>Does not supervise, manage, or control tutoring sessions (online or offline).</Bullet>
          </ul>
          <p className="mt-3">All tutoring services are provided independently by tutors.</p>
        </Section>

        <Section number="3" title="User Eligibility">
          <p>By using the Platform, users represent that all information provided is accurate and complete.</p>
          <p>The Platform is open to users of all age groups, including minors.</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Users under the age of 18 must use the Platform under the supervision of a parent or legal guardian.</Bullet>
            <Bullet>Parents or guardians are responsible for monitoring communications, arranging sessions, and evaluating tutor suitability.</Bullet>
            <Bullet>The Platform does not independently verify parental consent.</Bullet>
          </ul>
          <p className="mt-3">
            The Platform reserves the right to suspend or delete accounts involved in suspicious,
            unlawful, or mischievous activity.
          </p>
        </Section>

        <Section number="4" title="Accounts and Registration">
          <p>Users must:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Provide accurate and truthful information.</Bullet>
            <Bullet>Maintain confidentiality of their login credentials.</Bullet>
            <Bullet>Not create fake profiles.</Bullet>
            <Bullet>Not impersonate any individual or entity.</Bullet>
          </ul>
          <p className="mt-3">Users are fully responsible for all activity under their account.</p>
          <p>
            The Platform reserves the right to suspend, restrict, or terminate accounts at its sole
            discretion.
          </p>
        </Section>

        <Section number="5" title="Consent to Communications">
          <p>
            By creating an account or using the Platform, users consent to receive communications
            from myTown Tutor through email, phone calls, SMS, messaging applications, or platform
            notifications.
          </p>
          <p>Such communications may include:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Account verification messages</Bullet>
            <Bullet>Subscription confirmations</Bullet>
            <Bullet>Policy updates</Bullet>
            <Bullet>Safety notifications</Bullet>
            <Bullet>Administrative or service-related announcements</Bullet>
          </ul>
          <p className="mt-3">
            Users acknowledge that such communications are necessary for the operation of the Platform.
          </p>
          <p>
            Users are responsible for ensuring that their contact information remains accurate and
            up to date.
          </p>
          <p>
            The Platform shall not be responsible for any consequences arising from outdated or
            incorrect contact information provided by users.
          </p>
        </Section>

        <Section number="6" title="Tutor Responsibilities">
          <p>Tutors using the Platform agree that:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>They act as independent contractors and not employees, partners, or agents of the Platform.</Bullet>
            <Bullet>All information, qualifications, and experience provided are accurate and not misleading.</Bullet>
            <Bullet>They are solely responsible for their conduct, teaching methods, safety practices, and compliance with applicable laws.</Bullet>
            <Bullet>They are responsible for their own taxes and financial obligations.</Bullet>
          </ul>
          <p className="mt-3">
            The Platform does not verify identity, qualifications, or background of tutors. All
            tutor information is self-declared.
          </p>
          <p>Submission of false information may result in immediate termination of the account.</p>
        </Section>

        <Section number="7" title="Subscription Fees and Payments">
          <p>
            Tutors are required to pay a subscription fee of INR 99 for a period of six (6) months
            to list their profile on the Platform.
          </p>
          <p>This subscription fee:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Is solely a listing fee.</Bullet>
            <Bullet>Does not guarantee student leads.</Bullet>
            <Bullet>Does not guarantee bookings.</Bullet>
            <Bullet>Does not guarantee visibility ranking.</Bullet>
            <Bullet>Does not constitute payment for tutoring services.</Bullet>
          </ul>
          <p className="mt-3">
            Tutor listings will be activated only after payment confirmation by the Platform.
          </p>
          <p>The Platform reserves the right to modify subscription fees at any time.</p>
          <p>The Platform processes subscription payments directly.</p>
          <p>
            All payments between tutors and students for tutoring services are handled independently
            between them. The Platform is not involved in, and has no responsibility for, such
            financial transactions.
          </p>
          <p>
            The Platform is not responsible for any disputes regarding tutoring fees between tutors
            and students.
          </p>
        </Section>

        <Section number="8" title="Minor Users and Safety Disclaimer">
          <p>The Platform allows interaction between tutors and minors.</p>
          <p>Parents or guardians are solely responsible for:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Evaluating tutor suitability.</Bullet>
            <Bullet>Supervising communication.</Bullet>
            <Bullet>Arranging and monitoring sessions.</Bullet>
          </ul>
          <p className="mt-3">The Platform does not conduct background checks or safety screenings.</p>
          <p className="font-medium text-gray-700 mt-3">For in-person sessions:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>The Platform does not arrange, supervise, or monitor physical meetings.</Bullet>
            <Bullet>All offline sessions occur at the sole risk of the tutor and student/guardian.</Bullet>
            <Bullet>The Platform is not responsible for injury, misconduct, loss, or damages arising from offline meetings.</Bullet>
          </ul>
          <p className="font-medium text-gray-700 mt-3">For online sessions:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>The Platform is not responsible for recording, misuse of content, cyber misconduct, or technical issues.</Bullet>
          </ul>
          <p className="mt-3">Users are advised to exercise caution and reasonable judgment.</p>
        </Section>

        <Section number="9" title="User Conduct and Prohibited Activities">
          <p>Users must not:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Provide false or misleading information.</Bullet>
            <Bullet>Impersonate others.</Bullet>
            <Bullet>Harass, threaten, or abuse other users.</Bullet>
            <Bullet>Post illegal or inappropriate content.</Bullet>
            <Bullet>Circumvent subscription requirements.</Bullet>
            <Bullet>Attempt to hack, disrupt, or scrape data from the Platform.</Bullet>
            <Bullet>Upload malicious software or harmful code.</Bullet>
          </ul>
          <p className="mt-3">Violation may result in immediate termination.</p>
        </Section>

        <Section number="10" title="Intellectual Property">
          <p>
            All content on the Platform, including text, design, branding, logos, and database
            structure, is the intellectual property of myTown Tutor.
          </p>
          <p>
            Users may not copy, reproduce, distribute, or exploit any part of the Platform without
            prior written permission.
          </p>
          <p>
            By submitting profile content, users grant the Platform a non-exclusive license to
            display and use such content for operational purposes.
          </p>
        </Section>

        <Section number="11" title="Limitation of Liability">
          <p>The Platform is provided on an "as is" and "as available" basis.</p>
          <p>The Platform does not guarantee:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Accuracy of user information.</Bullet>
            <Bullet>Quality of tutoring services.</Bullet>
            <Bullet>Safety of interactions.</Bullet>
            <Bullet>Academic outcomes.</Bullet>
          </ul>
          <p className="mt-3">To the maximum extent permitted under the laws of India:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>The Platform shall not be liable for any direct, indirect, incidental, consequential, or special damages.</Bullet>
            <Bullet>The Platform's total liability shall not exceed the subscription fee paid by the user in the preceding six months.</Bullet>
          </ul>
        </Section>

        <Section number="12" title="Indemnification">
          <p>
            Users agree to indemnify and hold harmless myTown Tutor from any claims, damages,
            liabilities, or expenses arising from:
          </p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Their use of the Platform.</Bullet>
            <Bullet>Their conduct toward other users.</Bullet>
            <Bullet>Violation of these Terms.</Bullet>
            <Bullet>Submission of false or misleading information.</Bullet>
          </ul>
        </Section>

        <Section number="13" title="Dispute Resolution and Governing Law">
          <p>These Terms shall be governed by the laws of India.</p>
          <p>
            Any disputes arising out of or relating to the use of the Platform shall be subject to
            the exclusive jurisdiction of the courts located in India.
          </p>
        </Section>

        <Section number="14" title="Termination">
          <p>The Platform reserves the right to:</p>
          <ul className="space-y-1 mt-1 ml-2">
            <Bullet>Suspend or terminate accounts.</Bullet>
            <Bullet>Remove listings.</Bullet>
            <Bullet>Restrict access to services.</Bullet>
            <Bullet>Remove or modify any content or listing that violates these Terms or is deemed inappropriate at its sole discretion.</Bullet>
          </ul>
          <p className="mt-3">
            Termination does not entitle users to a refund of subscription fees except as stated in
            the Refund Policy.
          </p>
        </Section>

        <Section number="15" title="Force Majeure">
          <p>
            The Platform shall not be liable for failure or delay in performance due to events
            beyond reasonable control, including but not limited to natural disasters, technical
            failures, government actions, or internet disruptions.
          </p>
        </Section>

        <Section number="16" title="Changes to Terms">
          <p>The Platform reserves the right to modify these Terms at any time.</p>
          <p>
            Continued use of the Platform after updates constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section number="17" title="Privacy">
          <p>
            User data is handled in accordance with the Platform's separate{' '}
            <a href="/privacy-policy" className="text-primary hover:underline font-medium">Privacy Policy</a>.
          </p>
        </Section>

        <Section number="18" title="Contact Information">
          <p>For questions regarding these Terms, users may contact:</p>
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

export default TermsAndConditions;
