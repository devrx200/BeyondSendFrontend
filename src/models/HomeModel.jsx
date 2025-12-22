// Home Page Data Model

export const heroSlides = [
  {
    id: 1,
    title: 'Welcome to Higher Education Department',
    subtitle: 'Government of Chhattisgarh',
    description: 'Empowering students through quality education and innovative learning',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
    cta: { text: 'Learn More', link: '/about' }
  },
  {
    id: 2,
    title: 'Scholarship Opportunities',
    subtitle: 'Financial Support for Students',
    description: 'Various scholarship schemes available for deserving students',
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200',
    cta: { text: 'Apply Now', link: '/schemes/scholarship' }
  },
  {
    id: 3,
    title: 'Quality Higher Education',
    subtitle: 'Building Future Leaders',
    description: 'Excellence in education through modern infrastructure and qualified faculty',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200',
    cta: { text: 'Explore', link: '/universities' }
  }
];

export const quickLinks = [
  { id: 1, title: 'Student Portal', icon: 'FaUserGraduate', link: '/student-portal' },
  { id: 2, title: 'Scholarships', icon: 'FaMoneyBillWave', link: '/schemes/scholarship' },
  { id: 3, title: 'Admissions', icon: 'FaBook', link: '/admissions' },
  { id: 4, title: 'Results', icon: 'FaClipboardList', link: '/results' },
  { id: 5, title: 'E-Library', icon: 'FaBookReader', link: '/e-library' },
  { id: 6, title: 'Grievance', icon: 'FaExclamationCircle', link: '/grievance' }
];

export const announcements = [
  {
    id: 1,
    title: 'Admission Notice for Academic Year 2024-25',
    date: '2024-12-10',
    category: 'Admission',
    description: 'Online applications are invited for admission to various undergraduate and postgraduate courses.',
    link: '/announcements/admission-2024'
  },
  {
    id: 2,
    title: 'Scholarship Application Deadline Extended',
    date: '2024-12-08',
    category: 'Scholarship',
    description: 'Last date for scholarship applications has been extended to 31st December 2024.',
    link: '/announcements/scholarship-deadline'
  },
  {
    id: 3,
    title: 'New University Establishment Notification',
    date: '2024-12-05',
    category: 'Notification',
    description: 'Government announces establishment of new state university in Bilaspur district.',
    link: '/announcements/new-university'
  },
  {
    id: 4,
    title: 'Faculty Recruitment Drive 2024',
    date: '2024-12-01',
    category: 'Recruitment',
    description: 'Applications invited for various teaching positions in government colleges.',
    link: '/announcements/faculty-recruitment'
  }
];

export const statistics = [
  { id: 1, label: 'Universities', value: '25+', icon: 'FaUniversity' },
  { id: 2, label: 'Colleges', value: '350+', icon: 'FaSchool' },
  { id: 3, label: 'Students Enrolled', value: '2.5L+', icon: 'FaUserGraduate' },
  { id: 4, label: 'Scholarships Awarded', value: '50K+', icon: 'FaAward' }
];

export const featuredSchemes = [
  {
    id: 1,
    title: 'Post Matric Scholarship',
    description: 'Financial assistance for SC/ST/OBC students pursuing higher education',
    icon: 'FaGraduationCap',
    link: '/schemes/post-matric'
  },
  {
    id: 2,
    title: 'Merit Scholarship',
    description: 'Scholarships for meritorious students based on academic performance',
    icon: 'FaMedal',
    link: '/schemes/merit'
  },
  {
    id: 3,
    title: 'Girl Child Education',
    description: 'Special schemes to promote higher education among girl students',
    icon: 'FaFemale',
    link: '/schemes/girl-education'
  },
  {
    id: 4,
    title: 'Research Grants',
    description: 'Funding support for research scholars and doctoral students',
    icon: 'FaFlask',
    link: '/schemes/research'
  }
];

export const importantLinks = [
  { id: 1, title: 'UGC India', url: 'https://www.ugc.ac.in', external: true },
  { id: 2, title: 'AICTE', url: 'https://www.aicte-india.org', external: true },
  { id: 3, title: 'NAAC', url: 'https://www.naac.gov.in', external: true },
  { id: 4, title: 'National Scholarship Portal', url: 'https://scholarships.gov.in', external: true },
  { id: 5, title: 'CG Govt Portal', url: 'https://www.cgstate.gov.in', external: true },
  { id: 6, title: 'Digital India', url: 'https://www.digitalindia.gov.in', external: true }
];

