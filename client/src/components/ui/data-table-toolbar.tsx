import { Input } from '@/components/ui/input';
import { type ReactNode } from 'react';

interface DataTableToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
}

export function DataTableToolbar({ searchTerm, onSearchChange, placeholder, children }: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {children}
      </div>
    </div>
  );
}
