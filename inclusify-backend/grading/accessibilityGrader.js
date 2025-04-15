
const {
    evaluateHTML,
    evaluateAltText,
    evaluateARIA,
    evaluateFontSize,
    evaluateFontReadability,
    evaluateContrast,
    evaluateTabNavigation
} = require('./gradingUtils');

async function calculateAccessibilityGrade(htmlContent, detectedFonts, fontSizes, extractedData, fontSizesWithLineNumbers,) {
    console.log("fontSizesWithLineNumbers being passed:", fontSizesWithLineNumbers);
    const criteriaResults = {
        html: evaluateHTML(htmlContent),
        altText: evaluateAltText(htmlContent),
        aria: evaluateARIA(htmlContent),
        fontSize: evaluateFontSize(htmlContent, fontSizes, fontSizesWithLineNumbers),
        fontReadability: evaluateFontReadability(htmlContent, detectedFonts),
        contrast: evaluateContrast(htmlContent, extractedData),
        tabNavigation: evaluateTabNavigation(htmlContent)
    }

    const weightedScores = {
        html: criteriaResults.html.score * 0.05,
        altText: criteriaResults.altText.score * 0.15,
        aria: criteriaResults.aria.score * 0.20,
        fontSize: criteriaResults.fontSize.score * 0.15,
        fontReadability: criteriaResults.fontReadability.score * 0.15,
        contrast: criteriaResults.contrast.score * 0.20,
        tabNavigation: criteriaResults.tabNavigation.score * 0.10
    }

    const finalScore = Object.values(weightedScores).reduce((sum, score) => sum + score, 0);

    let grade = "F";
    if (finalScore >= 90)
        grade = "A";
    else if (finalScore >= 80)
        grade = "B";
    else if (finalScore >= 70)
        grade = "C";
    else if (finalScore >= 60)
        grade = "D";


    return {
        finalScore: Math.round(finalScore),
        grade,
        details: {
            html: criteriaResults.html,
            altText: criteriaResults.altText,
            aria: criteriaResults.aria,
            fontSize: {
                score: criteriaResults.fontSize.score,
                detectedFontSizes: criteriaResults.fontSize.detectedFontSizes,
                issues: criteriaResults.fontSize.issues
            },
            fontReadability: criteriaResults.fontReadability,
            contrast: {
                score: criteriaResults.contrast.score,
                issues: {
                    message: criteriaResults.contrast.issues?.message || "No issues detected",
                    flaggedUniquePairs: [...(criteriaResults.contrast.issues?.flaggedUniquePairs || [])]
                }
            },
            tabNavigation: criteriaResults.tabNavigation
        }
    };
}

module.exports = {calculateAccessibilityGrade};