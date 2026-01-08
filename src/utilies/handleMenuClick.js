// utilities/handleMenuClick.js
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const handleMenuClick = async ({ menu, navigate }) => {
  try {
    const pageId = menu._id;

    // 🔹 Fetch page content by menuId
    const res = await axios.get(`${API}/api/menu-page-data/${pageId}`);
    const pageData = res.data;
    // 🔹 External link
    if (menu.isExternal) {
      window.open(menu.path, menu.openInNewTab ? "_blank" : "_self");
      return;
    }



    // 🔹 Internal navigation (SINGLE PAGE)
    navigate(menu.path, {
      state: {
        pageId,
        pageData,
        menu,
      },
    });
  } catch (error) {
    console.error("Menu click failed", error);

    // 🔹 Safe fallback
    if (menu.isExternal) {
      window.open(menu.path, menu.openInNewTab ? "_blank" : "_self");
    } else {
      navigate(menu.path);
    }
  }
};
