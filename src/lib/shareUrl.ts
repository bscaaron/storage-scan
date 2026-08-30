export function getShareUrl(containerId: string) {
  return `${window.location.origin}${import.meta.env.BASE_URL}#/share/${containerId}`
}
