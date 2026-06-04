import { HealthStat } from '../models/HealthStat.js';
import { SyncStatus } from '../models/SyncStatus.js';

const normalizeLabel = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const uniqueNormalizedValues = (values) => (
  [...new Set((values || []).map(normalizeLabel).filter(Boolean))]
);

const canonicalGender = (value) => {
  const normalized = normalizeLabel(value).toLowerCase();
  if (normalized === 'female') return 'Female';
  if (normalized === 'male') return 'Male';
  return '';
};

const coalesce = (...fields) => (
  fields.reduceRight((fallback, field) => ({ $ifNull: [`$${field}`, fallback] }), '')
);

const textExpr = (...fields) => ({
  $trim: {
    input: {
      $toString: coalesce(...fields),
    },
  },
});

const numberExpr = (...fields) => ({
  $convert: {
    input: coalesce(...fields),
    to: 'double',
    onError: 0,
    onNull: 0,
  },
});

const integerExpr = (...fields) => ({
  $convert: {
    input: coalesce(...fields),
    to: 'int',
    onError: 0,
    onNull: 0,
  },
});

const fields = {
  country: textExpr('country', 'Country'),
  year: integerExpr('year', 'Year'),
  diseaseName: textExpr('diseaseName', 'Disease Name', 'Disease_Name'),
  prevalenceRate: numberExpr('prevalenceRate', 'Prevalence Rate (%)', 'Prevalence_Rate_(%)'),
  populationAffected: integerExpr('populationAffected', 'Population Affected', 'Population_Affected'),
  improvementIn5Years: numberExpr('improvementIn5Years', 'Improvement in 5 Years (%)', 'Improvement_in_5_Years_(%)'),
  gender: textExpr('gender', 'Gender'),
  ageGroup: textExpr('ageGroup', 'Age Group', 'Age_Group'),
};

const addStoredFieldMatch = (clauses, normalizedField, rawFields, value, transform = normalizeLabel) => {
  if (!value || value === 'All') return;

  const normalizedValue = transform(value);
  if (normalizedValue === '' || Number.isNaN(normalizedValue)) return;

  clauses.push({
    $or: [
      { [normalizedField]: normalizedValue },
      ...rawFields.map((field) => ({ [field]: normalizedValue })),
    ],
  });
};

const buildStoredMatch = ({ country, disease, year, gender, ageGroup }, options = {}) => {
  const {
    includeYear = true,
    includeGender = true,
  } = options;

  const clauses = [];

  addStoredFieldMatch(clauses, 'country', ['Country'], country);
  addStoredFieldMatch(clauses, 'diseaseName', ['Disease Name', 'Disease_Name'], disease);
  if (includeGender) addStoredFieldMatch(clauses, 'gender', ['Gender'], gender);
  addStoredFieldMatch(clauses, 'ageGroup', ['Age Group', 'Age_Group'], ageGroup);

  if (includeYear && year && year !== 'All') {
    addStoredFieldMatch(clauses, 'year', ['Year'], year, (value) => Number.parseInt(value, 10));
  }

  return clauses.length ? { $and: clauses } : {};
};

const buildMatch = ({ country, disease, year, gender, ageGroup }, options = {}) => {
  const {
    includeYear = true,
    includeGender = true,
  } = options;

  const match = {};

  if (country && country !== 'All') match.country = normalizeLabel(country);
  if (disease && disease !== 'All') match.diseaseName = normalizeLabel(disease);
  if (includeGender && gender && gender !== 'All') match.gender = normalizeLabel(gender);
  if (ageGroup && ageGroup !== 'All') match.ageGroup = normalizeLabel(ageGroup);

  if (includeYear && year && year !== 'All') {
    const parsedYear = Number.parseInt(year, 10);
    if (!Number.isNaN(parsedYear)) {
      match.year = parsedYear;
    }
  }

  return match;
};

