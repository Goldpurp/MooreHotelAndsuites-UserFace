import React from 'react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: NotificationType;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type
}) => {
  if (!isOpen) return null;

  const icons = {
    success: 'verified',
    error: 'error',
    info: 'info'
  };

  const colors = {
    success: 'text-primary border-primary/20 bg-primary/5',
    error: 'text-red-500 border-red-500/20 bg-red-500/5',
    info: 'text-blue-400 border-blue-400/20 bg-blue-400/5'
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-surface-dark border border-white/10 p-8 sm:p-12 w-full max-w-md rounded-sm shadow-[0_30px_100px_rgba(0,0,0,1)] text-center space-y-8 animate-in zoom-in-95 duration-300">
        
        {/* Icon */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border ${colors[type]}`}>
          <span className="material-symbols-outlined text-4xl">{icons[type]}</span>
        </div>

        {/* Text */}
        <div className="space-y-4">
          <h3 className="serif-font text-3xl text-white italic">{title}</h3>
          <p className="text-gray-400 text-sm font-light leading-relaxed">{message}</p>
        </div>

        {/* Acknowledge Button */}
        <button
          onClick={onClose}
          className="w-full bg-primary text-black py-4 uppercase text-[10px] font-black tracking-[0.4em] hover:bg-yellow-500 transition-all shadow-xl shadow-primary/20 active:scale-95"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;
