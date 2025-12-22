// Data Service - Controller Layer for fetching and managing data
import axios from 'axios';
import { navigationMenus } from '../models/NavigationModel';
import { heroSlides, quickLinks, announcements, statistics, featuredSchemes, importantLinks } from '../models/HomeModel';
import { departmentInfo, officeHours, keyOfficials, regionalOffices, socialMedia } from '../models/ContactModel';
import { latestNews, importantLinks as afterCarouselLinks, ministerMessage, quickUpdates, departmentStats } from '../models/AfterCarouselModel';

// API Base URL (can be configured for real backend)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class DataService {
  // Navigation Services
  getNavigationMenus() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(navigationMenus), 100);
    });
  }

  // Home Page Services
  getHeroSlides() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(heroSlides), 100);
    });
  }

  getQuickLinks() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(quickLinks), 100);
    });
  }

  getAnnouncements(limit = null) {
    return new Promise((resolve) => {
      const data = limit ? announcements.slice(0, limit) : announcements;
      setTimeout(() => resolve(data), 100);
    });
  }

  getStatistics() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(statistics), 100);
    });
  }

  getFeaturedSchemes() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(featuredSchemes), 100);
    });
  }

  getImportantLinks() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(importantLinks), 100);
    });
  }

  // Contact Services
  getDepartmentInfo() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(departmentInfo), 100);
    });
  }

  getOfficeHours() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(officeHours), 100);
    });
  }

  getKeyOfficials() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(keyOfficials), 100);
    });
  }

  getRegionalOffices() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(regionalOffices), 100);
    });
  }

  getSocialMedia() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(socialMedia), 100);
    });
  }

  // Form Submission Service
  async submitContactForm(formData) {
    try {
      // In production, this would call actual API
      // const response = await axios.post(`${API_BASE_URL}/contact`, formData);
      // return response.data;
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Your message has been sent successfully. We will contact you soon.'
          });
        }, 1000);
      });
    } catch (error) {
      throw new Error('Failed to submit form. Please try again.');
    }
  }

  // Search Service
  async searchContent(query) {
    try {
      // In production, this would call actual search API
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            results: [
              { id: 1, title: 'Sample Result 1', type: 'page', url: '/page1' },
              { id: 2, title: 'Sample Result 2', type: 'document', url: '/doc1' }
            ],
            total: 2
          });
        }, 500);
      });
    } catch (error) {
      throw new Error('Search failed. Please try again.');
    }
  }

  // Download Service
  async getDownloads(category = 'all') {
    return new Promise((resolve) => {
      const downloads = [
        { id: 1, title: 'Application Form 2024', category: 'forms', size: '250 KB', date: '2024-12-01', url: '#' },
        { id: 2, title: 'Scholarship Guidelines', category: 'notifications', size: '1.2 MB', date: '2024-11-28', url: '#' },
        { id: 3, title: 'Admission Circular', category: 'circulars', size: '500 KB', date: '2024-11-25', url: '#' },
        { id: 4, title: 'Annual Report 2023-24', category: 'reports', size: '5.5 MB', date: '2024-11-20', url: '#' }
      ];

      const filtered = category === 'all' ? downloads : downloads.filter(d => d.category === category);
      setTimeout(() => resolve(filtered), 100);
    });
  }

  // Visitor Counter Service
  getVisitorCount() {
    return new Promise((resolve) => {
      const count = Math.floor(Math.random() * 1000000) + 500000;
      setTimeout(() => resolve(count), 100);
    });
  }

  // After Carousel Content Services
  getLatestNews(limit = null) {
    return new Promise((resolve) => {
      const data = limit ? latestNews.slice(0, limit) : latestNews;
      setTimeout(() => resolve(data), 100);
    });
  }

  getImportantLinks() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(afterCarouselLinks), 100);
    });
  }

  getMinisterMessage() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(ministerMessage), 100);
    });
  }

  getQuickUpdates(limit = null) {
    return new Promise((resolve) => {
      const data = limit ? quickUpdates.slice(0, limit) : quickUpdates;
      setTimeout(() => resolve(data), 100);
    });
  }

  getDepartmentStats() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(departmentStats), 100);
    });
  }

  // Admin Services for After Carousel Content
  async addNews(newsData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'News added successfully' });
      }, 500);
    });
  }

  async updateNews(id, newsData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'News updated successfully' });
      }, 500);
    });
  }

  async deleteNews(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'News deleted successfully' });
      }, 500);
    });
  }

  async updateMinisterMessage(messageData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Minister message updated successfully' });
      }, 500);
    });
  }
}

export default new DataService();

