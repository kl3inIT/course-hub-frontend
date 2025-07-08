"use client";

import FeedbackDetail from "@/components/feedback/FeedbackDetail";
import { Button } from "@/components/ui/button";
import { getFeedbackById } from "@/services/feedback-api";
import { Loader2, X } from "lucide-react";
import React, { createContext, useContext, useEffect, useState } from "react";

type Feedback = any; // Đổi thành đúng type nếu có

interface FeedbackDetailContextType {
  showFeedback: (id: number) => void;
  closeFeedback: () => void;
}

const FeedbackDetailContext = createContext<FeedbackDetailContextType | undefined>(undefined);

export function useFeedbackDetail() {
  return useContext(FeedbackDetailContext)!;
}

export function FeedbackDetailProvider({ children }: { children: React.ReactNode }) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);

  const showFeedback = async (id: number) => {
    try {
      setLoading(true);
      const response = await getFeedbackById(id);
      setFeedback(response.data?.data || response.data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      alert("Không thể tải chi tiết feedback!");
    } finally {
      setLoading(false);
    }
  };

  const closeFeedback = () => {
    setFeedback(null);
    setLoading(false);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (feedback || loading)) {
        closeFeedback();
      }
    };

    if (feedback || loading) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [feedback, loading]);

  return (
    <FeedbackDetailContext.Provider value={{ showFeedback, closeFeedback }}>
      {children}
      {(feedback || loading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Chi tiết Feedback</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeFeedback}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Đang tải chi tiết feedback...</span>
              </div>
            ) : (
              <FeedbackDetail feedback={feedback} />
            )}
          </div>
        </div>
      )}
    </FeedbackDetailContext.Provider>
  );
} 