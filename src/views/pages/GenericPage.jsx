import { Row, Col, Card, CardBody } from 'reactstrap';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const GenericPage = ({ title, titleHi, content, contentHi }) => {
  const { isHindi } = useLanguage();

  return (
    <PageLayout
      title={title}
      titleHi={titleHi}
      showBreadcrumb={true}
    >
      <Row>
        <Col lg={12}>
          <Card className="border-0 shadow-sm hover-lift">
            <CardBody className="p-5">
              <div className="content-area" style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
                {isHindi ? (contentHi || content) : content}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </PageLayout>
  );
};

export default GenericPage;

