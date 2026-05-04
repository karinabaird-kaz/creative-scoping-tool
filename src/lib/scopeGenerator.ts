interface ScopeGeneratorInput {
  brief: string;
  clientName?: string;
  projectName?: string;
}

const SCOPE_GENERATION_PROMPT = `You are an expert proposal writer for creative and strategy agencies. Your task is to convert project briefs, effort calculator data, or deliverable lists into professional, client-facing scope descriptions.

The scope description should use an outcomes and deliverables model, NOT a time-and-materials model. This means:
- Never use "Round 1", "Round 2", "Round 3" language
- Never mention hours, rates, or staff roles
- Frame work as fixed deliverables within defined phases
- Include refinement as part of the phase, not as a separate negotiable unit

Structure the scope description with these sections (include only relevant sections):

1. **Opening Summary**: One sentence explaining what the estimate covers in plain language

2. **Phases** (use only the phases relevant to the work, in this order):
   - Strategy Phase: Brand or campaign strategy development, including research, workshops, positioning, or audience definition
   - Ideation Phase: Creative exploration and concept development. Include mention of how many directions/concepts will be presented and that one will be selected to move forward
   - Development Phase: Refine and develop the selected direction to final presentation-ready or production-ready state
   - Production Phase: Build, animation, editing, finishing, or adaptation into final deliverable formats

3. **Deliverables**: A specific bulleted list of final outputs with formats, sizes, quantities, and file types where relevant. Be concrete.

4. **Exclusions**: Plain bulleted list of what is NOT included (additional concepts beyond scope, amendments outside scope, stock imagery, etc.)

5. **Assumptions**: Plain bulleted list of what the estimate relies on being true (client will provide assets, decision-makers available for workshops, etc.)

Tone guidelines:
- Direct and professional, not legalistic
- Use Australian English spelling
- Avoid em dashes; use simple punctuation
- Assume the reader (client) is educated and commercially aware
- Be specific about quantities and deliverables

Now, based on the brief or information provided below, generate a complete scope description following this structure:

---

[BRIEF WILL BE INSERTED HERE]

---

Generate only the scope description text, with clear section headings. Do not include any metadata, explanations, or preamble. Start directly with the opening summary.`;

const DEMO_SCOPE = `This estimate covers the strategy, creative development, and production of a refreshed brand identity for ${'{CLIENT}'}${'{PROJECT}'}.

**Strategy Phase**

We will begin with a brand discovery process to establish a clear strategic foundation. This includes a stakeholder workshop, competitive landscape review, and audience definition. The output is a Brand Strategy document capturing positioning, personality, tone of voice, and key messaging principles that will guide all creative work.

**Ideation Phase**

Building on the approved strategy, our creative team will explore three distinct visual identity directions. Each direction will be presented as a cohesive concept, including logo treatment, colour palette, typography, and example applications. Following client feedback, one direction will be selected to carry forward into development.

**Development Phase**

The selected direction will be refined and extended into a complete brand identity system. This includes finalisation of the logo suite, colour system, typography hierarchy, and core brand elements. The phase concludes with a presentation of the full identity system ready for client sign-off.

**Production Phase**

Approved brand assets will be packaged and prepared for handover. All files will be supplied in both print-ready and screen formats, along with a Brand Guidelines document to ensure consistent application across all future touchpoints.

**Deliverables**

- Primary logo suite (horizontal, stacked, icon-only) in AI, EPS, SVG, PNG, and JPG formats
- Colour palette specifications (CMYK, RGB, HEX, Pantone)
- Typography hierarchy with licensed font recommendations
- Core brand elements (patterns, textures, graphic devices as applicable)
- Brand Guidelines document (PDF, minimum 20 pages)
- Master asset folder with organised, production-ready files

**Exclusions**

- Photography, illustration, or stock imagery
- Website design or development
- Print production or supplier management
- Signage, environmental, or packaging design
- Social media template production
- Any deliverables not listed above

**Assumptions**

- Client will provide existing brand assets, references, and relevant background materials at project kick-off
- A single key decision-maker or small working group (maximum three people) will provide consolidated feedback at each review stage
- Client feedback will be provided within five business days of each presentation
- This estimate covers one selected creative direction through to completion; additional directions or significant scope changes will be quoted separately`;

const isDemoMode = (key: string | undefined) =>
  !key || key === 'sk-ant-YOUR_KEY_HERE' || key.trim() === '';

export async function generateScopeDescription(input: ScopeGeneratorInput): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

  if (isDemoMode(apiKey)) {
    // Demo mode: return a realistic example scope after a short delay to simulate generation
    await new Promise((resolve) => setTimeout(resolve, 1800));
    const clientLine = input.clientName ? input.clientName : 'the client';
    const projectLine = input.projectName ? ` — ${input.projectName}` : '';
    return DEMO_SCOPE
      .replace('{CLIENT}', clientLine)
      .replace('{PROJECT}', projectLine) + '\n\n---\n⚠️ Demo mode: this is an example output. Add your Anthropic API key to generate real scopes from your brief.';
  }

  const contextPrefix = [
    input.clientName && `Client: ${input.clientName}`,
    input.projectName && `Project: ${input.projectName}`,
  ]
    .filter(Boolean)
    .join('\n');

  const briefWithContext = contextPrefix
    ? `${contextPrefix}\n\n${input.brief}`
    : input.brief;

  const prompt = SCOPE_GENERATION_PROMPT.replace(
    '[BRIEF WILL BE INSERTED HERE]',
    briefWithContext
  );

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { error?: { message?: string } }).error?.message ||
        `API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>;
  };
  const content = data.content[0];

  if (content.type !== 'text') {
    throw new Error('Unexpected response type from API');
  }

  return content.text;
}
