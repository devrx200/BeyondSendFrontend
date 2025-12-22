import React from 'react';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const TermsConditions = () => {
  const { isHindi } = useLanguage();

  const breadcrumb = [
    { label: 'Home', labelHi: 'मुख्य पृष्ठ', link: '/' },
    { label: 'Terms & Conditions', labelHi: 'नियम और शर्तें' }
  ];

  return (
    <PageLayout 
      title="Terms & Conditions" 
      titleHi="नियम और शर्तें"
      breadcrumb={breadcrumb}
    >
      {isHindi ? (
        <>
          <h2>नियम और शर्तें</h2>
          <p>
            इस वेबसाइट का उपयोग करके, आप निम्नलिखित नियमों और शर्तों से सहमत होते हैं।
          </p>

          <h3>वेबसाइट का उपयोग</h3>
          <ul>
            <li>यह वेबसाइट केवल सूचनात्मक उद्देश्यों के लिए है</li>
            <li>सामग्री का उपयोग केवल वैध उद्देश्यों के लिए किया जाना चाहिए</li>
            <li>वेबसाइट की कार्यक्षमता में हस्तक्षेप करना प्रतिबंधित है</li>
            <li>अनधिकृत पहुंच का प्रयास कानूनी कार्रवाई का कारण बन सकता है</li>
          </ul>

          <h3>बौद्धिक संपदा</h3>
          <p>
            इस वेबसाइट पर सभी सामग्री, जिसमें पाठ, ग्राफिक्स, लोगो और चित्र शामिल हैं, 
            छत्तीसगढ़ सरकार की संपत्ति है और कॉपीराइट कानूनों द्वारा संरक्षित है।
          </p>

          <h3>अस्वीकरण</h3>
          <p>
            जबकि हम सटीक और अद्यतन जानकारी प्रदान करने का प्रयास करते हैं, 
            हम वेबसाइट पर सामग्री की पूर्णता या सटीकता की गारंटी नहीं देते हैं।
          </p>

          <h3>दायित्व की सीमा</h3>
          <p>
            छत्तीसगढ़ सरकार इस वेबसाइट के उपयोग से उत्पन्न किसी भी प्रत्यक्ष या अप्रत्यक्ष क्षति के लिए उत्तरदायी नहीं होगी।
          </p>

          <h3>शासी कानून</h3>
          <p>
            ये नियम और शर्तें भारत के कानूनों द्वारा शासित होती हैं।
          </p>
        </>
      ) : (
        <>
          <h2>Terms & Conditions</h2>
          <p>
            By using this website, you agree to the following terms and conditions.
          </p>

          <h3>Website Usage</h3>
          <ul>
            <li>This website is for informational purposes only</li>
            <li>Content should be used for lawful purposes only</li>
            <li>Interfering with website functionality is prohibited</li>
            <li>Unauthorized access attempts may result in legal action</li>
          </ul>

          <h3>Intellectual Property</h3>
          <p>
            All content on this website, including text, graphics, logos, and images, 
            is the property of the Government of Chhattisgarh and protected by copyright laws.
          </p>

          <h3>Disclaimer</h3>
          <p>
            While we strive to provide accurate and up-to-date information, 
            we do not guarantee the completeness or accuracy of the content on the website.
          </p>

          <h3>Limitation of Liability</h3>
          <p>
            The Government of Chhattisgarh shall not be liable for any direct or indirect damages arising from the use of this website.
          </p>

          <h3>Governing Law</h3>
          <p>
            These terms and conditions are governed by the laws of India.
          </p>
        </>
      )}
    </PageLayout>
  );
};

export default TermsConditions;

