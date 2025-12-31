// Navigation Menu Model with Bilingual Support
// This matches the government website structure: https://highereducation.cg.gov.in/
export const navigationMenus = [

  {
    id: 2,
    title: 'About Us',
    titleHi: 'हमारे बारे में',
    path: '/about',
    isExternal: false,
    openInNewTab: false,
    submenu: [
      { id: 21, title: 'Growth of Colleges', titleHi: 'कॉलेजों का विकास', path: '/about/growth-colleges', isExternal: false, openInNewTab: false },
      { id: 22, title: 'Location of Colleges', titleHi: 'कॉलेजों के स्थान', path: '/about/location-colleges', isExternal: false, openInNewTab: false },
      { id: 23, title: 'Academic Calendar', titleHi: 'शैक्षणिक कैलेंडर', path: '/about/academic-calendar', isExternal: false, openInNewTab: false },
      { id: 24, title: 'Departmental Budget', titleHi: 'विभागीय बजट', path: '/about/budget', isExternal: false, openInNewTab: false },
      { id: 25, title: 'Annual Report', titleHi: 'वार्षिक प्रतिवेदन', path: '/about/annual-report', isExternal: false, openInNewTab: false },
      { id: 26, title: 'Acts and Rules', titleHi: 'महत्वपूर्ण नियम एवं अधिनियम', path: '/about/acts-rules', isExternal: false, openInNewTab: false },
      { id: 27, title: "Who's Who", titleHi: 'कौन क्या है', path: '/about/whos-who', isExternal: false, openInNewTab: false },
      { id: 28, title: 'Organization Chart', titleHi: 'संगठन चार्ट', path: '/about/organization-chart', isExternal: false, openInNewTab: false }
    ]
  },
  {
    id: 3,
    title: 'Services',
    titleHi: 'सेवाएं',
    path: '/services',
    isExternal: false,
    openInNewTab: false,
    submenu: [
      { id: 31, title: 'Compassionate Appointment', titleHi: 'अनुकम्पा नियुक्ति', path: '/services/compassionate-appointment', isExternal: false, openInNewTab: false },
      { id: 32, title: 'Private Colleges', titleHi: 'अशासकीय महाविद्यालय', path: '/services/private-colleges', isExternal: false, openInNewTab: false },
      { id: 33, title: 'Web Application Portal', titleHi: 'वेब एप्लीकेशन पोर्टल', path: '/services/web-portal', isExternal: false, openInNewTab: false }
    ]
  },
  {
    id: 4,
    title: 'Notice Board',
    titleHi: 'सूचना पट्ट',
    path: '/notice-board',
    isExternal: false,
    openInNewTab: false,
    submenu: [
      { id: 41, title: 'News', titleHi: 'समाचार', path: '/notice-board/news', isExternal: false, openInNewTab: false },
      { id: 42, title: 'Tenders', titleHi: 'निविदाएं', path: '/notice-board/tenders', isExternal: false, openInNewTab: false },
      { id: 43, title: 'Recruitment', titleHi: 'भर्ती', path: '/notice-board/recruitment', isExternal: false, openInNewTab: false },
      {
        id: 44,
        title: 'Seniority List',
        titleHi: 'वरिष्ठता सूची',
        path: '/notice-board/seniority',
        isExternal: false,
        openInNewTab: false,
        submenu: [
          { id: 441, title: 'Head Office', titleHi: 'विभागाध्यक्ष कार्यालय', path: '/notice-board/seniority/head-office', isExternal: false, openInNewTab: false },
          { id: 442, title: 'Govt Colleges (Gazetted)', titleHi: 'शासकीय महाविद्यालय (राजपत्रित)', path: '/notice-board/seniority/govt-gazetted', isExternal: false, openInNewTab: false },
          { id: 443, title: 'Govt Colleges (Non-Gazetted)', titleHi: 'शासकीय महाविद्यालय (गैर राजपत्रित)', path: '/notice-board/seniority/govt-non-gazetted', isExternal: false, openInNewTab: false },
          { id: 444, title: 'Regional Office', titleHi: 'क्षेत्रीय कार्यालय', path: '/notice-board/seniority/regional-office', isExternal: false, openInNewTab: false },
          { id: 445, title: 'Universities', titleHi: 'विश्वविद्यालय', path: '/notice-board/seniority/universities', isExternal: false, openInNewTab: false }
        ]
      },
      { id: 45, title: 'Circulars', titleHi: 'परिपत्र', path: '/notice-board/circulars', isExternal: false, openInNewTab: false },
      {
        id: 46,
        title: 'Orders',
        titleHi: 'आदेश',
        path: '/notice-board/orders',
        isExternal: false,
        openInNewTab: false,
        submenu: [
          { id: 461, title: 'No Demand No Inspection', titleHi: 'ना मांग ना जाँच सम्बन्धी', path: '/notice-board/orders/no-demand', isExternal: false, openInNewTab: false },
          { id: 462, title: 'Promotion', titleHi: 'पदोन्नति', path: '/notice-board/orders/promotion', isExternal: false, openInNewTab: false },
          { id: 463, title: 'Ph.D. Permission', titleHi: 'पी.एच.डी. अनुमति', path: '/notice-board/orders/phd-permission', isExternal: false, openInNewTab: false },
          { id: 464, title: 'Previous Service', titleHi: 'पूर्व सेवा सम्बन्धी', path: '/notice-board/orders/previous-service', isExternal: false, openInNewTab: false },
          { id: 465, title: 'Transfer', titleHi: 'स्थानांतरण', path: '/notice-board/orders/transfer', isExternal: false, openInNewTab: false },
          { id: 466, title: 'Miscellaneous', titleHi: 'विविध', path: '/notice-board/orders/miscellaneous', isExternal: false, openInNewTab: false }
        ]
      },
      { id: 47, title: 'Minutes', titleHi: 'मिनट', path: '/notice-board/minutes', isExternal: false, openInNewTab: false },
      { id: 48, title: 'Advertisements', titleHi: 'विज्ञापन', path: '/notice-board/advertisements', isExternal: false, openInNewTab: false }
    ]
  },
  {
    id: 5,
    title: 'Right to Information',
    titleHi: 'सूचना का अधिकार',
    path: '/rti',
    isExternal: false,
    openInNewTab: false,
    submenu: []
  },
  {
    id: 6,
    title: 'Photo Gallery',
    titleHi: 'चित्र प्रदर्शनी',
    path: '/gallery',
    isExternal: false,
    openInNewTab: false,
    submenu: []
  },
  {
    id: 7,
    title: 'Contact Us',
    titleHi: 'हमसे संपर्क करें',
    path: '/contact',
    isExternal: false,
    openInNewTab: false,
    submenu: []
  },
  {
    id: 8,
    title: 'Voter Service Portal',
    titleHi: 'मतदाता सेवा पोर्टल',
    path: 'https://voters.eci.gov.in/',
    isExternal: true,
    openInNewTab: true,
    submenu: []
  },

  {
    id: 9,
    title: 'National Education Policy-2020',
    titleHi: 'राष्ट्रीय शिक्षा नीति-2020',
    path: '/nep-2020',
    isExternal: false,
    openInNewTab: false,
    submenu: [
      { id: 101, title: 'Orders / Instructions', titleHi: 'आदेश / निर्देश', path: '/nep-2020/orders', isExternal: false, openInNewTab: false },
      { id: 102, title: 'Curriculum', titleHi: 'पाठ्यक्रम', path: '/nep-2020/curriculum', isExternal: false, openInNewTab: false },
      { id: 103, title: 'Various Committees', titleHi: 'विभिन्न समितिया', path: '/nep-2020/committees', isExternal: false, openInNewTab: false },
      { id: 104, title: 'FAQs', titleHi: 'सामान्य प्रश्न', path: '/nep-2020/faqs', isExternal: false, openInNewTab: false }
    ]
  }
];

