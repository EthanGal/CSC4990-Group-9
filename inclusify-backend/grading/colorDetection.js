// Problematic color pairs
const problematicColorPairs = [
    { colors: [[255,0,0], [0,128,0]], reason: "Red-Green (Deuteranopia & Protanopia)" },
    { colors: [[0,0,255], [255,255,0]], reason: "Blue-Yellow (Tritanopia)" },
    { colors: [[150,150,150], [200,200,200]], reason: "Gray-on-Gray (Low Contrast)" },
    { colors: [[255,255,0], [255,255,255]], reason: "Yellow on White (Brightness Issue)" }
];

//elements, colors, and line numbers come in together through extractedData, they must be separated while maintaining their associations here
const separateColorsAndElements = (extractedData) => {
    if (!Array.isArray(extractedData)) {
        console.error("Expected an array but received:", extractedData);
        return { colors: [], elements: [] };
    }

    let colors = [];
    let elements = [];
    let lineNumbers = [];

    extractedData.forEach(item => {
        if (item.color && item.element) {
            colors.push(item.color);
            elements.push(item.element);
            lineNumbers.push(item.lineNumber || "Unknown"); // Store line numbers if available
        } else {
            console.warn("Skipping invalid item:", item);
        }
    });

    return { colors, elements, lineNumbers};
};

//in order to better compare color pairs, strings with multiple rgb values must be broken apart here (while maintaining association with elements)
const splitColorStrings = (colors, elements, lineNumbers) => {
    if (!Array.isArray(colors) || !Array.isArray(elements) || colors.length !== elements.length) {
        console.error("Invalid input: Expected arrays of equal length but received:", colors, elements);
        return [];
    }

    const colorRegex = /rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*\d*\.?\d+)?\)/g;
    let cleanedColorData = [];

    colors.forEach((colorString, index) => {
        let matches = colorString.match(colorRegex);

        if (matches) {
            matches.forEach(match => {
                let cleanedColor = match.replace(/\s+/g, ''); // Remove spaces
                cleanedColorData.push({
                    color: cleanedColor,
                    element: elements[index],
                    lineNumber: lineNumbers[index] || "Unknown"
                });
            });
        }
    });

    return cleanedColorData;
};


//color comparing function (only analyzes R,G, and B)
const getRGBValues = (color) => {
    let rgbMatch = color.match(/\d+/g);
    if (!rgbMatch) return null;

    return rgbMatch.slice(0, 3).map(Number); // Only keep R, G, B (ignore alpha)
};

//calculated Euclidian distance between two RGB values. If small distance, colors are similar
const colorDistance = (rgb1, rgb2) => {
    return Math.sqrt(
        Math.pow(rgb1[0] - rgb2[0], 2) +
        Math.pow(rgb1[1] - rgb2[1], 2) +
        Math.pow(rgb1[2] - rgb2[2], 2)
    );
};

//function that simplifies element names to include tag, classes, id, and header (if available)
const simplifyElementName = (element) => {
    if (typeof element === "object" && element.tagName) {
        let tag = element.tagName.toLowerCase();
        let id = element.id ? `#${element.id}` : "";
        let classes = element.className ? `.${element.className.split(" ").join(".")}` : "";
        let header = element.getAttribute && element.getAttribute("aria-label") ?
            ` [${element.getAttribute("aria-label")}]` : "";

        return `${tag}${id}${classes}${header}`;
    }

    if (typeof element === "string") {
        // Extract tag, class, or ID from string if possible
        let tagMatch = element.match(/<(\w+)/);
        let idMatch = element.match(/id="([^"]+)"/);
        let classMatch = element.match(/class="([^"]+)"/);

        let tag = tagMatch ? tagMatch[1] : "";
        let id = idMatch ? `#${idMatch[1]}` : "";
        let classes = classMatch ? `.${classMatch[1].split(" ").join(".")}` : "";

        return `${tag}${id}${classes}`.trim() || "Unknown";
    }

    return "Unknown";
};

// Detect problematic color combinations
const detectProblematicCombinations = (colorData, threshold = 50) => {
    let flaggedPairs = [];

    for (let i = 0; i < colorData.length; i++) {
        for (let j = i + 1; j < colorData.length; j++) {
            let rgb1 = getRGBValues(colorData[i].color);
            let rgb2 = getRGBValues(colorData[j].color);

            if (!rgb1 || !rgb2) continue;

            let element1 = simplifyElementName(colorData[i].element || "Unknown");
            let element2 = simplifyElementName(colorData[j].element || "Unknown");

            let lineNumber1 = colorData[i].lineNumber || "Unknown";
            let lineNumber2 = colorData[j].lineNumber || "Unknown";

            let areClose =
                typeof element1 === "object" && typeof element2 === "object"
                    ? element1.parentElement === element2.parentElement
                    : true; // Assume they might be visually close if we lack parent info.

            if (!areClose) continue; // Skip unrelated elements

            // Skip identical colors
            if (JSON.stringify(rgb1) === JSON.stringify(rgb2)) continue;

            for (let { colors, reason } of problematicColorPairs) {
                let [colorA, colorB] = colors;

                if (
                    (colorDistance(rgb1, colorA) < threshold && colorDistance(rgb2, colorB) < threshold) ||
                    (colorDistance(rgb1, colorB) < threshold && colorDistance(rgb2, colorA) < threshold)
                ) {
                    flaggedPairs.push({
                        color1: colorData[i].color,
                        element1: typeof element1 === "object" ? element1.tagName : element1,
                        lineNumber1,
                        color2: colorData[j].color,
                        element2: typeof element2 === "object" ? element2.tagName : element2,
                        reason: reason,
                        lineNumber2
                    });
                }
            }
        }
    }

    return flaggedPairs;
};

//in case flagged pairs are duplicated, here they are compared and duplicates are removed
const removeDuplicateFlaggedPairs = (flaggedPairs) => {
    let seen = new Set();
    let uniquePairs = [];

    for (let pair of flaggedPairs) {
        // Normalize color+element ordering
        let pairKeyParts = [
            `${pair.color1}-${pair.element1}-${pair.lineNumber1}`,
            `${pair.color2}-${pair.element2}-${pair.lineNumber2}`
        ].sort(); // Ensures same pair regardless of order

        let key = pairKeyParts.join("|") + `|${pair.reason}`;

        if (!seen.has(key)) {
            seen.add(key);
            uniquePairs.push(pair);
        }
    }

    return uniquePairs;
};


//main controller for this file, calls the rest of the functions in this file
const evaluateColorAccessibility = (extractedData) => {
    console.log("Evaluating color accessibility...");
    const { colors, elements, lineNumbers } = separateColorsAndElements(extractedData);

    const cleanedColorData = splitColorStrings(colors, elements, lineNumbers);

    const flaggedCombinations = detectProblematicCombinations(cleanedColorData);
    console.log("Flagged Combinations", flaggedCombinations.length)
    const flaggedUniquePairs = removeDuplicateFlaggedPairs(flaggedCombinations);
    console.log("Flagged Unique Combinations", flaggedUniquePairs.length)


    let score = 100 - (flaggedUniquePairs.length * 10);
    score = Math.max(0, score);

    return {
        score,
        issues: flaggedUniquePairs.length > 0 ? {
            message: "Potential colorblind issues detected",
            flaggedUniquePairs
        } : {}
    };
};



module.exports = { evaluateColorAccessibility };
