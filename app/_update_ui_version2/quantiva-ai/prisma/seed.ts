import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seed...")

  // Create industries
  const industries = await Promise.all([
    prisma.industry.upsert({
      where: { slug: "technology" },
      update: {},
      create: {
        slug: "technology",
        name: "Technology",
        description: "Software, hardware, and tech services",
        icon: "💻",
        color: "#4F46E5",
        sortOrder: 1,
      },
    }),
    prisma.industry.upsert({
      where: { slug: "healthcare" },
      update: {},
      create: {
        slug: "healthcare",
        name: "Healthcare",
        description: "Medical and health services",
        icon: "🏥",
        color: "#10B981",
        sortOrder: 2,
      },
    }),
    prisma.industry.upsert({
      where: { slug: "finance" },
      update: {},
      create: {
        slug: "finance",
        name: "Finance & Banking",
        description: "Financial services and banking",
        icon: "🏦",
        color: "#F59E0B",
        sortOrder: 3,
      },
    }),
    prisma.industry.upsert({
      where: { slug: "retail" },
      update: {},
      create: {
        slug: "retail",
        name: "Retail & E-commerce",
        description: "Retail and online commerce",
        icon: "🛍️",
        color: "#EC4899",
        sortOrder: 4,
      },
    }),
  ])

  console.log(`Created ${industries.length} industries`)

  // Create subindustries
  const subindustries = await Promise.all([
    prisma.subindustry.upsert({
      where: { industryId_slug: { industryId: industries[0].id, slug: "saas" } },
      update: {},
      create: {
        industryId: industries[0].id,
        slug: "saas",
        name: "SaaS",
        description: "Software as a Service",
        sortOrder: 1,
      },
    }),
    prisma.subindustry.upsert({
      where: { industryId_slug: { industryId: industries[0].id, slug: "fintech" } },
      update: {},
      create: {
        industryId: industries[0].id,
        slug: "fintech",
        name: "Fintech",
        description: "Financial Technology",
        sortOrder: 2,
      },
    }),
  ])

  console.log(`Created ${subindustries.length} subindustries`)

  // Create jurisdictions
  const jurisdictions = await Promise.all([
    prisma.jurisdiction.upsert({
      where: { code: "UK" },
      update: {},
      create: {
        code: "UK",
        name: "United Kingdom",
        countryCode: "GB",
        region: "Europe",
        description: "United Kingdom regulations",
        regulatoryBodies: ["ICO", "FCA", "CMA"],
      },
    }),
    prisma.jurisdiction.upsert({
      where: { code: "US" },
      update: {},
      create: {
        code: "US",
        name: "United States",
        countryCode: "US",
        region: "North America",
        description: "United States federal and state regulations",
        regulatoryBodies: ["SEC", "FTC", "FDA"],
      },
    }),
    prisma.jurisdiction.upsert({
      where: { code: "EU" },
      update: {},
      create: {
        code: "EU",
        name: "European Union",
        countryCode: "EU",
        region: "Europe",
        description: "European Union regulations",
        regulatoryBodies: ["EC", "EDPB", "ESMA"],
      },
    }),
  ])

  console.log(`Created ${jurisdictions.length} jurisdictions`)

  // Create subscription plans
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { slug: "starter" },
      update: {},
      create: {
        slug: "starter",
        name: "Starter",
        description: "Perfect for individuals and small projects",
        priceMonthly: 0,
        priceAnnual: 0,
        currency: "GBP",
        features: {
          description: "Free forever",
          features: [
            "5 AI generations/month",
            "10 downloads/month",
            "Access to free templates",
            "Basic search",
            "Email support",
          ],
        },
        downloadsPerMonth: 10,
        aiGenerationsPerMonth: 5,
        documentsAccessLevel: "free",
        storageLimitMb: 100,
        isActive: true,
        isPublic: true,
        sortOrder: 1,
      },
    }),
    prisma.plan.upsert({
      where: { slug: "professional" },
      update: {},
      create: {
        slug: "professional",
        name: "Professional",
        description: "For growing businesses and teams",
        priceMonthly: 49,
        priceAnnual: 39,
        currency: "GBP",
        features: {
          description: "Everything in Starter, plus",
          features: [
            "50 AI generations/month",
            "100 downloads/month",
            "All Pro templates",
            "Advanced search & filters",
            "Priority support",
            "API access",
            "Team collaboration",
          ],
          highlighted: true,
        },
        downloadsPerMonth: 100,
        aiGenerationsPerMonth: 50,
        documentsAccessLevel: "pro",
        storageLimitMb: 1000,
        isActive: true,
        isPublic: true,
        sortOrder: 2,
      },
    }),
    prisma.plan.upsert({
      where: { slug: "business" },
      update: {},
      create: {
        slug: "business",
        name: "Business",
        description: "For organizations with advanced needs",
        priceMonthly: 149,
        priceAnnual: 119,
        currency: "GBP",
        features: {
          description: "Everything in Professional, plus",
          features: [
            "Unlimited AI generations",
            "Unlimited downloads",
            "All Business templates",
            "Custom document requests",
            "Dedicated account manager",
            "SSO & advanced security",
            "Custom integrations",
          ],
        },
        downloadsPerMonth: null,
        aiGenerationsPerMonth: null,
        documentsAccessLevel: "business",
        storageLimitMb: 10000,
        isActive: true,
        isPublic: true,
        sortOrder: 3,
      },
    }),
  ])

  console.log(`Created ${plans.length} subscription plans`)

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: "gdpr" },
      update: {},
      create: {
        slug: "gdpr",
        name: "GDPR",
        description: "General Data Protection Regulation",
        category: "regulation",
        color: "#4F46E5",
      },
    }),
    prisma.tag.upsert({
      where: { slug: "privacy" },
      update: {},
      create: {
        slug: "privacy",
        name: "Privacy",
        description: "Privacy-related documents",
        category: "topic",
        color: "#10B981",
      },
    }),
    prisma.tag.upsert({
      where: { slug: "contracts" },
      update: {},
      create: {
        slug: "contracts",
        name: "Contracts",
        description: "Contract templates",
        category: "topic",
        color: "#F59E0B",
      },
    }),
  ])

  console.log(`Created ${tags.length} tags`)

  // Create sample documents
  const documents = await Promise.all([
    prisma.document.upsert({
      where: { slug: "gdpr-privacy-policy-template" },
      update: {},
      create: {
        slug: "gdpr-privacy-policy-template",
        title: "GDPR Privacy Policy Template",
        description: "Comprehensive privacy policy compliant with GDPR regulations",
        shortDescription: "GDPR-compliant privacy policy for your website or app",
        documentType: "privacy_policy",
        category: "privacy",
        accessLevel: "free",
        isPublished: true,
        publishedAt: new Date(),
        version: 1,
        wordCount: 2500,
        estimatedReadTime: 10,
        complexityLevel: "moderate",
        viewCount: 15000,
        downloadCount: 12500,
        generationCount: 8500,
        favoriteCount: 2300,
        reviewStatus: "approved",
        content: "This is a sample GDPR privacy policy template...",
      },
    }),
    prisma.document.upsert({
      where: { slug: "terms-of-service-saas" },
      update: {},
      create: {
        slug: "terms-of-service-saas",
        title: "Terms of Service - SaaS",
        description: "Terms of service specifically designed for SaaS businesses",
        shortDescription: "SaaS terms and conditions template",
        documentType: "terms_of_service",
        category: "legal",
        accessLevel: "pro",
        isPublished: true,
        publishedAt: new Date(),
        version: 1,
        wordCount: 4500,
        estimatedReadTime: 18,
        complexityLevel: "complex",
        viewCount: 12000,
        downloadCount: 8900,
        generationCount: 5600,
        favoriteCount: 1800,
        reviewStatus: "approved",
        content: "This is a sample SaaS terms of service template...",
      },
    }),
    prisma.document.upsert({
      where: { slug: "employment-contract-template" },
      update: {},
      create: {
        slug: "employment-contract-template",
        title: "Employment Contract Template",
        description: "Standard employment contract with customizable clauses",
        shortDescription: "Employment agreement template",
        documentType: "contract",
        category: "hr",
        accessLevel: "pro",
        isPublished: true,
        publishedAt: new Date(),
        version: 1,
        wordCount: 3200,
        estimatedReadTime: 13,
        complexityLevel: "moderate",
        viewCount: 9800,
        downloadCount: 7200,
        generationCount: 4300,
        favoriteCount: 1500,
        reviewStatus: "approved",
        content: "This is a sample employment contract template...",
      },
    }),
  ])

  console.log(`Created ${documents.length} documents`)

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@quantiva.world" },
    update: {},
    create: {
      email: "admin@quantiva.world",
      emailVerified: true,
      passwordHash: adminPassword,
      authProvider: "email",
      role: "super_admin",
      status: "active",
      onboardingCompleted: true,
      profile: {
        create: {
          firstName: "Admin",
          lastName: "User",
          displayName: "Admin",
          timezone: "UTC",
          language: "en",
        },
      },
    },
  })

  console.log("Created admin user: admin@quantiva.world / admin123")

  console.log("Database seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
