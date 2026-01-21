import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy - Checkins';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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

      {/* Content */}
      <article className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto prose prose-slate">
          <h1 className="landing-heading">Privacy Policy</h1>
          <p className="text-slate-500">Last updated: January 2026</p>

          <h2>Overview</h2>
          <p>
            Checkins ("we", "our", "the Service") is committed to protecting your privacy.
            This policy explains what information we collect and how we use it.
          </p>

          <h2>Information We Collect</h2>

          <h3>Information You Provide</h3>
          <ul>
            <li><strong>Name:</strong> When you use a passport, you may enter your name to personalize the experience</li>
            <li><strong>Badge Progress:</strong> Your badge collection progress is stored locally on your device</li>
            <li><strong>Contact Information:</strong> If you contact us or submit an inquiry, we collect your name and email</li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <ul>
            <li><strong>Usage Data:</strong> We may collect anonymous usage statistics to improve the Service</li>
            <li><strong>Device Information:</strong> Browser type and version for compatibility purposes</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain the Service</li>
            <li>To personalize your passport experience</li>
            <li>To respond to your inquiries</li>
            <li>To improve the Service</li>
          </ul>

          <h2>Data Storage</h2>
          <p>
            Your badge progress and name are stored locally in your browser's localStorage.
            This data never leaves your device unless you choose to share it.
            We do not have access to this locally stored data.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            We may use third-party services for hosting and analytics.
            These services have their own privacy policies.
          </p>

          <h2>Data Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to others.
            We may share information only:
          </p>
          <ul>
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights or safety</li>
          </ul>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Clear your locally stored data at any time (via browser settings or the app's reset function)</li>
            <li>Request information about data we have collected</li>
            <li>Request deletion of your data</li>
          </ul>

          <h2>Children's Privacy</h2>
          <p>
            The Service is not intended for children under 13.
            We do not knowingly collect information from children under 13.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time.
            We will notify you of any changes by posting the new policy on this page.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at{' '}
            <a href="mailto:clark@superfun.team" className="text-red-600 hover:text-red-700">clark@superfun.team</a>.
          </p>
        </div>
      </article>

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Checkins. All rights reserved.</p>
          <div className="mt-4 flex justify-center gap-6">
            <Link to="/terms" className="hover:text-slate-700 transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-slate-700 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
