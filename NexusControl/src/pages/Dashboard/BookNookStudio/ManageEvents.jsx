import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, User } from "lucide-react";
import { format } from "date-fns";

export default function ManageEvents() {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
    
    if (userData.role !== 'admin') {
      alert("Access denied. Admins only.");
      return;
    }

    const submissionData = await base44.entities.EventSubmission.list("-created_date");
    setSubmissions(submissionData);
    setIsLoading(false);
  };

  const updateStatus = async (submissionId, status) => {
    await base44.entities.EventSubmission.update(submissionId, {
      approval_status: status
    });
    loadData();
  };

  const pendingSubmissions = submissions.filter(s => s.approval_status === "pending");
  const reviewedSubmissions = submissions.filter(s => s.approval_status !== "pending");

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Access denied. Admins only.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold literary-text mb-8">Manage Event Submissions</h1>

        {/* Pending Submissions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold literary-text mb-6">
            Pending Approval ({pendingSubmissions.length})
          </h2>
          {pendingSubmissions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-amber-700">No pending submissions</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingSubmissions.map(submission => (
                <Card key={submission.id} className="literary-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{submission.event_title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <User className="w-4 h-4" />
                      {submission.submitter_name}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-amber-900">{submission.card_message}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{submission.card_design}</Badge>
                      <p className="text-xs text-amber-600">
                        {format(new Date(submission.created_date), 'MMM d, yyyy')}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateStatus(submission.id, "approved")}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => updateStatus(submission.id, "rejected")}
                        variant="destructive"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Reviewed Submissions */}
        <div>
          <h2 className="text-2xl font-bold literary-text mb-6">Reviewed</h2>
          <div className="space-y-4">
            {reviewedSubmissions.map(submission => (
              <Card key={submission.id} className="literary-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{submission.event_title}</p>
                      <p className="text-sm text-amber-600">{submission.submitter_name}</p>
                    </div>
                    <Badge className={
                      submission.approval_status === "approved" 
                        ? "bg-green-500" 
                        : "bg-red-500"
                    }>
                      {submission.approval_status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}