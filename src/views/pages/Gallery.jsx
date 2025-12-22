import { useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardImg, Modal, ModalBody, ModalHeader, Badge } from 'reactstrap';
import { FaCamera, FaCalendar } from 'react-icons/fa';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const Gallery = () => {
  const { isHindi } = useLanguage();
  const [modal, setModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const breadcrumb = [
    { label: isHindi ? 'मुख्य पृष्ठ' : 'Home', path: '/' },
    { label: isHindi ? 'चित्र प्रदर्शनी' : 'Photo Gallery', active: true }
  ];

  const galleryImages = [
    {
      id: 1,
      title: 'Convocation Ceremony 2024',
      titleHi: 'दीक्षांत समारोह 2024',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
      date: '2024-12-10',
      category: 'Events'
    },
    {
      id: 2,
      title: 'Campus Infrastructure',
      titleHi: 'परिसर बुनियादी ढांचा',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
      date: '2024-11-25',
      category: 'Campus'
    },
    {
      id: 3,
      title: 'Student Activities',
      titleHi: 'छात्र गतिविधियां',
      image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800',
      date: '2024-11-20',
      category: 'Activities'
    },
    {
      id: 4,
      title: 'Faculty Development Program',
      titleHi: 'संकाय विकास कार्यक्रम',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
      date: '2024-11-15',
      category: 'Programs'
    },
    {
      id: 5,
      title: 'Sports Day 2024',
      titleHi: 'खेल दिवस 2024',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
      date: '2024-11-10',
      category: 'Events'
    },
    {
      id: 6,
      title: 'Library Facilities',
      titleHi: 'पुस्तकालय सुविधाएं',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
      date: '2024-11-05',
      category: 'Campus'
    },
    {
      id: 7,
      title: 'Cultural Festival',
      titleHi: 'सांस्कृतिक उत्सव',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      date: '2024-10-30',
      category: 'Events'
    },
    {
      id: 8,
      title: 'Science Exhibition',
      titleHi: 'विज्ञान प्रदर्शनी',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
      date: '2024-10-25',
      category: 'Activities'
    }
  ];

  const toggleModal = (image = null) => {
    setSelectedImage(image);
    setModal(!modal);
  };

  return (
    <PageLayout 
      title={isHindi ? 'चित्र प्रदर्शनी' : 'Photo Gallery'} 
      titleHi="चित्र प्रदर्शनी"
      breadcrumb={breadcrumb}
    >
      <Container className="py-5">
        <Row>
          <Col lg={12}>
            <Card className="border-0 shadow-sm mb-4">
              <CardBody className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <FaCamera size={40} className="text-primary me-3" />
                  <div>
                    <h2 className="mb-1">{isHindi ? 'चित्र प्रदर्शनी' : 'Photo Gallery'}</h2>
                    <p className="text-muted mb-0">
                      {isHindi ? 'विभाग की गतिविधियों और कार्यक्रमों की झलकियां' : 'Glimpses of departmental activities and programs'}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          {galleryImages.map((item) => (
            <Col lg={3} md={4} sm={6} key={item.id}>
              <Card className="gallery-card border-0 shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => toggleModal(item)}>
                <CardImg
                  top
                  src={item.image}
                  alt={isHindi ? item.titleHi : item.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <CardBody>
                  <h6 className="mb-2">{isHindi ? item.titleHi : item.title}</h6>
                  <div className="d-flex justify-content-between align-items-center">
                    <Badge color="primary" pill>{item.category}</Badge>
                    <small className="text-muted">
                      <FaCalendar className="me-1" />
                      {new Date(item.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </small>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Image Modal */}
        <Modal isOpen={modal} toggle={() => toggleModal()} size="lg" centered>
          <ModalHeader toggle={() => toggleModal()}>
            {selectedImage && (isHindi ? selectedImage.titleHi : selectedImage.title)}
          </ModalHeader>
          <ModalBody>
            {selectedImage && (
              <>
                <img
                  src={selectedImage.image}
                  alt={isHindi ? selectedImage.titleHi : selectedImage.title}
                  className="img-fluid w-100"
                />
                <div className="mt-3 d-flex justify-content-between align-items-center">
                  <Badge color="primary" pill>{selectedImage.category}</Badge>
                  <small className="text-muted">
                    <FaCalendar className="me-1" />
                    {new Date(selectedImage.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </small>
                </div>
              </>
            )}
          </ModalBody>
        </Modal>
      </Container>

      <style jsx>{`
        .gallery-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .gallery-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </PageLayout>
  );
};

export default Gallery;

