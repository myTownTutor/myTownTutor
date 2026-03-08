import React from 'react';

const Bullet = ({ children }) => (
  <li className="flex items-start gap-2">
    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

const RefundPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Cancellation and Refund Policy</h1>

        <div className="text-gray-600 text-sm leading-relaxed">
          <ul className="space-y-4">
            <Bullet>
              The subscription fee is <span className="font-semibold text-gray-800">non-refundable</span>.
            </Bullet>
            <Bullet>
              Refunds will only be issued in cases of verified duplicate or excess payment and will
              be processed within <span className="font-semibold text-gray-800">2–3 business days</span> after review.
            </Bullet>
            <Bullet>
              The Platform shall not be responsible for payments made to an incorrect UPI ID or QR
              code due to user error. Users are solely responsible for verifying payment details
              before completing any transaction. Such payments shall not be eligible for refund.
            </Bullet>
            <Bullet>
              No refunds will be issued for dissatisfaction, lack of student contact, or inactivity.
            </Bullet>
          </ul>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm">
              For payment-related queries, contact:{' '}
              <a href="mailto:mytowntutor@gmail.com" className="text-primary hover:underline font-medium">
                mytowntutor@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
