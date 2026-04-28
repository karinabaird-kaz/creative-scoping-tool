export interface DisciplineHours {
  low: number;
  high: number;
}

export interface PaginationPage {
  text: string;
  isHeader: boolean;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  clientService: DisciplineHours;
  strategy: DisciplineHours;
  design: DisciplineHours;
  copywriter: DisciplineHours;
  pagination?: PaginationPage[];
  fixedFee?: number;
  addon?: boolean;
  bespoke?: boolean;
}

export interface Phase {
  id: string;
  title: string;
  objective: string;
  deliverables: Deliverable[];
}

export interface Package {
  id: string;
  label: string;
  name: string;
  subtitle?: string;
  phases: string;
  phaseGroup: 'strategy' | 'creative' | 'campaign';
  narrative: string;
  calculatorNote?: string;
  data: Phase[];
}

const discoveryPhaseGold: Phase = {
  id: 'discovery',
  title: '1 - Discovery',
  objective:
    'Objective: Gather insights to inform brand strategy and creative development. Including (but not limited to):',
  deliverables: [
    {
      id: 'brand-immersion',
      name: 'Brand Immersion Kick Off',
      description:
        'Collaborative kick-off session to fully immerse into the brand and product and align on objective. Opportunity for key stakeholder to share any relevant documentation or existing research for Jaywing\'s review.',
      clientService: { low: 2, high: 4 },
      strategy: { low: 4, high: 10 },
      design: { low: 2, high: 4 },
      copywriter: { low: 1, high: 3 },
    },
    {
      id: 'competitor-market-review',
      name: 'Competitor / Market Review',
      description:
        'Analyse competitors, category trends and macro trends.',
      clientService: { low: 0, high: 2 },
      strategy: { low: 6, high: 10 },
      design: { low: 0, high: 0 },
      copywriter: { low: 1, high: 2 },
    },
    {
      id: 'stakeholder-interviews',
      name: 'Stakeholder Interviews',
      description:
        'Personalised round of X internal stakeholder interviewers to gain insight on sector, current brand and competitor perceptions, brand positioning needs and expectations.',
      clientService: { low: 1, high: 4 },
      strategy: { low: 5, high: 12 },
      design: { low: 0, high: 0 },
      copywriter: { low: 1, high: 2 },
    },
    {
      id: 'qual-research',
      name: 'Qual Research - Customer',
      description:
        'Conduct either face to face or online focus groups or interviews to better understand target audiences attitudes and behaviours. Price depends on methodology and number of participants, incentives etc.',
      clientService: { low: 0, high: 0 },
      strategy: { low: 0, high: 0 },
      design: { low: 0, high: 0 },
      copywriter: { low: 0, high: 0 },
      fixedFee: 0,
      addon: true,
    },
    {
      id: 'quant-research',
      name: 'Quant Research - Customer',
      description:
        'Bespoke survey to existing and new customers, using one of our preferred platforms (Focal Data or Lysnna etc.). Price depends on sample size and customer incidence rate of target consumer/audience.',
      clientService: { low: 0, high: 0 },
      strategy: { low: 0, high: 0 },
      design: { low: 0, high: 0 },
      copywriter: { low: 0, high: 0 },
      fixedFee: 0,
      addon: true,
    },
    {
      id: 'brand-audit',
      name: 'Brand Audit',
      description:
        'Review existing brand assets, messaging and any existing data / research.',
      clientService: { low: 2, high: 4 },
      strategy: { low: 10, high: 18 },
      design: { low: 8, high: 14 },
      copywriter: { low: 2, high: 3 },
    },
  ],
};

