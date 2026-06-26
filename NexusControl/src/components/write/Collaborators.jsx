import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { base44 } from "@/api/base44Client";

export default function Collaborators({ book, onUpdate }) {
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = async () => {
    if (!inviteEmail) return;
    const currentCollaborators = book.collaborators || [];
    if (currentCollaborators.includes(inviteEmail) || book.created_by === inviteEmail) {
      alert("User is already a collaborator or the owner.");
      return;
    }
    const updatedCollaborators = [...currentCollaborators, inviteEmail];
    await base44.entities.Book.update(book.id, { collaborators: updatedCollaborators });
    onUpdate({ ...book, collaborators: updatedCollaborators });
    setInviteEmail('');
  };

  const handleRemove = async (emailToRemove) => {
    const updatedCollaborators = (book.collaborators || []).filter(email => email !== emailToRemove);
    await base44.entities.Book.update(book.id, { collaborators: updatedCollaborators });
    onUpdate({ ...book, collaborators: updatedCollaborators });
  };

  const getInitials = (email) => {
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-sm text-amber-800">Invite Collaborators</h4>
        <div className="flex gap-2 mt-2">
          <Input
            type="email"
            placeholder="Enter email to invite..."
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="border-amber-200"
          />
          <Button onClick={handleInvite} size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite
          </Button>
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-sm text-amber-800 mb-2">Team</h4>
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarFallback>{getInitials(book.created_by)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">{book.created_by}</p>
                        <p className="text-xs text-amber-600">Owner</p>
                    </div>
                </div>
            </div>
          {(book.collaborators || []).map(email => (
            <div key={email} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback>{getInitials(email)}</AvatarFallback>
                </Avatar>
                <p className="text-sm">{email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleRemove(email)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}