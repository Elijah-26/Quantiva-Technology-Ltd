# Quantiva AI - Regulatory Document Intelligence Platform

A comprehensive SaaS platform for AI-powered regulatory document generation, management, and compliance intelligence.

## Features

### Core Features
- **AI Document Generation** - Generate customized regulatory documents using advanced AI
- **Document Library** - Browse 10,000+ document templates across 50+ jurisdictions
- **Multi-Jurisdiction Support** - Compliance templates for UK, US, EU, and more
- **Industry Classification** - 20+ industries with 100+ subcategories
- **Research Module** - Academic research templates for dissertations and theses
- **Browser Extension** - Chrome extension for capturing and generating documents on the go

### User Features
- **Authentication** - Email, Google, and Microsoft OAuth
- **Onboarding Flow** - 4-step personalized onboarding
- **Dashboard** - Comprehensive analytics and document management
- **Workspace** - Organize documents into folders with favorites
- **Billing** - Subscription management with Stripe integration
- **Settings** - Profile, company, notifications, and security settings

### Admin Features
- **User Management** - View, manage, and moderate user accounts
- **Document Management** - Review, approve, and publish documents
- **Analytics Dashboard** - Platform-wide statistics and insights
- **Content Moderation** - Review queue for user-generated content

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom Components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **AI**: OpenAI/Anthropic API
- **Animation**: Framer Motion

## Project Structure

```
quantiva-ai/
├── app/                      # Next.js App Router
│   ├── (marketing)/          # Landing page
│   ├── (auth)/               # Authentication pages
│   │   ├── signin/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── onboarding/
│   ├── (dashboard)/          # Main dashboard
│   │   ├── documents/
│   │   ├── generate/
│   │   ├── workspace/
│   │   ├── billing/
│   │   └── settings/
│   ├── admin/                # Admin panel
│   └── api/                  # API routes
├── components/               # React components
│   ├── ui/                   # UI components
│   ├── layout/               # Layout components
│   ├── marketing/            # Marketing components
│   ├── dashboard/            # Dashboard components
│   └── auth/                 # Auth components
├── lib/                      # Utility functions
├── types/                    # TypeScript types
├── prisma/                   # Database schema
│   └── schema.prisma
├── docs/                     # Documentation
│   ├── PRODUCT_SPECIFICATION.md
│   ├── DATABASE_SCHEMA.md
│   └── API_DESIGN.md
└── public/                   # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account (for payments)
- OpenAI API key (for AI generation)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/quantiva/quantiva-ai.git
cd quantiva-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/quantiva_ai"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
OPENAI_API_KEY="your-openai-api-key"
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Admin Credentials
- Email: `admin@quantiva.world`
- Password: `admin123`

## Database Schema

The platform includes 30+ database tables covering:
- Users & Authentication
- Industry Classification (Categories → Subcategories → Niches)
- Document System with versioning
- AI Generation Jobs
- User Workspace with folders
- Subscription & Billing
- Research Module
- Extension System
- Admin Actions & System Settings

See `prisma/schema.prisma` for the complete schema.

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get session

### Documents
- `GET /api/documents` - List documents
- `GET /api/documents/:id` - Get document
- `POST /api/documents` - Create document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### AI Generation
- `POST /api/generate` - Generate document
- `GET /api/generate/status/:id` - Check generation status

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/workspace` - Get workspace

### Billing
- `GET /api/billing/subscription` - Get subscription
- `POST /api/billing/subscribe` - Create subscription
- `POST /api/billing/cancel` - Cancel subscription

## Subscription Plans

| Plan | Price | AI Generations | Downloads | Features |
|------|-------|----------------|-----------|----------|
| Starter | £0/mo | 5/month | 10/month | Free templates, basic search |
| Professional | £49/mo | 50/month | 100/month | All Pro templates, API access |
| Business | £149/mo | Unlimited | Unlimited | Custom requests, SSO |
| Enterprise | Custom | Unlimited | Unlimited | Custom training, SLA |

## Browser Extension

The Chrome extension allows users to:
- Capture web content for document generation
- Get AI-powered document suggestions
- Generate documents without leaving the browser
- Sync with the main platform

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Support

For support, email info@quantiva.world or visit our help center.

---

Built with ❤️ by the Quantiva Team
