'use client'

import { useEffect, useState } from 'react'

import { isVersionSkewError, recoverFromVersionSkew } from '@/lib/versionSkew'

// Root-level last-resort boundary: catches errors in the root layout itself
// (and anything the segment boundaries miss). It REPLACES the root layout, so
// it renders its own <html>/<body> and can't rely on the app's CSS, fonts, or
// providers — hence the inline styles. Same version-skew self-heal as
// (docs)/error.tsx; otherwise a minimal Reload / Try again fallback.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [reloading, setReloading] = useState(() => isVersionSkewError(error))

  useEffect(() => {
    if (!isVersionSkewError(error)) return
    if (!recoverFromVersionSkew(error)) setReloading(false)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <style>{`
          .ge-root{min-height:100vh;box-sizing:border-box;display:flex;
            align-items:center;justify-content:center;padding:24px;text-align:center;
            font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
            background:#fff;color:#18181b}
          .ge-btn{appearance:none;border:1px solid transparent;border-radius:8px;
            padding:8px 16px;font-size:14px;font-weight:600;cursor:pointer;line-height:1.2}
          .ge-btn-primary{background:#18181b;color:#fff}
          .ge-btn-secondary{background:#fff;color:#18181b;border-color:rgba(0,0,0,.15)}
          @media (prefers-color-scheme:dark){
            .ge-root{background:#18181b;color:#fafafa}
            .ge-btn-primary{background:#fafafa;color:#18181b}
            .ge-btn-secondary{background:#18181b;color:#fafafa;border-color:rgba(255,255,255,.2)}
          }
        `}</style>
        <div className="ge-root">
          {reloading ? (
            <p style={{ opacity: 0.7 }}>Updating…</p>
          ) : (
            <div style={{ maxWidth: 480 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
                Something went wrong
              </h1>
              <p style={{ margin: '0 0 24px', opacity: 0.7 }}>
                Reload to get the latest version of the app.
              </p>
              <div
                style={{ display: 'flex', gap: 12, justifyContent: 'center' }}
              >
                <button
                  className="ge-btn ge-btn-primary"
                  onClick={() => window.location.reload()}
                >
                  Reload
                </button>
                <button
                  className="ge-btn ge-btn-secondary"
                  onClick={() => reset()}
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      </body>
    </html>
  )
}
