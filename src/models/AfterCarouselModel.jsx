// After Carousel Content Data Model

// Latest News
export const latestNews = [
  {
    id: 1,
    title: 'Admission Notification for Academic Year 2024-25',
    titleHi: 'शैक्षणिक वर्ष 2024-25 के लिए प्रवेश अधिसूचना',
    date: '2024-12-15',
    isNew: true,
    category: 'admission',
    link: '/notice-board/news/1'
  },
  {
    id: 2,
    title: 'Professor Recruitment - 2024',
    titleHi: 'प्रोफेसर भर्ती - 2024',
    date: '2024-12-14',
    isNew: true,
    category: 'recruitment',
    link: '/notice-board/recruitment/2'
  },
  {
    id: 3,
    title: 'National Education Policy - 2020 Implementation',
    titleHi: 'राष्ट्रीय शिक्षा नीति - 2020 कार्यान्वयन',
    date: '2024-12-12',
    isNew: true,
    category: 'policy',
    link: '/notice-board/news/3'
  },
  {
    id: 4,
    title: 'Scholarship Application Deadline Extended',
    titleHi: 'छात्रवृत्ति आवेदन की अंतिम तिथि बढ़ाई गई',
    date: '2024-12-10',
    isNew: false,
    category: 'scholarship',
    link: '/notice-board/news/4'
  },
  {
    id: 5,
    title: 'Annual Convocation Ceremony 2024',
    titleHi: 'वार्षिक दीक्षांत समारोह 2024',
    date: '2024-12-08',
    isNew: false,
    category: 'event',
    link: '/notice-board/news/5'
  }
];

// Important Links
export const importantLinks = [
  {
    id: 1,
    title: 'Voter Service Portal',
    titleHi: 'मतदाता सेवा पोर्टल',
    icon: 'FaVoteYea',
    link: 'https://voters.cg.gov.in',
    external: true
  },
  {
    id: 2,
    title: 'Student Portal',
    titleHi: 'छात्र पोर्टल',
    icon: 'FaUserGraduate',
    link: '/student-portal',
    external: false
  },
  {
    id: 3,
    title: 'Scholarship Portal',
    titleHi: 'छात्रवृत्ति पोर्टल',
    icon: 'FaMoneyBillWave',
    link: '/schemes/scholarship',
    external: false
  },
  {
    id: 4,
    title: 'E-Library',
    titleHi: 'ई-पुस्तकालय',
    icon: 'FaBookReader',
    link: '/e-library',
    external: false
  },
  {
    id: 5,
    title: 'Grievance Portal',
    titleHi: 'शिकायत पोर्टल',
    icon: 'FaExclamationCircle',
    link: '/grievance',
    external: false
  },
  {
    id: 6,
    title: 'RTI Portal',
    titleHi: 'आरटीआई पोर्टल',
    icon: 'FaInfoCircle',
    link: '/rti',
    external: false
  }
];

// Minister/Secretary Message
export const ministerMessage = {
  id: 1,
  name: 'Shri Brijmohan Agrawal',
  nameHi: 'श्री बृजमोहन अग्रवाल',
  designation: 'Minister, Higher Education Department',
  designationHi: 'मंत्री, उच्च शिक्षा विभाग',
  image: '/images/minister.jpg',
  message: 'Welcome to the Higher Education Department of Chhattisgarh. We are committed to providing quality education and creating opportunities for all students.',
  messageHi: 'छत्तीसगढ़ के उच्च शिक्षा विभाग में आपका स्वागत है। हम गुणवत्तापूर्ण शिक्षा प्रदान करने और सभी छात्रों के लिए अवसर सृजित करने के लिए प्रतिबद्ध हैं।'
};

// Quick Updates/Notifications
export const quickUpdates = [
  {
    id: 1,
    title: 'Examination Schedule Released',
    titleHi: 'परीक्षा कार्यक्रम जारी',
    date: '2024-12-15',
    type: 'exam',
    link: '/downloads/notifications'
  },
  {
    id: 2,
    title: 'Holiday List 2025',
    titleHi: 'अवकाश सूची 2025',
    date: '2024-12-14',
    type: 'holiday',
    link: '/downloads/notifications'
  },
  {
    id: 3,
    title: 'Fee Structure Updated',
    titleHi: 'शुल्क संरचना अद्यतन',
    date: '2024-12-12',
    type: 'fee',
    link: '/downloads/notifications'
  },
  {
    id: 4,
    title: 'New Circular - Academic Calendar',
    titleHi: 'नया परिपत्र - शैक्षणिक कैलेंडर',
    date: '2024-12-10',
    type: 'circular',
    link: '/notice-board/circulars'
  }
];

// Statistics/Counters
export const departmentStats = [
  {
    id: 1,
    label: 'Universities',
    labelHi: 'विश्वविद्यालय',
    count: 15,
    icon: 'FaUniversity',
    color: 'primary'
  },
  {
    id: 2,
    label: 'Government Colleges',
    labelHi: 'शासकीय महाविद्यालय',
    count: 135,
    icon: 'FaSchool',
    color: 'success'
  },
  {
    id: 3,
    label: 'Private Colleges',
    labelHi: 'निजी महाविद्यालय',
    count: 296,
    icon: 'FaBuilding',
    color: 'info'
  },
  {
    id: 4,
    label: 'Total Students',
    labelHi: 'कुल छात्र',
    count: 325000,
    icon: 'FaUserGraduate',
    color: 'warning'
  }
];