const positioningPhaseGold: Phase = {
  id: 'positioning',
  title: '2 - Positioning',
  objective:
    'Objective: Define the brand foundation and strategic direction. Including (but not limited to):',
  deliverables: [
    {
      id: 'brand-workshop',
      name: 'Brand Workshop',
      description:
        'Co-create strategy concepts with key stakeholders. Can be 2 or 4 hours depending on scope/complexity/attendees.',
      clientService: { low: 2, high: 4 },
      strategy: { low: 8, high: 14 },
      design: { low: 2, high: 4 },
      copywriter: { low: 1, high: 4 },
    },
    {
      id: 'brand-positioning',
      name: 'Brand Positioning',
      description:
        'Articulation of the perception we want to drive with customer to inform creative development.',
      clientService: { low: 2, high: 4 },
      strategy: { low: 12, high: 20 },
      design: { low: 0, high: 4 },
      copywriter: { low: 4, high: 7 },
    },
    {
      id: 'customer-value-proposition',
      name: 'Customer Value Proposition',
      description:
        'Define what the brand stands for, who it serves, and how it\'s different.',
      clientService: { low: 1, high: 3 },
      strategy: { low: 10, high: 18 },
      design: { low: 0, high: 3 },
      copywriter: { low: 7, high: 10 },
      addon: true,
    },
    {
      id: 'brand-house-framework',
      name: 'Brand House / Framework',
      description:
        'Articulate the brand on a page.',
      clientService: { low: 1, high: 3 },
      strategy: { low: 1, high: 20 },
      design: { low: 0, high: 12 },
      copywriter: { low: 0, high: 9 },
      addon: true,
    },
    {
      id: 'internal-brand-positioning',
      name: 'Internal Brand Positioning',
      description:
        'Vision, Mission, Values, Personality.',
      clientService: { low: 1, high: 3 },
      strategy: { low: 4, high: 18 },
      design: { low: 0, high: 12 },
      copywriter: { low: 1, high: 11 },
      addon: true,
    },
  ],
};

const bronzeDiscoveryPhase: Phase = {
  id: 'discovery',
  title: '1 - Discovery',
  objective:
    'Objective: Gather insights to inform brand strategy and creative development. Including (but not limited to):',
  deliverables: [
    {
      id: 'brand-immersion',
      name: 'Brand Immersion Kick Off',
      description:
        'Collaborative kick-off session to fully immerse into the brand and product and align on objective. Opportunity for key stakeholder to share any relevant documentation or existing research for Jaywing\'s review.',
      clientService: { low: 2, high: 4 },
      strategy: { low: 4, high: 10 },
      design: { low: 2, high: 4 },
      copywriter: { low: 1, high: 3 },
    },
    {
      id: 'competitor-market-review',
      name: 'Competitor / Market Review',
      description:
        'Analyse competitors, category trends and macro trends.',
      clientService: { low: 0, high: 2 },
      strategy: { low: 6, high: 10 },
      design: { low: 0, high: 0 },
      copywriter: { low: 1, high: 2 },
    },
    {
      id: 'stakeholder-interviews',
      name: 'Stakeholder Interviews',
      description:
        'Personalised round of X internal stakeholder interviewers to gain insight on sector, current brand and competitor perceptions, brand positioning needs and expectations.',
      clientService: { low: 1, high: 4 },
      strategy: { low: 5, high: 12 },
      design: { low: 0, high: 0 },
      copywriter: { low: 1, high: 2 },
    },
    {
      id: 'brand-audit',
      name: 'Brand Audit',
      description:
        'Review existing brand assets, messaging and any existing data / research.',
      clientService: { low: 2, high: 4 },
      strategy: { low: 10, high: 18 },
      design: { low: 8, high: 14 },
      copywriter: { low: 2, high: 3 },
    },
  ],
};

