import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Leaf, Award, MapPin, Check, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CarbonProject, PROJECT_TYPE_LABELS, PROJECT_TYPE_ICONS } from '@/types/marketplace';
import { Link } from 'react-router-dom';

interface ProjectComparisonModalProps {
  projects: CarbonProject[];
  isOpen: boolean;
  onClose: () => void;
  maxCompare?: number;
}

export function ProjectComparisonModal({ 
  projects: initialProjects, 
  isOpen, 
  onClose,
  maxCompare = 3 
}: ProjectComparisonModalProps) {
  const [selectedProjects, setSelectedProjects] = useState<CarbonProject[]>(
    initialProjects.slice(0, maxCompare)
  );

  const toggleProject = (project: CarbonProject) => {
    if (selectedProjects.find(p => p.id === project.id)) {
      setSelectedProjects(selectedProjects.filter(p => p.id !== project.id));
    } else if (selectedProjects.length < maxCompare) {
      setSelectedProjects([...selectedProjects, project]);
    }
  };

  const comparisonMetrics = [
    { label: 'Price per Credit', key: 'price_per_credit', unit: '$' },
    { label: 'CO₂ Offset', key: 'co2_offset_per_credit', unit: 't' },
    { label: 'Available Credits', key: 'available_credits', unit: '' },
    { label: 'Vintage Year', key: 'vintage_year', unit: '' },
    { label: 'Impact Score', key: 'impact_score', unit: '/100' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-foreground">Compare Projects</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select up to {maxCompare} projects to compare side-by-side
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Project Selection */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Select Projects ({selectedProjects.length}/{maxCompare})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
              {initialProjects.map((project) => {
                const isSelected = selectedProjects.find(p => p.id === project.id);
                const isDisabled = !isSelected && selectedProjects.length >= maxCompare;

                return (
                  <motion.button
                    key={project.id}
                    onClick={() => !isDisabled && toggleProject(project)}
                    disabled={isDisabled}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 rounded-lg border-2 transition-all text-left flex items-start justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : isDisabled
                        ? 'border-border/30 bg-muted/30 opacity-50 cursor-not-allowed'
                        : 'border-border/50 hover:border-primary/30 bg-card/50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{project.title}</p>
                      <p className="text-xs text-muted-foreground">{project.location}</p>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Comparison Table */}
          {selectedProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <h3 className="font-semibold text-foreground">Comparison Details</h3>
              
              {/* Horizontal Scrollable Table */}
              <div className="overflow-x-auto rounded-lg border border-border/50">
                <table className="w-full">
                  <tbody>
                    {/* Project Headers */}
                    <tr className="border-b border-border/30">
                      <td className="px-4 py-4 bg-muted/30 font-semibold text-foreground">Project</td>
                      {selectedProjects.map((project) => (
                        <td key={project.id} className="px-4 py-4 bg-muted/30 min-w-48">
                          <div className="flex flex-col gap-2">
                            <div>
                              <p className="font-semibold text-foreground line-clamp-1">{project.title}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {project.location}
                              </p>
                            </div>
                            <Badge className="w-fit">
                              {PROJECT_TYPE_ICONS[project.project_type]} {PROJECT_TYPE_LABELS[project.project_type]}
                            </Badge>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Metrics Rows */}
                    {comparisonMetrics.map((metric, idx) => (
                      <tr key={metric.key} className={idx % 2 === 0 ? 'bg-background/30' : ''}>
                        <td className="px-4 py-3 font-medium text-muted-foreground text-sm">
                          {metric.label}
                        </td>
                        {selectedProjects.map((project) => {
                          const value = (project as any)[metric.key];
                          const displayValue = value !== null && value !== undefined 
                            ? typeof value === 'number' 
                              ? value.toFixed(metric.key === 'price_per_credit' ? 2 : 1)
                              : value
                            : 'N/A';

                          return (
                            <td key={project.id} className="px-4 py-3 text-foreground font-medium">
                              {displayValue}{metric.unit && ` ${metric.unit}`}
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                    {/* Certification Row */}
                    <tr className="border-t border-border/30 bg-background/30">
                      <td className="px-4 py-3 font-medium text-muted-foreground text-sm">
                        Certification
                      </td>
                      {selectedProjects.map((project) => (
                        <td key={project.id} className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            {project.certification}
                          </Badge>
                        </td>
                      ))}
                    </tr>

                    {/* Verification Status */}
                    <tr className="bg-background/30">
                      <td className="px-4 py-3 font-medium text-muted-foreground text-sm">
                        Verification Status
                      </td>
                      {selectedProjects.map((project) => (
                        <td key={project.id} className="px-4 py-3">
                          {project.verified_by_system_at ? (
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600">Verified</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Pending</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border/50"
            >
              Done
            </Button>
            {selectedProjects.length > 0 && (
              <Button asChild className="flex-1 bg-primary hover:bg-primary/90 gap-2">
                <Link to="/marketplace">
                  Back to Marketplace
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
