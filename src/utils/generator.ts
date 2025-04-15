import { CanvasDesigns, Section } from "../types";
import { cleanHTMLForExport } from "./editableContent";

export const generateHTML = (canvasDesigns: CanvasDesigns, activeSections: Section[]) => {
  // Generate HTML for each section and clean it individually
  const sectionsHTML = activeSections
    .map(section => {
      const design = canvasDesigns[section.name];
      if (!design) return '';

      const formattedName = section.name.toLowerCase().replace(/\s+/g, '-');
      // Clean each section's HTML separately
      const cleanedSectionHTML = cleanHTMLForExport(design.html);
      
      // Create a wrapper for each section
      return `
      <!-- ${section.name} Section -->
      <section class="section-${formattedName}" id="${formattedName}">
        ${cleanedSectionHTML}
      </section>
      `;
    })
    .filter(html => html !== '') // Remove empty sections
    .join('\n');

  // Create the full HTML document using the cleaned sections
  return `<!DOCTYPE html>
<html lang="en" class="antialiased scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Portfolio</title>
  <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
</head>
<body>
  ${sectionsHTML}
</body>
</html>`;
};