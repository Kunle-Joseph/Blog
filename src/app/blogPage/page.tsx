"use client";
import { useState, useEffect } from "react";
import { PostUpload } from "../components/PostUpload";
import { Modal } from "../components/Modal";
import { supabase } from "../utils/supabase";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { UUID } from "crypto";
import Post from "../components/Posts";

interface PostData {
  text_body: string;
  user_id: string;
  images?: string[];
  created_at: string;
  id: UUID;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PostUploadProps {
  onImagesSelected: (files: File[]) => void;
  maxImages: number;
}

// Components
const Button = ({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className="w-32 sm:w-40 h-8 rounded-full bg-blue-600 text-white text-base sm:text-lg 
               font-semibold shadow hover:bg-blue-700 transition-all duration-200 
               transform hover:scale-105 active:scale-95 pointer-events-auto"
  >
    {children}
  </button>
);

const Header = ({ onUploadClick }: { onUploadClick: () => void }) => (
  <div className="header w-full flex justify-end gap-2 sm:gap-4 px-2 sm:px-4">
    <Button onClick={onUploadClick}>Upload Post</Button>
  </div>
);

const Footer = () => (
  <footer className="w-full text-center py-4">
    <p className="text-gray-500 text-sm">
      © {new Date().getFullYear()}{" "}
      <a
        href="https://www.linkedin.com/in/olakunle-joseph-3b9782223"
        className="text-blue-600 hover:underline"
        target="_blank"
      >
        Olakunle Joseph
      </a>
    </p>
  </footer>
);

const ScrollToTop = ({ getPosts }: { getPosts: () => Promise<void> }) => (
  <button
    className="fixed bottom-4 right-2 sm:right-4 bg-blue-600 text-white w-8 h-8 sm:w-10 sm:h-10 
               rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 
               transform hover:scale-105 flex items-center justify-center text-sm sm:text-base
               z-50"
    onClick={() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      getPosts();
    }}
  >
    ↑
  </button>
);

export default function BlogPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // Handlers
  const handleImagesSelected = (files: File[]) => {
    setSelectedImages(files);
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const getPosts = async () => {
    try {
      setIsLoadingPosts(true);
      const { data: fetchedPosts, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false }) // This ensures newest posts come first
        .limit(50); // Optional: limit number of posts fetched

      if (error) throw error;

      // Sort posts by date before setting state (additional safety check)
      const sortedPosts = fetchedPosts?.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPosts(sortedPosts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    getPosts();
  }, [isModalOpen]);

  const renderPosts = () => {
    if (isLoadingPosts) {
      return <LoadingSpinner />;
    }

    if (posts.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No posts available yet.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-2 sm:px-4">
        {posts.map((post) => {
          return <Post key={post.id} post={post} />;
        })}
      </div>
    );
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-900 transition-colors duration-200">
      <div className="flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-6xl px-2 sm:px-4 mx-auto py-4 sm:py-8">
        <Header onUploadClick={toggleModal} />

        <div className="content flex-1 w-full min-h-[80vh]">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-200 mb-4 sm:mb-6 px-2">
            Blog Page
          </h1>
          {renderPosts()}
        </div>

        <Footer />
      </div>

      <ScrollToTop getPosts={getPosts} />

      <Modal isOpen={isModalOpen} onClose={toggleModal}>
        <div className="p-4 sm:p-6 space-y-4 bg-gray-800 w-[95vw] sm:w-auto max-w-lg mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-200">
            Create New Post
          </h1>
          <PostUpload onImagesSelected={handleImagesSelected} maxImages={1} />
        </div>
      </Modal>
    </main>
  );
}
