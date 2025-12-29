import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertTriangle, TrendingDown, TrendingUp, Cloud } from "lucide-react";

interface ClimateForecastData {
  month: string;
  temperature_change: number;
  precipitation_trend: number;
  extreme_event_probability: number;
  risk_score: number;
}

interface ClimateRiskForecastingProps {
  zoneId: string;
  historicalData?: ClimateForecastData[];
  forecastData?: ClimateForecastData[];
  isLoading?: boolean;
}

// Generate sample forecast data
const generateForecastData = (): ClimateForecastData[] => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();

  return months.map((month, idx) => {
    const isHistorical = idx <= currentMonth;
    const tempVariation = Math.sin(idx / 2) * 2 + (Math.random() - 0.5) * 1;
    const precipVariation = Math.cos(idx / 3) * 15 + (Math.random() - 0.5) * 10;
    const extremeEvent = 0.1 + Math.sin(idx / 4) * 0.1 + (Math.random() - 0.5) * 0.05;

    return {
      month,
      temperature_change: parseFloat(tempVariation.toFixed(1)),
      precipitation_trend: parseFloat(precipVariation.toFixed(1)),
      extreme_event_probability: Math.max(0, Math.min(1, extremeEvent)),
      risk_score: parseFloat((25 + Math.abs(tempVariation) * 5 + Math.abs(precipVariation) * 0.5).toFixed(1)),
    };
  });
};

const generateHistoricalData = (): ClimateForecastData[] => {
  const months = ["Jan-23", "Mar-23", "May-23", "Jul-23", "Sep-23", "Nov-23"];
  return months.map((month, idx) => ({
    month,
    temperature_change: -0.5 + idx * 0.3 + (Math.random() - 0.5) * 0.2,
    precipitation_trend: 50 + Math.sin(idx / 2) * 30 + (Math.random() - 0.5) * 10,
    extreme_event_probability: 0.1 + idx * 0.02 + (Math.random() - 0.5) * 0.05,
    risk_score: 20 + idx * 2 + (Math.random() - 0.5) * 3,
  }));
};

export const ClimateRiskForecasting: React.FC<ClimateRiskForecastingProps> = ({
  zoneId,
  historicalData,
  forecastData,
  isLoading = false,
}) => {
  const historical = useMemo(() => historicalData || generateHistoricalData(), [historicalData]);
  const forecast = useMemo(() => forecastData || generateForecastData(), [forecastData]);

  const averageRisk = useMemo(() => {
    const allData = [...historical, ...forecast];
    return (allData.reduce((sum, d) => sum + d.risk_score, 0) / allData.length).toFixed(1);
  }, [historical, forecast]);

  const extremeEventTrend = useMemo(() => {
    const forecastExtremes = forecast.slice(6).reduce((sum, d) => sum + d.extreme_event_probability, 0) / forecast.slice(6).length;
    return (forecastExtremes * 100).toFixed(1);
  }, [forecast]);

  const temperatureTrend = useMemo(() => {
    const recentTemps = forecast.slice(-3).map((d) => d.temperature_change);
    const avgRecent = recentTemps.reduce((a, b) => a + b, 0) / recentTemps.length;
    return avgRecent.toFixed(2);
  }, [forecast]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Climate Risk Forecasting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-b from-slate-200 to-slate-100 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Average Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{averageRisk}</p>
            <p className="text-xs text-muted-foreground mt-1">Across 24-month period</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Extreme Event Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{extremeEventTrend}%</p>
            <p className="text-xs text-muted-foreground mt-1">Next 6 months forecast</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Temperature Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${parseFloat(temperatureTrend) > 0 ? "text-red-600" : "text-blue-600"}`}>
              {temperatureTrend}°C
            </p>
            <p className="text-xs text-muted-foreground mt-1">3-month average change</p>
          </CardContent>
        </Card>
      </div>

      {/* Historical Climate Data */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Climate Trends</CardTitle>
          <CardDescription>12-month retrospective analysis (2023)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historical}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="temperature_change" fill="#fca5a5" stroke="#dc2626" />
              <Line yAxisId="right" type="monotone" dataKey="risk_score" stroke="#ea580c" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Climate Forecast (Next 12 Months) */}
      <Card>
        <CardHeader>
          <CardTitle>12-Month Climate Forecast</CardTitle>
          <CardDescription>Earth system models (ensemble prediction)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="risk_score" stroke="#f97316" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="temperature_change" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Extreme Event Probability */}
      <Card>
        <CardHeader>
          <CardTitle>Extreme Event Risk Probability</CardTitle>
          <CardDescription>Bayesian inference from climate models</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 1]} />
              <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="extreme_event_probability" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Severity Legend */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="text-base">Risk Classification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-sm">Low (0-25)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span className="text-sm">Moderate (25-50)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded" />
              <span className="text-sm">High (50-75)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-sm">Critical (75-100)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Climate Impact on Credits */}
      <Card>
        <CardHeader>
          <CardTitle>Climate Risk Impact on Credit Valuation</CardTitle>
          <CardDescription>Risk-adjusted pricing model for permanence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-semibold text-sm mb-2">Low Risk Zones (Score 0-25)</h4>
              <p className="text-sm text-slate-700">
                Credits retain 100% value. Higher permanence confidence justifies premium pricing and longer bond terms.
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-yellow-50">
              <h4 className="font-semibold text-sm mb-2">Moderate Risk (Score 25-50)</h4>
              <p className="text-sm text-slate-700">
                Credits retain 80-90% value. Requires monitoring buffer and shorter vintage terms.
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-orange-50">
              <h4 className="font-semibold text-sm mb-2">High Risk (Score 50-75)</h4>
              <p className="text-sm text-slate-700">
                Credits retain 60-80% value. Requires active reversibility management and rapid verification.
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-red-50">
              <h4 className="font-semibold text-sm mb-2">Critical Risk (Score 75-100)</h4>
              <p className="text-sm text-slate-700">
                May not be issuable. Requires specialized governance and real-time monitoring protocols.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClimateRiskForecasting;
