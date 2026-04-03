import { redirect } from 'next/navigation'

/** Legacy URL: library generation is merged into On-Demand Document. */
export default function GenerateLibraryRedirectPage() {
  redirect('/dashboard/generate')
}
