import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import {
  ArrowLeft, Zap, Shield, AlertTriangle, CheckCircle,
  Clock, MapPin, FileText, Edit3, Save, X, Trash2, RefreshCw, Paperclip
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import SeverityBadge from '@/components/incidents/SeverityBadge';
import StatusBadge from '@/components/incidents/StatusBadge';
import moment from 'moment';

const typeLabels = {
  unauthorized_access: 'Unauthorized Access', data_breach: 'Data Breach',
  phishing: 'Phishing', malware: 'Malware', insider_threat: 'Insider Threat',
  social_engineering: 'Social Engineering', physical_security: 'Physical Security', other: 'Other',
};

const threatColors = {
  minimal: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  low: 'text-green-400 bg-green-400/10 border-green-400/30',
  moderate: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  critical: 'text-red-400 bg-red-400/10 border-red-400/30',
};

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [reanalyzing, setReanalyzing] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadIncident();
  }, [id]);

  const loadIncident = async () => {
    setLoading(true);
    const data = await base44.entities.Incident.filter({ id });
    if (data.length > 0) {
      setIncident(data[0]);
      setAdminNotes(data[0].admin_notes || '');
    }
    setLoading(false);
  };

  const updateStatus = async (status) => {
    await base44.entities.Incident.update(incident.id, { status });
    setIncident(prev => ({ ...prev, status }));
    toast({ title: 'Status updated' });
  };

  const saveAdminNotes = async () => {
    await base44.entities.Incident.update(incident.id, { admin_notes: adminNotes });
    setIncident(prev => ({ ...prev, admin_notes: adminNotes }));
    setEditingNotes(false);
    toast({ title: 'Notes saved' });
  };

  const reanalyze = async () => {
    setReanalyzing(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Re-analyze this security incident with current status context:
Type: ${incident.type}
Severity: ${incident.severity}
Status: ${incident.status}
Title: ${incident.title}
Description: ${incident.description}
${incident.admin_notes ? 'Admin Notes: ' + incident.admin_notes : ''}

Provide updated analysis. Respond in JSON: { "analysis": "...", "threat_level": "minimal|low|moderate|high|critical", "recommendations": "..." }`,
      response_json_schema: {
        type: 'object',
        properties: {
          analysis: { type: 'string' },
          threat_level: { type: 'string' },
          recommendations: { type: 'string' },
        },
      },
    });
    await base44.entities.Incident.update(incident.id, {
      ai_analysis: res.analysis,
      ai_threat_level: res.threat_level,
      ai_recommendations: res.recommendations,
    });
    setIncident(prev => ({
      ...prev,
      ai_analysis: res.analysis,
      ai_threat_level: res.threat_level,
      ai_recommendations: res.recommendations,
    }));
    setReanalyzing(false);
    toast({ title: 'AI re-analysis complete' });
  };

  const deleteIncident = async () => {
    await base44.entities.Incident.delete(incident.id);
    toast({ title: 'Incident deleted' });
    navigate('/incidents');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono">Loading incident...</span>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertTriangle className="w-10 h-10 text-muted-foreground" />
        <p className="text-muted-foreground">Incident not found</p>
        <Link to="/incidents"><Button variant="outline" size="sm">Back to Incidents</Button></Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/incidents">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground shrink-0">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <SeverityBadge severity={incident.severity} size="lg" />
            <StatusBadge status={incident.status} />
            <span className="text-xs text-muted-foreground font-mono px-2 py-0.5 bg-muted rounded border border-border">
              {typeLabels[incident.type] || incident.type}
            </span>
          </div>
          <h1 className="text-xl font-bold font-heading text-foreground">{incident.title}</h1>
          <div className="flex flex-wrap gap-4 mt-2">
            {incident.location && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" /> {incident.location}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" /> {moment(incident.created_date).format('MMM D, YYYY [at] HH:mm')}
            </span>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={reanalyze} disabled={reanalyzing}>
              {reanalyzing ? (
                <div className="w-3.5 h-3.5 border border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-primary" />
              )}
              Re-analyze
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Incident?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteIncident} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">Description</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{incident.description}</p>
            {incident.reporter_notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground font-semibold mb-1">Reporter Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{incident.reporter_notes}</p>
              </div>
            )}
          </div>

          {/* AI Analysis */}
          {incident.ai_analysis && (
            <div className="bg-card border border-primary/20 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold">AI Analysis</h2>
                </div>
                {incident.ai_threat_level && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border tracking-wider uppercase ${threatColors[incident.ai_threat_level] || threatColors.moderate}`}>
                    {incident.ai_threat_level} threat
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-4">{incident.ai_analysis}</p>
              {incident.ai_recommendations && (
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <p className="text-xs font-semibold text-primary mb-2">RECOMMENDED ACTIONS</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{incident.ai_recommendations}</p>
                </div>
              )}
            </div>
          )}

          {/* Admin Notes */}
          {isAdmin && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold">Investigation Notes</h2>
                </div>
                {!editingNotes ? (
                  <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-7" onClick={() => setEditingNotes(true)}>
                    <Edit3 className="w-3 h-3" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" className="text-xs gap-1.5 h-7" onClick={saveAdminNotes}>
                      <Save className="w-3 h-3" /> Save
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setEditingNotes(false); setAdminNotes(incident.admin_notes || ''); }}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              {editingNotes ? (
                <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={4} className="resize-none text-sm" placeholder="Add investigation notes..." />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {incident.admin_notes || <span className="italic">No notes yet. Click Edit to add investigation notes.</span>}
                </p>
              )}
            </div>
          )}

          {/* Attachments */}
          {incident.attachments?.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold">Attachments</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {incident.attachments.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 border border-border text-xs text-foreground transition-colors">
                    <Paperclip className="w-3 h-3 text-muted-foreground" />
                    Attachment {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Status control */}
          {isAdmin && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold">Manage Status</h2>
              </div>
              <Select value={incident.status} onValueChange={updateStatus}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Meta */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold mb-3">Incident Details</h2>
            {[
              { label: 'ID', value: incident.id.slice(-8).toUpperCase(), mono: true },
              { label: 'Type', value: typeLabels[incident.type] },
              { label: 'Severity', value: <SeverityBadge severity={incident.severity} /> },
              { label: 'Status', value: <StatusBadge status={incident.status} /> },
              { label: 'Reported', value: moment(incident.created_date).format('MMM D, YYYY') },
              { label: 'Last Updated', value: moment(incident.updated_date).fromNow() },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className={`text-xs font-medium text-right ${mono ? 'font-mono text-primary' : ''}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/chat" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                  <Zap className="w-3.5 h-3.5 text-primary" /> Chat with AI Security
                </Button>
              </Link>
              <Link to="/incidents/new" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400" /> Report New Incident
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}