interface ScopeGeneratorInput {
  brief: string;
  clientName?: string;
  projectName?: string;
}

export interface RefineInput {
  currentScope: string;
  instruction: string;
  brief: string;
  clientName?: string;
  projectName?: string;
}

const SCOPE_GENERATION_PROMPT = `You are a proposal writer for a creative and strategy agency. Convert the brief below into a concise, professional scope description for a client proposal.

Tone and style:
- Open with one plain sentence: "This estimate includes [what the work covers]."
- Use short bullet points under each phase. Do not write in paragraphs.
- Be specific about quantities, formats, and deliverables. Do not be vague.
- Keep it tight. A client should be able to scan it in under a minute.
- Use Australian English spelling.
- Do not mention hours, rates, or staff roles.
- Do not use em dashes.
- Do not use markdown formatting. No asterisks, no bold, no italic. Plain text only.
- Section headings are plain text on their own line, not bold or capitalised.
- Do not add a blank line between a section heading and its first bullet. The first bullet follows immediately on the next line.
- Add one blank line between sections (after the last bullet of one section, before the heading of the next).
- Deliverables are not a separate section. Include the specific final output (format, quantity, size) as the last bullet point(s) within each relevant section.

Phase naming rules — use only these names, only when relevant to the brief:
- Strategy
- Copywriting (use this — NOT Creative Development — when the work is primarily messaging, copy, scripts, or written content with no visual concept exploration)
- Creative Development (use only when the work involves exploring visual concepts or creative directions — e.g. brand identity, campaign concepts, art direction. Do NOT use for copy or messaging work.)
- Design Development (never use "Design / Production" or "Production" unless it is a physical shoot or print run)
- Production (only for briefs involving physical production: video shoots, photography shoots, print runs)
- Website Creative Direction (only if web design is in scope)

Phase content rules:
- Stock image sourcing always belongs in Design Development, never in Copywriting or Creative Development. When a budget is specified for stock imagery, write it as "(allowance up to $X)" — never "within supplied budget" or "within budget"
- Copy and messaging (headlines, body copy, scripts, captions) always belong in Copywriting, never in Design Development
- A brief can have both Copywriting and Design Development as separate phases

Ordering within each phase — think carefully about logical sequence:
- Start with the context or constraint that governs the work (e.g. "Applying existing [client] brand template" or "Working within supplied brand guidelines"). This goes FIRST, before listing the work items.
- Then list the actual work being done (assets, quantities, formats)
- Then the final deliverable (file formats, quantities, how they are supplied)
- End every phase with this exact line, with no dash or bullet prefix before it — it must be a plain unformatted line: "Includes 2 rounds of client feedback". Never write "- Includes 2 rounds of client feedback". Always write "Includes 2 rounds of client feedback" with nothing before it.
- Never bury context or constraints at the end of a phase — they frame everything that follows

Opening sentence rules:
- Mention the template or existing brand system if the work is applying one (e.g. "…applying the existing [Brand] template")
- Mention all major phases: if there is copywriting AND design, both should be referenced
- Keep it to one tight sentence

Overall intelligence rules — before writing, ask yourself:
- Is this work exploratory (new directions, new concepts) or executional (applying known brand, producing to spec)? Exploratory = Creative Development. Executional = Design Development.
- Is the writing work messaging strategy or just producing copy to a brief? Messaging strategy = Strategy. Producing copy = Copywriting.
- What comes first logically? Copy is written before design starts. Strategy before creative. Brief analysis before anything.
- Are there dependencies between phases that the order should reflect?

Structure (include only relevant phases):

This estimate includes [one sentence summary including brand/template context if relevant].

Strategy
- [what is being done, e.g. workshop, positioning, gap analysis, messaging framework]
- [final output from this phase, e.g. "Brand positioning document"]

Copywriting
- [what copy is being written, for which assets, how many]
- [final copy deliverable, e.g. "Copy document for client approval"]

Creative Development
- [what concepts/directions are being explored and how many]
- [what is being refined and to what level]
- [final creative output from this phase]

Design Development
- [brand/template context FIRST — e.g. "Applying existing [Brand] visual template across all assets"]
- [stock image sourcing if applicable — write as "Source stock imagery (allowance up to $X)" without specifying frame counts or quantities in the allowance note]
- [specific assets being designed, with quantities and formats]
- [final files delivered: format, size, quantity — do not include frame counts in the total]

Production
- [only include if there is a physical shoot or print run]
- [crew, location, format details]
- [final deliverable from production]

ESTIMATE DOES NOT INCLUDE:
- Additional concepts beyond the above scope
- Amendments or additions outside of the above scope
- Purchase or usage of stock imagery/footage outside of the above scope
- Finished art or production outside of the above scope

ASSUMPTIONS:
- Any supplied assets are provided with online usage rights

---

[BRIEF WILL BE INSERTED HERE]

---

Output only the scope description. No preamble, no metadata. Start with "This estimate includes".`;

