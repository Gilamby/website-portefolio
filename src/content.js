// ======================================================================
//  ALL PORTFOLIO CONTENT LIVES HERE.
//  To update the site (new job, new city, new project): edit this file,
//  then rebuild. Nothing else needs to change.
// ======================================================================

export const PROFILE = {
  name: "Fabian Corsalini",
  role: "Creative Software Developer",
  focus: "Full-stack development: front-end, back-end & UI/UX",
  age: 18,
  // what you are doing right now
  current: { title: "Software Developer", company: "OptimaSys", type: "Internship · on-site", place: "Marbella, Spain", since: "Oct 2026" },
  homeBase: "Delft, the Netherlands",
  languages: "Dutch (native) · English (professional) · Italian (beginner)",
  mobility: "Remote or on-site · open to relocate",
  // handwritten notes next to the photo in About Me: what is useful to know before working with you
  notes: ["Full-stack: front-end & back-end", "Remote or on-site", "Dutch & English", "International work experience"],
  openTo: "Full-stack roles and projects",
  // shown at the top of Quick view
  availability: "Open to full-stack roles and projects",

  about: [
    "I am a full-stack software developer with a strong eye for design. In my projects I build both sides myself: the interface people see and the back-end that makes it work, from APIs and payments to the database. I take an idea from the first sketch to a working product, and I care about the details on both sides: how it looks and how it is built.",
    "I currently work as a software developer at OptimaSys, where I build features across the front-end and back-end of QR-Codex, a commercial web application.",
    "I learn new technologies quickly, work independently and take ownership of what I deliver."
  ],
  // About Me, back of the poster: why hire me, each with the story behind it
  why: [
    ["Self-starter", "During both of my first internships, colleagues deliberately stopped answering some of my questions so that I would learn to solve problems on my own. So I did: I research, experiment, break things, fix them and keep going until it works."],
    ["Real experience", "At fifteen I sat in meetings with management and built a platform for the Municipality of Delft. At Delta-N I built an app that is still used every day, and today I work on a commercial product at OptimaSys."],
    ["Fast learner", "I started experimenting with code at around eight. Since then I have worked with HTML, CSS, JavaScript, TypeScript, React and Figma. Every company uses a different stack, and I pick a new one up quickly."],
    ["Design-minded", "Development is not only about making something work; it should look and feel right too. I pay attention to the details of layouts and interactions, because they decide how people experience a product."]
  ],
  lookingFor: "A full-stack role or project where I build the whole product, from the database to the interface, take ownership and keep learning."
};

