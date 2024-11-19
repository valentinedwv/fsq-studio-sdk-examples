import { FC, useEffect, useMemo, useRef, useState } from "react";
import {
  createMap,
  Dataset,
  DatasetWithData,
  MapApi,
} from "@foursquare/map-sdk";
import { SampleDataItem, fetchSampleData } from "./sample-data";

const getFirstDataset = (map: MapApi): Dataset => {
  const dataset = map.getDatasets()[0];
  if (!dataset) {
    throw new Error("No dataset.");
  } else {
    return dataset;
  }
};

export const App: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapApi | null>(null);
  const [displayedDataset, setDisplayedDataset] =
    useState<DatasetWithData | null>(null);
  const [sampleData, setSampleData] = useState<
    [SampleDataItem, SampleDataItem] | null
  >(null);
  const [healthLabel, setHealthLabel] = useState<string>("Show Health Index");
  const [observationsLabel, setObservationsLabel] = useState<string>("Show Observations Group");
  const [odorLabel, setOdorLabel] = useState<string>("Show Odor Complaints");
  useEffect(() => {
    const loadData = async () => {
      setSampleData(await fetchSampleData());
    };

    const initMap = async () => {
      const map = await createMap({
        // This is an API Key that only works for these examples.
        // Provide your own Map SDK API Key instead.
        // For more details, see: https://docs.foursquare.com/developer/docs/studio-map-sdk-authentication
        apiKey: "fsq37od31T2Rd77qwUtKrgYY5k8yuFed5HKZ4oH4HWpiFrY=",
        container: containerRef.current!,
        initialState: {publishedMapId: '6a22eaf3-e964-4e17-b4cf-d88d75635d0a'}
      });

      setMap(map);
    };

    initMap();
    loadData();
  }, []);
  useEffect(() => {
    if (map ) {
      // map.addDataset(sampleData[0], { autoCreateLayers: false });
      // map.addLayer({
      //   type: "grid",
      //   dataId: "earthquakes",
      //   fields: {
      //     lat: "Latitude",
      //     lng: "Longitude",
      //   },
      //   config: {
      //     visConfig: {
      //       worldUnitSize: 26,
      //       elevationScale: 90,
      //       enable3d: true,
      //     },
      //   },
      // });
      console.log(map.getLayers());
      console.log(map.getLayerGroups());
      map.setTheme({
        preset: "light",
        // options: {
        //   backgroundColor: "lightseagreen",
        // },
      });
      map.setMapConfig({
        version: "v1",
        config: {
          mapState: {
            pitch: 50,
            bearing: 24,
            mapViewMode: "MODE_3D",
          },
          "mapStyle": {
            "styleType": "light"  // Sets the basemap to 'light'
          },
          'uiState':{
            sidePanel: 'hidden'
          }
        },
      });
      map.setView({
        latitude: 32.7045671093519,
        longitude: -117.47582941779496,
        zoom: 10.0,
      });
    }
  }, [map]);

  const handlers = useMemo(() => {
    if (!sampleData) {
      console.log("Data not yet loaded.");
      return null;
    }

    if (!map) {
      console.log("Map not yet initialized.");
      return null;
    }

    return {
      flipHealthLayer: () => {
        const groups = map.getLayerGroups();
        const health = groups.find((g) => g.id=='8owf0vr')
        if (health.isVisible) {
            setHealthLabel("Show Health Index");
          health.isVisible = false;
        } else {
          setHealthLabel("Hide Health Index");
          health.isVisible = true;
        }
        map.updateLayerGroup(health.id,health)

      },
      flipObsLayer: () => {
        const groups = map.getLayerGroups();
        const health = groups.find((g) => g.id=='jpqdowy')
        if (health.isVisible) {
          setHealthLabel("Show Observations");
          health.isVisible = false;
        } else {
          setHealthLabel("Hide Observations");
          health.isVisible = true;
        }
        map.updateLayerGroup(health.id,health)

      },
      flipOdorLayer: () => {
        const groups = map.getLayerGroups();
        const health = groups.find((g) => g.id=='1bqkm36')
        if (health.isVisible) {
          setOdorLabel("Show Odor Complaints");
          health.isVisible = false;
        } else {
          setOdorLabel("Hide Odor Complaints");
          health.isVisible = true;
        }
        map.updateLayerGroup(health.id,health)

      },
      addDataset: () => {
        if (map.getDatasets().length > 0) {
          console.log(
            "Dataset already added to the map. (Example is limited to one dataset)."
          );
          return;
        }

        map.addDataset(sampleData[0]);
      },
      updateDataset: () => {
        const dataset = getFirstDataset(map);
        const updatedLabel = "Updated Dataset";
        const updatedColor = [
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
        ] as [number, number, number];

        map.updateDataset(dataset.id, {
          label: updatedLabel,
          color: updatedColor,
        });
      },
      replaceDataset: () => {
        map.replaceDataset(sampleData[0].id, {
          id: sampleData[1].id,
          label: sampleData[1].label,
          data: sampleData[1].data,
        });

        // round robin swap
        setSampleData([sampleData[1], sampleData[0]]);
      },
      displayDataset: () => {
        const dataset = getFirstDataset(map);
        const datasetData = map.getDatasetWithData(dataset.id);
        setDisplayedDataset(datasetData);
      },
      removeDataset: () => {
        const dataset = getFirstDataset(map);
        map.removeDataset(dataset.id);
      },
    };
  }, [map, sampleData]);

  return (
    <>
      <div id="map-container" ref={containerRef}></div>
      {!!handlers && (
        <div className="controls">
          {/* Buttons for various dataset operations */}
          <button id="odorbtn" onClick={handlers.flipOdorLayer}>{odorLabel}</button>
          <button id="obshbtn" onClick={handlers.flipObsLayer}>{observationsLabel}</button>
          <button id="healthbtn" onClick={handlers.flipHealthLayer}>{healthLabel}</button>
          <button onClick={handlers.displayDataset}>Play Animation</button>

        </div>
      )}

      {/* JSON popup */}
      {!!displayedDataset && (
        <div className="json-popup">
          <div className="json-popup-content">
            <button onClick={() => setDisplayedDataset(null)}>Close</button>
            <pre>{JSON.stringify(displayedDataset, null, 2)}</pre>
          </div>
        </div>
      )}
    </>
  );
};
