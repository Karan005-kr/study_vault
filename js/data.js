const PROGRAM_CATALOG = [
  { id: 'btech', name: 'Bachelor of Technology', shortName: 'B.Tech', semesters: 8, description: 'Engineering & Technology' },
  { id: 'bba', name: 'Bachelor of Business Administration', shortName: 'BBA', semesters: 6, description: 'Business & Management' },
  { id: 'bca', name: 'Bachelor of Computer Applications', shortName: 'BCA', semesters: 6, description: 'Computer Applications' },
  { id: 'bcom', name: 'Bachelor of Commerce', shortName: 'B.Com', semesters: 6, description: 'Commerce & Finance' },
  { id: 'mba', name: 'Master of Business Administration', shortName: 'MBA', semesters: 4, description: 'Postgraduate Management' },
  { id: 'mca', name: 'Master of Computer Applications', shortName: 'MCA', semesters: 4, description: 'Postgraduate Computer Applications' }
];

const UNIVERSITY_CATALOG = [
  { id:'dcrust', shortName:'DCRUST', name:'Deenbandhu Chhotu Ram University of Science and Technology', location:'Murthal, Haryana' },
  { id:'mdu', shortName:'MDU', name:'Maharshi Dayanand University', location:'Rohtak, Haryana' },
  { id:'kuk', shortName:'KUK', name:'Kurukshetra University', location:'Kurukshetra, Haryana' },
  { id:'gju', shortName:'GJUST', name:'Guru Jambheshwar University of Science and Technology', location:'Hisar, Haryana' },
  { id:'dtu', shortName:'DTU', name:'Delhi Technological University', location:'Delhi' },
  { id:'nsut', shortName:'NSUT', name:'Netaji Subhas University of Technology', location:'Delhi' },
  { id:'ipu', shortName:'GGSIPU', name:'Guru Gobind Singh Indraprastha University', location:'Delhi' },
  { id:'du', shortName:'DU', name:'University of Delhi', location:'Delhi' },
  { id:'cu', shortName:'CU', name:'Chandigarh University', location:'Punjab' },
  { id:'lpu', shortName:'LPU', name:'Lovely Professional University', location:'Punjab' },
  { id:'amity', shortName:'Amity', name:'Amity University', location:'Noida, Uttar Pradesh' },
  { id:'sharda', shortName:'Sharda', name:'Sharda University', location:'Greater Noida, Uttar Pradesh' }
];

const DEFAULT_DATA = {
  universities: UNIVERSITY_CATALOG.map(u => ({
    ...u,
    programs: PROGRAM_CATALOG.map(p => ({...p}))
  })),
  subjects: {
    btech: {
      1: [
        { id:'bt101', name:'Engineering Mathematics-I', code:'BT101' },
        { id:'bt102', name:'Engineering Physics', code:'BT102' },
        { id:'bt103', name:'Basic Electrical Engineering', code:'BT103' },
        { id:'bt104', name:'Programming for Problem Solving', code:'BT104' },
        { id:'bt105', name:'Communication Skills', code:'BT105' }
      ],
      2: [
        { id:'bt201', name:'Engineering Mathematics-II', code:'BT201' },
        { id:'bt202', name:'Engineering Chemistry', code:'BT202' },
        { id:'bt203', name:'Engineering Graphics', code:'BT203' },
        { id:'bt204', name:'Basic Electronics Engineering', code:'BT204' },
        { id:'bt205', name:'Environmental Studies', code:'BT205' }
      ],
      3: [
        { id:'bt301', name:'Data Structures', code:'BT301' },
        { id:'bt302', name:'Object Oriented Programming', code:'BT302' },
        { id:'bt303', name:'Database Management Systems', code:'BT303' },
        { id:'bt304', name:'Computer Organization', code:'BT304' },
        { id:'bt305', name:'Discrete Mathematics', code:'BT305' }
      ],
      4: [
        { id:'bt401', name:'Design and Analysis of Algorithms', code:'BT401' },
        { id:'bt402', name:'Operating Systems', code:'BT402' },
        { id:'bt403', name:'Computer Networks', code:'BT403' },
        { id:'bt404', name:'Software Engineering', code:'BT404' },
        { id:'bt405', name:'Probability and Statistics', code:'BT405' }
      ],
      5: [
        { id:'bt501', name:'Theory of Computation', code:'BT501' },
        { id:'bt502', name:'Web Technologies', code:'BT502' },
        { id:'bt503', name:'Artificial Intelligence', code:'BT503' },
        { id:'bt504', name:'Compiler Design', code:'BT504' },
        { id:'bt505', name:'Professional Elective-I', code:'BT505' }
      ],
      6: [
        { id:'bt601', name:'Machine Learning', code:'BT601' },
        { id:'bt602', name:'Cloud Computing', code:'BT602' },
        { id:'bt603', name:'Information Security', code:'BT603' },
        { id:'bt604', name:'Data Mining', code:'BT604' },
        { id:'bt605', name:'Professional Elective-II', code:'BT605' }
      ],
      7: [
        { id:'bt701', name:'Big Data Analytics', code:'BT701' },
        { id:'bt702', name:'Internet of Things', code:'BT702' },
        { id:'bt703', name:'Open Elective-I', code:'BT703' },
        { id:'bt704', name:'Project-I', code:'BT704' },
        { id:'bt705', name:'Industrial Training', code:'BT705' }
      ],
      8: [
        { id:'bt801', name:'Open Elective-II', code:'BT801' },
        { id:'bt802', name:'Project-II', code:'BT802' },
        { id:'bt803', name:'Seminar', code:'BT803' },
        { id:'bt804', name:'Entrepreneurship Development', code:'BT804' },
        { id:'bt805', name:'Professional Ethics', code:'BT805' }
      ]
    }
  },
  materials: {}
};

function genericSubjects(programId, semester) {
  const prefix = programId.toUpperCase().replace('.', '');
  const names = [
    `Core Subject ${semester}.1`,
    `Core Subject ${semester}.2`,
    `Skill Subject ${semester}.3`,
    `Foundation Subject ${semester}.4`,
    `Elective Subject ${semester}.5`
  ];
  return names.map((name, index) => ({
    id: `${programId}${semester}0${index + 1}`,
    name,
    code: `${prefix}${semester}0${index + 1}`
  }));
}

function buildSeedMaterials(data) {
  PROGRAM_CATALOG.forEach(program => {
    const programId = program.id;
    if (!data.subjects[programId]) data.subjects[programId] = {};
    for (let sem = 1; sem <= program.semesters; sem++) {
      if (!data.subjects[programId][sem]) data.subjects[programId][sem] = genericSubjects(programId, sem);
      data.subjects[programId][sem].forEach(subject => {
        if (!data.materials[subject.id]) {
          const base = `/materials/sample/${programId}/semester-${sem}/${subject.id}`;
          data.materials[subject.id] = [
            { id:`${subject.id}-syllabus`, type:'SYLLABUS', title:`${subject.name} Syllabus`, path:`${base}/syllabus.pdf`, published:true },
            { id:`${subject.id}-notes`, type:'NOTES', title:`${subject.name} Unit 1 Notes`, path:`${base}/unit-1-notes.pdf`, published:true },
            { id:`${subject.id}-pyq`, type:'PYQ', title:`${subject.name} Previous Year Paper 2025`, path:`${base}/pyq-2025.pdf`, published:true }
          ];
        }
      });
    }
  });
  return data;
}
