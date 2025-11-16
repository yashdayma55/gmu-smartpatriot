// src/data/gmuKnowledge.ts

export type KnowledgeContact = {
    label: string;
    email?: string;
    phone?: string;
    url?: string;
  };
  
  export type KnowledgeChunk = {
    id: string;
    title: string;
    url: string;
    category: string;   // e.g. "Academics/Undergraduate CS"
    tags: string[];
    text: string;
    contacts?: KnowledgeContact[];
  };
  
  // 🔹 UNDERGRAD CS (BS CS) KNOWLEDGE BASE
  // Based on:
  // - BS CS prospective page: https://cs.gmu.edu/prospective-students/undergraduate-programs/bs-in-computer-science/ :contentReference[oaicite:0]{index=0}
  // - BS CS current students page: https://cs.gmu.edu/current-students/undergraduates/bs-in-computer-science/ :contentReference[oaicite:1]{index=1}
  // - Program page: https://www.gmu.edu/program/computer-science-bs :contentReference[oaicite:2]{index=2}
  // - Undergraduate advising: https://cs.gmu.edu/advising/undergraduate-advising/ :contentReference[oaicite:3]{index=3}
  // - Getting started in CS: https://cs.gmu.edu/current-students/undergraduates/getting-started-in-cs-at-gmu/ :contentReference[oaicite:4]{index=4}
  // - CS contact info & catalog contact section :contentReference[oaicite:5]{index=5}
  
  export const KNOWLEDGE_BASE: KnowledgeChunk[] = [
    {
      id: "bs-cs-overview",
      title: "BS in Computer Science – Program Overview",
      url: "https://cs.gmu.edu/prospective-students/undergraduate-programs/bs-in-computer-science/",
      category: "Academics/Undergraduate CS",
      tags: [
        "bs cs",
        "undergraduate",
        "computer science",
        "major",
        "overview",
        "prospective students",
      ],
      text: `
  The Bachelor of Science in Computer Science (BS CS) at George Mason University is an ABET-accredited
  four-year undergraduate program. It focuses on the design and implementation of computer system
  software, computer architecture, and software applications for science and business. The program
  emphasizes both computer systems fundamentals and software applications and prepares students for
  careers in computing or for graduate study in computer science and related fields.
      `.trim(),
    },
  
    {
      id: "bs-cs-degree-structure",
      title: "BS in Computer Science – Credits and Degree Requirements",
      url: "https://cs.gmu.edu/current-students/undergraduates/bs-in-computer-science/",
      category: "Academics/Undergraduate CS",
      tags: [
        "bs cs",
        "degree requirements",
        "credits",
        "mason core",
        "catalog",
        "graduation",
      ],
      text: `
  For the BS CS degree, students must complete a total of 120 credits, including Mason Core
  (general education) requirements, core and elective computer science courses, and required
  math and natural science coursework. Exact requirements can vary by catalog year, so students
  must consult the official GMU catalog and their degree evaluation in PatriotWeb for the precise
  set of courses, GPA minimums, and residency requirements that apply to them.
      `.trim(),
    },
  
    {
      id: "bs-cs-key-areas",
      title: "BS in Computer Science – Required Areas of Study",
      url: "https://www.gmu.edu/program/computer-science-bs",
      category: "Academics/Undergraduate CS",
      tags: [
        "bs cs",
        "courses",
        "data structures",
        "algorithms",
        "low-level programming",
        "architecture",
        "language translation",
        "ethics",
        "software design",
      ],
      text: `
  The BS in Computer Science curriculum includes required areas of study such as data structures,
  analysis of algorithms, low-level programming, computer architecture, language translation,
  ethics and law for the computing professional, and software design and development. Students
  build a foundation in core CS topics and then choose upper-level electives to explore areas
  like artificial intelligence, data science, networks, security, and software engineering.
      `.trim(),
    },
  
    {
      id: "bs-cs-advising",
      title: "Undergraduate CS Advising (BS CS)",
      url: "https://cs.gmu.edu/advising/undergraduate-advising/",
      category: "Academics/Undergraduate CS",
      tags: [
        "bs cs",
        "undergraduate advising",
        "advisor",
        "csug",
        "course planning",
        "help",
      ],
      text: `
  Undergraduate CS advising supports BS CS students with course selection, degree planning,
  transfer credit questions, and understanding program requirements and policies. Advising is
  by appointment, with options for in-person and virtual meetings. Quick questions can often
  be handled via email.
  
  The main undergraduate CS advising office is located in Buchanan Hall, Room D215. Students are
  encouraged to review degree requirements and FAQs first, then meet with an advisor if they have
  questions about prerequisites, course sequencing, or catalog year.
      `.trim(),
      contacts: [
        {
          label: "Undergraduate CS Advising Office",
          email: "csug@gmu.edu",
          phone: "703-993-1530",
          url: "https://cs.gmu.edu/advising/undergraduate-advising/",
        },
      ],
    },
  
    {
      id: "bs-cs-getting-started",
      title: "Getting Started in CS at GMU (Undergraduate)",
      url: "https://cs.gmu.edu/current-students/undergraduates/getting-started-in-cs-at-gmu/",
      category: "Academics/Undergraduate CS",
      tags: [
        "bs cs",
        "getting started",
        "new student",
        "orientation",
        "g-number",
        "csug",
      ],
      text: `
  The "Getting Started in CS at GMU" resources help new and prospective CS undergraduates understand
  how to begin their degree. The site links to orientation materials, degree brochures, and guidance
  on major declaration, transfer credits, AP/IB credit, and test-out exams.
  
  Undergraduate CS students are encouraged to email the advising team at their official GMU email
  account and always include their G-number when asking questions. The csug@gmu.edu email address
  is monitored by advisors on workdays and is a good first point of contact.
      `.trim(),
      contacts: [
        {
          label: "General Undergraduate CS Questions",
          email: "csug@gmu.edu",
          phone: "703-993-1530",
          url: "https://cs.gmu.edu/current-students/undergraduates/getting-started-in-cs-at-gmu/",
        },
      ],
    },
  
    {
      id: "bs-cs-honors-accelerated",
      title: "BS CS – Honors and Accelerated Bachelor’s/Master’s",
      url: "https://catalog.gmu.edu/colleges-schools/engineering-computing/school-computing/computer-science/computer-science-bs/",
      category: "Academics/Undergraduate CS",
      tags: [
        "bs cs",
        "honors",
        "cs honors program",
        "accelerated masters",
        "bs/ms",
      ],
      text: `
  The BS CS program offers opportunities for high-achieving students, including the CS Honors Program
  and accelerated bachelor's–master's pathways. The CS Honors Program is intended for students with
  strong academic records who want to pursue advanced coursework and a significant research project.
  Accelerated BS/MS options allow qualified students to complete up to 12 credits of graduate coursework
  that count toward both the BS and a related MS degree.
  
  Students interested in honors or accelerated options should review the catalog and departmental
  information for specific GPA requirements, application procedures, and timelines.
      `.trim(),
    },
  
    {
      id: "cs-department-contacts",
      title: "Computer Science Department – General Contact Information",
      url: "https://catalog.gmu.edu/colleges-schools/engineering-computing/school-computing/computer-science/",
      category: "Academics/Undergraduate CS",
      tags: [
        "cs department",
        "contact",
        "csinfo",
        "csug",
        "csgrad",
        "csphd",
        "phone",
      ],
      text: `
  The GMU Computer Science department lists separate contact emails for different levels of study.
  Undergraduate program questions can go to csug@gmu.edu, MS program questions to csgrad@gmu.edu,
  and PhD program questions to csphd@gmu.edu. General department inquiries can be sent to csinfo@gmu.edu.
  
  The department main office phone number is 703-993-1530. Students should use their official GMU email
  accounts and include their G-number when asking about their specific records.
      `.trim(),
      contacts: [
        {
          label: "General CS Department Information",
          email: "csinfo@gmu.edu",
          phone: "703-993-1530",
          url: "https://compsci.sitemasonry.gmu.edu/about/contact-us",
        },
        {
          label: "Undergraduate Programs (BS CS / BS ACS)",
          email: "csug@gmu.edu",
          phone: "703-993-1530",
          url: "https://cs.gmu.edu/advising/undergraduate-advising/",
        },
        {
          label: "MS Programs",
          email: "csgrad@gmu.edu",
          phone: "703-993-1530",
          url: "https://cs.gmu.edu/advising/graduate-advising/",
        },
        {
          label: "PhD Program",
          email: "csphd@gmu.edu",
          phone: "703-993-1530",
          url: "https://catalog.gmu.edu/colleges-schools/engineering-computing/school-computing/computer-science/",
        },
      ],
    },
      // -----------------------------------------------------
  // 🟦 MS IN COMPUTER SCIENCE (MS CS) KNOWLEDGE BLOCK
  // -----------------------------------------------------

  {
    id: "ms-cs-overview",
    title: "MS in Computer Science – Program Overview",
    url: "https://cs.gmu.edu/prospective-students/graduate-admissions/masters-programs/ms-in-computer-science/",
    category: "Academics/Graduate MS CS",
    tags: [
      "ms cs",
      "master",
      "graduate",
      "computer science",
      "prospective student",
      "overview",
    ],
    text: `
The MS in Computer Science at George Mason University is a flexible graduate program designed
for students seeking advanced coursework in computing. It provides depth in areas such as
algorithms, machine learning, artificial intelligence, cybersecurity, databases, networks,
software engineering, programming languages, and systems.

The program is suitable for students with a strong background in computing or a related field.
Students who need prerequisites may complete foundation courses before enrolling in advanced coursework.
    `.trim(),
  },

  {
    id: "ms-cs-requirements",
    title: "MS in Computer Science – Degree Requirements",
    url: "https://catalog.gmu.edu/colleges-schools/engineering-computing/school-computing/computer-science/computer-science-ms/",
    category: "Academics/Graduate MS CS",
    tags: [
      "ms cs",
      "requirements",
      "credits",
      "catalog",
      "degree structure",
      "foundation courses",
      "project option",
      "thesis option",
    ],
    text: `
The MS CS degree requires a total of 30 graduate credits. Students complete a combination of
required core courses and approved electives, following the degree rules for their catalog year.

Students may complete the degree through a coursework-only option, a project option, or a thesis option,
when permitted by their catalog. Students who need additional preparation may be required to take
foundation courses in areas such as data structures, low-level programming, and formal methods;
these do not count toward the 30 required credits.
    `.trim(),
  },

  {
    id: "ms-cs-core-areas",
    title: "MS in Computer Science – Core Study Areas",
    url: "https://catalog.gmu.edu/colleges-schools/engineering-computing/school-computing/computer-science/computer-science-ms/",
    category: "Academics/Graduate MS CS",
    tags: [
      "ms cs core",
      "algorithms",
      "ai",
      "ml",
      "systems",
      "cybersecurity",
      "databases",
      "software engineering",
      "theory",
    ],
    text: `
The MS CS program allows students to build depth in advanced areas of computing. Common areas
of focus include:

• Algorithms and theory  
• Artificial intelligence and machine learning  
• Cybersecurity  
• Databases and data mining  
• Software engineering  
• Systems, networks, and operating systems  
• Programming languages and compilers

Students can specialize in one area or choose coursework across multiple areas depending on
their academic and career goals.
    `.trim(),
  },

  {
    id: "ms-cs-advising",
    title: "MS CS Graduate Advising",
    url: "https://cs.gmu.edu/advising/graduate-advising/",
    category: "Academics/Graduate MS CS",
    tags: [
      "ms cs advising",
      "graduate advising",
      "csgrad",
      "course planning",
      "help",
      "degree planning",
    ],
    text: `
Graduate advising supports MS CS students with academic planning, course sequencing, prerequisite
questions, graduation requirements, and catalog-year policies. Advising appointments and contact
information are available on the graduate advising page, and students may email the advising team
for guidance.

Students are encouraged to review their catalog requirements and use degree evaluation tools
before meeting with an advisor, so advising conversations can focus on planning and decisions
rather than basic information lookup.
    `.trim(),
    contacts: [
      {
        label: "Graduate CS Advising",
        email: "csgrad@gmu.edu",
        phone: "703-993-1530",
        url: "https://cs.gmu.edu/advising/graduate-advising/",
      },
    ],
  },

  {
    id: "ms-cs-foundation",
    title: "MS CS – Foundation and Prerequisite Requirements",
    url: "https://cs.gmu.edu/prospective-students/graduate-admissions/masters-programs/ms-in-computer-science/",
    category: "Academics/Graduate MS CS",
    tags: [
      "ms cs prerequisites",
      "foundation courses",
      "background",
      "bridge courses",
      "preparation",
    ],
    text: `
Applicants who do not hold an undergraduate degree in computer science or a closely related field
may be required to complete a set of foundation courses before taking graduate-level CS classes.
These typically cover programming, data structures, low-level computing, and formal methods.

The exact foundation requirements depend on the applicant's previous coursework and transcript review.
Foundation courses are generally not counted toward the 30-credit MS CS degree.
    `.trim(),
  },

  {
    id: "ms-cs-project-thesis",
    title: "MS CS – Project and Thesis Options",
    url: "https://catalog.gmu.edu/colleges-schools/engineering-computing/school-computing/computer-science/computer-science-ms/",
    category: "Academics/Graduate MS CS",
    tags: [
      "ms cs thesis",
      "ms cs project",
      "research",
      "graduate research",
    ],
    text: `
MS CS students may have the option to complete the degree with a project or thesis, depending on
their catalog year and track. Both paths require faculty supervision and significant independent work.

The project option usually focuses on applied research or system design, while the thesis option
emphasizes original research and is recommended for students considering a PhD or research-oriented career.
Students interested in these options should consult the catalog and speak with faculty advisors early.
    `.trim(),
  },

  {
    id: "ms-cs-general-contact",
    title: "General CS Department Graduate Contacts",
    url: "https://compsci.sitemasonry.gmu.edu/about/contact-us",
    category: "Academics/Graduate MS CS",
    tags: [
      "csgrad",
      "graduate contact",
      "ms cs contact",
      "department office",
    ],
    text: `
The GMU Computer Science department maintains separate contact emails for undergraduate, MS,
and PhD programs. The csgrad@gmu.edu address is used for MS-level academic inquiries, including
questions about degree requirements, course selection, and policies. General department inquiries
may be directed to the main office or to csinfo@gmu.edu as appropriate.

Students should use their official GMU email accounts and include their G-number when asking about
their specific academic records.
    `.trim(),
    contacts: [
      {
        label: "MS CS Program (Graduate Office)",
        email: "csgrad@gmu.edu",
        phone: "703-993-1530",
        url: "https://compsci.sitemasonry.gmu.edu/about/contact-us",
      },
    ],
  },

  ];
  