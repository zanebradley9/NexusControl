import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";

export default function DeleteConfirmModal({ project, onConfirm, onCancel, isDeleting }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-950 border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Delete Project?</h2>
              <p className="text-sm text-gray-400">This can be restored from the Trash</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm mb-6">
            "<span className="text-white font-medium">{project?.title}</span>" will be moved to trash. You can restore it any time from the History tab.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="flex-1 text-gray-400 hover:text-white"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold"
            >
              {isDeleting ? "Deleting..." : "Move to Trash"}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}