import React from 'react';

interface NavButtonProps {
  icon: React.ReactNode; // Use React.ReactNode for icons (like Heroicons)
  text: string;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, text, onClick }) => {
  return (
    <button
      className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50
                 text-stone-700 hover:bg-stone-200 hover:text-stone-800 focus:ring-stone-500
                 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-stone-100 dark:focus:ring-stone-400"
      onClick={onClick}
    >
      <div className="mr-3 h-5 w-5">{icon}</div>
      {text}
    </button>
  );
};

export default NavButton;