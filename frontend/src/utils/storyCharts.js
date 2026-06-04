export const STORY_CHART_DEFAULTS = {
  title: 'New Chart',
  chartType: 'line',
  dataSource: 'trends',
  metric: 'prevalence',
  filters: {
    country: 'All',
    disease: 'All',
    year: 'All',
    gender: 'All',
    ageGroup: 'All',
  },
};

export const STORY_CHART_SOURCE_OPTIONS = [
  { value: 'trends', label: 'Disease Trends' },
  { value: 'gender', label: 'Gender Distribution' },
];

export const STORY_CHART_TYPE_OPTIONS = {
  trends: [
    { value: 'line', label: 'Line Plot' },
    { value: 'area', label: 'Area Plot' },
    { value: 'bar', label: 'Bar Plot' },
  ],
  gender: [
    { value: 'pie', label: 'Pie Plot' },
    { value: 'bar', label: 'Bar Plot' },
  ],
};

export const STORY_CHART_METRIC_OPTIONS = {
  trends: [
    { value: 'prevalence', label: 'Prevalence Rate (%)' },
    { value: 'population', label: 'Affected Population' },
  ],
  gender: [
    { value: 'value', label: 'Share Percent (%)' },
    { value: 'totalAffected', label: 'Affected Population' },
  ],
};

const allowedTypesBySource = Object.fromEntries(
  Object.entries(STORY_CHART_TYPE_OPTIONS).map(([source, options]) => [source, options.map((option) => option.value)])
);

const allowedMetricsBySource = Object.fromEntries(
  Object.entries(STORY_CHART_METRIC_OPTIONS).map(([source, options]) => [source, options.map((option) => option.value)])
);

export const normalizeChartContent = (content = {}) => {
  const dataSource = STORY_CHART_SOURCE_OPTIONS.some((option) => option.value === content.dataSource)
    ? content.dataSource
    : STORY_CHART_DEFAULTS.dataSource;

  const chartType = allowedTypesBySource[dataSource]?.includes(content.chartType)
    ? content.chartType
    : STORY_CHART_TYPE_OPTIONS[dataSource][0].value;

  const metric = allowedMetricsBySource[dataSource]?.includes(content.metric)
    ? content.metric
    : STORY_CHART_DEFAULTS.metric;

  return {
    title: typeof content.title === 'string' && content.title.trim() ? content.title : STORY_CHART_DEFAULTS.title,
    dataSource,
    chartType,
    metric,
    filters: {
      ...STORY_CHART_DEFAULTS.filters,
      ...(content.filters || {}),
    },
  };
};

export const createChartBlockContent = () => normalizeChartContent(STORY_CHART_DEFAULTS);

export const sanitizeStoryBlocks = (blocks = []) => (
  blocks.map((block) => {
    const cleanBlock = {
      id: String(block.id),
      type: block.type,
    };

    if (block.type === 'text') {
      cleanBlock.content = String(block.content || '');
    } else if (block.type === 'chart') {
      cleanBlock.content = normalizeChartContent(block.content);
    }

    return cleanBlock;
  })
);
