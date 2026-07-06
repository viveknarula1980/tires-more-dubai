import { defineMcp } from "@lovable.dev/mcp-js";
import searchTires from "./tools/search-tires";
import getTire from "./tools/get-tire";
import listBrands from "./tools/list-brands";
import lookupVehicleSize from "./tools/lookup-vehicle-size";

export default defineMcp({
  name: "tires-more-uae-mcp",
  title: "Tires & More UAE",
  version: "0.1.0",
  instructions:
    "Read-only tools for the Tires & More UAE catalog. Use `list_brands` to discover brand slugs, `search_tires` to filter tires by size/brand/season, `get_tire` for full details on a specific tire slug, and `lookup_vehicle_tire_size` to find the OEM size for a given make/model/year. Prices are in AED.",
  tools: [searchTires, getTire, listBrands, lookupVehicleSize],
});
