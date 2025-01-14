import React from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb: React.FC = () => {
  const { currentPath, navigateTo } = useFileSystem();

  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <a
            href="#"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            onClick={() => navigateTo([])}
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </a>
        </li>
        {currentPath.map((folder, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight className="w-6 h-6 text-gray-400" />
              <a
                href="#"
                className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                onClick={() => navigateTo(currentPath.slice(0, index + 1))}
              >
                {folder}
              </a>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

