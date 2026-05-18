import { websiteConfig } from "@/config/website-config";

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-16 pb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl text-center mb-8">
          About {websiteConfig.name}
        </h1>
        <div className="prose prose-lg dark:prose-invert mx-auto">
          <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            {websiteConfig.description}
          </p>
          <p>
            Welcome to {websiteConfig.name}, where we believe that student housing should be more than just a place to sleep. We&apos;ve created a vibrant community designed specifically for ambitious students who want the best environment to succeed academically and socially.
          </p>
          <h2 className="text-2xl font-bold mt-12 mb-4">Our Mission</h2>
          <p>
            To provide safe, comfortable, and inspiring living spaces that empower students to focus on their education while building lifelong friendships in a supportive community.
          </p>
          <h2 className="text-2xl font-bold mt-12 mb-4">Why Choose Us?</h2>
          <ul>
            <li><strong>Premium Facilities:</strong> From high-speed internet to 24/7 fitness centers, we&apos;ve got you covered.</li>
            <li><strong>Unmatched Security:</strong> Your safety is our top priority with biometric access and round-the-clock surveillance.</li>
            <li><strong>Vibrant Community:</strong> Regular events, study groups, and networking opportunities.</li>
            <li><strong>Transparent Pricing:</strong> No hidden fees. What you see is what you pay.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
