
import React, { useState, useEffect } from 'react';

interface AlertProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timerIn = setTimeout(() => setVisible(true), 10);
    
    // Set timeout to start animation out and then close
    const timerOut = setTimeout(() => {
      setVisible(false);
      // Allow animation to finish before calling parent's onClose
      setTimeout(onClose, 500); 
    }, 3000);

    return () => {
      clearTimeout(timerIn);
      clearTimeout(timerOut);
    };
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center text-white px-6 py-4 rounded-lg shadow-xl transform transition-all duration-500 ease-in-out ${bgColor} ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
    >
      <i className={`fas ${icon} mr-3 text-xl`}></i>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Alert;