const DEMO_SCOPE = `This estimate includes the strategy, creative development, and production of a refreshed brand identity for ${'{CLIENT}'}${'{PROJECT}'}.

Strategy
- Brand discovery workshop with key stakeholders
- Competitive landscape and market review
- Brand positioning, purpose, values and customer value proposition
- Tone of voice direction

Creative Development
- 3x visual identity directions presented, covering logo treatment, colour palette, typography and example applications
- 1x selected direction refined to final presentation-ready state

Design / Production
- Full logo suite finalised (horizontal, stacked, icon-only)
- Colour, typography and graphic device system
- Brand Guidelines document (up to 20 pages)
- Master asset handover package

Deliverables
- Logo suite: AI, EPS, SVG, PNG, JPG (print and screen)
- Colour specifications: CMYK, RGB, HEX, Pantone
- Brand Guidelines PDF
- Organised master asset folder

ESTIMATE DOES NOT INCLUDE:
- Additional concepts beyond the above scope
- Amendments or additions outside of the above scope
- Purchase or usage of stock imagery/footage outside of the above scope
- Finished art or production outside of the above scope

ASSUMPTIONS:
- Two rounds of minor amendments are included per phase
- Any supplied assets are provided with online usage rights`;

const isDemoMode = (key: string | undefined) =>
  !key || key === 'sk-ant-YOUR_KEY_HERE' || key.trim() === '';

async function callClaude(apiKey: string, messages: Array<{ role: string; content: string }>): Promise<string> {
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
      messages,
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

export async function generateScopeDescription(input: ScopeGeneratorInput): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

  if (isDemoMode(apiKey)) {
    await new Promise((resolve) => setTimeout(resolve, 1800));
    const clientLine = input.clientName ? input.clientName : 'the client';
    const projectLine = input.projectName ? ` — ${input.projectName}` : '';
    return DEMO_SCOPE
      .replace('{CLIENT}', clientLine)
      .replace('{PROJECT}', projectLine) +
      '\n\n---\n⚠️ Demo mode: this is an example output. Add your Anthropic API key to generate real scopes from your brief.';
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

  return callClaude(apiKey!, [{ role: 'user', content: prompt }]);
}

export async function refineScope(input: RefineInput): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

  if (isDemoMode(apiKey)) {
    await new Promise((resolve) => setTimeout(resolve, 1400));
    // In demo mode, return a trimmed version of the current scope with a note
    const trimmed = input.currentScope
      .replace('\n\n---\n⚠️ Demo mode: this is an example output. Add your Anthropic API key to generate real scopes from your brief.', '')
      .trimEnd();
    return trimmed + '\n\n---\n⚠️ Demo mode: refinement not available without an API key.';
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

  const initialPrompt = SCOPE_GENERATION_PROMPT.replace(
    '[BRIEF WILL BE INSERTED HERE]',
    briefWithContext
  );

  return callClaude(apiKey!, [
    { role: 'user', content: initialPrompt },
    { role: 'assistant', content: input.currentScope },
    {
      role: 'user',
      content: `Please revise the scope description based on this feedback: ${input.instruction}\n\nKeep the same format and style. Output only the updated scope description.`,
    },
  ]);
}

export interface QueryInput {
  brief: string;
  question: string;
  clientName?: string;
  projectName?: string;
}

export async function queryBrief(input: QueryInput): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

  if (isDemoMode(apiKey)) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return 'Query mode is not available in demo mode. Add your Anthropic API key to use this feature.';
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

  const prompt = `You are a helpful assistant for a creative agency. A project brief has been provided below. Answer the user's question about it concisely and accurately. If the answer is not in the brief, say so clearly.

BRIEF:
${briefWithContext}

QUESTION: ${input.question}

Answer concisely in plain text. No bullet points unless the answer naturally calls for them.`;

  return callClaude(apiKey!, [{ role: 'user', content: prompt }]);
}
