import { redirect } from 'next/navigation'

/** Legacy URL: use the AI Generate wizard (also saves to the document library). */
export default function DemoGenerateLibraryRedirectPage() {
  redirect('/demo/ai/dashboard/generate')
}
