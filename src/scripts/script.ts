// @ts-ignore
import { TruckersFmApi, BrowserData } from "./dataFunctions.js";
import { IcecastStream } from "./icecastStream.js";

let audioVolume = localStorage.getItem("player.control.volume") ? parseFloat(localStorage.getItem("player.control.volume")!) : 0.1;

const popupButtonElelment = document.getElementById("window.button.popup")!;
const playerSongTitleElement = document.getElementById("player.song.info.title")! as HTMLDivElement;
const playerSongArtistElement = document.getElementById("player.song.info.artist")! as HTMLDivElement;
const playerSongImageElement = document.getElementById("player.song.image")! as HTMLImageElement;
const playerSongLinkElement = document.getElementById("player.song.info.link")! as HTMLAnchorElement;
const presenterNameElement = document.getElementById("presenter.name")! as HTMLDivElement;
const presenterShowElement = document.getElementById("presenter.show")! as HTMLDivElement;
const presenterShowtimeElement = document.getElementById("presenter.showTime")! as HTMLDivElement;
const presenterImageElement = document.getElementById("presenter.image")! as HTMLImageElement;
const playerPlayButtonElement = document.getElementById("player.control.button.play")!;
const playerPauseButtonElement = document.getElementById("player.control.button.pause")!;
const playerResyncButtonElement = document.getElementById("player.control.button.resync")!;
const playerResyncButtonFrameElement = document.getElementById("player.control.button.resync.frame")! as HTMLDivElement;
const playerVolumeElement = document.getElementById("player.control.slider.volume")! as HTMLInputElement;
const playerFrameElement = document.getElementById("player.frame")! as HTMLDivElement;
const audioPlayer: HTMLAudioElement = new Audio("https://live.truckers.fm");

function mainInit() {
  audioPlayer.volume = audioVolume;
  playerVolumeElement.value = audioVolume.toString();

  if (BrowserData.checkIsMobile()) document.getElementById("window.banner.device.mobile")?.classList.remove("invisible");
  else document.getElementById("window.banner.device.mobile")?.remove();

  if (BrowserData.checkIsPopup()) {
    popupButtonElelment.classList.add("invisible");
    document.getElementById("site.info")?.remove();

    for (let i = 0; i < 4; i++) setTimeout(() => Window.resizeWindowToContent(400, 120), 50 * i);
    setTimeout(() => window.scrollTo(0, 0), 210);
  } else popupButtonElelment.classList.remove("invisible");

  if (BrowserData.isTabVisible()) IcecastStream.resetReadableStream(audioPlayer.src);
  else {
    Window.setCurrentSong()
    Window.setCurrentPresenter()
  }
}

namespace Player {
  let firstPlay = true;
  export async function playAudio() {
    if (firstPlay) {
      firstPlay = false;
      resyncAudio();
      return;
    }

    playerPlayButtonElement.classList.add("invisible");
    playerPauseButtonElement.classList.remove("invisible");
    await audioPlayer.play();
  }
  export function pauseAudio() {
    playerPlayButtonElement.classList.remove("invisible");
    playerPauseButtonElement.classList.add("invisible");
    audioPlayer.pause();
  }
  export async function resyncAudio() {
    playerResyncButtonFrameElement.classList.add("spinCC");
    playerResyncButtonElement.style.fill = "#f1c40f";
    try {
      audioPlayer.load();
    } catch (e) {
      console.error("Failed to resync audio");
      console.error(e);
    }
    await playAudio();
    playerResyncButtonFrameElement.classList.remove("spinCC");
    playerResyncButtonElement.style.fill = "";
  }
  export function adjustVolume(volume: number) {
    audioPlayer.volume = volume;
    localStorage.setItem("player.control.volume", volume.toString());
  }
}

