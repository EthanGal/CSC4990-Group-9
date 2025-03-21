const {evaluateColorAccessibility} = require('./colorDetection');

function evaluateHTML(html) {
    const deprecatedTags = [...html.matchAll(/<(font|marquee)/g)];

    const errors = deprecatedTags.map(match => ({
        tag: match[1],
        line: html.substring(0, match.index).split("\n").length // Estimate line number
    }));

    if (errors.length > 0) {
        console.log("Deprecated HTML tags detected:");
        errors.forEach(error => {
            console.log(`- <${error.tag}> tag found on Line ${error.line}`);
        });
        console.log("-------------------------------------------------");
    }

    return {
        score: errors.length > 0 ? 50 : 100,
        issues: errors.length > 0 ? {message: "Deprecated tags found", lines: errors} : {}
    };
}

function evaluateAltText(html, altTextElements = []) {
    if (altTextElements.length === 0) {
        const altTextMatches = [...html.matchAll(/<img[^>]*?alt="([^"]*)".*?src="([^"]*)"/g)];

        altTextElements = altTextMatches
            .filter(match => {
                const altText = match[1].trim();
                const src = match[2];

                const isTrackingPixel = /1x1|pixel|beacon|transparent/i.test(src);

                const isAdBeacon = /(adsystem|doubleclick|googlesyndication|analytics|tracking|simpli\.fi|amazon-adsystem)/i.test(src);

                const isServiceImage = /(translate|captcha|recaptcha|gstatic)/i.test(src);

                return !altText && !isTrackingPixel && !isAdBeacon && !isServiceImage;
            })
            .map(match => ({
                line: html.substring(0, match.index).split("\n").length, // Estimate line number
                src: match[2]
            }));
    }

    const totalImages = [...html.matchAll(/<img /g)].length;

    // Debug logs
    console.log("Filtered detected images with missing alt text:", altTextElements);
    console.log("Total images detected:", totalImages);

    const missingAltText = altTextElements.length;
    const missingAltTextPercentage = totalImages > 0 ? (missingAltText / totalImages) * 100 : 0;
    const score = Math.round(100 - missingAltTextPercentage);

    const linesWithMissingAltText = altTextElements
        .map(entry => `Line ${entry.line} - Image: ${entry.src}`)
        .join(", ");

    //specific debug logs before report is finalized
    console.log("Missing alt text count (excluding beacons, ads, auto-generated images):", missingAltText);
    console.log("Missing alt text percentage:", missingAltTextPercentage);
    console.log("Alt text score:", score);
    console.log("Line numbers with missing alt text:", linesWithMissingAltText);
    console.log("-------------------------------------------------------------");

    return {
        score: Math.max(0, score),
        issues: missingAltText > 0 ? {
            message: "Missing Alt Text",
            lines: linesWithMissingAltText
        } : {},
        detectedAltTextElements: altTextElements
    };
}

//detects presence of aria labels. does not completely penalize for missing labels
function evaluateARIA(html) {
    const ariaRoles = [...html.matchAll(/role="/g)].map(match => match.index);
    return {
        score: ariaRoles.length > 0 ? 100 : 50,
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

    // Log for debugging before final breakdown
    console.log("Bad font entries:", badFontEntries);
    console.log("Bad font count:", badFontCount);
    console.log("Bad font percentage:", badFontPercentage);
    console.log("Font size score:", score);
    console.log("Line numbers with small fonts:", lineNumbers);
    console.log("---------------------------------------------------");

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

function evaluateFontReadability(html, detectedFonts = []) {
    if (detectedFonts.length === 0) {
        const fontMatches = [...html.matchAll(/font-family:\s*([^;"]+)/g)];

        // Extract font names
        detectedFonts = [...new Set(fontMatches.map(match => match[1].trim()))];

    }

    // Font BlackList
    const badFonts = new Set([
        "Comic Sans MS", "Papyrus", "Brush Script MT", "Curlz MT", "Chiller",
        "Jokerman", "Impact", "Viner Hand", "Kristen ITC", "Vivaldi",
        "Lucida Handwriting", "Playbill", "Old English Text MT"
    ]);

    // Identify bad fonts used on the website
    const unreadableFonts = detectedFonts.filter(font => badFonts.has(font));
    const unreadableFontPercentage = detectedFonts.length > 0
        ? (unreadableFonts.length / detectedFonts.length) * 100
        : 0;

    const score = Math.round(100 - unreadableFontPercentage);

    // Log for debugging
    console.log("Detected font families:", detectedFonts);
    console.log("Unreadable font entries:", unreadableFonts);
    console.log("Unreadable font percentage:", unreadableFontPercentage.toFixed(2) + "%");
    console.log("Font readability score:", score);
    console.log("-------------------------------------------------------------");

    return {
        score: Math.max(0, score),
        detectedFonts,
        issues: unreadableFonts.length > 0 ? {
            message: "Unreadable fonts detected",
            fonts: unreadableFonts
        } : {}
    };
}

const evaluateContrast = (html, extractedData) => {
    const result = evaluateColorAccessibility(extractedData);
    console.log("ColorBlind Evaluation Result:", JSON.stringify(result, null, 2));
    return result;
};

function evaluateTabNavigation(html) {
    const tabIndexMatches = [...html.matchAll(/tabindex\s*=\s*["']?[-0-9]+["']?/g)].map(match => match.index);
    return {
        score: tabIndexMatches.length > 0 ? 100 : 50,
        issues: tabIndexMatches.length === 0 ? {message: "Tab navigation missing", lines: []} : {}
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