const bronzePositioningPhase: Phase = {
  id: 'positioning',
  title: '2 - Positioning',
  objective:
    'Objective: Define the brand foundation and strategic direction. Including (but not limited to):',
  deliverables: [
    {
      id: 'brand-workshop',
      name: 'Brand Workshop',
      description:
        'Co-create strategy concepts with key stakeholders. Can be 2 or 4 hours depending on scope/complexity/attendees.',
      clientService: { low: 2, high: 4 },
      strategy: { low: 8, high: 14 },
      design: { low: 2, high: 4 },
      copywriter: { low: 1, high: 4 },
    },
    {
      id: 'brand-positioning',
      name: 'Brand Positioning',
      description:
        'Articulation of the perception we want to drive with customer to inform creative development.',
      clientService: { low: 2, high: 4 },
      strategy: { low: 12, high: 20 },
      design: { low: 0, high: 4 },
      copywriter: { low: 4, high: 7 },
    },
  ],
};

const identityDeliverables = [
  {
    id: 'creative-brief',
    name: 'Creative Brief Development',
    description:
      'A detailed creative brief that captures strategic intent, audience insights and directional territories to guide the design team.',
    clientService: { low: 1, high: 2 },
    strategy: { low: 0, high: 1 },
    design: { low: 0, high: 0 },
    copywriter: { low: 0, high: 0 },
  },
  {
    id: 'design-development',
    name: 'Design Development',
    description:
      'Exploration and refinement of visual identity concepts including logo, colour, typography and supporting graphic elements.',
    clientService: { low: 1, high: 2 },
    strategy: { low: 0, high: 2 },
    design: { low: 6, high: 22 },
    copywriter: { low: 0, high: 1 },
  },
  {
    id: 'brand-guidelines',
    name: 'Brand Guidelines',
    description:
      'A comprehensive document defining how to apply the visual identity consistently across all brand touchpoints.',
    clientService: { low: 1, high: 2 },
    strategy: { low: 0, high: 1 },
    design: { low: 7, high: 14 },
    copywriter: { low: 1, high: 2 },
    pagination: [
      { text: 'Cover', isHeader: false },
      { text: 'Our Brand', isHeader: true },
      { text: 'eg: CVP', isHeader: false },
      { text: 'eg: Brand Positioning', isHeader: false },
      { text: 'Visual Identity', isHeader: true },
      { text: 'Logo - Clear space and minimum size', isHeader: false },
      { text: 'Logo - Colour variations and application', isHeader: false },
      { text: 'Colour palette', isHeader: false },
      { text: 'Photography Style', isHeader: false },
    ],
  },
  {
    id: 'application',
    name: 'Application',
    description:
      'Design of key brand applications to demonstrate the identity in context - such as stationery, digital templates or signage.',
    clientService: { low: 1, high: 3 },
    strategy: { low: 0, high: 1 },
    design: { low: 2, high: 8 },
    copywriter: { low: 0, high: 0 },
  },
];

const campaignDiscoveryPhase: Phase = {
  id: 'campaign-discovery',
  title: '1 - Discovery',
  objective:
    'Objective: Gather strategic insights to inform campaign direction. Including (but not limited to):',
  deliverables: [
    {
      id: 'campaign-brand-immersion',
      name: 'Brand Immersion Kick Off',
      description:
        'Collaborative kick-off session to fully immerse into the brand and product and align on objective.',
      clientService: { low: 1, high: 6 },
      strategy: { low: 1, high: 3 },
      design: { low: 1, high: 3 },
      copywriter: { low: 1, high: 3 },
      addon: true,
    },
    {
      id: 'campaign-competitor-review',
      name: 'Competitor and Market Review',
      description:
        'Analyse competitors, category trends and macro trends.',
      clientService: { low: 0, high: 0 },
      strategy: { low: 7, high: 12 },
      design: { low: 0, high: 0 },
      copywriter: { low: 0, high: 0 },
    },
    {
      id: 'campaign-customer-research',
      name: 'Customer Research',
      description:
        'Secondary desk research and/or Primary Qual and/or quant e.g. Conduct surveys or focus groups to understand audience. Dependent on access to customers for research purposes.',
      clientService: { low: 0, high: 0 },
      strategy: { low: 0, high: 0 },
      design: { low: 0, high: 0 },
      copywriter: { low: 0, high: 0 },
    },
    {
      id: 'campaign-customer-research-tp',
      name: 'Customer Research - Third Party Costs',
      description: 'Third party costs associated with customer research e.g. panel recruitment, incentives, platform fees.',
      clientService: { low: 0, high: 0 },
      strategy: { low: 0, high: 0 },
      design: { low: 0, high: 0 },
      copywriter: { low: 0, high: 0 },
      fixedFee: 0,
      addon: true,
    },
  ],
};

