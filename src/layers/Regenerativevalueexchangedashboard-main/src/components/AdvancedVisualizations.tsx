import { NetworkGraph } from './visualizations/NetworkGraph';
import { ImpactHeatmap } from './visualizations/ImpactHeatmap';
import { ValueFlowDiagram } from './visualizations/ValueFlowDiagram';
import { TimelineVisualization } from './visualizations/TimelineVisualization';
import { ImpactGauge } from './visualizations/ImpactGauge';
import { TreeMapVisualization } from './visualizations/TreeMapVisualization';

// Sample data for Network Graph
const networkNodes = [
  { id: '1', label: 'Amazon Restoration', type: 'project' as const, value: 234, connections: ['2', '3', '4'] },
  { id: '2', label: 'Indigenous Custodians', type: 'custodian' as const, value: 187, connections: ['1', '5'] },
  { id: '3', label: 'Carbon Credits', type: 'asset' as const, value: 142, connections: ['1', '6'] },
  { id: '4', label: 'Local Communities', type: 'community' as const, value: 98, connections: ['1', '2'] },
  { id: '5', label: 'Forest Bonds', type: 'asset' as const, value: 156, connections: ['2', '6'] },
  { id: '6', label: 'Great Green Wall', type: 'project' as const, value: 187, connections: ['3', '5'] },
];

// Sample data for Heatmap
const heatmapData = [
  // North America
  { region: 'North America', month: 'Jan', value: 72, change: 5.2 },
  { region: 'North America', month: 'Feb', value: 75, change: 4.2 },
  { region: 'North America', month: 'Mar', value: 78, change: 4.0 },
  { region: 'North America', month: 'Apr', value: 81, change: 3.8 },
  { region: 'North America', month: 'May', value: 83, change: 2.5 },
  { region: 'North America', month: 'Jun', value: 86, change: 3.6 },
  // South America
  { region: 'South America', month: 'Jan', value: 68, change: 6.3 },
  { region: 'South America', month: 'Feb', value: 71, change: 4.4 },
  { region: 'South America', month: 'Mar', value: 74, change: 4.2 },
  { region: 'South America', month: 'Apr', value: 77, change: 4.1 },
  { region: 'South America', month: 'May', value: 80, change: 3.9 },
  { region: 'South America', month: 'Jun', value: 84, change: 5.0 },
  // Europe
  { region: 'Europe', month: 'Jan', value: 76, change: 3.2 },
  { region: 'Europe', month: 'Feb', value: 78, change: 2.6 },
  { region: 'Europe', month: 'Mar', value: 80, change: 2.6 },
  { region: 'Europe', month: 'Apr', value: 82, change: 2.5 },
  { region: 'Europe', month: 'May', value: 84, change: 2.4 },
  { region: 'Europe', month: 'Jun', value: 87, change: 3.6 },
  // Africa
  { region: 'Africa', month: 'Jan', value: 64, change: 7.8 },
  { region: 'Africa', month: 'Feb', value: 67, change: 4.7 },
  { region: 'Africa', month: 'Mar', value: 71, change: 6.0 },
  { region: 'Africa', month: 'Apr', value: 74, change: 4.2 },
  { region: 'Africa', month: 'May', value: 77, change: 4.1 },
  { region: 'Africa', month: 'Jun', value: 81, change: 5.2 },
  // Asia
  { region: 'Asia', month: 'Jan', value: 70, change: 5.4 },
  { region: 'Asia', month: 'Feb', value: 73, change: 4.3 },
  { region: 'Asia', month: 'Mar', value: 76, change: 4.1 },
  { region: 'Asia', month: 'Apr', value: 79, change: 3.9 },
  { region: 'Asia', month: 'May', value: 82, change: 3.8 },
  { region: 'Asia', month: 'Jun', value: 85, change: 3.7 },
];

// Sample data for Value Flow
const flowSources = [
  { id: 's1', label: 'Environmental Assets', value: 384.2, color: '#10b981' },
  { id: 's2', label: 'Health Assets', value: 212.8, color: '#3b82f6' },
  { id: 's3', label: 'Cultural Assets', value: 156.1, color: '#f59e0b' },
];

