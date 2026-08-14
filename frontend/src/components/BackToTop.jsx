import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="
      fixed
      bottom-5
      right-5
      sm:bottom-6
      sm:right-6
      bg-blue-600
      hover:bg-blue-700
      text-white
      p-3.5
      sm:p-4
      rounded-full
      shadow-lg
      transition-all
      duration-300
      z-40
      "
    >
      <FaArrowUp size={14} className="sm:hidden" />
      <FaArrowUp className="hidden sm:block" />
    </button>
  );
}

export default BackToTop;