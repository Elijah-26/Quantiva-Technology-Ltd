import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function ExtensionDemoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Regulatory Guardrail — Chrome extension
      </h1>
      <p className="mb-6 text-gray-600">
        The reference implementation lives in the repo under{' '}
        <code className="rounded bg-gray-100 px-1 text-sm">
          functionality_update/app/src/regulatory-guardrail/extension/
        </code>
        . It is not published to the Chrome Web Store from this demo.
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What it does (prototype)</CardTitle>
          <CardDescription>
            Content scripts for Gmail, LinkedIn, and generic pages; debounced
            scanning; highlights by severity; optional send interception in
            Gmail.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            <strong>Load unpacked (developers):</strong>
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Open Chrome → <code>chrome://extensions</code></li>
            <li>Enable Developer mode</li>
            <li>Click Load unpacked</li>
            <li>
              Select the <code>extension</code> folder inside{' '}
              <code>functionality_update/.../regulatory-guardrail/</code> on your
              machine (clone the repo locally).
            </li>
          </ol>
          <p className="text-gray-500">
            Production deployment would package this folder, assign an extension
            ID, and wire it to your compliance API with auth.
          </p>
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/demo/extension/panel">Open panel demo</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/demo/extension/sync">Open sync checklist demo</Link>
        </Button>
      </div>

      <Button asChild variant="outline">
        <Link href="/demo">Back to demo hub</Link>
      </Button>
    </div>
  )
}
