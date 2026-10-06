/**
 * SPARSH — Verified Government Support & Services Catalogue
 *
 * IMPORTANT RULES:
 * 1. Curated ONLY from verified official government sources (depwd.gov.in, swavlambancard.gov.in,
 *    nhm.gov.in, depwd.maharashtra.gov.in, thenationaltrust.gov.in, samagra.education.gov.in).
 * 2. NO medical diagnosis — offers navigational support based on functional/physical observations.
 * 3. NO automatic eligibility guarantees — all schemes explicitly state that eligibility
 *    depends on official clinical assessment by competent government authorities.
 * 4. Last verified: October 2026.
 */

export const SUPPORT_CATEGORIES = [
  {
    id: 'health',
    icon: 'hospital',
    emoji: '🏥',
    title: 'Health & Early Intervention',
    tagline: 'Access early identification, health screening, and clinical evaluation pathways.',
    filterKey: 'health'
  },
  {
    id: 'disability',
    icon: 'shield',
    emoji: '♿',
    title: 'Disability Assessment & UDID',
    tagline: 'Learn about disability certification and the Unique Disability ID process.',
    filterKey: 'disability'
  },
  {
    id: 'assistive_devices',
    icon: 'sparkles',
    emoji: '🦾',
    title: 'Assistive Devices & Rehabilitation',
    tagline: 'Explore assistive aids, appliances, prosthetics, and therapy support.',
    filterKey: 'assistive_devices'
  },
  {
    id: 'education',
    icon: 'report',
    emoji: '🎓',
    title: 'Education Support',
    tagline: 'Support inclusive early education, specialized learning aids, and school readiness.',
    filterKey: 'education'
  },
  {
    id: 'financial',
    icon: 'leaf',
    emoji: '💰',
    title: 'Financial / Welfare Support',
    tagline: 'Information on state pensions, welfare programs, and family support provisions.',
    filterKey: 'financial'
  },
  {
    id: 'local_support',
    icon: 'landmark',
    emoji: '🏛️',
    title: 'District & Local Support',
    tagline: 'Find district rehabilitation centers (DDRC) and local social welfare offices.',
    filterKey: 'local_support'
  }
]

export const CONCERN_OPTIONS = [
  {
    id: 'physical',
    label: 'Physical / Mobility',
    description: 'Differences in limb mobility, walking, balance, or body movement'
  },
  {
    id: 'limb_difference',
    label: 'Hand / Limb Difference',
    description: 'Shortened, missing, or unusually developed fingers, hands, arms, or legs'
  },
  {
    id: 'hearing',
    label: 'Hearing',
    description: 'Reduced auditory response, lack of startle to loud sound, or speech delays'
  },
  {
    id: 'vision',
    label: 'Vision',
    description: 'Difficulty focusing, tracking objects, squint, or severe visual limitations'
  },
  {
    id: 'speech',
    label: 'Speech / Communication',
    description: 'Delayed speech production, difficulty understanding words, or non-verbal patterns'
  },
  {
    id: 'developmental_delay',
    label: 'Developmental Delay',
    description: 'Multiple missed developmental milestones compared to expected age band'
  },
  {
    id: 'learning',
    label: 'Learning / Education',
    description: 'Difficulties with early cognitive tasks, understanding, or school readiness'
  },
  {
    id: 'multiple',
    label: 'Multiple Concerns',
    description: 'Combination of physical, sensory, or developmental differences'
  },
  {
    id: 'other',
    label: 'Other Observation',
    description: 'Other observations requiring government health or social welfare orientation'
  }
]

export const HELP_TYPES = [
  { id: 'assessment', label: 'Assessment / Certification', description: 'Official medical evaluation and disability certificate / UDID' },
  { id: 'rehabilitation', label: 'Rehabilitation & Therapy', description: 'Physiotherapy, speech therapy, and clinical early intervention' },
  { id: 'assistive_device', label: 'Assistive Device / Aid', description: 'Prostheses, orthoses, hearing aids, wheelchairs, or adaptive kits' },
  { id: 'education', label: 'Education Support', description: 'Inclusive pre-school readiness, specialized teaching aids, and learning support' },
  { id: 'financial', label: 'Financial / Welfare Support', description: 'State welfare pensions, allowances, and social security programs' },
  { id: 'local_support', label: 'Local Government Support', description: 'Connecting with District Disability Rehabilitation Centre or Zilla Parishad' }
]

