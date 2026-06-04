import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import { HealthStat } from './models/HealthStat.js';
import { SyncStatus } from './models/SyncStatus.js';

dotenv.config({ path: './.env' });

const seedDataset = async (filePath) => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI not found in environment');
      return;
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await HealthStat.deleteMany({});
    await SyncStatus.deleteMany({});
    console.log('Cleared existing health statistics and sync status.');

    // Seed Sync Status
    const syncRecords = [
        { datasetName: 'WHO Global Health Observatory', source: 'World Health Organization', freshnessColor: 'Green', lastUpdated: new Date() },
        { datasetName: 'CDC Outbreak Surveillance', source: 'CDC', freshnessColor: 'Green', lastUpdated: new Date() },
        { datasetName: 'MSF Field Reports', source: 'Doctors Without Borders', freshnessColor: 'Amber', lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { datasetName: 'National Health Portals', source: 'Gov. Aggregated', freshnessColor: 'Green', lastUpdated: new Date() }
    ];
    await SyncStatus.insertMany(syncRecords);
    console.log('Seeded sync status records.');

    const stats = [];
    const parser = fs.createReadStream(filePath).pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      })
    );

    let count = 0;
    for await (const row of parser) {
      stats.push({
        country: row['Country'],
        year: parseInt(row['Year']),
        diseaseName: row['Disease Name'] || row['Disease_Name'],
        diseaseCategory: row['Disease Category'] || row['Disease_Category'],
        prevalenceRate: parseFloat(row['Prevalence Rate (%)'] || row['Prevalence_Rate_(%)'] || 0),
        incidenceRate: parseFloat(row['Incidence Rate (%)'] || row['Incidence_Rate_(%)'] || 0),
        mortalityRate: parseFloat(row['Mortality Rate (%)'] || row['Mortality_Rate_(%)'] || 0),
        ageGroup: row['Age Group'] || row['Age_Group'],
        gender: row['Gender'],
        populationAffected: parseInt(row['Population Affected'] || row['Population_Affected'] || 0),
        healthcareAccess: parseFloat(row['Healthcare Access (%)'] || row['Healthcare_Access_(%)'] || 0),
        doctorsPer1000: parseFloat(row['Doctors per 1000'] || row['Doctors_per_1000'] || 0),
        hospitalBedsPer1000: parseFloat(row['Hospital Beds per 1000'] || row['Hospital_Beds_per_1000'] || 0),
        treatmentType: row['Treatment Type'] || row['Treatment_Type'],
        averageTreatmentCost: parseFloat(row['Average Treatment Cost (USD)'] || row['Average_Treatment_Cost_(USD)'] || 0),
        vaccineAvailability: row['Availability of Vaccines/Treatment'] || row['Availability_of_Vaccines/Treatment'],
        recoveryRate: parseFloat(row['Recovery Rate (%)'] || row['Recovery_Rate_(%)'] || 0),
        dalys: parseFloat(row['DALYs'] || 0),
        improvementIn5Years: parseFloat(row['Improvement in 5 Years (%)'] || row['Improvement_in_5_Years_(%)'] || 0),
        perCapitaIncome: parseFloat(row['Per Capita Income (USD)'] || row['Per_Capita_Income_(USD)'] || 0),
        educationIndex: parseFloat(row['Education Index'] || row['Education_Index'] || 0),
        urbanizationRate: parseFloat(row['Urbanization Rate (%)'] || row['Urbanization_Rate_(%)'] || 0)
      });

      count++;

      // Insert in chunks of 500 to avoid memory issues with huge datasets
      if (stats.length >= 500) {
        await HealthStat.insertMany(stats);
        console.log(`Inserted ${count} records...`);
        stats.length = 0;
      }
    }

    if (stats.length > 0) {
      await HealthStat.insertMany(stats);
      console.log(`Inserted remaining ${stats.length} records.`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
};

// Check if file path is provided
const datasetPath = process.argv[2];
if (!datasetPath) {
  // If no argument is provided, check if the old dataset.csv exists in uploads
  const defaultPath = './uploads/dataset.csv';
  if (fs.existsSync(defaultPath)) {
    console.log(`Using default dataset path: ${defaultPath}`);
    seedDataset(defaultPath);
  } else {
    console.error('Error: Please provide the path to your CSV file.');
    console.error('Usage: node seed.js <path-to-csv-file>');
    console.error('Example: node seed.js "D:\\SE Course Project\\mightymerged.csv"');
    process.exit(1);
  }
} else if (fs.existsSync(datasetPath)) {
  seedDataset(datasetPath);
} else {
  console.error(`File not found: ${datasetPath}`);
  process.exit(1);
}
