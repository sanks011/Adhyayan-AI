"use client";

import React, { useEffect, useRef, useState } from "react";
import { apiService } from "@/lib/api";
import { IconDeviceFloppy, IconLoader2, IconCheck } from "@tabler/icons-react";

interface NodeSelfNotesTabProps {
  mindMapId: string;
  nodeId: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export const NodeSelfNotesTab: React.FC<NodeSelfNotesTabProps> = ({ mindMapId, nodeId }) => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track the value last persisted so we don't save unchanged text
  const savedValueRef = useRef<string>("");

  // Load the saved note whenever the node changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSaveState("idle");
    apiService
      .getSelfNotes(mindMapId, nodeId)
      .then((res) => {
        if (cancelled) return;
        const notes = res?.notes || "";
        setValue(notes);
        savedValueRef.current = notes;
      })
      .catch((err) => {
        console.error("Failed to load self-note:", err);
        if (!cancelled) {
          setValue("");
          savedValueRef.current = "";
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [mindMapId, nodeId]);

  const persist = async (text: string) => {
    if (text === savedValueRef.current) return;
    try {
      setSaveState("saving");
      await apiService.saveSelfNotes(mindMapId, nodeId, text);
      savedValueRef.current = text;
      setSaveState("saved");
    } catch (err) {
      console.error("Failed to save self-note:", err);
      setSaveState("error");
    }
  };

  const handleChange = (text: string) => {
    setValue(text);
    setSaveState("idle");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // ponytail: debounce autosave; explicit Save button covers immediate persistence
    debounceRef.current = setTimeout(() => persist(text), 1000);
  };

  const handleSaveNow = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    persist(value);
  };

  const statusLabel = () => {
    switch (saveState) {
      case "saving":
        return (
          <span className="flex items-center gap-1 text-neutral-400">
            <IconLoader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
          </span>
        );
      case "saved":
        return (
          <span className="flex items-center gap-1 text-green-400">
            <IconCheck className="h-3.5 w-3.5" /> Saved
          </span>
        );
      case "error":
        return <span className="text-red-400">Save failed — retrying on next edit</span>;
      default:
        return <span className="text-neutral-500">Auto-saves as you type</span>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-medium text-white">Your Notes</h4>
        <div className="text-xs">{statusLabel()}</div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3 flex-1">
          <div className="h-4 bg-neutral-700 rounded w-2/3" />
          <div className="h-4 bg-neutral-700 rounded w-1/2" />
          <div className="h-4 bg-neutral-700 rounded w-3/4" />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Write your own notes for this topic… They're saved to your account and synced across devices."
          className="flex-1 min-h-[240px] w-full resize-none rounded-lg bg-neutral-800 border border-neutral-600 focus:border-blue-500 focus:outline-none text-neutral-200 p-4 leading-relaxed placeholder:text-neutral-500"
        />
      )}

      <div className="flex justify-end mt-3">
        <button
          onClick={handleSaveNow}
          disabled={loading || saveState === "saving" || value === savedValueRef.current}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <IconDeviceFloppy className="h-4 w-4" />
          Save
        </button>
      </div>
    </div>
  );
};

export default NodeSelfNotesTab;
