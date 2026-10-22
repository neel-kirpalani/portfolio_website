/**
 * Every word the site says about Neel's work lives here.
 * Adding a project means adding one object to `projects`. Nothing else in the
 * app hard-codes content.
 *
 * `logo` values point at verified marks in /public/logos. Anything that could
 * not be verified is left blank on purpose: a wrong logo beside a real award is
 * worse than no logo.
 */

export type ProjectStatus = "shipped" | "built" | "published" | "ongoing";

export type Project = {
  slug: string;
  title: string;
  /** One line, plain language: what it does. Shown when the row is expanded. */
  premise: string;
  /** A few words for the collapsed row. */
  summary: string;
  /** Exactly what Neel did. */
  role: string;
  year: string;
  stack: string[];
  status: ProjectStatus;
  /** Only when it is real and checkable. */
  recognition?: string;
  problem?: string;
  approach?: string;
  outcome?: string;
  href?: string;
  /** Overrides the generic "Visit site" link label. */
  linkLabel?: string;
  appStore?: string;
  repo?: string;
  logo?: string;
};

export type Entry = {
  title: string;
  org?: string;
  meta: string;
  detail?: string;
  href?: string;
  logo?: string;
};

export const projects: Project[] = [
  {
    slug: "remake",
    title: "REMAKE",
    summary: "AI beauty app",
    premise:
      "Point a phone at your face and it tells you which foundation shade actually matches, whether a product is counterfeit, and what is in it that might react with your skin.",
    role: "Founder & Co-CEO. Product concept, model selection, and taking it to the App Store.",
    year: "2026",
    stack: ["Mobile", "Computer Vision"],
    status: "shipped",
    recognition: "Live on the App Store with active users and revenue",
    problem:
      "Buying foundation online is guesswork. Shade matching is unreliable, counterfeit beauty products are common, and the ingredients that cause reactions are buried in unreadable labels.",
    approach:
      "One camera input, three answers: a shade match from a face scan, a counterfeit check, and an allergen read on the ingredient list. Being right mattered more than being clever, so the model work went into accuracy on real faces and real product photos.",
    outcome:
      "Shipped to the App Store and in use by real people, with revenue. It is the only project here with users who are not me.",
    href: "https://remake.beauty/",
    appStore:
      "https://apps.apple.com/us/app/remake-personalized-beauty/id6785347578",
    logo: "/logos/remake.png",
  },
  {
    slug: "skateboard-safety",
    title: "Skateboard Stability & Speed Safety System",
    summary: "ESP32 sensor pack",
    logo: "/logos/skateboard.png",
    premise:
      "A sensor package on a skateboard deck that measures speed, landing force and ollie height in real time, and recognises the trick you just landed.",
    role: "Sole developer. Hardware, firmware, and the trick-recognition logic.",
    year: "2026",
    stack: ["ESP32", "IMU", "GPS", "BLE"],
    status: "built",
    problem:
      "Skateboarders have no feedback loop. You land a trick badly and the only signal is your ankles. Progression is guesswork and injury risk is invisible until it is not.",
    approach:
      "An ESP32 with an MPU6050 IMU and a GPS module is mounted to the deck. Orientation, speed and acceleration stream over Bluetooth Low Energy to a phone for live feedback. The same acceleration and gyroscope traces are pattern-matched to detect specific moves, so a kickflip is recognised from its signature in the data.",
    outcome:
      "Working hardware and a functioning data pipeline running on an actual board, producing board orientation, speed, landing force, jump height, and trick detection.",
  },
  {
    slug: "ai-displacement-research",
    title: "AI Automation & Job Displacement",
    summary: "Published research",
    premise:
      "What actually happens to employment when robots and AI arrive, and what a workforce needs in order to adapt instead of being displaced.",
    role: "Independent researcher and author.",
    year: "2026",
    stack: ["Research", "Labour economics"],
    status: "published",
    recognition: "Published in Scholarly Review Journal",
    problem:
      "The public argument about automation and jobs is conducted almost entirely through anecdote. The empirical literature is more specific and considerably less dramatic.",
    approach:
      "Synthesised findings from 20 empirical economics and labour-market studies, including Filippi et al. in Technological Forecasting & Social Change and Kolev et al. in the Proceedings of the Technical University of Sofia, to identify where displacement risk concentrates by sector and which reskilling strategies respond to it.",
    outcome:
      "Published as 'Robots at Work: A Comparative Analysis of Job Displacement in the Automobile and Healthcare Sectors' in Scholarly Review Journal, Fall 2026, Issue 17.",
    href: "https://doi.org/10.70121/001c.169618",
    linkLabel: "Read the paper",
    logo: "/logos/scholarlyreview.png",
  },
  {
    slug: "environmental-impact",
    title: "EcoWise",
    summary: "Eco-score scanner",
    premise:
      "Scan an object and it tells you how bad it is for the planet, and exactly how to dispose of it.",
    role: "Sole developer.",
    year: "2023–25",
    stack: ["Mobile", "MobileNetV2"],
    status: "built",
    recognition: "Roughly 80–90% classification accuracy",
    problem:
      "Knowing that you should recycle is useless if you do not know which bin a specific object belongs in, and generic advice does not survive contact with the actual object in your hand.",
    approach:
      "MobileNetV2 was the right tool here. Inverted residuals and linear bottlenecks keep the model fast and small enough to run on a phone, which is where this app is useful. The classifier output feeds a recycling guide that returns instructions for the specific item.",
    outcome:
      "A working mobile app that rates an object's environmental impact and returns disposal instructions, at roughly 80–90% accuracy.",
  },
  {
    slug: "lost-and-found",
    title: "HKIS Lost & Found",
    summary: "Hackathon winner",
    premise:
      "A lost-and-found system for a whole school: mobile app, web interface, and one central database, so an item that gets handed in actually reaches its owner.",
    role: "Product concept, UI/UX design, and system workflow planning.",
    year: "2024",
    stack: ["Mobile", "Web", "Database"],
    status: "built",
    recognition: "Best Overall, HKIS SDLT Hackathon",
    problem:
      "Lost property at a school of this size is a physical pile with no index. Items are handed in and never matched to the people looking for them.",
    approach:
      "A team build combining a mobile app for reporting, a web interface for staff, and a central database so both sides are querying the same records. The workflow made it win.",
    outcome: "Won Best Overall across a school-wide hackathon.",
    logo: "/logos/hkis-edu-hk.png",
  },
  {
    slug: "kaggle-housing",
    title: "Housing Price Regression",
    summary: "Top 2.6% on Kaggle",
    premise:
      "Predict sale prices from 79 features of the Ames housing dataset, and get as close to the bottom of the leaderboard as possible.",
    role: "Solo competitor.",
    year: "2025",
    stack: ["Python", "scikit-learn"],
    status: "built",
    recognition: "Top 2.6%, 113th of 4,382",
    approach:
      "Built composite features (total living area, age and quality indices), encoded categorical attributes such as neighbourhood, and cleaned missing and outlier values before training regularised linear and gradient boosting models. Optimised against RMSE between predicted and actual sale price.",
    outcome: "113th of 4,382 entrants, the top 2.6%.",
    logo: "/logos/kaggle-com.png",
  },
];

