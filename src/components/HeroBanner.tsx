import type React from 'react';

const HeroBanner: React.FC = () => {
  return (
    <section className="bg-gradient-to-tr from-[#f6cf13] to-[#ffd863] relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots pattern-yellow-500 pattern-bg-transparent pattern-size-6 opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
            Discover Amazing Deals & Save Big
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-gray-800">
            Your one-stop destination for the best coupons, deals, and money-saving tips
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white transition-colors duration-200 shadow-md">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900">Daily Deals</h2>
            <p className="mb-4 text-gray-700">Exclusive offers updated every day</p>
            <a
              href="/deals"
              className="inline-block bg-primary text-white font-medium py-2 px-4 rounded-full hover:bg-primary/90 transition-colors duration-200"
            >
              View Deals
            </a>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white transition-colors duration-200 shadow-md">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900">Coupons</h2>
            <p className="mb-4 text-gray-700">Save with printable & digital coupons</p>
            <a
              href="/coupons"
              className="inline-block bg-primary text-white font-medium py-2 px-4 rounded-full hover:bg-primary/90 transition-colors duration-200"
            >
              Get Coupons
            </a>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white transition-colors duration-200 shadow-md">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900">Savings Tips</h2>
            <p className="mb-4 text-gray-700">Expert advice to maximize your savings</p>
            <a
              href="/tips"
              className="inline-block bg-primary text-white font-medium py-2 px-4 rounded-full hover:bg-primary/90 transition-colors duration-200"
            >
              Read Tips
            </a>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-md">
          <div className="flex flex-col sm:flex-row items-center">
            <p className="text-lg font-bold sm:w-1/5 text-center sm:text-left mb-3 sm:mb-0">Popular Stores:</p>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start sm:w-4/5">
              {[
                { name: 'Amazon', href: '/coupons-for/amazon' },
                { name: 'Target', href: '/coupons-for/target' },
                { name: 'Walmart', href: '/coupons-for/walmart' },
                { name: 'CVS', href: '/coupons-for/cvs' },
                { name: 'Walgreens', href: '/coupons-for/walgreens' }
              ].map((store) => (
                <a
                  key={store.name}
                  href={store.href}
                  className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <span className="font-medium text-primary">{store.name}</span>
                </a>
              ))}
              <a
                href="/stores"
                className="text-primary font-medium flex items-center hover:underline"
              >
                View All
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
