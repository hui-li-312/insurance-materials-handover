import assert from 'node:assert/strict';
import {validatePdfWordingReview} from '../public/pdf-wording-review.mjs';
// Reverse only the exact approved additive layer; never erase arbitrary fields.
export function withoutPdfReviews(rows){
 const out=structuredClone(rows);for(const row of out)for(const [i,m]of row.materials.entries())if(m.pdfWordingReview){const r=validatePdfWordingReview(m);assert.equal(r.binding.sourceObservationId,row.sourceId);assert.equal(r.binding.runtimeObservationId,row.id);assert.equal(r.binding.sourceMaterialIndex,i);delete m.pdfWordingReview;}return out;
}
