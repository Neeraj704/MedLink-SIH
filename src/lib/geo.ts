export interface Coordinates {
  lat: number;
  lng: number;
}

// Centroid defaults for prototype demo: Jaipur, Rajasthan
export const DEFAULT_COORDINATES: Coordinates = {
  lat: 26.9124,
  lng: 75.7873,
};

export async function getUserLocation(): Promise<Coordinates> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_COORDINATES);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        resolve(DEFAULT_COORDINATES);
      },
      { timeout: 5000 }
    );
  });
}
