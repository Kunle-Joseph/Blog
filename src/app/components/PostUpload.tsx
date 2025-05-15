"use client";

import { ChangeEvent, useRef, useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import imageCompression from "browser-image-compression";

interface PostUploadProps {
  onImagesSelected: (files: File[]) => void;
  maxImages?: number;
  userId?: string;
}
export function PostUpload({
  onImagesSelected,
  maxImages = 1,
}: PostUploadProps) {
  // State
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [text, setText] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const STORAGE_BUCKET = "post-images";
  const ANON_TABLE = "posts_anon";

  // Image handling
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || []);
      if (files.length > maxImages) {
        alert(`Maximum ${maxImages} images allowed`);
        return;
      }

      // Clear previous preview URLs
      previewUrls.forEach(URL.revokeObjectURL);

      // Create new preview URLs
      const urls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
      onImagesSelected(files);
    } catch (error) {
      console.error("Error handling image change:", error);
      alert("Error processing images");
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.1, // Max file size in MB
      maxWidthOrHeight: 1920, // Max width/height in pixels
      useWebWorker: true, // Use web worker for better performance
      initialQuality: 0.8, // Initial quality (0.8 = 80%)
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return new File([compressedFile], file.name, {
        type: compressedFile.type,
      });
    } catch (error) {
      console.error("Error compressing image:", error);
      throw error;
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);

      // Compress the image before upload
      const compressedFile = await compressImage(file);

      // Validate file size after compression (5MB limit)
      if (compressedFile.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", 
        "image/heic", "image/heif", "image/jpg", "image/webp"];
      if (!validTypes.includes(compressedFile.type)) {
        throw new Error(
          "Invalid file type. Only JPG, PNG, HEIC, WEBP, and GIF are allowed"
        );
      }

      const fileExt = compressedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, compressedFile);

      if (uploadError) throw uploadError;

      const { data: publicURL } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      return publicURL.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(error instanceof Error ? error.message : "Error uploading image");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (url: string, index: number) => {
    try {
      // Extract filename from URL
      const fileName = url.split("/").pop();
      if (!fileName) return;

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([fileName]);

      if (error) throw error;

      // Remove from preview and uploaded images
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
      setUploadedImages((prev) => prev.filter((_, i) => i !== index));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image");
    }
  };

  // Post creation
  async function createPost() {
    try {
      const file = fileInputRef.current?.files?.[0];
      if (!file) return;
      const imageUrl = await uploadImage(file);

      try {
        console.log("Creating post...");
        await supabase.from(ANON_TABLE).insert([
          {
            text_body: text,
            images: [imageUrl],
          },
        ]);
        resetForm();
        alert("Post created successfully!");
      } catch (error) {
        console.error("Error creating post:", error);
        alert("Error creating post");
      }
    } catch (error) {
      console.error("Error in post creation:", error);
    }
  }

  async function createTextPost() {
    try {
      console.log("Creating text post...");
      setIsUploading(true);
      await supabase.from(ANON_TABLE).insert([
        {
          text_body: text,
        },
      ]);
      resetForm();
      alert("Post created successfully!");
      setIsUploading(false);
    } catch (error) {
      console.error("Error creating text post:", error);
      alert("Error creating post");
    }
  }

  // Utilities
  const resetForm = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPreviewUrls([]);
    setText("");
  };

  useEffect(() => {
    return () => {
      // Cleanup preview URLs when component unmounts
      previewUrls.forEach(URL.revokeObjectURL);
    };
  }, []);

  // UI Components

  return (
    <div className="w-full max-w-2xl mx-auto p-2 sm:p-4 space-y-4 relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Image Upload Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-24 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg 
               flex items-center justify-center hover:border-blue-500 
               transition-colors duration-200"
      >
        <div className="text-center px-2">
          <p className="text-gray-600 font-medium text-sm sm:text-base">
            Click or tap to upload images
          </p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Supports: JPG, PNG, GIF
          </p>
        </div>
      </button>

      <textarea
        placeholder="Enter your blog post here..."
        className="w-full p-2 sm:p-3 min-h-[100px] sm:min-h-[120px] text-white border-2 
                   border-blue-300 rounded-lg focus:border-blue-500 
                   focus:ring-2 focus:ring-blue-200 transition-all
                   duration-200 text-sm sm:text-base bg-gray-800
                   resize-y max-h-[300px]"
        onChange={(e) => {
          const value = e.target.value;
          // Limit text length to prevent memory issues
          if (value.length <= 5000) {
            setText(value);
          }
        }}
        value={text}
        maxLength={5000}
        spellCheck="false"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        rows={4}
      />

      {previewUrls.length > 0 && (
        <div className="space-y-2 sm:space-y-4 relative">
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square group">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => handleDeleteImage(url, index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 
                     rounded-full opacity-0 group-hover:opacity-100 
                     transition-opacity duration-200 hover:bg-red-600"
                  aria-label="Delete image"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              createPost();
            }}
            disabled={isUploading || text.trim() === ""}
            className="w-full mt-2 sm:mt-4 bg-blue-500 text-white px-3 py-2 rounded-md
                   text-sm sm:text-base hover:bg-blue-600 transition-colors duration-200 
                   disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading..." : "Create this post"}
          </button>
        </div>
      )}

      {previewUrls.length === 0 && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            createTextPost();
          }}
          disabled={isUploading || text.trim() === ""}
          className="w-full mt-2 sm:mt-4 bg-blue-500 text-white px-3 py-2 rounded-md
                 text-sm sm:text-base hover:bg-blue-600 transition-colors duration-200 
                 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : "Create this post"}
        </button>
      )}
    </div>
  );
}