const flowTargets = [
  { id: 't1', label: 'Forest Restoration', value: 298.4, color: '#059669' },
  { id: 't2', label: 'Community Programs', value: 234.6, color: '#0284c7' },
  { id: 't3', label: 'Heritage Preservation', value: 220.1, color: '#d97706' },
];

const flows = [
  { from: 's1', to: 't1', value: 234.2, label: 'Direct Investment' },
  { from: 's1', to: 't2', value: 89.5, label: 'Community Support' },
  { from: 's1', to: 't3', value: 60.5, label: 'Ecosystem Services' },
  { from: 's2', to: 't2', value: 145.1, label: 'Health Programs' },
  { from: 's2', to: 't1', value: 34.2, label: 'Wellness Initiatives' },
  { from: 's2', to: 't3', value: 33.5, label: 'Social Cohesion' },
  { from: 's3', to: 't3', value: 126.1, label: 'Cultural Projects' },
  { from: 's3', to: 't1', value: 30.0, label: 'Traditional Knowledge' },
];

// Sample data for Timeline
const timelineEvents = [
  {
    id: '1',
    title: 'RVE Platform Launch',
    date: 'January 15, 2025',
    category: 'launch' as const,
    impact: 'Global regenerative economy infrastructure established',
    value: 847,
    description: 'Official launch of the Regenerative Value Exchange platform with initial 142 verified assets across four categories.'
  },
  {
    id: '2',
    title: 'Amazon Corridor Project',
    date: 'February 8, 2025',
    category: 'milestone' as const,
    impact: '2.4M hectares protected, 142 indigenous communities engaged',
    value: 234,
    description: 'Major milestone reached in Amazon Rainforest Corridor Restoration project with unprecedented community participation.'
  },
  {
    id: '3',
    title: '1 Billion Trees Planted',
    date: 'March 22, 2025',
    category: 'achievement' as const,
    impact: '12.4M tons CO₂ sequestered annually',
    value: 456,
    description: 'RVE-funded projects collectively reached the milestone of 1 billion trees planted across 89 countries.'
  },
  {
    id: '4',
    title: 'Cultural Heritage Fund',
    date: 'April 10, 2025',
    category: 'launch' as const,
    impact: '47 endangered languages preservation programs initiated',
    value: 92,
    description: 'Launch of dedicated fund for preserving indigenous languages and traditional knowledge systems.'
  },
  {
    id: '5',
    title: '10,000 Custodians Verified',
    date: 'May 5, 2025',
    category: 'milestone' as const,
    impact: 'Network spans 142 countries with 3,421 active custodians',
    value: 178,
    description: 'Verification system successfully onboarded 10,000th custodian organization representing diverse ecosystems.'
  },
  {
    id: '6',
    title: 'Quantum Impact Oracle',
    date: 'July 15, 2025',
    category: 'pending' as const,
    impact: 'Next-generation AI verification launching Q3',
    value: 520,
    description: 'Upcoming deployment of quantum-enhanced oracle network for real-time planetary health monitoring.'
  },
  {
    id: '7',
    title: 'Global Impact Summit',
    date: 'September 20, 2025',
    category: 'pending' as const,
    impact: 'Convening 10,000+ regenerative leaders worldwide',
    value: 340,
    description: 'First global summit bringing together all RVE stakeholders to chart the future of regenerative economics.'
  },
];