export const GOVERNMENT_SCHEMES = [
  {
    id: 'udid',
    name: 'Unique Disability ID (UDID) & Disability Certificate',
    shortName: 'UDID',
    badge: 'Government of India',
    badgeTone: 'info',
    category: 'disability',
    level: 'National (All States & UTs)',
    department: 'Department of Empowerment of Persons with Disabilities (DEPwD), Ministry of Social Justice & Empowerment',
    officialUrl: 'https://swavlambancard.gov.in/',
    sourceName: 'swavlambancard.gov.in',
    lastVerified: 'October 2026',
    description:
      'The Unique Disability ID (UDID) system is the national single-document portal for disability assessment, certification, and tracking of benefits across India.',
    relevance:
      'Essential for any child or individual whose physical or functional difference is medically determined as a disability. A UDID card unlocks state and national welfare schemes, concessions, and assistive aid eligibility.',
    whoItHelps:
      'Children and individuals with verified locomotor, visual, hearing, speech, intellectual, or developmental conditions requiring recognized national certification.',
    eligibilitySummary:
      'Eligibility and percentage of disability (if applicable) are determined exclusively by a competent government medical authority or District Medical Board. Observation of a physical difference alone does not guarantee a certificate.',
    documentation: [
      'Recent color passport-sized photograph of the child',
      'Proof of identity of the child/guardian (Aadhaar, Birth Certificate, or Ration card)',
      'Proof of address (Aadhaar, Ration card, or Electricity bill)',
      'Clinical history or hospital examination slips (if available)'
    ],
    nextSteps: [
      'Apply online on the official portal (swavlambancard.gov.in) or visit your nearest District Civil Hospital / CSC center.',
      'Attend the designated medical board assessment session at the District Civil Hospital.',
      'The competent medical board examines the child and assigns certified disability status.',
      'Download the digital certificate or wait for the physical card via post.'
    ],
    applicableConcerns: ['physical', 'limb_difference', 'hearing', 'vision', 'speech', 'developmental_delay', 'multiple', 'other'],
    applicableHelpTypes: ['assessment', 'rehabilitation', 'local_support']
  },
  {
    id: 'adip',
    name: 'ADIP Scheme (Assistance for Purchase/Fitting of Aids and Appliances)',
    shortName: 'ADIP Scheme',
    badge: 'Government of India',
    badgeTone: 'teal',
    category: 'assistive_devices',
    level: 'National (Implemented via ALIMCO & District Camps)',
    department: 'Department of Empowerment of Persons with Disabilities (DEPwD), Ministry of Social Justice & Empowerment',
    officialUrl: 'https://depwd.gov.in/en/adip-scheme/',
    sourceName: 'depwd.gov.in',
    lastVerified: 'October 2026',
    description:
      'Central government flagship scheme assisting eligible persons with disabilities in obtaining durable, sophisticated, and scientifically manufactured assistive aids and appliances to promote physical, social, and psychological rehabilitation.',
    relevance:
      'Directly relevant when a child has an assessed physical, limb, or sensory difference requiring external equipment (such as artificial limbs, calipers, special seating, or hearing aids).',
    whoItHelps:
      'Children and individuals with locomotor differences, limb deficiencies, amputations, hearing impairments, or visual impairments who need assistive devices to improve independence.',
    eligibilitySummary:
      'Eligibility depends on official verification: (1) Holds a valid Disability Certificate or UDID (generally 40% or more); (2) Family monthly income within the prescribed government limit (full or partial subsidy); (3) Has not received the same aid from government/charitable sources within the specified prior period (usually 3 years; 1 year for children below 12). Assessment is conducted by authorized technical teams.',
    documentation: [
      'Valid Disability Certificate / UDID card',
      'Income Certificate of parents/guardians from Revenue Authority / Tehsildar',
      'Aadhaar card or proof of identity and residence',
      'Passport-size photograph displaying the functional/physical difference',
      'Prescription or measurement docket from an authorized medical or prosthetic expert'
    ],
    nextSteps: [
      'Locate the nearest ALIMCO camp or District Disability Rehabilitation Centre (DDRC).',
      'Submit the child’s UDID and parents’ income certificate for initial eligibility screening.',
      'Participate in the measurement and clinical trial camp.',
      'Receive approved fitment and training on device usage and maintenance.'
    ],
    applicableConcerns: ['physical', 'limb_difference', 'hearing', 'vision', 'multiple'],
    applicableHelpTypes: ['assistive_device', 'rehabilitation']
  },
  {
    id: 'rbsk',
    name: 'Rashtriya Bal Swasthya Karyakram (RBSK) & DEIC',
    shortName: 'RBSK / DEIC',
    badge: 'Government of India',
    badgeTone: 'info',
    category: 'health',
    level: 'National & State Health Mission (NHM)',
    department: 'Ministry of Health & Family Welfare, Govt. of India / National Health Mission',
    officialUrl: 'https://nhm.gov.in/',
    sourceName: 'nhm.gov.in',
    lastVerified: 'October 2026',
    description:
      'Comprehensive child health screening and early intervention initiative covering children from birth to 18 years for 4Ds: Defects at birth, Deficiencies, Diseases, and Developmental delays including disabilities.',
    relevance:
      'Ideal initial clinical gateway for Anganwadi workers. If any unusual physical feature, birth defect, or motor delay is noticed, the RBSK mobile health team and District Early Intervention Centre (DEIC) provide multi-disciplinary evaluation and free therapeutic support.',
    whoItHelps:
      'All children from birth to 6 years registered at Anganwadi centres and children 6 to 18 years in government/aided schools.',
    eligibilitySummary:
      'Universal screening and referral. No pre-existing disability certificate is required to receive initial health screening, DEIC assessment, diagnostic evaluations, and medical intervention.',
    documentation: [
      'Child Anganwadi registration / MCP (Mother-Child Protection) Card',
      'Date of birth proof or Anganwadi record',
      'Any prior medical slips or growth chart records'
    ],
    nextSteps: [
      'Note the observation in the Anganwadi health register or triage record.',
      'Present the child to the visiting RBSK Mobile Health Team during scheduled Anganwadi visits.',
      'Obtain an official referral to the District Early Intervention Centre (DEIC) at the District Civil Hospital.',
      'Access free pediatrician, physiotherapist, speech therapist, and developmental specialist assessments.'
    ],
    applicableConcerns: ['physical', 'limb_difference', 'hearing', 'vision', 'speech', 'developmental_delay', 'learning', 'multiple', 'other'],
    applicableHelpTypes: ['assessment', 'rehabilitation', 'local_support']
  },
  {
    id: 'ddrc',
    name: 'District Disability Rehabilitation Centre (DDRC)',
    shortName: 'DDRC',
    badge: 'District Administration',
    badgeTone: 'neutral',
    category: 'local_support',
    level: 'District Level (Across Maharashtra & India)',
    department: 'Joint Initiative of DEPwD, District Administration, and Red Cross / Approved Implementing Agency',
    officialUrl: 'https://depwd.gov.in/',
    sourceName: 'depwd.gov.in',
    lastVerified: 'October 2026',
    description:
      'District-level rehabilitation center established to deliver comprehensive rehabilitation services, early detection, assistive device fitment, clinical therapy, and scheme facilitation directly at the district level.',
    relevance:
      'Brings specialized rehabilitation (physiotherapy, speech therapy, prosthetics, and orthotics) closer to frontline Anganwadi communities without requiring travel to large metropolitan centers.',
    whoItHelps:
      'Children and families seeking local assessment, ongoing therapy, counseling, and guidance on applicable government disability schemes.',
    eligibilitySummary:
      'Services are open to district residents with suspected or confirmed developmental, physical, or sensory concerns. Device provision and fee concessions follow government criteria.',
    documentation: [
      'District residence proof (Aadhaar, Ration card)',
      'Child identification / birth record',
      'Anganwadi or PHC referral note (if available)',
      'UDID or disability certificate (if already issued)'
    ],
    nextSteps: [
      'Inquire at the District Social Welfare Office (Zilla Parishad) or District Civil Hospital for the active DDRC in your district.',
      'Visit the DDRC rehabilitation wing for initial physical or functional evaluation.',
      'Follow recommended therapy schedules (physiotherapy, speech, or prosthetic measurement).'
    ],
    applicableConcerns: ['physical', 'limb_difference', 'hearing', 'vision', 'speech', 'developmental_delay', 'multiple'],
    applicableHelpTypes: ['rehabilitation', 'assistive_device', 'local_support', 'assessment']
  },
  {
    id: 'mh_depwd',
    name: 'Department of Empowerment of Persons with Disabilities, Maharashtra (दिव्यांग कल्याण विभाग)',
    shortName: 'Maha Divyang Kalyan',
    badge: 'Government of Maharashtra',
    badgeTone: 'terracotta',
    category: 'local_support',
    level: 'Maharashtra State',
    department: 'Department of Empowerment of Persons with Disabilities, Government of Maharashtra',
    officialUrl: 'https://depwd.maharashtra.gov.in/',
    sourceName: 'depwd.maharashtra.gov.in',
    lastVerified: 'October 2026',
    description:
      'Maharashtra’s dedicated state ministry for the welfare of persons with disabilities, coordinating state-specific assistive device camps, education stipends, barrier-free access, and social security programs across all 36 districts.',
    relevance:
      'Authoritative state platform for Maharashtra-specific schemes, local welfare offices (District Social Welfare Officer / Zilla Parishad), and grievance redressal.',
    whoItHelps:
      'Residents of Maharashtra with certified disabilities and their families seeking state-level social welfare, educational assistance, and rehabilitation benefits.',
    eligibilitySummary:
      'Requires Maharashtra domicile / residence proof and certified disability (UDID or Civil Surgeon certificate). Specific scheme requirements (such as family income limits) apply per state notification.',
    documentation: [
      'Maharashtra Domicile / Residence Proof (Ration card / Electricity bill)',
      'UDID Card / Disability Certificate issued by Competent Medical Authority',
      'Income Certificate issued by Revenue Authority (Tehsildar)',
      'Active bank account linked with Aadhaar'
    ],
    nextSteps: [
      'Visit the official department portal at depwd.maharashtra.gov.in.',
      'Contact the District Social Welfare Officer (जिल्हा समाज कल्याण अधिकारी) at your district Zilla Parishad.',
      'Inquire about scheduled district assistive device camps and state disability welfare grants.'
    ],
    applicableConcerns: ['physical', 'limb_difference', 'hearing', 'vision', 'speech', 'developmental_delay', 'learning', 'multiple', 'other'],
    applicableHelpTypes: ['local_support', 'financial', 'education', 'rehabilitation']
  },
  {
    id: 'mh_sanjay_gandhi',
    name: 'Sanjay Gandhi Niradhar Anudan Yojana (Divyang Component)',
    shortName: 'Sanjay Gandhi Niradhar',
    badge: 'Government of Maharashtra',
    badgeTone: 'terracotta',
    category: 'financial',
    level: 'Maharashtra State',
    department: 'Social Justice & Special Assistance / Revenue Department, Government of Maharashtra',
    officialUrl: 'https://sjsa.maharashtra.gov.in/',
    sourceName: 'sjsa.maharashtra.gov.in',
    lastVerified: 'October 2026',
    description:
      'Monthly state welfare allowance provided by the Government of Maharashtra to eligible destitute persons with severe disabilities, single mothers, and vulnerable families.',
    relevance:
      'Helps alleviate acute financial burden for low-income families in Maharashtra caring for children with significant certified disabilities.',
    whoItHelps:
      'Low-income and destitute families in Maharashtra supporting individuals with certified severe disabilities who lack independent financial support.',
    eligibilitySummary:
      'Criteria include: (1) Minimum 15 years domicile/residence in Maharashtra; (2) Certified disability (usually 40% or more as determined by competent medical authority); (3) Family annual income within the prescribed poverty/destitution ceiling. Sanctioned through the Taluka/Tehsil committee.',
    documentation: [
      'Maharashtra 15-year Domicile or Residence Proof',
      'Valid Disability Certificate or UDID card',
      'Annual Income Certificate issued by the Tehsildar',
      'Bank passbook photocopy (linked to Aadhaar)'
    ],
    nextSteps: [
      'Collect the prescribed application form from the local Tehsil Office (तहसील कार्यालय) or Setu Suvidha Kendra.',
      'Submit the completed dossier with UDID and Tehsildar income certificate.',
      'Application is placed before the Taluka Sanjay Gandhi Yojana Committee for sanction.'
    ],
    applicableConcerns: ['physical', 'limb_difference', 'hearing', 'vision', 'developmental_delay', 'multiple', 'other'],
    applicableHelpTypes: ['financial']
  },
  {
    id: 'samagra_shiksha',
    name: 'Samagra Shiksha (Inclusive Education for Children with Special Needs - CwSN)',
    shortName: 'Samagra Shiksha CwSN',
    badge: 'Government of India',
    badgeTone: 'info',
    category: 'education',
    level: 'National & Maharashtra State Education Department',
    department: 'Department of School Education & Literacy, MoE / Maharashtra Prathmik Shikshan Parishad',
    officialUrl: 'https://samagra.education.gov.in/',
    sourceName: 'samagra.education.gov.in',
    lastVerified: 'October 2026',
    description:
      'Universal government education mission ensuring inclusive education, assistive learning aids, resource teacher support, transport allowances, and barrier-free access for children with disabilities from preschool to senior secondary.',
    relevance:
      'Crucial for Anganwadi workers supporting children transitioning from Anganwadi pre-school to primary school who need classroom accommodations or learning aids.',
    whoItHelps:
      'Children with special needs attending or enrolling in recognized Anganwadi pre-schools and government or local authority schools.',
    eligibilitySummary:
      'Available to all enrolled children with special needs. Supports are tailored based on individual assessment by Block Resource Persons (Special Educators).',
    documentation: [
      'Anganwadi / School enrollment record',
      'UDID card or disability assessment slip (if available)',
      'Aadhaar card'
    ],
    nextSteps: [
      'Connect with the Block Resource Centre (BRC) or Cluster Resource Centre (CRC) Special Educator.',
      'Participate in the block-level assessment camp for educational and assistive aids.',
      'Inquire about transport/escort allowance and individualized learning support.'
    ],
    applicableConcerns: ['learning', 'developmental_delay', 'physical', 'hearing', 'vision', 'speech', 'multiple'],
    applicableHelpTypes: ['education', 'assistive_device']
  },
  {
    id: 'niramaya',
    name: 'Niramaya Health Insurance Scheme (The National Trust)',
    shortName: 'Niramaya Scheme',
    badge: 'Government of India',
    badgeTone: 'teal',
    category: 'health',
    level: 'National (Statutory Body)',
    department: 'The National Trust for the Welfare of Persons with Autism, Cerebral Palsy, Mental Retardation and Multiple Disabilities, MoSJE',
    officialUrl: 'https://thenationaltrust.gov.in/',
    sourceName: 'thenationaltrust.gov.in',
    lastVerified: 'October 2026',
    description:
      'Affordable health insurance cover providing up to ₹1,00,000 for medical treatment, surgical intervention, OPD therapies, and dental care for persons covered under the National Trust Act.',
    relevance:
      'Valuable financial buffer for ongoing therapy and medical costs for children medically diagnosed with cerebral palsy, autism, intellectual disability, or multiple disabilities.',
    whoItHelps:
      'Children and individuals medically diagnosed with Autism, Cerebral Palsy, Intellectual Disability, or Multiple Disabilities.',
    eligibilitySummary:
      'Limited to the four statutory conditions under The National Trust Act. Requires a valid disability certificate. Annual premium is completely free for BPL families and nominal for others.',
    documentation: [
      'Disability Certificate / UDID specifying Autism, CP, Intellectual Disability, or Multiple Disabilities',
      'BPL Card or certified income certificate',
      'Aadhaar card of child and parent/legal guardian',
      'Bank account details for reimbursement'
    ],
    nextSteps: [
      'Locate a Registered Organization (RO) of the National Trust or the Local Level Committee (LLC) at your District Collectorate.',
      'Apply online on thenationaltrust.gov.in with the RO’s guidance.',
      'Receive the Niramaya Health Insurance card and file claims for approved medical expenses.'
    ],
    applicableConcerns: ['developmental_delay', 'speech', 'multiple', 'learning'],
    applicableHelpTypes: ['health', 'financial', 'rehabilitation']
  }
]

