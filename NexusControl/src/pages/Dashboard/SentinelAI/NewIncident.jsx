import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Send, Zap, Upload, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const TYPE_OPTIONS = [
  { value: 'unauthorized_access', label: 'Unauthorized Access' },
  { value: 'data_breach', label: 'Data Breach' },
  { value: 'phishing', label: 'Phishing' },
  { value: 'malware', label: 'Malware' },
  { value: 'insider_threat', label: 'Insider Threat' },
  { value: 'social_engineering', label: 'Social Engineering' },
  { value: 'physical_security', label: 'Physical Security' },
  { value: 'other', label: 'Other' },
];

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low', hint: 'Minimal impact, no immediate risk' },
  { value: 'medium', label: 'Medium', hint: 'Moderate impact, monitor closely' },
  { value: 'high', label: 'High', hint: 'Significant impact, prompt action needed' },
  { value: 'critical', label: 'Critical', hint: 'Severe threat, immediate response required' },
];

export default function NewIncident() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', type: '', severity: 'medium',
    location: '', reporter_notes: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const res = await base44.integrations.Core.UploadFile({ file });
      setAttachments(prev => [...prev, { name: file.name, url: res.file_url }]);
    }
  };

  const runAiAnalysis = async () => {
    if (!form.title || !form.description) return;
    setAnalyzing(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a security AI analyst. Analyze this security incident report and provide:
1. A brief 2-3 sentence threat assessment
2. An AI threat level: minimal, low, moderate, high, or critical
3. 3-4 specific recommended actions

Incident Type: ${form.type}
Severity: ${form.severity}
Title: ${form.title}
Description: ${form.description}
Location: ${form.location}

Respond in JSON format: { "analysis": "...", "threat_level": "...", "recommendations": "..." }`,
      response_json_schema: {
        type: 'object',
        properties: {
          analysis: { type: 'string' },
          threat_level: { type: 'string' },
          recommendations: { type: 'string' },
        },
      },
    });
    setAnalyzing(false);
    return res;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.type) {
      toast({ title: 'Missing fields', description: 'Please fill in title, description and type.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const aiResult = await runAiAnalysis();
    const payload = {
      ...form,
      attachments: attachments.map(a => a.url),
      ...(aiResult ? {
        ai_analysis: aiResult.analysis,
        ai_threat_level: aiResult.threat_level,
        ai_recommendations: aiResult.recommendations,
      } : {}),
    };
    const created = await base44.entities.Incident.create(payload);
    toast({ title: 'Incident reported', description: 'AI analysis has been attached.' });
    navigate(`/incidents/${created.id}`);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/incidents">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold font-heading flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Report Suspicious Activity
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">AI will automatically analyze your report on submission</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-sm font-medium">Incident Title <span className="text-red-400">*</span></Label>
          <Input id="title" placeholder="Brief, descriptive title" value={form.title} onChange={e => set('title', e.target.value)} className="h-10" />
        </div>

        {/* Type & Severity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Incident Type <span className="text-red-400">*</span></Label>
            <Select value={form.type} onValueChange={v => set('type', v)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Severity Level</Label>
            <Select value={form.severity} onValueChange={v => set('severity', v)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>
                    <div>
                      <span className="font-medium">{o.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">{o.hint}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium">Description <span className="text-red-400">*</span></Label>
          <Textarea
            id="description"
            placeholder="Describe what happened in as much detail as possible — who, what, when, where, how..."
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={5}
            className="resize-none"
          />
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <Label htmlFor="location" className="text-sm font-medium">Location / System</Label>
          <Input id="location" placeholder="e.g. Office Floor 3, Server Room, HR System..." value={form.location} onChange={e => set('location', e.target.value)} className="h-10" />
        </div>

        {/* Additional Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any other context, witnesses, or relevant information..."
            value={form.reporter_notes}
            onChange={e => set('reporter_notes', e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Attachments */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Attachments</Label>
          <label className="flex items-center gap-2 px-4 py-3 rounded-lg border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Click to attach screenshots or logs</span>
            <input type="file" multiple className="hidden" onChange={handleFileUpload} />
          </label>
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {attachments.map((a, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full text-xs text-foreground border border-border">
                  {a.name}
                  <button type="button" onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}>
                    <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI note */}
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <Zap className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            AI will automatically analyze your report, assess the threat level, and provide recommended actions upon submission.
          </p>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" className="flex-1 h-11 gap-2" disabled={submitting || analyzing}>
            {(submitting || analyzing) ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {analyzing ? 'AI analyzing...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Submit Report
              </>
            )}
          </Button>
          <Link to="/incidents">
            <Button type="button" variant="outline" className="h-11">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}