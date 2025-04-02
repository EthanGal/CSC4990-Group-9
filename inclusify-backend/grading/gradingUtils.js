const {evaluateColorAccessibility} = require('./colorDetection');

function evaluateHTML(html) {
    // Ensure to match full deprecated tags only, not substrings
    const deprecatedTags = [...html.matchAll(/<(font|marquee|blink|center|big|small|u|s|strike|applet|frameset|frame|noframes|isindex|dir)\b[^>]*>/gi)];

    const errors = deprecatedTags.map(match => {
        const line = html.substring(0, match.index).split("\n").length;
        return {
            tag: match[1],
            line: line,
            message: `<${match[1]}> tag found on Line ${line}`
        };
    });

    // For debugging, log detected errors
    if (errors.length > 0) {
        console.log("Deprecated HTML tags detected:");
        errors.forEach(error => {
            console.log(error.message);
        });
        console.log("-------------------------------------------------");
    }

    // Calculate penalty based on the number and type of tags found
    const tagPenalties = {
        font: 1,
        marquee: 2,
        blink: 2,
        center: 1,
        big: 1,
        small: 1,
        u: 1,
        s: 1,
        strike: 1,
        applet: 3,
        frameset: 3,
        frame: 3,
        noframes: 3,
        isindex: 1,
        dir: 1
    };

    const totalPenalty = errors.reduce((sum, error) => sum + (tagPenalties[error.tag] || 0), 0);
    const maxPenalty = 20;  // Cap penalty at 20 points
    const finalPenalty = Math.min(totalPenalty, maxPenalty);

    // Calculate the final score
    const score = Math.max(0, 100 - finalPenalty);

    // Collect all the error messages into a single string
    const errorMessages = errors.map(error => error.message).join(", ");

    return {
        score: score,
        issues: errors.length > 0 ? {
            message: "Deprecated tags found",
            deprecatedTags: errorMessages,
            count: errors.length,
            penalty: finalPenalty
        } : {}
    };
}

function evaluateAltText(html) {
    const imgTags = [...html.matchAll(/<img\b[^>]*?>/gi)];
    let missingAltTextElements = [];

    imgTags.forEach(imgTag => {
        const imgHTML = imgTag[0];

        const hasAlt = /alt\s*=\s*"/i.test(imgHTML);
        const emptyAlt = /alt\s*=\s*""/i.test(imgHTML);

        const srcMatch = imgHTML.match(/src\s*=\s*"([^"]*)"/i);
        const src = srcMatch ? srcMatch[1] : "Unknown Source";

        // Check if it's a tracking pixel (1x1 transparent image)
        const isTrackingPixel = /width\s*=\s*["']?1["']?\s+height\s*=\s*["']?1["']?/i.test(imgHTML) ||
            /1x1|pixel|transparent/i.test(src);

        // Check if it's from an ad or tracking system
        const isAdBeacon = /(adsystem|doubleclick|googlesyndication|analytics|tracking|simpli\.fi|amazon-adsystem|facebook\.com\/tr|google-analytics|gstatic|cdn-cgi\/image)/i.test(src);

        const isServiceImage = /(translate|captcha|recaptcha|gstatic|gravatar)/i.test(src);

        // Ignore if it's a known tracking pixel, ad beacon, or service image
        if ((!hasAlt || emptyAlt) && !isTrackingPixel && !isAdBeacon && !isServiceImage) {
            const lineNumber = html.substring(0, imgTag.index).split("\n").length;
            missingAltTextElements.push({
                line: lineNumber,
                src: src
            });
        }
    });

    const totalImages = imgTags.length;
    const missingAltText = missingAltTextElements.length;
    const missingAltTextPercentage = totalImages > 0 ? (missingAltText / totalImages) * 100 : 0;
    const score = Math.round(100 - missingAltTextPercentage);

    const linesWithMissingAltText = missingAltTextElements
        .map(entry => `Line ${entry.line} - Image: ${entry.src}`)
        .join(", ");

    // Debugging output
    console.log("Total images detected:", totalImages);
    console.log("Missing alt text count:", missingAltText);
    console.log("Missing alt text percentage:", missingAltTextPercentage);
    console.log("Alt text score:", score);
    console.log("Line numbers with missing alt text:", linesWithMissingAltText);
    console.log("-------------------------------------------------------------");

    return {
        score: Math.max(0, score),
        issues: missingAltText > 0 ? {
            message: "Missing Alt Text",
            badImages: linesWithMissingAltText,
            totalImages: totalImages,
        } : {}
    };
}

