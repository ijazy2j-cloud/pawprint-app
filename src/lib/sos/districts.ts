export const sriLankaDistricts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
] as const;

export type SriLankaDistrict = (typeof sriLankaDistricts)[number];

const districtCenters: Array<{ district: SriLankaDistrict; lat: number; lng: number }> = [
  { district: "Colombo", lat: 6.9271, lng: 79.8612 },
  { district: "Gampaha", lat: 7.0873, lng: 80.0144 },
  { district: "Kalutara", lat: 6.5854, lng: 79.9607 },
  { district: "Kandy", lat: 7.2906, lng: 80.6337 },
  { district: "Matale", lat: 7.4675, lng: 80.6234 },
  { district: "Nuwara Eliya", lat: 6.9497, lng: 80.7891 },
  { district: "Galle", lat: 6.0535, lng: 80.2210 },
  { district: "Matara", lat: 5.9549, lng: 80.5550 },
  { district: "Hambantota", lat: 6.1241, lng: 81.1185 },
  { district: "Jaffna", lat: 9.6615, lng: 80.0255 },
  { district: "Kilinochchi", lat: 9.3803, lng: 80.3770 },
  { district: "Mannar", lat: 8.9810, lng: 79.9044 },
  { district: "Mullaitivu", lat: 9.2671, lng: 80.8142 },
  { district: "Vavuniya", lat: 8.7514, lng: 80.4971 },
  { district: "Batticaloa", lat: 7.7102, lng: 81.6924 },
  { district: "Ampara", lat: 7.3018, lng: 81.6747 },
  { district: "Trincomalee", lat: 8.5874, lng: 81.2152 },
  { district: "Kurunegala", lat: 7.4863, lng: 80.3647 },
  { district: "Puttalam", lat: 8.0362, lng: 79.8283 },
  { district: "Anuradhapura", lat: 8.3114, lng: 80.4037 },
  { district: "Polonnaruwa", lat: 7.9403, lng: 81.0188 },
  { district: "Badulla", lat: 6.9934, lng: 81.0550 },
  { district: "Monaragala", lat: 6.8728, lng: 81.3507 },
  { district: "Ratnapura", lat: 6.7056, lng: 80.3847 },
  { district: "Kegalle", lat: 7.2513, lng: 80.3464 },
];

export function inferDistrictFromCoordinates(lat: number, lng: number): SriLankaDistrict {
  return districtCenters.reduce((closest, current) => {
    const closestDistance = Math.hypot(lat - closest.lat, lng - closest.lng);
    const currentDistance = Math.hypot(lat - current.lat, lng - current.lng);
    return currentDistance < closestDistance ? current : closest;
  }).district;
}
