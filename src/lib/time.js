// Format the current time like "2:21 PM" for chat timestamps.
export function nowTime() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}
