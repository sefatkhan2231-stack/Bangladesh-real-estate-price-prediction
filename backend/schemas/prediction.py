from math import log1p

from pydantic import BaseModel, Field, model_validator


class PropertyPredictionRequest(BaseModel):

    area: float = Field(gt=0)
    building_type: str
    building_nature: str

    num_bath_rooms: float = Field(ge=0)
    num_bed_rooms: float = Field(ge=0)
    bedroom_not_applicable: int = 0

    city: str
    locality: str
    zone: str
    division: str

    relaxation_amenity_count: int = Field(ge=0)
    security_amenity_count: int = Field(ge=0)
    maintenance_or_cleaning_amenity_count: int = Field(ge=0)
    social_amenity_count: int = Field(ge=0)
    expendable_amenity_count: int = Field(ge=0)
    service_staff_amenity_count: int = Field(ge=0)
    unclassify_amenity_count: int = Field(ge=0)

    log_area: float = 0.0
    total_rooms: float = 0.0
    area_per_bedroom: float = 0.0
    bath_bed_ratio: float = 0.0
    total_amenities: int = 0

    @model_validator(mode="after")
    def compute_derived_fields(self):
        self.log_area = log1p(self.area)
        self.total_rooms = self.num_bath_rooms + self.num_bed_rooms
        self.area_per_bedroom = (
            self.area / self.num_bed_rooms if self.num_bed_rooms > 0 else 0.0
        )
        self.bath_bed_ratio = (
            self.num_bath_rooms / self.num_bed_rooms if self.num_bed_rooms > 0 else 0.0
        )
        self.total_amenities = (
            self.relaxation_amenity_count
            + self.security_amenity_count
            + self.maintenance_or_cleaning_amenity_count
            + self.social_amenity_count
            + self.expendable_amenity_count
            + self.service_staff_amenity_count
            + self.unclassify_amenity_count
        )

        land_commercial_types = ['Shop', 'Office', 'Commercial Plot', 'Others', 'Residential Plot']

        self.bedroom_not_applicable = int(self.building_type in land_commercial_types)
        return self


class PropertyPredictionResponse(BaseModel):

    predicted_price: float
    currency: str = "BDT"