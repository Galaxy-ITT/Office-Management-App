import React, { useState } from 'react';
import { useFileSystem } from './FileSystemContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Folder, Search } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { searchFiles, selectFile } = useFileSystem();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; fileNumber: string }>>([]);

  const handleSearch = () => {
    const fileResults = searchFiles(searchQuery);
    setSearchResults(fileResults);
  };

  return (
    <div className="w-64 bg-gray-100 p-4 h-screen overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">File Management</h2>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search files"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-2"
        />
        <Button onClick={handleSearch} className="w-full">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>
      <div className="space-y-2">
        {searchResults.map((file) => (
          <div
            key={file.id}
            className="flex items-center p-2 hover:bg-gray-200 rounded cursor-pointer"
            onClick={() => selectFile(file)}
          >
            <Folder className="w-4 h-4 mr-2" />
            <div>
              <span className="block">{file.name}</span>
              <span className="text-xs text-gray-500">{file.fileNumber}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

