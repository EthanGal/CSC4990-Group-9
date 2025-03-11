
function evaluateHTML(html){
    const errors = [...html.matchAll(/<font>|<marquee</g)].map(match => match.index);
    return {
        score: errors.length > 0 ? 50 : 100,
        issues: errors.length > 0 ? {message: "Deprecated tags found", lines: errors} : {}
    };
}

function evaluateAltText(html, altTextElements = []) {
    if (altTextElements.length === 0) {
        const altTextMatches = [...html.matchAll(/<img[^>]*?alt="([^"]*)".*?src="([^"]*)"/g)];

        altTextElements = altTextMatches
            .filter(match => !match[1].trim())
            .map(match => ({
                line: match.index + 1,
                src: match[2]
            }));
    }

    // Log for debugging
    console.log("Detected images with missing alt text (src and line numbers):", altTextElements);

    const missingAltText = altTextElements.length;

    // Calculate the percentage of images with missing alt text
    const missingAltTextPercentage = altTextElements.length > 0 ? (missingAltText / altTextElements.length) * 100 : 0;

    const score = Math.round(100 - missingAltTextPercentage);

    // Extract image sources and line numbers of missing alt text
    const linesWithMissingAltText = altTextElements
        .map(entry => `Line ${entry.line} - Image: ${entry.src}`)
        .join(", ");

    // Log for debugging
    console.log("Missing alt text count:", missingAltText);
    console.log("Missing alt text percentage:", missingAltTextPercentage);
    console.log("Alt text score:", score);
    console.log("Line numbers with missing alt text:", linesWithMissingAltText);

    return {
        score: Math.max(0, score),  // Ensure score is not negative
        issues: missingAltText > 0 ? {
            message: "Missing Alt Text",
            lines: linesWithMissingAltText
        } : {},
        detectedAltTextElements: altTextElements  // Pass the alt text elements for further inspection if needed
    };
}


function evaluateARIA(html){
    const ariaRoles = [...html.matchAll(/role="/g)].map(match => match.index);
    return {
        score : ariaRoles.length > 0 ? 100 : 50,
        issues: ariaRoles.length === 0 ? {message: "No ARIA roles found", lines: []} : {}
    };
}


function evaluateFontSize(html, fontSizes = []) {
    if (fontSizes.length === 0) {
        const fontSizeMatches = [...html.matchAll(/font-size:\s*(\d+(\.\d+)?)px/g)];

        fontSizes = fontSizeMatches
            .map(match => match[0].split(':')[1].trim())
            .filter(size => parseFloat(size) !== 0);
    }

    // Log for debugging
    console.log("Detected font sizes (filtered):", fontSizes);

    const badFontEntries = fontSizes.filter(size => {
        const numericSize = parseFloat(size);
        return numericSize < 12 && numericSize !== 0;
    });

    const badFontCount = badFontEntries.length;

    const badFontPercentage = fontSizes.length > 0 ? (badFontCount / fontSizes.length) * 100 : 0;

    const score = Math.round(100 - badFontPercentage);

    const lineNumbers = fontSizes
        .map((size, index) => {
            const numericSize = parseFloat(size);
            return numericSize < 12 && numericSize !== 0 ? index : -1;
        })
        .filter(index => index !== -1);

    // Log for debugging
    console.log("Bad font entries:", badFontEntries);
    console.log("Bad font count:", badFontCount);
    console.log("Bad font percentage:", badFontPercentage);
    console.log("Font size score:", score);
    console.log("Line numbers with small fonts:", lineNumbers);

    const formattedLineNumbers = lineNumbers.map(line => `Line ${line}`).join(", ");

    return {
        score: Math.max(0, score),
        issues: badFontEntries.length > 0 ? {
            message: "Small fonts detected",
            lines: formattedLineNumbers
        } : {},
        detectedFontSizes: [...new Set(fontSizes)]
    };
}

function evaluateFontReadability(html){
    const badFonts = [...html.matchAll(/font-family:\s*(Comic Sans|Papyrus|Cursive)/gi)].map (match => match.index);
    return {
        score: badFonts.length > 0 ? 50 : 100,
        issues: badFonts.length > 0 ? {message: "Unreadable fonts detected", lines: badFonts} : {}
    };
}
function evaluateContrast(html){
    //todo find out how to grade contrast
    return 100; //placeholder score
}

function evaluateTabNavigation(html) {
    const tabIndexMatches = [...html.matchAll(/tabindex\s*=\s*["']?[-0-9]+["']?/g)].map(match => match.index);
    return {
        score: tabIndexMatches.length > 0 ? 100 : 50,
        issues: tabIndexMatches.length === 0 ? { message: "Tab navigation missing", lines: [] } : {}
    };
}

module.exports = {
    evaluateHTML,
    evaluateAltText,
    evaluateARIA,
    evaluateFontSize,
    evaluateFontReadability,
    evaluateContrast,
    evaluateTabNavigation
};