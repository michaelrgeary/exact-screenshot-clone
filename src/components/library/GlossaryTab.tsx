import { useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useGlossaryTerms, useAddGlossaryTerm, useUpdateGlossaryTerm, useDeleteGlossaryTerm, GlossaryTerm, GlossaryFormData } from '@/hooks/useLibrary';
import { useProjects } from '@/hooks/useProjects';

const ITEMS_PER_PAGE = 25;

export default function GlossaryTab() {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [deletingTerm, setDeletingTerm] = useState<GlossaryTerm | null>(null);

  const { data: terms = [], isLoading } = useGlossaryTerms(
    selectedProject === 'all' ? undefined : selectedProject,
    searchQuery || undefined
  );
  const { data: projects = [] } = useProjects();
  const addTerm = useAddGlossaryTerm();
  const updateTerm = useUpdateGlossaryTerm();
  const deleteTerm = useDeleteGlossaryTerm();

  const totalPages = Math.ceil(terms.length / ITEMS_PER_PAGE);
  const paginatedTerms = terms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSaveTerm = async (data: GlossaryFormData) => {
    if (editingTerm) {
      await updateTerm.mutateAsync({ id: editingTerm.id, data });
    } else {
      await addTerm.mutateAsync(data);
    }
    setIsAddModalOpen(false);
    setEditingTerm(null);
  };

  const handleDeleteTerm = async () => {
    if (deletingTerm) {
      await deleteTerm.mutateAsync(deletingTerm.id);
      setDeletingTerm(null);
    }
  };

  const truncateText = (text: string | null, maxLength = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Glossary</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Term
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>English</TableHead>
              <TableHead>Spanish</TableHead>
              <TableHead>Definition</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : paginatedTerms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No glossary terms found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTerms.map((term) => (
                <TableRow 
                  key={term.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setEditingTerm(term)}
                >
                  <TableCell className="font-medium">{term.english_term}</TableCell>
                  <TableCell>{term.spanish_term || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {truncateText(term.definition)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTerm(term);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingTerm(term);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(currentPage * ITEMS_PER_PAGE, terms.length)} of {terms.length} terms
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <TermModal
        isOpen={isAddModalOpen || !!editingTerm}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTerm(null);
        }}
        onSave={handleSaveTerm}
        term={editingTerm}
        projects={projects}
        isLoading={addTerm.isPending || updateTerm.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTerm} onOpenChange={() => setDeletingTerm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Term</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the term "{deletingTerm?.english_term}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTerm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface TermModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: GlossaryFormData) => Promise<void>;
  term: GlossaryTerm | null;
  projects: { id: string; title: string }[];
  isLoading: boolean;
}

function TermModal({ isOpen, onClose, onSave, term, projects, isLoading }: TermModalProps) {
  const [formData, setFormData] = useState<GlossaryFormData>({
    project_id: term?.project_id || '',
    english_term: term?.english_term || '',
    spanish_term: term?.spanish_term || '',
    definition: term?.definition || '',
    usage_notes: term?.usage_notes || '',
  });

  // Reset form when term changes
  useState(() => {
    if (term) {
      setFormData({
        project_id: term.project_id || '',
        english_term: term.english_term,
        spanish_term: term.spanish_term || '',
        definition: term.definition || '',
        usage_notes: term.usage_notes || '',
      });
    } else {
      setFormData({
        project_id: '',
        english_term: '',
        spanish_term: '',
        definition: '',
        usage_notes: '',
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{term ? 'Edit Glossary Term' : 'Add Glossary Term'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select
              value={formData.project_id}
              onValueChange={(value) => setFormData((d) => ({ ...d, project_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="english_term">English Term *</Label>
            <Input
              id="english_term"
              value={formData.english_term}
              onChange={(e) => setFormData((d) => ({ ...d, english_term: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spanish_term">Spanish Term</Label>
            <Input
              id="spanish_term"
              value={formData.spanish_term}
              onChange={(e) => setFormData((d) => ({ ...d, spanish_term: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="definition">Definition</Label>
            <Textarea
              id="definition"
              value={formData.definition}
              onChange={(e) => setFormData((d) => ({ ...d, definition: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usage_notes">Usage Notes (optional)</Label>
            <Textarea
              id="usage_notes"
              value={formData.usage_notes}
              onChange={(e) => setFormData((d) => ({ ...d, usage_notes: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.project_id || !formData.english_term}
            >
              {isLoading ? 'Saving...' : 'Save Term'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
