import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { HealthStat } from '../models/HealthStat.js';
import { SyncStatus } from '../models/SyncStatus.js';
import { invalidateDashboardCache } from '../utils/dashboardCache.js';

export const MAX_DATASET_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024;

// Multer setup
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: MAX_DATASET_UPLOAD_SIZE_BYTES,
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      return cb(new Error('Only CSV dataset files are supported'));
    }

    cb(null, true);
  },
});

const normalizeHeader = (header = '') => String(header).replace(/^\uFEFF/, '').trim();
const normalizeColumnKey = (value = '') => normalizeHeader(value).toLowerCase().replace(/[^a-z0-9]/g, '');
const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');
const getRowValue = (row, ...headers) => {
  for (const header of headers) {
    if (row[header] !== undefined) return row[header];
  }

  const normalizedRow = Object.entries(row).reduce((acc, [key, value]) => {
    acc[normalizeColumnKey(key)] = value;
    return acc;
  }, {});

  for (const header of headers) {
    const value = normalizedRow[normalizeColumnKey(header)];
    if (value !== undefined) return value;
  }

  return undefined;
};

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return 0;
  }

  const parsed = Number.parseFloat(String(value).replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseInteger = (value) => {
  if (value === undefined || value === null || value === '') {
    return 0;
  }

  const parsed = Number.parseInt(String(value).replace(/,/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapRowToHealthStat = (row) => ({
  country: normalizeText(getRowValue(row, 'Country')),
  year: parseInteger(getRowValue(row, 'Year')),
  diseaseName: normalizeText(getRowValue(row, 'Disease Name', 'Disease_Name')),
  diseaseCategory: normalizeText(getRowValue(row, 'Disease Category', 'Disease_Category')),
  prevalenceRate: parseNumber(getRowValue(row, 'Prevalence Rate (%)', 'Prevalence_Rate_(%)')),
  incidenceRate: parseNumber(getRowValue(row, 'Incidence Rate (%)', 'Incidence_Rate_(%)')),
  mortalityRate: parseNumber(getRowValue(row, 'Mortality Rate (%)', 'Mortality_Rate_(%)')),
  ageGroup: normalizeText(getRowValue(row, 'Age Group', 'Age_Group')),
  gender: normalizeText(getRowValue(row, 'Gender')),
  populationAffected: parseInteger(getRowValue(row, 'Population Affected', 'Population_Affected')),
  healthcareAccess: parseNumber(getRowValue(row, 'Healthcare Access (%)', 'Healthcare_Access_(%)')),
  doctorsPer1000: parseNumber(getRowValue(row, 'Doctors per 1000', 'Doctors_per_1000')),
  hospitalBedsPer1000: parseNumber(getRowValue(row, 'Hospital Beds per 1000', 'Hospital_Beds_per_1000')),
  treatmentType: normalizeText(getRowValue(row, 'Treatment Type', 'Treatment_Type')),
  averageTreatmentCost: parseNumber(getRowValue(row, 'Average Treatment Cost (USD)', 'Average_Treatment_Cost_(USD)')),
  vaccineAvailability: normalizeText(getRowValue(row, 'Availability of Vaccines/Treatment', 'Availability_of_Vaccines/Treatment')),
  recoveryRate: parseNumber(getRowValue(row, 'Recovery Rate (%)', 'Recovery_Rate_(%)')),
  dalys: parseNumber(getRowValue(row, 'DALYs')),
  improvementIn5Years: parseNumber(getRowValue(row, 'Improvement in 5 Years (%)', 'Improvement_in_5_Years_(%)')),
  perCapitaIncome: parseNumber(getRowValue(row, 'Per Capita Income (USD)', 'Per_Capita_Income_(USD)')),
  educationIndex: parseNumber(getRowValue(row, 'Education Index', 'Education_Index')),
  urbanizationRate: parseNumber(getRowValue(row, 'Urbanization Rate (%)', 'Urbanization_Rate_(%)'))
});

export const uploadCSV = async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

  const removeUploadedFile = () => {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  };

  const chunkSize = 2000;
  let chunk = [];
  let insertedCount = 0;
  let validCount = 0;
  const countriesTracked = new Set();
  const diseasesTracked = new Set();

  const insertChunk = async () => {
    if (chunk.length === 0) return;

    const rowsToInsert = chunk;
    chunk = [];
    await HealthStat.insertMany(rowsToInsert, { ordered: false });
    insertedCount += rowsToInsert.length;
  };

  const stream = fs.createReadStream(req.file.path)
    .pipe(csv({ mapHeaders: ({ header }) => normalizeHeader(header) }));

  stream
    .on('data', async (data) => {
      stream.pause();

      try {
        const stat = mapRowToHealthStat(data);
        if (stat.country && stat.diseaseName && stat.year) {
          chunk.push(stat);
          validCount += 1;
          countriesTracked.add(stat.country);
          diseasesTracked.add(stat.diseaseName);
        }

        if (chunk.length >= chunkSize) {
          await insertChunk();
        }

        stream.resume();
      } catch (err) {
        stream.destroy(err);
      }
    })
    .on('error', (err) => {
      removeUploadedFile();
      res.status(400).json({ msg: `Failed to parse CSV file: ${err.message}` });
    })
    .on('end', async () => {
      try {
        await insertChunk();

        if (validCount === 0) {
          removeUploadedFile();
          return res.status(400).json({ msg: 'No valid dataset rows were found in the uploaded file' });
        }

        await SyncStatus.findOneAndUpdate(
          { datasetName: 'Uploaded CSV Dataset' },
          {
            datasetName: 'Uploaded CSV Dataset',
            source: req.file.originalname,
            freshnessColor: 'Green',
            lastUpdated: new Date(),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        invalidateDashboardCache();
        
        // Remove file after processing
        removeUploadedFile();
        
        res.json({
          msg: 'Dataset uploaded and appended successfully',
          count: insertedCount,
          countriesTracked: countriesTracked.size,
          diseasesTracked: diseasesTracked.size
        });
      } catch (err) {
        removeUploadedFile();
        res.status(500).json({ msg: err.message });
      }
    });
};

export { upload };
