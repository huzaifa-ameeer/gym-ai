import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "gymai-plan"
  );
}

export async function downloadPlanPdf(element: HTMLElement, title: string) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: getComputedStyle(element).backgroundColor,
  });

  const pdf = new jsPDF({
    unit: "pt",
    format: "a4",
    orientation: "portrait",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 28;
  const imageWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;
  const pixelsPerPage = Math.floor((canvas.width * usableHeight) / imageWidth);

  let offset = 0;
  let page = 0;

  while (offset < canvas.height) {
    const sliceHeight = Math.min(pixelsPerPage, canvas.height - offset);
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sliceHeight;

    const context = slice.getContext("2d");
    if (!context) {
      throw new Error("Could not prepare the PDF canvas.");
    }

    context.drawImage(
      canvas,
      0,
      offset,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    );

    if (page > 0) pdf.addPage();
    pdf.addImage(
      slice.toDataURL("image/jpeg", 0.92),
      "JPEG",
      margin,
      margin,
      imageWidth,
      (sliceHeight * imageWidth) / canvas.width,
    );

    offset += sliceHeight;
    page += 1;
  }

  pdf.save(`${slugify(title)}.pdf`);
}
