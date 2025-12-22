import React from 'react';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const Disclaimer = () => {
  const { isHindi } = useLanguage();

  const breadcrumb = [
    { label: 'Home', labelHi: 'मुख्य पृष्ठ', link: '/' },
    { label: 'Disclaimer', labelHi: 'खंडन' }
  ];

  return (
    <PageLayout 
      title="Disclaimer" 
      titleHi="खंडन"
      breadcrumb={breadcrumb}
    >
      {isHindi ? (
        <>
          <h2>खंडन</h2>
          <p>
            इस वेबसाइट पर दी गई जानकारी केवल सामान्य सूचना उद्देश्यों के लिए है।
          </p>

          <h3>सामग्री की सटीकता</h3>
          <p>
            हालांकि हम इस वेबसाइट पर सटीक और अद्यतन जानकारी प्रदान करने का प्रयास करते हैं, 
            हम किसी भी प्रकार की, व्यक्त या निहित, कोई प्रतिनिधित्व या वारंटी नहीं देते हैं।
          </p>

          <h3>बाहरी लिंक</h3>
          <p>
            इस वेबसाइट में अन्य वेबसाइटों के लिंक हो सकते हैं जो हमारे नियंत्रण में नहीं हैं। 
            हम इन बाहरी साइटों की सामग्री या गोपनीयता प्रथाओं के लिए कोई जिम्मेदारी नहीं लेते हैं।
          </p>

          <h3>पेशेवर सलाह</h3>
          <p>
            इस वेबसाइट पर जानकारी पेशेवर सलाह का विकल्प नहीं है। 
            किसी भी कार्रवाई करने से पहले उपयुक्त पेशेवर सलाह लें।
          </p>

          <h3>परिवर्तन</h3>
          <p>
            हम बिना किसी पूर्व सूचना के किसी भी समय इस वेबसाइट की सामग्री को संशोधित या हटा सकते हैं।
          </p>

          <h3>दायित्व</h3>
          <p>
            इस वेबसाइट के उपयोग से उत्पन्न किसी भी हानि या क्षति के लिए हम उत्तरदायी नहीं होंगे।
          </p>
        </>
      ) : (
        <>
          <h2>Disclaimer</h2>
          <p>
            The information provided on this website is for general informational purposes only.
          </p>

          <h3>Accuracy of Content</h3>
          <p>
            While we strive to provide accurate and up-to-date information on this website, 
            we make no representations or warranties of any kind, express or implied.
          </p>

          <h3>External Links</h3>
          <p>
            This website may contain links to other websites that are not under our control. 
            We have no responsibility for the content or privacy practices of these external sites.
          </p>

          <h3>Professional Advice</h3>
          <p>
            The information on this website is not a substitute for professional advice. 
            Seek appropriate professional advice before taking any action.
          </p>

          <h3>Changes</h3>
          <p>
            We may modify or remove the content of this website at any time without prior notice.
          </p>

          <h3>Liability</h3>
          <p>
            We shall not be liable for any loss or damage arising from the use of this website.
          </p>
        </>
      )}
    </PageLayout>
  );
};

export default Disclaimer;

