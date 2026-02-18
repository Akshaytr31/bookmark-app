"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import AddBookmark from "./AddBookmark";
import BookmarkList from "./BookmarkList";

export type Bookmark = {
  id: string;
  title: string;
  url: string;
  user_id: string;
  created_at: string;
};

export default function Dashboard() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchBookmarks = async () => {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookmarks:", error);
      } else {
        setBookmarks(data || []);
      }
      setLoading(false);
    };

    fetchBookmarks();

    const channel = supabase
      .channel("realtime bookmarks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBookmarks((prev) => {
              // Prevent duplicates if onAdd already added it
              // We compare IDs. payload.new has the structure of the row.
              // We cast it to Bookmark.
              const newBookmark = payload.new as Bookmark;
              if (prev.some((b) => b.id === newBookmark.id)) return prev;
              return [newBookmark, ...prev];
            });
          } else if (payload.eventType === "DELETE") {
            setBookmarks((prev) =>
              prev.filter((bookmark) => bookmark.id !== payload.old.id),
            );
          } else if (payload.eventType === "UPDATE") {
            setBookmarks((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? (payload.new as Bookmark) : item,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleAdd = (newBookmark: Bookmark) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.id === newBookmark.id)) return prev;
      return [newBookmark, ...prev];
    });
  };

  const handleDelete = async (id: string) => {
    // Optimistic update
    const previousBookmarks = [...bookmarks];
    setBookmarks((prev) => prev.filter((b) => b.id !== id));

    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    if (error) {
      console.error("Error deleting bookmark:", error);
      alert("Failed to delete bookmark");
      // Revert state
      setBookmarks(previousBookmarks);
    }
  };

  return (
    <>
      <AddBookmark onAdd={handleAdd} />
      <BookmarkList
        bookmarks={bookmarks}
        loading={loading}
        onDelete={handleDelete}
      />
    </>
  );
}
