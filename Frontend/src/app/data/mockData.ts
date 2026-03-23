export const WORKER_PROFILE = {
  name: 'GON',
  avatar:
    'Frontend/Public/HXH.png',
  bio: 'UI/UX Designer & Frontend Developer with 5+ years of experience crafting beautiful digital products.',
  tasksCompleted: 34,
  portfolioCount: 8,
  role: 'worker' as const,
  skills: ['UI/UX Design', 'React', 'Figma', 'Branding', 'CSS'],
};

export const EMPLOYER_PROFILE = {
  name: 'LEOREO',
  avatar:
    'Frontend/Public/HXH.png',
  bio: 'Startup founder building tools for creative professionals. Always looking for talented freelancers.',
  tasksPosted: 12,
  activeTasksCount: 5,
  role: 'employer' as const,
  company: 'Carter & Co.',
};

export const TASKS = [
  {
    id: '1',
    title: 'Design a Landing Page',
    description:
      'Create a modern landing page for a SaaS product. Must include hero, features, pricing, and CTA sections with mobile-responsive layouts.',
    poster: 'LEOREO',
    posterAvatar:
      'Frontend/Public/HXH.png',
    category: 'Design',
    status: 'Open',
    dueDate: '2026-03-28',
    completion: 0,
    worker: null,
  },
  {
    id: '2',
    title: 'Build REST API',
    description:
      'Develop a RESTful API with Node.js and Express for a task management system. Include full auth endpoints and documentation.',
    poster: 'Alice Wang',
    posterAvatar:
      'Frontend/Public/HXH.png',
    category: 'Development',
    status: 'In Progress',
    dueDate: '2026-04-05',
    completion: 60,
    worker: 'GON',
  },
  {
    id: '3',
    title: 'Logo Branding Package',
    description:
      'Create a complete branding kit: primary logo, variants, color palette, and a comprehensive typography guide.',
    poster: 'LEOREO',
    posterAvatar:
      'Frontend/Public/HXH.png',
    category: 'Branding',
    status: 'Open',
    dueDate: '2026-03-30',
    completion: 0,
    worker: null,
  },
  {
    id: '4',
    title: 'Social Media Content Pack',
    description:
      'Design 20 social media templates for Instagram, Twitter, and LinkedIn in Canva or Figma format.',
    poster: 'Emily Ross',
    posterAvatar:
      'Frontend/Public/HXH.png',
    category: 'Marketing',
    status: 'Completed',
    dueDate: '2026-03-10',
    completion: 100,
    worker: 'GON',
  },
  {
    id: '5',
    title: 'Mobile App UI Design',
    description:
      'Design high-fidelity screens for a fitness tracking mobile app. Deliverable: Figma file with all screens and a prototype.',
    poster: 'LEOREO',
    posterAvatar:
      'Frontend/Public/HXH.png',
    category: 'Design',
    status: 'In Progress',
    dueDate: '2026-04-12',
    completion: 40,
    worker: 'GON',
  },
  {
    id: '6',
    title: 'Write Product Copy',
    description:
      'Write compelling product descriptions, taglines, and homepage copy for an e-commerce store. SEO-optimised content.',
    poster: 'Tom Bauer',
    posterAvatar:
      'Frontend/Public/HXH.png',
    category: 'Copywriting',
    status: 'Open',
    dueDate: '2026-03-25',
    completion: 0,
    worker: null,
  },
];

export const PORTFOLIO_ITEMS = [
  {
    id: '1',
    title: 'E-commerce Redesign',
    description:
      'Full UI overhaul for a fashion e-commerce platform, improving conversion rates by 40%.',
    thumbnail:
      'Frontend/Public/HXH.png',
    link: 'https://example.com',
    createdDate: '2026-01-15',
    category: 'Design',
  },
  {
    id: '2',
    title: 'Mobile App UI',
    description:
      'Complete Figma prototype for a fitness tracking iOS app with 30+ screens and micro-interactions.',
    thumbnail:
      'Frontend/Public/HXH.png',
    link: 'https://example.com',
    createdDate: '2026-02-03',
    category: 'Design',
  },
  {
    id: '3',
    title: 'Brand Identity – Orchard Co.',
    description:
      'Full branding package including logo system, color palette, and comprehensive typography guide.',
    thumbnail:
      'Frontend/Public/HXH.png',
    link: 'https://example.com',
    createdDate: '2025-12-20',
    category: 'Branding',
  },
  {
    id: '4',
    title: 'Photography Portfolio Site',
    description:
      'Minimalist portfolio website designed and built for a documentary photographer.',
    thumbnail:
      'Frontend/Public/HXH.png',
    link: 'https://example.com',
    createdDate: '2025-11-10',
    category: 'Web Design',
  },
];

export const FEED_POSTS = [
  {
    id: '1',
    author: 'GON',
    authorAvatar:
      'Frontend/Public/HXH.png',
    role: 'worker',
    content:
      'Just wrapped up an exciting landing page project! The client wanted something fresh and modern – really happy with how it turned out. Check it out!',
    media:
      'Frontend/Public/HXH.png',
    likes: 24,
    comments: 6,
    timestamp: '2 hours ago',
    liked: false,
  },
  {
    id: '2',
    author: 'LEOREO',
    authorAvatar:
      'Frontend/Public/HXH.png',
    role: 'employer',
    content:
      'Looking for a talented developer to help build our next product. Check out the Task Marketplace for our latest posting – exciting project with great pay!',
    media: null,
    likes: 11,
    comments: 3,
    timestamp: '5 hours ago',
    liked: true,
  },
  {
    id: '3',
    author: 'Emily Ross',
    authorAvatar:
      'Frontend/Public/HXH.png',
    role: 'worker',
    content:
      'Working on a mobile app UI late into the night! The grind is real but the results are worth it. Prototyping some really cool interactions right now.',
    media:
      'Frontend/Public/HXH.png',
    likes: 38,
    comments: 12,
    timestamp: '1 day ago',
    liked: false,
  },
  {
    id: '4',
    author: 'Tom Bauer',
    authorAvatar:
      'Frontend/Public/HXH.png',
    role: 'employer',
    content:
      'We just wrapped up an incredible collaboration with a designer from this platform. The quality of work here is outstanding – highly recommend!',
    media:
      'Frontend/Public/HXH.png',
    likes: 15,
    comments: 4,
    timestamp: '2 days ago',
    liked: false,
  },
];

export const SUBMISSIONS = [
  {
    id: '1',
    worker: 'GON',
    workerAvatar:
      'Frontend/Public/HXH.png',
    timestamp: '2026-03-14 · 10:32 AM',
    fileLink: 'submission-landing-page.zip',
    note: "Here is my submission. I've included all required sections with fully responsive designs and interactive prototype.",
    status: 'Pending',
  },
  {
    id: '2',
    worker: 'KILUA',
    workerAvatar:
      'Frontend/Public/HXH.png',
    timestamp: '2026-03-13 · 3:15 PM',
    fileLink: 'landing-page-v2.zip',
    note: 'Second revision with updated color palette, improved CTA section, and faster load times.',
    status: 'Pending',
  },
];
