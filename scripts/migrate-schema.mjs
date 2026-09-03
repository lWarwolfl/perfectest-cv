// One-off migration: resume content jsonb -> resume_section/resume_entry tables,
// letter content jsonb -> flat letter columns. Run: node --env-file=.env scripts/migrate-schema.mjs
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL, { prepare: false })

const ALLOWED_TYPES = new Set([
  'profile', 'work', 'education', 'skill', 'language', 'interest', 'project',
  'certificate', 'publication', 'organisation', 'course', 'award', 'reference',
  'declaration', 'custom',
])

async function main() {
  console.log('creating resume_section / resume_entry + letter columns...')
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS resume_section (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL,
      resume_id uuid NOT NULL REFERENCES resume(id) ON DELETE CASCADE,
      "order" integer DEFAULT 0 NOT NULL,
      section_type text NOT NULL,
      display_name text DEFAULT '' NOT NULL,
      icon_key text DEFAULT '' NOT NULL,
      hidden boolean DEFAULT false NOT NULL
    );
    CREATE INDEX IF NOT EXISTS resume_section_resume_idx ON resume_section(resume_id);
    CREATE TABLE IF NOT EXISTS resume_entry (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL,
      section_id uuid NOT NULL REFERENCES resume_section(id) ON DELETE CASCADE,
      "order" integer DEFAULT 0 NOT NULL,
      hidden boolean DEFAULT false NOT NULL,
      data jsonb NOT NULL
    );
    CREATE INDEX IF NOT EXISTS resume_entry_section_idx ON resume_entry(section_id);
  `)

  const LETTER_COLS = [
    ['body', 'text'], ['subject', 'text'], ['date_mode', 'text'], ['date_custom', 'text'],
    ['sender_name', 'text'], ['sender_job_title', 'text'], ['sender_email', 'text'],
    ['sender_phone', 'text'], ['sender_address', 'text'], ['sender_website', 'text'],
    ['sender_linked_in', 'text'], ['sender_git_hub', 'text'], ['recipient_name', 'text'],
    ['recipient_position', 'text'], ['recipient_company', 'text'], ['recipient_address', 'text'],
    ['signature_name', 'text'], ['signature_place', 'text'], ['signature_date', 'text'],
    ['signature_image_id', 'text'],
  ]
  for (const [name] of LETTER_COLS) {
    await sql.unsafe(`ALTER TABLE letter ADD COLUMN IF NOT EXISTS ${name} text DEFAULT '' NOT NULL`)
  }

  console.log('migrating letter.content -> flat columns...')
  const letters = await sql`SELECT id, content FROM letter WHERE content IS NOT NULL`
  for (const l of letters) {
    const c = l.content ?? {}
    const date = c.date ?? {}
    const rec = c.recipient ?? {}
    const decl = c.declaration ?? {}
    await sql`
      UPDATE letter SET body=${c.body ?? ''}, subject=${c.subject ?? ''}, date_mode=${date.mode ?? 'current'},
        date_custom=${date.custom ?? ''}, sender_name=${decl.fullName ?? ''}, recipient_name=${rec.hrName ?? ''},
        recipient_position=${rec.positionOrDepartment ?? ''}, recipient_company=${rec.company ?? ''},
        recipient_address=${rec.address ?? ''}, signature_name=${decl.fullName ?? ''}, signature_place=${decl.place ?? ''},
        signature_date=${decl.date ?? ''}, signature_image_id=${decl.imageId ?? decl.dataUrl ?? ''}
      WHERE id=${l.id}`
  }

  console.log('migrating resume.content -> resume_section/resume_entry...')
  const resumes = await sql`SELECT id, content, customization FROM resume WHERE content IS NOT NULL`
  for (const r of resumes) {
    const content = r.content ?? {}
    const customization = r.customization ?? {}
    const mix = customization?.layout?.sectionOrder?.mix ?? []
    let sections = Object.values(content)
    if (mix.length) {
      const byId = new Map(sections.map((s) => [String(s.id), s]))
      const ordered = mix.map((id) => byId.get(String(id))).filter(Boolean)
      sections = [...ordered, ...sections.filter((s) => !mix.includes(String(s.id)))]
    }
    let i = 0
    for (const s of sections) {
      if (String(s.sectionType).startsWith('header')) continue
      const type = ALLOWED_TYPES.has(s.sectionType) ? s.sectionType : 'custom'
      let [sec] = await sql`
        INSERT INTO resume_section (resume_id, "order", section_type, display_name, icon_key, hidden)
        VALUES (${r.id}, ${i++}, ${type}, ${s.displayName ?? ''}, ${s.iconKey ?? ''}, false)
        RETURNING id`
      let j = 0
      for (const e of s.entries ?? []) {
        if (!e || typeof e !== 'object') continue
        const { id: _id, isNewEntry: _new, isHidden, ...rest } = e
        void _id
        void _new
        await sql`
          INSERT INTO resume_entry (section_id, "order", hidden, data)
          VALUES (${sec.id}, ${j++}, ${!!isHidden}, ${JSON.stringify({ ...rest, type })})`
      }
    }
  }

  console.log('dropping legacy content columns...')
  await sql.unsafe('ALTER TABLE resume DROP COLUMN IF EXISTS content')
  await sql.unsafe('ALTER TABLE letter DROP COLUMN IF EXISTS content')
  console.log('done')
}

try {
  await main()
} finally {
  await sql.end()
}