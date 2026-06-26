import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, Loader2, Film, Clapperboard } from "lucide-react";

export default function TrashTab({ onRestored }) {
  const [deleted, setDeleted] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const [permDeleting, setPermDeleting] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setIsLoading(true);
    const data = await base44.entities.DeletedProject.list("-created_date", 100);
    setDeleted(data);
    setIsLoading(false);
  };

  const restore = async (item) => {
    setRestoringId(item.id);
    const { original_id, deleted_at, id, created_date, updated_date, created_by_id, ...restoreData } = item;
    const restored = await base44.entities.FilmProject.create(restoreData);
    await base44.entities.DeletedProject.delete(item.id);
    setDeleted(prev => prev.filter(d => d.id !== item.id));
    setRestoringId(null);
    onRestored(restored);
  };

  const permanentlyDelete = async (item) => {
    setPermDeleting(item.id);
    await base44.entities.DeletedProject.delete(item.id);
    setDeleted(prev => prev.filter(d => d.id !== item.id));
    setPermDeleting(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (deleted.length === 0) {
    return (
      <div className="text-center py-20 text-gray-600">
        <Trash2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-gray-500">Trash is empty</p>
        <p className="text-gray-600 text-sm mt-1">Deleted projects appear here and can be restored</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-400" />
          Deleted Projects ({deleted.length})
        </h3>
        <p className="text-xs text-gray-500">Projects can be restored at any time</p>
      </div>

      <div className="space-y-3">
        {deleted.map((item, i) => {
          const thumb = item.storyboard_images?.[0];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex items-center gap-4 opacity-75 hover:opacity-100 transition-opacity"
            >
              <div className="w-20 h-14 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                {thumb ? (
                  <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Clapperboard className="w-6 h-6 text-gray-700" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span className="capitalize">{(item.source_type || "prompt").replace("_", " ")}</span>
                  {item.quality && <><span>·</span><span>{item.quality}</span></>}
                  {item.total_scenes > 0 && <><span>·</span><span>{item.total_scenes} scenes</span></>}
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  Deleted {item.deleted_at ? new Date(item.deleted_at).toLocaleDateString() : "recently"}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  onClick={() => restore(item)}
                  disabled={restoringId === item.id}
                  size="sm"
                  className="bg-green-600 hover:bg-green-500 text-white text-xs"
                >
                  {restoringId === item.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <><RotateCcw className="w-3 h-3 mr-1" /> Restore</>
                  )}
                </Button>
                <Button
                  onClick={() => permanentlyDelete(item)}
                  disabled={permDeleting === item.id}
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                >
                  {permDeleting === item.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}