// "My Story": your journey as chapters, oldest first. Add a chapter when something new starts.
export const STORY = {
  intro: "From a first line of code at eight to building commercial software abroad. This is who I am, how I got here and what I can do.",
  // shown on the first page: who I am in a few lines
  who: "I am Fabian, an 18-year-old full-stack developer from Delft. I build complete web products: the interface people use, the back-end behind it, and everything that connects the two. I study Software Development at the Grafisch Lyceum Rotterdam and I currently work abroad, in Marbella, on a commercial product with real paying customers.",
  chapters: [
    { when: "Age 8", title: "The first line of code",
      context: "My dad and my uncle introduced me to computers and programming. What I wanted most was to build my own games.",
      did: "I started experimenting with code and slowly built small things of my own. When something did not work, I kept trying until it did, and that habit never left.",
      result: "Curiosity for how software is made became the reason I chose IT.",
      learned: ["Curiosity is the best teacher", "Building something yourself beats only using it"] },
    { when: "2023 · age 15", title: "Municipality of Delft & Rijswijk",
      context: "My first internship. Young people in Delft had no simple way to share ideas for local events with the municipality. Instead of only observing, I was given that problem as a real assignment.",
      did: "I wrote the project plan, designed the interface and built the platform in Oracle APEX. A four-step form collects the idea, the target group and contact details, with a summary before sending. In PL/SQL I wrote the back-end logic: every submission sends one email to the municipality and a confirmation back to the young person. I also interviewed the mayor about the project.",
      result: "Delivered to the municipality as a working platform.",
      learned: ["Planning a project for a real client", "Back-end logic and email automation in PL/SQL", "Presenting my work to management"],
      skills: "Oracle APEX · PL/SQL · UI design · project planning" },
    { when: "2024", title: "Delta-N",
      context: "Colleagues walked to the car park only to find every charging station taken. Nobody had asked for a solution, but the problem cost people time every day.",
      did: "I proposed a reservation app and built it myself with low-code tools. You see in real time which stations are free (green) or taken (red), pick a date and a time slot in a simple form, and reserve with one tap.",
      result: "The app went live and is still used every day.",
      learned: ["Spotting a problem nobody asked me to solve", "Pitching an idea and delivering it", "Building software people rely on daily"],
      skills: "Low-code · UX for everyday use · solo delivery" },
    { when: "2024 – present", title: "Grafisch Lyceum Rotterdam",
      context: "I study Software Development (Creative Software Developer, MBO 4). Here I learned to work in a team for real clients, from the first meeting to delivery.",
      did: "Project plans, wireframes, style guides in Figma, clickable prototypes, pitches and client meetings, then building it. For FunFactory, a sustainable toy webshop, I designed every page and built the site in HTML, CSS and JavaScript. With my class I built Red Frontier, Marktplaats and Quizzy.",
      result: "A process I now use on every project: understand the problem, design it, build it, present it.",
      learned: ["Working in a team with deadlines", "From wireframe and prototype to a working site", "Explaining technical choices to non-technical people"],
      skills: "HTML · CSS · JavaScript · Figma · teamwork" },
    { when: "Oct 2026 – present", title: "OptimaSys, Marbella",
      context: "My current internship, abroad and on-site. I work as a software developer on QR-Codex, a commercial web app where businesses create QR codes, change where they point at any time and see every scan.",
      did: "I build features across the whole stack: subscriptions and Stripe payments, scan analytics, business tools, the APIs between the promotional website and the app, and support for five languages. I also built the Flexichat website with a working demo chat, pricing with Stripe checkout and a CMS for every text.",
      result: "Code I wrote runs in production for paying customers.",
      learned: ["Full-stack work on a real product", "Payments, analytics and APIs that must not fail", "Working independently in another country"],
      skills: "JavaScript · Node.js · APIs · Stripe · Payload CMS" }
  ],
  next: { title: "What's next", text: "My long-term goal is to start my own company and build digital products for businesses. Until then I want to grow as a full-stack developer on products that real people use, in a team where I can take ownership. Game development is still a passion: it is the reason I started." }
};

// newest first
export const EXPERIENCE = [
  { title: "Software Developer", org: "OptimaSys · Internship · on-site", when: "Oct 2026 – present · Marbella, Spain", text: "Development of web applications and digital products. Main project: QR-Codex, a web app for creating, managing and tracking QR codes. Front-end and back-end: subscription and payment systems, analytics, business tools, APIs and multilingual support." },
  { title: "App Developer", org: "Delta-N · Internship", when: "2024", text: "Identified the need for a charging-station reservation system and built a low-code app to check availability and book time slots. Live and in daily use." },
  { title: "Developer", org: "Municipality of Delft & Rijswijk · Internship", when: "2023", text: "Designed and built a youth participation platform in Oracle APEX with PL/SQL email automation, and interviewed the mayor about the project." }
];

export const EDUCATION = [
  { title: "Software Development", org: "Grafisch Lyceum Rotterdam · Creative Software Developer (MBO 4)", when: "2024 – present", text: "Team projects for real clients: project plans, wireframes, prototypes, pitches and presentations, from idea to delivery." }
];

// About Me: one enamel pin per skill area; clicking a pin shows its card. Keep each text unique.
export const SKILL_AREAS = [
  { pin: "Front-end", color: "#3a78c9", title: "Front-end development", tools: ["HTML", "CSS", "JavaScript", "React"], text: "Most of my work is building interfaces from the ground up: well structured, responsive on every screen and fast to load. I never copy code I do not understand; everything in my code is there for a reason." },
  { pin: "Back-end", color: "#5a9a3a", title: "Back-end & data", tools: ["Node.js", "APIs", "Stripe", "Payload CMS", "PL/SQL"], text: "I also build the logic behind the screen: APIs, user accounts, subscription payments and content management. That means I can deliver a complete product, not only the part you see." },
  { pin: "Design", color: "#a05ad8", title: "UI/UX design", tools: ["Figma", "Wireframes", "Prototypes", "Style guides"], text: "Before I code, I design in Figma: wireframes, a style guide and a clickable prototype. A good interface makes sense the moment you see it, so I design for clarity first and looks second." },
  { pin: "Workflow", color: "#c27a1e", title: "How I work", tools: ["Git", "VS Code", "AI tools", "Documentation"], text: "Git for version control and VS Code as my editor. I use AI tools to explore approaches faster, never to do the work for me. Give me the documentation of a new stack and I will be productive quickly." }
];

