"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api";
import type { NodeQuizQuestion } from "@/lib/types";
import { IconLoader2, IconRefresh, IconCheck, IconX, IconHelpCircle } from "@tabler/icons-react";

interface NodeQuizTabProps {
  nodeId: string;
  nodeDescription?: string;
}

export const NodeQuizTab: React.FC<NodeQuizTabProps> = ({ nodeId, nodeDescription }) => {
  const [questions, setQuestions] = useState<NodeQuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Guard against generating for a node before its description has loaded
  const lastNodeRef = useRef<string | null>(null);

  // Reset when the node changes
  useEffect(() => {
    if (lastNodeRef.current !== nodeId) {
      lastNodeRef.current = nodeId;
      setQuestions([]);
      setAnswers({});
      setSubmitted(false);
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
    setSubmitted(false);
    setAnswers({});
    try {
      const res = await apiService.getMindMapNodeQuiz(nodeId, nodeDescription);
      if (res?.success && Array.isArray(res.questions) && res.questions.length > 0) {
        setQuestions(res.questions);
      } else {
        setError(res?.error || "Could not generate a quiz. Please try again.");
      }
    } catch (err) {
      console.error("Quiz generation failed:", err);
      setError("Could not generate a quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const score = questions.reduce(
    (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
    0
  );
  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-3">
        <IconLoader2 className="h-8 w-8 animate-spin text-blue-400" />
        <p>Generating quiz…</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4 px-6">
        <IconHelpCircle className="h-12 w-12 text-neutral-500" />
        <div>
          <h4 className="text-lg font-medium text-white mb-1">Test your understanding</h4>
          <p className="text-sm text-neutral-400">Generate a quiz based on this topic.</p>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          onClick={generate}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Generate Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-white">Quiz</h4>
        <button
          onClick={generate}
          className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
          title="Regenerate quiz"
        >
          <IconRefresh className="h-4 w-4" /> New quiz
        </button>
      </div>

      {submitted && (
        <div className="bg-neutral-800 border border-neutral-600 rounded-lg p-4 text-center">
          <p className="text-white font-medium">
            You scored <span className="text-blue-400">{score}</span> / {questions.length}
          </p>
        </div>
      )}

      {questions.map((q, qi) => {
        const chosen = answers[qi];
        return (
          <div key={qi} className="bg-neutral-800 border border-neutral-600 rounded-lg p-4">
            <p className="text-neutral-100 font-medium mb-3">
              {qi + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const isChosen = chosen === oi;
                const isCorrect = q.correctIndex === oi;
                let stateClass = "border-neutral-600 bg-neutral-700 hover:bg-neutral-600 text-neutral-200";
                if (submitted) {
                  if (isCorrect) stateClass = "border-green-500 bg-green-500/10 text-green-300";
                  else if (isChosen) stateClass = "border-red-500 bg-red-500/10 text-red-300";
                  else stateClass = "border-neutral-700 bg-neutral-800 text-neutral-400";
                } else if (isChosen) {
                  stateClass = "border-blue-500 bg-blue-500/10 text-white";
                }
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-md border transition-colors flex items-center justify-between gap-2",
                      stateClass,
                      submitted && "cursor-default"
                    )}
                  >
                    <span>{opt}</span>
                    {submitted && isCorrect && <IconCheck className="h-4 w-4 flex-shrink-0" />}
                    {submitted && isChosen && !isCorrect && <IconX className="h-4 w-4 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <p className="text-sm text-neutral-400 mt-3 border-t border-neutral-700 pt-3">
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}

      {!submitted && (
        <button
          onClick={() => setSubmitted(true)}
          disabled={!allAnswered}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {allAnswered ? "Submit answers" : `Answer all questions (${Object.keys(answers).length}/${questions.length})`}
        </button>
      )}
    </div>
  );
};

export default NodeQuizTab;
