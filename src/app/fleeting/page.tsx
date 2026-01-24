"use client";

import { useState, useEffect, Fragment } from "react";
import { createClient, Thought, Project, PRIORITIES, DESTINATIONS, Priority, Destination } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Loader2,
  LogOut,
  Trash2,
  GripVertical,
  X,
  Tag,
  FolderOpen,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Circle,
  CheckCircle2,
  Clock,
  Archive,
  Pencil,
  Link as LinkIcon,
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";

const ALLOWED_EMAILS = ["unshackledpursuit@gmail.com", "drussell2381@gmail.com"];

const COLUMNS = [
  { id: "inbox", title: "Inbox", color: "bg-blue-500", icon: Circle },
  { id: "processing", title: "Processing", color: "bg-yellow-500", icon: Clock },
  { id: "routed", title: "Routed", color: "bg-purple-500", icon: ExternalLink },
  { id: "done", title: "Done", color: "bg-green-500", icon: CheckCircle2 },
] as const;

type ColumnId = (typeof COLUMNS)[number]["id"];

// Edit Modal Component
function EditModal({
  thought,
  projects,
  onClose,
  onSave,
  onDelete,
}: {
  thought: Thought;
  projects: Project[];
  onClose: () => void;
  onSave: (updates: Partial<Thought>) => void;
  onDelete: () => void;
}) {
  const [content, setContent] = useState(thought.content);
  const [priority, setPriority] = useState<Priority | "">(thought.priority || "");
  const [projectId, setProjectId] = useState(thought.project_id || "");
  const [tags, setTags] = useState(thought.tags?.join(", ") || "");
  const [destination, setDestination] = useState<Destination | "">(thought.suggested_destination || "");
  const [url, setUrl] = useState(thought.url || "");

  const handleSave = () => {
    onSave({
      content,
      priority: priority || null,
      project_id: projectId || null,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : null,
      suggested_destination: destination || null,
      url: url || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold">Edit Thought</h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Content */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-zinc-50 focus:outline-none focus:border-zinc-500 min-h-[100px]"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">URL (optional)</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-zinc-50 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Priority & Project Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority | "")}
                className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-zinc-50 focus:outline-none focus:border-zinc-500"
              >
                <option value="">None</option>
                {Object.entries(PRIORITIES).map(([key, val]) => (
                  <option key={key} value={key}>{val.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-zinc-50 focus:outline-none focus:border-zinc-500"
              >
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="idea, feature, bug..."
              className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-zinc-50 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Route To</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(DESTINATIONS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setDestination(destination === key ? "" : key as Destination)}
                  className={`p-2 rounded border text-sm flex items-center gap-2 ${
                    destination === key
                      ? "border-zinc-500 bg-zinc-800"
                      : "border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  <span>{val.icon}</span>
                  <span>{val.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Analysis (read-only) */}
          {thought.ai_analysis && (
            <div>
              <label className="block text-sm text-zinc-400 mb-1 flex items-center gap-1">
                <Sparkles size={14} />
                AI Analysis
              </label>
              <div className="p-3 rounded bg-zinc-800/50 border border-zinc-700 text-sm text-zinc-300">
                {thought.ai_analysis}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-zinc-500 flex gap-4">
            <span>Captured: {new Date(thought.captured_at).toLocaleString()}</span>
            {thought.processed_at && (
              <span>Processed: {new Date(thought.processed_at).toLocaleString()}</span>
            )}
            <span>Source: {thought.source}</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-zinc-800">
          <Button
            variant="outline"
            onClick={onDelete}
            className="border-red-800 text-red-400 hover:bg-red-950"
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="border-zinc-700">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-white text-zinc-950 hover:bg-zinc-200">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Project Modal
function ProjectModal({
  project,
  onClose,
  onSave,
  onDelete,
}: {
  project: Project | null;
  onClose: () => void;
  onSave: (data: { name: string; description: string; color: string }) => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [color, setColor] = useState(project?.color || "#3b82f6");

  const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#64748b"];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold">{project ? "Edit Project" : "New Project"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-zinc-50 focus:outline-none focus:border-zinc-500"
              placeholder="Project name..."
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-zinc-50 focus:outline-none focus:border-zinc-500"
              placeholder="What's this project about?"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Color</label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full ${color === c ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-zinc-800">
          {project && onDelete ? (
            <Button
              variant="outline"
              onClick={onDelete}
              className="border-red-800 text-red-400 hover:bg-red-950"
            >
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="border-zinc-700">
              Cancel
            </Button>
            <Button
              onClick={() => onSave({ name, description, color })}
              disabled={!name.trim()}
              className="bg-white text-zinc-950 hover:bg-zinc-200"
            >
              {project ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Thought Card Component
function ThoughtCard({
  thought,
  projects,
  onDelete,
  onEdit,
}: {
  thought: Thought;
  projects: Project[];
  onDelete: (id: string) => void;
  onEdit: (thought: Thought) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: thought.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const project = projects.find(p => p.id === thought.project_id);
  const priority = thought.priority ? PRIORITIES[thought.priority] : null;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="bg-zinc-800 border-zinc-700 cursor-pointer hover:border-zinc-600 transition-colors"
      onClick={() => onEdit(thought)}
    >
      <CardContent className="p-3">
        <div className="flex gap-2">
          <button
            {...attributes}
            {...listeners}
            className="text-zinc-500 hover:text-zinc-300 touch-none cursor-grab"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={16} />
          </button>
          <div className="flex-1 min-w-0">
            {/* Priority & Project badges */}
            <div className="flex gap-1 mb-2 flex-wrap">
              {priority && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${priority.textColor} bg-zinc-700/50`}>
                  {priority.name}
                </span>
              )}
              {project && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded text-white/90"
                  style={{ backgroundColor: project.color + "40" }}
                >
                  {project.name}
                </span>
              )}
              {thought.is_actionable && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                  Actionable
                </span>
              )}
            </div>

            {/* Content */}
            <p className="text-sm text-zinc-200 mb-2 line-clamp-3">{thought.content}</p>

            {/* URL indicator */}
            {thought.url && (
              <div className="flex items-center gap-1 text-xs text-blue-400 mb-2">
                <LinkIcon size={12} />
                <span className="truncate">{thought.url_title || thought.url}</span>
              </div>
            )}

            {/* Tags */}
            {thought.tags && thought.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap mb-2">
                {thought.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs text-zinc-400 bg-zinc-700/50 px-1.5 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
                {thought.tags.length > 3 && (
                  <span className="text-xs text-zinc-500">+{thought.tags.length - 3}</span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {new Date(thought.captured_at).toLocaleDateString()}
              </span>
              <div className="flex gap-1">
                {thought.suggested_destination && (
                  <span className="text-xs" title={DESTINATIONS[thought.suggested_destination].name}>
                    {DESTINATIONS[thought.suggested_destination].icon}
                  </span>
                )}
                {thought.ai_analysis && (
                  <span title="AI processed">
                    <Sparkles size={12} className="text-purple-400" />
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(thought.id);
                  }}
                  className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Droppable Column
function DroppableColumn({
  column,
  thoughts,
  projects,
  onDelete,
  onEdit,
}: {
  column: (typeof COLUMNS)[number];
  thoughts: Thought[];
  projects: Project[];
  onDelete: (id: string) => void;
  onEdit: (thought: Thought) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const Icon = column.icon;

  return (
    <div
      ref={setNodeRef}
      className={`bg-zinc-900 rounded-lg p-4 transition-colors ${
        isOver ? "ring-2 ring-zinc-500" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className={column.color.replace("bg-", "text-")} />
        <h2 className="font-semibold">{column.title}</h2>
        <span className="ml-auto text-sm text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
          {thoughts.length}
        </span>
      </div>
      <div className="space-y-3 min-h-[100px]">
        {thoughts.map((thought) => (
          <ThoughtCard
            key={thought.id}
            thought={thought}
            projects={projects}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
        {thoughts.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-8">Drop here</p>
        )}
      </div>
    </div>
  );
}

// Main Page Component
export default function FleetingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newThought, setNewThought] = useState("");
  const [adding, setAdding] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeThought, setActiveThought] = useState<Thought | null>(null);
  const [editingThought, setEditingThought] = useState<Thought | null>(null);
  const [projectModal, setProjectModal] = useState<{ open: boolean; project: Project | null }>({
    open: false,
    project: null,
  });
  const [filterProject, setFilterProject] = useState<string | null>(null);
  const [showProjects, setShowProjects] = useState(true);

  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchThoughts();
      fetchProjects();
    }
  }, [user]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && !ALLOWED_EMAILS.includes(user.email || "")) {
      await supabase.auth.signOut();
      setUser(null);
    } else {
      setUser(user);
    }
    setLoading(false);
  }

  async function fetchThoughts() {
    const { data, error } = await supabase
      .from("fleeting_thoughts")
      .select("*")
      .order("captured_at", { ascending: false });

    if (data && !error) {
      setThoughts(data);
    }
  }

  async function fetchProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      setProjects(data);
    }
  }

  async function handleGoogleSignIn() {
    setAuthLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/fleeting`,
      },
    });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setThoughts([]);
    setProjects([]);
  }

  async function addThought() {
    if (!newThought.trim() || !user) return;
    setAdding(true);

    // Check if it's a URL
    const urlMatch = newThought.match(/^(https?:\/\/[^\s]+)$/);
    const isUrl = !!urlMatch;

    const { data, error } = await supabase
      .from("fleeting_thoughts")
      .insert({
        content: newThought,
        user_id: user.id,
        content_type: isUrl ? "link" : "text",
        source: "manual",
        status: "inbox",
        url: isUrl ? newThought : null,
      })
      .select()
      .single();

    if (data && !error) {
      setThoughts([data, ...thoughts]);
      setNewThought("");
    }
    setAdding(false);
  }

  async function moveThought(id: string, newStatus: ColumnId) {
    const { error } = await supabase
      .from("fleeting_thoughts")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setThoughts(thoughts.map(t =>
        t.id === id ? { ...t, status: newStatus } : t
      ));
    }
  }

  async function updateThought(id: string, updates: Partial<Thought>) {
    const { error } = await supabase
      .from("fleeting_thoughts")
      .update(updates)
      .eq("id", id);

    if (!error) {
      setThoughts(thoughts.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ));
      setEditingThought(null);
    }
  }

  async function deleteThought(id: string) {
    const { error } = await supabase
      .from("fleeting_thoughts")
      .delete()
      .eq("id", id);

    if (!error) {
      setThoughts(thoughts.filter(t => t.id !== id));
      setEditingThought(null);
    }
  }

  async function createProject(data: { name: string; description: string; color: string }) {
    if (!user) return;

    const { data: newProject, error } = await supabase
      .from("projects")
      .insert({
        ...data,
        user_id: user.id,
      })
      .select()
      .single();

    if (newProject && !error) {
      setProjects([newProject, ...projects]);
      setProjectModal({ open: false, project: null });
    }
  }

  async function updateProject(id: string, data: { name: string; description: string; color: string }) {
    const { error } = await supabase
      .from("projects")
      .update(data)
      .eq("id", id);

    if (!error) {
      setProjects(projects.map(p => p.id === id ? { ...p, ...data } : p));
      setProjectModal({ open: false, project: null });
    }
  }

  async function deleteProject(id: string) {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (!error) {
      setProjects(projects.filter(p => p.id !== id));
      setProjectModal({ open: false, project: null });
      if (filterProject === id) setFilterProject(null);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const thought = thoughts.find(t => t.id === event.active.id);
    setActiveThought(thought || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveThought(null);

    if (!over) return;

    const thoughtId = active.id as string;
    const overId = over.id as string;

    const targetColumn = COLUMNS.find(c => c.id === overId);
    if (targetColumn) {
      const thought = thoughts.find(t => t.id === thoughtId);
      if (thought && thought.status !== targetColumn.id) {
        moveThought(thoughtId, targetColumn.id);
      }
      return;
    }

    const targetThought = thoughts.find(t => t.id === overId);
    if (targetThought) {
      const thought = thoughts.find(t => t.id === thoughtId);
      if (thought && thought.status !== targetThought.status) {
        moveThought(thoughtId, targetThought.status as ColumnId);
      }
    }
  }

  // Filter thoughts
  const filteredThoughts = filterProject
    ? thoughts.filter(t => t.project_id === filterProject)
    : thoughts;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Fleeting Thoughts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-zinc-400 mb-6">
              Capture ideas. Process them. Route to action.
            </p>
            <Button
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-zinc-950 hover:bg-zinc-200 flex items-center justify-center gap-3"
              disabled={authLoading}
            >
              {authLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Edit Modal */}
      {editingThought && (
        <EditModal
          thought={editingThought}
          projects={projects}
          onClose={() => setEditingThought(null)}
          onSave={(updates) => updateThought(editingThought.id, updates)}
          onDelete={() => deleteThought(editingThought.id)}
        />
      )}

      {/* Project Modal */}
      {projectModal.open && (
        <ProjectModal
          project={projectModal.project}
          onClose={() => setProjectModal({ open: false, project: null })}
          onSave={(data) =>
            projectModal.project
              ? updateProject(projectModal.project.id, data)
              : createProject(data)
          }
          onDelete={
            projectModal.project
              ? () => deleteProject(projectModal.project!.id)
              : undefined
          }
        />
      )}

      <div className="flex">
        {/* Projects Sidebar */}
        <div className={`${showProjects ? "w-64" : "w-0"} transition-all overflow-hidden border-r border-zinc-800 h-screen sticky top-0`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <FolderOpen size={18} />
                Projects
              </h2>
              <button
                onClick={() => setProjectModal({ open: true, project: null })}
                className="p-1 hover:bg-zinc-800 rounded"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setFilterProject(null)}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  !filterProject ? "bg-zinc-800" : "hover:bg-zinc-800/50"
                }`}
              >
                All Thoughts
              </button>
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm cursor-pointer group ${
                    filterProject === project.id ? "bg-zinc-800" : "hover:bg-zinc-800/50"
                  }`}
                  onClick={() => setFilterProject(project.id)}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="flex-1 truncate">{project.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectModal({ open: true, project });
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="max-w-7xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowProjects(!showProjects)}
                  className="p-2 hover:bg-zinc-800 rounded lg:hidden"
                >
                  <FolderOpen size={20} />
                </button>
                <div>
                  <h1 className="text-3xl font-bold">Fleeting Thoughts</h1>
                  <p className="text-zinc-400 mt-1">
                    {filterProject
                      ? `Filtered by: ${projects.find(p => p.id === filterProject)?.name}`
                      : "Capture. Process. Route. Execute."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-400 hidden sm:block">{user.email}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Quick Add */}
            <div className="mt-6 flex gap-3">
              <input
                type="text"
                placeholder="Quick capture a thought or paste a URL..."
                value={newThought}
                onChange={(e) => setNewThought(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addThought()}
                className="flex-1 p-3 rounded bg-zinc-900 border border-zinc-800 text-zinc-50 focus:outline-none focus:border-zinc-600"
              />
              <Button
                onClick={addThought}
                disabled={adding || !newThought.trim()}
                className="bg-white text-zinc-950 hover:bg-zinc-200"
              >
                {adding ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-4 flex gap-4 text-sm text-zinc-500">
              <span>{filteredThoughts.filter(t => t.status === "inbox").length} in inbox</span>
              <span>{filteredThoughts.filter(t => t.ai_analysis).length} processed by AI</span>
              <span>{filteredThoughts.filter(t => t.status === "done").length} completed</span>
            </div>
          </div>

          {/* Kanban Board */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {COLUMNS.map((column) => {
                const columnThoughts = filteredThoughts.filter((t) => t.status === column.id);
                return (
                  <DroppableColumn
                    key={column.id}
                    column={column}
                    thoughts={columnThoughts}
                    projects={projects}
                    onDelete={deleteThought}
                    onEdit={setEditingThought}
                  />
                );
              })}
            </div>

            <DragOverlay>
              {activeThought ? (
                <Card className="bg-zinc-800 border-zinc-500 shadow-xl rotate-3 w-64">
                  <CardContent className="p-3">
                    <p className="text-sm text-zinc-200 line-clamp-2">{activeThought.content}</p>
                  </CardContent>
                </Card>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
