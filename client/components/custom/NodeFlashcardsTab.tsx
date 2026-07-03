"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiService } from "@/lib/api";
import type { Flashcard } from "@/lib/types";
import { IconLoader2, IconRefresh, IconChevronLeft, IconChevronRight, IconCards, IconRotate } from "@tabler/icons-react";

interface NodeFlashcardsTabProps {
  nodeId: string;
  nodeDescription?: string;
}

export const NodeFlashcardsTab: React.FC<NodeFlashcardsTabProps> = ({ nodeId, nodeDescription }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastNodeRef = useRef<string | null>(null);

  // Reset when the node changes
  useEffect(() => {
    if (lastNodeRef.current !== nodeId) {
      lastNodeRef.current = nodeId;
      setCards([]);
      setIndex(0);
      setFlipped(false);
      setError(null);
      setLoading(false);
    }
  }, [nodeId]);

  const generate = async () => {
    if (!nodeDescription) {
      setError("Topic content is still loading. Open the Notes tab first, then try again.");
      return;
    }
    setLoading(true);
    setError(null);
    setIndex(0);
    setFlipped(false);
    try {
      const res = await apiService.getMindMapNodeFlashcards(nodeId, nodeDescription);
      if (res?.success && Array.isArray(res.flashcards) && res.flashcards.length > 0) {
        setCards(res.flashcards);
      } else {
        setError(res?.error || "Could not generate flashcards. Please try again.");
      }
    } catch (err) {
      console.error("Flashcard generation failed:", err);
      setError("Could not generate flashcards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const go = (delta: number) => {
    setFlipped(false);
    setIndex((i) => Math.max(0, Math.min(cards.length - 1, i + delta)));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-3">
        <IconLoader2 className="h-8 w-8 animate-spin text-blue-400" />
        <p>Generating flashcards…</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4 px-6">
        <IconCards className="h-12 w-12 text-neutral-500" />
        <div>
          <h4 className="text-lg font-medium text-white mb-1">Study with flashcards</h4>
          <p className="text-sm text-neutral-400">Generate flashcards based on this topic.</p>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          onClick={generate}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Generate Flashcards
        </button>
      </div>
    );
  }

  const card = cards[index];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-white">
          Flashcards <span className="text-sm text-neutral-400">({index + 1}/{cards.length})</span>
        </h4>
        <button
          onClick={generate}
          className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
          title="Regenerate flashcards"
        >
          <IconRefresh className="h-4 w-4" /> New set
        </button>
      </div>

      {/* Flip card */}
      <button
        onClick={() => setFlipped((f) => !f)}
        className="relative flex-1 min-h-[220px] w-full"
        style={{ perspective: "1000px" }}
        aria-label="Flip card"
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`${index}-${flipped ? "back" : "front"}`}
            initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={
              "absolute inset-0 flex flex-col items-center justify-center rounded-xl border p-6 text-center " +
              (flipped
                ? "bg-blue-950/40 border-blue-700"
                : "bg-neutral-800 border-neutral-600")
            }
          >
            <span className="text-xs uppercase tracking-wide text-neutral-500 mb-3">
              {flipped ? "Answer" : "Question"}
            </span>
            <p className="text-neutral-100 text-lg leading-relaxed">
              {flipped ? card.answer : card.question}
            </p>
            <span className="flex items-center gap-1 text-xs text-neutral-500 mt-4">
              <IconRotate className="h-3.5 w-3.5" /> Tap to flip
            </span>
          </motion.div>
        </AnimatePresence>
      </button>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-600 text-neutral-200 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
        >
          <IconChevronLeft className="h-4 w-4" /> Prev
        </button>
        <div className="flex gap-1">
          {cards.map((_, i) => (
            <span
              key={i}
              className={
                "h-1.5 rounded-full transition-all " +
                (i === index ? "w-4 bg-blue-400" : "w-1.5 bg-neutral-600")
              }
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          disabled={index === cards.length - 1}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-600 text-neutral-200 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Next <IconChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NodeFlashcardsTab;
