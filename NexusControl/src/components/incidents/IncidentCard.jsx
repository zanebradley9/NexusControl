import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Clock } from 'lucide-react';
import SeverityBadge from './SeverityBadge';
import StatusBadge from './StatusBadge';
import moment from 'moment';

const typeLabels = {
  unauthorized_access: 'Unauthorized Access',
  data_breach: 'Data Breach',
  phishing: 'Phishing',
  malware: 'Malware',
  insider_threat: 'Insider Threat',
  social_engineering: 'Social Engineering',
  physical_security: 'Physical Security',
  other: 'Other',
};

export default function IncidentCard({ incident }) {
  return (
    <Link to={`/incidents/${incident.id}`} className="block group">
      <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
              <span className="text-[10px] text-muted-foreground font-mono px-2 py-0.5 bg-muted rounded border border-border">
                {typeLabels[incident.type] || incident.type}
              </span>
            </div>
            <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
              {incident.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{incident.description}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1 transition-colors" />
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
          {incident.location && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="w-3 h-3" /> {incident.location}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
            <Clock className="w-3 h-3" /> {moment(incident.created_date).fromNow()}
          </span>
        </div>
      </div>
    </Link>
  );
}