import { redirect } from 'next/navigation'

/** Legacy URL: library generation is merged into AI Generate. */
export default function GenerateLibraryRedirectPage() {
  redirect('/dashboard/generate')
}
