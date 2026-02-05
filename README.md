# SignFlow - Training Evaluation Form

A React-based multi-page training evaluation form application with role-based privacy, signature capture, and PDF generation. Built to scale from 3 pages to 100-160 pages dynamically.

## Features

- **Multi-page Form**: Schema-driven form engine that supports dynamic pages
- **Role-based Privacy**: Student and Trainer roles with signature privacy (signatures hidden from opposite role)
- **Signature Capture**: Canvas-based signature capture using `react-signature-canvas`
- **PDF Generation**: Scalable PDF export using `@react-pdf/renderer` (supports 100+ pages)
- **State Management**: Zustand with localStorage persistence
- **Form Validation**: Zod + react-hook-form integration ready
- **Responsive UI**: Tailwind CSS styling matching professional form layouts

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Zustand** (state management)
- **@react-pdf/renderer** (PDF generation)
- **react-signature-canvas** (signature capture)
- **Tailwind CSS** (styling)
- **Zod** + **react-hook-form** (validation - ready for integration)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── form/              # Form UI components
│   │   ├── DetailsTable.tsx
│   │   ├── LikertMatrix.tsx
│   │   ├── TextareaSection.tsx
│   │   ├── CheckboxGroup.tsx
│   │   ├── SignatureBlock.tsx
│   │   └── FormSectionRenderer.tsx
│   └── pdf/               # PDF generation components
│       ├── PdfDetailsTable.tsx
│       ├── PdfLikertMatrix.tsx
│       ├── PdfTextarea.tsx
│       ├── PdfCheckboxGroup.tsx
│       ├── PdfSignatureBlock.tsx
│       ├── PdfSectionRenderer.tsx
│       └── PdfDocument.tsx
├── pages/
│   ├── FormView.tsx       # Main form view
│   └── FormPage.tsx       # Individual page component
├── store/
│   └── formStore.ts       # Zustand store
├── types/
│   ├── index.ts           # Core types
│   └── formDefinition.ts  # Form schema types
├── utils/
│   ├── roleUtils.ts       # Role-based visibility logic
│   └── pdfExport.ts       # PDF export utility
└── data/
    └── formDefinition.json # Form definition (schema)

```

## How It Works

### Form Definition Schema

The form is driven by a JSON schema (`src/data/formDefinition.json`) that defines:

- **Meta**: Organization info, title, version
- **Pages**: Array of pages, each containing sections
- **Sections**: Different section types (detailsTable, likertMatrix, textarea, checkboxGroup, signatureBlock)
- **Role Scope**: Each field/section has a `roleScope` that determines visibility:
  - `"student"`: Only visible to student and office
  - `"trainer"`: Only visible to trainer and office
  - `"both"`: Visible to all roles
  - `"office"`: Only visible to office role

### Role-based Privacy

- **Student Role**: Can see and edit student fields, cannot see trainer signature/date
- **Trainer Role**: Can see and edit trainer fields, cannot see student signature/date
- **Office Role**: Can view all fields but cannot edit (read-only mode)

Signatures are stored separately:
- `studentSignature`: { imageDataUrl, signedAtDate }
- `trainerSignature`: { imageDataUrl, signedAtDate }

### Adding New Pages/Questions

To add new pages or questions, simply edit `src/data/formDefinition.json`:

1. **Add a new page**:
```json
{
  "pageNumber": 4,
  "sections": [
    {
      "type": "likertMatrix",
      "title": "New Evaluation Section",
      "questions": [
        {
          "fieldId": "new.q1",
          "question": "Your question here",
          "roleScope": "student"
        }
      ],
      "scaleLabels": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
    }
  ]
}
```

2. **Add sections to existing page**: Add to the `sections` array of any page

3. **No code changes needed**: The form engine automatically renders new pages and sections

### PDF Generation

PDF generation uses `@react-pdf/renderer` which:

- Renders the same form structure as the UI
- Respects role-based privacy (hides signatures per role)
- Supports automatic pagination
- Scales efficiently to 100-160 pages (no screenshot conversion needed)

**Export Modes**:
- **Student mode**: Includes student signature only, hides trainer signature
- **Trainer mode**: Includes trainer signature only, hides student signature
- **Office mode**: Shows both signatures (if present) + all fields

### State Management

- **Zustand Store**: Manages form state, role, signatures, answers
- **localStorage Persistence**: Auto-saves drafts via Zustand persist middleware
- **Submit Locking**: Once submitted, role-specific fields are locked

## Usage

1. **Select Role**: Choose Student, Trainer, or Office from the dropdown
2. **Fill Form**: Complete the form fields relevant to your role
3. **Sign**: Use the signature canvas to capture your signature
4. **Save Draft**: Automatically saved to localStorage, or click "Save Draft"
5. **Submit**: Lock your section (prevents further edits)
6. **Export PDF**: Generate PDF based on current role view

## Scaling to 100-160 Pages

The architecture is designed to handle large forms:

1. **JSON-driven**: All form structure comes from JSON - no hardcoded components
2. **Component Reuse**: LikertMatrix, DetailsTable, etc. are reusable components
3. **Efficient PDF**: `@react-pdf/renderer` handles large documents efficiently
4. **Lazy Loading**: Can be extended with React.lazy for page-level code splitting
5. **Virtual Scrolling**: Can be added for UI if needed (PDF doesn't need it)

To scale:
- Add pages to `formDefinition.json`
- No code changes required
- PDF will automatically generate all pages
- UI will render all pages (consider pagination UI for 100+ pages)

## Future Enhancements

- [ ] Form validation with Zod schemas
- [ ] Server-side storage/API integration
- [ ] Multi-form support
- [ ] Advanced PDF customization (watermarks, headers/footers)
- [ ] Print preview mode
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Internationalization (i18n)

## License

MIT

