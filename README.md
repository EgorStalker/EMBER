# EMBER — Wildfire Detection & Monitoring System

**EMBER** is a wildfire detection and monitoring platform designed to identify active fire locations, visualize satellite observations, and provide environmental context for analyzing wildfire activity.

The project aims to combine satellite data, vegetation information, and meteorological conditions to improve wildfire monitoring and support early situational awareness.

## Project Overview

Wildfires pose a significant threat to ecosystems, infrastructure, and human communities. Early identification and continuous monitoring of fire activity are essential for reducing their potential impact.

EMBER aims to provide a centralized platform for collecting, processing, and visualizing wildfire-related data.

The system is being developed with a focus on satellite-based fire detection and geospatial analysis.

## Planned Features

- **Satellite Fire Detection** — retrieve active fire observations from NASA FIRMS.
- **Interactive Map** — visualize detected fire locations and their geographic distribution.
- **Fire Information** — display detection time, coordinates, confidence level, and Fire Radiative Power (FRP), where available.
- **Vegetation Analysis** — use NDVI data to examine vegetation conditions around detected fire locations.
- **Weather Integration** — incorporate temperature, humidity, wind speed, and other meteorological parameters.
- **Historical Analysis** — examine changes in wildfire activity over time.
- **Risk Assessment** — explore how environmental conditions may contribute to wildfire risk.

## Data Sources

EMBER is designed to work with publicly available environmental and satellite datasets.

| Source | Purpose |
|---|---|
| [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/) | Satellite-based active fire detections |
| [NASA Earthdata](https://www.earthdata.nasa.gov/) | Earth observation datasets |
| [Open-Meteo](https://open-meteo.com/) | Weather information |
| [NASA Earth Observatory](https://earthobservatory.nasa.gov/) | Environmental and vegetation-related information |

## System Architecture

The planned processing workflow:

1. **Data Collection** — retrieve satellite fire observations and environmental datasets.
2. **Data Processing** — clean, normalize, and prepare incoming information.
3. **Geospatial Analysis** — associate fire observations with geographic locations.
4. **Environmental Analysis** — combine fire observations with vegetation and weather data.
5. **Visualization** — present the results through an interactive interface.

## Technology Stack

The technology stack will be finalized during development.

Potential technologies include:

- Python — data processing and backend logic.
- FastAPI — REST API.
- JavaScript — frontend functionality.
- Leaflet — interactive maps.
- Pandas / NumPy — data processing and analysis.
- Geospatial libraries — geographic data analysis.

## Development Roadmap

- [ ] Establish the initial project architecture.
- [ ] Integrate NASA FIRMS data.
- [ ] Implement fire detection data processing.
- [ ] Build an interactive map.
- [ ] Add fire information panels.
- [ ] Integrate weather datasets.
- [ ] Add NDVI and vegetation analysis.
- [ ] Implement historical fire activity analysis.
- [ ] Explore wildfire risk assessment methods.
- [ ] Evaluate the system using historical observations.

## Project Status

**EMBER is currently under development.**

The initial development stage focuses on establishing the data-processing pipeline and implementing the core wildfire visualization functionality.

Features listed in the roadmap are planned and should not be considered implemented until they are available in the project.

## Important Note

Satellite-based active fire detections are observations, not guaranteed confirmation of a ground fire. Detection confidence, observation time, spatial resolution, and environmental conditions must be considered when interpreting results.

EMBER is an experimental monitoring and research project. It is not a replacement for official emergency services or authoritative wildfire warning systems.

## Project Goals

The long-term goal of EMBER is to develop an accessible platform for wildfire monitoring and environmental analysis by combining satellite observations with geospatial and meteorological data.

---

**EMBER — Observe. Detect. Understand.**
