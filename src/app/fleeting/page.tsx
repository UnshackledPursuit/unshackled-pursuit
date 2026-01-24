"use client";

import { useState, useEffect } from "react";
import { createClient, Thought } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, LogOut, Trash2, GripVertical } from "lucide-react";
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
  { id: "inbox", title: "Inbox", color: "bg-blue-500" },
  { id: "processing", title: "Processing", color: "bg-yellow-500" },
  { id: "routed", title: "Routed", color: "bg-purple-500" },
  { id: "done", title: "Done", color: "bg-green-500" },
] as const;

type ColumnId = (typeof COLUMNS)[number]["id"];

function ThoughtCard({
  thought,
  onDelete,
  isDragging,
}: {
  thought: Thought;
  onDelete: (id: string) => void;
  isDragging?: boolean;
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="bg-zinc-800 border-zinc-700 cursor-grab active:cursor-grabbing"
    >
      <CardContent className="p-3">
        <div className="flex gap-2">
          <button
            {...attributes}
            {...listeners}
            className="text-zinc-500 hover:text-zinc-300 touch-none"
          >
            <GripVertical size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-200 mb-3">{thought.content}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {new Date(thought.captured_at).toLocaleDateString()}
              </span>
              <button
                onClick={() => onDelete(thought.id)}
                className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-red-400"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DroppableColumn({
  column,
  thoughts,
  onDelete,
}: {
  column: (typeof COLUMNS)[number];
  thoughts: Thought[];
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`bg-zinc-900 rounded-lg p-4 transition-colors ${
        isOver ? "ring-2 ring-zinc-500" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${column.color}`} />
        <h2 className="font-semibold">{column.title}</h2>
        <span className="ml-auto text-sm text-zinc-500">{thoughts.length}</span>
      </div>
      <div className="space-y-3 min-h-[100px]">
        {thoughts.map((thought) => (
          <ThoughtCard
            key={thought.id}
            thought={thought}
            onDelete={onDelete}
          />
        ))}
        {thoughts.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-4">Drop here</p>
        )}
      </div>
    </div>
  );
}

export default function FleetingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [newThought, setNewThought] = useState("");
  const [adding, setAdding] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeThought, setActiveThought] = useState<Thought | null>(null);

  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchThoughts();
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
  }

  async function addThought() {
    if (!newThought.trim() || !user) return;
    setAdding(true);

    const { data, error } = await supabase
      .from("fleeting_thoughts")
      .insert({
        content: newThought,
        user_id: user.id,
        content_type: "text",
        source: "manual",
        status: "inbox",
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

  async function deleteThought(id: string) {
    const { error } = await supabase
      .from("fleeting_thoughts")
      .delete()
      .eq("id", id);

    if (!error) {
      setThoughts(thoughts.filter(t => t.id !== id));
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

    // Check if dropped on a column
    const targetColumn = COLUMNS.find(c => c.id === overId);
    if (targetColumn) {
      const thought = thoughts.find(t => t.id === thoughtId);
      if (thought && thought.status !== targetColumn.id) {
        moveThought(thoughtId, targetColumn.id);
      }
      return;
    }

    // Check if dropped on another thought (move to that thought's column)
    const targetThought = thoughts.find(t => t.id === overId);
    if (targetThought) {
      const thought = thoughts.find(t => t.id === thoughtId);
      if (thought && thought.status !== targetThought.status) {
        moveThought(thoughtId, targetThought.status as ColumnId);
      }
    }
  }

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
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
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
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Fleeting Thoughts</h1>
            <p className="text-zinc-400 mt-1">Capture. Process. Route. Execute.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">{user.email}</span>
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
            placeholder="Quick capture a thought..."
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
            const columnThoughts = thoughts.filter((t) => t.status === column.id);
            return (
              <DroppableColumn
                key={column.id}
                column={column}
                thoughts={columnThoughts}
                onDelete={deleteThought}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeThought ? (
            <Card className="bg-zinc-800 border-zinc-500 shadow-xl rotate-3">
              <CardContent className="p-3">
                <p className="text-sm text-zinc-200">{activeThought.content}</p>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
