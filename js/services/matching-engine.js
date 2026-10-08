/**
 * Smart Lost & Found Matching Engine for SAVIOUR
 * Compares Item Name, Category, Description, Location, Color, Identifying Marks, and Date.
 * Calculates weighted similarity score and evaluates against admin-configured threshold (default 60%).
 */

import { db } from '../db/storage-engine.js';
import { DB_STORES, REPORT_TYPES, REPORT_STATUS } from '../db/schema.js';

class MatchingEngine {
  // Tokenize string, normalize plurals, and remove common stop words
  tokenize(text) {
    if (!text) return [];
    const stopWords = new Set(['a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'with', 'by', 'is', 'it', 'for', 'to', 'from', 'of']);
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 1 && !stopWords.has(token))
      .map(token => (token.endsWith('s') && token.length > 3) ? token.slice(0, -1) : token);
  }

  // Calculate Jaccard similarity between two token sets
  tokenSimilarity(textA, textB) {
    const tokensA = new Set(this.tokenize(textA));
    const tokensB = new Set(this.tokenize(textB));
    
    if (tokensA.size === 0 && tokensB.size === 0) return 0;
    if (tokensA.size === 0 || tokensB.size === 0) return 0;

    let matchCount = 0;
    const arrayB = Array.from(tokensB);

    tokensA.forEach(token => {
      if (tokensB.has(token)) {
        matchCount += 1;
      } else {
        const partialMatch = arrayB.some(tB => 
          (token.length >= 3 && tB.length >= 3) && (token.includes(tB) || tB.includes(token))
        );
        if (partialMatch) matchCount += 0.8;
      }
    });

    const unionCount = Math.max(tokensA.size, tokensB.size);
    return Math.min(1, matchCount / unionCount);
  }

  // Calculate Date proximity factor (decay within 14 days)
  dateProximity(dateA, dateB) {
    if (!dateA || !dateB) return 0.5;
    try {
      const msA = new Date(dateA).getTime();
      const msB = new Date(dateB).getTime();
      const diffDays = Math.abs(msA - msB) / (1000 * 60 * 60 * 24);
      if (diffDays <= 1) return 1.0;
      if (diffDays <= 3) return 0.9;
      if (diffDays <= 7) return 0.75;
      if (diffDays <= 14) return 0.5;
      return Math.max(0.1, 1 - (diffDays / 30));
    } catch {
      return 0.5;
    }
  }

  // Compute multi-factor similarity score between 0 and 100%
  calculateSimilarity(reportA, reportB) {
    // 1. Item Name / Keywords (Weight: 30%)
    const nameScore = this.tokenSimilarity(reportA.itemName, reportB.itemName);

    // 2. Category Exact / Partial Match (Weight: 20%)
    const catScore = (reportA.category && reportB.category && 
      reportA.category.toLowerCase() === reportB.category.toLowerCase()) ? 1.0 : 0.0;

    // 3. Color & Identifying Characteristics (Weight: 20%)
    const colorScore = this.tokenSimilarity(reportA.color, reportB.color);
    const marksScore = this.tokenSimilarity(reportA.identifyingCharacteristics, reportB.identifyingCharacteristics);
    const visualScore = (colorScore * 0.5) + (marksScore * 0.5);

    // 4. Description Content (Weight: 10%)
    const descScore = this.tokenSimilarity(reportA.description, reportB.description);

    // 5. Location Proximity (Weight: 10%)
    const locScore = this.tokenSimilarity(reportA.location, reportB.location);

    // 6. Date Proximity (Weight: 10%)
    const dateScore = this.dateProximity(reportA.date, reportB.date);

    // Weighted Formula
    const totalWeighted = 
      (nameScore * 0.30) +
      (catScore * 0.20) +
      (visualScore * 0.20) +
      (descScore * 0.10) +
      (locScore * 0.10) +
      (dateScore * 0.10);

    return Math.round(totalWeighted * 100);
  }

  // Analyze new report against existing opposite-type reports
  async processReport(newReport) {
    const settings = await db.getSettings();
    const threshold = settings.matchingThreshold || 60;

    const allReports = await db.getAll(DB_STORES.REPORTS);
    // Compare against opposite type (LOST vs FOUND)
    const oppositeType = newReport.type === REPORT_TYPES.LOST ? REPORT_TYPES.FOUND : REPORT_TYPES.LOST;
    
    const candidates = allReports.filter(r => 
      r.id !== newReport.id && 
      r.type === oppositeType && 
      r.currentStatus !== REPORT_STATUS.RECOVERED && 
      r.currentStatus !== REPORT_STATUS.RESOLVED
    );

    let highestScore = 0;
    let bestMatch = null;

    for (const candidate of candidates) {
      const score = this.calculateSimilarity(newReport, candidate);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = candidate;
      }
    }

    if (highestScore >= threshold && bestMatch) {
      // Determine lost and found IDs
      const lostId = newReport.type === REPORT_TYPES.LOST ? newReport.id : bestMatch.id;
      const foundId = newReport.type === REPORT_TYPES.FOUND ? newReport.id : bestMatch.id;

      // Update report status
      await db.update(DB_STORES.REPORTS, newReport.id, {
        currentStatus: REPORT_STATUS.POTENTIAL_MATCH,
        matchScore: highestScore
      });

      if (bestMatch.currentStatus === REPORT_STATUS.SEARCHING || bestMatch.currentStatus === REPORT_STATUS.UNDER_REVIEW) {
        await db.update(DB_STORES.REPORTS, bestMatch.id, {
          currentStatus: REPORT_STATUS.POTENTIAL_MATCH,
          matchScore: highestScore
        });
      }

      // Create or update match record
      const matchRecord = await db.create(DB_STORES.MATCHES, {
        lostReportId: lostId,
        foundReportId: foundId,
        similarityScore: highestScore,
        status: 'PENDING_REVIEW'
      });

      // Dispatch in-app notification to the report creator
      await db.create(DB_STORES.NOTIFICATIONS, {
        userId: newReport.userId,
        title: `Potential Match Found! (${highestScore}%)`,
        message: `A potential match was detected for "${newReport.itemName}". Admin review is pending.`,
        type: 'MATCH',
        read: false,
        relatedReportId: newReport.id
      });

      return {
        matched: true,
        score: highestScore,
        matchedReport: bestMatch,
        matchRecord
      };
    }

    return {
      matched: false,
      score: highestScore
    };
  }
}

export const matchingEngine = new MatchingEngine();
