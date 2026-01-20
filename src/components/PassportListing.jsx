import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loadPassportIndex } from '../utils/passportLoader';

export default function PassportListing() {
  const [index, setIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update document meta for events listing
  useEffect(() => {
    document.title = 'Events - Checkins';

    const setMeta = (selector, content) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute('content', content);
    };

    const description = 'Browse available passport check-in experiences. Choose your adventure and start collecting badges.';
    setMeta('meta[name="description"]', description);
    setMeta('meta[name="title"]', 'Events - Checkins');
    setMeta('meta[property="og:title"]', 'Events - Checkins');
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[name="twitter:title"]', 'Events - Checkins');
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="theme-color"]', '#3B82F6');
  }, []);

  useEffect(() => {
    loadPassportIndex()
      .then(setIndex)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Failed to load passports</h1>
          <p className="text-slate-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const enabledPassports = index.passports.filter(p => p.enabled);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.header
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Passport Check-ins
          </h1>
          <p className="text-lg text-slate-600">
            Choose your adventure
          </p>
        </motion.header>

        {/* Passport Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {enabledPassports.map((passport, i) => (
            <motion.div
              key={passport.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Link
                to={passport.path}
                className="block group"
              >
                <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 group-hover:border-blue-300 group-hover:-translate-y-1">
                  {/* Card Header with Gradient */}
                  <div
                    className="h-24 flex items-center justify-center"
                    style={{
                      background: passport.id === 'shire'
                        ? 'linear-gradient(135deg, #4a6741 0%, #6b8f5e 100%)'
                        : 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'
                    }}
                  >
                    <span className="text-4xl">
                      {passport.id === 'shire' ? '🧙‍♂️' : '🎯'}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-xl font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {passport.name}
                      </h2>
                      {passport.default && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm mb-4">
                      {passport.description}
                    </p>
                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                      <span>Open Passport</span>
                      <svg
                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.footer
          className="text-center mt-12 text-slate-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>Powered by Passport Check-ins</p>
        </motion.footer>
      </div>
    </div>
  );
}
