import { redirect } from 'next/navigation'

/** Legacy URL; user management lives under Admin → Users. */
export default function SettingsRedirectPage() {
  redirect('/dashboard/profile')
}
