import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { LoadingSpinner } from "./LoadingSpinner";

interface PostProps {
  post: {
    id: string;
    text_body: string;
    images?: string[];
    created_at: string;
    session_id?: string;
  };
}

interface Comment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  user_id?: string;
}

export default function Post({ post }: PostProps) {
  const [openComments, setOpenComments] = useState(false);
  const [comment, setComment] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const [session, setSession] = useState<any>(null);
  const [Loading, setLoading] = useState(false);
  const [commentsData, setCommentsData] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasLoadedComments, setHasLoadedComments] = useState(false); // New state to track if comments were ever loaded

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  });

  const getComments = async () => {
    if (hasLoadedComments) return; // Skip loading if we already have comments

    setLoading(true);
    try {
      // Add ordering at database level
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setCommentsData(data || []);
      setHasLoadedComments(true); // Mark comments as loaded
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    if (!comment || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newComment = {
        post_id: post.id,
        content: comment,
      };

      const { error, data } = await supabase
        .from("comments")
        .insert(newComment)
        .select()
        .single();

      if (error) throw error;

      // Optimistically update the UI
      setCommentsData((prev) => [...prev, data]);
      setComment("");

      // Quick visual feedback
      const button = document.getElementById("submitButton");
      if (button) button.textContent = "✓";
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment");
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
        const button = document.getElementById("submitButton");
        if (button) button.textContent = "Post";
      }, 500);
    }
  };

  const renderComments = () => {
    if (Loading) {
      return <LoadingSpinner />;
    }

    return commentsData.length > 0 ? (
      <div className="space-y-3">
        {commentsData.map((c) => (
          <div
            key={c.id}
            className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg
                   transform transition-all duration-200 hover:scale-[1.02]"
          >
            <p className="text-gray-800 dark:text-gray-200">{c.content}</p>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {c.user_id && `@${c.user_id}`} •
              {new Date(c.created_at).toLocaleDateString("en-UK", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        Be the first to comment!
      </div>
    );
  };

  const handleCommentsClick = () => {
    if (!openComments && !hasLoadedComments) {
      getComments();
    }
    setOpenComments(!openComments);
  };

  return (
    <div
      key={post.id}
      className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg 
               hover:shadow-xl transition-all duration-300 
               w-full border border-gray-200 dark:border-gray-700"
    >
      <p
        className={`text-gray-800 dark:text-gray-200 text-sm sm:text-base 
                   ${!post.images?.length ? "mb-2" : "mb-4"}`}
      >
        {post.text_body}
      </p>

      {post.images && post.images.length > 0 && (
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          <img
            alt="Post image"
            className="w-full h-full object-cover hover:scale-105 
                     transition-transform duration-300"
            src={post.images[0]}
            loading="lazy"
          />
        </div>
      )}

      <time className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 block">
        {new Date(post.created_at).toLocaleDateString("en-UK", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </time>

      <div className="mt-3 sm:mt-4 border-t dark:border-gray-700 pt-3 sm:pt-4">
        <button
          className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 
                   hover:text-blue-800 dark:hover:text-blue-300 
                   transition-colors duration-200 font-medium"
          onClick={handleCommentsClick}
        >
          {openComments ? "← Hide comments" : "Show comments →"}
        </button>

        {openComments && (
          <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
            {renderComments()}
            <div className="flex gap-2 mt-3 sm:mt-4">
              <input
                type="text"
                placeholder="Write a comment..."
                className="flex-1 px-2 py-2 sm:p-3 text-sm sm:text-base
                       bg-gray-50 dark:bg-gray-700 
                       border border-gray-200 dark:border-gray-600 
                       rounded-lg focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent outline-none 
                       transition-all duration-200"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                id="submitButton"
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg
                       text-sm sm:text-base font-medium 
                       hover:bg-blue-700 active:bg-blue-800
                       disabled:bg-gray-400 disabled:cursor-not-allowed
                       transition-all duration-200 min-w-[60px] sm:min-w-[80px]
                       transform active:scale-95"
                onClick={submitComment}
                disabled={!comment || isSubmitting}
              >
                {isSubmitting ? "..." : "Post"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