// Full case studies (the page that opens from the pop-up book). Images live in img/ and img/cs/.
// facts: label/value pairs · sections: [title, text] · features: bullet list · steps: [title, text, image] · stats · quote · gallery: [image, caption]
export const CASES = {
  qrcodex: {
    lead: "A web app for creating, managing and tracking QR codes, together with its promotional website.",
    status: "Real product for real customers",
    facts: [["Role", "Software developer, front-end & back-end"], ["Company", "OptimaSys, Marbella"], ["Type", "Internship project"], ["Period", "Oct 2026 – present"]],
    sections: [["The idea", "A normal QR code is fixed forever: once it is printed you cannot change it, and you never see who scanned it. QR-Codex solves both. A business creates one code, prints it on a sign, menu, flyer or business card, and changes the page behind it whenever it wants, while seeing every scan. A “For Sale” sign stays the same, while the page behind it shows a new price, or “Sold”."]],
    features: ["Subscription and payment system, paid directly on the website with Stripe", "Analytics: how often and where each code is scanned", "Business tools and many QR types: website, Wi-Fi, vCard, menu, WhatsApp, coupon and more", "APIs that connect the promotional website to the app", "Five languages: English, Spanish, Dutch, French and German", "A promotional website with a CMS, so every text, price and image can be edited"],
    steps: [["Pick a type", "Choose what the QR code should do: open a website, share Wi-Fi, show a menu, start a WhatsApp chat and more.", "img/cs/qrcodex-app-1.webp"], ["Fill it in and design it", "Add the content and pick the colours. A live phone preview shows exactly what people will see, and the app checks the contrast so the code always scans.", "img/cs/qrcodex-app-2.webp"], ["Print, change, track", "Print it once. Change the content at any time without reprinting, and follow every scan in the analytics.", null]],
    gallery: [["img/qrcodex-site-1.jpg", "qr-codex.com: the promotional website"], ["img/cs/qrcodex-site-2.webp", "One tool for every QR code, with a live phone example"], ["img/cs/qrcodex-app-1.webp", "The app: choose a QR type with a live phone preview"], ["img/cs/qrcodex-app-2.webp", "Design step with colours and a contrast check"]]
  },
  laadpaal: {
    lead: "A reservation app for the charging stations at Delta-N, which I proposed and built during my internship.",
    status: "Live and in daily use",
    facts: [["Role", "Solo developer"], ["Company", "Delta-N"], ["Tool", "Low-code platform"], ["Type", "Internship project, 2024"]],
    sections: [["The problem", "Delta-N had charging stations in its car park but no way to manage them. Colleagues walked down only to find every station taken: no reservations, no overview. I saw the problem, proposed a solution and built it."]],
    steps: [["Check availability", "Open the app and see which charging stations are free (green) or taken (red), in real time.", "img/laadpaal-1.jpg"], ["Pick a time", "Tap a station and fill in when you need it: date, start time and end time. A short, simple form.", "img/cs/laadpaal-3.webp"], ["Reserved", "One tap on “reserveer hier” and the reservation is confirmed, with a smiley.", "img/cs/laadpaal-4.webp"]],
    gallery: [["img/laadpaal-1.jpg", "Main screen: free and taken stations"], ["img/cs/laadpaal-2.webp", "Date picker"], ["img/cs/laadpaal-3.webp", "Booking form"], ["img/cs/laadpaal-4.webp", "Confirmation"]]
  },
  gemeente: {
    lead: "A platform where young people in Delft submit ideas for local events. I built it at fifteen.",
    status: "Delivered to a real client",
    facts: [["Role", "Solo developer & designer"], ["Client", "Municipality of Delft"], ["Tools", "Oracle APEX · PL/SQL"], ["Type", "Internship project, 2023"]],
    sections: [["What I built", "The Evenementen ideeënbus, an event-ideas mailbox for young people in Delft. Users fill in a multi-step form with their idea and their details, and check everything on a summary screen before submitting. Every submission sends two automatic emails: one to the municipality and one back to the young person as confirmation. I wrote that email logic myself in PL/SQL."]],
    stats: [["Oracle APEX", "built in"], ["PL/SQL", "email logic"], ["4", "steps in the form"], ["2", "emails per submission"]],
    steps: [["Submit an idea", "Young people fill in a multi-step form: name, age, email, target group and their event idea.", "img/cs/gemeente-1.webp"], ["Review the details", "Before submitting, users see a summary of everything they filled in.", "img/gemeente-2.jpg"], ["Back-end & email logic", "On submit, two emails are sent automatically: one to the municipality, one to the user. I wrote the whole email flow in PL/SQL inside Oracle APEX.", "img/cs/gemeente-4.webp"]],
    quote: ["“And then I interviewed the mayor.”", "Part of the project was interviewing the mayor of Delft, to understand which youth events the city actually wanted."],
    gallery: [["img/cs/gemeente-1.webp", "Step 2: your idea"], ["img/gemeente-2.jpg", "Step 4: review your details"], ["img/cs/gemeente-3.webp", "The Oracle APEX builder (blurred for privacy)"], ["img/cs/gemeente-4.webp", "The PL/SQL email logic"]]
  },
  flexichat: {
    lead: "The promotional website for Flexichat, a chat assistant for websites and WhatsApp Business.",
    facts: [["Role", "Web developer"], ["Company", "OptimaSys, Marbella"], ["Type", "Promotional website"], ["Year", "2026"]],
    sections: [["What I built", "Flexichat is a chat assistant that answers customers on a company's website and on WhatsApp Business, day and night, in their own language. I built its promotional website: one fast page that explains the product, lets visitors try it, walks them through the setup and lets them choose a plan and pay. It works on desktop, tablet and phone (even foldables), and every text, price and image can be changed in a CMS without touching the code."]],
    features: ["An interactive demo chat in the hero, so visitors can try it straight away", "A step-by-step setup guide, including WhatsApp Business", "Pricing with Stripe checkout", "A language picker: English, Spanish, Dutch, French and German", "Payload CMS for texts, prices, images and contact messages", "A responsive layout for every screen size"],
    gallery: [["img/flexichat-1.jpg", "Hero with a working demo chat"], ["img/cs/flexichat-2.webp", "How it works, in three steps"]]
  },
  funfactory: {
    lead: "A sustainable toy webshop, from the first wireframe to the finished website.",
    facts: [["Role", "Solo designer & developer"], ["Tools", "Figma · HTML · CSS · JavaScript"], ["Type", "School project"], ["Year", "2024"]],
    sections: [["The brief", "A complete web design project for a sustainable toy webshop: every screen and every state, from the first wireframe to the finished website."]],
    steps: [["Research & wireframes", "I mapped out every page in Figma first: low-fidelity wireframes for the homepage, product page, detail page and cart. No colours yet, only structure and flow.", "img/cs/funfactory-wireframes.webp"], ["UI design in Figma", "Next came the colour palette, typography, buttons and cards, all documented in a style guide before I wrote a single line of code.", "img/cs/funfactory-styleguide.webp"], ["Build", "I translated the design into a working website in HTML, CSS and JavaScript: homepage, product page, detail page and cart.", "img/cs/funfactory-final.webp"]],
    gallery: [["img/cs/funfactory-final.webp", "The finished homepage"], ["img/cs/funfactory-home.webp", "Homepage, product page and cart"], ["img/cs/funfactory-styleguide.webp", "The style guide"], ["img/cs/funfactory-wireframes.webp", "Homepage wireframe"], ["img/cs/funfactory-product.webp", "Product page wireframe"], ["img/cs/funfactory-mobile.webp", "Detail page wireframe"]]
  }
};