export const MAHARASHTRA_DISTRICTS = [
  { id: 'ahmednagar', name: 'Ahmednagar (अहिल्यानगर)' },
  { id: 'akola', name: 'Akola (अकोला)' },
  { id: 'amravati', name: 'Amravati (अमरावती)' },
  { id: 'aurangabad', name: 'Chhatrapati Sambhajinagar (छत्रपती संभाजीनगर)' },
  { id: 'beed', name: 'Beed (बीड)' },
  { id: 'bhandara', name: 'Bhandara (भंडारा)' },
  { id: 'buldhana', name: 'Buldhana (बुलढाणा)' },
  { id: 'chandrapur', name: 'Chandrapur (चंद्रपूर)' },
  { id: 'dhule', name: 'Dhule (धुळे)' },
  { id: 'gadchiroli', name: 'Gadchiroli (गडचिरोली)' },
  { id: 'gondia', name: 'Gondia (गोंदिया)' },
  { id: 'hingoli', name: 'Hingoli (हिंगोली)' },
  { id: 'jalgaon', name: 'Jalgaon (जळगाव)' },
  { id: 'jalna', name: 'Jalna (जालना)' },
  { id: 'kolhapur', name: 'Kolhapur (कोल्हापूर)' },
  { id: 'latur', name: 'Latur (लातूर)' },
  { id: 'mumbai_city', name: 'Mumbai City (मुंबई शहर)' },
  { id: 'mumbai_suburban', name: 'Mumbai Suburban (मुंबई उपनगर)' },
  { id: 'nagpur', name: 'Nagpur (नागपूर)' },
  { id: 'nanded', name: 'Nanded (नांदेड)' },
  { id: 'nandurbar', name: 'Nandurbar (नंदुरबार)' },
  { id: 'nashik', name: 'Nashik (नाशिक)' },
  { id: 'osmanabad', name: 'Dharashiv (धाराशिव)' },
  { id: 'palghar', name: 'Palghar (पालघर)' },
  { id: 'parbhani', name: 'Parbhani (परभणी)' },
  { id: 'pune', name: 'Pune (पुणे)' },
  { id: 'raigad', name: 'Raigad (रायगड)' },
  { id: 'ratnagiri', name: 'Ratnagiri (रत्नागिरी)' },
  { id: 'sangli', name: 'Sangli (सांगली)' },
  { id: 'satara', name: 'Satara (सातारा)' },
  { id: 'sindhudurg', name: 'Sindhudurg (सिंधुदुर्ग)' },
  { id: 'solapur', name: 'Solapur (सोलापूर)' },
  { id: 'thane', name: 'Thane (ठाणे)' },
  { id: 'wardha', name: 'Wardha (वर्धा)' },
  { id: 'washim', name: 'Washim (वाशीम)' },
  { id: 'yavatmal', name: 'Yavatmal (यवतमाळ)' }
]

