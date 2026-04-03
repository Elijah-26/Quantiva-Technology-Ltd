'use client'

import { withAuth } from '@/lib/auth/protected-route'
import WorkspacePageClient from './workspace-page-client'

export default withAuth(WorkspacePageClient)
