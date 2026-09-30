/**
 * Travel Affiliate Partner Deep Link Generator
 * Supports Travelpayouts unified marker tracking across Booking.com, Agoda, GetYourGuide, Viator, and Skyscanner.
 */

export interface AffiliateConfig {
  travelpayoutsMarker?: string;
  bookingAid?: string;
  agodaTag?: string;
  viatorPid?: string;
  getYourGuidePartnerId?: string;
  klookAffId?: string;
}

export const AFFILIATE_CONFIG: AffiliateConfig = {
  travelpayoutsMarker: process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER || '579629',
  bookingAid: process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID || '',
  agodaTag: process.env.NEXT_PUBLIC_AGODA_AFFILIATE_ID || '',
  viatorPid: process.env.NEXT_PUBLIC_VIATOR_AFFILIATE_ID || '',
  getYourGuidePartnerId: process.env.NEXT_PUBLIC_GETYOURGUIDE_PARTNER_ID || '',
  klookAffId: process.env.NEXT_PUBLIC_KLOOK_AFFILIATE_ID || '',
};

/**
 * Helper to wrap target URLs with Travelpayouts redirect tracking when a marker is configured
 */
function wrapWithTravelpayouts(targetUrl: string, campaignId: number): string {
  const marker = AFFILIATE_CONFIG.travelpayoutsMarker?.trim();
  if (!marker) return targetUrl;
  return `https://tp.media/r?marker=${encodeURIComponent(marker)}&p=${campaignId}&u=${encodeURIComponent(targetUrl)}`;
}

/**
 * Generate Booking.com Affiliate Search Link
 * (Travelpayouts Campaign ID: 4114)
 */
export function getBookingHotelLink(
  hotelName: string,
  destination: string,
  checkIn?: string,
  checkOut?: string,
): string {
  const query = `${hotelName} ${destination}`.trim();
  const params = new URLSearchParams({
    ss: query,
    lang: 'en-us',
  });
  if (AFFILIATE_CONFIG.bookingAid) {
    params.set('aid', AFFILIATE_CONFIG.bookingAid);
  }
  if (checkIn) params.set('checkin', checkIn);
  if (checkOut) params.set('checkout', checkOut);

  const directBookingUrl = `https://www.booking.com/searchresults.html?${params.toString()}`;
  return wrapWithTravelpayouts(directBookingUrl, 4114);
}

/**
 * Generate Agoda Affiliate Search Link
 * (Travelpayouts Campaign ID: 3968)
 */
export function getAgodaHotelLink(hotelName: string, destination: string): string {
  const query = `${hotelName} ${destination}`.trim();
  const params = new URLSearchParams({
    text: query,
  });
  if (AFFILIATE_CONFIG.agodaTag) {
    params.set('tag', AFFILIATE_CONFIG.agodaTag);
  }
  const directAgodaUrl = `https://www.agoda.com/search?${params.toString()}`;
  return wrapWithTravelpayouts(directAgodaUrl, 3968);
}

/**
 * Generate GetYourGuide Affiliate Tour Link
 * (Travelpayouts Campaign ID: 3966)
 */
export function getGetYourGuideLink(activityName: string, destination: string): string {
  const query = `${activityName} ${destination}`.trim();
  const params = new URLSearchParams({
    q: query,
  });
  if (AFFILIATE_CONFIG.getYourGuidePartnerId) {
    params.set('partner_id', AFFILIATE_CONFIG.getYourGuidePartnerId);
  }
  const directGygUrl = `https://www.getyourguide.com/s/?${params.toString()}`;
  return wrapWithTravelpayouts(directGygUrl, 3966);
}

/**
 * Generate Viator Affiliate Experience Link
 * (Travelpayouts Campaign ID: 3964)
 */
export function getViatorLink(activityName: string, destination: string): string {
  const cleanQuery = encodeURIComponent(`${activityName} ${destination}`.trim());
  const pidParam = AFFILIATE_CONFIG.viatorPid ? `&pid=${AFFILIATE_CONFIG.viatorPid}` : '';
  const directViatorUrl = `https://www.viator.com/search/${cleanQuery}?mcid=42383&medium=link${pidParam}`;
  return wrapWithTravelpayouts(directViatorUrl, 3964);
}

/**
 * Generate Klook Experience Link
 * (Travelpayouts Campaign ID: 4125)
 */
export function getKlookLink(activityName: string, destination: string): string {
  const query = `${activityName} ${destination}`.trim();
  const params = new URLSearchParams({
    query: query,
  });
  if (AFFILIATE_CONFIG.klookAffId) {
    params.set('aff_adid', AFFILIATE_CONFIG.klookAffId);
  }
  const directKlookUrl = `https://www.klook.com/search/?${params.toString()}`;
  return wrapWithTravelpayouts(directKlookUrl, 4125);
}

/**
 * Generate Skyscanner / Aviasales Flight Search Link
 * (Travelpayouts Campaign ID: 100)
 */
export function getSkyscannerLink(destination: string): string {
  const cleanDest = encodeURIComponent(destination);
  const directFlightUrl = `https://www.skyscanner.com/transport/flights/everywhere/${cleanDest}/`;
  return wrapWithTravelpayouts(directFlightUrl, 100);
}
