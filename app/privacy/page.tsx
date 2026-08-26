export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 sm:p-12">
      <div className="max-w-3xl mx-auto text-slate-300 space-y-5 [&>h1]:text-3xl [&>h1]:font-black [&>h1]:text-sky-400 [&>h1]:mb-8 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-10 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>p]:leading-relaxed">
        <h1 className="text-sky-400">Privacy Policy</h1>
        <p>At VoltPulse, the privacy of our visitors is of extreme importance to us. This privacy policy document outlines the types of personal information received and collected by our application and how it is used.</p>
        
        <h3>Log Files</h3>
        <p>Like many other Web sites, we make use of log files. The information inside the log files includes internet protocol (IP) addresses, type of browser, Internet Service Provider (ISP), date/time stamp, referring/exit pages, and number of clicks to analyze trends and administer the site.</p>
        
        <h3>Cookies and Web Beacons</h3>
        <p>We do use cookies to store information about visitors preferences, record user-specific information on which pages the user access or visit, and customize Web page content based on visitors browser type.</p>
        
        <h3>Google AdSense and the DoubleClick DART Cookie</h3>
        <ul>
          <li>Google, as a third-party vendor, uses cookies to serve ads on our site.</li>
          <li>Google's use of the DART cookie enables it to serve ads to users based on their visit to our site and other sites on the Internet.</li>
          <li>Users may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy.</li>
        </ul>
      </div>
    </main>
  );
}