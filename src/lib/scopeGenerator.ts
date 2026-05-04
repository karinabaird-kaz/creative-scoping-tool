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

export async function generateScopeDescription(input: ScopeGeneratorInput): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

  if (!apiKey) {
    throw new Error(
      'API key not configured. Please set VITE_ANTHROPIC_API_KEY in your .env.local file.'
    );
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
