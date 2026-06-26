import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    card_message: "",
    card_design: "classic"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      const userData = await base44.auth.me();
      setUser(userData);
      const userSubmissions = await base44.entities.EventSubmission.list("-created_date");
      setSubmissions(userSubmissions);
      const userRsvps = await base44.entities.EventRSVP.list();
      setRsvps(userRsvps);
    }
    const eventData = await base44.entities.Event.list("-event_date");
    setEvents(eventData);
    setIsLoading(false);
  };

  const handleRSVP = async (event, status) => {
    if (!user) {
      alert("Please sign in to RSVP");
      return;
    }

    const existingRsvp = rsvps.find(r => r.event_id === event.id);
    
    if (existingRsvp) {
      await base44.entities.EventRSVP.update(existingRsvp.id, { status });
    } else {
      await base44.entities.EventRSVP.create({
        event_id: event.id,
        event_title: event.title,
        user_email: user.email,
        user_name: user.full_name,
        status
      });
    }
    
    loadData();
  };

  const getUserRSVP = (eventId) => {
    return rsvps.find(r => r.event_id === eventId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to submit a card");
      return;
    }
    if (!selectedEvent) {
      alert("Please select an event");
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.EventSubmission.create({
        event_id: selectedEvent.id,
        event_title: selectedEvent.title,
        submitter_name: user.full_name,
        submitter_email: user.email,
        card_message: formData.card_message,
        card_design: formData.card_design
      });
      
      setFormData({ card_message: "", card_design: "classic" });
      setSelectedEvent(null);
      loadData();
      alert("Card submitted successfully!");
    } catch (error) {
      console.error("Error submitting card:", error);
      alert("Failed to submit card. Please try again.");
    }
    setIsSubmitting(false);
  };

  const activeEvents = events.filter(e => e.status === "active");
  const upcomingEvents = events.filter(e => e.status === "upcoming");

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold literary-text mb-2">Events</h1>
          <p className="text-amber-700 text-lg">Join special events and submit your creative cards</p>
        </div>

        {/* Active Events */}
        {activeEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold literary-text mb-6">Active Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="literary-shadow bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="literary-text">{event.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2 text-sm text-amber-600">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(event.event_date), 'PPP')}
                          </div>
                        </div>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-amber-800">{event.description}</p>
                      
                      {event.book_file_url && (
                        <a href={event.book_file_url} download target="_blank" rel="noopener noreferrer">
                          <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                            <Download className="w-4 h-4 mr-2" />
                            Download Event Book
                          </Button>
                        </a>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRSVP(event, "attending")}
                          variant={getUserRSVP(event.id)?.status === "attending" ? "default" : "outline"}
                          className="flex-1"
                        >
                          ✓ Attending
                        </Button>
                        <Button
                          onClick={() => handleRSVP(event, "maybe")}
                          variant={getUserRSVP(event.id)?.status === "maybe" ? "default" : "outline"}
                          className="flex-1"
                        >
                          ? Maybe
                        </Button>
                      </div>

                      <Button
                        onClick={() => setSelectedEvent(event)}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Submit Card
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Card Submission Form */}
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12"
          >
            <Card className="literary-shadow bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 literary-text">
                  <Sparkles className="w-5 h-5" />
                  Submit Card for {selectedEvent.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Your Message</Label>
                    <Textarea
                      placeholder="Write your card message..."
                      value={formData.card_message}
                      onChange={(e) => setFormData({...formData, card_message: e.target.value})}
                      className="min-h-[150px]"
                      required
                    />
                  </div>

                  <div>
                    <Label>Card Design</Label>
                    <Select
                      value={formData.card_design}
                      onValueChange={(value) => setFormData({...formData, card_design: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="elegant">Elegant</SelectItem>
                        <SelectItem value="playful">Playful</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedEvent(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Card"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold literary-text mb-6">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingEvents.map((event, index) => (
                <Card key={event.id} className="literary-shadow bg-white/80 border-amber-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="literary-text">{event.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-sm text-amber-600">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(event.event_date), 'PPP')}
                        </div>
                      </div>
                      <Badge variant="outline">Upcoming</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-amber-800">{event.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* My Submissions */}
        {user && submissions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold literary-text mb-6">My Submissions</h2>
            <div className="space-y-4">
              {submissions.map((submission) => (
                <Card key={submission.id} className="literary-shadow bg-white/80 border-amber-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{submission.event_title}</CardTitle>
                      <Badge className={
                        submission.approval_status === "approved" ? "bg-green-500" :
                        submission.approval_status === "rejected" ? "bg-red-500" :
                        "bg-yellow-500"
                      }>
                        {submission.approval_status || "pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-amber-900">{submission.card_message}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-amber-600">
                      <Badge variant="outline">{submission.card_design}</Badge>
                      <span>{format(new Date(submission.created_date), 'PPP')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!isLoading && events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-amber-400" />
            <h3 className="text-xl font-semibold literary-text mb-2">No Events Yet</h3>
            <p className="text-amber-700">Check back soon for upcoming events!</p>
          </div>
        )}
      </div>
    </div>
  );
}