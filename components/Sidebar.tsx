import React, { useState } from 'react';
import { useFileSystem } from './FileSystemContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Folder, File, Search } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { searchFiles, searchRecords, selectFile } = useFileSystem();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ type: 'file' | 'record', item: any }>>([]);

  const handleSearch = () => {
    const fileResults = searchFiles(searchQuery).map(file => ({ type: 'file' as const, item: file }));
    const recordResults = searchRecords(searchQuery).map(record => ({ type: 'record' as const, item: record }));
    setSearchResults([...fileResults, ...recordResults]);
  };

  return (
    <div className="w-64 bg-gray-100 p-4 h-screen overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">File Management</h2>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search files/records"
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
        {searchResults.map((result, index) => (
          <div
            key={index}
            className="flex items-center p-2 hover:bg-gray-200 rounded cursor-pointer"
            onClick={() => {
              if (result.type === 'file') {
                selectFile(result.item);
              } else {
                // Handle record selection
                console.log('Record selected:', result.item);
              }
            }}
          >
            {result.type === 'file' ? (
              <Folder className="w-4 h-4 mr-2" />
            ) : (
              <File className="w-4 h-4 mr-2" />
            )}
            <span>{result.type === 'file' ? result.item.name : result.item.subject}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

