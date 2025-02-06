var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TruckersFmApi, BrowserData } from "./dataFunctions.js";
import { IcecastStream } from "./icecastStream.js";
let audioVolume = localStorage.getItem("player.control.volume") ? parseFloat(localStorage.getItem("player.control.volume")) : 0.1;
const popupButtonElelment = document.getElementById("window.button.popup");
const playerSongTitleElement = document.getElementById("player.song.info.title");
const playerSongArtistElement = document.getElementById("player.song.info.artist");
const playerSongImageElement = document.getElementById("player.song.image");
const playerSongLinkElement = document.getElementById("player.song.info.link");
const presenterNameElement = document.getElementById("presenter.name");
const presenterShowElement = document.getElementById("presenter.show");
const presenterShowtimeElement = document.getElementById("presenter.showTime");
const presenterImageElement = document.getElementById("presenter.image");
const playerPlayButtonElement = document.getElementById("player.control.button.play");
const playerPauseButtonElement = document.getElementById("player.control.button.pause");
const playerResyncButtonElement = document.getElementById("player.control.button.resync");
const playerResyncButtonFrameElement = document.getElementById("player.control.button.resync.frame");
const playerVolumeElement = document.getElementById("player.control.slider.volume");
const playerFrameElement = document.getElementById("player.frame");
const audioPlayer = new Audio("https://live.truckers.fm");
function mainInit() {
    var _a, _b, _c;
    audioPlayer.volume = audioVolume;
    playerVolumeElement.value = audioVolume.toString();
    if (BrowserData.checkIsMobile())
        (_a = document.getElementById("window.banner.device.mobile")) === null || _a === void 0 ? void 0 : _a.classList.remove("invisible");
    else
        (_b = document.getElementById("window.banner.device.mobile")) === null || _b === void 0 ? void 0 : _b.remove();
    if (BrowserData.checkIsPopup()) {
        popupButtonElelment.classList.add("invisible");
        (_c = document.getElementById("site.info")) === null || _c === void 0 ? void 0 : _c.remove();
        for (let i = 0; i < 4; i++)
            setTimeout(() => Window.resizeWindowToContent(400, 120), 50 * i);
        setTimeout(() => window.scrollTo(0, 0), 210);
    }
    else
        popupButtonElelment.classList.remove("invisible");
    if (BrowserData.isTabVisible())
        IcecastStream.resetReadableStream(audioPlayer.src);
    else {
        Window.setCurrentSong();
        Window.setCurrentPresenter();
    }
}
var Player;
(function (Player) {
    let firstPlay = true;
    function playAudio() {
        return __awaiter(this, void 0, void 0, function* () {
            if (firstPlay) {
                firstPlay = false;
                resyncAudio();
                return;
            }
            playerPlayButtonElement.classList.add("invisible");
            playerPauseButtonElement.classList.remove("invisible");
            yield audioPlayer.play();
        });
    }
    Player.playAudio = playAudio;
    function pauseAudio() {
        playerPlayButtonElement.classList.remove("invisible");
        playerPauseButtonElement.classList.add("invisible");
        audioPlayer.pause();
    }
    Player.pauseAudio = pauseAudio;
    function resyncAudio() {
        return __awaiter(this, void 0, void 0, function* () {
            playerResyncButtonFrameElement.classList.add("spinCC");
            playerResyncButtonElement.style.fill = "#f1c40f";
            try {
                audioPlayer.load();
            }
            catch (e) {
                console.error("Failed to resync audio");
                console.error(e);
            }
            yield playAudio();
            playerResyncButtonFrameElement.classList.remove("spinCC");
            playerResyncButtonElement.style.fill = "";
        });
    }
    Player.resyncAudio = resyncAudio;
    function adjustVolume(volume) {
        audioPlayer.volume = volume;
        localStorage.setItem("player.control.volume", volume.toString());
    }
    Player.adjustVolume = adjustVolume;
})(Player || (Player = {}));
var Window;
(function (Window) {
    function createPopup() {
        const popup = window.open(".?popup", "popup", `width=40px,height=40px`);
        popup.focus();
    }
    Window.createPopup = createPopup;
    function resizeWindowToContent(overrideWidth = null, overrideHeight = null) {
        let contentWidth = overrideWidth != null ? overrideWidth : playerFrameElement.scrollWidth;
        let contentHeight = overrideHeight != null ? overrideHeight : playerFrameElement.scrollHeight;
        let browser = BrowserData.getBrowserAgent();
        if (browser == "Firefox")
            contentHeight -= 2;
        window.resizeTo(contentWidth + (window.outerWidth - window.innerWidth), contentHeight + (window.outerHeight - window.innerHeight));
    }
    Window.resizeWindowToContent = resizeWindowToContent;
    function setCurrentSong() {
        return __awaiter(this, void 0, void 0, function* () {
            const song = yield TruckersFmApi.getTFMSong();
            if (!song)
                return;
            playerSongTitleElement.textContent = song.title;
            playerSongTitleElement.title = song.title;
            playerSongArtistElement.textContent = song.artist;
            playerSongArtistElement.title = song.artist;
            playerSongLinkElement.classList.remove("invisible");
            playerSongLinkElement.href = song.spotifyLink;
            playerSongImageElement.src = song.albumLink;
            imageloaderRemoval(playerSongImageElement);
        });
    }
    Window.setCurrentSong = setCurrentSong;
    function setCurrentPresenter() {
        return __awaiter(this, void 0, void 0, function* () {
            const presenter = yield TruckersFmApi.getTFMPresenter();
            if (!presenter)
                return;
            let time = "";
            if (presenter.show.end && presenter.show.end != "0")
                time = `until ${new Date(parseInt(presenter.show.end) * 1000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}`;
            presenterNameElement.textContent = presenter.presenter.name;
            presenterNameElement.title = presenter.presenter.name;
            presenterShowElement.textContent = presenter.show.name;
            presenterShowElement.title = presenter.show.name;
            presenterShowtimeElement.textContent = time;
            presenterShowtimeElement.title = time;
            presenterImageElement.src = presenter.presenter.image;
            imageloaderRemoval(presenterImageElement);
        });
    }
    Window.setCurrentPresenter = setCurrentPresenter;
    function imageloaderRemoval(element) {
        const classes = ["imgSpin", "imgSpin2"];
        if (classes.some((c) => element.classList.contains(c))) {
            element.classList.remove(...classes);
            element.style.transitionDuration = "100ms";
            setTimeout(() => {
                element.style.borderRadius = "";
            }, 10);
        }
        else {
            element.style.transitionDuration = "100ms";
            setTimeout(() => (element.style.opacity = ""), 500);
        }
    }
    Window.imageloaderRemoval = imageloaderRemoval;
})(Window || (Window = {}));
mainInit();
playerPlayButtonElement.addEventListener("click", Player.playAudio);
playerPauseButtonElement.addEventListener("click", Player.pauseAudio);
playerResyncButtonElement.addEventListener("click", Player.resyncAudio);
playerVolumeElement.addEventListener("input", () => Player.adjustVolume(parseFloat(playerVolumeElement.value)));
popupButtonElelment.addEventListener("click", Window.createPopup);
let lastTitle = "";
let firstFetch = true;
IcecastStream.addListener("player.song.refresh", (data) => __awaiter(void 0, void 0, void 0, function* () {
    const title = data.metadata.StreamTitle;
    if (title.toLowerCase() == lastTitle.toLowerCase() || title.toLowerCase() == "live broadcast")
        return;
    lastTitle = title;
    if (firstFetch) {
        Window.setCurrentSong();
        Window.setCurrentPresenter();
        firstFetch = false;
    }
    else {
        let titleSplit = title.split(" - ");
        if (titleSplit.length >= 2) {
            playerSongTitleElement.textContent = titleSplit[1];
            playerSongTitleElement.title = titleSplit[1];
            playerSongArtistElement.textContent = titleSplit[0];
            playerSongArtistElement.title = titleSplit[0];
            playerSongImageElement.style.transitionDuration = "5s";
            setTimeout(() => (playerSongImageElement.style.opacity = "0.4"), 10);
        }
        yield Window.setCurrentPresenter();
        setTimeout(() => Window.setCurrentSong(), 10000);
    }
}));
let disableTimout = null;
document.addEventListener("visibilitychange", () => {
    if (disableTimout)
        clearInterval(disableTimout);
    if (!BrowserData.isTabVisible()) {
        disableTimout = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            yield IcecastStream.cancelReadableStream();
            disableTimout = null;
        }), 30000);
    }
    else if (!disableTimout) {
        firstFetch = true;
        IcecastStream.resetReadableStream(audioPlayer.src);
    }
    if (BrowserData.isTabVisible())
        disableTimout = null;
});
