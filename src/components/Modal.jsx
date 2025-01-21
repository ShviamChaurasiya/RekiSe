import React, { useEffect } from "react";

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose(); // Close the modal when the Escape key is pressed
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-md sm:max-w-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Modal"
          className="text-red-500 font-bold text-lg float-right"
        >
          ×
        </button>

        {/* Modal Content */}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
