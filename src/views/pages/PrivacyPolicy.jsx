import React from 'react';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const PrivacyPolicy = () => {
  const { isHindi } = useLanguage();

  const breadcrumb = [
    { label: 'Home', labelHi: 'मुख्य पृष्ठ', link: '/' },
    { label: 'Privacy Policy', labelHi: 'गोपनीयता नीति' }
  ];

  return (
    <PageLayout 
      title="Privacy Policy" 
      titleHi="गोपनीयता नीति"
      breadcrumb={breadcrumb}
    >
      {isHindi ? (
        <>
          <h2>गोपनीयता नीति</h2>
          <p>
            उच्च शिक्षा विभाग, छत्तीसगढ़ सरकार की आधिकारिक वेबसाइट में आपका स्वागत है। 
            यह गोपनीयता नीति इस वेबसाइट के उपयोग के संबंध में व्यक्तिगत जानकारी के संग्रह और उपयोग के बारे में बताती है।
          </p>

          <h3>जानकारी का संग्रह</h3>
          <p>
            जब आप इस वेबसाइट पर जाते हैं, तो कुछ जानकारी स्वचालित रूप से एकत्र की जाती है, जैसे:
          </p>
          <ul>
            <li>आपका IP पता</li>
            <li>ब्राउज़र का प्रकार</li>
            <li>ऑपरेटिंग सिस्टम</li>
            <li>देखे गए पृष्ठ</li>
            <li>वेबसाइट पर बिताया गया समय</li>
          </ul>

          <h3>जानकारी का उपयोग</h3>
          <p>एकत्रित जानकारी का उपयोग निम्नलिखित उद्देश्यों के लिए किया जाता है:</p>
          <ul>
            <li>वेबसाइट की कार्यक्षमता में सुधार</li>
            <li>उपयोगकर्ता अनुभव को बेहतर बनाना</li>
            <li>वेबसाइट ट्रैफ़िक का विश्लेषण</li>
            <li>सुरक्षा और धोखाधड़ी की रोकथाम</li>
          </ul>

          <h3>कुकीज़</h3>
          <p>
            यह वेबसाइट आपके अनुभव को बेहतर बनाने के लिए कुकीज़ का उपयोग कर सकती है। 
            आप अपने ब्राउज़र सेटिंग्स के माध्यम से कुकीज़ को अक्षम कर सकते हैं।
          </p>

          <h3>तृतीय पक्ष लिंक</h3>
          <p>
            इस वेबसाइट में तृतीय पक्ष वेबसाइटों के लिंक हो सकते हैं। हम इन वेबसाइटों की गोपनीयता प्रथाओं के लिए जिम्मेदार नहीं हैं।
          </p>

          <h3>सुरक्षा</h3>
          <p>
            हम आपकी व्यक्तिगत जानकारी की सुरक्षा के लिए उचित तकनीकी और संगठनात्मक उपाय करते हैं।
          </p>

          <h3>नीति में परिवर्तन</h3>
          <p>
            हम समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं। कृपया नियमित रूप से इस पृष्ठ की जांच करें।
          </p>

          <h3>संपर्क करें</h3>
          <p>
            यदि आपके पास इस गोपनीयता नीति के बारे में कोई प्रश्न हैं, तो कृपया हमसे संपर्क करें:
          </p>
          <p>
            <strong>उच्च शिक्षा विभाग</strong><br />
            छत्तीसगढ़ सरकार<br />
            ईमेल: wim.higheredu-cg@gov.in
          </p>
        </>
      ) : (
        <>
          <h2>Privacy Policy</h2>
          <p>
            Welcome to the official website of the Higher Education Department, Government of Chhattisgarh. 
            This Privacy Policy explains how we collect and use personal information in connection with the use of this website.
          </p>

          <h3>Information Collection</h3>
          <p>
            When you visit this website, certain information is automatically collected, such as:
          </p>
          <ul>
            <li>Your IP address</li>
            <li>Browser type</li>
            <li>Operating system</li>
            <li>Pages viewed</li>
            <li>Time spent on the website</li>
          </ul>

          <h3>Use of Information</h3>
          <p>The collected information is used for the following purposes:</p>
          <ul>
            <li>Improving website functionality</li>
            <li>Enhancing user experience</li>
            <li>Analyzing website traffic</li>
            <li>Security and fraud prevention</li>
          </ul>

          <h3>Cookies</h3>
          <p>
            This website may use cookies to enhance your experience. 
            You can disable cookies through your browser settings.
          </p>

          <h3>Third-Party Links</h3>
          <p>
            This website may contain links to third-party websites. We are not responsible for the privacy practices of these websites.
          </p>

          <h3>Security</h3>
          <p>
            We take appropriate technical and organizational measures to protect your personal information.
          </p>

          <h3>Changes to Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. Please check this page regularly.
          </p>

          <h3>Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <p>
            <strong>Higher Education Department</strong><br />
            Government of Chhattisgarh<br />
            Email: wim.higheredu-cg@gov.in
          </p>
        </>
      )}
    </PageLayout>
  );
};

export default PrivacyPolicy;