export const ACTION_STEPS_PHYSICAL_CONCERN = [
  {
    step: 1,
    title: 'Record the observation neutrally',
    desc: 'Document the specific physical observation (e.g. difference in finger length, limb mobility, or gait) without assigning medical diagnoses, syndrome labels, or disease terms.'
  },
  {
    step: 2,
    title: 'Discuss with parent / guardian respectfully',
    desc: 'Share what was noticed in a supportive, non-alarming manner. Ask if the family has already consulted a doctor or holds any hospital records.'
  },
  {
    step: 3,
    title: 'Connect to government clinical assessment',
    desc: 'Guide the family to the nearest Primary Health Centre (PHC), visiting RBSK Mobile Health Team, or District Early Intervention Centre (DEIC) at the District Hospital for pediatric evaluation.'
  },
  {
    step: 4,
    title: 'Inquire about UDID / Disability Certification',
    desc: 'If a functional or anatomical disability is medically verified by the government medical board, guide the family to apply for a Unique Disability ID on swavlambancard.gov.in.'
  },
  {
    step: 5,
    title: 'Explore assistive-device and therapy support',
    desc: 'Check if the child is a candidate for assistive aids (such as prosthetics, orthotics, or adaptive utensils) under the ADIP scheme or local DDRC rehabilitation programs.'
  },
  {
    step: 6,
    title: 'Maintain Anganwadi follow-up record',
    desc: 'Log the guidance given in the Anganwadi register or SPARSH record to track whether the child attended clinical assessment and received required support.'
  }
]
