'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { FileSearch, Calendar, Zap, Loader2, Repeat } from 'lucide-react'
import { getActiveWebhooksByType } from '@/lib/webhooks'
import { toast } from 'sonner'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { createReportFromWebhook, saveReport } from '@/lib/reports'
import { createScheduleFromForm, saveSchedule } from '@/lib/schedules'

const marketCategories = [
  'Technology & Software',
  'Healthcare & Pharmaceuticals',
  'Financial Services',
  'E-commerce & Retail',
  'Manufacturing & Industrial',
  'Food & Beverage',
  'Real Estate',
  'Education & E-learning',
  'Entertainment & Media',
  'Automotive',
  'Energy & Utilities',
  'Telecommunications',
]

const frequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export default function NewResearchPage() {
  const router = useRouter()
  
  // Separate form states for each type
  const [onDemandForm, setOnDemandForm] = useState({
    marketCategory: '',
    subNiche: '',
    geography: '',
    email: '',
    notes: '',
  })
  
  const [recurringForm, setRecurringForm] = useState({
    marketCategory: '',
    subNiche: '',
    geography: '',
    email: '',
    frequency: 'weekly',
    notes: '',
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('on-demand')

  // Handle On-Demand Research submission
  const handleOnDemandSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    console.log('🚀 On-Demand Research submission started')
    
    try {
      // Get active on-demand webhooks
      const activeWebhooks = getActiveWebhooksByType('on-demand')
      
      console.log('Active on-demand webhooks:', activeWebhooks)
      
      if (activeWebhooks.length === 0) {
        toast.warning('No active on-demand webhooks', {
          description: 'Please configure an on-demand webhook in Settings.',
        })
        return
      }
      
      // Send data to all active on-demand webhooks
      const webhookPromises = activeWebhooks.map(async (webhook) => {
        console.log(`📤 Sending to webhook: ${webhook.url}`)
        
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...onDemandForm,
            submittedAt: new Date().toISOString(),
            webhookName: webhook.name,
            researchType: 'on-demand',
          }),
        })
        
        console.log(`📥 Response status from ${webhook.name}:`, response.status)
        
        return response
      })

      const results = await Promise.allSettled(webhookPromises)
      
      console.log('📊 All results:', results)
      
      // Check results and get response data
      let webhookResponseData = null
      let successCount = 0
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.ok) {
          successCount++
          if (!webhookResponseData) {
            try {
              const responseText = await result.value.text()
              console.log('📄 Raw response text:', responseText)
              
              const data = JSON.parse(responseText)
              console.log('✅ Parsed webhook response:', data)
              webhookResponseData = data
            } catch (err) {
              console.error('❌ Failed to parse webhook response:', err)
            }
          }
        } else if (result.status === 'fulfilled') {
          console.error('❌ Webhook returned non-OK status:', result.value.status)
        } else {
          console.error('❌ Webhook request failed:', result.reason)
        }
      }
      
      if (successCount > 0) {
        let savedReportId: string | null = null
        
        if (webhookResponseData) {
          localStorage.setItem('latestWebhookReport', JSON.stringify(webhookResponseData))
          
          const report = createReportFromWebhook(webhookResponseData, {
            ...onDemandForm,
            researchType: 'on-demand'
          })
          saveReport(report)
          savedReportId = report.id
          
          console.log('✅ Report saved with ID:', report.id)
        }

        toast.success('On-Demand Research submitted successfully!', {
          description: 'The Report has been sent to your email',
          duration: 5000,
        })
        
        // Reset form
        setOnDemandForm({
          marketCategory: '',
          subNiche: '',
          geography: '',
          email: '',
          notes: '',
        })

        // Navigate to the saved report
        setTimeout(() => {
          if (savedReportId) {
            router.push(`/dashboard/reports/${savedReportId}`)
          } else {
            router.push('/dashboard/reports')
          }
        }, 2000)
      } else {
        throw new Error('All webhooks failed')
      }
    } catch (error) {
      console.error('Submission error:', error)
      toast.error('Submission failed', {
        description: 'Please check your configuration and try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Recurring Research submission
  const handleRecurringSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    console.log('🔄 Recurring Research submission started')
    console.log('📅 Frequency:', recurringForm.frequency)
    
    try {
      // Get active recurring webhooks
      const activeWebhooks = getActiveWebhooksByType('recurring')
      
      console.log('Active recurring webhooks:', activeWebhooks)
      
      if (activeWebhooks.length === 0) {
        toast.warning('No active recurring webhooks', {
          description: 'Please configure a recurring webhook in Settings.',
        })
        setIsSubmitting(false)
        return
      }

      // Send data to recurring webhook(s) and wait for response
      const webhookPromises = activeWebhooks.map(async (webhook) => {
        console.log(`📤 Sending to recurring webhook: ${webhook.url}`)
        console.log('📦 Payload:', {
          ...recurringForm,
          submittedAt: new Date().toISOString(),
          webhookName: webhook.name,
          researchType: 'recurring',
          isInitialRun: true,
        })
        
        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...recurringForm,
              submittedAt: new Date().toISOString(),
              webhookName: webhook.name,
              researchType: 'recurring',
              isInitialRun: true,
            }),
          })
          
          console.log(`📥 Response status from ${webhook.name}:`, response.status)
          console.log(`📥 Response headers:`, Object.fromEntries(response.headers.entries()))
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error(`❌ Webhook error response:`, errorText)
            throw new Error(`Webhook ${webhook.name} failed with status ${response.status}: ${errorText.substring(0, 200)}`)
          }
          
          // Get the response data
          const responseText = await response.text()
          console.log('📄 Raw response (first 500 chars):', responseText.substring(0, 500))
          
          let responseData
          try {
            responseData = JSON.parse(responseText)
            console.log('✅ Parsed response data:', responseData)
          } catch (e) {
            console.warn('⚠️ Could not parse response as JSON:', e)
            responseData = { webReport: responseText }
          }
          
          return responseData
        } catch (error) {
          console.error(`❌ Fetch error for ${webhook.url}:`, error)
          throw error
        }
      })

      const results = await Promise.allSettled(webhookPromises)
      
      console.log('📊 Webhook results:', results)
      
      // Check if any webhooks succeeded and get response data
      let successCount = 0
      let webhookResponseData = null
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          successCount++
          if (!webhookResponseData) {
            webhookResponseData = result.value
          }
        }
      }
      
      if (successCount > 0) {
        let savedReportId: string | null = null
        let scheduleId: string | null = null
        
        // Save the webhook response data and create report
        if (webhookResponseData) {
          localStorage.setItem('latestWebhookReport', JSON.stringify(webhookResponseData))
          
          const report = createReportFromWebhook(webhookResponseData, {
            ...recurringForm,
            researchType: 'recurring'
          })
          saveReport(report)
          savedReportId = report.id
          
          console.log('✅ Report saved with ID:', report.id)
          
          // Only create schedule AFTER successful webhook response
          const schedule = createScheduleFromForm(recurringForm)
          saveSchedule(schedule)
          scheduleId = schedule.id
          
          console.log('✅ Schedule created with ID:', schedule.id)
          console.log('📆 Next run:', schedule.nextRun)
        }

        toast.success('Recurring Research scheduled successfully!', {
          description: 'First report generated! The Report has been sent to your email.',
          duration: 5000,
        })
        
        // Reset form
        setRecurringForm({
          marketCategory: '',
          subNiche: '',
          geography: '',
          email: '',
          frequency: 'weekly',
          notes: '',
        })

        // Navigate to the saved report
        setTimeout(() => {
          if (savedReportId) {
            router.push(`/dashboard/reports/${savedReportId}`)
          } else {
            router.push('/dashboard/schedules')
          }
        }, 2000)
      } else {
        throw new Error('All webhooks failed')
      }
    } catch (error) {
      console.error('❌ Recurring research submission failed:', error)
      
      // More detailed error message
      let errorMessage = 'Please check your webhook configuration and try again.'
      
      if (error instanceof Error) {
        console.error('❌ Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Network error: Could not reach webhook. Check if n8n workflow is active and URL is correct.'
        } else if (error.message.includes('CORS')) {
          errorMessage = 'CORS error: n8n webhook needs to allow cross-origin requests.'
        } else if (error.message.includes('status')) {
          errorMessage = `Webhook error: ${error.message}`
        }
      }
      
      toast.error('Submission failed', {
        description: errorMessage,
        duration: 8000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Full-screen loading overlay */}
      <LoadingOverlay isVisible={isSubmitting} />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileSearch className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Market Research</h2>
            <p className="text-gray-600">Choose your research type and configure parameters</p>
          </div>
        </div>
      </div>

      {/* Tab-based Forms */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="on-demand" className="gap-2 py-3">
            <Zap className="w-4 h-4" />
            <div className="text-left">
              <div className="font-semibold">On-Demand Research</div>
              <div className="text-xs text-gray-500 font-normal">Immediate results</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="recurring" className="gap-2 py-3">
            <Repeat className="w-4 h-4" />
            <div className="text-left">
              <div className="font-semibold">Recurring Research</div>
              <div className="text-xs text-gray-500 font-normal">Automated schedule</div>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* On-Demand Research Form */}
        <TabsContent value="on-demand" className="space-y-6">
          <form onSubmit={handleOnDemandSubmit}>
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <CardTitle>On-Demand Research</CardTitle>
                </div>
                <CardDescription>
                  Run once immediately and receive results within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Market Category */}
                <div className="space-y-2">
                  <Label htmlFor="od-marketCategory">
                    Market Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={onDemandForm.marketCategory}
                    onValueChange={(value) => setOnDemandForm(prev => ({ ...prev, marketCategory: value }))}
                    required
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a market category" />
                    </SelectTrigger>
                    <SelectContent>
                      {marketCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sub-niche */}
                <div className="space-y-2">
                  <Label htmlFor="od-subNiche">
                    Sub-niche or Specific Focus <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="od-subNiche"
                    type="text"
                    placeholder="e.g., AI-powered CRM software for small businesses"
                    value={onDemandForm.subNiche}
                    onChange={(e) => setOnDemandForm(prev => ({ ...prev, subNiche: e.target.value }))}
                    required
                    className="h-11"
                  />
                </div>

                {/* Geography */}
                <div className="space-y-2">
                  <Label htmlFor="od-geography">
                    Geographic Focus <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="od-geography"
                    type="text"
                    placeholder="e.g., North America, United States, Global"
                    value={onDemandForm.geography}
                    onChange={(e) => setOnDemandForm(prev => ({ ...prev, geography: e.target.value }))}
                    required
                    className="h-11"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="od-email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="od-email"
                    type="email"
                    placeholder="e.g., john@example.com"
                    value={onDemandForm.email}
                    onChange={(e) => setOnDemandForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="h-11"
                  />
                  <p className="text-sm text-gray-500">
                    Report will be sent to this email address
                  </p>
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="od-notes">
                    Additional Notes <span className="text-gray-400">(Optional)</span>
                  </Label>
                  <Textarea
                    id="od-notes"
                    placeholder="Any specific requirements, questions to answer, or areas of focus..."
                    value={onDemandForm.notes}
                    onChange={(e) => setOnDemandForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      <span className="text-red-500">*</span> Required fields
                    </p>
                    <Button type="submit" size="lg" className="gap-2" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          Submit On-Demand Request
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Info Card for On-Demand */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>Your request is sent to n8n automation workflow immediately</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>AI analyzes market data and generates comprehensive report</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>Results appear in your Reports section (2-24 hours)</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span>Email notification sent to your address</span>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recurring Research Form */}
        <TabsContent value="recurring" className="space-y-6">
          <form onSubmit={handleRecurringSubmit}>
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-purple-50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <CardTitle>Recurring Research</CardTitle>
                </div>
                <CardDescription>
                  Automated research on a regular schedule for ongoing monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Market Category */}
                <div className="space-y-2">
                  <Label htmlFor="rec-marketCategory">
                    Market Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={recurringForm.marketCategory}
                    onValueChange={(value) => setRecurringForm(prev => ({ ...prev, marketCategory: value }))}
                    required
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a market category" />
                    </SelectTrigger>
                    <SelectContent>
                      {marketCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sub-niche */}
                <div className="space-y-2">
                  <Label htmlFor="rec-subNiche">
                    Sub-niche or Specific Focus <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="rec-subNiche"
                    type="text"
                    placeholder="e.g., AI-powered CRM software for small businesses"
                    value={recurringForm.subNiche}
                    onChange={(e) => setRecurringForm(prev => ({ ...prev, subNiche: e.target.value }))}
                    required
                    className="h-11"
                  />
                </div>

                {/* Geography */}
                <div className="space-y-2">
                  <Label htmlFor="rec-geography">
                    Geographic Focus <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="rec-geography"
                    type="text"
                    placeholder="e.g., North America, United States, Global"
                    value={recurringForm.geography}
                    onChange={(e) => setRecurringForm(prev => ({ ...prev, geography: e.target.value }))}
                    required
                    className="h-11"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="rec-email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="rec-email"
                    type="email"
                    placeholder="e.g., john@example.com"
                    value={recurringForm.email}
                    onChange={(e) => setRecurringForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="h-11"
                  />
                  <p className="text-sm text-gray-500">
                    Report will be sent to this email address
                  </p>
                </div>

                {/* Frequency */}
                <div className="space-y-2 bg-purple-100 p-4 rounded-lg border border-purple-300">
                  <Label htmlFor="rec-frequency">
                    Frequency <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={recurringForm.frequency}
                    onValueChange={(value) => setRecurringForm(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger className="h-11 bg-white">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-purple-700">
                    How often should this research be automatically updated?
                  </p>
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="rec-notes">
                    Additional Notes <span className="text-gray-400">(Optional)</span>
                  </Label>
                  <Textarea
                    id="rec-notes"
                    placeholder="Any specific requirements, questions to answer, or areas of focus..."
                    value={recurringForm.notes}
                    onChange={(e) => setRecurringForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      <span className="text-red-500">*</span> Required fields
                    </p>
                    <Button type="submit" size="lg" className="gap-2" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creating Schedule...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-5 h-5" />
                          Create Schedule
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Info Card for Recurring */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">How Recurring Research Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">1.</span>
                <span>Schedule is created and saved in your Schedules section</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">2.</span>
                <span>n8n checks for due schedules automatically (daily)</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">3.</span>
                <span>Reports are generated on your chosen frequency</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">4.</span>
                <span>Each report is emailed and logged in your Reports section</span>
              </p>
              <p className="flex items-start gap-2 mt-3 pt-3 border-t border-purple-200">
                <span className="text-purple-700 font-semibold">💡 Tip:</span>
                <span>You can pause or cancel schedules anytime from the Schedules page</span>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