export const experience: Entry[] = [
  {
    title: "Web Development & Digital Strategy Intern",
    org: "Tomstar Industrial",
    meta: "2025",
    logo: "/logos/tomstar.png",
    detail:
      "Rebuilt the corporate website for a Shenzhen smartwatch manufacturer and built product pages for seven models. Time on the factory floor doing assembly and quality-control testing shaped how the products were described.",
  },
  {
    title: "Marketing Intern",
    org: "Hong Kong International School",
    meta: "2025",
    detail:
      "One of seven students selected. Built automated workflows to replace manual data entry in the intern application and content submission pipelines, then used social media analytics on click-through and event participation to redesign website pages and content.",
    logo: "/logos/hkis-edu-hk.png",
  },
  {
    title: "Machine Learning Summer Program",
    org: "NYU Tandon",
    meta: "2025",
    detail:
      "Two weeks on core computer science, data analysis and the mathematics behind machine learning. Worked with supervised learning models including linear regression and basic neural networks, applied to image, speech and real-world data, then presented to 30+ peers and professors.",
    logo: "/logos/nyu-edu.png",
  },
  {
    title: "Artificial Intelligence Summer Course",
    org: "The University of Hong Kong",
    meta: "2025",
    detail:
      "Covered recent progress in AI and machine learning, real-world applications, and the ethical and societal implications of advanced AI systems, through group programming and presentation-based projects.",
    logo: "/logos/hku-hk.png",
  },
];

