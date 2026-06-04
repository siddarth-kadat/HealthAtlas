const coalesce = (...fields) => (
  fields.reduceRight((fallback, field) => ({ $ifNull: [`$${field}`, fallback] }), '')
);

const textField = (...fields) => ({
  $trim: {
    input: {
      $toString: coalesce(...fields),
    },
  },
});

const numberField = (...fields) => ({
  $convert: {
    input: coalesce(...fields),
    to: 'double',
    onError: 0,
    onNull: 0,
  },
});

const integerField = (...fields) => ({
  $convert: {
    input: coalesce(...fields),
    to: 'int',
    onError: 0,
    onNull: 0,
  },
});

export const normalizeHealthStatFieldsStage = {
  $addFields: {
    country: textField('country', 'Country'),
    year: integerField('year', 'Year'),
    diseaseName: textField('diseaseName', 'Disease Name', 'Disease_Name'),
    diseaseCategory: textField('diseaseCategory', 'Disease Category', 'Disease_Category'),
    prevalenceRate: numberField('prevalenceRate', 'Prevalence Rate (%)', 'Prevalence_Rate_(%)'),
    incidenceRate: numberField('incidenceRate', 'Incidence Rate (%)', 'Incidence_Rate_(%)'),
    mortalityRate: numberField('mortalityRate', 'Mortality Rate (%)', 'Mortality_Rate_(%)'),
    ageGroup: textField('ageGroup', 'Age Group', 'Age_Group'),
    gender: textField('gender', 'Gender'),
    populationAffected: integerField('populationAffected', 'Population Affected', 'Population_Affected'),
    healthcareAccess: numberField('healthcareAccess', 'Healthcare Access (%)', 'Healthcare_Access_(%)'),
    doctorsPer1000: numberField('doctorsPer1000', 'Doctors per 1000', 'Doctors_per_1000'),
    hospitalBedsPer1000: numberField('hospitalBedsPer1000', 'Hospital Beds per 1000', 'Hospital_Beds_per_1000'),
    treatmentType: textField('treatmentType', 'Treatment Type', 'Treatment_Type'),
    averageTreatmentCost: numberField('averageTreatmentCost', 'Average Treatment Cost (USD)', 'Average_Treatment_Cost_(USD)'),
    vaccineAvailability: textField('vaccineAvailability', 'Availability of Vaccines/Treatment', 'Availability_of_Vaccines/Treatment'),
    recoveryRate: numberField('recoveryRate', 'Recovery Rate (%)', 'Recovery_Rate_(%)'),
    dalys: numberField('dalys', 'DALYs'),
    improvementIn5Years: numberField('improvementIn5Years', 'Improvement in 5 Years (%)', 'Improvement_in_5_Years_(%)'),
    perCapitaIncome: numberField('perCapitaIncome', 'Per Capita Income (USD)', 'Per_Capita_Income_(USD)'),
    educationIndex: numberField('educationIndex', 'Education Index', 'Education_Index'),
    urbanizationRate: numberField('urbanizationRate', 'Urbanization Rate (%)', 'Urbanization_Rate_(%)'),
  },
};

const indexedNormalizedFields = new Set([
  'country',
  'year',
  'diseaseName',
  'gender',
  'ageGroup',
]);

const canApplyMatchBeforeNormalization = (stage) => (
  stage?.$match
  && Object.keys(stage.$match).every((field) => indexedNormalizedFields.has(field))
);

export const withNormalizedHealthStatFields = (...pipeline) => [
  ...(canApplyMatchBeforeNormalization(pipeline[0]) ? [pipeline[0], normalizeHealthStatFieldsStage, ...pipeline.slice(1)] : [normalizeHealthStatFieldsStage, ...pipeline]),
];