const campaignPositioningPhase: Phase = {
  id: 'campaign-positioning',
  title: '2 - Positioning',
  objective:
    'Objective: Define the strategic foundation for the campaign. Including (but not limited to):',
  deliverables: [
    {
      id: 'strategic-insight-proposition',
      name: 'Strategic Insight and Proposition',
      description:
        'Summarise learnings from discovery stage into a unique yet relatable strategic idea that will act as a springboard for creative ideation.',
      clientService: { low: 3, high: 10 },
      strategy: { low: 5, high: 14 },
      design: { low: 0, high: 0 },
      copywriter: { low: 4, high: 10 },
    },
    {
      id: 'campaign-strategy',
      name: 'Campaign Strategy',
      description:
        'Recommendations on how the campaign will play out across different stages of the funnel, media, messaging and targeting.',
      clientService: { low: 3, high: 8 },
      strategy: { low: 5, high: 10 },
      design: { low: 0, high: 0 },
      copywriter: { low: 0, high: 0 },
    },
    {
      id: 'customer-personas',
      name: 'Customer Personas',
      description:
        'Define a target customer persona including motivations and barriers to inform creative development and messaging.',
      clientService: { low: 2, high: 5 },
      strategy: { low: 5, high: 8 },
      design: { low: 0, high: 0 },
      copywriter: { low: 1, high: 4 },
      addon: true,
    },
  ],
};

const campaignIdentityPhase: Phase = {
  id: 'campaign-identity',
  title: '3 - Campaign Identity',
  objective:
    'Objective: Develop the campaign creative and design expression. Including (but not limited to):',
  deliverables: [
    {
      id: 'campaign-creative-brief',
      name: 'Creative Brief Development',
      description:
        'Translate strategy into actionable creative direction brief.',
      clientService: { low: 1, high: 3 },
      strategy: { low: 1, high: 2 },
      design: { low: 0, high: 1 },
      copywriter: { low: 0, high: 0 },
    },
    {
      id: 'campaign-tov',
      name: 'Tone of Voice',
      description:
        'Develop tone of voice (up to 2pp)',
      clientService: { low: 1, high: 3 },
      strategy: { low: 1, high: 2 },
      design: { low: 0, high: 0 },
      copywriter: { low: 7, high: 16 },
      addon: true,
    },
    {
      id: 'ideation-r1',
      name: 'Ideation Round 1',
      description:
        'Up to 3 territories presented as: Mood board, Rationale, 1-2 Executions (includes 2 rounds of refinements)',
      clientService: { low: 4, high: 8 },
      strategy: { low: 1, high: 3 },
      design: { low: 15, high: 38 },
      copywriter: { low: 15, high: 38 },
    },
    {
      id: 'ideation-r2',
      name: 'Ideation Round 2',
      description: '',
      clientService: { low: 3, high: 6 },
      strategy: { low: 1, high: 2 },
      design: { low: 5, high: 15 },
      copywriter: { low: 5, high: 15 },
    },
    {
      id: 'ideation-r3',
      name: 'Ideation Round 3',
      description: '',
      clientService: { low: 3, high: 6 },
      strategy: { low: 1, high: 2 },
      design: { low: 2, high: 10 },
      copywriter: { low: 2, high: 10 },
      addon: true,
    },
    {
      id: 'design-dev-r1',
      name: 'Design Development R1',
      description:
        'Develop design across below deliverables:',
      clientService: { low: 2, high: 5 },
      strategy: { low: 0, high: 0 },
      design: { low: 5, high: 30 },
      copywriter: { low: 5, high: 20 },
    },
    {
      id: 'design-dev-r2',
      name: 'Design Development R2',
      description: '',
      clientService: { low: 2, high: 5 },
      strategy: { low: 0, high: 0 },
      design: { low: 3, high: 20 },
      copywriter: { low: 3, high: 10 },
    },
    {
      id: 'design-dev-r3',
      name: 'Design Development R3',
      description: '',
      clientService: { low: 2, high: 5 },
      strategy: { low: 0, high: 0 },
      design: { low: 3, high: 10 },
      copywriter: { low: 1, high: 5 },
      addon: true,
    },
  ],
};

