import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GlossaryTab from '@/components/library/GlossaryTab';
import StyleGuidesTab from '@/components/library/StyleGuidesTab';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('glossary');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Library</h1>
        <p className="text-muted-foreground">
          Manage glossary terms and style guides for your projects
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="glossary">Glossary</TabsTrigger>
          <TabsTrigger value="style-guides">Style Guides</TabsTrigger>
        </TabsList>

        <TabsContent value="glossary" className="mt-6">
          <GlossaryTab />
        </TabsContent>

        <TabsContent value="style-guides" className="mt-6">
          <StyleGuidesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
