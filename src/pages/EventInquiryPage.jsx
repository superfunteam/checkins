import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function EventInquiryPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.target);

    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });
      setIsSubmitted(true);
    } catch (error) {
      alert('There was an error submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4 landing-heading">Thank you!</h1>
          <p className="text-slate-600 mb-8">
            We've received your inquiry and will get back to you soon.
          </p>
          <Link to="/" className="landing-btn-primary">
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-lg">
        <div className="landing-container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 text-2xl font-bold text-slate-800 landing-heading">
            <svg width="48" height="48" viewBox="0 0 727 727" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 border-[1.5px] border-amber-500 rounded-xl">
              <rect width="727" height="727" fill="white"/>
              <rect width="727" height="727" fill="#FFD700" fillOpacity="0.3"/>
              <path d="M84 476.5C91.6 420.5 172.167 350.167 211.5 322L252.5 209L544.5 233L592.5 370.5L544.5 423.5L568.5 597L633.5 806.5L50 794.5C46 772.833 36.1 714.1 28.5 652.5C22.7095 605.567 57.5734 547.139 88.7303 507.382C83.4926 508.044 80.7783 500.239 84 476.5Z" fill="white"/>
              <path d="M418 100C509.127 100 583 173.873 583 265V340H580.462C568.698 283.021 490.82 239 396.5 239C308.408 239 234.657 277.399 215.718 328.892C144.71 303.044 94 234.945 94 155V100H418Z" fill="#FF0000"/>
              <circle cx="438" cy="354" r="40" fill="black"/>
              <rect x="446" y="503.919" width="270" height="60" transform="rotate(-45 446 503.919)" fill="#FFD700"/>
              <rect x="389.426" y="415" width="162.918" height="60" transform="rotate(45 389.426 415)" fill="#FFD700"/>
              <path d="M669.364 627.829C652.801 600.18 619.646 557.907 553.187 501.489C553.14 501.438 553.096 501.398 553.026 501.351C552.979 501.421 552.977 501.47 552.953 501.535C511.211 581.145 496.644 633.567 492.125 665.12C492.13 665.144 492.109 665.16 492.113 665.183C492.104 665.197 492.094 665.211 492.096 665.223C492.078 665.251 492.08 665.262 492.08 665.262C490.19 678.579 490.076 688.167 490.461 694.518C490.482 694.623 490.479 694.733 490.487 694.84C490.813 698.014 491.26 701.189 491.88 704.378C500.08 746.564 534.051 777.306 574.247 783.385C585.039 785.034 596.261 784.89 607.597 782.722L607.831 782.677C619.103 780.486 629.554 776.442 638.932 770.933C674.116 750.297 694.257 708.941 686.034 666.639C683.27 652.421 677.548 639.275 669.356 627.845L669.364 627.829Z" fill="#FF0000"/>
              <path d="M326.1 587.875C326.1 592.145 323.869 608.551 319.32 619.205C314.136 631.346 282.293 653.402 263.889 665.435C255.926 670.641 285.448 667.735 295.766 666.618C300.909 666.061 307.045 665.731 311.498 666.878C310.711 670.322 280.822 696.938 237.198 734.691C221.68 748.194 219.602 750.213 217.461 752.294" stroke="black" strokeOpacity="0.05" strokeWidth="20" strokeLinecap="round"/>
              <path d="M175.483 582.425C175.085 582.425 172.069 582.425 166.953 584.247C147.698 591.105 146.777 625.28 141.836 635.082C134.323 649.985 119.099 666.171 114.8 680.555C105.841 707.736 91.2261 749.683 90.2988 756.962C89.9835 760.882 89.9835 765.263 89.9835 769.776" stroke="black" strokeOpacity="0.05" strokeWidth="20" strokeLinecap="round"/>
            </svg>
            Checkins
          </Link>
        </div>
      </nav>

      {/* Form Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 landing-heading">
              Host an Event
            </h1>
            <p className="text-lg text-slate-600">
              Tell us about your upcoming event and we'll help you create an amazing check-in experience.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            name="event-inquiry"
            method="POST"
            data-netlify="true"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <input type="hidden" name="form-name" value="event-inquiry" />

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="jane@example.com"
              />
            </div>

            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-slate-700 mb-2">
                Organization (optional)
              </label>
              <input
                type="text"
                id="organization"
                name="organization"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Acme Corp"
              />
            </div>

            <div>
              <label htmlFor="event-type" className="block text-sm font-medium text-slate-700 mb-2">
                Event Type
              </label>
              <select
                id="event-type"
                name="event-type"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white"
              >
                <option value="">Select an option...</option>
                <option value="corporate">Corporate Event</option>
                <option value="conference">Conference</option>
                <option value="party">Party / Celebration</option>
                <option value="nonprofit">Non-profit Event</option>
                <option value="wedding">Wedding</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="event-date" className="block text-sm font-medium text-slate-700 mb-2">
                Approximate Event Date
              </label>
              <input
                type="text"
                id="event-date"
                name="event-date"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="March 2026"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                Tell us about your event
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                placeholder="What kind of check-in experience are you looking for? How many attendees do you expect?"
              />
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-slate-700 mb-2">
                Budget Range
              </label>
              <select
                id="budget"
                name="budget"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white"
              >
                <option value="">Select an option...</option>
                <option value="free">Free (DIY)</option>
                <option value="pro">Pro ($399)</option>
                <option value="vip">VIP ($1,499)</option>
                <option value="nonprofit">Certified Non-profit</option>
                <option value="unsure">Not sure yet</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full landing-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Inquiry'}
            </button>
          </motion.form>

          <p className="text-center text-sm text-slate-500 mt-8">
            We typically respond within 24 hours.
          </p>
        </div>
      </section>
    </div>
  );
}