namespace Window {
  export function createPopup() {
    const popup = window.open(".?popup", "popup", `width=40px,height=40px`)!;
    popup.focus();
  }
  export function resizeWindowToContent(overrideWidth: number | null = null, overrideHeight: number | null = null) {
    let contentWidth = overrideWidth != null ? overrideWidth : playerFrameElement.scrollWidth;
    let contentHeight = overrideHeight != null ? overrideHeight : playerFrameElement.scrollHeight;
    let browser = BrowserData.getBrowserAgent();

    if (browser == "Firefox") contentHeight -= 2;
    window.resizeTo(contentWidth + (window.outerWidth - window.innerWidth), contentHeight + (window.outerHeight - window.innerHeight));
  }

  export async function setCurrentSong() {
    const song = await TruckersFmApi.getTFMSong();
    if (!song) return;

    playerSongTitleElement.textContent = song.title;
    playerSongTitleElement.title = song.title;
    playerSongArtistElement.textContent = song.artist;
    playerSongArtistElement.title = song.artist;
    playerSongLinkElement.classList.remove("invisible");
    playerSongLinkElement.href = song.spotifyLink;
    playerSongImageElement.src = song.albumLink;
    imageloaderRemoval(playerSongImageElement);
  }
  export async function setCurrentPresenter() {
    const presenter = await TruckersFmApi.getTFMPresenter();
    if (!presenter) return;
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
  }

  export function imageloaderRemoval(element: HTMLImageElement) {
    const classes = ["imgSpin", "imgSpin2"];
    if (classes.some((c) => element.classList.contains(c))) {
      element.classList.remove(...classes);
      element.style.transitionDuration = "100ms";

      setTimeout(() => {
        element.style.borderRadius = "";
      }, 10);
    } else {
      element.style.transitionDuration = "100ms";
      setTimeout(() => (element.style.opacity = ""), 500);
    }
  }
}

mainInit();
playerPlayButtonElement.addEventListener("click", Player.playAudio);
playerPauseButtonElement.addEventListener("click", Player.pauseAudio);
playerResyncButtonElement.addEventListener("click", Player.resyncAudio);
playerVolumeElement.addEventListener("input", () => Player.adjustVolume(parseFloat(playerVolumeElement.value)));
popupButtonElelment.addEventListener("click", Window.createPopup);

let lastTitle = "";
let firstFetch = true;
IcecastStream.addListener("player.song.refresh", async (data) => {
  const title = data.metadata.StreamTitle as string;
  if (title.toLowerCase() == lastTitle.toLowerCase() || title.toLowerCase() == "live broadcast") return;
  lastTitle = title;
  // const lastLastTitle = lastTitle;
  // if (isLocalHost && lastLastTitle == "") return;

  if (firstFetch) {
    Window.setCurrentSong();
    Window.setCurrentPresenter();
    firstFetch = false;
  } else {
    let titleSplit = title.split(" - ");
    if (titleSplit.length >= 2) {
      playerSongTitleElement.textContent = titleSplit[1];
      playerSongTitleElement.title = titleSplit[1];
      playerSongArtistElement.textContent = titleSplit[0];
      playerSongArtistElement.title = titleSplit[0];

      playerSongImageElement.style.transitionDuration = "5s";
      setTimeout(() => (playerSongImageElement.style.opacity = "0.4"), 10);
    }

    await Window.setCurrentPresenter();
    setTimeout(() => Window.setCurrentSong(), 10000);
  }
});

let disableTimout: number | null = null;
document.addEventListener("visibilitychange", () => {
  if (disableTimout) clearInterval(disableTimout);
  if (!BrowserData.isTabVisible()) {
    // @ts-ignore
    disableTimout = setTimeout(async () => {
      await IcecastStream.cancelReadableStream();
      disableTimout = null;
    }, 30000);
  } else if (!disableTimout) {
    firstFetch = true;
    IcecastStream.resetReadableStream(audioPlayer.src);
  }

  if (BrowserData.isTabVisible()) disableTimout = null;
});
