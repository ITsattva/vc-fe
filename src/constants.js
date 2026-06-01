export const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED']
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
export const ROLES = ['USER', 'ADMIN']

// Used to build a quick id -> label lookup for assignee/owner/project columns.
export function indexById(list) {
  const map = {}
  for (const item of list) map[item.id] = item
  return map
}
