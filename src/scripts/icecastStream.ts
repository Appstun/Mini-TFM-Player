// @ts-ignore
import IcecastReadableStream from "./icecast-metadata-js/IcecastReadableStream.js";
type IcecastMetadata = {
  metadata: any;
  stats: {
    currentBytesRemaining: number;
    currentMetadataBytesRemaining: number;
    currentStreamBytesRemaining: number;
    metadataBytesRead: number;
    metadataLengthBytesRead: number;
    streamBytesRead: number;
    totalBytesRead: number;
  };
};

export namespace IcecastStream {
  let icecast: IcecastReadableStream | undefined = undefined;
  const listenerList = new Map<string, (data: IcecastMetadata) => void>();
  let lastStreamUrl: string | null = null;

  export async function resetReadableStream(streamUrl: string | null = null) {
    if (streamUrl == null && lastStreamUrl == null) throw new Error("No stream URL provided");
    if (streamUrl == null) streamUrl = lastStreamUrl;
    cancelReadableStream();

    const response = await fetch(streamUrl!, {
      method: "GET",
      headers: {
        "Icy-MetaData": "1",
      },
    });
    icecast = new IcecastReadableStream(response, {
      metadataTypes: ["icy"],
      onMetadata: (data: IcecastMetadata) => {
        for (const listener of listenerList.values()) listener(data);
      },
    });
    icecast.startReading();
  }
  export async function cancelReadableStream() {
    if (icecast) await icecast.cancel();
  }

  export function addListener(id: string, callback: (data: IcecastMetadata) => void) {
    listenerList.set(id, callback);
  }
  export function removeListener(id: string) {
    listenerList.delete(id);
  }
}
