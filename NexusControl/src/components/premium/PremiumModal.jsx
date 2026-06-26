import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Star, Zap } from 'lucide-react';

export default function PremiumModal({ isOpen, onOpenChange, featureName }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 literary-text">
            <Star className="w-6 h-6 text-yellow-500" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription>
            Unlock the "{featureName}" feature and many more by upgrading your account.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ul className="space-y-2 text-sm text-amber-800">
            <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-green-500" /> Unlimited AI generations</li>
            <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-green-500" /> Access to all advanced tools</li>
            <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-green-500" /> Export in high quality</li>
            <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-green-500" /> Priority support</li>
          </ul>
        </div>
        <DialogFooter>
          <Link to={cn("Pricing")} className="w-full">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              Upgrade Now
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}