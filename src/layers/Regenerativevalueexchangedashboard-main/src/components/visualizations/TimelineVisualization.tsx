import { useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  category: 'milestone' | 'launch' | 'achievement' | 'pending';
  impact: string;
  value: number;
  description: string;
}

interface TimelineVisualizationProps {
  events: TimelineEvent[];
  title?: string;
}

export function TimelineVisualization({ 
  events, 
  title = 'Project Timeline & Milestones' 
}: TimelineVisualizationProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [filter, setFilter] = useState<'all' | 'milestone' | 'launch' | 'achievement' | 'pending'>('all');

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.category === filter);

  const getEventIcon = (category: string) => {
    switch (category) {
      case 'milestone': return CheckCircle;
      case 'launch': return TrendingUp;
      case 'achievement': return CheckCircle;
      case 'pending': return Clock;
      default: return Calendar;
    }
  };

  const getEventColor = (category: string) => {
    switch (category) {
      case 'milestone': return { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-400' };
      case 'launch': return { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-400' };
      case 'achievement': return { bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-400' };
      case 'pending': return { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-400' };
      default: return { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-400' };
    }
  };

  const categoryLabels = {
    milestone: 'Milestones',
    launch: 'Launches',
    achievement: 'Achievements',
    pending: 'Upcoming'
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white mb-2">{title}</h3>
          <p className="text-emerald-300/70 text-sm">Track progress and key milestones</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              filter === 'all'
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            All
          </button>
          {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                filter === cat
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-emerald-500/20"></div>

        {/* Events */}
        <div className="space-y-6">
          {filteredEvents.map((event, index) => {
            const Icon = getEventIcon(event.category);
            const colors = getEventColor(event.category);
            const isSelected = selectedEvent?.id === event.id;

            return (
              <div
                key={event.id}
                className={`relative pl-20 cursor-pointer transition-all ${
                  isSelected ? 'scale-105' : ''
                }`}
                onClick={() => setSelectedEvent(isSelected ? null : event)}
              >
                {/* Timeline dot */}
                <div className="absolute left-5 -translate-x-1/2">
                  <div className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center ${
                    isSelected ? 'ring-4 ring-emerald-500/30' : ''
                  }`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Event card */}
                <div className={`bg-emerald-900/10 border ${
                  isSelected ? 'border-emerald-500/40 bg-emerald-900/20' : 'border-emerald-500/10'
                } rounded-lg p-4 hover:border-emerald-500/30 transition-all`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white">{event.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${colors.bg} bg-opacity-20 ${colors.text} capitalize`}>
                          {event.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-300/70 text-sm">
                        <Calendar className="w-3 h-3" />
                        <span>{event.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-300/70 text-sm">Impact Value</div>
                      <div className="text-white">${event.value}M</div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-emerald-500/20 space-y-3">
                      <div>
                        <div className="text-emerald-300/70 text-sm mb-1">Description</div>
                        <div className="text-emerald-300/80 text-sm">{event.description}</div>
                      </div>
                      <div>
                        <div className="text-emerald-300/70 text-sm mb-1">Impact</div>
                        <div className="text-emerald-400 text-sm">{event.impact}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-900/20 rounded-lg p-4">
          <div className="text-emerald-300/70 text-sm mb-1">Total Events</div>
          <div className="text-white">{events.length}</div>
        </div>
        <div className="bg-emerald-900/20 rounded-lg p-4">
          <div className="text-emerald-300/70 text-sm mb-1">Completed</div>
          <div className="text-white">
            {events.filter(e => e.category !== 'pending').length}
          </div>
        </div>
        <div className="bg-emerald-900/20 rounded-lg p-4">
          <div className="text-emerald-300/70 text-sm mb-1">Pending</div>
          <div className="text-white">
            {events.filter(e => e.category === 'pending').length}
          </div>
        </div>
        <div className="bg-emerald-900/20 rounded-lg p-4">
          <div className="text-emerald-300/70 text-sm mb-1">Total Impact</div>
          <div className="text-white">
            ${events.reduce((sum, e) => sum + e.value, 0)}M
          </div>
        </div>
      </div>
    </div>
  );
}