export const CONTACT = {
  email: "fabichelsea555@outlook.com",
  school: "101721@glr.nl",
  phone: "+31 6 47255213",
  linkedin: "https://www.linkedin.com/in/fabian-corsalini-731a583b5",
  linkedinLabel: "fabian-corsalini",
  github: "https://github.com/Gilamby",
  cv: "Fabian-Corsalini-CV.pdf"
};


// first four appear on the front of the postcard, the next four on the back
export const PROJECTS = [
  { id: "qrcodex", url: "https://qr-codex.com/", img: "qrcodex", title: "QR-Codex", year: "2026", tag: "OptimaSys internship · full-stack", cap: "full-stack web application", role: "Front-end & back-end developer (intern)", result: "A commercial SaaS product with paid subscriptions, live in production.", text: "A web app where businesses create, manage and track their own QR codes. Print a code once, change where it points whenever you want, and see every scan. I build features on the front-end and the back-end: subscriptions and Stripe payments, scan analytics, business tools, the APIs between the website and the app, and five languages.", tools: ["JavaScript", "Node.js", "Stripe", "Payload CMS", "APIs"], links: [["Visit qr-codex.com", "https://qr-codex.com/"], ["Open the app", "https://my.qr-codex.com/"]] },
  { id: "laadpaal", img: "laadpaal", title: "Charging Station App", year: "2024", tag: "Delta-N internship · low-code", cap: "low-code app, in daily use", role: "Solo developer", result: "Replaced walking-and-hoping with reservations; the app is still used daily.", text: "Delta-N had charging stations but no way to reserve them. I proposed a fix and built a low-code app: see which stations are free, pick a time slot and reserve it in seconds.", tools: ["Low-code", "App design", "UX"], steps: ["Check availability: free stations show green, taken ones red, in real time.", "Pick a time: choose the date, start time and end time in a simple form.", "Reserve: one tap and the reservation is confirmed."], links: [] },
  { id: "gemeente", img: "gemeente", title: "Youth Voting Platform", year: "2023", tag: "Municipality of Delft · solo, age 15", cap: "youth participation platform", role: "Solo developer & designer", result: "Delivered to the Municipality of Delft as a working platform.", text: "An event-ideas mailbox for young people in Delft. I wrote the project plan, designed the interface, built it in Oracle APEX and wrote the email logic in PL/SQL: every submission sends one email to the municipality and one back to the young person.", tools: ["Oracle APEX", "PL/SQL", "UI design"], steps: ["Submit an idea: a four-step form with name, age, contact details, target group and the event idea.", "Review: a summary of everything before submitting.", "Back-end: two automatic emails per submission, written in PL/SQL."], links: [] },
  { id: "flexichat", img: "flexichat", title: "Flexichat website", year: "2026", tag: "OptimaSys internship · web", cap: "promotional website", role: "Web developer (intern)", result: "A multilingual sales site that lets visitors try the product and buy a plan directly.", text: "The promotional website for Flexichat, a chat assistant that answers customers on a company's website and on WhatsApp Business. It has a working demo chat in the hero, a step-by-step setup guide, pricing with Stripe checkout and five languages, and every text can be edited in a CMS.", tools: ["HTML", "CSS", "JavaScript", "Payload CMS", "Stripe"], links: [] },
  { id: "funfactory", img: "funfactory", title: "FunFactory", year: "2024", tag: "School · design & front-end", cap: "e-commerce design & build", role: "Designer & front-end developer", result: "A complete design system and a working webshop built from it.", text: "A full web design project for a sustainable toy webshop: wireframes for every page, a style guide in Figma, then the whole site built in HTML, CSS and JavaScript.", tools: ["Figma", "HTML", "CSS", "JavaScript"], steps: ["Research & wireframes: every page mapped out in low fidelity.", "UI design in Figma: palette, typography and components in a style guide.", "Build: homepage, product, detail and cart pages in HTML, CSS and JavaScript."], links: [] },
  { id: "redfrontier", url: "https://102454.stu.sd-lab.nl/gr7_M2M-main/gr7_M2M-main/index.html", img: "redfrontier", title: "Red Frontier", year: "2025", tag: "School · group project", cap: "travel website", role: "Team member: design & front-end", result: "A finished, live group website delivered within the school sprint.", text: "A group project at school: a travel website for trips to Mars, with facilities, recreation and flight tickets.", tools: ["HTML", "CSS", "JavaScript"], links: [["Live demo", "https://102454.stu.sd-lab.nl/gr7_M2M-main/gr7_M2M-main/index.html"]] },
  { id: "marktplaats", url: "https://102454.stu.sd-lab.nl/Marktplaats-main/", img: "marktplaats", title: "Marktplaats", year: "2025", tag: "School · group project", cap: "marketplace website", role: "Team member: front-end", result: "A working marketplace prototype, live online.", text: "A marketplace website built with my class: product listings, categories and featured products.", tools: ["HTML", "CSS", "JavaScript"], links: [["Live demo", "https://102454.stu.sd-lab.nl/Marktplaats-main/"]] },
  { id: "quizzy", url: "https://102454.stu.sd-lab.nl/Quizzy-main/", img: "quizzy", title: "Quizzy", year: "2025", tag: "School · group project", cap: "quiz web application", role: "Team member: front-end", result: "A playable quiz application, live online.", text: "A quiz web app built with my class: create quizzes, pick a category and play.", tools: ["HTML", "CSS", "JavaScript"], links: [["Live demo", "https://102454.stu.sd-lab.nl/Quizzy-main/"]] }
];
// image file for each project (in /img)
export const PROJECT_IMAGES = { qrcodex: "img/qrcodex-site-1.jpg", flexichat: "img/flexichat-1.jpg", laadpaal: "img/laadpaal-1.jpg", gemeente: "img/gemeente-2.jpg", funfactory: "img/funfactory.png", redfrontier: "img/red-frontier.png", marktplaats: "img/marktplaats.png", quizzy: "img/quizzy.png" };
