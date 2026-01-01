export interface BlogPostData {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  date: string;
  content: string; // Full HTML/Markdown content
}

export const BLOG_POSTS: BlogPostData[] = [
  {
    id: 1,
    title: "The Hawthorne Effect: Why Being Watched Works",
    excerpt: "Studies show that individuals modify an aspect of their behavior in response to their awareness of being observed. Here's how to harness this for productivity.",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80",
    readTime: "5 min read",
    date: "Oct 12, 2023",
    content: `
      <p class="lead text-xl text-gray-600 mb-6">Ever noticed how you suddenly sit up straighter when your boss walks by? Or how you run a little faster on the treadmill when the person next to you is sprinting? That isn't just coincidence—it's science.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mb-4">What is the Hawthorne Effect?</h3>
      <p class="mb-4">The Hawthorne Effect refers to a type of reactivity in which individuals modify an aspect of their behavior in response to their awareness of being observed. The original study took place at Western Electric’s Hawthorne Works in Chicago during the 1920s. Researchers found that workers' productivity increased not because of changes in lighting or working hours, but simply because they were being watched by the researchers.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mb-4">Applying this to Modern Work</h3>
      <p class="mb-4">In the age of remote work, we've lost the natural accountability of the office environment. There's no one walking past your desk. No one knows if you're working on that spreadsheet or scrolling through TikTok.</p>
      <p class="mb-4">This isolation kills productivity. Without external observation, our brains default to the path of least resistance (usually procrastination).</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mb-4">How Accountable Uses This</h3>
      <p class="mb-4">Accountable artificially recreates the Hawthorne Effect. By scheduling a call with a real human, you create a tangible "observation event." You know someone is coming to check on you. That knowledge alone triggers the psychological shift necessary to focus.</p>
      <p>It’s not about fear; it’s about awareness. When you know you are accountable to another human being, your brain prioritizes the task at hand.</p>
    `
  },
  {
    id: 2,
    title: "Body Doubling: The ADHD Secret Weapon",
    excerpt: "Body doubling involves doing a task in the presence of another person. The other person acts as an anchor for your attention.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1651&q=80",
    readTime: "4 min read",
    date: "Sep 28, 2023",
    content: `
      <p class="lead text-xl text-gray-600 mb-6">For many people, especially those with ADHD, the hardest part of a task isn't doing it—it's starting it. Enter "Body Doubling," a technique that has taken the productivity world by storm.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mb-4">What is a Body Double?</h3>
      <p class="mb-4">A body double is simply another person who is present while you work. They don't need to help you with the work. They don't even need to talk to you. Their presence alone acts as an anchor for your attention.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mb-4">Why It Works</h3>
      <p class="mb-4">Neurologically, the presence of another person increases arousal in the brain. It provides a subtle social pressure that keeps you in the "working" mode. It serves as a physical reminder of what you are supposed to be doing.</p>
      
      <ul class="list-disc pl-5 mb-4 space-y-2">
        <li>It reduces the anxiety of starting a difficult task.</li>
        <li>It helps regulate executive function.</li>
        <li>It provides a "container" for the work session.</li>
      </ul>

      <h3 class="text-2xl font-bold text-gray-900 mb-4">Virtual Body Doubling</h3>
      <p>Accountable takes this concept and condenses it into high-stakes micro-interactions. While traditional body doubling might last for hours, our verification calls act as the "finish line" for your body doubling session. You work knowing that the session has a hard stop and a verification step.</p>
    `
  },
  {
    id: 3,
    title: "The Social Contract of Getting Things Done",
    excerpt: "Why promising a stranger you will finish a task is often more effective than promising yourself.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1663&q=80",
    readTime: "6 min read",
    date: "Sep 15, 2023",
    content: `
      <p class="lead text-xl text-gray-600 mb-6">We break promises to ourselves all the time. "I'll workout tomorrow." "I'll start writing at 9 AM." We forgive ourselves instantly. But breaking a promise to someone else? That stings.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mb-4">Social Pressure is a Tool</h3>
      <p class="mb-4">Humans are social creatures. We are wired to care what others think of us. We want to be seen as reliable, competent, and trustworthy. When we fail a task we promised to complete, we risk damaging that social image.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mb-4">The Stranger Effect</h3>
      <p class="mb-4">Interestingly, promising a friend can sometimes be less effective than promising a stranger (or a professional). Friends forgive us. They say, "It's okay, you were tired."</p>
      <p class="mb-4">A professional accountability partner doesn't offer that same emotional out. They are there for one purpose: to see if the job is done. This neutrality makes the social contract stronger.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mb-4">Commitment Devices</h3>
      <p>In behavioral economics, a "commitment device" is a choice you make in the present that restricts your set of choices in the future. Paying for Accountable is a financial commitment device. Scheduling the call is a social commitment device. Together, they create a powerful framework that makes doing the work the only logical option.</p>
    `
  }
];