// Sample data for TreeMap
const treeMapData = [
  { id: '1', label: 'Carbon Sequestration', value: 142.5, category: 'environmental', change: 12.3, color: '#10b981' },
  { id: '2', label: 'Forest Restoration', value: 98.4, category: 'environmental', change: 8.7, color: '#059669' },
  { id: '3', label: 'Community Wellness', value: 87.2, category: 'health', change: 15.2, color: '#3b82f6' },
  { id: '4', label: 'Wetland Revival', value: 76.8, category: 'environmental', change: 6.4, color: '#047857' },
  { id: '5', label: 'Disease Prevention', value: 65.3, category: 'health', change: 9.8, color: '#0284c7' },
  { id: '6', label: 'Educational Uplift', value: 60.3, category: 'health', change: 11.2, color: '#0369a1' },
  { id: '7', label: 'Language Preservation', value: 54.2, category: 'cultural', change: 18.6, color: '#f59e0b' },
  { id: '8', label: 'Traditional Crafts', value: 48.1, category: 'cultural', change: 14.3, color: '#d97706' },
  { id: '9', label: 'Pollination Services', value: 42.7, category: 'ecosystem', change: 7.9, color: '#8b5cf6' },
  { id: '10', label: 'Water Purification', value: 38.9, category: 'ecosystem', change: 10.5, color: '#7c3aed' },
  { id: '11', label: 'Indigenous Governance', value: 33.8, category: 'cultural', change: 22.1, color: '#ea580c' },
  { id: '12', label: 'Climate Resilience', value: 29.4, category: 'ecosystem', change: 13.7, color: '#6d28d9' },
];

export function AdvancedVisualizations() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
        <h2 className="text-white mb-2">Advanced Visualizations</h2>
        <p className="text-emerald-300/80">
          Interactive data visualizations providing deep insights into regenerative value networks, 
          impact distribution, and ecosystem dynamics.
        </p>
      </div>

      {/* Impact Gauges Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ImpactGauge
          value={81}
          maxValue={100}
          title="Forest Health Score"
          subtitle="Global ecosystem vitality"
          target={75}
          previousValue={73}
          thresholds={{ low: 40, medium: 70, high: 85 }}
        />
        <ImpactGauge
          value={68}
          maxValue={100}
          title="Water Quality Index"
          subtitle="Purification & access"
          target={80}
          previousValue={64}
          thresholds={{ low: 35, medium: 65, high: 80 }}
        />
        <ImpactGauge
          value={92}
          maxValue={100}
          title="Community Engagement"
          subtitle="Active participation rate"
          target={85}
          previousValue={87}
          thresholds={{ low: 50, medium: 75, high: 90 }}
        />
      </div>

      {/* Network Graph */}
      <NetworkGraph nodes={networkNodes} title="Regenerative Network Connections" height={400} />

      {/* TreeMap Visualization */}
      <TreeMapVisualization data={treeMapData} title="Asset Value Distribution" width={800} height={500} />

      {/* Impact Heatmap */}
      <ImpactHeatmap data={heatmapData} title="Regional Impact Activity" valueLabel="Health Score" />

      {/* Value Flow Diagram */}
      <ValueFlowDiagram
        sources={flowSources}
        targets={flowTargets}
        flows={flows}
        title="Capital Flow Analysis"
      />

      {/* Timeline */}
      <TimelineVisualization events={timelineEvents} title="RVE Milestones & Achievements" />

      {/* Insights Summary */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-8">
        <h3 className="text-white mb-4">Visualization Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-emerald-300/80">
          <div>
            <h4 className="text-emerald-400 mb-2">Network Dynamics</h4>
            <p className="text-sm">
              The network graph reveals strong interconnections between projects, custodians, and assets, 
              demonstrating the collaborative nature of regenerative economics with an average of 2.5 connections per node.
            </p>
          </div>
          <div>
            <h4 className="text-emerald-400 mb-2">Regional Patterns</h4>
            <p className="text-sm">
              Heatmap analysis shows consistent improvement across all regions, with Africa and South America 
              demonstrating the highest growth rates in ecosystem health scores (averaging 5.4% monthly increase).
            </p>
          </div>
          <div>
            <h4 className="text-emerald-400 mb-2">Value Distribution</h4>
            <p className="text-sm">
              TreeMap visualization highlights environmental assets comprising 42% of total value, with carbon 
              sequestration leading at $142.5B, followed by forest restoration at $98.4B.
            </p>
          </div>
          <div>
            <h4 className="text-emerald-400 mb-2">Capital Efficiency</h4>
            <p className="text-sm">
              Flow analysis demonstrates efficient capital allocation with 87% of environmental asset value 
              flowing to direct restoration projects and community support programs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
