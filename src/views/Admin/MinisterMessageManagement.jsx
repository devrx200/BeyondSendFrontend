import { useState, useEffect } from 'react';
import { 
  Card, CardBody, Button, Form, FormGroup, Label, Input, Row, Col 
} from 'reactstrap';
import { FaSave, FaImage } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import DataService from '../../services/DataService';

const MinisterMessageManagement = () => {
  const { isHindi } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    nameHi: '',
    designation: '',
    designationHi: '',
    image: '',
    message: '',
    messageHi: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMinisterMessage();
  }, []);

  const loadMinisterMessage = async () => {
    try {
      const data = await DataService.getMinisterMessage();
      if (data) {
        setFormData({
          name: data.name,
          nameHi: data.nameHi,
          designation: data.designation,
          designationHi: data.designationHi,
          image: data.image,
          message: data.message,
          messageHi: data.messageHi
        });
        setImagePreview(data.image);
      }
    } catch (error) {
      console.error('Error loading minister message:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await DataService.updateMinisterMessage(formData);
      alert(isHindi ? 'संदेश सफलतापूर्वक अपडेट किया गया' : 'Message updated successfully');
    } catch (error) {
      console.error('Error saving minister message:', error);
      alert(isHindi ? 'त्रुटि: संदेश सहेजने में विफल' : 'Error: Failed to save message');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <h4 className="mb-4">{isHindi ? 'मंत्री संदेश प्रबंधन' : 'Minister Message Management'}</h4>
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>{isHindi ? 'नाम (अंग्रेजी)' : 'Name (English)'}</Label>
                <Input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>{isHindi ? 'नाम (हिंदी)' : 'Name (Hindi)'}</Label>
                <Input 
                  type="text" 
                  name="nameHi" 
                  value={formData.nameHi} 
                  onChange={handleChange} 
                  required 
                />
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>{isHindi ? 'पदनाम (अंग्रेजी)' : 'Designation (English)'}</Label>
                <Input 
                  type="text" 
                  name="designation" 
                  value={formData.designation} 
                  onChange={handleChange} 
                  required 
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>{isHindi ? 'पदनाम (हिंदी)' : 'Designation (Hindi)'}</Label>
                <Input 
                  type="text" 
                  name="designationHi" 
                  value={formData.designationHi} 
                  onChange={handleChange} 
                  required 
                />
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>{isHindi ? 'फोटो अपलोड करें' : 'Upload Photo'}</Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
                {/* {imagePreview && (
                  <div className="mt-3">
                    <img 
                      src={imagePreview} 
                      alt="Minister" 
                      className="img-thumbnail" 
                      style={{ maxWidth: '200px', maxHeight: '250px' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x250?text=Minister';
                      }}
                    />
                  </div>
                )} */}
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label>{isHindi ? 'संदेश (अंग्रेजी)' : 'Message (English)'}</Label>
            <Input 
              type="textarea" 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              rows="4"
              required 
            />
          </FormGroup>

          <FormGroup>
            <Label>{isHindi ? 'संदेश (हिंदी)' : 'Message (Hindi)'}</Label>
            <Input 
              type="textarea" 
              name="messageHi" 
              value={formData.messageHi} 
              onChange={handleChange} 
              rows="4"
              required 
            />
          </FormGroup>

          <Button color="primary" type="submit" disabled={saving}>
            <FaSave className="me-2" />
            {saving 
              ? (isHindi ? 'सहेजा जा रहा है...' : 'Saving...') 
              : (isHindi ? 'सहेजें' : 'Save')
            }
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default MinisterMessageManagement;

