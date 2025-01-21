import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 shadow-md w-96">
        <button
          onClick={onClose}
          className="text-red-500 font-bold float-right"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
