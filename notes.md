# RSC (React Server Components) Leverage Points

RSC can directly query Supabase with RLS - data is filtered by user role automatically.

## Routes Best Suited for RSC

| Route               | Tables to Query                             | Why RSC                          |
| ------------------- | ------------------------------------------- | -------------------------------- |
| `/admin`            | profiles, activity_log                      | User management, audit logs      |
| `/pm/projects`      | projects, project_equipment, venues         | List with filters, date ranges   |
| `/pm/projects/[id]` | projects, project_equipment, assets, models | Detail view with joins           |
| `/pm/venues`        | venues                                      | Read-heavy catalog               |
| `/pm/reports`       | projects, project_equipment                 | Generate PDF from server         |
| `/inv/assets`       | assets, models, categories, subcategories   | Heavy queries, filtering, search |
| `/inv/assets/[id]`  | assets, models, maintenance_logs            | Detail + history                 |
| `/inv/consumables`  | consumables, models                         | Stock levels, aggregations       |
| `/inv/locations`    | storage_locations, assets                   | Hierarchy + counts               |
| `/inv/catalog/*`    | categories, subcategories, models           | Read-heavy taxonomy              |
| `/tech/assignments` | projects, project_equipment, assets         | Pick-lists                       |
| `/tech/maintenance` | assets, maintenance_logs                    | Service queue                    |

## Client-Side Only (Forms & Interactivity)

- All `/create` routes (forms)
- All `/edit` routes (forms)
- `/tech/scan` (camera access, real-time)
- Profile editing

---

## App Routes

app/
├── page.tsx # Root
├── (auth)/login/page.tsx # Sign in
├── admin/
│ ├── page.tsx # Dashboard
│ └── users/page.tsx
├── pm/
│ ├── page.tsx # Dashboard
│ ├── projects/
│ │ ├── page.tsx
│ │ ├── add/page.tsx
│ │ └── [id]/
│ │ ├── page.tsx
│ │ └── edit/page.tsx
│ ├── venues/page.tsx
│ └── reports/page.tsx
├── inv/
│ ├── page.tsx # Dashboard
│ ├── assets/
│ │ ├── page.tsx
│ │ ├── add/page.tsx
│ │ └── [id]/page.tsx
│ ├── consumables/page.tsx
│ ├── locations/page.tsx
│ └── catalog/
│ ├── page.tsx
│ ├── categories/page.tsx
│ ├── subcategories/page.tsx
│ └── models/page.tsx
└── tech/
├── page.tsx # Dashboard
├── assignments/
│ ├── page.tsx
│ └── [id]/page.tsx
├── scan/page.tsx
└── maintenance/page.tsx

## Reusable Components for PROAMS:

Form Elements:

- Input - text, email, password fields ✅
- Button - primary, secondary, destructive variants ✅
- Select / Dropdown - for enums (status, role, condition) ✅
- Textarea - for descriptions, notes ✅
- Checkbox / Switch - boolean toggles ✅
- RadioGroup - single selection
- DatePicker - dates (start/end, purchase date) ✅
- Badge - status pills (AVAILABLE, RESERVED, etc.) ✅
- Card - container for content ✅
- Toast / Alert - success/error messages ✅
- LoadingSpinner - async states ✅
- Modal - confirmations, forms ✅
  Data:
- Pagination - table pagination ✅
- SearchInput - with debounce ✅
- FilterBar - multi-filter controls ✅
