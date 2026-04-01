import { Suspense } from "react"
import { Spinner } from "@/components/ui/spinner"
import { GenerateWizard } from "./generate-wizard"

function Fallback() {
  return (
    <div className="flex justify-center py-20">
      <Spinner className="h-8 w-8 text-indigo-400" />
    </div>
  )
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<Fallback />}>
      <GenerateWizard />
    </Suspense>
  )
}
