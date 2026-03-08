import { FormState } from '../types';

/**
 * Serializes structured custom cake form fields into a single notes string
 * for storage in the backend (which only has a `notes` text column).
 */
export function serializeCustomCakeNotes(form: FormState): string {
  const parts: string[] = [];

  if (form.servings)    parts.push(`Servings: ${form.servings}`);
  if (form.flavor)      parts.push(`Flavor: ${form.flavor}`);
  if (form.cakeMessage) parts.push(`Message on Cake: ${form.cakeMessage}`);
  if (form.color)       parts.push(`Color: ${form.color}`);

  if (form.toppers.length) {
    parts.push(`Cake Toppers: ${form.toppers.join(', ')}`);
    if (form.toyTopperDetail)     parts.push(`Toy Topper Details: ${form.toyTopperDetail}`);
    if (form.fondantTopperDetail) parts.push(`Fondant Topper Details: ${form.fondantTopperDetail}`);
    if (form.toppersOther)        parts.push(`Custom Topper: ${form.toppersOther}`);
  }

  if (form.inspirationCake) {
    parts.push(`Inspired by: ${form.inspirationCake}`);
    if (form.inspirationElements) parts.push(`Design Elements Wanted: ${form.inspirationElements}`);
  }

  if (form.notes) parts.push(`Notes: ${form.notes}`);

  return parts.join('\n');
}
