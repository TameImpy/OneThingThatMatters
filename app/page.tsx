import Link from 'next/link'

const displayFont = "'Barlow Condensed', Impact, 'Arial Narrow', sans-serif"
const bodyFont = "Georgia, 'Times New Roman', serif"

const TERMS_URL = 'https://tameimpy.github.io/Onthingthatmattersprivacy/OTTM_terms.html'
const PRIVACY_URL = 'https://tameimpy.github.io/Onthingthatmattersprivacy/OTTM_Privacy.html'
const CONTACT_EMAIL = 'rancematthew@gmail.com'

const categories = [
  { label: 'Watch', body: 'One video worth your time.' },
  { label: 'Read', body: 'One article that frames the day.' },
  { label: 'Research', body: 'One paper to sit with.' },
  { label: 'Story', body: 'One moment from AI history.' },
  { label: 'Art', body: 'One image to close the loop.' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto max-w-2xl px-6 py-12 sm:py-16">

        {/* Masthead */}
        <header className="overflow-hidden rounded-lg shadow-sm">
          <div className="bg-ink px-8 py-8 text-center">
            <p
              className="text-white leading-none m-0 uppercase"
              style={{
                fontFamily: displayFont,
                fontWeight: 900,
                fontStyle: 'italic',
                fontSize: '44px',
                letterSpacing: '-0.02em',
              }}
            >
              One Thing That Matters
            </p>
            <p
              className="text-white/70 text-sm mt-3 m-0"
              style={{ fontFamily: bodyFont }}
            >
              One signal in AI. Monday to Friday. Every angle.
            </p>
          </div>
        </header>

        {/* Lede */}
        <section className="bg-surface border-x border-b border-border px-8 py-10">
          <p
            className="text-primary text-lg leading-relaxed text-center m-0"
            style={{ fontFamily: bodyFont }}
          >
            A short daily briefing on artificial intelligence. We read the
            internet so you don&rsquo;t have to, and send one item per category
            &mdash; the single thing in each that actually matters that day.
          </p>
        </section>

        {/* Categories */}
        <section className="bg-page mt-12">
          <p
            className="text-ink uppercase text-center mb-6 m-0"
            style={{
              fontFamily: displayFont,
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: '24px',
              letterSpacing: '0.02em',
            }}
          >
            &#9670;&nbsp;What you get
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {categories.map(c => (
              <li
                key={c.label}
                className="bg-surface border border-border rounded-md px-5 py-4"
              >
                <p
                  className="text-accent uppercase m-0 leading-none"
                  style={{
                    fontFamily: displayFont,
                    fontWeight: 900,
                    fontStyle: 'italic',
                    fontSize: '20px',
                  }}
                >
                  {c.label}
                </p>
                <p
                  className="text-primary text-sm mt-2 m-0"
                  style={{ fontFamily: bodyFont }}
                >
                  {c.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* About */}
        <section className="mt-12 bg-surface border border-border rounded-md px-8 py-8">
          <p
            className="text-ink uppercase mb-3 m-0"
            style={{
              fontFamily: displayFont,
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: '20px',
            }}
          >
            About
          </p>
          <p
            className="text-primary text-sm leading-relaxed m-0"
            style={{ fontFamily: bodyFont }}
          >
            One Thing That Matters is an independent daily newsletter focused on
            artificial intelligence. Each weekday we surface a handful of
            candidates from across the web, pick the one item in each category
            that we think most deserves your attention, and send it as a short
            email. The aim is signal over volume.
          </p>
        </section>

        {/* CTA */}
        <section className="mt-12 text-center">
          <Link
            href="/subscribe"
            className="inline-block bg-accent px-10 py-4 text-white hover:opacity-90 transition-opacity uppercase rounded"
            style={{
              fontFamily: displayFont,
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: '22px',
              letterSpacing: '0.01em',
            }}
          >
            <span style={{ position: 'relative', top: '-2px' }}>◆</span>
            &nbsp;Subscribe
          </Link>
          <p
            className="text-muted text-xs mt-3 m-0"
            style={{ fontFamily: bodyFont }}
          >
            Free. No spam. Unsubscribe anytime.
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-border text-center">
          <p
            className="text-muted text-xs m-0"
            style={{ fontFamily: bodyFont }}
          >
            <a
              href={TERMS_URL}
              className="hover:text-ink transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms
            </a>
            <span className="mx-2">&middot;</span>
            <a
              href={PRIVACY_URL}
              className="hover:text-ink transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy
            </a>
            <span className="mx-2">&middot;</span>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="hover:text-ink transition-colors"
            >
              Contact
            </a>
          </p>
          <p
            className="text-muted text-xs mt-2 m-0"
            style={{ fontFamily: bodyFont }}
          >
            &copy; {new Date().getFullYear()} One Thing That Matters
          </p>
        </footer>

      </div>
    </div>
  )
}
