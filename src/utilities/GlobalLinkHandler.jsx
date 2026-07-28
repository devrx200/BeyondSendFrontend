import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const GlobalLinkHandler = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const handleClick = (e) => {
      const anchor = e.target.closest("a");
      if (!anchor) return;
      let href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (!href) return;
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) return;
      if (target === "_blank") return;
      if (href.startsWith("#")) return;
      const base = window.location.pathname.split("/")[0]; 
      const basePath = base ? `/${base}` : "";

      if (href.startsWith(basePath)) {
        href = href.replace(basePath, "") || "/";
      }
      if (href.startsWith("/")) {
        e.preventDefault();
        navigate(href);
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 0);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [navigate]);
  return null;
};

export default GlobalLinkHandler;