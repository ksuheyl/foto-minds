import { useRef } from "react";
import "./button.css";

const Button = ({ children, href = "#", className = "", style = {}, onClick }) => {
  const ref = useRef(null);

  const handleAnimate = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ref.current.style.setProperty("--x", `${x}px`);
    ref.current.style.setProperty("--y", `${y}px`);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault(); 
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <a
      ref={ref}
      href={href}
      className={`btn ${className}`}
      style={style}
      onMouseEnter={handleAnimate}
      onClick={handleClick}
    >
      <span>{children}</span>
    </a>
  );
};

export default Button;