export const packages: Package[] = [
  {
    id: 'gold',
    label: 'Gold',
    name: 'Brand Development + Internal Positioning',
    phases: 'Phases 1 + 2',
    phaseGroup: 'strategy',
    narrative:
      'From deep discovery through to a fully articulated positioning and internal framework. Ideal for organisations investing in a comprehensive brand foundation.',
    data: [discoveryPhaseGold, positioningPhaseGold],
  },
  {
    id: 'silver',
    label: 'Silver',
    name: 'Brand Positioning + Customer Research',
    phases: 'Phases 1 + 2',
    phaseGroup: 'strategy',
    narrative:
      'Thorough discovery and core positioning. Competitor-informed, stakeholder-validated. Best for brands with cultural alignment that need a sharper external position.',
    data: [
      discoveryPhaseGold,
      {
        id: 'positioning',
        title: '2 - Positioning',
        objective:
          'Objective: Define the brand foundation and strategic direction. Including (but not limited to):',
        deliverables: [
          positioningPhaseGold.deliverables[0],
          positioningPhaseGold.deliverables[1],
          positioningPhaseGold.deliverables[2],
          positioningPhaseGold.deliverables[3],
        ],
      },
    ],
  },
  {
    id: 'bronze',
    label: 'Bronze',
    name: 'Brand Positioning Lite',
    subtitle: 'e.g. brand guidelines development or website projects',
    phases: 'Phases 1 + 2 - Strategy',
    phaseGroup: 'strategy',
    narrative:
      'Market context, stakeholder insight and a clear positioning output. Ideal for businesses that need a defined brand position quickly or as a starting point for a phased programme.',
    data: [bronzeDiscoveryPhase, bronzePositioningPhase],
  },
  {
    id: 'internal-brand',
    label: 'Internal Brand',
    name: 'Internal Brand Strategy',
    subtitle: 'e.g. mission, vision, values',
    phases: 'Phases 1 + 2 - Internal focus',
    phaseGroup: 'strategy',
    narrative:
      'For organisations going through change, growth or realignment. Builds an internal brand that galvanises your people from stakeholder discovery through to a defined values and cultural narrative.',
    data: [
      {
        id: 'discovery',
        title: '1 - Discovery',
        objective:
          'Objective: Understand the current cultural landscape and internal brand perceptions. Including (but not limited to):',
        deliverables: discoveryPhaseGold.deliverables.filter(
          (d) => d.id !== 'qual-research' && d.id !== 'quant-research'
        ),
      },
      {
        id: 'positioning',
        title: '2 - Positioning',
        objective:
          'Objective: Define and document the internal brand. Including (but not limited to):',
        deliverables: [
          positioningPhaseGold.deliverables[0],
          { ...positioningPhaseGold.deliverables[4], addon: false },
        ],
      },
    ],
  },
  {
    id: 'campaign',
    label: 'Campaign',
    name: 'Campaign Development',
    subtitle: 'e.g. campaign strategy and creative ideation',
    phases: 'Phases 1 + 2 + 3',
    phaseGroup: 'campaign',
    narrative:
      'A campaign engagement covering strategic insight, campaign planning and creative ideation through to design development. Scope varies significantly based on research requirements and creative output. All rows are editable.',
    calculatorNote:
      'Customer Research, Ideation and Design Development hours are indicative only and should be scoped to client brief.',
    data: [campaignDiscoveryPhase, campaignPositioningPhase, campaignIdentityPhase],
  },
  {
    id: 'identity-lite',
    label: 'Identity Lite',
    name: 'Identity Lite',
    subtitle: 'e.g. mini brand guidelines for website build',
    phases: 'Phase 3 - Identity (Lite)',
    phaseGroup: 'creative',
    narrative:
      'For brands with strategic direction that need a refined or refreshed visual expression. Covers logo development, a cohesive visual system and a practical set of brand guidelines.',
    data: [
      {
        id: 'identity',
        title: '3 - Identity',
        objective:
          'Objective: Create the visual and verbal expression of the brand. Including (but not limited to):',
        deliverables: identityDeliverables,
      },
    ],
  },
  {
    id: 'identity',
    label: 'Identity',
    name: 'Identity',
    subtitle: 'e.g. brand guidelines',
    phases: 'Phase 3 - Identity',
    phaseGroup: 'creative',
    narrative:
      'A full visual identity engagement - from creative brief through to comprehensive brand guidelines and real-world application across key brand touchpoints.',
    data: [
      {
        id: 'identity',
        title: '3 - Identity',
        objective:
          'Objective: Create the visual and verbal expression of the brand. Including (but not limited to):',
        deliverables: [
          {
            id: 'creative-brief',
            name: 'Creative Brief Development',
            description:
              'A detailed creative brief that captures strategic intent, audience insights and directional territories to guide the design team.',
            clientService: { low: 2, high: 4 },
            strategy: { low: 1, high: 3 },
            design: { low: 0, high: 2 },
            copywriter: { low: 0, high: 1 },
          },
          {
            id: 'design-development',
            name: 'Design Development',
            description:
              'Exploration and refinement of visual identity concepts including logo, colour, typography and supporting graphic elements.',
            clientService: { low: 2, high: 4 },
            strategy: { low: 1, high: 4 },
            design: { low: 14, high: 40 },
            copywriter: { low: 0, high: 2 },
          },
          {
            id: 'brand-guidelines',
            name: 'Brand Guidelines',
            description:
              'A comprehensive document defining how to apply the visual identity consistently across all brand touchpoints.',
            clientService: { low: 2, high: 4 },
            strategy: { low: 1, high: 2 },
            design: { low: 14, high: 28 },
            copywriter: { low: 2, high: 4 },
          },
          {
            id: 'application',
            name: 'Application',
            description:
              'Design of key brand applications to demonstrate the identity in context - such as stationery, digital templates or signage.',
            clientService: { low: 2, high: 4 },
            strategy: { low: 0, high: 2 },
            design: { low: 8, high: 20 },
            copywriter: { low: 0, high: 2 },
          },
        ],
      },
    ],
  },
];