export const awards: Entry[] = [
  {
    title: "VEX Excellence Award",
    org: "Hong Kong Tech Challenge",
    meta: "2025",
    detail: "Placed 3rd in Hong Kong and qualified for the VEX World Championship.",
    logo: "/logos/vexrobotics-com.png",
  },
  {
    title: "Best Overall",
    org: "HKIS SDLT Hackathon",
    meta: "2024",
    detail: "Won for a digital lost & found system built across app, web and database.",
    logo: "/logos/hkis-edu-hk.png",
  },
  {
    title: "Top 2.6%",
    org: "Kaggle Housing Prices",
    meta: "2025",
    detail: "113th of 4,382 entrants.",
    logo: "/logos/kaggle-com.png",
  },
  {
    title: "Published in Scholarly Review Journal",
    meta: "2026",
    detail:
      "Robots at Work, a comparative analysis of job displacement in the automobile and healthcare sectors.",
    logo: "/logos/scholarlyreview.png",
  },
  {
    title: "AP Scholar with Honor",
    meta: "2025",
    logo: "/logos/ap.png",
  },
  {
    title: "Honor Roll with Distinction",
    org: "Hong Kong International School",
    meta: "2023–26",
    detail: "Grades 9, 10, 11.",
    logo: "/logos/hkis-edu-hk.png",
  },
];

export const activities: Entry[] = [
  {
    title: "Team Captain & Lead Programmer",
    org: "936A HKIS Robotics",
    meta: "2024–present",
    detail:
      "Promoted from Team Leader-in-Training. Runs robot design, programming and match strategy for eight people, manages build and testing timelines, and mentors junior members.",
    logo: "/logos/vexrobotics-com.png",
  },
  {
    title: "Robotics Workshop Volunteer",
    org: "IBEL Outreach Program",
    meta: "2023–present",
    logo: "/logos/ibel.png",
    detail:
      "Taught LEGO-based robotics to underprivileged primary students, leading build challenges built around confidence and teamwork.",
  },
  {
    title: "Volunteer",
    org: "Sai Kung Stray Friends Foundation",
    meta: "2023–24",
    logo: "/logos/sksf.png",
    detail:
      "Over 100 hours of kennel care, feeding and socialising dogs to improve adoption readiness, plus weekend adoption drives and talking to prospective adopters.",
  },
  {
    title: "Advocate & Content Creator",
    org: "Animal Welfare & Sustainability",
    meta: "2023–24",
    logo: "/logos/sksf.png",
    detail:
      "Over 100 hours promoting animal welfare and plant-based living, designing the posters and social graphics behind it.",
  },
  {
    title: "Freelance DJ",
    org: "DJNK_HK",
    meta: "2021–present",
    detail:
      "Performed at more than 30 events including Dragon-i and school proms. Live mixing across genres.",
  },
  {
    title: "Senior Guitarist",
    org: "AMUSIX Productions",
    meta: "2023–26",
    logo: "/logos/amusix.png",
    detail:
      "Twelve years of guitar. Selected for the senior performance team inside a 100+ member programme, with roughly seven live shows.",
  },
  {
    title: "Men's B League Player",
    org: "LRC Tennis Team",
    meta: "2024–present",
    logo: "/logos/lrc.png",
    detail:
      "Competing in the Hong Kong Men's B Division, training several times a week on singles and doubles strategy.",
  },
];

export const education = {
  school: "Hong Kong International School",
  meta: "2023–2027",
  logo: "/logos/hkis-edu-hk.png",
};

export const about = {
  name: "Neel Kirpalani",
  location: "Hong Kong",
  bio: [
    "I'm a senior at Hong Kong International School. I build systems that take a messy signal from the real world (the motion of a skateboard, a face, an object on a table) and turn it into something a person can actually act on.",
    "Most recently I founded REMAKE, an AI beauty app that's live on the App Store with real users and revenue.",
    "I captain 936A, our VEX robotics team. We took an Excellence Award, placed third in Hong Kong, and qualified for the World Championship.",
    "Before that I built EcoWise, an app that rates the environmental impact of everyday objects, and won Best Overall at a school hackathon with a digital lost & found.",
    "Away from a keyboard I DJ as DJNK_HK, play guitar, and play tennis.",
  ],
  links: {
    email: "neelkirpalani@gmail.com",
    github: "https://github.com/neel-kirpalani",
    linkedin: "https://www.linkedin.com/in/neelkirpalani/",
    instagram: "https://www.instagram.com/neelkirpalani/",
    website: "https://remake.beauty/",
  },
  /** Rendered as chips in the "Find me" row, keyed to components/icons.ts. */
  social: [
    {
      key: "github" as const,
      label: "GitHub",
      handle: "@neel-kirpalani",
      href: "https://github.com/neel-kirpalani",
    },
    {
      key: "linkedin" as const,
      label: "LinkedIn",
      handle: "Neel Kirpalani",
      href: "https://www.linkedin.com/in/neelkirpalani/",
    },
    {
      key: "instagram" as const,
      label: "Instagram",
      handle: "@neelkirpalani",
      href: "https://www.instagram.com/neelkirpalani/",
    },
  ],
};
