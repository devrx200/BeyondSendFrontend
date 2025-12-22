import { useState, useEffect } from 'react';
import {
  Card, CardBody, Button, Table, Modal, ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, Input, Badge
} from 'reactstrap';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaArrowUp, FaArrowDown, FaBars } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
// import axios from 'axios'; // Will be used when API is ready

const MenuManagement = () => {
  const { isHindi } = useLanguage();
  const [menuItems, setMenuItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    titleHi: '',
    path: '',
    parentId: null,
    order: 0,
    isExternal: false,
    openInNewTab: false,
    active: true
  });

  useEffect(() => {
    loadMenuItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMenuItems = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Dummy menu data based on https://highereducation.cg.gov.in/
      const dummyMenuData = [
        {
          id: 1,
          title: 'Home',
          titleHi: 'मुख्य पृष्ठ',
          path: '/',
          parentId: null,
          order: 1,
          isExternal: false,
          openInNewTab: false,
          active: true,
          submenu: []
        },
        {
          id: 2,
          title: 'About Us',
          titleHi: 'हमारे बारे में',
          path: '/about',
          parentId: null,
          order: 2,
          isExternal: false,
          openInNewTab: false,
          active: true,
          submenu: [
            { id: 21, title: 'Growth of Colleges', titleHi: 'कॉलेजों का विकास', path: '/about/growth-colleges', parentId: 2, order: 1, isExternal: false, openInNewTab: false, active: true },
            { id: 22, title: 'Location of Colleges', titleHi: 'कॉलेजों के स्थान', path: '/about/location-colleges', parentId: 2, order: 2, isExternal: false, openInNewTab: false, active: true },
            { id: 23, title: 'Academic Calendar', titleHi: 'शैक्षणिक कैलेंडर', path: '/about/academic-calendar', parentId: 2, order: 3, isExternal: false, openInNewTab: false, active: true },
            { id: 24, title: 'Departmental Budget', titleHi: 'विभागीय बजट', path: '/about/budget', parentId: 2, order: 4, isExternal: false, openInNewTab: false, active: true },
            { id: 25, title: 'Annual Report', titleHi: 'वार्षिक प्रतिवेदन', path: '/about/annual-report', parentId: 2, order: 5, isExternal: false, openInNewTab: false, active: true },
            { id: 26, title: 'Acts and Rules', titleHi: 'महत्वपूर्ण नियम एवं अधिनियम', path: '/about/acts-rules', parentId: 2, order: 6, isExternal: false, openInNewTab: false, active: true },
            { id: 27, title: "Who's Who", titleHi: 'कौन क्या है', path: '/about/whos-who', parentId: 2, order: 7, isExternal: false, openInNewTab: false, active: true },
            { id: 28, title: 'Organization Chart', titleHi: 'संगठन चार्ट', path: '/about/organization-chart', parentId: 2, order: 8, isExternal: false, openInNewTab: false, active: true }
          ]
        },
        {
          id: 3,
          title: 'Services',
          titleHi: 'सेवाएं',
          path: '/services',
          parentId: null,
          order: 3,
          isExternal: false,
          openInNewTab: false,
          active: true,
          submenu: [
            { id: 31, title: 'Compassionate Appointment', titleHi: 'अनुकम्पा नियुक्ति', path: '/services/compassionate-appointment', parentId: 3, order: 1, isExternal: false, openInNewTab: false, active: true },
            { id: 32, title: 'Private Colleges', titleHi: 'अशासकीय महाविद्यालय', path: '/services/private-colleges', parentId: 3, order: 2, isExternal: false, openInNewTab: false, active: true },
            { id: 33, title: 'Web Application Portal', titleHi: 'वेब एप्लीकेशन पोर्टल', path: '/services/web-portal', parentId: 3, order: 3, isExternal: false, openInNewTab: false, active: true }
          ]
        },
        {
          id: 4,
          title: 'Notice Board',
          titleHi: 'सूचना पट्ट',
          path: '/notice-board',
          parentId: null,
          order: 4,
          isExternal: false,
          openInNewTab: false,
          active: true,
          submenu: [
            { id: 41, title: 'News', titleHi: 'समाचार', path: '/news', parentId: 4, order: 1, isExternal: false, openInNewTab: false, active: true },
            { id: 42, title: 'Tenders', titleHi: 'निविदाएं', path: '/tenders', parentId: 4, order: 2, isExternal: false, openInNewTab: false, active: true },
            { id: 43, title: 'Recruitment', titleHi: 'भर्ती', path: '/recruitment', parentId: 4, order: 3, isExternal: false, openInNewTab: false, active: true },
            { id: 44, title: 'Seniority List', titleHi: 'वरिष्ठता सूची', path: '/seniority-list', parentId: 4, order: 4, isExternal: false, openInNewTab: false, active: true },
            { id: 45, title: 'Circulars', titleHi: 'परिपत्र', path: '/circulars', parentId: 4, order: 5, isExternal: false, openInNewTab: false, active: true },
            { id: 46, title: 'Orders', titleHi: 'आदेश', path: '/orders', parentId: 4, order: 6, isExternal: false, openInNewTab: false, active: true },
            { id: 47, title: 'Minutes', titleHi: 'मिनट', path: '/minutes', parentId: 4, order: 7, isExternal: false, openInNewTab: false, active: true },
            { id: 48, title: 'Advertisement', titleHi: 'विज्ञापन', path: '/advertisement', parentId: 4, order: 8, isExternal: false, openInNewTab: false, active: true }
          ]
        },
        {
          id: 5,
          title: 'Right to Information',
          titleHi: 'सूचना का अधिकार',
          path: '/rti',
          parentId: null,
          order: 5,
          isExternal: false,
          openInNewTab: false,
          active: true,
          submenu: []
        },
        {
          id: 6,
          title: 'Photo Gallery',
          titleHi: 'चित्र प्रदर्शनी',
          path: '/gallery',
          parentId: null,
          order: 6,
          isExternal: false,
          openInNewTab: false,
          active: true,
          submenu: []
        },
        {
          id: 7,
          title: 'Contact Us',
          titleHi: 'हमसे संपर्क करें',
          path: '/contact',
          parentId: null,
          order: 7,
          isExternal: false,
          openInNewTab: false,
          active: true,
          submenu: []
        },
        {
          id: 8,
          title: 'Voter Service Portal',
          titleHi: 'मतदाता सेवा पोर्टल',
          path: 'https://voters.eci.gov.in/',
          parentId: null,
          order: 8,
          isExternal: true,
          openInNewTab: true,
          active: true,
          submenu: []
        },
        {
          id: 9,
          title: 'Professor Recruitment - 2024',
          titleHi: 'प्रोफेसर भर्ती - 2024',
          path: 'https://psc.cg.gov.in/index.htm',
          parentId: null,
          order: 9,
          isExternal: true,
          openInNewTab: true,
          active: true,
          submenu: []
        },
        {
          id: 10,
          title: 'National Education Policy-2020',
          titleHi: 'राष्ट्रीय शिक्षा नीति-2020',
          path: '/nep-2020',
          parentId: null,
          order: 10,
          isExternal: false,
          openInNewTab: false,
          active: true,
          submenu: [
            { id: 101, title: 'Orders / Instructions', titleHi: 'आदेश / निर्देश', path: '/nep-2020/orders', parentId: 10, order: 1, isExternal: false, openInNewTab: false, active: true },
            { id: 102, title: 'Curriculum', titleHi: 'पाठ्यक्रम', path: '/nep-2020/curriculum', parentId: 10, order: 2, isExternal: false, openInNewTab: false, active: true },
            { id: 103, title: 'Various Committees', titleHi: 'विभिन्न समितिया', path: '/nep-2020/committees', parentId: 10, order: 3, isExternal: false, openInNewTab: false, active: true },
            { id: 104, title: 'FAQs', titleHi: 'सामान्य प्रश्न', path: '/nep-2020/faqs', parentId: 10, order: 4, isExternal: false, openInNewTab: false, active: true }
          ]
        }
      ];

      setMenuItems(dummyMenuData);

      // When API is ready, use this:
      // const response = await axios.get('/api/menu-items');
      // setMenuItems(response.data);
    } catch (error) {
      console.error('Error loading menu items:', error);
      setMenuItems([]);
    }
  };

  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      setEditingItem(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleHi: '',
      path: '',
      parentId: null,
      order: 0,
      isExternal: false,
      openInNewTab: false,
      active: true
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      titleHi: item.titleHi,
      path: item.path,
      parentId: item.parentId || null,
      order: item.order || 0,
      isExternal: item.isExternal || false,
      openInNewTab: item.openInNewTab || false,
      active: item.active !== undefined ? item.active : true
    });
    toggleModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm(isHindi ? 'क्या आप वाकई इसे हटाना चाहते हैं?' : 'Are you sure you want to delete this?')) {
      try {
        // Remove item and its children
        const filterItems = (items) => {
          return items.filter(item => {
            if (item.id === id) return false;
            if (item.submenu && item.submenu.length > 0) {
              item.submenu = filterItems(item.submenu);
            }
            return true;
          });
        };

        setMenuItems(filterItems(menuItems));

        // When API is ready:
        // await axios.delete(`/api/menu-items/${id}`);
        // loadMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Update menu item
        const updateItems = (items) => {
          return items.map(item => {
            if (item.id === editingItem.id) {
              return { ...item, ...formData };
            }
            if (item.submenu && item.submenu.length > 0) {
              item.submenu = updateItems(item.submenu);
            }
            return item;
          });
        };

        setMenuItems(updateItems(menuItems));

        // When API is ready:
        // await axios.put(`/api/menu-items/${editingItem.id}`, formData);
      } else {
        // Add new menu item
        const newItem = {
          ...formData,
          id: Date.now(),
          submenu: []
        };

        if (formData.parentId) {
          // Add as submenu
          const addToParent = (items) => {
            return items.map(item => {
              if (item.id === parseInt(formData.parentId)) {
                return {
                  ...item,
                  submenu: [...item.submenu, newItem]
                };
              }
              if (item.submenu && item.submenu.length > 0) {
                item.submenu = addToParent(item.submenu);
              }
              return item;
            });
          };

          setMenuItems(addToParent(menuItems));
        } else {
          // Add as main menu
          setMenuItems([...menuItems, newItem]);
        }

        // When API is ready:
        // await axios.post('/api/menu-items', formData);
      }

      toggleModal();
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === '' ? null : value)
    }));
  };

  const moveItem = (index, direction) => {
    // In production, this would call API to reorder
    alert(isHindi ? 'मेनू क्रम बदला गया' : 'Menu order changed');
  };

  const renderMenuTree = (items, level = 0) => {
    return items.map((item, index) => (
      <div key={item.id}>
        <tr>
          <td style={{ paddingLeft: `${level * 30}px` }}>
            {level > 0 && <FaBars className="me-2 text-muted" />}
            {isHindi ? item.titleHi : item.title}
          </td>
          <td>
            <small className="text-muted">{item.path}</small>
          </td>
          <td>
            {item.isExternal ? (
              <Badge color="info">{isHindi ? 'बाहरी' : 'External'}</Badge>
            ) : (
              <Badge color="success">{isHindi ? 'आंतरिक' : 'Internal'}</Badge>
            )}
            {item.openInNewTab && (
              <Badge color="secondary" className="ms-1">{isHindi ? 'नया टैब' : 'New Tab'}</Badge>
            )}
          </td>
          <td>
            {item.active ? (
              <Badge color="success">{isHindi ? 'सक्रिय' : 'Active'}</Badge>
            ) : (
              <Badge color="danger">{isHindi ? 'निष्क्रिय' : 'Inactive'}</Badge>
            )}
          </td>
          <td>
            {item.submenu && item.submenu.length > 0 && (
              <Badge color="primary">{item.submenu.length}</Badge>
            )}
          </td>
          <td>
            <Button color="warning" size="sm" className="me-1" onClick={() => handleEdit(item)}>
              <FaEdit />
            </Button>
            <Button color="danger" size="sm" onClick={() => handleDelete(item.id)}>
              <FaTrash />
            </Button>
          </td>
        </tr>
        {item.submenu && item.submenu.length > 0 && renderMenuTree(item.submenu, level + 1)}
      </div>
    ));
  };

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>{isHindi ? 'मेनू प्रबंधन' : 'Menu Management'}</h4>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" />
            {isHindi ? 'नया मेनू जोड़ें' : 'Add Menu Item'}
          </Button>
        </div>

        <Table responsive striped hover>
          <thead>
            <tr>
              <th>{isHindi ? 'शीर्षक' : 'Title'}</th>
              <th>{isHindi ? 'पथ' : 'Path'}</th>
              <th>{isHindi ? 'प्रकार' : 'Type'}</th>
              <th>{isHindi ? 'स्थिति' : 'Status'}</th>
              <th>{isHindi ? 'उप-मेनू' : 'Submenu'}</th>
              <th>{isHindi ? 'कार्रवाई' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {renderMenuTree(menuItems)}
          </tbody>
        </Table>

        {/* Add/Edit Modal */}
        <Modal isOpen={modal} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>
            {editingItem
              ? (isHindi ? 'मेनू संपादित करें' : 'Edit Menu Item')
              : (isHindi ? 'नया मेनू जोड़ें' : 'Add Menu Item')
            }
          </ModalHeader>
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <div className="row">
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'शीर्षक (अंग्रेजी)' : 'Title (English)'}</Label>
                    <Input type="text" name="title" value={formData.title} onChange={handleChange} required />
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'शीर्षक (हिंदी)' : 'Title (Hindi)'}</Label>
                    <Input type="text" name="titleHi" value={formData.titleHi} onChange={handleChange} required />
                  </FormGroup>
                </div>
              </div>

              <FormGroup>
                <Label>{isHindi ? 'पथ / URL' : 'Path / URL'}</Label>
                <Input
                  type="text"
                  name="path"
                  value={formData.path}
                  onChange={handleChange}
                  placeholder={isHindi ? '/about या https://example.com' : '/about or https://example.com'}
                  required
                />
              </FormGroup>

              <div className="row">
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'मूल मेनू' : 'Parent Menu'}</Label>
                    <Input type="select" name="parentId" value={formData.parentId || ''} onChange={handleChange}>
                      <option value="">{isHindi ? 'कोई नहीं (मुख्य मेनू)' : 'None (Main Menu)'}</option>
                      {menuItems.filter(item => !item.parentId).map(item => (
                        <option key={item.id} value={item.id}>
                          {isHindi ? item.titleHi : item.title}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'क्रम' : 'Order'}</Label>
                    <Input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleChange}
                      min="0"
                    />
                  </FormGroup>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        name="isExternal"
                        checked={formData.isExternal}
                        onChange={handleChange}
                      />
                      {' '}{isHindi ? 'बाहरी लिंक' : 'External Link'}
                    </Label>
                  </FormGroup>
                </div>
                <div className="col-md-4">
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        name="openInNewTab"
                        checked={formData.openInNewTab}
                        onChange={handleChange}
                      />
                      {' '}{isHindi ? 'नए टैब में खोलें' : 'Open in New Tab'}
                    </Label>
                  </FormGroup>
                </div>
                <div className="col-md-4">
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleChange}
                      />
                      {' '}{isHindi ? 'सक्रिय' : 'Active'}
                    </Label>
                  </FormGroup>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" type="submit">
                <FaSave className="me-2" />
                {isHindi ? 'सहेजें' : 'Save'}
              </Button>
              <Button color="secondary" onClick={toggleModal}>
                <FaTimes className="me-2" />
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default MenuManagement;

