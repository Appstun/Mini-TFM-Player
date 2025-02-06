var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import IcecastReadableStream from "./icecast-metadata-js/IcecastReadableStream.js";
export var IcecastStream;
(function (IcecastStream) {
    let icecast = undefined;
    const listenerList = new Map();
    let lastStreamUrl = null;
    function resetReadableStream() {
        return __awaiter(this, arguments, void 0, function* (streamUrl = null) {
            if (streamUrl == null && lastStreamUrl == null)
                throw new Error("No stream URL provided");
            if (streamUrl == null)
                streamUrl = lastStreamUrl;
            cancelReadableStream();
            const response = yield fetch(streamUrl, {
                method: "GET",
                headers: {
                    "Icy-MetaData": "1",
                },
            });
            icecast = new IcecastReadableStream(response, {
                metadataTypes: ["icy"],
                onMetadata: (data) => {
                    for (const listener of listenerList.values())
                        listener(data);
                },
            });
            icecast.startReading();
        });
    }
    IcecastStream.resetReadableStream = resetReadableStream;
    function cancelReadableStream() {
        return __awaiter(this, void 0, void 0, function* () {
            if (icecast)
                yield icecast.cancel();
        });
    }
    IcecastStream.cancelReadableStream = cancelReadableStream;
    function addListener(id, callback) {
        listenerList.set(id, callback);
    }
    IcecastStream.addListener = addListener;
    function removeListener(id) {
        listenerList.delete(id);
    }
    IcecastStream.removeListener = removeListener;
})(IcecastStream || (IcecastStream = {}));
