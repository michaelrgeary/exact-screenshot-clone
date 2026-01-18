import { FileText, Palette, Settings2 } from 'lucide-react';

export default function StyleGuidesTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <h2 className="text-xl font-semibold mb-2">Style Guides</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Style guide management coming soon.
      </p>
      
      <div className="text-left max-w-sm space-y-3">
        <p className="text-sm text-muted-foreground">This will allow you to:</p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-primary" />
            Create custom style guides
          </li>
          <li className="flex items-center gap-2 text-sm">
            <Palette className="h-4 w-4 text-primary" />
            Define tone and voice preferences
          </li>
          <li className="flex items-center gap-2 text-sm">
            <Settings2 className="h-4 w-4 text-primary" />
            Set formatting rules
          </li>
        </ul>
      </div>
    </div>
  );
}
