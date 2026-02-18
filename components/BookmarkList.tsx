"use client";

import { Trash2, ExternalLink } from "lucide-react";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
};

interface BookmarkListProps {
  bookmarks: Bookmark[];
  loading?: boolean;
  onDelete: (id: string) => void;
}

export default function BookmarkList({
  bookmarks,
  loading = false,
  onDelete,
}: BookmarkListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">
          No bookmarks yet. Add one above!
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {bookmarks.map((bookmark) => (
        <li
          key={bookmark.id}
          className="bg-white dark:bg-gray-800 px-4 py-4 shadow sm:rounded-md sm:px-6 flex items-center justify-between"
        >
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {bookmark.title}
            </h4>
            <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400s">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center text-blue-600 dark:text-blue-400 truncate"
              >
                {bookmark.url}
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => onDelete(bookmark.id)}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete bookmark"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