//detects presence of aria labels. does not completely penalize for missing labels
function evaluateARIA(html) {
    const ariaRoles = [...html.matchAll(/role="/g)].map(match => match.index);
    return {
        score: ariaRoles.length > 0 ? 100 : 50,
        issues: ariaRoles.length === 0 ? {
            message: "No ARIA roles found"
        } : {}
    };
}

function evaluateFontSize(html, fontSizes = [], fontSizesWithLineNumbers = []) {
    // Use fontSizesWithLineNumbers if it's not empty
    if (fontSizesWithLineNumbers.length > 0) {
        console.log("Using font sizes with line numbers:", fontSizesWithLineNumbers);
    } else {
        console.log("No font sizes with line numbers provided. Falling back to plain font sizes.");

        const fontSizeMatches = [...html.matchAll(/font-size:\s*(\d+(\.\d+)?)px/g)];
        fontSizes = fontSizeMatches
            .map(match => match[0].split(':')[1].trim())
            .filter(size => parseFloat(size) !== 0);
    }

    // Remove duplicates from font sizes and line numbers
    const uniqueFontSizes = [...new Set(fontSizesWithLineNumbers.map(entry => entry.fontSize))];
    const uniqueLineNumbers = Array.from(
        new Set(fontSizesWithLineNumbers.map(entry => entry.lineNumber))
    );

    console.log("Unique Font Sizes:", uniqueFontSizes);
    console.log("Unique Line Numbers:", uniqueLineNumbers);

    // Identify problematic font sizes (e.g., < 12px)
    const badFontSizes = uniqueFontSizes.filter(fontSize => {
        return parseFloat(fontSize) < 12 && fontSize !== '0';  // Fonts smaller than 12px
    });

    // Calculate the number of bad font sizes (distinct font sizes only)
    const badFontCount = badFontSizes.length;

    // Recalculate the error percentage after removing duplicates
    const errorPercentage = uniqueFontSizes.length > 0
        ? (badFontCount / uniqueFontSizes.length) * 100
        : 0;

    // Score is based on the error percentage
    const score = Math.round(100 - errorPercentage);

    // Collect the line numbers of problematic fonts
    const badFontEntries = fontSizesWithLineNumbers.filter(entry => badFontSizes.includes(entry.fontSize));
    const lineNumbers = badFontEntries.map(entry => entry.lineNumber);

    console.log("Bad font sizes:", badFontSizes);
    console.log("Bad font count:", badFontCount);
    console.log("Error percentage:", errorPercentage);
    console.log("Font size score:", score);
    console.log("Line numbers with small fonts:", lineNumbers);
    console.log("---------------------------------------------------");

    const formattedLineNumbers = lineNumbers.join(", ");

    return {
        score: Math.max(0, score),
        issues: badFontSizes.length > 0 ? {
            message: "Small fonts detected",
            problematicFontSizes: badFontSizes.join(", "),    // Only problematic font sizes here
            lines: formattedLineNumbers,
            totalBadSizes: badFontCount,
            totalDetectedSizes: uniqueFontSizes.length,  // Total number of different font sizes
            percentage: errorPercentage,  // Show error percentage
        } : null,
    };
}



function evaluateFontReadability(html, detectedFonts) {
    if (detectedFonts.length === 0) {
        console.log("⚠️ No fonts detected! Ensure Puppeteer extracts font-family correctly.");
    }

    // Font Blacklist
    const blacklist = new Set([
        "Comic Sans MS", "Papyrus", "Brush Script MT", "Curlz MT", "Chiller",
        "Jokerman", "Impact", "Viner Hand", "Kristen ITC", "Vivaldi",
        "Lucida Handwriting", "Playbill", "Old English Text MT"
    ]);

    // Normalize detected font names: remove extra spaces & quotes, convert to lowercase
    const normalizedFonts = detectedFonts.map(font => font.replace(/['"]/g, "").trim());

    // Identify bad fonts used on the website
    const unreadableFonts = normalizedFonts.filter(font => blacklist.has(font));

    const unreadableFontPercentage = normalizedFonts.length > 0
        ? (unreadableFonts.length / normalizedFonts.length) * 100
        : 0;

    const score = Math.round(100 - unreadableFontPercentage);

    // Log for debugging
    console.log("Detected font families:", detectedFonts);
    console.log("Normalized font families:", normalizedFonts);
    console.log("Unreadable font entries:", unreadableFonts);
    console.log("Unreadable font percentage:", unreadableFontPercentage.toFixed(2) + "%");
    console.log("Font readability score:", score);
    console.log("-------------------------------------------------------------");

    return {
        score: Math.max(0, score),
        detectedFonts: normalizedFonts,
        issues: unreadableFonts.length > 0 ? {
            message: "Unreadable fonts detected",
            detectedFonts: normalizedFonts.length,
            badFonts: unreadableFonts,
            badFontCount: unreadableFonts.length,
            percentage: unreadableFontPercentage
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