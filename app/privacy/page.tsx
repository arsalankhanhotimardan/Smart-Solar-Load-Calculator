import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Smart Solar Load Calculator',
  description: 'Privacy Policy and Google AdSense cookie disclosures for VoltPulse Green Energy.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 sm:p-12">
      {/* Your original brilliant Tailwind wrapper, updated with link styles */}
      <div className="max-w-3xl mx-auto text-slate-300 space-y-5 [&>h1]:text-3xl [&>h1]:font-black [&>h1]:text-sky-400 [&>h1]:mb-8 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-10 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>p]:leading-relaxed [&>p>a]:text-sky-400 [&>p>a]:hover:underline [&>ul>li>a]:text-sky-400 [&>ul>li>a]:hover:underline">
        
        <h1>Privacy Policy</h1>
        <p className="text-sky-400 font-medium pb-4 border-b border-slate-800">Effective Date: August 26, 2026</p>

        <p>At VoltPulse Green Energy, accessible from our Smart Solar Load Calculator, one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information that is collected and recorded by VoltPulse and how we use it.</p>
        
        <h3>1. Information We Collect</h3>
        <p>Our calculator operates primarily in your browser. We do not require you to create an account or provide personally identifiable information (such as your name, email address, or phone number) to use the core engineering tool.</p>
        
        <h3>2. Google AdSense and Advertising Cookies</h3>
        <p>We use Google AdSense to display advertisements, which helps keep this engineering tool free for all users. AdSense relies on cookies to operate properly:</p>
        <ul>
          <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.</li>
          <li>Google's use of advertising cookies enables it and its partners to serve targeted ads to our users based on their visits to our site and/or other sites on the Internet.</li>
          <li>Users may opt out of personalized advertising at any time by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</li>
          <li>Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://aboutads.info" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.</li>
        </ul>
        
        <h3>3. Log Files</h3>
        <p>VoltPulse follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.</p>
        
        <h3>4. Consent</h3>
        <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>

      </div>
    </main>
  );
}