import { useEffect, useState } from 'react'
import { ui } from '../components/ui'
import {
  fetchAllContainerUrlGroups,
  type LocationUrlGroup,
} from '../hooks/useAllContainerUrls'
import { getShareUrl } from '../lib/shareUrl'

function ContainerLine({
  number,
  containerId,
}: {
  number: number
  containerId: string
}) {
  const url = getShareUrl(containerId)

  return (
    <li className="text-sm leading-relaxed text-violet-900">
      Container {number} –{' '}
      <a
        href={url}
        className="break-all font-medium text-fuchsia-700 underline decoration-fuchsia-300 underline-offset-2"
      >
        {url}
      </a>
    </li>
  )
}

function LocationSection({ group }: { group: LocationUrlGroup }) {
  const hasRows = group.rows.length > 0

  return (
    <section className={`${ui.card} space-y-3`}>
      <h2 className="text-xl font-extrabold text-violet-800">
        {group.location.name}
      </h2>

      {hasRows ? (
        <div className="space-y-4">
          {group.rows.map(({ row, containers }) =>
            containers.length > 0 ? (
              <div key={row.id}>
                <h3 className={`${ui.sectionTitle} mb-2`}>Row {row.number}</h3>
                <ul className="list-disc space-y-1 pl-5">
                  {containers.map((container) => (
                    <ContainerLine
                      key={container.id}
                      number={container.number}
                      containerId={container.id}
                    />
                  ))}
                </ul>
              </div>
            ) : null,
          )}
          {group.unassigned.length > 0 && (
            <ul className="list-disc space-y-1 pl-5">
              {group.unassigned.map((container) => (
                <ContainerLine
                  key={container.id}
                  number={container.number}
                  containerId={container.id}
                />
              ))}
            </ul>
          )}
        </div>
      ) : (
        <ul className="list-disc space-y-1 pl-5">
          {group.unassigned.map((container) => (
            <ContainerLine
              key={container.id}
              number={container.number}
              containerId={container.id}
            />
          ))}
        </ul>
      )}

      {!hasRows && group.unassigned.length === 0 && (
        <p className={ui.muted}>No containers.</p>
      )}
      {hasRows &&
        group.rows.every((r) => r.containers.length === 0) &&
        group.unassigned.length === 0 && (
          <p className={ui.muted}>No containers.</p>
        )}
    </section>
  )
}

export function ContainerUrlListPage() {
  const [groups, setGroups] = useState<LocationUrlGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllContainerUrlGroups()
      .then(setGroups)
      .catch(() => setError('Failed to load container URLs.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={`${ui.page} max-w-2xl`}>
      <h1 className={`${ui.title} mb-6`}>Container URLs</h1>

      {loading && <p className={ui.muted}>Loading…</p>}
      {error && <p className="text-center text-sm text-rose-600">{error}</p>}

      {!loading && !error && groups.length === 0 && (
        <p className={ui.muted}>No locations yet.</p>
      )}

      <div className="space-y-4">
        {groups.map((group) => (
          <LocationSection key={group.location.id} group={group} />
        ))}
      </div>
    </div>
  )
}
