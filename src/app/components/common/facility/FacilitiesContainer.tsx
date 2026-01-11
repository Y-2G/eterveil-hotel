"use client";

import { FacilityDetails } from "./FacilityDetails";
import { facilities } from "./facilities";

export function FacilitiesContainer() {
  return (
    <div>
      {facilities.map((facility) => (
        <div key={facility.id}>
          <FacilityDetails facility={facility} />
        </div>
      ))}
    </div>
  );
}
