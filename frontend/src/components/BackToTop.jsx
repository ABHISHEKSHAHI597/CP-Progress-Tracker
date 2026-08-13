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
      className="
      fixed
      bottom-6
      right-6
      bg-blue-600
      hover:bg-blue-700
      text-white
      p-4
      rounded-full
      shadow-lg
      transition-all
      duration-300
      z-50
      "
    >
      <FaArrowUp />
    </button>
  );
}

export default BackToTop;