export const getSummary = async (req, res) => {
  try {
    const [summaryStats, totalRecords] = await Promise.all([
      HealthStat.aggregate([
        {
          $group: {
            _id: null,
            countries: { $addToSet: fields.country },
            diseases: { $addToSet: fields.diseaseName },
            years: { $addToSet: fields.year },
            genders: { $addToSet: fields.gender },
            ageGroups: { $addToSet: fields.ageGroup },
            avgPrev: { $avg: fields.prevalenceRate },
          },
        }
      ]).allowDiskUse(true),
      HealthStat.countDocuments(),
    ]);

    const stats = summaryStats[0] || {};
    
    const availableCountries = uniqueNormalizedValues(stats.countries).sort((a, b) => a.localeCompare(b));
    const availableDiseases = uniqueNormalizedValues(stats.diseases).sort((a, b) => a.localeCompare(b));
    const availableGenders = uniqueNormalizedValues(stats.genders).sort((a, b) => a.localeCompare(b));
    const availableAgeGroups = uniqueNormalizedValues(stats.ageGroups).sort((a, b) => a.localeCompare(b));
    const availableYears = [...new Set((stats.years || []).filter((value) => Number.isFinite(value) && value > 0))].sort((a, b) => b - a);
    
    const summary = {
      countriesTracked: availableCountries.length,
      diseasesTracked: availableDiseases.length,
      totalRecords,
      alertsActive: 12, 
      avgRiskScore: stats.avgPrev ? stats.avgPrev.toFixed(1) : 0,
      availableCountries,
      availableDiseases,
      availableYears,
      availableGenders,
      availableAgeGroups
    };
    
    res.json(summary);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getTrends = async (req, res) => {
  const { country, disease, gender, ageGroup } = req.query;
  try {
    const match = buildStoredMatch({ country, disease, gender, ageGroup }, { includeYear: false });

    const stats = await HealthStat.aggregate([
      { $match: match },
      { 
        $group: { 
          _id: fields.year, 
          prevalence: { $avg: fields.prevalenceRate },
          population: { $sum: fields.populationAffected }
        } 
      },
      { $match: { _id: { $gt: 0 } } },
      { $sort: { _id: 1 } }
    ]).allowDiskUse(true);

    const formatted = stats.map(s => ({
      year: s._id,
      prevalence: parseFloat((s.prevalence || 0).toFixed(2)),
      population: s.population
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getGenderStats = async (req, res) => {
  const { country, disease, year, gender, ageGroup } = req.query;
  try {
    const selectedGender = canonicalGender(gender);
    const genderFilter = selectedGender || 'All';
    const baseMatch = buildStoredMatch({ country, disease, year, gender: genderFilter, ageGroup });
    let snapshotYear = null;

    if (!year || year === 'All') {
      const latestYearResult = await HealthStat.aggregate([
        { $match: buildStoredMatch({ country, disease, gender: genderFilter, ageGroup }, { includeYear: false }) },
        { $group: { _id: null, latestYear: { $max: fields.year } } }
      ]).allowDiskUse(true);

      if (latestYearResult[0]?.latestYear) {
        snapshotYear = latestYearResult[0].latestYear;
        const yearMatch = buildStoredMatch({ year: snapshotYear });
        baseMatch.$and = [...(baseMatch.$and || []), ...(yearMatch.$and || [])];
      }
    } else {
      const parsedYear = Number.parseInt(year, 10);
      snapshotYear = Number.isNaN(parsedYear) ? null : parsedYear;
    }

    const stats = await HealthStat.aggregate([
      { $match: baseMatch },
      { 
        $group: { 
          _id: fields.gender, 
          totalAffected: { $sum: fields.populationAffected },
          avgAffected: { $avg: fields.populationAffected },
          count: { $sum: 1 }
        } 
      },
      { $match: { _id: { $nin: ['', null] } } },
      { $sort: { _id: 1 } }
    ]).allowDiskUse(true);

    const genderTotals = stats.reduce((acc, item) => {
      const name = canonicalGender(item._id);
      if (!name) return acc;

      const current = acc[name] || { totalAffected: 0, weightedAffected: 0, count: 0 };
      const count = item.count || 0;
      current.totalAffected += item.totalAffected || 0;
      current.weightedAffected += (item.avgAffected || 0) * count;
      current.count += count;
      acc[name] = current;
      return acc;
    }, {});

    const displayOrder = selectedGender ? [selectedGender] : ['Female', 'Male'];
    const orderedStats = displayOrder
      .map((name) => ({ name, ...genderTotals[name] }))
      .filter((item) => item.totalAffected > 0);

    const totalAffected = orderedStats.reduce((sum, item) => sum + (item.totalAffected || 0), 0);
    const formatted = orderedStats.map((s) => {
      const share = totalAffected > 0 ? (s.totalAffected / totalAffected) * 100 : 0;

      return {
        name: s.name,
        value: parseFloat(share.toFixed(2)),
        totalAffected: Math.round(s.totalAffected || 0),
        averageAffected: s.count > 0 ? Math.round((s.weightedAffected || 0) / s.count) : 0,
        year: snapshotYear
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getRankings = async (req, res) => {
  try {
    const rankings = await HealthStat.aggregate([
      {
        $group: {
          _id: fields.country,
          avgPrevalence: { $avg: fields.prevalenceRate },
          totalPopulationAffected: { $sum: fields.populationAffected },
          avgImprovement: { $avg: fields.improvementIn5Years }
        }
      },
      { $match: { _id: { $nin: ['', null] } } },
      { $sort: { avgPrevalence: -1 } }
    ]).allowDiskUse(true);

    const formatted = rankings.map((r, index) => ({
      rank: index + 1,
      country: r._id,
      prevalence: parseFloat((r.avgPrevalence || 0).toFixed(2)),
      trend: (r.avgImprovement > 0 ? '-' : '+') + Math.abs(r.avgImprovement || 0).toFixed(1) + '%',
      rawTrend: r.avgImprovement,
      risk: r.avgPrevalence > 15 ? 'High' : r.avgPrevalence > 7 ? 'Medium' : 'Low',
      score: r.avgPrevalence
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getMapData = async (req, res) => {
  try {
    const mapData = await HealthStat.aggregate([
      {
        $group: {
          _id: fields.country,
          avgPrevalence: { $avg: fields.prevalenceRate }
        }
      },
      { $match: { _id: { $nin: ['', null] } } }
    ]).allowDiskUse(true);

    const formatted = mapData.reduce((acc, curr) => {
      acc[curr._id] = curr.avgPrevalence;
      return acc;
    }, {});

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getPredictions = async (req, res) => {
  const { country, disease, gender, ageGroup } = req.query;
  try {
    const match = buildStoredMatch({ country, disease, gender, ageGroup }, { includeYear: false });

    // Get all historical data points matching the query, grouped by year
    const historicalSeries = await HealthStat.aggregate([
        { $match: match },
        {
            $group: {
                _id: fields.year,
                avgPrev: { $avg: fields.prevalenceRate },
                improvement: { $avg: fields.improvementIn5Years }
            }
        },
        { $match: { _id: { $gt: 0 } } },
        { $sort: { _id: 1 } }
    ]).allowDiskUse(true);

    if (historicalSeries.length === 0) {
        return res.json({ predictions: [], latestMeta: null });
    }

    // Linear Regression implementation: y = mx + c
    const n = historicalSeries.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    historicalSeries.forEach(point => {
        const x = point._id;
        const y = point.avgPrev;
        sumX += x;
        sumY += y;
        sumXY += (x * y);
        sumXX += (x * x);
    });

    let slope = 0;
    let intercept = sumY / n;

    if (n > 1) {
        const denominator = (n * sumXX) - (sumX * sumX);
        if (denominator !== 0) {
            slope = ((n * sumXY) - (sumX * sumY)) / denominator;
            intercept = (sumY - (slope * sumX)) / n;
        }
    } else {
        // Fallback to improvement field if only one year data exists
        const first = historicalSeries[0];
        slope = -(first.improvement || 0.1);
        intercept = first.avgPrev - (slope * first._id);
    }

    // Generate output data: Historical + Predicted
    const predictions = historicalSeries.map(p => ({
        year: p._id,
        value: parseFloat(p.avgPrev.toFixed(2)),
        forecast: parseFloat(p.avgPrev.toFixed(2)),
        isForecast: false
    }));

    const lastKnownYear = historicalSeries[historicalSeries.length - 1]._id;
    const lastKnownValue = historicalSeries[historicalSeries.length - 1].avgPrev;

    // Project 5 years into the future
    for (let i = 1; i <= 5; i++) {
        const year = lastKnownYear + i;
        // Basic linear projection
        let forecastValue = (slope * year) + intercept;
        
        // Safety bound: don't let it go below zero, and don't let it wildly diverge 
        // if the slope is too aggressive. We also apply a small decay to the growth if it's positive.
        if (slope > 0) {
            // If it's increasing, we dampen the acceleration slightly for "realism"
            forecastValue = lastKnownValue + (slope * i * Math.pow(0.9, i));
        }

        forecastValue = Math.max(0, forecastValue);

        predictions.push({
            year,
            value: null,
            forecast: parseFloat(forecastValue.toFixed(2)),
            isForecast: true
        });
    }

    const latestValue = historicalSeries[historicalSeries.length - 1].avgPrev;
    const finalProjectedValue = predictions[predictions.length - 1].forecast;
    const netChange = finalProjectedValue - latestValue;

    res.json({
        predictions,
        latestMeta: {
            diseaseName: disease || 'Aggregate Health Data',
            currentPrevalence: latestValue,
            projectedPrevalence: finalProjectedValue,
            improvementIn5Years: -netChange, // Positive means improvement (prevalence went down)
            confidenceScore: n > 3 ? 'High' : n > 1 ? 'Medium' : 'Low (Insufficient Data)'
        }
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getScorecard = async (req, res) => {
    try {
        const data = await HealthStat.aggregate([
            {
                $group: {
                    _id: fields.country,
                    avgPrev: { $avg: fields.prevalenceRate },
                    avgImprovement: { $avg: fields.improvementIn5Years }
                }
            },
            { $match: { _id: { $nin: ['', null] } } }
        ]).allowDiskUse(true);

        const getGrade = (score, invert = false) => {
            if (invert) score = 100 - score; // If high is good, invert it
            if (score < 5) return 'A';
            if (score < 10) return 'B';
            if (score < 15) return 'C';
            if (score < 20) return 'D';
            return 'F';
        };

        const getImprovementGrade = (improvement) => {
            if (improvement > 2) return 'A';
            if (improvement > 1) return 'B';
            if (improvement > 0.5) return 'C';
            if (improvement > 0) return 'D';
            return 'F';
        };

        const scorecard = data.map(item => {
            const prevGrade = getGrade(item.avgPrev);
            const improveGrade = getImprovementGrade(item.avgImprovement);
            
            // Calculate equity grade (stub logic)
            const equityGrade = item.avgPrev < 10 ? 'A' : 'B'; 

            return {
                country: item._id,
                prevalenceGrade: prevGrade,
                improvementGrade: improveGrade,
                equityGrade: equityGrade,
                overallScore: (item.avgPrev + (5 - item.avgImprovement)) / 2
            };
        }).sort((a, b) => a.overallScore - b.overallScore);

        res.json(scorecard);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const getSyncStatus = async (req, res) => {
    try {
        const status = await SyncStatus.find().sort({ lastUpdated: -1 });
        res.json(status);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
