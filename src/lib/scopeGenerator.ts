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

Structure (include only relevant phases):

This estimate includes [one sentence summary].

Strategy
- [bullet: what is being done, e.g. gap analysis, messaging matrix, workshop, positioning]

Creative Development
- [bullet: what concepts/directions are being explored and how many]
- [bullet: what is being refined and to what level]

Design / Production
- [bullet: specific assets being produced, with quantities and formats]

Deliverables
- [bulleted list of final outputs with formats, sizes, quantities]

ESTIMATE DOES NOT INCLUDE:
- Additional concepts beyond the above scope
- Amendments or additions outside of the above scope
- Purchase or usage of stock imagery/footage
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
- Purchase or usage of stock imagery/footage
- Finished art or production outside of the above scope

ASSUMPTIONS:
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
      .split('\n')
      .filter((line) => line.trim() !== '')
      .slice(0, 20)
      .join('\n');
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
