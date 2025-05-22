import type React from 'react';
// Replace the useTranslation import
// import { useTranslation } from 'react-i18next';

// Simple mock translation function
const mockTranslation = (key: string, defaultText: string) => defaultText;

const EmailSignupSection: React.FC = () => {
  // Replace the useTranslation hook
  // const { t } = useTranslation();
  const t = mockTranslation;

  // Rest of component remains the same
  return (
    <section className="bg-[#ffeb3b] py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:w-1/2 md:pr-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t('emailSignup.wantCheapEats', 'Want cheap eats 365 days a year?')}
            </h2>
            <p className="mt-2 text-lg text-gray-900">
              {t('emailSignup.getCalendar', 'Get our free food calendar and daily deals now!')}
            </p>
            <form className="mt-6 flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder={t('emailSignup.enterEmail', 'Enter your email')}
                className="px-4 py-3 flex-grow border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                required
              />
              <button
                type="submit"
                className="bg-[#982a4a] text-white px-6 py-3 rounded-md hover:bg-[#872341] transition-colors font-medium flex items-center justify-center"
              >
                {t('emailSignup.submit', 'Submit')}
              </button>
            </form>
            <p className="mt-3 text-xs text-gray-700">
              {t('emailSignup.privacyNotice', 'Will be used in accordance with our')}{' '}
              <a href="/privacy-policy" className="underline hover:text-[#982a4a]">
                {t('emailSignup.privacyPolicy', 'Privacy Policy')}
              </a>
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <img
              src="/images/deal1.jpg"
              alt={t('emailSignup.emailCtaGraphic', 'Email CTA Graphic')}
              className="max-w-full md:max-w-sm rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmailSignupSection;
