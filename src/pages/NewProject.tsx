import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { createProject, startProject } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileUploadZone } from '@/components/projects/FileUploadZone';
import { ChevronLeft, ChevronRight, Rocket, Check } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { number: 1, title: 'Upload Source' },
  { number: 2, title: 'Configure' },
  { number: 3, title: 'Review & Start' },
];

const LANGUAGES = [
  { id: 'english', label: 'English' },
  { id: 'spanish', label: 'Spanish' },
];

const FORMATS = [
  { id: 'kindle', label: 'Kindle (EPUB)' },
  { id: 'pdf_print', label: 'PDF - Print' },
  { id: 'pdf_screen', label: 'PDF - Screen' },
];

const PROCESSING_MODES = [
  { id: 'testing', label: 'Testing Mode', description: 'Pause after each phase for review' },
  { id: 'supervised', label: 'Supervised Mode (Recommended)', description: 'Run automatically, notify on issues' },
  { id: 'autonomous', label: 'Autonomous Mode', description: 'Fully automatic processing' },
];

export default function NewProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);

  // Step 1: File upload
  const [uploadedFile, setUploadedFile] = useState<{ path: string; name: string; size: number } | null>(null);

  // Step 2: Configuration
  const [title, setTitle] = useState('');
  const [languages, setLanguages] = useState<string[]>(['english', 'spanish']);
  const [formats, setFormats] = useState<string[]>(['kindle', 'pdf_print', 'pdf_screen']);

  // Step 3: Processing mode
  const [processingMode, setProcessingMode] = useState('supervised');

  const handleFileUploaded = (filePath: string, fileName: string) => {
    // Get file size from name parsing (approximation)
    setUploadedFile({ path: filePath, name: fileName, size: 0 });
    
    // Pre-fill title
    const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setTitle(`Roofing ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}`);
  };

  const handleRemoveFile = async () => {
    if (uploadedFile) {
      await supabase.storage.from('source-books').remove([uploadedFile.path]);
      setUploadedFile(null);
      setTitle('');
    }
  };

  const toggleLanguage = (langId: string) => {
    setLanguages(prev =>
      prev.includes(langId)
        ? prev.filter(l => l !== langId)
        : [...prev, langId]
    );
  };

  const toggleFormat = (formatId: string) => {
    setFormats(prev =>
      prev.includes(formatId)
        ? prev.filter(f => f !== formatId)
        : [...prev, formatId]
    );
  };

  const canProceed = () => {
    if (step === 1) return !!uploadedFile;
    if (step === 2) return title.trim() && languages.length > 0 && formats.length > 0;
    return true;
  };

  const handleCreate = async () => {
    if (!user || !uploadedFile) return;

    setCreating(true);
    try {
      const projectId = await createProject({
        title: title.trim(),
        sourceTitle: uploadedFile.name.replace(/\.[^/.]+$/, ''),
        sourceFilePath: uploadedFile.path,
        outputLanguages: languages,
        outputFormats: formats,
        processingMode,
        userId: user.id,
      });

      await startProject(projectId);
      
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['active-projects'] });
      
      toast.success('Project created successfully!');
      navigate(`/projects/${projectId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.number} className="flex items-center">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium
                ${step >= s.number
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'}`}
            >
              {step > s.number ? <Check className="h-4 w-4" /> : s.number}
            </div>
            <span className={`ml-2 text-sm hidden sm:inline ${step >= s.number ? 'text-foreground' : 'text-muted-foreground'}`}>
              {s.title}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-8 sm:w-16 h-0.5 mx-2 ${step > s.number ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>Step {step} of 3: {STEPS[step - 1].title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Upload */}
          {step === 1 && (
            <FileUploadZone
              onFileUploaded={handleFileUploaded}
              uploadedFile={uploadedFile}
              onRemove={handleRemoveFile}
            />
          )}

          {/* Step 2: Configure */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Target Book Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter the target book title"
                />
                <p className="text-xs text-muted-foreground">
                  Pre-filled with "Roofing " + source filename
                </p>
              </div>

              <div className="space-y-3">
                <Label>Output Languages</Label>
                <div className="space-y-2">
                  {LANGUAGES.map((lang) => (
                    <div key={lang.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`lang-${lang.id}`}
                        checked={languages.includes(lang.id)}
                        onCheckedChange={() => toggleLanguage(lang.id)}
                      />
                      <label htmlFor={`lang-${lang.id}`} className="text-sm cursor-pointer">
                        {lang.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Output Formats</Label>
                <div className="space-y-2">
                  {FORMATS.map((format) => (
                    <div key={format.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`format-${format.id}`}
                        checked={formats.includes(format.id)}
                        onCheckedChange={() => toggleFormat(format.id)}
                      />
                      <label htmlFor={`format-${format.id}`} className="text-sm cursor-pointer">
                        {format.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Review & Start */}
          {step === 3 && (
            <>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Summary</h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Source:</span>
                      <span className="font-medium">{uploadedFile?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target:</span>
                      <span className="font-medium">{title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Languages:</span>
                      <span className="font-medium">
                        {languages.map(l => LANGUAGES.find(x => x.id === l)?.label).join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Formats:</span>
                      <span className="font-medium">
                        {formats.map(f => FORMATS.find(x => x.id === f)?.label).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Processing Mode</h3>
                  <RadioGroup value={processingMode} onValueChange={setProcessingMode}>
                    {PROCESSING_MODES.map((mode) => (
                      <div key={mode.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                        <RadioGroupItem value={mode.id} id={mode.id} className="mt-0.5" />
                        <label htmlFor={mode.id} className="cursor-pointer flex-1">
                          <div className="font-medium text-sm">{mode.label}</div>
                          <div className="text-xs text-muted-foreground">{mode.description}</div>
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        {step < 3 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
            Continue
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleCreate} disabled={creating || !canProceed()}>
            <Rocket className="h-4 w-4 mr-2" />
            {creating ? 'Creating...' : 'Start Processing'}
          </Button>
        )}
      </div>
    </div>
  );
}
