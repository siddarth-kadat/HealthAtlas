import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from 'recharts';
import { Activity, Loader2 } from 'lucide-react';
import api from '../services/api';
import {
  normalizeChartContent,
  STORY_CHART_METRIC_OPTIONS,
  STORY_CHART_SOURCE_OPTIONS,
  STORY_CHART_TYPE_OPTIONS,
} from '../utils/storyCharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const metricLabels = {
  prevalence: 'Prevalence Rate (%)',
  population: 'Affected Population',
  value: 'Share Percent (%)',
  totalAffected: 'Affected Population',
};

const metricFormatters = {
  prevalence: (value) => `${value}%`,
  value: (value) => `${value}%`,
  population: (value) => new Intl.NumberFormat('en-US').format(value || 0),
  totalAffected: (value) => new Intl.NumberFormat('en-US').format(value || 0),
};

const fieldClassName = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500';

const StoryChartBlock = ({
  content,
  editable = false,
  onChange,
  metadata,
  themeColor = '#3b82f6',
}) => {
  const config = useMemo(() => normalizeChartContent(content), [content]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError('');

        const endpoint = config.dataSource === 'gender' ? '/dashboard/gender' : '/dashboard/trends';
        const params = {
          country: config.filters.country,
          disease: config.filters.disease,
          year: config.filters.year,
          gender: config.dataSource === 'gender' ? 'All' : config.filters.gender,
          ageGroup: config.filters.ageGroup,
        };

        const response = await api.get(endpoint, { params });

        if (!cancelled) {
          setChartData(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.msg || 'Unable to load chart data');
          setChartData([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchChartData();

    return () => {
      cancelled = true;
    };
  }, [config]);

  const updateContent = (patch) => {
    if (!editable || !onChange) return;
    onChange(normalizeChartContent({ ...config, ...patch }));
  };

  const updateFilters = (field, value) => {
    updateContent({
      filters: {
        ...config.filters,
        [field]: value,
      },
    });
  };

  const dataSourceOptions = STORY_CHART_SOURCE_OPTIONS;
  const chartTypeOptions = STORY_CHART_TYPE_OPTIONS[config.dataSource];
  const metricOptions = STORY_CHART_METRIC_OPTIONS[config.dataSource];
  const metricKey = config.metric;
  const formatter = metricFormatters[metricKey] || ((value) => value);

  const renderTrendsChart = () => {
    if (config.chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={formatter} />
            <Tooltip formatter={(value) => [formatter(value), metricLabels[metricKey]]} />
            <Legend />
            <Bar dataKey={metricKey} fill={themeColor} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (config.chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`story-chart-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={themeColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={themeColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={formatter} />
            <Tooltip formatter={(value) => [formatter(value), metricLabels[metricKey]]} />
            <Area type="monotone" dataKey={metricKey} stroke={themeColor} strokeWidth={3} fill={`url(#story-chart-${metricKey})`} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="year" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} tickFormatter={formatter} />
          <Tooltip formatter={(value) => [formatter(value), metricLabels[metricKey]]} />
          <Line type="monotone" dataKey={metricKey} stroke={themeColor} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderGenderChart = () => {
    if (config.chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={formatter} />
            <Tooltip formatter={(value) => [formatter(value), metricLabels[metricKey]]} />
            <Bar dataKey={metricKey} radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey={metricKey} nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4}>
            {chartData.map((entry, index) => (
              <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [formatter(value), metricLabels[metricKey]]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm font-medium">Loading plot data...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-red-600">
          {error}
        </div>
      );
    }

    if (!chartData.length) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
          <Activity className="h-10 w-10 opacity-40" />
          <p className="text-sm font-medium">No data available for the selected filters</p>
        </div>
      );
    }

    return config.dataSource === 'gender' ? renderGenderChart() : renderTrendsChart();
  };

  return (
    <div className="space-y-4">
      {editable && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Chart Title</label>
            <input
              className={fieldClassName}
              placeholder="Chart title..."
              value={config.title}
              onChange={(event) => updateContent({ title: event.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Dataset</label>
            <select
              className={fieldClassName}
              value={config.dataSource}
              onChange={(event) => updateContent({ dataSource: event.target.value })}
            >
              {dataSourceOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Plot Type</label>
            <select
              className={fieldClassName}
              value={config.chartType}
              onChange={(event) => updateContent({ chartType: event.target.value })}
            >
              {chartTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Metric</label>
            <select
              className={fieldClassName}
              value={config.metric}
              onChange={(event) => updateContent({ metric: event.target.value })}
            >
              {metricOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Country</label>
            <select
              className={fieldClassName}
              value={config.filters.country}
              onChange={(event) => updateFilters('country', event.target.value)}
            >
              <option value="All">All Countries</option>
              {metadata?.availableCountries?.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Disease</label>
            <select
              className={fieldClassName}
              value={config.filters.disease}
              onChange={(event) => updateFilters('disease', event.target.value)}
            >
              <option value="All">All Diseases</option>
              {metadata?.availableDiseases?.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>

          {config.dataSource === 'gender' && (
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Year Snapshot</label>
              <select
                className={fieldClassName}
                value={config.filters.year}
                onChange={(event) => updateFilters('year', event.target.value)}
              >
                <option value="All">Latest Available</option>
                {metadata?.availableYears?.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          )}

          {config.dataSource === 'trends' && (
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Gender Filter</label>
              <select
                className={fieldClassName}
                value={config.filters.gender}
                onChange={(event) => updateFilters('gender', event.target.value)}
              >
                <option value="All">All Genders</option>
                {metadata?.availableGenders?.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Age Group</label>
            <select
              className={fieldClassName}
              value={config.filters.ageGroup}
              onChange={(event) => updateFilters('ageGroup', event.target.value)}
            >
              <option value="All">All Age Groups</option>
              {metadata?.availableAgeGroups?.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {!editable && (
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-slate-900">{config.title}</h3>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
            {config.dataSource === 'gender' ? 'Gender distribution snapshot' : 'Time-series disease trends'}
          </p>
        </div>
      )}

      <div className="h-72 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
        {renderChart()}
      </div>
    </div>
  );
};

export default StoryChartBlock;
