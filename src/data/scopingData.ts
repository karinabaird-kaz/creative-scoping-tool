export interface DisciplineHours {
  low: number;
  high: number;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  clientService: DisciplineHours;
  strategy: DisciplineHours;
  design: DisciplineHours;
  copywriter: DisciplineHours;
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
  phases: string;
  narrative: string;
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
        'A structured kick-off session to align the team on project goals, timelines and existing brand knowledge. Sets the foundation for all discovery work.',
      clientService: { low: 2, high: 4 },
      strategy: { low: 4, high: 10 },
      design: { low: 2, high: 4 },
      copywriter: { low: 1, high: 3 },
    },
    {
      id: 'competitor-market-review',
      name: 'Competitor / Market Review',
      description:
        'An audit of competitor brands and market positioning to identify whitespace and strategic opportunities for differentiation.',
      clientService: { low: 0, high: 2 },
      strategy: { low: 6, high: 10 },
      design: { low: 0, high: 0 },
      copywriter: { low: 1, high: 2 },
    },
    {
      id: 'stakeholder-interviews',
      name: 'Stakeholder Interviews',
      description:
        'One-on-one or group interviews with key internal and external stakeholders to surface perceptions, challenges and aspirations.',
      clientService: { low: 1, high: 4 },
      strategy: { low: 5, high: 12 },
      design: { low: 0, high: 0 },
      copywriter: { low: 1, high: 2 },
    },
    {
      id: 'brand-audit',
      name: 'Brand Audit',
      description:
        'A comprehensive review of existing brand assets, communications and touchpoints to assess consistency and effectiveness.',
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
        'A facilitated working session with key stakeholders to explore brand values, personality and strategic direction. Outputs inform the positioning framework.',
      clientService: { low: 2, high: 4 },
      strategy: { low: 8, high: 14 },
      design: { low: 2, high: 4 },
      copywriter: { low: 1, high: 4 },
    },
    {
      id: 'brand-positioning',
      name: 'Brand Positioning',
      description:
        'A clear articulation of where the brand sits in the market, who it serves and why it matters. Forms the strategic anchor for all brand expression.',
      clientService: { low: 2, high: 4 },
      strategy: { low: 12, high: 20 },
      design: { low: 0, high: 4 },
      copywriter: { low: 4, high: 7 },
    },
    {
      id: 'customer-value-proposition',
      name: 'Customer Value Proposition',
      description:
        'A distilled statement of the value the brand delivers to its customers - addressing needs, benefits and differentiation in a single, compelling articulation.',
      clientService: { low: 1, high: 3 },
      strategy: { low: 10, high: 18 },
      design: { low: 0, high: 3 },
      copywriter: { low: 7, high: 10 },
    },
    {
      id: 'brand-house-framework',
      name: 'Brand House / Framework',
      description:
        'A structured model that captures the brand essence, pillars, personality and promise in a cohesive visual framework for internal alignment and activation.',
      clientService: { low: 1, high: 3 },
      strategy: { low: 1, high: 20 },
      design: { low: 0, high: 12 },
      copywriter: { low: 0, high: 9 },
    },
    {
      id: 'internal-brand-positioning',
      name: 'Internal Brand Positioning',
      description:
        'Translates the external brand strategy into an internal narrative - defining how employees experience and embody the brand values day to day.',
      clientService: { low: 1, high: 3 },
      strategy: { low: 4, high: 18 },
      design: { low: 0, high: 12 },
      copywriter: { low: 1, high: 11 },
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
        'A structured kick-off session to align the team on project goals, timelines and existing brand knowledge.',
      clientService: { low: 2, high: 4 },
      strategy: { low: 4, high: 10 },
      design: { low: 2, high: 4 },
      copywriter: { low: 1, high: 3 },
    },
    {
      id: 'competitor-review',
      name: 'Competitor Review',
      description:
        'An audit of competitor brands and market positioning to identify whitespace and strategic opportunities.',
      clientService: { low: 0, high: 2 },
      strategy: { low: 6, high: 10 },
      design: { low: 0, high: 0 },
      copywriter: { low: 1, high: 2 },
    },
    {
      id: 'stakeholder-interviews',
      name: 'Stakeholder Interviews',
      description:
        'One-on-one or group interviews with key internal and external stakeholders.',
      clientService: { low: 1, high: 4 },
      strategy: { low: 5, high: 12 },
      design: { low: 0, high: 0 },
      copywriter: { low: 1, high: 2 },
    },
    {
      id: 'brand-audit',
      name: 'Brand Audit',
      description:
        'A review of existing brand assets, communications and touchpoints to assess consistency and effectiveness.',
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
        'A facilitated working session with key stakeholders to explore brand values, personality and strategic direction.',
      clientService: { low: 2, high: 4 },
      strategy: { low: 8, high: 14 },
      design: { low: 2, high: 4 },
      copywriter: { low: 1, high: 4 },
    },
    {
      id: 'brand-positioning',
      name: 'Brand Positioning',
      description:
        'A clear articulation of where the brand sits in the market, who it serves and why it matters.',
      clientService: { low: 2, high: 4 },
      strategy: { low: 12, high: 20 },
      design: { low: 0, high: 4 },
      copywriter: { low: 4, high: 7 },
    },
  ],
};

export const packages: Package[] = [
  {
    id: 'gold',
    label: 'Gold',
    name: 'Full brand strategy',
    phases: 'Phases 1 + 2',
    narrative:
      'From deep discovery through to a fully articulated positioning and internal framework. Ideal for organisations investing in a comprehensive brand foundation.',
    data: [discoveryPhaseGold, positioningPhaseGold],
  },
  {
    id: 'silver',
    label: 'Silver',
    name: 'Discovery + positioning',
    phases: 'Phases 1 + 2',
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
    name: 'Core positioning only',
    phases: 'Phases 1 + 2 - Strategy',
    narrative:
      'Market context, stakeholder insight and a clear positioning output. Ideal for businesses that need a defined brand position quickly or as a starting point for a phased programme.',
    data: [bronzeDiscoveryPhase, bronzePositioningPhase],
  },
  {
    id: 'identity-lite',
    label: 'Identity Lite',
    name: 'Visual identity refresh',
    phases: 'Phase 3 - Identity (Lite)',
    narrative:
      'For brands with strategic direction that need a refined or refreshed visual expression. Covers logo development, a cohesive visual system and a practical set of brand guidelines.',
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
        ],
      },
    ],
  },
  {
    id: 'internal-brand',
    label: 'Internal Brand',
    name: 'Culture and values',
    phases: 'Phases 1 + 2 - Internal focus',
    narrative:
      'For organisations going through change, growth or realignment. Builds an internal brand that galvanises your people from stakeholder discovery through to a defined values and cultural narrative.',
    data: [
      {
        id: 'discovery',
        title: '1 - Discovery',
        objective:
          'Objective: Understand the current cultural landscape and internal brand perceptions. Including (but not limited to):',
        deliverables: discoveryPhaseGold.deliverables,
      },
      {
        id: 'positioning',
        title: '2 - Positioning',
        objective:
          'Objective: Define and document the internal brand. Including (but not limited to):',
        deliverables: [
          positioningPhaseGold.deliverables[0],
          positioningPhaseGold.deliverables[4],
        ],
      },
    ],
  },
];

export const DEFAULT_RATE = 220;
