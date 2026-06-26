import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Check } from 'lucide-react';
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";

export default function Comments({ book, onUpdate, quillRef }) {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = async () => {
    if (!newComment) return;

    const range = quillRef.current.getEditor().getSelection();
    if (!range || range.length === 0) {
      alert("Please select text to comment on.");
      return;
    }

    const user = await base44.auth.me();
    const comment = {
      id: `comment_${Date.now()}`,
      text: newComment,
      author: user.email,
      created_date: new Date().toISOString(),
      selection_start: range.index,
      selection_end: range.index + range.length,
      resolved: false,
    };

    const updatedComments = [...(book.comments || []), comment];
    await base44.entities.Book.update(book.id, { comments: updatedComments });
    onUpdate({ ...book, comments: updatedComments });
    setNewComment('');
    
    // Highlight text
    quillRef.current.getEditor().formatText(range.index, range.length, 'background', '#FFDDC1');
    quillRef.current.getEditor().formatText(range.index, range.length, 'comment-id', comment.id);

  };

  const handleResolve = async (commentId) => {
    const commentToResolve = book.comments.find(c => c.id === commentId);
    const updatedComments = book.comments.map(c => c.id === commentId ? { ...c, resolved: !c.resolved } : c);
    await base44.entities.Book.update(book.id, { comments: updatedComments });
    onUpdate({ ...book, comments: updatedComments });

    if(commentToResolve && !commentToResolve.resolved) {
        quillRef.current.getEditor().formatText(commentToResolve.selection_start, commentToResolve.selection_end - commentToResolve.selection_start, 'background', false);
    } else if (commentToResolve && commentToResolve.resolved) {
        quillRef.current.getEditor().formatText(commentToResolve.selection_start, commentToResolve.selection_end - commentToResolve.selection_start, 'background', '#FFDDC1');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-sm text-amber-800 mb-2">Add a comment</h4>
        <Textarea
          placeholder="Select text and type your comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="border-amber-200"
        />
        <Button onClick={handleAddComment} size="sm" className="mt-2">
          <MessageSquare className="w-4 h-4 mr-2" />
          Comment
        </Button>
      </div>

      <div>
        <h4 className="font-semibold text-sm text-amber-800 mb-2">Feedback</h4>
        <div className="space-y-3">
          {(book.comments || []).map(comment => (
            <div key={comment.id} className={`p-3 rounded-lg border ${comment.resolved ? 'bg-green-50 border-green-200 opacity-60' : 'bg-amber-50 border-amber-200'}`}>
              <p className="text-sm text-gray-800">{comment.text}</p>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{comment.author} - {format(new Date(comment.created_date), 'MMM d, yyyy')}</span>
                <Button variant="ghost" size="sm" onClick={() => handleResolve(comment.id)}>
                  <Check className={`w-4 h-4 mr-1 ${comment.resolved ? 'text-green-600' : ''}`} />
                  {comment.resolved ? 'Resolved' : 'Resolve'}
                </Button>
              </div>
            </div>
          ))}
          {(book.comments || []).length === 0 && (
            <p className="text-sm text-gray-500">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}