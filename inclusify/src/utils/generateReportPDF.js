import jsPDF from "jspdf";

const formatCriteriaName = (key) => {
    const criteriaNames = {
        html: "HTML Validation",
        altText: "Alt Text Compliance",
        aria: "ARIA Compliance",
        fontSize: "Font Size",
        fontReadability: "Font Readability",
        contrast: "Color Contrast",
        tabNavigation: "Tab Navigation"
    };
    return criteriaNames[key] || key.charAt(0).toUpperCase() + key.slice(1);
};
const loadImageAsBase64 = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = reject;
    });
};

const generateReportPDF = async (index, title, reports) => {
    const report = reports[index];

    const pdf = new jsPDF("p", "mm", "a4");
    const margin = 10;
    const lineHeight = 8;
    let y = margin;

    const addLine = (text, isBold = false, fontSize = 12, textColor = [0, 0, 0]) => {
        if (y + lineHeight > 287) {
            pdf.addPage();
            y = margin;
        }
        pdf.setFontSize(fontSize);
        if (isBold) pdf.setFont(undefined, "bold");

        const pageWidth = pdf.internal.pageSize.width;

        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

        const textLines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        pdf.text(textLines, margin, y);
        pdf.setFont(undefined, "normal");
        y += textLines.length * lineHeight;
    };

    const logoData = await loadImageAsBase64("/inclusify-high-resolution-logo.png");
    pdf.addImage(logoData, "PNG", margin, y, 100, 20);
    y += 30;

    addLine(`Accessibility Report for: ${report.title}`, true, 14);
    addLine("");
    addLine("Overview of the Accessibility Report:", true, 12);
    addLine(`- Title: ${report.title}`, false, 12);
    addLine(`- URL: ${report.url}`, false, 12);
    addLine(`- Final Score: ${report.finalScore}`, false, 12);
    addLine(`- Grade: ${report.grade}`, false, 12);
    addLine("");

    Object.entries(report.criteriaScores).forEach(([key, value]) => {
        const name = formatCriteriaName(key);
        const issues = value.issues || {};

        addLine(`${name} (Score: ${value.score})`, true, 12);
        if (issues.message) addLine(`- ${issues.message}`, false, 12);

        if (issues.deprecatedTags) {
            addLine("- Deprecated Tags:", true, 12);
            issues.deprecatedTags.split(',').forEach((tag, idx) => {
                addLine(`  • ${tag.trim()}`, false, 12);
            });
        }

        if (issues.totalImages !== undefined) addLine(`- Total Images: ${issues.totalImages}`, false, 12);
        if (issues.badImages !== undefined) {
            addLine("- No Alt Text:", true, 12);
            issues.badImages.split(',').forEach((image, idx) => {
                addLine(`  • ${image.trim()}`, false, 12);
            });
        }
        if (issues.count !== undefined) addLine(`- Error Count: ${issues.count}`, false, 12);
        if (issues.penalty !== undefined) addLine(`- Penalty: ${issues.penalty} point(s)`, false, 12);
        if (issues.problematicFontSizes) addLine(`- Problematic Font Sizes: ${issues.problematicFontSizes}`, true, 12);
        if (issues.badFonts?.length) addLine(`- Problematic Fonts: ${issues.badFonts.join(", ")}`, true, 12);
        if (issues.detectedFonts) addLine(`- Total Font Types: ${issues.detectedFonts}`, false, 12);
        if (issues.lines) addLine(`- Line Numbers: ${issues.lines}`, false, 12);
        if (issues.totalBadSizes) addLine(`- Bad Font Sizes: ${issues.totalBadSizes}`, false, 12);
        if (issues.totalDetectedSizes) addLine(`- Detected Font Sizes: ${issues.totalDetectedSizes}`, false, 12);
        if (issues.percentage) addLine(`- Error Percentage: ${Number(issues.percentage).toFixed(2)}%`, false, 12);

        if (issues.flaggedUniquePairs?.length) {
            addLine("- Color Contrast Issues:", true, 12);
            issues.flaggedUniquePairs.forEach((pair, idx) => {
                addLine(`  • Pair ${idx + 1}:`, false, 12);
                addLine(`    - Color 1: ${pair.color1} (${pair.element1}, line ${pair.lineNumber1})`, false, 12);
                addLine(`    - Color 2: ${pair.color2} (${pair.element2}, line ${pair.lineNumber2})`, false, 12);
                addLine(`    - Reason: ${pair.reason}`, false, 12);
            });
        }

        addLine("");
    });

    pdf.save(`${title || "report"}_accessibility_report.pdf`);
};

export default generateReportPDF;