export const DEFAULT_RATE = 220;

export const boltOnIdentityLitePhase: Phase = {
  id: 'identity-lite',
  title: 'Identity',
  objective:
    'Create the visual and verbal expression of the brand. Including (but not limited to):',
  deliverables: identityDeliverables,
};

export const boltOnIdentityFullPhase: Phase = {
  id: 'identity-full',
  title: 'Identity',
  objective:
    'Create the visual and verbal expression of the brand. Including (but not limited to):',
  deliverables: [
    {
      id: 'creative-brief',
      name: 'Creative Brief Development',
      description:
        'A detailed creative brief that captures strategic intent, audience insights and directional territories to guide the design team.',
      clientService: { low: 1, high: 3 },
      strategy: { low: 1, high: 2 },
      design: { low: 0, high: 1 },
      copywriter: { low: 0, high: 0 },
    },
    {
      id: 'tone-of-voice',
      name: 'Tone of Voice',
      description:
        'Development of the brand verbal identity including tone, language style and messaging principles.',
      clientService: { low: 1, high: 3 },
      strategy: { low: 1, high: 2 },
      design: { low: 0, high: 0 },
      copywriter: { low: 7, high: 16 },
    },
    {
      id: 'design-development-r1',
      name: 'Design Development (Round 1)',
      description:
        'Exploration and refinement of visual identity concepts including logo, colour, typography and supporting graphic elements.',
      clientService: { low: 1, high: 3 },
      strategy: { low: 1, high: 2 },
      design: { low: 11, high: 34 },
      copywriter: { low: 0, high: 0 },
    },
    {
      id: 'design-development-r2',
      name: 'Design Development (Round 2)',
      description:
        'Second round of design development incorporating feedback and further refining the visual identity.',
      clientService: { low: 1, high: 3 },
      strategy: { low: 0, high: 0 },
      design: { low: 4, high: 10 },
      copywriter: { low: 0, high: 0 },
    },
    {
      id: 'applications',
      name: 'Applications',
      description:
        'Design of key brand applications to demonstrate the identity in context - such as stationery, digital templates or signage.',
      clientService: { low: 1, high: 3 },
      strategy: { low: 0, high: 0 },
      design: { low: 5, high: 12 },
      copywriter: { low: 0, high: 0 },
    },
    {
      id: 'brand-guidelines-r1',
      name: 'Brand Guidelines (Round 1)',
      description:
        'A comprehensive document defining how to apply the visual identity consistently across all brand touchpoints.',
      clientService: { low: 1, high: 7 },
      strategy: { low: 0, high: 0 },
      design: { low: 20, high: 50 },
      copywriter: { low: 1, high: 2 },
      pagination: [
        { text: 'Cover', isHeader: false },
        { text: 'Our Brand', isHeader: true },
        { text: 'CVP', isHeader: false },
        { text: 'Brand Positioning', isHeader: false },
        { text: 'Definition', isHeader: false },
        { text: 'Tone of Voice', isHeader: true },
        { text: 'Tone of Voice', isHeader: false },
        { text: 'Tone of Voice (continued)', isHeader: false },
        { text: 'Visual Identity', isHeader: true },
        { text: 'Logo', isHeader: false },
        { text: 'Logo - Clear space and minimum size', isHeader: false },
        { text: 'Logo - Colour variations and application', isHeader: false },
        { text: 'Logo - Incorrect use and co-branding', isHeader: false },
        { text: 'Colour palette', isHeader: false },
        { text: 'Photography Style', isHeader: false },
        { text: 'Application', isHeader: true },
        { text: '[Application example]', isHeader: false },
        { text: '[Application example]', isHeader: false },
        { text: '[Application example]', isHeader: false },
        { text: '[Application example]', isHeader: false },
      ],
    },
    {
      id: 'brand-guidelines-r2',
      name: 'Brand Guidelines (Round 2)',
      description:
        'First round of amends to the brand guidelines document based on client feedback.',
      clientService: { low: 1, high: 3 },
      strategy: { low: 0, high: 0 },
      design: { low: 4, high: 12 },
      copywriter: { low: 1, high: 2 },
    },
    {
      id: 'brand-guidelines-r3',
      name: 'Brand Guidelines (Round 3)',
      description:
        'Second round of amends to the brand guidelines document based on client feedback.',
      clientService: { low: 1, high: 3 },
      strategy: { low: 0, high: 0 },
      design: { low: 2, high: 8 },
      copywriter: { low: 0, high: 0 },
    },
  ],
};

export const creativePhaseOptions: Array<{
  id: string;
  label: string;
  subtitle: string;
  phase: Phase;
}> = [
  {
    id: 'identity-lite',
    label: 'Mini Brand Guidelines',
    subtitle: 'Create a usage manual for internal and external teams (up to 9pp).',
    phase: boltOnIdentityLitePhase,
  },
  {
    id: 'identity',
    label: 'Brand Guidelines',
    subtitle: 'Create a usage manual for internal and external teams (up to 20pp).',
    phase: boltOnIdentityFullPhase,
  },
];
