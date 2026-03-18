/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    Button,
} from "reactstrap";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

function HomeHelpGuidance() {
    const [data, setData] = useState([]);
    const [pdfPage, setPdfPage] = useState(1);
    const [videoPage, setVideoPage] = useState(1);

    useEffect(() => {
        fetchActiveHelp();
    }, []);

    const fetchActiveHelp = async () => {
        try {
            const res = await axios.get(
                `${API_URL}/api/get-active-help-guidance`
            );
            setData(res.data.data || []);
        } catch (error) {
            console.log("Failed to load Help & Guidance");
        }
    };

    // Reset page when data changes
    useEffect(() => {
        setPdfPage(1);
        setVideoPage(1);
    }, [data]);

    if (!data.length) return null;

    // Safe filtering
    const pdfData = data.filter(
        (item) => item.contentType?.toLowerCase() === "pdf"
    );

    const videoData = data.filter(
        (item) => item.contentType?.toLowerCase() === "video"
    );

    // Pagination logic
    const paginate = (items, page) => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return items.slice(start, start + ITEMS_PER_PAGE);
    };

    const totalPdfPages = Math.ceil(pdfData.length / ITEMS_PER_PAGE);
    const totalVideoPages = Math.ceil(videoData.length / ITEMS_PER_PAGE);

    const currentPdf = paginate(pdfData, pdfPage);
    const currentVideo = paginate(videoData, videoPage);

    return (
        <section className="py-5 bg-light">
            <Container>
                <h4 className="mb-4 text-center">Help & Guidance</h4>

                <Row>
                    {/* PDF Section */}
                    <Col md={6}>
                        <h5>PDF Documents</h5>

                        {currentPdf.map((item) => (
                            <Card key={item._id} className="mb-3 shadow-sm">
                                <CardBody>
                                    <h6>{item.title}</h6>
                                    <p className="text-muted small">
                                        {item.description}
                                    </p>

                                    <Button
                                        size="sm"
                                        color="danger"
                                        href={`${API_URL}${item.pdfUrl}`}
                                        target="_blank"
                                    >
                                        Download PDF
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}

                        {totalPdfPages > 1 && (
                            <div className="d-flex justify-content-between mt-3">
                                <Button
                                    size="sm"
                                    disabled={pdfPage === 1}
                                    onClick={() => setPdfPage((prev) => prev - 1)}
                                >
                                    Previous
                                </Button>

                                <span>
                                    Page {pdfPage} of {totalPdfPages}
                                </span>

                                <Button
                                    size="sm"
                                    disabled={pdfPage === totalPdfPages}
                                    onClick={() => setPdfPage((prev) => prev + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </Col>

                    {/* Video Section */}
                    <Col md={6}>
                        <h5>Videos</h5>

                        {currentVideo.map((item) => (
                            <Card key={item._id} className="mb-3 shadow-sm">
                                <CardBody>
                                    <h6>{item.title}</h6>
                                    <p className="text-muted small">
                                        {item.description}
                                    </p>

                                    <Button
                                        size="sm"
                                        color="primary"
                                        href={item.videoUrl}
                                        target="_blank"
                                    >
                                        Watch Video
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}

                        {totalVideoPages > 1 && (
                            <div className="d-flex justify-content-between mt-3">
                                <Button
                                    size="sm"
                                    disabled={videoPage === 1}
                                    onClick={() => setVideoPage((prev) => prev - 1)}
                                >
                                    Previous
                                </Button>

                                <span>
                                    Page {videoPage} of {totalVideoPages}
                                </span>

                                <Button
                                    size="sm"
                                    disabled={videoPage === totalVideoPages}
                                    onClick={() => setVideoPage((prev) => prev + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </section>
    );
}

export default HomeHelpGuidance;